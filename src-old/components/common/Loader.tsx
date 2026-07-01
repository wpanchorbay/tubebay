import { FC } from "react";
import { Spinner } from "@wordpress/components";

const Loader: FC = () => {
  return (
    <div className="tubebay-loader-container">
      <Spinner />
    </div>
  );
};

export default Loader;
