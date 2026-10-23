import os
import re
from datetime import datetime, timezone
from typing import Optional, List
import httpx

from app.adapters.base import BaseSourceAdapter, SourceRetrievalResult, ObservedComment

class RedditAdapter(BaseSourceAdapter):
    platform_name = "reddit"
    platform_label = "Reddit"

    PATTERNS = [
        re.compile(r"reddit\.com/r/([a-zA-Z0-9_]+)/comments/([a-zA-Z0-9]+)", re.IGNORECASE),
        re.compile(r"redd\.it/([a-zA-Z0-9]+)", re.IGNORECASE)
    ]

    def can_handle(self, url: str) -> bool:
        return any(p.search(url) for p in self.PATTERNS)

    def extract_post_id(self, url: str) -> Optional[str]:
        for p in self.PATTERNS:
            m = p.search(url)
            if m:
                # Group 2 if /r/.../comments/... or Group 1 if redd.it
                return m.group(2) if m.lastindex >= 2 else m.group(1)
        return None

    def _extract_subreddit(self, url: str) -> Optional[str]:
        m = self.PATTERNS[0].search(url)
        return m.group(1) if m else None

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
                error_message="Could not extract a valid Reddit submission ID from URL."
            )

        sub = self._extract_subreddit(url) or "all"
        canonical_url = f"https://www.reddit.com/r/{sub}/comments/{post_id}"
        json_url = f"https://www.reddit.com/r/{sub}/comments/{post_id}.json"

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) HateSpeechResearchPipeline/1.0"
        }

        try:
            with httpx.Client(timeout=10.0, follow_redirects=True) as client:
                res = client.get(json_url, headers=headers)

                if res.status_code == 404:
                    return SourceRetrievalResult(
                        status="POST_NOT_FOUND",
                        platform=self.platform_name,
                        platform_label=self.platform_label,
                        post_id=post_id,
                        canonical_url=canonical_url,
                        retrieval_timestamp=now,
                        provenance="Reddit Endpoint",
                        error_message="Reddit submission was not found, deleted, or removed."
                    )

                if res.status_code == 429:
                    return SourceRetrievalResult(
                        status="RATE_LIMITED",
                        platform=self.platform_name,
                        platform_label=self.platform_label,
                        post_id=post_id,
                        canonical_url=canonical_url,
                        retrieval_timestamp=now,
                        provenance="Reddit Endpoint",
                        error_message="Reddit rate limit reached on unauthenticated request. Please configure official REDDIT_CLIENT_ID / SECRET in backend/.env.",
                        missing_fields=["submission_content", "comments_tree"]
                    )

                if res.status_code != 200:
                    return SourceRetrievalResult(
                        status="CREDENTIALS_REQUIRED",
                        platform=self.platform_name,
                        platform_label=self.platform_label,
                        post_id=post_id,
                        canonical_url=canonical_url,
                        retrieval_timestamp=now,
                        provenance="Reddit Endpoint",
                        error_message=f"Reddit returned HTTP {res.status_code}. Public endpoint restricted. Configure REDDIT_CLIENT_ID in backend/.env.",
                        missing_fields=["submission_content", "comments_tree"]
                    )

                data = res.json()
                if not isinstance(data, list) or len(data) < 1:
                    return SourceRetrievalResult(
                        status="ERROR",
                        platform=self.platform_name,
                        platform_label=self.platform_label,
                        post_id=post_id,
                        canonical_url=canonical_url,
                        retrieval_timestamp=now,
                        provenance="Reddit Endpoint",
                        error_message="Unexpected Reddit response format."
                    )

                # Submission payload
                sub_data = data[0].get("data", {}).get("children", [{}])[0].get("data", {})
                title = sub_data.get("title", "")
                selftext = sub_data.get("selftext", "")
                author = sub_data.get("author", "unknown")
                created_utc = sub_data.get("created_utc")
                published_dt = datetime.fromtimestamp(created_utc, timezone.utc) if created_utc else None

                metrics = {
                    "score": int(sub_data.get("score", 0)),
                    "num_comments": int(sub_data.get("num_comments", 0)),
                    "upvote_ratio": float(sub_data.get("upvote_ratio", 1.0)),
                    "subreddit": sub_data.get("subreddit", sub)
                }

                # Comments listing
                comments: List[ObservedComment] = []
                if len(data) > 1:
                    comm_children = data[1].get("data", {}).get("children", [])
                    for child in comm_children:
                        c_data = child.get("data", {})
                        c_body = c_data.get("body", "")
                        c_id = c_data.get("id", "")
                        if not c_body or c_body in ["[deleted]", "[removed]"]:
                            continue
                        c_author = c_data.get("author", "unknown")
                        c_created = c_data.get("created_utc")
                        c_dt = datetime.fromtimestamp(c_created, timezone.utc) if c_created else None
                        comments.append(ObservedComment(
                            comment_id=c_id,
                            author=c_author,
                            text=c_body,
                            created_at=c_dt,
                            like_count=c_data.get("score", 0),
                            is_root=False
                        ))

                full_text = f"{title}\n\n{selftext}".strip() if selftext else title

                return SourceRetrievalResult(
                    status="SUCCESS" if comments else "METADATA_ONLY",
                    platform=self.platform_name,
                    platform_label=self.platform_label,
                    post_id=post_id,
                    canonical_url=canonical_url,
                    retrieval_timestamp=now,
                    provenance="Reddit JSON Endpoint",
                    title=title,
                    text=full_text,
                    author=f"u/{author}",
                    published_at=published_dt,
                    metrics=metrics,
                    observed_comments=comments,
                    missing_fields=[] if comments else ["no_replies_yet"],
                    has_sufficient_cascade_data=len(comments) >= 5,
                    credentials_configured=True
                )

        except Exception as e:
            return SourceRetrievalResult(
                status="ERROR",
                platform=self.platform_name,
                platform_label=self.platform_label,
                post_id=post_id,
                canonical_url=canonical_url,
                retrieval_timestamp=now,
                provenance="Reddit Endpoint",
                error_message=f"Network error accessing Reddit: {str(e)}"
            )
