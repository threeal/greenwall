import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

const root = document.getElementById("root");
if (root) {
  const username = new URLSearchParams(window.location.search)
    .get("username")
    ?.trim();
  createRoot(root).render(
    <StrictMode>
      <App username={username} />
    </StrictMode>,
  );
}
