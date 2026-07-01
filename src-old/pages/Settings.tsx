import { useState, useEffect } from "react";
import apiFetch from "@wordpress/api-fetch";
import { useToast } from "../store/toast/use-toast";
import Button from "../components/common/Button";
import Page from "../components/common/Page";
import { useWpabStore, useWpabStoreActions } from "../store/wpabStore";
import { PluginSettings } from "../utils/types";
import { useYouTubeActions } from "../hooks/useYouTubeActions";
import ConnectAccountCard, {
  ConnectionFeedback,
} from "../components/settings/ConnectAccountCard";
import SyncCard from "../components/settings/SyncCard";
import PlacementSettingsCard from "../components/settings/PlacementSettingsCard";
import AdvancedSettingsCard from "../components/settings/AdvancedSettingsCard";
import { ConfirmationModal } from "../components/common/ConfirmationModal";
import Loader from "../components/common/Loader";
import { PageSkeleton } from "../components/loading/PageSkeleton";

type SettingsData = Partial<PluginSettings>;

export default function Settings() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [editingConnection, setEditingConnection] = useState(false);
  const [connectionFeedback, setConnectionFeedback] =
    useState<ConnectionFeedback | null>(null);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const { plugin_settings: settings } = useWpabStore();
  const { updateStore } = useWpabStoreActions();
  const { connectYouTube } = useYouTubeActions();

  const setSettings = (data: SettingsData) => {
    updateStore("plugin_settings", {
      ...settings,
      ...data,
    });
  };

  // Separate temp state for credentials
  const [tmpCredentials, setTmpCredentials] = useState({
    api_key: settings.api_key || "",
    channel_id: settings.channel_id || "",
    refresh_token: settings.refresh_token || "",
    connection_method: settings.connection_status === "connected" 
      ? (settings.connection_method as "oauth" | "api") || "oauth"
      : "oauth",
  });
  console.log(tmpCredentials);

  // Separate temp state for other settings
  const [tmpOtherSettings, setTmpOtherSettings] = useState({
    auto_sync: settings.auto_sync ?? true,
    video_placement: settings.video_placement || "below_gallery",
    cache_duration: settings.cache_duration || 12,
    debug_enableMode: settings.debug_enableMode ?? false,
    muted_autoplay: settings.muted_autoplay ?? true,
    show_controls: settings.show_controls ?? true,
    advanced_deleteAllOnUninstall:
      settings.advanced_deleteAllOnUninstall ?? false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await apiFetch<SettingsData>({
        path: "/tubebay/v1/settings",
      });

      const creds = {
        api_key: response.api_key || "",
        channel_id: response.channel_id || "",
        refresh_token: response.refresh_token || "",
        connection_method: response.connection_status === "connected"
          ? (response.connection_method as "oauth" | "api") || "oauth"
          : "oauth",
      };
      const other = {
        auto_sync: response.auto_sync !== undefined ? response.auto_sync : true,
        video_placement: response.video_placement || "below_gallery",
        cache_duration: response.cache_duration || 12,
        debug_enableMode: response.debug_enableMode ?? false,
        muted_autoplay: response.muted_autoplay ?? true,
        show_controls: response.show_controls ?? true,
        advanced_deleteAllOnUninstall:
          response.advanced_deleteAllOnUninstall ?? false,
      };

      setTmpCredentials(creds);
      setTmpOtherSettings(other);
      setSettings(response);
    } catch (error) {
      addToast(`Error fetching settings: ${(error as Error).message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setSaving(true);
    setConnectionFeedback(null);
    try {
      const isOAuth = tmpCredentials.connection_method === "oauth";

      const data = isOAuth
        ? {
            refresh_token: tmpCredentials.refresh_token,
            connection_method: "oauth",
          }
        : {
            api_key: tmpCredentials.api_key,
            channel_id: tmpCredentials.channel_id,
            connection_method: "api",
          };

      const response = await apiFetch<{
        success: boolean;
        message: string;
        data: SettingsData;
      }>({
        path: "/tubebay/v1/auth/connect",
        method: "POST",
        data,
      });

      if (response.success) {
        setSettings(response.data);
        setTmpCredentials({
          api_key: response.data.api_key || "",
          channel_id: response.data.channel_id || "",
          refresh_token: response.data.refresh_token || "",
          connection_method: (response.data.connection_method as "oauth" | "api") || "oauth",
        });

        // Check if connection actually succeeded
        if (
          response.data.connection_status === "failed" ||
          response.data.connection_status === "disconnected"
        ) {
          setConnectionFeedback({
            type: "error",
            message:
              "Could not verify the connection. Please double-check your credentials.",
          });
        } else {
          setConnectionFeedback({
            type: "success",
            message:
              "Successfully connected! Your YouTube channel is now linked.",
          });
          addToast(response.message, "success");
          setEditingConnection(false);
        }
      }
    } catch (error) {
      const msg = (error as Error).message || "An unknown error occurred.";
      setConnectionFeedback({
        type: "error",
        message: `Connection failed: ${msg}`,
      });
      addToast(`Error connecting: ${msg}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const response = await apiFetch<{
        success: boolean;
        message: string;
        data: SettingsData;
      }>({
        path: "/tubebay/v1/settings",
        method: "POST",
        data: {
          auto_sync: tmpOtherSettings.auto_sync,
          video_placement: tmpOtherSettings.video_placement,
          cache_duration: tmpOtherSettings.cache_duration,
          debug_enableMode: tmpOtherSettings.debug_enableMode,
          muted_autoplay: tmpOtherSettings.muted_autoplay,
          show_controls: tmpOtherSettings.show_controls,
          advanced_deleteAllOnUninstall:
            tmpOtherSettings.advanced_deleteAllOnUninstall,
        },
      });

      if (response.success) {
        addToast(response.message, "success");
        setSettings(response.data);
        setTmpOtherSettings({
          auto_sync: response.data.auto_sync ?? true,
          video_placement: response.data.video_placement || "below_gallery",
          cache_duration: response.data.cache_duration || 12,
          debug_enableMode: response.data.debug_enableMode ?? false,
          muted_autoplay: response.data.muted_autoplay ?? true,
          show_controls: response.data.show_controls ?? true,
          advanced_deleteAllOnUninstall:
            response.data.advanced_deleteAllOnUninstall ?? false,
        });
      }
    } catch (error) {
      addToast(`Error saving settings: ${(error as Error).message}`, "error");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setConnectionFeedback(null);

    try {
      const response = await apiFetch<{
        success: boolean;
        message: string;
        channel_name?: string;
        channel_description?: string;
      }>({
        path: "/tubebay/v1/youtube/test-connection",
        method: "POST",
        data: {
          api_key: tmpCredentials.api_key,
          channel_id: tmpCredentials.channel_id,
          refresh_token: tmpCredentials.refresh_token,
          connection_method: tmpCredentials.connection_method,
        },
      });

      if (response.success) {
        setConnectionFeedback({
          type: "success",
          message: `Connection test passed! Channel: ${
            response.channel_name || "Unknown"
          }. Click "Connect" to save your credentials.`,
        });
        addToast(
          `${response.message} Channel: ${
            response.channel_name || "Unknown"
          }. Click "Connect" to save this connection.`,
          "success",
        );
      }
    } catch (error) {
      const msg = (error as any).message || "Could not verify credentials.";
      setConnectionFeedback({
        type: "error",
        message: `Test failed: ${msg}`,
      });
      addToast(`Connection Failed: ${msg}`, "error");
    } finally {
      setTesting(false);
    }
  };

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
        addToast(
          `Successfully fetched and cached ${response.videos.length} videos.`,
          "success",
        );
      }
    } catch (error) {
      addToast(`Sync Failed: ${(error as any).message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const onConfirmDisconnect = async () => {
    setIsDisconnectModalOpen(false);
    await handleDisconnect();
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const response = await apiFetch<{
        success: boolean;
        message: string;
      }>({
        path: "/tubebay/v1/youtube/disconnect",
        method: "DELETE",
      });

      if (response.success) {
        addToast(response.message, "success");
        window.location.reload();
      }
    } catch (error) {
      addToast(`Error disconnecting: ${(error as Error).message}`, "error");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const credentialsChanged = () => {
    return (
      tmpCredentials.api_key !== (settings.api_key || "") ||
      tmpCredentials.channel_id !== (settings.channel_id || "") ||
      tmpCredentials.refresh_token !== (settings.refresh_token || "") ||
      tmpCredentials.connection_method !== (settings.connection_method || "oauth")
    );
  };

  const otherSettingsChanged = () => {
    return (
      tmpOtherSettings.auto_sync !== (settings.auto_sync ?? true) ||
      tmpOtherSettings.video_placement !==
        (settings.video_placement || "below_gallery") ||
      tmpOtherSettings.cache_duration !== (settings.cache_duration || 12) ||
      tmpOtherSettings.debug_enableMode !==
        (settings.debug_enableMode ?? false) ||
      tmpOtherSettings.muted_autoplay !== (settings.muted_autoplay ?? true) ||
      tmpOtherSettings.show_controls !== (settings.show_controls ?? true) ||
      tmpOtherSettings.advanced_deleteAllOnUninstall !==
        (settings.advanced_deleteAllOnUninstall ?? false)
    );
  };

  if (loading) {
    return (
      <Page>
        <PageSkeleton type="settings" />
      </Page>
    );
  }

  return (
    <Page>
      <div className="">
        <h1 className="tubebay-t-1">TubeBay Settings</h1>
        <p className="tubebay-t-4 tubebay-text-secondary">
          Connect your YouTube channel once, sync everywhere.
        </p>
      </div>

      {/* Connect Account Card */}
      <ConnectAccountCard
        settings={settings}
        tmpCredentials={tmpCredentials}
        setTmpCredentials={setTmpCredentials}
        editingConnection={editingConnection}
        setEditingConnection={setEditingConnection}
        saving={saving}
        testing={testing}
        handleConnect={handleConnect}
        handleTestConnection={handleTestConnection}
        credentialsChanged={credentialsChanged}
        connectYouTube={connectYouTube}
        feedback={connectionFeedback}
        setFeedback={setConnectionFeedback}
        handleDisconnect={() => setIsDisconnectModalOpen(true)}
      />

      {/* Placement & Player Settings Card */}
      <PlacementSettingsCard
        tmpOtherSettings={tmpOtherSettings}
        setTmpOtherSettings={setTmpOtherSettings}
      />
      {/* Sync Settings Card */}
      <SyncCard
        settings={settings}
        tmpOtherSettings={tmpOtherSettings}
        setTmpOtherSettings={setTmpOtherSettings}
        syncing={syncing}
        handleSyncLibrary={handleSyncLibrary}
      />

      {/* Advanced Settings Card */}
      <AdvancedSettingsCard
        tmpOtherSettings={tmpOtherSettings}
        setTmpOtherSettings={setTmpOtherSettings}
      />

      {/* Save Settings Button */}
      <div className="tubebay-flex tubebay-justify-end tubebay-mt-[16px]">
        <Button
          onClick={handleSaveSettings}
          disabled={savingSettings || !otherSettingsChanged()}
          color="primary"
        >
          {savingSettings ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {isDisconnecting && (
        <div className="tubebay-fixed tubebay-inset-0 tubebay-z-[99999] tubebay-flex tubebay-items-center tubebay-justify-center tubebay-bg-black/60 tubebay-backdrop-blur-[2px]">
          <div className="tubebay-flex tubebay-flex-col tubebay-items-center tubebay-gap-4">
            <Loader />
            <span className="tubebay-text-white tubebay-font-bold tubebay-text-[18px]">
              Disconnecting...
            </span>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={isDisconnectModalOpen}
        title="Disconnect Account?"
        message="Are you sure you want to disconnect your YouTube account? This will clear all connection credentials."
        confirmLabel="Disconnect Now"
        cancelLabel="Keep Connected"
        onConfirm={onConfirmDisconnect}
        onCancel={() => setIsDisconnectModalOpen(false)}
        classNames={{
          button: {
            confirmColor: "danger" as any,
          },
        }}
      />
    </Page>
  );
}
