import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@tecack/frontend": `${process.cwd()}/../../../packages/frontend/src`,
      "@tecack/shared": `${process.cwd()}/../../../packages/shared/src`,
    },
  },
});
