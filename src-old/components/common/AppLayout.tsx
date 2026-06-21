import { Outlet, useNavigate } from "react-router-dom";
import { FC, useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useWpabStore } from "../../store/wpabStore";
import Onboarding from "../../pages/Onboarding";

const AppLayout: FC = () => {
  const { plugin_settings } = useWpabStore();
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (
  //     plugin_settings.connection_status !== "disconnected" &&
  //     plugin_settings.connection_status !== "connected"
  //   ) {
  //     navigate("/onboarding");
  //   }
  // }, []);
  const showOnboarding = !plugin_settings.is_onboarding_completed;
  // const showOnboarding = true;
  return (
    <div className="">
      <Navbar />
      <div className="tubebay-flex tubebay-px-[24px] tubebay-py-[32px] tubebay-gap-[32px] tubebay-max-width">
        {showOnboarding ? (
          <Onboarding />
        ) : (
          <>
            <Sidebar />{" "}
            <main className="tubebay-flex-1 tubebay-min-w-0">
              <Outlet />
            </main>
          </>
        )}
      </div>
    </div>
  );
};

export default AppLayout;
