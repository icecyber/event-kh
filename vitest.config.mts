import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Vite 4+ resolves tsconfig `paths` natively, so the `vite-tsconfig-paths`
  // plugin the Next docs recommend is no longer needed for the `@/` alias.
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["__tests__/**/*.test.{ts,tsx}"],
  },
});
