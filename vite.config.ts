import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
    // GitHub Pages serves the site from /floresti-civic-portal/
    base: mode === 'production' ? '/floresti-civic-portal/' : '/',
    server: {
        port: 3000,
        host: '0.0.0.0',
    },
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '.'),
        },
    },
}));
