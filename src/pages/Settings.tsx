import React, { useState, useEffect } from "react";
import {
  ClassicSettingsTable,
  ClassicInput,
  ClassicSelect,
  ClassicCheckbox,
} from "../components/classics";
import { useToast } from "../store/toast/use-toast";
import { __ } from "@wordpress/i18n";
import { SkeletonSettings } from "../components/loading/SkeletonSettings";
import { TopProgressBar } from "../components/loading/TopProgressBar";
import apiFetch from "../utils/apiFetch";

interface SettingsData {
  general_isEnabled: boolean;
  general_apiToken: string;
  appearance_primaryColor: string;
  appearance_customCss: string;
  advanced_deleteAllOnUninstall: boolean;
  debug_enableMode: boolean;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [originalSettings, setOriginalSettings] = useState<SettingsData | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  // Hijack the native WooCommerce save button
  useEffect(() => {
    const form = document.getElementById("mainform") as HTMLFormElement;
    if (!form) return;

    const onFormSubmit = (e: Event) => {
      e.preventDefault();
      // Only trigger if we have changes or if we want to allow "force save"
      handleSave();
    };

    form.addEventListener("submit", onFormSubmit);
    return () => form.removeEventListener("submit", onFormSubmit);
  }, [settings, originalSettings]); // Re-attach when state changes to capture fresh values in closure

