import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import Settings from "./components/Settings.tsx";
import { router } from "./router.tsx";
import { isHalloween } from "./season.ts";

if (isHalloween(new Date())) {
  document.documentElement.dataset.season = "halloween";
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <Settings />
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
