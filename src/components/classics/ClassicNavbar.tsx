import { FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { __ } from "@wordpress/i18n";

interface MenuLink {
  label: string;
  path: string;
}

const ClassicNavbar: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const context = (window as any).wpabBoilerplate_Localize?.context || "options";

  if (context === "settings") {
    return null;
  }

  const menus: MenuLink[] = [
    {
      label: __("Dashboard", "wpab-boilerplate"),
      path: "/",
    },
    {
      label: __("Items", "wpab-boilerplate"),
      path: "/items",
    },
    {
      label: __("Logs", "wpab-boilerplate"),
      path: "/logs",
    },
  ];

  const isActive = (path: string) => {
    // if (path === "/" && currentPath === "/") return true;
    // if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="wpab-flex wpab-items-center wpab-gap-6 wpab-border-b wpab-border-gray-200 wpab-mb-8 wpab-ignore-preflight wpab-p-x-page-default wpab-bg-white wpab-overflow-x-auto wpab-whitespace-nowrap wpab-scrollbar-hide">
      {menus.map((menu) => (
        <a
          key={menu.path}
          href={`#${menu.path}`}
          className={`
            wpab-pb-3 wpab-text-[14px] wpab-transition-all wpab-no-underline wpab-relative focus:wpab-outline-none
            focus:wpab-border-t-0 focus:wpab-border-l-0 focus:wpab-border-r-0 focus:wpab-shadow-none
            ${
              isActive(menu.path)
                ? "wpab-text-gray-900 wpab-font-bold"
                : "wpab-text-gray-600 wpab-font-normal hover:wpab-text-[#2271b1]"
            }
          `}
          onClick={(e) => {
            e.preventDefault();
            navigate(menu.path);
          }}
        >
          {menu.label}
          {isActive(menu.path) && (
            <div className="wpab-absolute wpab-bottom-[-1px] wpab-left-0 wpab-w-full wpab-h-[3px] wpab-bg-[#2271b1]" />
          )}
        </a>
      ))}
    </nav>
  );
};

export default ClassicNavbar;
