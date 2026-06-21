import { useState, useEffect, FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { __ } from "@wordpress/i18n";
import { useWpabStore } from "../../store/wpabStore";
import {
  MenuIcon,
  CloseIcon,
  BookIcon,
  SupportIcon,
  ChannelLibraryIcon,
  SettingsIcon,
  HelpStethoscopeIcon,
  ShoppingBagIcon,
  WifiIcon,
  YouTubeIcon,
  ClockIcon,
} from "./Icons";
import { getConnectionStatusText } from "../../utils/status_helpers";
import { timeDiff } from "../../utils/Dates";
// @ts-ignore
import logo_32px from "./../../../assets/img/TubeBay.svg";

interface MenuLink {
  label: string;
  path: string;
  icon?: FC<{ size?: number; className?: string }>;
  isExternal?: boolean;
}

interface SidebarNavItem {
  label: string;
  path: string;
  icon: JSX.Element;
  isExternal?: boolean;
}

const Navbar: FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const { products_url, plugin_settings } = useWpabStore();
  const isConnected = plugin_settings?.connection_status === "connected";
  const channelName = plugin_settings?.channel_name || "";
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = "/" + (location.pathname.split("/")[1] || "");

  // External links shown on large screens in the navbar
  const externalLinks: MenuLink[] = [
    {
      label: __("Documentation", "tubebay"),
      path: "https://docs.wpanchorbay.com/tubebay/",
      icon: BookIcon,
      isExternal: true,
    },
    {
      label: __("Support", "tubebay"),
      path: "https://wpanchorbay.com/support/",
      icon: SupportIcon,
      isExternal: true,
    },
  ];

  // Navigation items for mobile drawer (mirrors sidebar)
  const mobileNavItems: SidebarNavItem[] = [
    {
      label: "Channel Library",
      path: "/",
      icon: <ChannelLibraryIcon />,
    },
    {
      label: "Settings",
      path: "/settings",
      icon: <SettingsIcon />,
    },
    {
      label: "Help & Diagnostics",
      path: "/logs",
      icon: <HelpStethoscopeIcon />,
    },
    {
      label: "Go to Products",
      path: products_url,
      icon: <ShoppingBagIcon />,
      isExternal: true,
    },
  ];

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <div
        data-tubebay="navbar"
        className="tubebay-bg-white tubebay-p-0 !tubebay-border-0 !tubebay-border-b !tubebay-border-gray-300 tubebay-z-50 tubebay-relative"
      >
        <div className="tubebay-flex tubebay-pl-[24px] tubebay-pr-[12px] tubebay-justify-between tubebay-items-center tubebay-flex-wrap md:tubebay-flex-nowrap tubebay-gap-[4px] tubebay-relative tubebay-max-width">
          {/* Logo */}
          <div className="tubebay-flex tubebay-items-center tubebay-gap-[4px] tubebay-py-[12px]">
            <span className="tubebay-font-[700] tubebay-text-[16px] tubebay-text-gray-900">
              <a href="https://wpanchorbay.com/products/tubebay">
                <img
                  src={logo_32px}
                  alt="TubeBay"
                  className="tubebay-h-[40px]"
                />
              </a>
            </span>
          </div>

          {/* Desktop external links - hidden on small screens */}
          <div className="tubebay-hidden lg:tubebay-flex tubebay-items-center tubebay-gap-[8px]">
            {externalLinks.map((menu) => (
              <a
                key={menu.label}
                href={menu.path}
                target="_blank"
                rel="noopener noreferrer"
                className="tubebay-flex tubebay-items-center tubebay-gap-[8px] tubebay-text-gray-600 hover:tubebay-text-blue-800 tubebay-font-[600] tubebay-text-[14px] tubebay-py-[8px] tubebay-px-[16px] tubebay-no-underline tubebay-transition-colors"
              >
                {menu.icon && <menu.icon size={18} />}
                {menu.label}
              </a>
            ))}
          </div>

          {/* Mobile hamburger - visible only on small screens */}
          <button
            className="tubebay-flex lg:tubebay-hidden tubebay-items-center tubebay-gap-[2px] tubebay-text-gray-800 hover:tubebay-text-blue-800 tubebay-bg-transparent tubebay-border-none tubebay-cursor-pointer tubebay-p-[8px]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <CloseIcon className="tubebay-transition-all tubebay-duration-300 tubebay-ease-in-out" />
            ) : (
              <MenuIcon className="tubebay-transition-all tubebay-duration-300 tubebay-ease-in-out" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="tubebay-fixed tubebay-top-0 tubebay-left-0 tubebay-w-full tubebay-h-full tubebay-bg-black/50 tubebay-z-[99999] lg:tubebay-hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Slide-in drawer */}
          <div className="tubebay-fixed tubebay-top-0 tubebay-right-0 tubebay-w-[280px] tubebay-h-full tubebay-bg-white tubebay-z-[100000] tubebay-shadow-2xl tubebay-flex tubebay-flex-col tubebay-animate-slide-in-right lg:tubebay-hidden">
            {/* Drawer header */}
            <div className="tubebay-flex tubebay-items-center tubebay-justify-between tubebay-px-[20px] tubebay-py-[16px] tubebay-border-b tubebay-border-gray-200">
              <span className="tubebay-font-bold tubebay-text-[16px] tubebay-text-gray-900">
                Menu
              </span>
              <button
                className="tubebay-bg-transparent tubebay-border-none tubebay-cursor-pointer tubebay-p-[4px] tubebay-text-gray-600 hover:tubebay-text-gray-900 tubebay-transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Navigation items */}
            <nav className="tubebay-flex tubebay-flex-col tubebay-gap-[4px] tubebay-p-[12px] tubebay-flex-1">
              {mobileNavItems.map((item) => {
                const isActive =
                  currentPath === item.path ||
                  (item.path === "/" && currentPath === "/library");
                const isExternal =
                  item.isExternal ||
                  item.path.startsWith("http") ||
                  item.path.includes("wp-admin");

                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      if (isExternal) {
                        window.location.href = item.path;
                      } else {
                        navigate(item.path);
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className={`tubebay-flex tubebay-items-center tubebay-gap-[12px] tubebay-px-[16px] tubebay-py-[12px] tubebay-rounded-[12px] tubebay-text-[14px] tubebay-font-bold tubebay-w-full tubebay-text-left tubebay-border-0 tubebay-cursor-pointer tubebay-transition-all tubebay-duration-150 ${
                      isActive
                        ? "tubebay-bg-primary tubebay-text-white tubebay-shadow-sm"
                        : "tubebay-bg-transparent tubebay-text-gray-700 hover:tubebay-bg-gray-100"
                    }`}
                    style={{ outline: "none" }}
                  >
                    <span
                      className={
                        isActive
                          ? "tubebay-text-white"
                          : "tubebay-text-gray-500"
                      }
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Connection Status (mobile drawer) */}
            <div className="tubebay-border-t tubebay-border-gray-200 tubebay-px-[16px] tubebay-py-[12px]">
              <div className="tubebay-flex tubebay-items-center tubebay-gap-[8px] tubebay-mb-[8px]">
                <WifiIcon
                  className={`tubebay-w-[16px] tubebay-h-[16px] ${
                    isConnected
                      ? "tubebay-text-green-500"
                      : "tubebay-text-gray-400"
                  }`}
                />
                <span className="tubebay-text-[13px] tubebay-font-bold tubebay-text-gray-700">
                  {getConnectionStatusText(plugin_settings.connection_status)}
                </span>
              </div>

              {channelName && (
                <div className="tubebay-flex tubebay-items-center tubebay-gap-[10px] tubebay-bg-gray-50 tubebay-rounded-[10px] tubebay-p-[10px] tubebay-mb-[8px]">
                  {plugin_settings.thumbnails_default ? (
                    <img
                      src={plugin_settings.thumbnails_default}
                      alt={channelName}
                      className="tubebay-w-[28px] tubebay-h-[28px] tubebay-rounded-full tubebay-flex-shrink-0 tubebay-object-cover"
                    />
                  ) : (
                    <div className="tubebay-w-[28px] tubebay-h-[28px] tubebay-bg-red-100 tubebay-rounded-full tubebay-flex tubebay-items-center tubebay-justify-center tubebay-text-red-600 tubebay-flex-shrink-0">
                      <YouTubeIcon size={14} />
                    </div>
                  )}
                  <span className="tubebay-text-[13px] tubebay-font-semibold tubebay-text-gray-800 tubebay-truncate">
                    {channelName}
                  </span>
                </div>
              )}

              <div className="tubebay-flex tubebay-items-center tubebay-gap-[6px]">
                <ClockIcon className="tubebay-text-gray-400 tubebay-w-[14px] tubebay-h-[14px]" />
                <span className="tubebay-text-[12px] tubebay-text-gray-500">
                  Last sync:{" "}
                  {isConnected
                    ? timeDiff(Number(plugin_settings.last_sync_time))
                    : "Never"}
                </span>
              </div>
            </div>

            {/* External links at the bottom of drawer */}
            <div className="tubebay-border-t tubebay-border-gray-200 tubebay-p-[12px] tubebay-flex tubebay-flex-col tubebay-gap-[4px]">
              {externalLinks.map((menu) => (
                <a
                  key={menu.label}
                  href={menu.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tubebay-flex tubebay-items-center tubebay-gap-[12px] tubebay-text-gray-600 hover:tubebay-text-blue-800 tubebay-font-semibold tubebay-text-[14px] tubebay-py-[10px] tubebay-px-[16px] tubebay-no-underline tubebay-transition-colors tubebay-rounded-[12px] hover:tubebay-bg-gray-50"
                >
                  {menu.icon && <menu.icon size={18} />}
                  {menu.label}
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
