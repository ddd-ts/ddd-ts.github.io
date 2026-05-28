import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import rehypeExternalLinks from "rehype-external-links";

export default defineConfig({
  site: "https://ddd-ts.dev",
  // Open external links in a new tab. `rel="nofollow noopener noreferrer"`
  // prevents the new page from getting a reference to ours (security) and
  // tells crawlers we don't endorse the target.
  markdown: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: "_blank",
          rel: ["nofollow", "noopener", "noreferrer"],
        },
      ],
    ],
  },
  // Prefetch on hover for every link. Docs pages are small and the sidebar
  // surfaces them densely, so warming the cache as soon as the user shows
  // intent (hover/focus) makes navigation feel instant. Individual links
  // can opt out with `data-astro-prefetch="false"`.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  integrations: [
    starlight({
      title: "DDD-TS",
      description:
        "The domain-driven toolchain for TypeScript. Event sourcing, CQRS, typed shapes, traits and more.",
      // No `logo` — the site title renders as text styled with Monor in
      // theme.css. Inline SVG <text> elements don't pick up custom fonts when
      // loaded via Starlight's <img>-based logo, so a styled text node is
      // both more faithful to the brand and lighter on the wire.
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/ddd-ts/monorepo",
        },
      ],
      customCss: [
        "./src/styles/fonts.css",
        "./src/styles/theme.css",
        "./src/styles/landing.css",
      ],
      components: {
        Hero: "./src/components/Hero.astro",
      },
      sidebar: [
        {
          label: "Start here",
          items: [
            { slug: "start/introduction" },
            { slug: "start/installation" },
            { slug: "start/quickstart" },
            { slug: "start/philosophy" },
          ],
        },
        {
          label: "Foundations",
          items: [
            { slug: "foundations/traits" },
            { slug: "foundations/shape" },
            { slug: "foundations/types" },
          ],
        },
        {
          label: "Domain modeling",
          items: [
            { slug: "domain/aggregates" },
            { slug: "domain/events" },
            { slug: "domain/serializers" },
            { slug: "domain/projections" },
            { slug: "domain/shard-key" },
            { slug: "domain/freeze" },
            { slug: "domain/event-tree-viewer" },
          ],
        },
        {
          label: "Stores",
          items: [
            { slug: "stores/overview" },
            { slug: "stores/in-memory" },
            { slug: "stores/firestore" },
          ],
        },
        {
          label: "Event sourcing",
          items: [
            { slug: "event-sourcing/overview" },
            { slug: "event-sourcing/store-lake-or-bus" },
            { slug: "event-sourcing/in-memory" },
            { slug: "event-sourcing/firestore" },
            { slug: "event-sourcing/esdb" },
          ],
        },
        {
          label: "About",
          items: [{ slug: "credits" }],
        },
      ],
      lastUpdated: true,
      pagefind: true,
      head: [
        // Preload the fonts we use on every page so they arrive before paint.
        // Paired with the inline @font-face below this is enough to avoid
        // the FOUT/FOIT swap in both dev and production builds.
        {
          tag: "link",
          attrs: {
            rel: "preload",
            href: "/fonts/Supreme-Variable.woff2",
            as: "font",
            type: "font/woff2",
            crossorigin: "anonymous",
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "preload",
            href: "/fonts/Monor-Bold.woff2",
            as: "font",
            type: "font/woff2",
            crossorigin: "anonymous",
          },
        },
        // Inline @font-face declarations so they apply during the very first
        // HTML parse — before any external stylesheet is fetched. In dev mode
        // Astro/Vite injects customCss via JS which would otherwise cause a
        // brief restyle. Paired with the `<link rel="preload">` tags above,
        // the fonts are already in cache by the time the browser paints.
        {
          tag: "style",
          content: `
/* font-display: block — the text is held invisible while the (already
 * preloaded) WOFF2 finishes registering with the browser's font system.
 * Because the @font-face declarations live in this inline style block they
 * apply during the very first HTML parse, before any external customCss
 * file is fetched. */
@font-face { font-family: "Monor"; src: url("/fonts/Monor-Bold.woff2") format("woff2"); font-weight: 700; font-style: normal; font-display: block; }
@font-face { font-family: "Monor"; src: url("/fonts/Monor-Regular.woff2") format("woff2"); font-weight: 400; font-style: normal; font-display: block; }
/* Supreme as a single variable face so the preloaded woff2 covers every
   weight (200-700). Declaring static-weight faces alongside the variable
   would let the browser pick those instead, and only the variable is
   preloaded — that mismatch is what caused the body text to blink. */
@font-face { font-family: "Supreme"; src: url("/fonts/Supreme-Variable.woff2") format("woff2-variations"); font-weight: 200 700; font-style: normal; font-display: block; }

/* Set the Starlight font tokens inline so the body never renders with the
 * theme's default sans before theme.css has loaded. This is what was
 * causing the "wrong font then correct font" swap — not the @font-face. */
:root { --sl-font: "Supreme", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; --sl-font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
`,
        },
        // Pin Starlight to dark mode. The picker is hidden in theme.css, but
        // Starlight's <ThemeProvider> still flips `data-theme` to "light" when
        // localStorage says so or the OS prefers light — that's what was
        // making the `<Card>` icon chips render with pastel light-mode
        // backgrounds. This script runs inside <Head>, which Page.astro
        // renders before <ThemeProvider>, so ThemeProvider then reads "dark"
        // from storage and applies it.
        {
          tag: "script",
          content: `try { localStorage.setItem('starlight-theme', 'dark'); } catch (e) {}`,
        },
        // Force every external link (anything that isn't a same-origin URL) to
        // open in a new tab. The rehype-external-links plugin handles markdown
        // anchors at build time; this script covers the rest — Starlight's
        // header social icons, edit links, etc.
        {
          tag: "script",
          content: `
document.addEventListener('DOMContentLoaded', function () {
  var host = location.hostname;
  document.querySelectorAll('a[href]').forEach(function (a) {
    var href = a.getAttribute('href') || '';
    if (!/^https?:\\/\\//.test(href)) return;
    try { if (new URL(href).hostname === host) return; } catch (e) { return; }
    if (!a.target) a.target = '_blank';
    var rel = (a.getAttribute('rel') || '').split(/\\s+/);
    ['noopener', 'noreferrer'].forEach(function (r) { if (rel.indexOf(r) === -1) rel.push(r); });
    a.setAttribute('rel', rel.filter(Boolean).join(' '));
  });
});
`,
        },
      ],
      expressiveCode: {
        themes: ["github-dark-default"],
        styleOverrides: {
          borderRadius: "10px",
          codeBackground: "#1d1d1d",
          frames: {
            shadowColor: "rgba(0, 0, 0, 0.4)",
          },
        },
      },
    }),
  ],
});
