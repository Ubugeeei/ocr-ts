import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      tecack: `${process.cwd()}/../../packages/tecack/src`,
      "@tecack/frontend": `${process.cwd()}/../../packages/frontend/src`,
      "@tecack/backend": `${process.cwd()}/../../packages/backend/src`,
      "@tecack/dataset": `${process.cwd()}/../../packages/dataset/src`,
      "@tecack/shared": `${process.cwd()}/../../packages/shared/src`,
    },
  },
});
