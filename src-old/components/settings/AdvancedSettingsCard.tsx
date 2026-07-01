import { useState } from "react";
import apiFetch from "@wordpress/api-fetch";
import Card from "../common/Card";
import { Switch } from "../common/Switch";
import { CheckCircleIcon } from "../common/Icons";
import { SyncPlacementSettings } from "../../utils/types";
import Button from "../common/Button";
import CustomModal from "../common/CustomModal";
import { useToast } from "../../store/toast/use-toast";
import { useWpabStoreActions } from "../../store/wpabStore";
import { Trash2, AlertTriangle, ShieldAlert } from "lucide-react";

interface AdvancedSettingsCardProps {
  tmpOtherSettings: SyncPlacementSettings;
  setTmpOtherSettings: (settings: SyncPlacementSettings) => void;
  /** Hide the card header. Useful for onboarding steps. */
  hideHeader?: boolean;
}

export default function AdvancedSettingsCard({
  tmpOtherSettings,
  setTmpOtherSettings,
  hideHeader = false,
}: AdvancedSettingsCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const { addToast } = useToast();
  const { updateStore } = useWpabStoreActions();

  const handleDeleteAllData = async () => {
    if (confirmText !== "DELETE") return;

    setIsDeleting(true);
    try {
      const response = await apiFetch<{
        success: boolean;
        message: string;
        data: any;
      }>({
        path: "/tubebay/v1/settings/delete-all-data",
        method: "DELETE",
      });
      window.location.reload();

      if (response.success) {
        addToast(response.message, "success");
        updateStore("plugin_settings", response.data);
        setTmpOtherSettings({
          auto_sync: response.data.auto_sync ?? true,
          video_placement: response.data.video_placement || "below_gallery",
          cache_duration: response.data.cache_duration || 12,
          debug_enableMode: response.data.debug_enableMode ?? false,
          muted_autoplay: response.data.muted_autoplay ?? false,
          show_controls: response.data.show_controls ?? false,
          advanced_deleteAllOnUninstall:
            response.data.advanced_deleteAllOnUninstall ?? false,
        });
      }
    } catch (error) {
      addToast(`Error deleting data: ${(error as Error).message}`, "error");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setConfirmText("");
    }
  };

  return (
    <Card className="tubebay-flex tubebay-flex-col tubebay-gap-[32px] tubebay-mt-[24px]">
      {!hideHeader && (
        <div className="tubebay-flex tubebay-items-center tubebay-gap-[8px]">
          <h2 className="tubebay-t-3">Advanced Settings</h2>
        </div>
      )}

      {/* Debug Mode Row */}
      <div className="tubebay-flex tubebay-items-start tubebay-justify-between ">
        <div className="tubebay-flex tubebay-gap-[12px]">
          <div className="tubebay-bg-[#fff1f2] tubebay-p-[8px] tubebay-rounded-[8px] tubebay-h-fit">
            <CheckCircleIcon size={18} className="tubebay-text-[#e11d48]" />
          </div>
          <div className="tubebay-flex tubebay-flex-col tubebay-gap-[4px]">
            <h3 className="tubebay-t-4-bold tubebay-text-color-default">
              Debug Mode
            </h3>
            <p className="tubebay-text-[13px] tubebay-leading-[20px] tubebay-text-gray-500 tubebay-max-w-[540px]">
              Enable detailed logging for troubleshooting purposes. Logs will be
              saved to the plugin's log directory.
            </p>
          </div>
        </div>
        <Switch
          checked={!!tmpOtherSettings.debug_enableMode}
          onChange={(checked) =>
            setTmpOtherSettings({
              ...tmpOtherSettings,
              debug_enableMode: checked,
            })
          }
          className={
            tmpOtherSettings.debug_enableMode
              ? "tubebay-bg-[#e11d48]"
              : "tubebay-bg-gray-200"
          }
        />
      </div>

      {/* Delete Data on Uninstall Toggle */}
      <div className="tubebay-flex tubebay-items-start tubebay-justify-between">
        <div className="tubebay-flex tubebay-gap-[12px]">
          <div className="tubebay-bg-[#fef3c7] tubebay-p-[8px] tubebay-rounded-[8px] tubebay-h-fit">
            <ShieldAlert size={18} className="tubebay-text-[#d97706]" />
          </div>
          <div className="tubebay-flex tubebay-flex-col tubebay-gap-[4px]">
            <h3 className="tubebay-t-4-bold tubebay-text-color-default">
              Delete Data on Uninstall
            </h3>
            <p className="tubebay-text-[13px] tubebay-leading-[20px] tubebay-text-gray-500 tubebay-max-w-[540px]">
              When enabled, all plugin data (settings, video assignments,
              database tables) will be permanently deleted when you uninstall
              (delete) the plugin.
            </p>
          </div>
        </div>
        <Switch
          checked={!!tmpOtherSettings.advanced_deleteAllOnUninstall}
          onChange={(checked) =>
            setTmpOtherSettings({
              ...tmpOtherSettings,
              advanced_deleteAllOnUninstall: checked,
            })
          }
          className={
            tmpOtherSettings.advanced_deleteAllOnUninstall
              ? "tubebay-bg-[#d97706]"
              : "tubebay-bg-gray-200"
          }
        />
      </div>

      <hr className="tubebay-border-gray-200" />

      {/* Delete All Data Button */}
      <div className="tubebay-flex tubebay-items-start tubebay-justify-between">
        <div className="tubebay-flex tubebay-gap-[12px]">
          <div className="tubebay-bg-[#fee2e2] tubebay-p-[8px] tubebay-rounded-[8px] tubebay-h-fit">
            <Trash2 size={18} className="tubebay-text-[#dc2626]" />
          </div>
          <div className="tubebay-flex tubebay-flex-col tubebay-gap-[4px]">
            <h3 className="tubebay-t-4-bold tubebay-text-color-default">
              Delete All Data
            </h3>
            <p className="tubebay-text-[13px] tubebay-leading-[20px] tubebay-text-gray-500 tubebay-max-w-[540px]">
              Permanently remove all TubeBay data including settings, video
              assignments from products, cached videos, and database tables.
              This action cannot be undone.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="!tubebay-border-red-300 !tubebay-text-red-600 hover:!tubebay-bg-red-50 tubebay-flex-shrink-0"
          onClick={() => setIsDeleteModalOpen(true)}
        >
          <Trash2 size={14} className="tubebay-mr-[6px]" />
          Delete Data
        </Button>
      </div>

      {/* Confirmation Modal */}
      {isDeleteModalOpen && (
        <CustomModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setConfirmText("");
          }}
          title="Delete All TubeBay Data"
          maxWidth="tubebay-max-w-[480px]"
        >
          <div className="tubebay-flex tubebay-flex-col tubebay-gap-[20px] tubebay-py-[8px]">
            {/* Warning */}
            <div className="tubebay-flex tubebay-items-start tubebay-gap-[12px] tubebay-p-[16px] tubebay-bg-[#fef2f2] tubebay-rounded-[10px] tubebay-border tubebay-border-[#fecaca]">
              <AlertTriangle
                size={20}
                className="tubebay-text-[#dc2626] tubebay-flex-shrink-0 tubebay-mt-[2px]"
              />
              <div>
                <p className="tubebay-text-[14px] tubebay-font-semibold tubebay-text-[#991b1b]">
                  This action is irreversible!
                </p>
                <p className="tubebay-text-[13px] tubebay-text-[#b91c1c] tubebay-mt-[4px] tubebay-leading-[20px]">
                  This will permanently delete all settings, YouTube channel
                  connections, video assignments from products, cached data, and
                  database tables. The plugin will be reset to a factory state.
                </p>
              </div>
            </div>

            {/* What will be deleted */}
            <div className="tubebay-text-[13px] tubebay-text-gray-600 tubebay-space-y-[6px]">
              <p className="tubebay-font-semibold tubebay-text-gray-700">
                The following will be deleted:
              </p>
              <ul className="tubebay-list-disc tubebay-pl-[20px] tubebay-space-y-[2px]">
                <li>All plugin settings &amp; API keys</li>
                <li>YouTube channel connection data</li>
                <li>Video assignments from all products</li>
                <li>Cached videos &amp; transient data</li>
                <li>Custom database tables</li>
                <li>Scheduled cron events</li>
              </ul>
            </div>

            {/* Confirmation Input */}
            <div>
              <label className="tubebay-block tubebay-text-[13px] tubebay-font-semibold tubebay-text-gray-700 tubebay-mb-[6px]">
                Type{" "}
                <span className="tubebay-font-bold tubebay-text-[#dc2626]">
                  DELETE
                </span>{" "}
                to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE here"
                className="tubebay-w-full tubebay-px-[12px] tubebay-py-[10px] tubebay-border tubebay-border-gray-300 tubebay-rounded-[8px] tubebay-text-[14px] focus:tubebay-outline-none focus:tubebay-ring-2 focus:tubebay-ring-red-300 focus:tubebay-border-red-300"
              />
            </div>

            {/* Action Buttons */}
            <div className="tubebay-flex tubebay-justify-end tubebay-gap-[12px]">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setConfirmText("");
                }}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                className="!tubebay-bg-[#dc2626] hover:!tubebay-bg-[#b91c1c]"
                onClick={handleDeleteAllData}
                disabled={confirmText !== "DELETE" || isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete All Data"}
              </Button>
            </div>
          </div>
        </CustomModal>
      )}
    </Card>
  );
}
