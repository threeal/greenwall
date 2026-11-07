import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import ThemeToggle from "./components/ThemeToggle.tsx";
import { router } from "./router.tsx";
import { isHalloween } from "./season.ts";
import { loadStoredTheme } from "./themeStorage.ts";

if (isHalloween(new Date())) {
  document.documentElement.dataset.season = "halloween";
}

const storedTheme = loadStoredTheme();
if (storedTheme) {
  document.documentElement.dataset.theme = storedTheme;
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <ThemeToggle />
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
