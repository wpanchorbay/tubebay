import { createRoot } from "react-dom/client";
import "./styles/index.scss";
import SettingsApp from "./SettingsApp";

const rootElement = document.getElementById("tubebay");
if (rootElement) {
  createRoot(rootElement).render(<SettingsApp />);
}
