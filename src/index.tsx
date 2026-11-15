import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import Settings from "./components/Settings.tsx";
import { router } from "./router.tsx";
import { isHalloween } from "./season.ts";

if (isHalloween(new Date())) {
  document.documentElement.dataset.season = "halloween";
}

const darkMode = matchMedia("(prefers-color-scheme: dark)").matches;
document.documentElement.dataset.dark = String(darkMode);

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <Settings initialDarkMode={darkMode} />
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
