import { FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import apiFetch from "@wordpress/api-fetch";
import { useToast } from "../store/toast/use-toast";
import { useWpabStore, useWpabStoreActions } from "../store/wpabStore";
import { useYouTubeActions } from "../hooks/useYouTubeActions";
import { PluginSettings } from "../utils/types";
import Button from "../components/common/Button";
import { Stepper } from "../components/common/Stepper";
import ConnectAccountCard, {
  ConnectionFeedback,
} from "../components/settings/ConnectAccountCard";
import PlacementSettingsCard from "../components/settings/PlacementSettingsCard";
import {
  YouTubeFilledIcon,
  LinkIcon,
  RefreshHalfIcon,
  SlidersIcon,
  InfoIcon,
  TargetIcon,
  ShoppingBagIcon,
  BookIcon,
  ArrowRightIcon,
  HeadphonesIcon,
  CheckCircleIcon,
  RefreshIcon,
  FlightIcon,
  SettingsIcon,
} from "../components/common/Icons";

type SettingsData = Partial<PluginSettings>;

const WIZARD_STEPS = ["Connect YouTube", "Configure Settings", "Done"];

const Onboarding: FC = () => {
  const navigate = useNavigate();
  const store = useWpabStore();
  const { plugin_settings: settings } = useWpabStore();
  const { updateStore } = useWpabStoreActions();
  const { connectYouTube } = useYouTubeActions();
  const { addToast } = useToast();

  // Whether the user has clicked "Start Setup Wizard"
  const [wizardStarted, setWizardStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Credential & connection state
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [editingConnection, setEditingConnection] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [connectionFeedback, setConnectionFeedback] =
    useState<ConnectionFeedback | null>(null);

  const [tmpCredentials, setTmpCredentials] = useState({
    api_key: settings.api_key || "",
    channel_id: settings.channel_id || "",
    refresh_token: settings.refresh_token || "",
    connection_method: (settings.connection_method as "oauth" | "api") || "oauth",
  });

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

  const setSettings = (data: SettingsData) => {
    updateStore("plugin_settings", { ...settings, ...data });
  };

  // Auto-advance to step 2 when connection succeeds
  useEffect(() => {
    if (
      wizardStarted &&
      currentStep === 1 &&
      settings.connection_status === "connected"
    ) {
      setCurrentStep(2);
    }
  }, [settings.connection_status, wizardStarted]);

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

  const handleTestConnection = async () => {
    setTesting(true);
    setConnectionFeedback(null);
    try {
      const response = await apiFetch<{
        success: boolean;
        message: string;
        channel_name?: string;
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
      setSyncing(false);
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

  const credentialsChanged = () => {
    return (
      tmpCredentials.api_key !== (settings.api_key || "") ||
      tmpCredentials.channel_id !== (settings.channel_id || "") ||
      tmpCredentials.refresh_token !== (settings.refresh_token || "") ||
      tmpCredentials.connection_method !== (settings.connection_method || "oauth")
    );
  };

  const handleFinish = async () => {
    await handleSaveSettings();
    // Mark onboarding as completed
    try {
      await apiFetch({
        path: "/tubebay/v1/settings",
        method: "POST",
        data: { is_onboarding_completed: true },
      });
      setSettings({ is_onboarding_completed: true });
    } catch (e) {
      // non-blocking
    }
    setCurrentStep(3);
  };

  // ─── Welcome Screen (before wizard starts) ───
  if (!wizardStarted) {
    return (
      <div className="tubebay-py-[32px] tubebay-px-[24px] tubebay-w-full tubebay-flex tubebay-flex-col tubebay-items-center tubebay-gap-[48px]">
        {/* Header Section */}
        <div className="tubebay-text-center">
          <h1 className="tubebay-text-[48px] tubebay-leading-[48px] tubebay-font-bold tubebay-text-[#111827] tubebay-mb-[12px] tubebay-tracking-tight">
            Welcome to TubeBay
          </h1>
          <p className="tubebay-text-[20px] tubebay-leading-[32px] tubebay-text-[#4b5563] tubebay-max-w-[600px] tubebay-mx-auto tubebay-leading-relaxed">
            Connect your YouTube channel once, and seamlessly sync product
            videos across your entire WooCommerce store.
          </p>
        </div>

        {/* Call to Action */}
        <div className="tubebay-bg-white tubebay-rounded-[12px] tubebay-p-[48px] tubebay-border tubebay-border-gray-200 tubebay-shadow-xl tubebay-flex tubebay-flex-col tubebay-items-center tubebay-justify-center tubebay-gap-[16px] tubebay-w-full">
          <h2 className="tubebay-t-1 tubebay-text-[#111827] ">
            Ready to Get Started?
          </h2>
          <p className="tubebay-t-4 tubebay-text-[#4b5563]">
            Set up your YouTube connection in just a few simple steps.
          </p>
          <div className="tubebay-flex tubebay-flex-col tubebay-items-center tubebay-gap-[16px] tubebay-w-full tubebay-max-w-[448px] tubebay-mx-auto tubebay-mt-[16px]">
            <Button
              className="tubebay-w-full !tubebay-py-[16px] !tubebay-px-[32px] !tubebay-text-4 !tubebay-font-bold"
              color="primary"
              onClick={() => setWizardStarted(true)}
            >
              <FlightIcon size={18} className="tubebay-mr-[8px]" />
              Start Setup Wizard
            </Button>

            <div className="tubebay-flex tubebay-items-center tubebay-w-full">
              <div className="tubebay-flex-1 tubebay-h-[1px] tubebay-bg-gray-200"></div>
              <span className="tubebay-px-[16px] tubebay-text-[12px] tubebay-font-bold tubebay-text-gray-400 tubebay-tracking-wider">
                OR
              </span>
              <div className="tubebay-flex-1 tubebay-h-[1px] tubebay-bg-gray-200"></div>
            </div>

            <Button
              variant="outline"
              color="secondary"
              className="!tubebay-w-full !tubebay-py-[16px] !tubebay-px-[32px] !tubebay-text-4 !tubebay-font-bold !tubebay-text-[#374151] !tubebay-border-2 !tubebay-border-[#e5e7eb]"
              onClick={async () => {
                // Mark onboarding as completed when skipping
                try {
                  await apiFetch({
                    path: "/tubebay/v1/settings",
                    method: "POST",
                    data: { is_onboarding_completed: true },
                  });
                  updateStore("plugin_settings", {
                    ...settings,
                    is_onboarding_completed: true,
                  });
                } catch (e) {
                  // silent
                }
                navigate("/settings");
              }}
            >
              <SettingsIcon size={18} className="tubebay-mr-[8px] " />
              Skip Setup & Go to Settings
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="tubebay-grid tubebay-grid-cols-1 md:tubebay-grid-cols-3 tubebay-gap-[24px] ">
          <div className="tubebay-bg-white tubebay-rounded-[16px] tubebay-p-[32px] tubebay-border tubebay-border-gray-200 tubebay-shadow-sm tubebay-flex tubebay-flex-col tubebay-items-start tubebay-justify-start tubebay-gap-[16px]">
            <div className="tubebay-w-[56px] tubebay-h-[56px] tubebay-bg-[#eff6ff] tubebay-rounded-[12px] tubebay-flex tubebay-items-center tubebay-justify-center tubebay-text-primary">
              <LinkIcon size={24} className="!tubebay-stroke-[3.5px]" />
            </div>
            <h3 className="tubebay-t-4-bold tubebay-text-[#111827]">
              One-Time Connection
            </h3>
            <p className="tubebay-text-[14px] tubebay-leading-[22px] tubebay-text-[#4b5563]">
              Connect your YouTube account once and access all your videos
              instantly across products.
            </p>
          </div>

          <div className="tubebay-bg-white tubebay-rounded-[16px] tubebay-p-[32px] tubebay-border tubebay-border-gray-200 tubebay-shadow-sm tubebay-flex tubebay-flex-col tubebay-items-start tubebay-justify-start tubebay-gap-[16px]">
            <div className="tubebay-w-[56px] tubebay-h-[56px] tubebay-bg-[#f0fdf4] tubebay-rounded-[12px] tubebay-flex tubebay-items-center tubebay-justify-center tubebay-text-[#16a34a]">
              <RefreshIcon size={20} className="!tubebay-stroke-[3px]" />
            </div>
            <h3 className="tubebay-t-4-bold tubebay-text-[#111827]">
              Automatic Sync
            </h3>
            <p className="tubebay-text-[14px] tubebay-leading-[22px] tubebay-text-[#4b5563]">
              Keep your product videos up-to-date with automatic daily
              synchronization from YouTube.
            </p>
          </div>

          <div className="tubebay-bg-white tubebay-rounded-[16px] tubebay-p-[32px] tubebay-border tubebay-border-gray-200 tubebay-shadow-sm tubebay-flex tubebay-flex-col tubebay-items-start tubebay-justify-start tubebay-gap-[16px]">
            <div className="tubebay-w-[56px] tubebay-h-[56px] tubebay-bg-[#faf5ff] tubebay-rounded-[12px] tubebay-flex tubebay-items-center tubebay-justify-center tubebay-text-[#9333ea]">
              <SlidersIcon size={20} className="!tubebay-stroke-[2.5px]" />
            </div>
            <h3 className="tubebay-t-4-bold tubebay-text-[#111827]">
              Flexible Placement
            </h3>
            <p className="tubebay-text-[14px] tubebay-leading-[22px] tubebay-text-[#4b5563]">
              Choose where videos appear on your product pages with customizable
              placement options.
            </p>
          </div>
        </div>

        {/* System Requirements */}
        <div className=" tubebay-w-full tubebay-bg-[#eff5ff] tubebay-rounded-[16px] tubebay-border tubebay-border-blue-100 tubebay-p-[24px] tubebay-flex tubebay-gap-[32px]">
          <div className="tubebay-w-[48px] tubebay-h-[48px] tubebay-bg-blue-600 tubebay-rounded-full tubebay-flex tubebay-items-center tubebay-justify-center tubebay-text-white tubebay-shrink-0">
            <InfoIcon size={24} className="!tubebay-stroke-[2.5px]" />
          </div>
          <div className="tubebay-flex tubebay-flex-col tubebay-gap-[8px]">
            <h4 className="tubebay-t-4-bold tubebay-text-color-default ">
              System Requirements
            </h4>
            <p className="tubebay-t-6 tubebay-text-[#374151]">
              TubeBay requires WooCommerce to be installed and activated on your
              WordPress site.
            </p>
            <div className="tubebay-flex tubebay-flex-wrap tubebay-gap-[24px] tubebay-mt-[16px]">
              <span className="tubebay-inline-flex tubebay-items-center tubebay-gap-[8px] tubebay-rounded-[6px] tubebay-t-6 tubebay-text-color-default tubebay-font-medium ">
                <TargetIcon size={14} />
                WordPress 5.8+
              </span>
              <span className="tubebay-inline-flex tubebay-items-center tubebay-gap-[8px] tubebay-rounded-[6px] tubebay-t-6 tubebay-text-color-default tubebay-font-medium ">
                <ShoppingBagIcon size={14} />
                WooCommerce 6.0+
              </span>
              <span className="tubebay-inline-flex tubebay-items-center tubebay-gap-[8px] tubebay-t-6 tubebay-text-color-default tubebay-font-medium ">
                <svg
                  width="23"
                  height="18"
                  viewBox="0 0 23 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.25 3.67382C17.2758 3.67382 21.9094 6.2121 21.9094 8.99999C21.9094 11.7879 17.2723 14.3262 11.25 14.3262C5.22422 14.3262 0.590625 11.7879 0.590625 8.99999C0.590625 6.2121 5.22773 3.67382 11.25 3.67382ZM11.25 3.08319C5.03789 3.08319 0 5.73046 0 8.99999C0 12.2695 5.03789 14.9168 11.25 14.9168C11.25 14.9168 22.5 12.2695 22.5 8.99999C22.5 8.99999 17.4621 3.08319 11.25 3.08319V3.08319ZM7.67109 8.52538C7.39336 9.94921 6.4125 9.80155 5.20664 9.80155L5.68828 7.31952C7.02422 7.31952 7.93125 7.17538 7.67109 8.52538ZM3.42422 12.3152H4.71445L5.02031 10.7402C6.46523 10.7402 7.36172 10.8457 8.19141 10.0687C9.10898 9.22499 9.34805 7.72382 8.69414 6.97147C8.35312 6.57772 7.80469 6.38436 7.05937 6.38436H4.57383L3.42422 12.3152ZM9.95273 4.80585H11.2359L10.9301 6.38085C12.0375 6.38085 13.0641 6.29999 13.5598 6.75702C14.0801 7.23514 13.8305 7.84686 13.268 10.7332H11.9672C12.5086 7.94178 12.6105 7.70975 12.4137 7.49882C12.2238 7.29491 11.7914 7.3371 10.7473 7.3371L10.0863 10.7332H8.80313L9.95273 4.80585ZM17.7539 8.52538C17.4727 9.9703 16.4637 9.80155 15.2895 9.80155L15.7711 7.31952C17.1141 7.31952 18.0141 7.17538 17.7539 8.52538ZM13.507 12.3152H14.8008L15.1066 10.7402C16.6254 10.7402 17.4656 10.8281 18.2777 10.0687C19.1953 9.22499 19.4344 7.72382 18.7805 6.97147C18.4395 6.57772 17.891 6.38436 17.1457 6.38436H14.6602L13.507 12.3152Z"
                    fill="#4F46E5"
                  />
                </svg>
                PHP 7.4+
              </span>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="tubebay-grid tubebay-grid-cols-1 md:tubebay-grid-cols-2 tubebay-gap-[24px] tubebay-w-full">
          <button className="tubebay-bg-white tubebay-rounded-[12px] tubebay-p-[24px] tubebay-border tubebay-border-gray-200 tubebay-shadow-sm hover:tubebay-shadow-md tubebay-transition-all tubebay-flex tubebay-items-start tubebay-gap-[16px] tubebay-text-left tubebay-group">
            <div className="tubebay-w-[40px] tubebay-h-[40px] tubebay-bg-blue-50 tubebay-rounded-[10px] tubebay-flex tubebay-items-center tubebay-justify-center tubebay-text-blue-600">
              <BookIcon
                size={20}
                className="!tubebay-stroke-[2.5px] tubebay-text-[#2563EB]"
              />
            </div>
            <div className="tubebay-flex-1">
              <h4 className="tubebay-t-5 tubebay-text-[#111827]">
                View Documentation
              </h4>
              <p className="tubebay-t-6 tubebay-text-[#4b5563]">
                Learn how to use TubeBay with our comprehensive guides
              </p>
            </div>
            <ArrowRightIcon className="tubebay-text-gray-400 tubebay-transition-transform group-hover:tubebay-translate-x-1" />
          </button>

          <button className="tubebay-bg-white tubebay-rounded-[12px] tubebay-p-[20px] tubebay-border tubebay-border-gray-200 tubebay-shadow-sm hover:tubebay-shadow-md tubebay-transition-all tubebay-flex tubebay-items-start tubebay-gap-[16px] tubebay-text-left tubebay-group">
            <div className="tubebay-w-[40px] tubebay-h-[40px] tubebay-bg-green-50 tubebay-rounded-[10px] tubebay-flex tubebay-items-center tubebay-justify-center tubebay-text-green-600">
              <HeadphonesIcon size={20} className="!tubebay-stroke-[2.5px]" />
            </div>
            <div className="tubebay-flex-1">
              <h4 className="tubebay-t-5 tubebay-text-[#111827]">
                Contact Support
              </h4>
              <p className="tubebay-t-6 tubebay-text-[#4b5563]">
                Need help? Our support team is here to assist you
              </p>
            </div>
            <ArrowRightIcon className="tubebay-text-gray-400 tubebay-transition-transform group-hover:tubebay-translate-x-1" />
          </button>
        </div>
      </div>
    );
  }

  // ─── Wizard Flow ───
  return (
    <div className="tubebay-p-[32px] tubebay-max-w-[760px] tubebay-mx-auto tubebay-w-full">
      {/* Header */}
      <div className="tubebay-text-center tubebay-mb-[16px]">
        <h1 className="tubebay-text-[26px] tubebay-font-bold tubebay-text-gray-900 tubebay-tracking-tight">
          Setup Wizard
        </h1>
        <p className="tubebay-text-[14px] tubebay-text-gray-500">
          Complete these steps to get TubeBay up and running.
        </p>
      </div>

      {/* Stepper */}
      <Stepper
        steps={WIZARD_STEPS}
        currentStep={currentStep}
        setStep={setCurrentStep}
      />

      {/* Step Content */}
      <div className="tubebay-mt-[24px]">
        {/* ─── Step 1: Connect YouTube ─── */}
        {currentStep === 1 && (
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
          />
        )}

        {/* ─── Step 2: Configure Settings ─── */}
        {currentStep === 2 && (
          <>
            <PlacementSettingsCard
              tmpOtherSettings={tmpOtherSettings}
              setTmpOtherSettings={setTmpOtherSettings}
              hideHeader
            />
            <div className="tubebay-flex tubebay-justify-end tubebay-mt-[20px]">
              <Button
                onClick={handleFinish}
                disabled={savingSettings}
                color="primary"
                className="tubebay-h-[44px] tubebay-px-[24px] tubebay-text-[14px] tubebay-font-bold"
              >
                {savingSettings ? "Saving..." : "Save & Finish"}
              </Button>
            </div>
          </>
        )}

        {/* ─── Step 3: Done ─── */}
        {currentStep === 3 && (
          <div className="tubebay-bg-white tubebay-rounded-[12px] tubebay-p-[48px] tubebay-border tubebay-border-gray-200 tubebay-shadow-sm tubebay-text-center">
            <div className="tubebay-inline-flex tubebay-items-center tubebay-justify-center tubebay-w-[64px] tubebay-h-[64px] tubebay-rounded-full tubebay-bg-green-100 tubebay-mb-[20px]">
              <CheckCircleIcon size={32} className="tubebay-text-green-600" />
            </div>
            <h2 className="tubebay-text-[22px] tubebay-font-bold tubebay-text-gray-900 tubebay-mb-[8px]">
              You're All Set!
            </h2>
            <p className="tubebay-text-[15px] tubebay-text-gray-500 tubebay-mb-[28px] tubebay-max-w-[420px] tubebay-mx-auto">
              TubeBay is connected and configured. You can now assign YouTube
              videos to your WooCommerce products.
            </p>
            <Button
              color="primary"
              className="tubebay-h-[44px] tubebay-px-[24px] tubebay-text-[14px] tubebay-font-bold"
              onClick={() => window.location.reload()}
            >
              Go to All Videos
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
