import { Outlet } from "react-router-dom";
import { FC } from "react";
import Navbar from "./Navbar";

const AppLayout: FC = () => {
  return (
    <div className="tubebay-cb-container">
      <Navbar />
      <Outlet />
    </div>
  );
};

export default AppLayout;
