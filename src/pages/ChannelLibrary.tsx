import { useState, useEffect } from "react";
import apiFetch from "@wordpress/api-fetch";
import { useToast } from "../store/toast/use-toast";
import { ClassicInput, ClassicButton, ClassicSelect } from "../components/classics";
import CustomModal from "../components/common/CustomModal";
import { useWpabStore, useWpabStoreActions } from "../store/wpabStore";
import { timeDiff } from "../utils/Dates";

interface VideoData {
  id: string;
  title: string;
  thumbnail_url: string;
  published_at: string;
  description: string;
}

export default function ChannelLibrary() {
  const { addToast } = useToast();
  const { updateStore } = useWpabStoreActions();

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [videos, setVideos] = useState<VideoData[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [serverSearchQuery, setServerSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);
  const { plugin_settings } = useWpabStore();

  const isConnected = plugin_settings?.connection_status === "connected";

  const SORT_OPTIONS = [
    { value: "date_desc", label: "Recently Added" },
    { value: "date_asc", label: "Oldest First" },
    { value: "title_asc", label: "Title (A-Z)" },
    { value: "title_desc", label: "Title (Z-A)" },
    { value: "view_count", label: "Most Viewed" },
  ];

  const fetchVideos = async (page_token: string = "", isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const response = await apiFetch<{
        success: boolean;
        videos: VideoData[];
        next_page_token?: string | null;
      }>({
        path: `/tubebay/v1/youtube/videos?search=${encodeURIComponent(
          serverSearchQuery,
        )}&sort=${sortBy}&page_token=${page_token}`,
      });
      if (response.success) {
        if (isLoadMore) {
          setVideos((prev) => [...prev, ...response.videos]);
        } else {
          setVideos(response.videos);
        }
        setNextPageToken(response.next_page_token || null);
      }
    } catch (error) {
      addToast(`Error fetching library: ${(error as Error).message}`, "error");
    } finally {
      if (isLoadMore) setLoadingMore(false);
      else setLoading(false);
    }
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    setLoading(true);
    try {
      const response = await apiFetch<{
        success: boolean;
        videos: VideoData[];
        last_sync_time: string;
        channel_name: string;
        thumbnails_default: string;
        thumbnails_medium: string;
      }>({
        path: "/tubebay/v1/youtube/sync-library",
      });
      if (response.success) {
        setSearchInput("");
        setServerSearchQuery("");
        setSortBy("date_desc");
        setVideos(response.videos);
        
        const updateData: any = {};
        if (response.last_sync_time)
          updateData.last_sync_time = Number(response.last_sync_time);
        if (response.channel_name)
          updateData.channel_name = response.channel_name;
        if (response.thumbnails_default)
          updateData.thumbnails_default = response.thumbnails_default;
        if (response.thumbnails_medium)
          updateData.thumbnails_medium = response.thumbnails_medium;

        if (Object.keys(updateData).length > 0) {
          updateStore("plugin_settings", {
            ...plugin_settings,
            ...updateData,
          });
        }

        addToast(
          `Successfully fetched ${response.videos.length} videos.`,
          "success",
        );
      }
    } catch (error) {
      addToast(`Sync Failed: ${(error as any).message}`, "error");
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [serverSearchQuery, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setServerSearchQuery(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!isConnected) {
    return (
      <div className="wrap tubebay-wrap">
        <h2>Channel Library</h2>
        <div className="notice notice-error inline">
          <p>
            <strong>Your YouTube library is currently disconnected.</strong> Please complete the onboarding setup or connect your account in the Settings to sync videos.
          </p>
          <p>
            <ClassicButton variant="primary" onClick={() => (window.location.hash = "/onboarding")}>
              Go to Setup
            </ClassicButton>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap tubebay-wrap">
      <h1 className="wp-heading-inline">Channel Library</h1>
      <ClassicButton
        variant="secondary"
        className="page-title-action"
        onClick={handleSyncNow}
        disabled={syncing}
      >
        {syncing ? "Syncing..." : "Sync Now"}
      </ClassicButton>

      <hr className="wp-header-end" />

      {/* Toolbar */}
      <div className="tablenav top" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div className="alignleft actions">
          <ClassicSelect
            value={sortBy}
            onChange={(val) => setSortBy(val as string)}
            options={SORT_OPTIONS}
            style={{ float: 'none', marginLeft: 0 }}
          />
        </div>
        <div className="alignright">
          <p className="search-box" style={{ margin: 0 }}>
            <label className="screen-reader-text" htmlFor="video-search-input">Search videos:</label>
            <ClassicInput
              type="search"
              id="video-search-input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title..."
            />
          </p>
        </div>
      </div>

      <div className="notice notice-info inline" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p>
          {videos.length > 0 ? (
            <strong>{videos.length} videos available.</strong>
          ) : (
            "No Videos YET."
          )}
        </p>
        <p>
          <span style={{ color: '#646970' }}>Last sync: </span>
          <strong>{timeDiff(Number(plugin_settings.last_sync_time))}</strong>
        </p>
      </div>

      {loading ? (
        <p className="description">Loading videos...</p>
      ) : videos.length === 0 ? (
        <p className="description">No videos found. Try syncing or adjusting your search.</p>
      ) : (
        <table className="wp-list-table widefat fixed striped table-view-list">
          <thead>
            <tr>
              <th scope="col" id="thumbnail" className="manage-column" style={{ width: '160px' }}>Thumbnail</th>
              <th scope="col" id="title" className="manage-column column-primary">Title & Description</th>
              <th scope="col" id="date" className="manage-column" style={{ width: '120px' }}>Date</th>
              <th scope="col" id="actions" className="manage-column" style={{ width: '200px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr key={video.id}>
                <td className="thumbnail column-thumbnail has-row-actions column-primary">
                  <div style={{ width: '120px', height: '68px', backgroundColor: '#f0f0f1', overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                </td>
                <td className="title column-title">
                  <strong>{video.title}</strong>
                  <p className="description" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {video.description}
                  </p>
                </td>
                <td className="date column-date">
                  {formatDate(video.published_at)}
                </td>
                <td className="actions column-actions" style={{ verticalAlign: 'middle' }}>
                  <ClassicButton
                    variant="secondary"
                    onClick={() => setPreviewVideoId(video.id)}
                    style={{ marginRight: '8px' }}
                  >
                    Preview
                  </ClassicButton>
                  <ClassicButton
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(`[tubebay_video id="${video.id}"]`);
                      addToast("Shortcode copied to clipboard", "success");
                    }}
                  >
                    Copy Shortcode
                  </ClassicButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && nextPageToken && (
        <div className="tablenav bottom" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <ClassicButton
            variant="secondary"
            onClick={() => fetchVideos(nextPageToken, true)}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading..." : "Load More Videos"}
          </ClassicButton>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideoId && (
        <CustomModal
          isOpen={!!previewVideoId}
          onClose={() => setPreviewVideoId(null)}
          title={videos.find((v) => v.id === previewVideoId)?.title || "Video Preview"}
          maxWidth="tubebay-max-w-3xl"
        >
          <div style={{ aspectRatio: '16/9', width: '100%', backgroundColor: '#000', borderRadius: '4px', overflow: 'hidden' }}>
            <iframe
              style={{ width: '100%', height: '100%', border: 'none' }}
              src={`https://www.youtube.com/embed/${previewVideoId}?autoplay=1&rel=0`}
              title="Video Preview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </CustomModal>
      )}
    </div>
  );
}
