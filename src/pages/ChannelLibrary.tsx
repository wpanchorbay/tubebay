import { useState, useEffect } from "react";
import apiFetch from "@wordpress/api-fetch";
import { useToast } from "../store/toast/use-toast";
import { Input } from "../components/common/Input";
import Button from "../components/common/Button";
import Page from "../components/common/Page";
import CustomModal from "../components/common/CustomModal";
import {
  RefreshIcon,
  CheckIcon,
  ListIcon,
  LayoutGridIcon,
  EyeIcon,
  CalendarIcon,
  YouTubeFilledIcon,
} from "../components/common/Icons";
import Select from "../components/common/Select";
import { VideoGridSkeleton } from "../components/loading/VideoGridSkeleton";
import { useWpabStore, useWpabStoreActions } from "../store/wpabStore";
import { timeDiff } from "../utils/Dates";
import { Toggler } from "../components/common/Toggler";
import { Copy } from "lucide-react";
import Skeleton from "../components/common/Skeleton";

interface VideoData {
  id: string;
  title: string;
  thumbnail_url: string;
  published_at: string;
  description: string;
  is_assigned?: boolean;
  assigned_count?: number;
}

interface ProductInfo {
  id: number;
  name: string;
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<"assign" | "remove">("assign");
  const [productsToAssign, setProductsToAssign] = useState<ProductInfo[]>([]);
  const [searchProductInput, setSearchProductInput] = useState("");
  const [searchedProducts, setSearchedProducts] = useState<ProductInfo[]>([]);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [isSavingBulk, setIsSavingBulk] = useState(false);

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
        // Reset filters when forced sync occurs to see the freshest items
        setSearchInput("");
        setServerSearchQuery("");
        setSortBy("date_desc");
        setVideos(response.videos);
        // sync with context
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

  // Effect to trigger initial load and re-fetch when search/sort changes
  useEffect(() => {
    fetchVideos();
  }, [serverSearchQuery, sortBy]);

  // Debounce search input
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
      <Page>
        <div className="tubebay-flex tubebay-flex-col tubebay-items-center tubebay-justify-center tubebay-min-h-[500px] tubebay-text-center tubebay-bg-white tubebay-rounded-[16px] tubebay-border tubebay-border-dashed tubebay-border-gray-300 tubebay-p-[48px]">
          <div className="tubebay-w-[80px] tubebay-h-[80px] tubebay-bg-red-50 tubebay-rounded-full tubebay-flex tubebay-items-center tubebay-justify-center tubebay-mb-[24px]">
            <YouTubeFilledIcon size={40} className="tubebay-text-red-600" />
          </div>
          <h2 className="tubebay-t-2 tubebay-text-color-default tubebay-mb-[12px]">
            Connect Your YouTube Channel
          </h2>
          <p className="tubebay-t-4 tubebay-text-[#4b5563] tubebay-max-w-[420px] tubebay-mb-[32px]">
            Your YouTube library is currently disconnected. Connect your account
            in settings to sync your videos and manage them here.
          </p>
          <Button
            color="primary"
            size="large"
            className="tubebay-px-[32px]"
            onClick={() => (window.location.hash = "/settings")}
          >
            Go to Settings
          </Button>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      {/* Header */}
      <div className="tubebay-flex tubebay-flex-col md:tubebay-flex-row md:tubebay-justify-between md:tubebay-items-end  tubebay-gap-[24px]">
        <div>
          <h1 className="tubebay-t-1 tubebay-text-color-default">
            Channel Library
          </h1>
          <p className="tubebay-t-4 tubebay-text-[#4b5563]">
            Manage and preview your synced YouTube videos
          </p>
        </div>
        <Button
          onClick={handleSyncNow}
          disabled={syncing}
          color="primary"
          className="tubebay-whitespace-nowrap tubebay-px-[24px] tubebay-t-5"
        >
          {syncing ? (
            "Syncing..."
          ) : (
            <>
              <RefreshIcon size={16} className="tubebay-mr-[8px]" />
              Sync Now
            </>
          )}
        </Button>
      </div>

