import { defineConfig } from "eslint/config";
import next from "eslint-config-next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
  {
    // `dist/` holds pre-bundled/minified third-party static assets (not our
    // source) — linting it was crashing ESLint with an out-of-memory error.
    ignores: ["dist/**"],
  },
  {
    extends: [...next],
  },
]);
