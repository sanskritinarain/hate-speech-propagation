import os
import re
from datetime import datetime, timezone
from typing import Optional, List
import httpx

from app.adapters.base import BaseSourceAdapter, SourceRetrievalResult, ObservedComment

class TwitterAdapter(BaseSourceAdapter):
    platform_name = "twitter"
    platform_label = "X / Twitter"

    PATTERNS = [
        re.compile(r"(?:twitter\.com|x\.com)/([a-zA-Z0-9_]+)/status/([0-9]+)", re.IGNORECASE)
    ]

    def can_handle(self, url: str) -> bool:
        return any(p.search(url) for p in self.PATTERNS)

    def extract_post_id(self, url: str) -> Optional[str]:
        for p in self.PATTERNS:
            m = p.search(url)
            if m:
                return m.group(2)
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
                error_message="Could not extract a valid numerical Tweet ID from URL."
            )

        canonical_url = f"https://x.com/i/web/status/{post_id}"
        bearer_token = os.getenv("X_BEARER_TOKEN") or os.getenv("TWITTER_BEARER_TOKEN")

        if not bearer_token:
            return SourceRetrievalResult(
                status="CREDENTIALS_REQUIRED",
                platform=self.platform_name,
                platform_label=self.platform_label,
                post_id=post_id,
                canonical_url=canonical_url,
                retrieval_timestamp=now,
                provenance="X API Connector",
                missing_fields=["tweet_text", "public_metrics", "author", "replies"],
                credentials_configured=False,
                error_message="Live X (Twitter) post and reply retrieval requires an authorized Bearer Token. Unauthenticated scraping is blocked by X.",
                credentials_help="Set X_BEARER_TOKEN in backend/.env with your Twitter Developer API credentials."
            )

        # If Bearer Token is present
        try:
            headers = {"Authorization": f"Bearer {bearer_token}"}
            with httpx.Client(timeout=10.0) as client:
                res = client.get(
                    f"https://api.twitter.com/2/tweets/{post_id}",
                    params={"tweet.fields": "created_at,public_metrics,author_id,conversation_id"},
                    headers=headers
                )
                if res.status_code == 404:
                    return SourceRetrievalResult(
                        status="POST_NOT_FOUND",
                        platform=self.platform_name,
                        platform_label=self.platform_label,
                        post_id=post_id,
                        canonical_url=canonical_url,
                        retrieval_timestamp=now,
                        provenance="X API v2",
                        error_message="Tweet was deleted or not found."
                    )
                if res.status_code == 429:
                    return SourceRetrievalResult(
                        status="RATE_LIMITED",
                        platform=self.platform_name,
                        platform_label=self.platform_label,
                        post_id=post_id,
                        canonical_url=canonical_url,
                        retrieval_timestamp=now,
                        provenance="X API v2",
                        error_message="X API v2 rate limit exceeded."
                    )
                if res.status_code != 200:
                    return SourceRetrievalResult(
                        status="ERROR",
                        platform=self.platform_name,
                        platform_label=self.platform_label,
                        post_id=post_id,
                        canonical_url=canonical_url,
                        retrieval_timestamp=now,
                        provenance="X API v2",
                        error_message=f"X API returned HTTP {res.status_code}: {res.text}"
                    )

                t_data = res.json().get("data", {})
                text = t_data.get("text", "")
                created_raw = t_data.get("created_at")
                published_dt = datetime.fromisoformat(created_raw.replace("Z", "+00:00")) if created_raw else None
                metrics = t_data.get("public_metrics", {})

                return SourceRetrievalResult(
                    status="METADATA_ONLY",
                    platform=self.platform_name,
                    platform_label=self.platform_label,
                    post_id=post_id,
                    canonical_url=canonical_url,
                    retrieval_timestamp=now,
                    provenance="X API v2",
                    title=text[:60] + "...",
                    text=text,
                    author=f"user_{t_data.get('author_id', '')}",
                    published_at=published_dt,
                    metrics=metrics,
                    observed_comments=[],
                    missing_fields=["reply_cascade (search/recent replies requires elevated X Academic/Pro tier)"],
                    has_sufficient_cascade_data=False,
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
                provenance="X API Connector",
                error_message=f"Network error contacting X API: {str(e)}"
            )