      {/* Status Banner */}
      {loading ? (
        <div className="tubebay-bg-gray-100 tubebay-border tubebay-border-gray-200 tubebay-rounded-[12px] tubebay-p-[24px] tubebay-flex tubebay-flex-col md:tubebay-flex-row md:tubebay-items-center md:tubebay-justify-between">
          <div className="tubebay-flex tubebay-items-center tubebay-gap-[16px]">
            <Skeleton
              width="10"
              height="10"
              borderRadius="full"
              className="tubebay-flex-shrink-0"
            />
            <div>
              <Skeleton width="48" height="4" className="tubebay-mb-2" />
              <Skeleton width="64" height="3" />
            </div>
          </div>
          <div className="tubebay-mt-[16px] md:tubebay-mt-0">
            <Skeleton width="32" height="4" />
          </div>
        </div>
      ) : (
        <div className="tubebay-bg-green-50 tubebay-border tubebay-border-green-200 tubebay-rounded-[12px] tubebay-p-[24px]  tubebay-flex tubebay-flex-col md:tubebay-flex-row md:tubebay-items-center md:tubebay-justify-between">
          <div className="tubebay-flex tubebay-items-center tubebay-gap-[16px]">
            <div className="tubebay-bg-green-500 tubebay-text-white tubebay-rounded-full tubebay-p-[8px] tubebay-flex tubebay-items-center tubebay-justify-center">
              <CheckIcon size={24} />
            </div>
            <div>
              <h3 className="tubebay-text-[16px] tubebay-font-bold tubebay-text-gray-900">
                {videos.length > 0 ? "All Videos Synced" : "No Videos YET"}
              </h3>
              <p className="tubebay-text-[14px] tubebay-text-gray-600">
                {videos.length} videos from your YouTube channel are available
              </p>
            </div>
          </div>
          <div className="tubebay-text-right tubebay-mt-[16px] md:tubebay-mt-0">
            <p className="tubebay-text-[14px] tubebay-font-medium tubebay-text-gray-900">
              Last sync:{" "}
              {isConnected
                ? timeDiff(Number(plugin_settings.last_sync_time))
                : "Never"}
            </p>
            {/* <p className="tubebay-text-[12px] tubebay-text-gray-500">
            Cache is active
          </p> */}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="tubebay-flex tubebay-flex-col tubebay-gap-[16px] tubebay-p-[24px] tubebay-bg-white tubebay-rounded-[16px] tubebay-border tubebay-shadow-sm ">
        <div className="tubebay-flex tubebay-flex-col md:tubebay-flex-row tubebay-gap-[16px]">
          <div className="tubebay-flex-1">
            <Input
              type="text"
              placeholder="Search videos by title..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              classNames={{ input: "tubebay-bg-white" }}
            />
          </div>
          <div className="tubebay-w-full md:tubebay-w-[200px]">
            <Select
              value={sortBy}
              onChange={(val) => setSortBy(val as string)}
              options={SORT_OPTIONS}
              fontSize={13}
              className="tubebay-bg-white tubebay-h-[42px]"
            />
          </div>
          <div className="tubebay-flex tubebay-items-center tubebay-gap-[8px]">
            <Toggler
              options={[
                { label: <LayoutGridIcon size={18} />, value: "grid" },
                { label: <ListIcon size={18} />, value: "list" },
              ]}
              value={viewMode}
              onChange={(val) => setViewMode(val as "grid" | "list")}
              classNames={{
                button: "!tubebay-px-2",
              }}
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedVideoIds.length > 0 && (
          <div className="tubebay-flex tubebay-items-center tubebay-justify-between tubebay-bg-blue-50 tubebay-border tubebay-border-blue-200 tubebay-rounded-[8px] tubebay-p-[12px]">
            <span className="tubebay-text-[14px] tubebay-font-medium tubebay-text-blue-800">
              {selectedVideoIds.length} video(s) selected
            </span>
            <div className="tubebay-flex tubebay-gap-[8px]">
              <Button
                variant="outline"
                className="!tubebay-bg-white !tubebay-text-red-600 !tubebay-border-red-200 hover:!tubebay-bg-red-50"
                onClick={() => {
                  setBulkActionType("remove");
                  setIsBulkAssignModalOpen(true);
                  setProductsToAssign([]);
                  setSearchProductInput("");
                  setSearchedProducts([]);
                }}
              >
                Remove from Products
              </Button>
              <Button
                color="primary"
                onClick={() => {
                  setBulkActionType("assign");
                  setIsBulkAssignModalOpen(true);
                  setProductsToAssign([]);
                  setSearchProductInput("");
                  setSearchedProducts([]);
                }}
              >
                Assign to Products
              </Button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <VideoGridSkeleton viewMode={viewMode} />
      ) : videos.length === 0 ? (
        <div className="tubebay-text-center tubebay-py-[48px] tubebay-text-gray-500">
          No videos found. Try syncing or adjusting your search.
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "tubebay-grid tubebay-grid-cols-1 md:tubebay-grid-cols-2 lg:tubebay-grid-cols-3 xl:tubebay-grid-cols-4 tubebay-gap-[24px]"
              : "tubebay-flex tubebay-flex-col tubebay-gap-[16px]"
          }
        >
          {videos.map((video) => (
            <div
              key={video.id}
              className={`tubebay-bg-white tubebay-border tubebay-border-gray-200 tubebay-rounded-[12px] tubebay-overflow-hidden tubebay-shadow-sm hover:tubebay-shadow-md tubebay-transition-shadow ${
                viewMode === "list"
                  ? "tubebay-flex tubebay-flex-col sm:tubebay-flex-row"
                  : ""
              }`}
            >
              {/* Thumbnail */}
              <div
                className={`tubebay-relative tubebay-bg-gray-100 ${
                  viewMode === "list"
                    ? "sm:tubebay-w-[240px] tubebay-shrink-0"
                    : "tubebay-aspect-video"
                }`}
              >
                <div className="tubebay-absolute tubebay-top-[8px] tubebay-left-[8px] tubebay-z-10">
                  <input
                    type="checkbox"
                    className="tubebay-w-[18px] tubebay-h-[18px] tubebay-rounded tubebay-border-gray-300 tubebay-cursor-pointer"
                    checked={selectedVideoIds.includes(video.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedVideoIds([...selectedVideoIds, video.id]);
                      } else {
                        setSelectedVideoIds(selectedVideoIds.filter((id) => id !== video.id));
                      }
                    }}
                  />
                </div>
                {video.is_assigned && (
                  <div className="tubebay-absolute tubebay-top-[8px] tubebay-right-[8px] tubebay-z-10">
                    <span
                      className="tubebay-bg-blue-600 tubebay-text-white tubebay-text-[11px] tubebay-font-medium tubebay-px-[8px] tubebay-py-[4px] tubebay-rounded-full tubebay-cursor-help"
                      title={`Assigned to ${video.assigned_count} product(s)`}
                    >
                      Assigned ({video.assigned_count})
                    </span>
                  </div>
                )}
                <img
                  src={video.thumbnail_url}
                  alt={video.title}
                  className="tubebay-w-full tubebay-h-full tubebay-object-cover tubebay-aspect-video"
                />
                <div className="tubebay-absolute tubebay-bottom-[8px] tubebay-right-[8px] tubebay-bg-black/80 tubebay-text-white tubebay-text-[11px] tubebay-font-medium tubebay-px-[6px] tubebay-py-[2px] tubebay-rounded-[4px]">
                  Video
                </div>
              </div>

              {/* Content */}
              <div className="tubebay-p-[16px] tubebay-flex tubebay-flex-col tubebay-justify-between tubebay-flex-1">
                <div>
                  <h4
                    className="tubebay-text-[15px] tubebay-font-bold tubebay-text-gray-900 tubebay-tracking-tight tubebay-line-clamp-2 tubebay-mb-[8px] tubebay-leading-tight"
                    title={video.title}
                  >
                    {video.title}
                  </h4>
                  {viewMode === "list" && video.description && (
                    <p className="tubebay-text-[13px] tubebay-text-gray-600 tubebay-line-clamp-2 tubebay-mb-[12px]">
                      {video.description}
                    </p>
                  )}
                  <div className="tubebay-flex tubebay-items-center tubebay-text-[13px] tubebay-text-gray-500 tubebay-mb-[16px] tubebay-gap-[8px]">
                    <span className="tubebay-flex tubebay-items-center tubebay-gap-[4px]">
                      <EyeIcon size={14} />
                      YT Video
                    </span>
                    <span>•</span>
                    <span className="tubebay-flex tubebay-items-center tubebay-gap-[4px]">
                      <CalendarIcon size={14} />
                      {formatDate(video.published_at)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div
                  className={`tubebay-flex tubebay-gap-[8px] ${
                    viewMode === "list"
                      ? "sm:tubebay-justify-end sm:tubebay-mt-auto"
                      : ""
                  }`}
                >
                  <Button
                    className={viewMode === "list" ? "" : "tubebay-flex-1"}
                    color="primary"
                    onClick={() => setPreviewVideoId(video.id)}
                  >
                    <EyeIcon size={16} className="tubebay-mr-[6px]" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    className="!tubebay-px-[12px] tubebay-text-gray-700 tubebay-border-gray-300 "
                    title="Copy Shortcode"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `[tubebay_video id="${video.id}"]`,
                      );
                      addToast("Shortcode copied to clipboard", "success");
                    }}
                  >
                    <Copy size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && nextPageToken && (
        <div className="tubebay-mt-[32px] tubebay-text-center">
          <Button
            variant="outline"
            onClick={() => fetchVideos(nextPageToken, true)}
            disabled={loadingMore}
            className="tubebay-w-full md:tubebay-w-[200px] tubebay-py-[12px] tubebay-font-bold tubebay-text-gray-700"
          >
            {loadingMore ? "Loading..." : "Load More Videos"}
          </Button>
        </div>
      )}
      {/* Bulk Assign Modal */}
      <CustomModal
        isOpen={isBulkAssignModalOpen}
        onClose={() => setIsBulkAssignModalOpen(false)}
        title={bulkActionType === "assign" ? "Assign to Products" : "Remove from Products"}
        size="md"
      >
        <div className="tubebay-p-[24px]">
          <p className="tubebay-mb-[16px] tubebay-text-gray-600">
            {bulkActionType === "assign"
              ? `Search and select products to assign the ${selectedVideoIds.length} selected video(s) to.`
              : `Search and select products to remove the ${selectedVideoIds.length} selected video(s) from.`}
          </p>

          <div className="tubebay-mb-[24px]">
            <Input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchProductInput}
              onChange={(e) => {
                setSearchProductInput(e.target.value);
                if (e.target.value.length > 2) {
                  setIsSearchingProducts(true);
                  apiFetch<{ success: boolean; data: ProductInfo[] }>({
                    path: `/wc/v3/products?search=${encodeURIComponent(e.target.value)}&per_page=10`,
                  })
                    .then((res) => {
                      // Normalize wc/v3 response
                      const prods = Array.isArray(res) ? res : (res.data || []);
                      setSearchedProducts(prods.map((p: any) => ({ id: p.id, name: p.name })));
                    })
                    .catch(() => {
                      // ignore
                    })
                    .finally(() => setIsSearchingProducts(false));
                } else {
                  setSearchedProducts([]);
                }
              }}
            />

