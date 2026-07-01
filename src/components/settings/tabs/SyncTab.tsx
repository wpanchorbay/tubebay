import { FC, useState } from "react";
import apiFetch from "@wordpress/api-fetch";
import { ClassicSettingsTable, ClassicSelect, ClassicCheckbox, ClassicButton } from "../../classics";
import { useToast } from "../../../store/toast/use-toast";
import { PluginSettings } from "../../../utils/types";

interface SyncTabProps {
  settings: PluginSettings;
  updateLocalSetting: (key: keyof PluginSettings, value: any) => void;
  onSyncComplete?: (data: any) => void;
}

export const SyncTab: FC<SyncTabProps> = ({ settings, updateLocalSetting, onSyncComplete }) => {
  const { addToast } = useToast();
  const [syncing, setSyncing] = useState(false);

  const handleSyncLibrary = async () => {
    setSyncing(true);
    try {
      const response = await apiFetch<{
        success: boolean;
        message: string;
        videos: any[];
      }>({
        path: "/tubebay/v1/youtube/sync-library",
      });

      if (response.success) {
        addToast(`Successfully fetched and cached ${response.videos.length} videos.`, "success");
        if (onSyncComplete) onSyncComplete(response);
      }
    } catch (error) {
      addToast(`Sync Failed: ${(error as any).message}`, "error");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <ClassicSettingsTable
        title="Synchronization Settings"
        description="Manage how often TubeBay syncs videos from your YouTube channel."
        fields={[
          {
            id: "auto_sync",
            label: "Automatic Sync",
            render: () => (
              <>
                <ClassicCheckbox
                  id="auto_sync"
                  checked={settings.auto_sync ?? true}
                  onChange={(checked) => updateLocalSetting("auto_sync", checked)}
                  label="Enable daily automatic sync"
                />
                <p className="description">If enabled, TubeBay will automatically fetch new videos from your channel once a day using WP-Cron.</p>
              </>
            ),
          },
          {
            id: "cache_duration",
            label: "Cache Duration",
            render: () => (
              <>
                <ClassicSelect
                  id="cache_duration"
                  value={settings.cache_duration ? settings.cache_duration.toString() : "12"}
                  onChange={(val) => updateLocalSetting("cache_duration", Number(val))}
                  options={[
                    { label: "1 Hour", value: "1" },
                    { label: "6 Hours", value: "6" },
                    { label: "12 Hours", value: "12" },
                    { label: "24 Hours", value: "24" },
                    { label: "1 Week", value: "168" },
                  ]}
                />
                <p className="description">How long video data should be cached locally to reduce API calls.</p>
              </>
            )
          },
          {
            id: "manual_sync",
            label: "Manual Sync",
            render: () => (
              <>
                <ClassicButton
                  variant="secondary"
                  onClick={handleSyncLibrary}
                  disabled={syncing || settings.connection_status !== "connected"}
                >
                  {syncing ? "Syncing..." : "Sync Now"}
                </ClassicButton>
                <p className="description" style={{ marginTop: '5px' }}>Force an immediate synchronization of your YouTube channel library.</p>
              </>
            )
          }
        ]}
      />
    </>
  );
};
