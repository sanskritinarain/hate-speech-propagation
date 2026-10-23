import os
import re
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

from app.adapters.base import BaseSourceAdapter, SourceRetrievalResult
from app.adapters.youtube import YouTubeAdapter
from app.adapters.reddit import RedditAdapter
from app.adapters.twitter import TwitterAdapter

class SourceAdapterManager:
    def __init__(self):
        self.adapters: List[BaseSourceAdapter] = [
            YouTubeAdapter(),
            RedditAdapter(),
            TwitterAdapter()
        ]

    def is_url(self, text: str) -> bool:
        trimmed = text.strip()
        if trimmed.startswith("http://") or trimmed.startswith("https://"):
            return True
        # Check for typical platform domains
        domain_pattern = r"(?:youtube\.com|youtu\.be|reddit\.com|redd\.it|twitter\.com|x\.com|instagram\.com)"
        return bool(re.search(domain_pattern, trimmed, re.IGNORECASE))

    def resolve_source(self, input_text: str) -> SourceRetrievalResult:
        trimmed = input_text.strip()
        now = datetime.now(timezone.utc)

        # 1. URL Case
        if self.is_url(trimmed):
            # Ensure protocol if omitted
            url = trimmed
            if not url.startswith("http://") and not url.startswith("https://"):
                url = f"https://{url}"

            for adapter in self.adapters:
                if adapter.can_handle(url):
                    return adapter.fetch_source(url)

            # URL provided but platform unsupported
            return SourceRetrievalResult(
                status="UNSUPPORTED_PLATFORM",
                platform="unsupported",
                platform_label="Unsupported Platform",
                canonical_url=url,
                retrieval_timestamp=now,
                provenance="URL Validator",
                error_message="This URL belongs to an unsupported platform. Currently supported connectors: YouTube, Reddit, X (Twitter).",
                missing_fields=["all_metadata", "comments"]
            )

        # 2. Raw Text Case (Direct user input)
        return SourceRetrievalResult(
            status="SUCCESS",
            platform="direct_text",
            platform_label="Direct Text Input",
            canonical_url="",
            retrieval_timestamp=now,
            provenance="Direct Submission",
            title=trimmed[:60] + ("..." if len(trimmed) > 60 else ""),
            text=trimmed,
            author="User Provided",
            published_at=now,
            metrics={},
            observed_comments=[],
            missing_fields=["observed_replies", "cascade_dynamics"],
            has_sufficient_cascade_data=False,
            credentials_configured=True
        )

    def get_credentials_status(self) -> Dict[str, Any]:
        return {
            "youtube": bool(os.getenv("YOUTUBE_API_KEY")),
            "reddit": bool(os.getenv("REDDIT_CLIENT_ID")),
            "twitter": bool(os.getenv("X_BEARER_TOKEN") or os.getenv("TWITTER_BEARER_TOKEN"))
        }

source_manager = SourceAdapterManager()
