import React, { useState, useEffect } from "react";
import apiFetch from "@wordpress/api-fetch";
import { useWpabStore, useWpabStoreActions } from "../store/wpabStore";
import { PluginSettings } from "../utils/types";
import { ConfirmationModal } from "../components/common/ConfirmationModal";
import { useToast } from "../store/toast/use-toast";

// Tabs
import { ConnectionTab } from "../components/settings/tabs/ConnectionTab";
import { PlayerTab } from "../components/settings/tabs/PlayerTab";
import { SyncTab } from "../components/settings/tabs/SyncTab";
import { AdvancedTab } from "../components/settings/tabs/AdvancedTab";

export default function Settings() {
  const { addToast } = useToast();
  const { plugin_settings } = useWpabStore();
  const { updateStore } = useWpabStoreActions();

  const [settings, setSettings] = useState<PluginSettings | null>(null);
  const [originalSettings, setOriginalSettings] = useState<PluginSettings | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("connection");
  
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
    // Force disable the native save button on mount
    const nativeSaveButton = document.querySelector('button[name="save"]');
    if (nativeSaveButton) {
      (nativeSaveButton as HTMLButtonElement).disabled = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hijack the native WooCommerce save button
  useEffect(() => {
    const form = document.getElementById("mainform") as HTMLFormElement;
    if (!form) return;

    const onFormSubmit = (e: Event) => {
      e.preventDefault();
      handleSave();
    };

    form.addEventListener("submit", onFormSubmit);
    return () => form.removeEventListener("submit", onFormSubmit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, originalSettings]);

  const fetchSettings = async () => {
    try {
      const response: any = await apiFetch({
        path: "/tubebay/v1/settings",
      });
      // Fallbacks
      const data = {
        ...response,
        connection_method: response.connection_status === "connected" ? (response.connection_method || "oauth") : "oauth",
        auto_sync: response.auto_sync ?? true,
        video_placement: response.video_placement || "below_gallery",
        cache_duration: response.cache_duration || 12,
        debug_enableMode: response.debug_enableMode ?? false,
        muted_autoplay: response.muted_autoplay ?? true,
        show_controls: response.show_controls ?? true,
        advanced_deleteAllOnUninstall: response.advanced_deleteAllOnUninstall ?? false,
      };

      setSettings(data);
      setOriginalSettings(JSON.parse(JSON.stringify(data)));
    } catch (error) {
      addToast(`Failed to load settings: ${(error as Error).message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const updateLocalSetting = (key: keyof PluginSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const response: any = await apiFetch({
        path: "/tubebay/v1/settings",
        method: "POST",
        data: settings,
      });
      
      if (response.success) {
        setSettings({ ...response.data });
        setOriginalSettings(JSON.parse(JSON.stringify(response.data)));
        updateStore("plugin_settings", response.data);
        addToast("Settings saved successfully.", "success");

        const nativeSaveButton = document.querySelector('button[name="save"]');
        if (nativeSaveButton) {
          (nativeSaveButton as HTMLButtonElement).disabled = true;
        }
        window.onbeforeunload = null;
      }
    } catch (error) {
      addToast(`Failed to save settings: ${(error as Error).message}`, "error");
    } finally {
      setIsSaving(false);
      const nativeSaveButton = document.querySelector('button[name="save"]');
      if (nativeSaveButton) {
        nativeSaveButton.classList.remove("is-busy");
      }
    }
  };

  const hasChanges =
    settings && originalSettings
      ? JSON.stringify(settings) !== JSON.stringify(originalSettings)
      : false;

  useEffect(() => {
    const timer = setTimeout(() => {
      const nativeSaveButton = document.querySelector('button[name="save"]');
      if (nativeSaveButton) {
        (nativeSaveButton as HTMLButtonElement).disabled = !hasChanges;
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [hasChanges, activeTab]);

  const handleTabChange = (tabId: string) => {
    if (tabId === activeTab) return;

    if (hasChanges) {
      setPendingTab(tabId);
      setShowUnsavedModal(true);
    } else {
      setActiveTab(tabId);
      setTimeout(() => {
        const nativeSaveButton = document.querySelector('button[name="save"]');
        if (nativeSaveButton) {
          (nativeSaveButton as HTMLButtonElement).disabled = true;
        }
      }, 100);
    }
  };

  const handleConfirmSave = async () => {
    setShowUnsavedModal(false);
    await handleSave();
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
  };

  if (isLoading || !settings) {
    return <p>Loading settings...</p>;
  }

  const tabs = [
    { id: "connection", label: "Connection" },
    { id: "player", label: "Video Player" },
    { id: "sync", label: "Synchronization" },
    { id: "advanced", label: "Advanced" },
  ];

  return (
    <div className="tubebay-settings-container" style={{ maxWidth: '800px' }}>
      <input
        type="hidden"
        name="tubebay_has_changes"
        value={hasChanges ? "1" : "0"}
      />

      {isSaving && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '3px', backgroundColor: '#2271b1', zIndex: 99999, transition: 'all 0.3s' }}></div>
      )}

      {/* Sub-navigation */}
      <ul className="subsubsub" style={{ float: 'none', marginBottom: '20px' }}>
        {tabs.map((tab, index) => (
          <li key={tab.id}>
            <button
              type="button"
              onClick={() => handleTabChange(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: activeTab === tab.id ? '#000' : '#2271b1',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
            {index < tabs.length - 1 && <span style={{ margin: '0 5px', color: '#c3c4c7' }}>|</span>}
          </li>
        ))}
      </ul>
      <div className="clear"></div>

      <div className="tubebay-tab-content" style={{ marginTop: '20px' }}>
        {activeTab === "connection" && (
          <ConnectionTab 
            settings={settings} 
            updateLocalSetting={updateLocalSetting} 
            credentialsChanged={
              settings.api_key !== originalSettings?.api_key ||
              settings.channel_id !== originalSettings?.channel_id ||
              settings.refresh_token !== originalSettings?.refresh_token ||
              settings.connection_method !== originalSettings?.connection_method
            }
            onConnect={(newData) => {
              const newSettings = { ...settings, ...newData };
              setSettings(newSettings);
              setOriginalSettings(JSON.parse(JSON.stringify(newSettings)));
              updateStore("plugin_settings", newSettings);
            }}
          />
        )}

        {activeTab === "player" && (
          <PlayerTab settings={settings} updateLocalSetting={updateLocalSetting} />
        )}

        {activeTab === "sync" && (
          <SyncTab 
            settings={settings} 
            updateLocalSetting={updateLocalSetting}
            onSyncComplete={(response) => {
              const newSettings = { ...settings };
              if (response.last_sync_time) newSettings.last_sync_time = Number(response.last_sync_time);
              if (response.channel_name) newSettings.channel_name = response.channel_name;
              if (response.thumbnails_default) newSettings.thumbnails_default = response.thumbnails_default;
              if (response.thumbnails_medium) newSettings.thumbnails_medium = response.thumbnails_medium;
              
              setSettings(newSettings);
              setOriginalSettings(JSON.parse(JSON.stringify(newSettings)));
              updateStore("plugin_settings", newSettings);
            }} 
          />
        )}

        {activeTab === "advanced" && (
          <AdvancedTab settings={settings} updateLocalSetting={updateLocalSetting} />
        )}
      </div>

      <ConfirmationModal
        isOpen={showUnsavedModal}
        title="Unsaved Changes"
        message="You have unsaved changes. Would you like to save them before switching tabs?"
        confirmLabel="Save Changes"
        cancelLabel="Discard"
        onConfirm={handleConfirmSave}
        onCancel={() => {
          if (pendingTab) {
            setSettings(JSON.parse(JSON.stringify(originalSettings)));
            setActiveTab(pendingTab);
            setPendingTab(null);
          }
          setShowUnsavedModal(false);
        }}
      />
    </div>
  );
}
