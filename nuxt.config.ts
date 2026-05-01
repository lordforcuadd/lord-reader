export default defineNuxtConfig({
  app: {
    head: {
      title: "Lord Reader :3",
      meta: [{ name: "referrer", content: "no-referrer" }],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },

  modules: ["@nuxtjs/supabase", "@nuxtjs/tailwindcss", "@vite-pwa/nuxt"],

  supabase: {
    redirectOptions: {
      login: "/login",
      callback: "/confirm",
      exclude: ["/*"],
    },
  },

  tailwindcss: {
    exposeConfig: true,
    viewer: true,
  },

  pwa: {
    manifest: {
      name: "Lord Reader",
      short_name: "LordReader",
      description: "Lector de manga profesional sin publicidad",
      theme_color: "#000000",
      background_color: "#000000",
      display: "standalone",
      icons: [
        {
          src: "/icon_192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/icon_512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
    workbox: {
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/uploads\.mangadex\.org\/covers\/.*/i,
          handler: "CacheFirst",
          options: {
            cacheName: "mangadex-covers",
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30,
            },
          },
        },
      ],
    },
    devOptions: { enabled: true, type: "module" },
  },

  routeRules: {
    "/api/mangadex/**": { proxy: "https://api.mangadex.org/**" },
  },

  nitro: {
    routeRules: {
      "/**": {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    },
  },
});
