import Button from "../common/Button";
import Card from "../common/Card";
import { Switch } from "../common/Switch";
import { RefreshIcon, ClockIcon } from "../common/Icons";
import { PluginSettings, SyncPlacementSettings } from "../../utils/types";

interface SyncCardProps {
  settings: PluginSettings;
  tmpOtherSettings: SyncPlacementSettings;
  setTmpOtherSettings: (settings: SyncPlacementSettings) => void;
  syncing: boolean;
  handleSyncLibrary: () => void;
  hideHeader?: boolean;
  hideSyncRow?: boolean;
}

export default function SyncCard({
  settings,
  tmpOtherSettings,
  setTmpOtherSettings,
  syncing,
  handleSyncLibrary,
  hideHeader = false,
  hideSyncRow = false,
}: SyncCardProps) {
  return (
    <Card className="tubebay-flex tubebay-flex-col tubebay-gap-[32px]">
      {!hideHeader && (
        <div className="tubebay-flex tubebay-items-center tubebay-gap-[8px] tubebay-justify-between">
          <div className="tubebay-flex tubebay-items-center tubebay-gap-[8px]">
            <RefreshIcon size={20} className="tubebay-text-[#4B5563]" />
            <h2 className="tubebay-t-3">Sync Settings</h2>
          </div>
        </div>
      )}

      {/* Automatic Daily Sync */}
      <div className="tubebay-flex tubebay-items-start tubebay-justify-between ">
        <div className="tubebay-flex tubebay-gap-[12px]">
          <div className="tubebay-bg-[#f5f3ff] tubebay-p-[8px] tubebay-rounded-[8px] tubebay-h-fit">
            <RefreshIcon size={18} className="tubebay-text-[#7c3aed]" />
          </div>
          <div className="tubebay-flex tubebay-flex-col tubebay-gap-[4px]">
            <h3 className="tubebay-t-4-bold tubebay-text-color-default">
              Automatic Daily Sync
            </h3>
            <p className="tubebay-text-[13px] tubebay-leading-[20px] tubebay-text-gray-500 tubebay-max-w-[540px]">
              Keep your video library up-to-date automatically. TubeBay will
              sync new videos from your YouTube channel every 24 hours.
            </p>
            {/* <div className="tubebay-flex tubebay-items-center tubebay-gap-[6px] tubebay-mt-[4px]">
              <ClockIcon size={14} className="tubebay-text-gray-400" />
              <span className="tubebay-text-[12px] tubebay-text-gray-400">
                Next sync: Today at 3:00 AM
              </span>
            </div> */}
          </div>
        </div>
        <Switch
          checked={!!tmpOtherSettings.auto_sync}
          onChange={(checked) =>
            setTmpOtherSettings({ ...tmpOtherSettings, auto_sync: checked })
          }
          className={
            tmpOtherSettings.auto_sync
              ? "tubebay-bg-[#3858e9]"
              : "tubebay-bg-gray-200"
          }
        />
      </div>

      {/* Force Sync Library */}
      {!hideSyncRow && (
        <div className="tubebay-flex tubebay-items-start tubebay-justify-between">
          <div className="tubebay-flex tubebay-gap-[12px]">
            <div className="tubebay-bg-[#f0fdf4] tubebay-p-[8px] tubebay-rounded-[8px] tubebay-h-fit">
              <RefreshIcon size={18} className="tubebay-text-[#22c55e]" />
            </div>
            <div className="tubebay-flex tubebay-flex-col tubebay-gap-[4px]">
              <h3 className="tubebay-t-4-bold tubebay-text-color-default">
                Force Sync Library
              </h3>
              <p className="tubebay-text-[13px] tubebay-leading-[20px] tubebay-text-gray-500 tubebay-max-w-[540px]">
                Manually refresh your video library now if you've recently added
                videos to your YouTube channel.
              </p>
            </div>
          </div>
          <Button
            onClick={handleSyncLibrary}
            disabled={syncing || !settings.api_key || !settings.channel_id}
            color="secondary"
            variant="outline"
            className="tubebay-h-[38px] tubebay-px-[16px] tubebay-text-[13px] tubebay-font-bold tubebay-whitespace-nowrap"
          >
            {syncing ? "Syncing..." : "Sync Now"}
          </Button>
        </div>
      )}
    </Card>
  );
}
