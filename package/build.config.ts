import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
	entries: ['src/index.ts'],
	declaration: true,
	rollup: {
		emitCJS: true,
		esbuild: {
			minifySyntax: true,
			minifyWhitespace: true,
			minifyIdentifiers: true,
			minify: true
		}
	},
	failOnWarn: false,
	outDir: './dist',
	externals: ['qs', 'express-serve-static-core']
});
