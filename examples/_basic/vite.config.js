import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@tegaki/frontend": `${process.cwd()}/../../packages/frontend/src`,
      "@tegaki/backend": `${process.cwd()}/../../packages/backend/src`,
      "@tegaki/dataset": `${process.cwd()}/../../packages/dataset/src`,
    },
  },
});
