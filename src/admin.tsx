import { createRoot } from "react-dom/client";
import "./styles/index.scss";
import AdminApp from "./AdminApp";

const rootElement = document.getElementById("tubebay");
if (rootElement) {
  createRoot(rootElement).render(<AdminApp />);
}
