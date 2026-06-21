import { FC } from "react";
import { ClassicSettingsTable, ClassicCheckbox } from "../../classics";
import { PluginSettings } from "../../../utils/types";

interface AdvancedTabProps {
  settings: PluginSettings;
  updateLocalSetting: (key: keyof PluginSettings, value: any) => void;
}

export const AdvancedTab: FC<AdvancedTabProps> = ({ settings, updateLocalSetting }) => {
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
          }
        ]}
      />
    </>
  );
};
