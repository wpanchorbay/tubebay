import { FC, useState } from "react";
import { ClassicSettingsTable, ClassicCheckbox, ClassicButton } from "../../classics";
import { PluginSettings } from "../../../utils/types";
import apiFetch from "@wordpress/api-fetch";
import CustomModal from "../../common/CustomModal";
import { useToast } from "../../../store/toast/use-toast";
import { useWpabStoreActions } from "../../../store/wpabStore";
import { Trash2, AlertTriangle } from "lucide-react";

interface AdvancedTabProps {
  settings: PluginSettings;
  updateLocalSetting: (key: keyof PluginSettings, value: any) => void;
}

export const AdvancedTab: FC<AdvancedTabProps> = ({ settings, updateLocalSetting }) => {
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

      if (response.success) {
        addToast(response.message, "success");
        updateStore("plugin_settings", response.data);
        window.location.reload();
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
    <>
      <ClassicSettingsTable
        title="Advanced Settings"
        description="System configuration and troubleshooting options."
        fields={[
          {
            id: "debug_enableMode",
            label: "Debug Mode",
            render: () => (
              <>
                <ClassicCheckbox
                  id="debug_enableMode"
                  checked={settings.debug_enableMode ?? false}
                  onChange={(checked) => updateLocalSetting("debug_enableMode", checked)}
                  label="Enable debug logging"
                />
                <p className="description">Logs detailed API errors and events to standard WordPress debug logs for troubleshooting.</p>
              </>
            ),
          },
          {
            id: "advanced_deleteAllOnUninstall",
            label: "Clean Uninstall",
            render: () => (
              <>
                <ClassicCheckbox
                  id="advanced_deleteAllOnUninstall"
                  checked={settings.advanced_deleteAllOnUninstall ?? false}
                  onChange={(checked) => updateLocalSetting("advanced_deleteAllOnUninstall", checked)}
                  label="Delete all plugin data upon uninstallation"
                />
                <p className="description" style={{ color: "#d63638" }}>
                  <strong>Warning:</strong> If checked, all TubeBay settings, cached videos, and product assignments will be permanently deleted when the plugin is uninstalled.
                </p>
              </>
            ),
          },
          {
            id: "delete_all_data",
            label: "Delete All Data",
            render: () => (
              <>
                <ClassicButton
                  variant="secondary"
                  onClick={() => setIsDeleteModalOpen(true)}
                  style={{ color: "#d63638", borderColor: "#d63638" }}
                >
                  <Trash2 size={14} style={{ marginRight: '6px' }} />
                  Delete Data
                </ClassicButton>
                <p className="description" style={{ marginTop: '5px' }}>
                  Permanently remove all TubeBay data including settings, video assignments from products, cached videos, and database tables. This action cannot be undone.
                </p>
              </>
            ),
          }
        ]}
      />

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
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid #c3c4c7',
                  borderRadius: '4px',
                  fontSize: '13px',
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="tubebay-flex tubebay-justify-end tubebay-gap-[12px]">
              <ClassicButton
                variant="secondary"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setConfirmText("");
                }}
              >
                Cancel
              </ClassicButton>
              <ClassicButton
                variant="primary"
                className="!tubebay-bg-[#dc2626] hover:!tubebay-bg-[#b91c1c] !tubebay-border-[#dc2626]"
                onClick={handleDeleteAllData}
                disabled={confirmText !== "DELETE" || isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete All Data"}
              </ClassicButton>
            </div>
          </div>
        </CustomModal>
      )}
    </>
  );
};
