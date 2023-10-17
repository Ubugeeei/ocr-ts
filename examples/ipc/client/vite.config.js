import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@tegaki/frontend": `${process.cwd()}/../../../packages/frontend/src`,
      "@tegaki/shared": `${process.cwd()}/../../../packages/shared/src`,
    },
  },
});
