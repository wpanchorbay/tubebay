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
    if (path === "/logs") return __("Logs", "tubebay-boilerplate");
    if (path === "/option-groups/new")
      return __("New Option Group", "tubebay-boilerplate");
    if (path.startsWith("/option-groups/"))
      return __("Edit Option Group", "tubebay-boilerplate");
    if (path === "/") return __("Option Groups", "tubebay-boilerplate");
    if (path === "/settings") return __("Settings", "tubebay-boilerplate");
    return store.pluginData?.plugin_name || __("WPAB Boilerplate", "tubebay-boilerplate");
  };

  const context = (window as any).wpabBoilerplate_Localize?.context || "admin";

  return (
    <div className="">
      {context !== "settings" && (
        <h1 className="tubebay-ignore-preflight tubebay-font-[600] tubebay-text-[16px] tubebay-p-x-page-default tubebay-bg-white tubebay-m-0 tubebay-py-[18px]">
          {getPageTitle()}
        </h1>
      )}
      <div className="tubebay-mt-2 tubebay-p-x-page-default">
        <Outlet />
      </div>
    </div>
  );
};

export default ClassicLayout;
