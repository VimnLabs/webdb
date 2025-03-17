import starlight from '@astrojs/starlight';
// @ts-check
import { defineConfig } from 'astro/config';
import starlightSidebarTopics from 'starlight-sidebar-topics';
import { createStarlightTypeDocPlugin } from 'starlight-typedoc';

const [TypeDocGenerator, TypeDocSidebarGroup] = createStarlightTypeDocPlugin();

// https://astro.build/config
export default defineConfig({
	site: 'https://vimnlabs.github.io',
	base: 'webdb/',
	integrations: [
		starlight({
			title: 'WebDataBase',
			logo: {
				src: './public/favicon.svg'
			},
			social: {
				github: 'https://github.com/VimnLabs/',
				discord: 'https://discord.gg/NUUW9ZMcKT'
			},
			components: {
				SiteTitle: './src/components/override/SiteTitle.astro',
				ThemeSelect: './src/components/override/ThemeSelect.astro'
			},
			customCss: ['/src/styles/global.css'],
			plugins: [
				starlightSidebarTopics([
					{
						label: 'Guides',
						link: 'guides/why',
						icon: 'open-book',
						items: [
							{ label: 'Why', link: 'guides/why' },
							'guides/installation',
							{
								label: 'Notes',
								link: 'guides/notes'
							},
							{
								label: 'Modules',
								items: [
									{
										label: 'Server Side',
										link: 'guides/modules/server'
									},
									{
										label: 'Client Side',
										items: [
											{
												label: 'Setup',
												link: 'guides/modules/client/setup'
											},
											{
												label: 'Usage',
												link: 'guides/modules/client/usage'
											}
										]
									}
								]
							}
						]
					},
					{
						label: 'Reference',
						link: '/reference/overview',
						icon: 'information',
						items: [TypeDocSidebarGroup]
					},
					{
						label: 'Source Code',
						link: 'https://github.com/VimnLabs/webdb',
						icon: 'github',
						badge: { text: 'External', variant: 'note' }
					},
					{
						label: 'NPM',
						link: 'https://www.npmjs.com/package/@vimn/webdb',
						icon: 'seti:npm',
						badge: { text: 'External', variant: 'note' }
					}
				]),
				TypeDocGenerator({
					entryPoints: ['../package/src/index.ts'],
					output: 'reference',
					tsconfig: '../package/',
					typeDoc: {
						sort: ['enum-value-ascending', 'source-order'],
						parametersFormat: 'htmlTable',
						enumMembersFormat: 'htmlTable',
						skipErrorChecking: true,
						mergeReadme: false,
						fileExtension: '.mdx',
						useCodeBlocks: true,
						entryFileName: 'overview',
						hidePageHeader: true,
						name: 'API Reference'
					}
				})
			]
		})
	]
});
