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
      label: __("Dashboard", "tubebay-boilerplate"),
      path: "/",
    },
    {
      label: __("Items", "tubebay-boilerplate"),
      path: "/items",
    },
    {
      label: __("Logs", "tubebay-boilerplate"),
      path: "/logs",
    },
  ];

  const isActive = (path: string) => {
    // if (path === "/" && currentPath === "/") return true;
    // if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="tubebay-flex tubebay-items-center tubebay-gap-6 tubebay-border-b tubebay-border-gray-200 tubebay-mb-8 tubebay-ignore-preflight tubebay-p-x-page-default tubebay-bg-white tubebay-overflow-x-auto tubebay-whitespace-nowrap tubebay-scrollbar-hide">
      {menus.map((menu) => (
        <a
          key={menu.path}
          href={`#${menu.path}`}
          className={`
            tubebay-pb-3 tubebay-text-[14px] tubebay-transition-all tubebay-no-underline tubebay-relative focus:tubebay-outline-none
            focus:tubebay-border-t-0 focus:tubebay-border-l-0 focus:tubebay-border-r-0 focus:tubebay-shadow-none
            ${
              isActive(menu.path)
                ? "tubebay-text-gray-900 tubebay-font-bold"
                : "tubebay-text-gray-600 tubebay-font-normal hover:tubebay-text-[#2271b1]"
            }
          `}
          onClick={(e) => {
            e.preventDefault();
            navigate(menu.path);
          }}
        >
          {menu.label}
          {isActive(menu.path) && (
            <div className="tubebay-absolute tubebay-bottom-[-1px] tubebay-left-0 tubebay-w-full tubebay-h-[3px] tubebay-bg-[#2271b1]" />
          )}
        </a>
      ))}
    </nav>
  );
};

export default ClassicNavbar;
