import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["**/dist/**", "**/build/**"]),
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-console": "error",
    },
  },
]);

