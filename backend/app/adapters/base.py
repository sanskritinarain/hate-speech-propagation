from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class ObservedComment(BaseModel):
    comment_id: str
    author: Optional[str] = None
    text: str
    created_at: Optional[datetime] = None
    like_count: Optional[int] = None
    parent_id: Optional[str] = None
    is_root: bool = False

class SourceRetrievalResult(BaseModel):
    status: str = Field(
        description="SUCCESS | METADATA_ONLY | CREDENTIALS_REQUIRED | UNSUPPORTED_PLATFORM | POST_NOT_FOUND | RATE_LIMITED | ERROR"
    )
    platform: str
    platform_label: str
    post_id: Optional[str] = None
    canonical_url: str
    retrieval_timestamp: datetime
    provenance: str
    title: Optional[str] = None
    text: Optional[str] = None
    author: Optional[str] = None
    published_at: Optional[datetime] = None
    metrics: Dict[str, Any] = Field(default_factory=dict)
    observed_comments: List[ObservedComment] = Field(default_factory=list)
    missing_fields: List[str] = Field(default_factory=list)
    has_sufficient_cascade_data: bool = False
    observation_window_mins: Optional[float] = None
    credentials_configured: bool = False
    error_message: Optional[str] = None
    credentials_help: Optional[str] = None

class BaseSourceAdapter(ABC):
    platform_name: str
    platform_label: str

    @abstractmethod
    def can_handle(self, url: str) -> bool:
        """Determines if this adapter supports the given URL format."""
        pass

    @abstractmethod
    def extract_post_id(self, url: str) -> Optional[str]:
        """Extracts the unique platform post/video/submission identifier."""
        pass

    @abstractmethod
    def fetch_source(self, url: str) -> SourceRetrievalResult:
        """Retrieves verified metadata and available comments using authorized APIs."""
        pass
