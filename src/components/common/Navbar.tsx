import { useState, useEffect, FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { __ } from "@wordpress/i18n";
import { useWpabStore } from "../../store/wpabStore";

interface MenuLink {
  label: string;
  path: string;
}

const Navbar: FC = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const store = useWpabStore();

  const menus: MenuLink[] = [
    {
      label: __("Dashboard", "tubebay-boilerplate"),
      path: "/",
    },
    // Add your menu items here
    {
      label: __("Logs", "tubebay-boilerplate"),
      path: "/logs",
    },
    {
      label: __("Components", "tubebay-boilerplate"),
      path: "/components",
    },
    {
      label: __("Components (Classic)", "tubebay-boilerplate"),
      path: "/components-classic",
    },
    // {
    //   label: __("Settings", "tubebay-boilerplate"),
    //   path: "/settings",
    // },
  ];

  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();

  useEffect(() => {
    const basePath = "/" + (currentPath.split("/")[1] || "");
    setActiveTab(basePath);
  }, [currentPath]);

  return (
    <>
      <div className="tubebay-bg-white tubebay-p-0 !tubebay-border-0 !tubebay-border-b !tubebay-border-gray-300 tubebay-z-50 tubebay-relative">
        <div className="tubebay-flex tubebay-px-[12px] tubebay-justify-between tubebay-items-center tubebay-flex-wrap md:tubebay-flex-nowrap tubebay-gap-[4px] tubebay-relative">
          <div className="tubebay-flex tubebay-items-center tubebay-gap-[4px] tubebay-py-[12px]">
            <span className="tubebay-font-[700] tubebay-text-[16px] tubebay-text-gray-900">
              {store.pluginData?.plugin_name || "WPAB Boilerplate"}
            </span>
          </div>
          <div
            className={`tubebay-flex-1 md:tubebay-flex-none tubebay-flex-col md:tubebay-flex-row tubebay-justify-stretch md:tubebay-items-center tubebay-absolute md:tubebay-relative tubebay-top-[102%] md:tubebay-top-auto tubebay-left-0 tubebay-w-full md:tubebay-w-auto tubebay-gap-0 md:tubebay-gap-[6px] tubebay-bg-white !tubebay-border-0 ${
              isMobileMenuOpen
                ? "tubebay-flex"
                : "tubebay-hidden md:tubebay-flex"
            }`}
          >
            <nav className="tubebay-items-stretch md:tubebay-items-center tubebay-gap-0 tubebay-flex tubebay-flex-col md:tubebay-flex-row tubebay-w-full">
              {menus.map((menu) => (
                <span
                  key={menu.path}
                  className={`tubebay-text-default tubebay-font-[700]
                    tubebay-cursor-pointer tubebay-py-[8px] tubebay-px-[16px] tubebay-border-b md:tubebay-border-b-0 tubebay-border-gray-300 last:tubebay-border-gray-300 ${
                      activeTab === menu.path
                        ? "tubebay-text-blue-800 tubebay-bg-gray-100 tubebay-rounded-[0] md:tubebay-rounded-[8px]"
                        : "tubebay-text-gray-800 hover:tubebay-text-blue-800"
                    }`}
                  onClick={() => {
                    navigate(menu.path);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {menu.label}
                </span>
              ))}
            </nav>
          </div>
          <button
            className="tubebay-flex md:tubebay-hidden tubebay-items-center tubebay-gap-[2px] tubebay-text-gray-800 hover:tubebay-text-blue-800"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="tubebay-transition-all tubebay-duration-300 tubebay-ease-in-out"
              aria-hidden="true"
            >
              {isMobileMenuOpen ? (
                <>
                  <path
                    d="M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 18L18 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              ) : (
                <>
                  <path
                    d="M3 12H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 6H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 18H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div
          className="tubebay-fixed tubebay-top-0 tubebay-left-0 tubebay-w-full tubebay-h-full tubebay-bg-black tubebay-opacity-60 tubebay-z-40 md:tubebay-hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