            {isSearchingProducts && <p className="tubebay-mt-[8px] tubebay-text-[13px] tubebay-text-gray-500">Searching...</p>}

            {searchedProducts.length > 0 && searchProductInput.length > 2 && (
              <div className="tubebay-mt-[8px] tubebay-border tubebay-border-gray-200 tubebay-rounded-[8px] tubebay-overflow-hidden tubebay-max-h-[200px] tubebay-overflow-y-auto">
                {searchedProducts.map(prod => (
                  <div
                    key={prod.id}
                    className="tubebay-p-[8px] hover:tubebay-bg-gray-50 tubebay-cursor-pointer tubebay-border-b tubebay-border-gray-100 last:tubebay-border-0 tubebay-flex tubebay-justify-between tubebay-items-center"
                    onClick={() => {
                      if (!productsToAssign.find(p => p.id === prod.id)) {
                        setProductsToAssign([...productsToAssign, prod]);
                      }
                      setSearchProductInput("");
                      setSearchedProducts([]);
                    }}
                  >
                    <span>{prod.name}</span>
                    <Button variant="outline" size="small">Add</Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {productsToAssign.length > 0 && (
            <div className="tubebay-mb-[24px]">
              <h4 className="tubebay-font-medium tubebay-mb-[8px]">Selected Products</h4>
              <div className="tubebay-flex tubebay-flex-wrap tubebay-gap-[8px]">
                {productsToAssign.map(prod => (
                  <div key={prod.id} className="tubebay-bg-blue-50 tubebay-text-blue-800 tubebay-px-[12px] tubebay-py-[4px] tubebay-rounded-full tubebay-text-[13px] tubebay-flex tubebay-items-center tubebay-gap-[8px]">
                    {prod.name}
                    <button
                      className="tubebay-text-blue-500 hover:tubebay-text-blue-700"
                      onClick={() => setProductsToAssign(productsToAssign.filter(p => p.id !== prod.id))}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="tubebay-flex tubebay-justify-end tubebay-gap-[12px]">
            <Button variant="outline" onClick={() => setIsBulkAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              color="primary"
              disabled={productsToAssign.length === 0 || isSavingBulk}
              onClick={async () => {
                setIsSavingBulk(true);
                const videosPayload = selectedVideoIds.map(id => ({ type: 'youtube', id }));

                try {
                  await apiFetch({
                    path: '/tubebay/v1/products/bulk-assign',
                    method: 'POST',
                    data: {
                      product_ids: productsToAssign.map(p => p.id),
                      videos: videosPayload,
                      action: bulkActionType
                    }
                  });
                  addToast(`Successfully ${bulkActionType === 'assign' ? 'assigned' : 'removed'} videos`, "success");
                  setIsBulkAssignModalOpen(false);
                  setSelectedVideoIds([]);
                  fetchVideos(); // refresh to update badges
                } catch (e: any) {
                  addToast(e.message || "An error occurred", "error");
                } finally {
                  setIsSavingBulk(false);
                }
              }}
            >
              {isSavingBulk ? "Saving..." : (bulkActionType === "assign" ? "Assign Videos" : "Remove Videos")}
            </Button>
          </div>
        </div>
      </CustomModal>

      {/* Video Preview Modal */}
      {previewVideoId && (
        <CustomModal
          isOpen={!!previewVideoId}
          onClose={() => setPreviewVideoId(null)}
          title={
            videos.find((v) => v.id === previewVideoId)?.title ||
            "Video Preview"
          }
          maxWidth="tubebay-max-w-3xl"
        >
          <div className="tubebay-aspect-video tubebay-w-full tubebay-rounded-lg tubebay-overflow-hidden tubebay-bg-black">
            <iframe
              className="tubebay-w-full tubebay-h-full"
              src={`https://www.youtube.com/embed/${previewVideoId}?autoplay=1&rel=0`}
              title="Video Preview"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </CustomModal>
      )}
    </Page>
  );
}