  const fetchSettings = async () => {
    try {
      const response: any = await apiFetch({
        path: "settings",
      });
      if (response.success) {
        setSettings(response.data);
        setOriginalSettings(response.data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      addToast(__("Failed to load settings.", "wpab-boilerplate"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const response: any = await apiFetch({
        path: "settings",
        method: "POST",
        data: settings,
      });
      if (response.success) {
        setSettings(response.data);
        setOriginalSettings(response.data);
        addToast(
          __("Settings saved successfully.", "wpab-boilerplate"),
          "success",
        );

        // Prevent WooCommerce "Unsaved Changes" dialog
        const nativeSaveButton = document.querySelector('button[name="save"]');
        if (nativeSaveButton) {
          (nativeSaveButton as HTMLButtonElement).disabled = true;
        }
        window.onbeforeunload = null;
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      addToast(__("Failed to save settings.", "wpab-boilerplate"), "error");
    } finally {
      setIsSaving(false);
      // Remove "is-busy" class from native WooCommerce button
      const nativeSaveButton = document.querySelector('button[name="save"]');
      if (nativeSaveButton) {
        nativeSaveButton.classList.remove("is-busy");
      }
    }
  };

  const hasChanges =
    JSON.stringify(settings) !== JSON.stringify(originalSettings);

  // Synchronize the native WooCommerce save button state
  useEffect(() => {
    const nativeSaveButton = document.querySelector('button[name="save"]');
    if (nativeSaveButton) {
      (nativeSaveButton as HTMLButtonElement).disabled = !hasChanges;
    }
  }, [hasChanges]);

  if (isLoading) {
    return (
      <div className="wpab-p-page-default">
        <SkeletonSettings />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="wpab-p-page-default">
        <p>{__("Failed to load settings.", "wpab-boilerplate")}</p>
      </div>
    );
  }

  return (
    <div className="wpab-p-page-default wpab-ignore-preflight">
      <input
        type="hidden"
        name="wpab-boilerplate_has_changes"
        value={hasChanges ? "1" : "0"}
      />
      <TopProgressBar isSaving={isSaving} />

      <ClassicSettingsTable
        title={__("General Settings", "wpab-boilerplate")}
        description={__(
          "Core settings and global configuration for your plugin.",
          "wpab-boilerplate",
        )}
        fields={[
          {
            id: "general_isEnabled",
            label: __("Enable Plugin", "wpab-boilerplate"),
            render: () => (
              <ClassicCheckbox
                checked={settings.general_isEnabled}
                onChange={(val) =>
                  setSettings({ ...settings, general_isEnabled: val })
                }
                label={__("Enable main plugin features", "wpab-boilerplate")}
                description={__(
                  "Toggle the core functionality of the plugin on or off globally.",
                  "wpab-boilerplate",
                )}
              />
            ),
          },
          {
            id: "general_apiToken",
            label: __("API Token", "wpab-boilerplate"),
            tooltip: __("Your integration token.", "wpab-boilerplate"),
            render: () => (
              <div className="wpab-max-w-[400px]">
                <ClassicInput
                  value={settings.general_apiToken}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general_apiToken: e.target.value,
                    })
                  }
                  description={__(
                    "Enter your API key or token if this plugin integrates with a third-party service.",
                    "wpab-boilerplate",
                  )}
                  size="regular"
                />
              </div>
            ),
          },
        ]}
      />

      <ClassicSettingsTable
        title={__("Appearance Settings", "wpab-boilerplate")}
        description={__(
          "Customize the visual output of the plugin.",
          "wpab-boilerplate",
        )}
        fields={[
          {
            id: "appearance_primaryColor",
            label: __("Primary Color", "wpab-boilerplate"),
            tooltip: __("Used for buttons and highlights.", "wpab-boilerplate"),
            render: () => (
              <ClassicInput
                type="color"
                value={settings.appearance_primaryColor}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    appearance_primaryColor: e.target.value,
                  })
                }
                description={__(
                  "Select a primary color to match your brand.",
                  "wpab-boilerplate",
                )}
                size="regular"
              />
            ),
          },
          {
            id: "appearance_customCss",
            label: __("Custom CSS", "wpab-boilerplate"),
            tooltip: __("Add custom CSS rules.", "wpab-boilerplate"),
            render: () => (
              <div>
                <textarea
                  className="wpab-w-full wpab-max-w-[600px] wpab-p-2 wpab-border wpab-border-gray-400 wpab-rounded focus:wpab-border-blue-500 focus:wpab-ring-1 focus:wpab-ring-blue-500"
                  value={settings.appearance_customCss}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      appearance_customCss: e.target.value,
                    })
                  }
                  rows={5}
                  placeholder=".my-custom-class { color: red; }"
                />
                <p className="wpab-text-[13px] wpab-text-gray-500 wpab-mt-1">
                  {__(
                    "Add your own CSS overrides here. Do not include <style> tags.",
                    "wpab-boilerplate",
                  )}
                </p>
              </div>
            ),
          },
        ]}
      />

      <ClassicSettingsTable
        title={__("System & Maintenance", "wpab-boilerplate")}
        description={__(
          "Advanced configurations for data persistence and troubleshooting.",
          "wpab-boilerplate",
        )}
        fields={[
          {
            id: "debug_enableMode",
            label: __("Debug Mode", "wpab-boilerplate"),
            render: () => (
              <ClassicCheckbox
                checked={settings.debug_enableMode}
                onChange={(val) =>
                  setSettings({ ...settings, debug_enableMode: val })
                }
                label={__("Enable developer logging", "wpab-boilerplate")}
                description={__(
                  "Detailed logs will be written to the database for troubleshooting.",
                  "wpab-boilerplate",
                )}
              />
            ),
          },
          {
            id: "advanced_deleteAllOnUninstall",
            label: __("Delete Data on Uninstall", "wpab-boilerplate"),
            render: () => (
              <ClassicCheckbox
                checked={settings.advanced_deleteAllOnUninstall}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    advanced_deleteAllOnUninstall: val,
                  })
                }
                label={__("Purge data on plugin deletion", "wpab-boilerplate")}
                description={__(
                  "CAUTION: If enabled, all plugin data and settings will be permanently deleted when the plugin is uninstalled.",
                  "wpab-boilerplate",
                )}
              />
            ),
          },
        ]}
      />

      <div className="wpab-mt-8">
        {/* Native WooCommerce save button is used instead */}
      </div>
    </div>
  );
};

export default Settings;
