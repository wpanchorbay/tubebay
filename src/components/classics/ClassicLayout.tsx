import { FC, ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { __ } from "@wordpress/i18n";
import { useWpabStore } from "../../store/wpabStore";

const ClassicLayout: FC = () => {
  const store = useWpabStore();
  const location = useLocation();

  // Determine page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/logs") return __("Logs", "wpab-boilerplate");
    if (path === "/option-groups/new")
      return __("New Option Group", "wpab-boilerplate");
    if (path.startsWith("/option-groups/"))
      return __("Edit Option Group", "wpab-boilerplate");
    if (path === "/") return __("Option Groups", "wpab-boilerplate");
    if (path === "/settings") return __("Settings", "wpab-boilerplate");
    return store.pluginData?.plugin_name || __("WPAB Boilerplate", "wpab-boilerplate");
  };

  const context = (window as any).wpabBoilerplate_Localize?.context || "admin";

  return (
    <div className="">
      {context !== "settings" && (
        <h1 className="wpab-ignore-preflight wpab-font-[600] wpab-text-[16px] wpab-p-x-page-default wpab-bg-white wpab-m-0 wpab-py-[18px]">
          {getPageTitle()}
        </h1>
      )}
      <div className="wpab-mt-2 wpab-p-x-page-default">
        <Outlet />
      </div>
    </div>
  );
};

export default ClassicLayout;
