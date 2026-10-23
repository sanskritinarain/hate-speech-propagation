import os
import re
from datetime import datetime, timezone
from typing import Optional, List
import httpx

from app.adapters.base import BaseSourceAdapter, SourceRetrievalResult, ObservedComment
from app.core.config import settings

class YouTubeAdapter(BaseSourceAdapter):
    platform_name = "youtube"
    platform_label = "YouTube"

    VIDEO_ID_PATTERNS = [
        re.compile(r"(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/|youtube\.com/shorts/)([a-zA-Z0-9_-]{11})", re.IGNORECASE),
        re.compile(r"youtube\.com/.*[?&]v=([a-zA-Z0-9_-]{11})", re.IGNORECASE)
    ]

    def can_handle(self, url: str) -> bool:
        return any(p.search(url) for p in self.VIDEO_ID_PATTERNS)

    def extract_post_id(self, url: str) -> Optional[str]:
        for p in self.VIDEO_ID_PATTERNS:
            match = p.search(url)
            if match:
                return match.group(1)
        return None

    def fetch_source(self, url: str) -> SourceRetrievalResult:
        post_id = self.extract_post_id(url)
        now = datetime.now(timezone.utc)
        if not post_id:
            return SourceRetrievalResult(
                status="UNSUPPORTED_PLATFORM",
                platform=self.platform_name,
                platform_label=self.platform_label,
                canonical_url=url,
                retrieval_timestamp=now,
                provenance="URL Validator",
                error_message="Could not extract a valid 11-character YouTube video ID from URL."
            )

        canonical_url = f"https://www.youtube.com/watch?v={post_id}"
        api_key = os.getenv("YOUTUBE_API_KEY")

        # 1. If API Key is available, use official YouTube Data API v3
        if api_key:
            try:
                with httpx.Client(timeout=10.0) as client:
                    # Video Details
                    v_res = client.get(
                        "https://www.googleapis.com/youtube/v3/videos",
                        params={"part": "snippet,statistics", "id": post_id, "key": api_key}
                    )
                    if v_res.status_code == 404:
                        return SourceRetrievalResult(
                            status="POST_NOT_FOUND",
                            platform=self.platform_name,
                            platform_label=self.platform_label,
                            post_id=post_id,
                            canonical_url=canonical_url,
                            retrieval_timestamp=now,
                            provenance="YouTube Data API v3",
                            error_message="Video was not found or has been deleted."
                        )
                    if v_res.status_code == 403:
                        # Rate limit or invalid key
                        return self._fallback_oembed(
                            post_id, canonical_url, now,
                            error_notice="YouTube API key quota exceeded or invalid key. Reverted to public oEmbed."
                        )

                    v_data = v_res.json()
                    items = v_data.get("items", [])
                    if not items:
                        return SourceRetrievalResult(
                            status="POST_NOT_FOUND",
                            platform=self.platform_name,
                            platform_label=self.platform_label,
                            post_id=post_id,
                            canonical_url=canonical_url,
                            retrieval_timestamp=now,
                            provenance="YouTube Data API v3",
                            error_message="Video does not exist or is marked private."
                        )

                    item = items[0]
                    snippet = item.get("snippet", {})
                    stats = item.get("statistics", {})

                    title = snippet.get("title", "")
                    description = snippet.get("description", "")
                    channel = snippet.get("channelTitle", "")
                    published_raw = snippet.get("publishedAt")
                    published_dt = None
                    if published_raw:
                        try:
                            published_dt = datetime.fromisoformat(published_raw.replace("Z", "+00:00"))
                        except Exception:
                            pass

                    metrics = {
                        "view_count": int(stats.get("viewCount", 0)),
                        "like_count": int(stats.get("likeCount", 0)) if "likeCount" in stats else None,
                        "comment_count": int(stats.get("commentCount", 0)) if "commentCount" in stats else None,
                    }

                    # Fetch Comments
                    comments: List[ObservedComment] = []
                    missing_fields = []
                    c_res = client.get(
                        "https://www.googleapis.com/youtube/v3/commentThreads",
                        params={"part": "snippet", "videoId": post_id, "maxResults": 50, "order": "time", "key": api_key}
                    )

                    if c_res.status_code == 200:
                        c_data = c_res.json()
                        for c_item in c_data.get("items", []):
                            c_snip = c_item.get("snippet", {}).get("topLevelComment", {}).get("snippet", {})
                            c_text = c_snip.get("textOriginal", "")
                            c_author = c_snip.get("authorDisplayName", "Anonymous")
                            c_time_raw = c_snip.get("publishedAt")
                            c_time = None
                            if c_time_raw:
                                try:
                                    c_time = datetime.fromisoformat(c_time_raw.replace("Z", "+00:00"))
                                except Exception:
                                    pass
                            comments.append(ObservedComment(
                                comment_id=c_item.get("id", ""),
                                author=c_author,
                                text=c_text,
                                created_at=c_time,
                                like_count=c_snip.get("likeCount", 0)
                            ))
                    else:
                        missing_fields.append("comment_threads (disabled or restricted)")

                    return SourceRetrievalResult(
                        status="SUCCESS" if comments else "METADATA_ONLY",
                        platform=self.platform_name,
                        platform_label=self.platform_label,
                        post_id=post_id,
                        canonical_url=canonical_url,
                        retrieval_timestamp=now,
                        provenance="YouTube Data API v3",
                        title=title,
                        text=f"{title}\n\n{description[:500]}",
                        author=channel,
                        published_at=published_dt,
                        metrics=metrics,
                        observed_comments=comments,
                        missing_fields=missing_fields,
                        has_sufficient_cascade_data=len(comments) >= 5,
                        credentials_configured=True
                    )
            except Exception as e:
                return self._fallback_oembed(post_id, canonical_url, now, error_notice=str(e))

        # 2. No API Key configured -> use public oEmbed for verified metadata, record missing comment history
        return self._fallback_oembed(post_id, canonical_url, now)

    def _fallback_oembed(
        self,
        post_id: str,
        canonical_url: str,
        now: datetime,
        error_notice: Optional[str] = None
    ) -> SourceRetrievalResult:
        try:
            with httpx.Client(timeout=8.0) as client:
                res = client.get("https://www.youtube.com/oembed", params={"url": canonical_url, "format": "json"})
                if res.status_code == 404:
                    return SourceRetrievalResult(
                        status="POST_NOT_FOUND",
                        platform=self.platform_name,
                        platform_label=self.platform_label,
                        post_id=post_id,
                        canonical_url=canonical_url,
                        retrieval_timestamp=now,
                        provenance="YouTube Public oEmbed",
                        error_message="Video does not exist or is private."
                    )
                if res.status_code == 200:
                    data = res.json()
                    title = data.get("title", "")
                    author = data.get("author_name", "")
                    return SourceRetrievalResult(
                        status="METADATA_ONLY",
                        platform=self.platform_name,
                        platform_label=self.platform_label,
                        post_id=post_id,
                        canonical_url=canonical_url,
                        retrieval_timestamp=now,
                        provenance="YouTube Public oEmbed (Unauthenticated)",
                        title=title,
                        text=title,
                        author=author,
                        published_at=None,
                        metrics={},
                        observed_comments=[],
                        missing_fields=["published_at", "view_count", "like_count", "comment_cascade"],
                        has_sufficient_cascade_data=False,
                        credentials_configured=False,
                        error_message=error_notice,
                        credentials_help="To fetch live comment streams and evaluate cascade features, configure YOUTUBE_API_KEY in backend/.env."
                    )
        except Exception as e:
            pass

        return SourceRetrievalResult(
            status="CREDENTIALS_REQUIRED",
            platform=self.platform_name,
            platform_label=self.platform_label,
            post_id=post_id,
            canonical_url=canonical_url,
            retrieval_timestamp=now,
            provenance="YouTube Connector",
            missing_fields=["title", "description", "published_at", "comments"],
            credentials_configured=False,
            error_message="Could not reach YouTube. Configure YOUTUBE_API_KEY in backend/.env for direct API access."
        )
