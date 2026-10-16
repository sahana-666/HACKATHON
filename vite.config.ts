import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";

function inlineCss(): Plugin {
  return {
    name: "inline-css",
    enforce: "post",
    transformIndexHtml(html, ctx) {
      if (!ctx.bundle) return html;
      return html.replace(
        /<link rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/g,
        (tag, href) => {
          const asset = ctx.bundle![href.replace(/^\//, "")];
          return asset && asset.type === "asset"
            ? `<style>${asset.source}</style>`
            : tag;
        }
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), inlineCss()],
});
