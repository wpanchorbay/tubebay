import { FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiFetch from "@wordpress/api-fetch";
import { useWpabStore, useWpabStoreActions } from "../store/wpabStore";
import { PluginSettings } from "../utils/types";
import { ClassicButton } from "../components/classics";
import { ConnectionTab } from "../components/settings/tabs/ConnectionTab";
import { PlayerTab } from "../components/settings/tabs/PlayerTab";

const WIZARD_STEPS = ["Connect YouTube", "Configure Settings", "Done"];

export default function Onboarding() {
  const navigate = useNavigate();
  const { plugin_settings } = useWpabStore();
  const { updateStore } = useWpabStoreActions();

  const [wizardStarted, setWizardStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Settings State for Wizard
  const [settings, setSettings] = useState<PluginSettings>(plugin_settings || {} as PluginSettings);

  const updateLocalSetting = (key: keyof PluginSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const isConnected = settings.connection_status === "connected";

  // Auto-advance to step 2 when connection succeeds
  useEffect(() => {
    if (wizardStarted && currentStep === 1 && isConnected) {
      setCurrentStep(2);
    }
  }, [isConnected, wizardStarted, currentStep]);

  const handleFinish = async () => {
    try {
      // Save Player settings
      await apiFetch({
        path: "/tubebay/v1/settings",
        method: "POST",
        data: {
          video_placement: settings.video_placement,
          muted_autoplay: settings.muted_autoplay,
          show_controls: settings.show_controls,
          is_onboarding_completed: true
        },
      });
      updateStore("plugin_settings", { ...settings, is_onboarding_completed: true });
    } catch (e) {
      // non-blocking
    }
    setCurrentStep(3);
  };

  const handleSkip = async () => {
    try {
      await apiFetch({
        path: "/tubebay/v1/settings",
        method: "POST",
        data: { is_onboarding_completed: true },
      });
      updateStore("plugin_settings", { ...settings, is_onboarding_completed: true });
    } catch (e) {
      // silent
    }
    window.location.hash = "/";
  };

  if (!wizardStarted) {
    return (
      <div className="wrap">
        <h2>Welcome to TubeBay</h2>
        <div className="postbox" style={{ maxWidth: '600px', marginTop: '20px' }}>
          <div className="inside">
            <h3>Ready to Get Started?</h3>
            <p>Connect your YouTube channel once, and seamlessly sync product videos across your entire WooCommerce store.</p>
            <p>
              <ClassicButton variant="primary" onClick={() => setWizardStarted(true)}>
                Start Setup Wizard
              </ClassicButton>
              <ClassicButton variant="secondary" onClick={handleSkip} style={{ marginLeft: '10px' }}>
                Skip Setup
              </ClassicButton>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <h2>TubeBay Setup Wizard</h2>
      
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', padding: '10px 0' }}>
        {WIZARD_STEPS.map((step, index) => {
          const stepNum = index + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;
          return (
            <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '15px', 
                backgroundColor: isActive || isCompleted ? '#2271b1' : '#f0f0f1',
                color: isActive || isCompleted ? '#fff' : '#3c434a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', border: isActive || isCompleted ? 'none' : '1px solid #8c8f94'
              }}>
                {stepNum}
              </div>
              <span style={{ marginLeft: '10px', fontWeight: isActive ? 'bold' : 'normal', color: isActive || isCompleted ? '#1d2327' : '#8c8f94' }}>
                {step}
              </span>
              {index < WIZARD_STEPS.length - 1 && (
                <div style={{ width: '40px', height: '2px', backgroundColor: '#dcdcde', margin: '0 15px' }} />
              )}
            </div>
          );
        })}
      </div>

      <div className="postbox" style={{ maxWidth: '800px' }}>
        <div className="inside">
          {currentStep === 1 && (
            <ConnectionTab 
              settings={settings} 
              updateLocalSetting={updateLocalSetting} 
              credentialsChanged={
                settings.api_key !== plugin_settings?.api_key ||
                settings.channel_id !== plugin_settings?.channel_id ||
                settings.refresh_token !== plugin_settings?.refresh_token ||
                settings.connection_method !== plugin_settings?.connection_method
              }
              onConnect={(newData) => {
                const newSettings = { ...settings, ...newData };
                setSettings(newSettings);
                updateStore("plugin_settings", newSettings);
              }}
            />
          )}

          {currentStep === 2 && (
            <>
              <PlayerTab settings={settings} updateLocalSetting={updateLocalSetting} />
              <p style={{ marginTop: '20px' }}>
                <ClassicButton variant="primary" onClick={handleFinish}>
                  Save & Continue
                </ClassicButton>
              </p>
            </>
          )}

          {currentStep === 3 && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <h3>You're All Set!</h3>
              <p>TubeBay is connected and configured. You can now assign YouTube videos to your WooCommerce products.</p>
              <p>
                <ClassicButton variant="primary" onClick={() => { window.location.hash = "/"; }}>
                  Go to Channel Library
                </ClassicButton>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
