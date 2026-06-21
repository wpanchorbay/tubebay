import { HashRouter, Routes, Route } from "react-router-dom";
import { WpabProvider, useWpabStore } from "./store/wpabStore";
import { ToastProvider } from "./store/toast/use-toast";
import { ToastContainer } from "./components/common/ToastContainer";
import { useMenuSync } from "./utils/useMenuSync";

import ChannelLibrary from "./pages/ChannelLibrary";
import Onboarding from "./pages/Onboarding";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

function AdminApp() {
  return (
    <WpabProvider>
      <ToastProvider>
        <ToastContainer />
        <HashRouter>
          <MenuSyncProvider>
            <Routes>
              <Route path="/" element={<OnboardingCheck><ChannelLibrary /></OnboardingCheck>} />
              <Route path="/onboarding" element={<Onboarding />} />
            </Routes>
          </MenuSyncProvider>
        </HashRouter>
      </ToastProvider>
    </WpabProvider>
  );
}

const OnboardingCheck = ({ children }: { children: React.ReactNode }) => {
  const store = useWpabStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!store.plugin_settings?.is_onboarding_completed && location.pathname !== "/onboarding") {
      navigate("/onboarding");
    }
  }, [store.plugin_settings?.is_onboarding_completed, location.pathname, navigate]);

  if (!store.plugin_settings?.is_onboarding_completed) {
    return null;
  }

  return <>{children}</>;
};

const MenuSyncProvider = ({ children }: { children: React.ReactNode }) => {
  useMenuSync();
  return <>{children}</>;
};

export default AdminApp;
