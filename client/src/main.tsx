import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./mobile-polish.css";

function mountApp() {
  const root = document.getElementById("root");
  if (!root) return;
  createRoot(root).render(<App />);
}

if (document.getElementById("root")) {
  mountApp();
} else {
  window.addEventListener("DOMContentLoaded", mountApp, { once: true });
}
