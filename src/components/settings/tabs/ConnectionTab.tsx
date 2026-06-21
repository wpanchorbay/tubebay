import { FC, useState } from "react";
import apiFetch from "@wordpress/api-fetch";
import { ClassicSettingsTable, ClassicInput, ClassicButton } from "../../classics";
import { useToast } from "../../../store/toast/use-toast";
import { useYouTubeActions } from "../../../hooks/useYouTubeActions";
import { PluginSettings } from "../../../utils/types";

interface ConnectionTabProps {
  settings: PluginSettings;
  updateLocalSetting: (key: keyof PluginSettings, value: any) => void;
  credentialsChanged: boolean;
  onConnect: (data: any) => void;
}

export const ConnectionTab: FC<ConnectionTabProps> = ({
  settings,
  updateLocalSetting,
  credentialsChanged,
  onConnect
}) => {
  const { addToast } = useToast();
  const { connectYouTube } = useYouTubeActions();

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const isConnected = settings.connection_status === "connected";

  const handleTestConnection = async () => {
    setTesting(true);
    setFeedback(null);
    try {
      const response = await apiFetch<{
        success: boolean;
        message: string;
        channel_name?: string;
      }>({
        path: "/tubebay/v1/youtube/test-connection",
        method: "POST",
        data: {
          api_key: settings.api_key,
          channel_id: settings.channel_id,
          refresh_token: settings.refresh_token,
          connection_method: settings.connection_method,
        },
      });

      if (response.success) {
        setFeedback({
          type: "success",
          message: `Connection test passed! Channel: ${response.channel_name || "Unknown"}. Click "Connect" to save your credentials.`,
        });
        addToast("Connection test passed", "success");
      }
    } catch (error) {
      const msg = (error as any).message || "Could not verify credentials.";
      setFeedback({
        type: "error",
        message: `Test failed: ${msg}`,
      });
      addToast(`Connection Failed: ${msg}`, "error");
    } finally {
      setTesting(false);
    }
  };

  const handleConnect = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const isOAuth = settings.connection_method === "oauth";

      const data = isOAuth
        ? {
            refresh_token: settings.refresh_token,
            connection_method: "oauth",
          }
        : {
            api_key: settings.api_key,
            channel_id: settings.channel_id,
            connection_method: "api",
          };

      const response = await apiFetch<{
        success: boolean;
        message: string;
        data: PluginSettings;
      }>({
        path: "/tubebay/v1/auth/connect",
        method: "POST",
        data,
      });

      if (response.success) {
        onConnect(response.data);
        if (
          response.data.connection_status === "failed" ||
          response.data.connection_status === "disconnected"
        ) {
          setFeedback({
            type: "error",
            message: "Could not verify the connection. Please double-check your credentials.",
          });
        } else {
          setFeedback({
            type: "success",
            message: "Successfully connected! Your YouTube channel is now linked.",
          });
          addToast(response.message, "success");
        }
      }
    } catch (error) {
      const msg = (error as Error).message || "An unknown error occurred.";
      setFeedback({
        type: "error",
        message: `Connection failed: ${msg}`,
      });
      addToast(`Error connecting: ${msg}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const response = await apiFetch<{
        success: boolean;
        message: string;
        data: PluginSettings;
      }>({
        path: "/tubebay/v1/auth/disconnect",
        method: "POST",
      });

      if (response.success) {
        onConnect(response.data);
        setFeedback(null);
        addToast(response.message, "success");
      }
    } catch (error) {
      addToast(`Error disconnecting: ${(error as Error).message}`, "error");
    }
  };

  const fields: any[] = [
    {
      id: "connection_method",
      label: "Connection Method",
      render: () => (
        <>
          <fieldset>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              <input
                type="radio"
                name="connection_method"
                value="oauth"
                checked={settings.connection_method === "oauth"}
                onChange={() => updateLocalSetting("connection_method", "oauth")}
              />
              {' '}OAuth 2.0 (Recommended)
            </label>
            <label style={{ display: 'block' }}>
              <input
                type="radio"
                name="connection_method"
                value="api"
                checked={settings.connection_method === "api"}
                onChange={() => updateLocalSetting("connection_method", "api")}
              />
              {' '}API Key (Legacy)
            </label>
          </fieldset>
          <p className="description" style={{ marginTop: '5px' }}>Choose how to connect to YouTube.</p>
        </>
      ),
    }
  ];

  if (settings.connection_method === "oauth") {
    fields.push({
      id: "oauth_connect",
      label: "OAuth Authentication",
      render: () => (
        <>
          {settings.refresh_token ? (
            <p>
              <strong style={{ color: 'green' }}>Authentication Token Saved.</strong>
              <br />
              You can re-authenticate if needed.
            </p>
          ) : (
            <p>No authentication token found. Please sign in.</p>
          )}
          <ClassicButton
            variant="secondary"
            onClick={connectYouTube}
            style={{ marginTop: '8px' }}
          >
            Sign in with YouTube
          </ClassicButton>

          <div className="notice notice-info inline" style={{ marginTop: '15px', padding: '10px 15px', display: 'block', maxWidth: '600px' }}>
            <p style={{ margin: '0 0 10px 0' }}>
              <strong>Read-only access:</strong> TubeBay only reads your public video data (titles, thumbnails, and IDs) to sync your library. We will never upload, edit, or modify your YouTube channel in any way.
            </p>
            <p style={{ margin: 0 }}>
              <strong>Why does it say "WPAnchorBay"?</strong> TubeBay is developed and published by <a href="https://wpanchorbay.com" target="_blank" rel="noopener noreferrer">WPAnchorBay</a>. You will see this name on the Google authorization screen — this is expected and your connection is fully secure.
            </p>
          </div>
        </>
      )
    });
  } else {
    fields.push(
      {
        id: "api_key",
        label: "YouTube API Key",
        render: () => (
          <>
            <ClassicInput
              id="api_key"
              value={settings.api_key || ""}
              onChange={(e) => updateLocalSetting("api_key", e.target.value)}
              className="regular-text"
            />
            <p className="description">Your Google Cloud Console API Key.</p>
          </>
        )
      },
      {
        id: "channel_id",
        label: "YouTube Channel ID",
        render: () => (
          <>
            <ClassicInput
              id="channel_id"
              value={settings.channel_id || ""}
              onChange={(e) => updateLocalSetting("channel_id", e.target.value)}
              className="regular-text"
            />
            <p className="description">The ID of the YouTube channel to sync from.</p>
          </>
        )
      }
    );
  }

  fields.push({
    id: "actions",
    label: "",
    render: () => (
      <>
        <ClassicButton
          variant="primary"
          onClick={handleConnect}
          disabled={saving}
          style={{ marginRight: '10px' }}
        >
          {saving ? "Saving..." : "Save Connection"}
        </ClassicButton>
        <ClassicButton
          variant="secondary"
          onClick={handleTestConnection}
          disabled={testing}
        >
          {testing ? "Testing..." : "Test Connection"}
        </ClassicButton>
      </>
    )
  });

  return (
    <>
      {feedback && (
        <div className={`notice notice-${feedback.type} inline`} style={{ display: 'block', marginBottom: '20px' }}>
          <p>{feedback.message}</p>
        </div>
      )}

      {isConnected && !credentialsChanged ? (
        <div className="notice notice-success inline" style={{ display: 'block', marginBottom: '20px' }}>
          <p>
            <strong>Connected to YouTube</strong><br />
            Channel: {settings.channel_name || "Unknown"}
          </p>
          <p>
            <ClassicButton variant="secondary" onClick={handleDisconnect}>
              Disconnect
            </ClassicButton>
          </p>
        </div>
      ) : null}

      <ClassicSettingsTable
        title="YouTube Connection"
        description="Connect your YouTube channel to synchronize videos."
        fields={fields}
      />

      <div style={{ marginTop: '30px', paddingTop: '15px', borderTop: '1px solid #c3c4c7', display: 'flex', justifyContent: 'space-between', color: '#646970', fontSize: '13px' }}>
        <div>
          Need Help? <a href="https://wpanchorbay.com/docs/tubebay" target="_blank" rel="noopener noreferrer">Read Documentation</a>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a href="https://wpanchorbay.com/terms-and-conditions/" target="_blank" rel="noopener noreferrer">Terms & Conditions</a>
          <span>|</span>
          <a href="https://wpanchorbay.com/privacy-policy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
        </div>
      </div>
    </>
  );
};
