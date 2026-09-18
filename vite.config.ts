import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Base path + host handling.
 *
 * - `PAGES_BASE_PATH` is set by the Pages workflow to `/<repo-name>/` so that
 *   asset URLs and the service worker scope stay inside the project subpath.
 * - Codespaces port-forwarding hostnames are added to `allowedHosts` explicitly
 *   when the Codespaces environment variables are present.
 * - `DEV_ALLOW_ALL_HOSTS=true` is only for sandboxed port-forwarding proxies that
 *   rewrite the Host header. It affects the *dev/preview server only*; the
 *   published GitHub Pages site is static and has no server component.
 */
export default defineConfig(() => {
  const base = process.env.PAGES_BASE_PATH || '/';
  const domain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;
  const codespace = process.env.CODESPACE_NAME;
  const hostFor = (port: number): string | undefined =>
    domain && codespace ? `${codespace}-${port}.${domain}` : undefined;

  const extraHosts = (process.env.DEV_ALLOWED_HOSTS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  const allowAllHosts = process.env.DEV_ALLOW_ALL_HOSTS === 'true';

  const devHosts = [hostFor(5173), ...extraHosts].filter((value): value is string => Boolean(value));
  const previewHosts = [hostFor(4173), ...extraHosts].filter((value): value is string => Boolean(value));

  const devAllowedHosts: true | string[] = allowAllHosts ? true : devHosts;
  const previewAllowedHosts: true | string[] = allowAllHosts ? true : previewHosts;

  return {
    base,
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      allowedHosts: devAllowedHosts,
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
      strictPort: true,
      allowedHosts: previewAllowedHosts,
    },
    build: {
      target: 'es2022',
      sourcemap: true,
    },
    plugins: [
      VitePWA({
        registerType: 'prompt',
        injectRegister: false,
        includeAssets: ['icons/*.png', 'fonts/*.woff2'],
        manifest: {
          name: 'টাকালেখো — টাকার পরিমাণ বাংলা কথায়',
          short_name: 'টাকালেখো',
          description:
            'টাকার অঙ্ককে দেশীয় সংখ্যা-রীতিতে (কোটি–লাখ–হাজার) বাংলা কথায় লেখে। ইনপুট ডিভাইসেই থাকে, ইন্টারনেট ছাড়াও কাজ করে।',
          lang: 'bn',
          start_url: base,
          scope: base,
          display: 'standalone',
          theme_color: '#14532d',
          background_color: '#ffffff',
          icons: [
            { src: `${base}icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
            { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png' },
            { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json,webmanifest}'],
          globIgnores: ['**/favicon.ico'],
          cleanupOutdatedCaches: true,
          clientsClaim: false,
          skipWaiting: false,
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
  };
});
