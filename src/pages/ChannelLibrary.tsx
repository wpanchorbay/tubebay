import { useState, useEffect } from "react";
import apiFetch from "@wordpress/api-fetch";
import { useToast } from "../store/toast/use-toast";
import { ClassicInput, ClassicButton, ClassicSelect } from "../components/classics";
import { Youtube, Copy } from "lucide-react";
import CustomModal from "../components/common/CustomModal";
import { useWpabStore, useWpabStoreActions } from "../store/wpabStore";
import { timeDiff } from "../utils/Dates";

interface VideoData {
  id: string;
  title: string;
  thumbnail_url: string;
  published_at: string;
  description: string;
  products?: { id: number; name: string }[];
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
  const [copiedVideoId, setCopiedVideoId] = useState<string | null>(null);
  const { plugin_settings } = useWpabStore();

  const isConnected = plugin_settings?.connection_status === "connected";

  const SORT_OPTIONS = [
    { value: "date_desc", label: "Sort by Date (Newest)" },
    { value: "date_asc", label: "Sort by Date (Oldest)" },
    { value: "title_asc", label: "Sort by Title (A-Z)" },
    { value: "title_desc", label: "Sort by Title (Z-A)" },
    { value: "view_count", label: "Sort by Views" },
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

  const handleCopyShortcode = (videoId: string) => {
    navigator.clipboard.writeText(`[tubebay_video id="${videoId}"]`);
    addToast("Shortcode copied to clipboard", "success");
    setCopiedVideoId(videoId);
    setTimeout(() => {
      setCopiedVideoId(null);
    }, 2000);
  };

  if (!isConnected) {
    return (
      <div className="wrap tubebay-wrap">
        <h1 className="tubebay-ignore-preflight">Channel Library</h1>
        <p className="description" style={{ marginBottom: '15px' }}>
          Browse, search, and manage your synced YouTube videos.
        </p>
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
      <h1 className="tubebay-ignore-preflight">Channel Library</h1>

      <hr className="wp-header-end" />

      <p className="description" style={{ marginBottom: '15px' }}>
        Browse, search, and manage your synced YouTube videos.
      </p>

      {/* Toolbar */}
      <div className="tablenav top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
        <div className="alignleft actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ClassicSelect
            value={sortBy}
            onChange={(val) => setSortBy(val as string)}
            options={SORT_OPTIONS}
          />
          <p className="search-box" style={{ margin: 0, float: 'none' }}>
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
        <div className="alignright" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ClassicButton
            variant="secondary"
            onClick={handleSyncNow}
            disabled={syncing}
            style={{ margin: 0 }}
          >
            {syncing ? "Syncing..." : "Sync Now"}
          </ClassicButton>
        </div>
      </div>

      <div className="notice notice-info inline" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
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
        <>
          <style type="text/css">{`
            @keyframes tubebay-pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: .4; }
            }
            .tubebay-skeleton-bar {
              height: 14px;
              background-color: #e2e8f0;
              border-radius: 4px;
              animation: tubebay-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            .tubebay-skeleton-thumbnail {
              width: 120px;
              height: 68px;
              background-color: #e2e8f0;
              border-radius: 4px;
              animation: tubebay-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
          `}</style>
          <table className="wp-list-table widefat fixed striped table-view-list">
            <thead>
              <tr>
                <th scope="col" style={{ width: '160px' }}>Thumbnail</th>
                <th scope="col" className="column-primary">Title</th>
                <th scope="col" style={{ width: '200px' }}>Products</th>
                <th scope="col" style={{ width: '150px' }}>Published</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td>
                    <div className="tubebay-skeleton-thumbnail" />
                  </td>
                  <td className="column-primary" style={{ verticalAlign: 'middle' }}>
                    <div className="tubebay-skeleton-bar" style={{ width: '75%', marginBottom: '8px' }} />
                    <div className="tubebay-skeleton-bar" style={{ width: '40%' }} />
                  </td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <div className="tubebay-skeleton-bar" style={{ width: '60%' }} />
                  </td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <div className="tubebay-skeleton-bar" style={{ width: '70%' }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : videos.length === 0 ? (
        <p className="description">No videos found. Try syncing or adjusting your search.</p>
      ) : (
        <table className="wp-list-table widefat fixed striped table-view-list">
          <thead>
            <tr>
              <th scope="col" id="thumbnail" className="manage-column" style={{ width: '160px' }}>Thumbnail</th>
              <th scope="col" id="title" className="manage-column column-primary">Title</th>
              <th scope="col" id="products" className="manage-column" style={{ width: '200px' }}>Products</th>
              <th scope="col" id="date" className="manage-column" style={{ width: '150px' }}>Published</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr key={video.id}>
                <td className="thumbnail column-thumbnail">
                  <div style={{ width: '120px', height: '68px', backgroundColor: '#f0f0f1', overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                </td>
                <td className="title column-title has-row-actions column-primary">
                  <strong>{video.title}</strong>
                  <div className="row-actions">
                    <span className="view">
                      <button
                        type="button"
                        className="button-link"
                        onClick={() => setPreviewVideoId(video.id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Youtube size={12} />
                        View on YouTube
                      </button>
                      {" | "}
                    </span>
                    <span className="copy">
                      <button
                        type="button"
                        className="button-link"
                        onClick={() => handleCopyShortcode(video.id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Copy size={12} />
                        {copiedVideoId === video.id ? "Copied!" : "Copy Shortcode"}
                      </button>
                    </span>
                  </div>
                </td>
                <td className="products column-products" style={{ verticalAlign: 'middle' }}>
                  {video.products && video.products.length > 0 ? (
                    video.products.map((p, idx) => (
                      <span key={p.id}>
                        <a href={`post.php?post=${p.id}&action=edit`}>{p.name}</a>
                        {idx < video?.products?.length - 1 ? ", " : ""}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#c3c4c7' }}>—</span>
                  )}
                </td>
                <td className="date column-date" style={{ verticalAlign: 'middle' }}>
                  {formatDate(video.published_at)}
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
