import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import Settings from "./components/Settings.tsx";
import { router } from "./router.tsx";
import { isHalloween } from "./season.ts";
import { applyTheme, loadSettings } from "./settingsStorage.ts";

if (isHalloween(new Date())) {
  document.documentElement.dataset.season = "halloween";
}

const settings = loadSettings();
applyTheme(settings.theme);

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <Settings initialSettings={settings} />
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
