import Onboarding from "./pages/Onboarding";
import Settings from "./pages/Settings";
import ChannelLibrary from "./pages/ChannelLibrary";
import { HashRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./components/common/AppLayout";
import { WpabProvider } from "./store/wpabStore";
import { ToastProvider } from "./store/toast/use-toast";
import Logs from "./pages/Logs";
import { ToastContainer } from "./components/common/ToastContainer";
import { useMenuSync } from "./utils/useMenuSync";

function App() {
  return (
    <WpabProvider>
      <ToastProvider>
        <ToastContainer />
        <HashRouter>
          <MenuSyncProvider>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<ChannelLibrary />} />
                <Route path="onboarding" element={<Onboarding />} />
                <Route path="logs" element={<Logs />} />
                <Route path="settings" element={<Settings />} />
                <Route path="library" element={<ChannelLibrary />} />
                {/* Add your routes here */}
              </Route>
            </Routes>
          </MenuSyncProvider>
        </HashRouter>
      </ToastProvider>
    </WpabProvider>
  );
}

export default App;
const MenuSyncProvider = ({ children }: { children: React.ReactNode }) => {
  useMenuSync();
  return <>{children}</>;
};
