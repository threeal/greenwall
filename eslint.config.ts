import eslintReact from "@eslint-react/eslint-plugin";
import js from "@eslint/js";
import { jsdoc } from "eslint-plugin-jsdoc";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores(["dist"]),
  js.configs.recommended,
  jsdoc({ config: "flat/recommended-tsdoc-error" }),
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  eslintReact.configs["strict-type-checked"],
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
);
