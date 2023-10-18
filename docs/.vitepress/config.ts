import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Tecack",
  description: "The Tecack Documentation",
  lastUpdated: true,
  themeConfig: {
    outline: "deep",
    search: {
      provider: "local",
    },

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Examples", link: "/markdown-examples" },
    ],

    sidebar: [
      {
        text: "Introduction",
        collapsed: false,
        items: [
          { text: "What is Tecack", link: "/introduction/what-is-tecack" },
          { text: "Getting Started", link: "/introduction/getting-started" },
        ],
      },
      {
        text: "Reference",
        collapsed: false,
        items: [
          { text: "Packages", link: "/reference/packages" },
          { text: "API", link: "/reference/apis" },
          { text: "Stroke Data", link: "/reference/stroke-data" },
        ],
      },
      {
        text: "Tools",
        collapsed: false,
        items: [
          { text: "jTegaki", link: "/tools/j-tegaki" },
          { text: "datagen", link: "/tools/datagen" },
          { text: "unicodegen", link: "/tools/unicodegen" },
        ],
      },
      {
        text: "Contribution",
        link: "/contribution",
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/Ubugeeei/tecack" }],
  },
});
