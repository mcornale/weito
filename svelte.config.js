import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			fallback: 'index.html'
		})
	},
	vitePlugin: {
		inspector: {
			toggleKeyCombo: 'meta-shift-f'
		}
	}
};

export default config;
