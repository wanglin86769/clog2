import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
			'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js'
		}
	},
	server: {
		port: 8080,
	},
	base: '/',
	// base: '/clog',
})
