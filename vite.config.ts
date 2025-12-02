import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // PWA完全対応の場合は以下を有効化（将来対応）
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.ico', 'icon-192.png', 'icon-512.png'],
    //   manifest: {
    //     name: 'やさしい国家運営ゲーム',
    //     short_name: '国家運営',
    //     description: '中高生向けのやさしい経済シミュレーション教材。',
    //     theme_color: '#1e293b',
    //     icons: [
    //       {
    //         src: 'icon-192.png',
    //         sizes: '192x192',
    //         type: 'image/png',
    //       },
    //       {
    //         src: 'icon-512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //       },
    //     ],
    //   },
    // }),
  ],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
  },
  // publicフォルダの内容をdistにコピー
  publicDir: 'public',
});

