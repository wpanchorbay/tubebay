import { defineConfig } from 'vitepress';

export default defineConfig({
	title: 'TubeBay',
	description:
		'Official documentation for TubeBay — the bridge between YouTube and WooCommerce.',
	lang: 'en-US',
	base: '/tubebay/',

	head: [
		[
			'link',
			{
				rel: 'icon',
				href: '/tubebay/icon.svg',
				type: 'image/svg+xml',
			},
		],
		['meta', { name: 'theme-color', content: '#ff0000' }],
		['meta', { property: 'og:type', content: 'website' }],
		['meta', { property: 'og:title', content: 'TubeBay Documentation' }],
		[
			'meta',
			{
				property: 'og:description',
				content:
					'Official documentation for TubeBay — the bridge between YouTube and WooCommerce.',
			},
		],
		['meta', { property: 'og:image', content: '/tubebay/logo.svg' }],
	],

	themeConfig: {
		logo: '/icon.svg',
		siteTitle: false,

		nav: [
			{
				text: 'v1.0.0',
				items: [
					{
						text: 'v1.0.0 (Latest)',
						link: '/guide/introduction',
						activeMatch: '^/(?!v\\d)',
					},
					{
						text: 'Changelog',
						link: '/changelog',
					},
				],
			},
			{ text: 'Guide', link: '/guide/introduction' },
			{ text: 'Features', link: '/features/connection' },
			{ text: 'Developer', link: '/developer/architecture' },
			{
				text: 'More',
				items: [
					{ text: 'FAQ', link: '/faq' },
					{ text: 'Changelog', link: '/changelog' },
					{ text: 'Request a Feature', link: '/feature-request' },
				],
			},
		],

		sidebar: [
			{
				text: 'Getting Started',
				collapsed: false,
				items: [
					{ text: 'Introduction', link: '/guide/introduction' },
					{ text: 'Requirements', link: '/guide/requirements' },
					{ text: 'Installation', link: '/guide/installation' },
					{ text: 'Quick Start', link: '/guide/getting-started' },
				],
			},
			{
				text: 'Configuration',
				collapsed: false,
				items: [
					{ text: 'Connection Guide', link: '/guide/connection' },
					{ text: 'Sync Library', link: '/guide/sync-library' },
					{ text: 'Uninstallation', link: '/guide/uninstallation' },
				],
			},
			{
				text: 'Core Features',
				collapsed: false,
				items: [
					{ text: 'Account Connection', link: '/features/connection' },
					{ text: 'Library Management', link: '/features/library-management' },
					{ text: 'Product Mapping', link: '/features/product-mapping' },
					{ text: 'Embedded Player', link: '/features/embedded-player' },
					{ text: 'Visual Placement', link: '/features/placement' },
				],
			},
			{
				text: 'Settings',
				collapsed: false,
				items: [
					{ text: 'Global Settings', link: '/features/global-settings' },
					{ text: 'Shortcodes', link: '/features/shortcodes' },
				],
			},
			{
				text: 'Developer Reference',
				collapsed: true,
				items: [
					{ text: 'Architecture', link: '/developer/architecture' },
					{ text: 'REST API', link: '/developer/rest-api' },
					{ text: 'Hooks & Filters', link: '/developer/hooks' },
					{ text: 'Contributing', link: '/developer/contributing' },
				],
			},
			{
				text: 'Resources',
				collapsed: true,
				items: [
					{ text: 'FAQ', link: '/faq' },
					{ text: 'Changelog', link: '/changelog' },
					{ text: 'Feature Request', link: '/feature-request' },
				],
			},
		],

		socialLinks: [
			{
				icon: 'github',
				link: 'https://github.com/wpanchorbay/tubebay',
			},
			{
				icon: {
					svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><image href="/tubebay/wpanchorbay.png" width="24" height="24" /></svg>',
				},
				link: 'https://wpanchorbay.com/',
				ariaLabel: 'WPAnchorBay',
			},
		],

		footer: {
			message: 'Released under the GPL-2.0+ License.',
			copyright:
				'Copyright © 2026 <a href="https://wpanchorbay.com" target="_blank">WPAnchorBay</a>',
		},

		search: {
			provider: 'local',
			options: {
				detailedView: true,
			},
		},

		editLink: {
			pattern: 'https://github.com/wpanchorbay/tubebay/edit/main/docs/:path',
			text: 'Edit this page on GitHub',
		},

		lastUpdated: {
			text: 'Last updated',
		},
	},

	lastUpdated: true,
});
