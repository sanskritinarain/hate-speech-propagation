from app.adapters.manager import source_manager
from app.adapters.youtube import YouTubeAdapter
from app.adapters.reddit import RedditAdapter
from app.adapters.twitter import TwitterAdapter

def test_youtube_adapter_id_extraction():
    yt = YouTubeAdapter()
    assert yt.can_handle("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    assert yt.can_handle("https://youtu.be/dQw4w9WgXcQ")
    assert yt.can_handle("https://youtube.com/shorts/dQw4w9WgXcQ")
    assert yt.extract_post_id("https://www.youtube.com/watch?v=dQw4w9WgXcQ") == "dQw4w9WgXcQ"
    assert yt.extract_post_id("https://youtu.be/dQw4w9WgXcQ") == "dQw4w9WgXcQ"
    assert not yt.can_handle("https://example.com/video")

def test_reddit_adapter_id_extraction():
    r = RedditAdapter()
    assert r.can_handle("https://www.reddit.com/r/technology/comments/abc123z/sample_post")
    assert r.can_handle("https://redd.it/abc123z")
    assert r.extract_post_id("https://www.reddit.com/r/technology/comments/abc123z/sample_post") == "abc123z"
    assert r.extract_post_id("https://redd.it/abc123z") == "abc123z"
    assert not r.can_handle("https://reddit.com/about")

def test_twitter_adapter_id_extraction():
    t = TwitterAdapter()
    assert t.can_handle("https://x.com/user/status/1234567890123456789")
    assert t.can_handle("https://twitter.com/user/status/1234567890123456789")
    assert t.extract_post_id("https://x.com/user/status/1234567890123456789") == "1234567890123456789"
    assert not t.can_handle("https://x.com/home")

def test_source_manager_routing():
    # Unsupported URL
    res_unsupported = source_manager.resolve_source("https://random-forum.net/thread/100")
    assert res_unsupported.status == "UNSUPPORTED_PLATFORM"
    assert "all_metadata" in res_unsupported.missing_fields

    # Direct Text
    res_text = source_manager.resolve_source("Community council meets at 6 PM on Tuesday.")
    assert res_text.status == "SUCCESS"
    assert res_text.platform == "direct_text"
    assert not res_text.has_sufficient_cascade_data
    assert "observed_replies" in res_text.missing_fields
