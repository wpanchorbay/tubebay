import Dashboard from "./pages/Dashboard";
import { HashRouter, Routes, Route } from "react-router-dom";
import { WpabProvider } from "./store/wpabStore";
import { ToastProvider } from "./store/toast/use-toast";
import ClassicShowcase from "./pages/ClassicShowcase";
import ItemsList from "./pages/ItemsList";
import { ToastContainer } from "./components/common/ToastContainer";
import { useMenuSync } from "./utils/useMenuSync";
import { ClassicLayout } from "./components/classics";

function AdminApp() {
  return (
    <WpabProvider>
      <ToastProvider>
        <ToastContainer />
        <HashRouter>
          <MenuSyncProvider>
            <Routes>
              {/* 
                BOILERPLATE NOTE: 
                - Use <ClassicLayout /> for native WordPress/WooCommerce aesthetics.
                - Use <AppLayout /> (from components/common) for modern, custom dashboard aesthetics.
              */}
              <Route element={<ClassicLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="items" element={<ItemsList />} />
                <Route
                  path="components-classic"
                  element={<ClassicShowcase />}
                />
              </Route>
            </Routes>
          </MenuSyncProvider>
        </HashRouter>
      </ToastProvider>
    </WpabProvider>
  );
}

const MenuSyncProvider = ({ children }: { children: React.ReactNode }) => {
  useMenuSync();
  return <>{children}</>;
};

export default AdminApp;
