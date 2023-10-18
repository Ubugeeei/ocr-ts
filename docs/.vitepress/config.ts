import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Tecack",
  description: "The Tecack Documentation",
  lastUpdated: true,
  lang: "en",
  appearance: "dark",
  head: [
    // og
    ["meta", { property: "og:site_name", content: "tecack" }],
    ["meta", { property: "og:url", content: "https://ubugeeei.github.io/tecack" }],
    ["meta", { property: "og:title", content: "tecack" }],
    [
      "meta",
      {
        property: "og:description",
        content: "The hand-writing recognition engine built with TypeScript. Forked from KanjiCanvas.",
      },
    ],
    // TODO:
    // [
    //   "meta",
    //   {
    //     property: "og:image",
    //     content: "https://github.com/Ubugeeei/tecack/blob/main/docs/public/tecack-img.png?raw=true",
    //   },
    // ],
    ["meta", { property: "og:image:alt", content: "tecack" }],
    ["meta", { name: "twitter:site", content: "tecack" }],
    // TODO:
    // ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:title", content: "tecack" }],
    [
      "meta",
      {
        name: "twitter:description",
        content: "The hand-writing recognition engine built with TypeScript. Forked from KanjiCanvas.",
      },
    ],
    // TODO:
    // [
    //   "meta",
    //   {
    //     name: "twitter:image",
    //     content: "https://github.com/Ubugeeei/tecack/blob/main/docs/public/tecack-img.png?raw=true",
    //   },
    // ],
    ["meta", { name: "twitter:image:alt", content: "tecack" }],
  ],
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
          { text: "codegen", link: "/tools/codegen" },
          { text: "unicodegen", link: "/tools/unicodegen" },
        ],
      },
      {
        text: "Contribution",
        link: "/contribution",
      },
    ],
    editLink: {
      pattern: "https://github.com/Ubugeeei/tecack/docs/:path",
      text: "Suggest changes to this page",
    },
    socialLinks: [{ icon: "github", link: "https://github.com/Ubugeeei/tecack" }],
  },
});
