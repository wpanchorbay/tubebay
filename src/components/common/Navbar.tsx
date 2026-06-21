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
      label: __("Dashboard", "wpab-boilerplate"),
      path: "/",
    },
    // Add your menu items here
    {
      label: __("Logs", "wpab-boilerplate"),
      path: "/logs",
    },
    {
      label: __("Components", "wpab-boilerplate"),
      path: "/components",
    },
    {
      label: __("Components (Classic)", "wpab-boilerplate"),
      path: "/components-classic",
    },
    // {
    //   label: __("Settings", "wpab-boilerplate"),
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
      <div className="wpab-bg-white wpab-p-0 !wpab-border-0 !wpab-border-b !wpab-border-gray-300 wpab-z-50 wpab-relative">
        <div className="wpab-flex wpab-px-[12px] wpab-justify-between wpab-items-center wpab-flex-wrap md:wpab-flex-nowrap wpab-gap-[4px] wpab-relative">
          <div className="wpab-flex wpab-items-center wpab-gap-[4px] wpab-py-[12px]">
            <span className="wpab-font-[700] wpab-text-[16px] wpab-text-gray-900">
              {store.pluginData?.plugin_name || "WPAB Boilerplate"}
            </span>
          </div>
          <div
            className={`wpab-flex-1 md:wpab-flex-none wpab-flex-col md:wpab-flex-row wpab-justify-stretch md:wpab-items-center wpab-absolute md:wpab-relative wpab-top-[102%] md:wpab-top-auto wpab-left-0 wpab-w-full md:wpab-w-auto wpab-gap-0 md:wpab-gap-[6px] wpab-bg-white !wpab-border-0 ${
              isMobileMenuOpen
                ? "wpab-flex"
                : "wpab-hidden md:wpab-flex"
            }`}
          >
            <nav className="wpab-items-stretch md:wpab-items-center wpab-gap-0 wpab-flex wpab-flex-col md:wpab-flex-row wpab-w-full">
              {menus.map((menu) => (
                <span
                  key={menu.path}
                  className={`wpab-text-default wpab-font-[700]
                    wpab-cursor-pointer wpab-py-[8px] wpab-px-[16px] wpab-border-b md:wpab-border-b-0 wpab-border-gray-300 last:wpab-border-gray-300 ${
                      activeTab === menu.path
                        ? "wpab-text-blue-800 wpab-bg-gray-100 wpab-rounded-[0] md:wpab-rounded-[8px]"
                        : "wpab-text-gray-800 hover:wpab-text-blue-800"
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
            className="wpab-flex md:wpab-hidden wpab-items-center wpab-gap-[2px] wpab-text-gray-800 hover:wpab-text-blue-800"
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
              className="wpab-transition-all wpab-duration-300 wpab-ease-in-out"
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
          className="wpab-fixed wpab-top-0 wpab-left-0 wpab-w-full wpab-h-full wpab-bg-black wpab-opacity-60 wpab-z-40 md:wpab-hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
