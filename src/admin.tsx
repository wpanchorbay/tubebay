import { createRoot } from "react-dom/client";
import "./styles/index.scss";
import AdminApp from "./AdminApp";

const rootElement = document.getElementById("wpab-boilerplate");
if (rootElement) {
  createRoot(rootElement).render(<AdminApp />);
}
