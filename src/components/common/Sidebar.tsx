import { FC, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useWpabStore, useWpabStoreActions } from "../../store/wpabStore";
import apiFetch from "@wordpress/api-fetch";
import { useToast } from "../../store/toast/use-toast";
import {
  SettingsIcon,
  ChannelLibraryIcon,
  ShoppingBagIcon,
  HelpStethoscopeIcon,
  WifiIcon,
  YouTubeIcon,
  ClockIcon,
} from "./Icons";
import { timeDiff } from "../../utils/Dates";
import { useYouTubeActions } from "../../hooks/useYouTubeActions";
import { getConnectionStatusText } from "../../utils/status_helpers";
import Button from "./Button";

interface SidebarMenuItem {
  label: string;
  path: string;
  icon: JSX.Element;
}

const Sidebar: FC = () => {
  const { plugin_settings, products_url } = useWpabStore();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = "/" + (location.pathname.split("/")[1] || "");

  const menuItems: SidebarMenuItem[] = [
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
    // {
    //   label: "Products",
    //   path: "/products",
    //   icon: <ShoppingBagIcon />,
    // },
    {
      label: "Help & Diagnostics",
      path: "/logs",
      icon: <HelpStethoscopeIcon />,
    },
    {
      label: "Go to Products",
      path: products_url,
      icon: <ShoppingBagIcon />,
    },
  ];

  const isConnected = plugin_settings?.connection_status === "connected";
  const channelName = plugin_settings?.channel_name || "";

  const { connectYouTube, disconnectYouTube, syncLibrary } =
    useYouTubeActions();

  return (
    <aside className="tubebay-w-[clamp(260px,10%,300px)] tubebay-hidden lg:tubebay-flex tubebay-flex-col tubebay-gap-[16px] ">
      {/* Navigation Card */}
      <div className="tubebay-bg-white tubebay-rounded-[12px] tubebay-p-[24px] tubebay-shadow-xl">
        <nav className="tubebay-flex tubebay-flex-col tubebay-gap-[8px]">
          {menuItems.map((item) => {
            const isActive =
              currentPath === item.path ||
              (item.path === "/" && currentPath === "/library");
            const isExternal =
              item.path.startsWith("http") || item.path.includes("wp-admin");

            return (
              <button
                key={item.path}
                onClick={() => {
                  if (isExternal) {
                    window.location.href = item.path;
                  } else {
                    navigate(item.path);
                  }
                }}
                className={`tubebay-flex tubebay-items-center tubebay-gap-[10px] 
                  tubebay-px-[16px] tubebay-py-[12px] tubebay-rounded-[12px] 
                  tubebay-t-6-bold
                  tubebay-w-full tubebay-text-left tubebay-border-0 tubebay-cursor-pointer tubebay-transition-all tubebay-duration-150 ${
                    isActive
                      ? "tubebay-bg-primary tubebay-text-white tubebay-shadow-sm"
                      : "tubebay-bg-transparent tubebay-text-color-default hover:tubebay-bg-gray-100"
                  }`}
                style={{ outline: "none" }}
              >
                <span
                  className={
                    isActive
                      ? "tubebay-text-white"
                      : "tubebay-text-color-default"
                  }
                >
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Connection Status Card */}
      <div className="tubebay-bg-white tubebay-rounded-[12px] tubebay-p-[24px] tubebay-flex tubebay-flex-col  tubebay-gap-[16px] tubebay-shadow-xl">
        <div className="tubebay-flex tubebay-items-center tubebay-gap-[8px]">
          <WifiIcon
            className={` tubebay-w-[18px] tubebay-h-[18px]
              ${
                isConnected ? "tubebay-text-green-500" : "tubebay-text-gray-400"
              }`}
          />
          <span className="tubebay-t-6-bold tubebay-text-color-default">
            Connection Status
          </span>
        </div>

        {/* Status Indicator */}
        <div className="tubebay-flex tubebay-items-center tubebay-gap-[8px]">
          <span
            className={`tubebay-w-[8px] tubebay-h-[8px] tubebay-mx-[5px] tubebay-rounded-full ${
              isConnected ? "tubebay-bg-green-500" : "tubebay-bg-gray-400"
            }`}
          ></span>
          <span className="tubebay-t-6-bold tubebay-text-color-default">
            API Connection:{" "}
            {getConnectionStatusText(plugin_settings.connection_status)}
          </span>
        </div>

        {/* Channel Info (only when connected) */}
        {(plugin_settings.connection_status === "connected" ||
          plugin_settings.connection_status === "disconnected") &&
          plugin_settings.channel_name && (
            <div className="tubebay-flex tubebay-flex-col tubebay-gap-[12px] tubebay-bg-[#f9fafb] tubebay-p-[16px] tubebay-rounded-[12px]">
              <div className="tubebay-flex tubebay-items-center tubebay-gap-[12px] tubebay-bg-gray-50 tubebay-rounded-[8px] tubebay-w-full">
                {plugin_settings.thumbnails_default ? (
                  <img
                    src={plugin_settings.thumbnails_default}
                    alt={channelName}
                    referrerPolicy="no-referrer" /* <-- Fixes the Google CDN blocking issue */
                    className="tubebay-w-[36px] tubebay-h-[36px] tubebay-rounded-full tubebay-flex-shrink-0 tubebay-object-cover tubebay-bg-gray-200"
                    onError={(e) => {
                      /* <-- Fallback if the image fails completely */
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239ca3af'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";
                    }}
                  />
                ) : (
                  <div className="tubebay-w-[36px] tubebay-h-[36px] tubebay-bg-red-100 tubebay-rounded-full tubebay-flex tubebay-items-center tubebay-justify-center tubebay-text-red-600 tubebay-flex-shrink-0">
                    <YouTubeIcon />
                  </div>
                )}
                <div className="tubebay-overflow-hidden">
                  <p className="tubebay-t-6-bold tubebay-truncate">
                    {channelName}
                  </p>
                </div>
              </div>
              <div className="tubebay-flex tubebay-gap-[12px] tubebay-justify-between tubebay-w-full">
                {isConnected ? (
                  <Button
                    className="tubebay-font-bold !tubebay-text-[12px] !tubebay-leading-[16px] !tubebay-px-[6px]"
                    variant="ghost"
                    color="danger"
                    onClick={() => disconnectYouTube()}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    className="tubebay-font-bold !tubebay-text-[12px] !tubebay-leading-[16px] !tubebay-px-[6px]"
                    variant="ghost"
                    color="primary"
                    onClick={() => connectYouTube()}
                  >
                    Connect
                  </Button>
                )}
                <Button
                  className="tubebay-font-bold !tubebay-text-[12px] !tubebay-leading-[16px] !tubebay-px-[6px]"
                  variant="ghost"
                  color="primary"
                  onClick={() => syncLibrary()}
                  disabled={!isConnected}
                >
                  Sync
                </Button>
              </div>
            </div>
          )}

        {/* Last Sync */}
        <div className="tubebay-flex tubebay-items-center tubebay-gap-[6px] tubebay-border-gray-100">
          <ClockIcon className="tubebay-text-gray-400" />
          <span className="tubebay-text-small tubebay-text-secondary">
            Last sync:{" "}
            {isConnected
              ? timeDiff(Number(plugin_settings.last_sync_time))
              : "Never"}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
