/**
 * Shared block and format icons. Editor chrome only — see the note below.
 */

/*
 * Toolbar icon for the inline video-link format.
 *
 * These icons are editor chrome only. None of them may ever be rendered from a
 * block's save(): wp_kses_post() allows neither `svg` nor `path`, so an inline
 * SVG in saved post content is stripped for any author without
 * `unfiltered_html` and the block then fails validation. The facade's play
 * badge used to live here as a `PlayBadge` component for exactly that reason
 * and is now drawn in CSS instead — see src/blocks/shared/Facade.tsx.
 *
 * A ring rather than a filled disc, so it stays legible beside the chain-link
 * icon it sits next to and distinct from the rectangular Video block icon.
 */
export const videoLinkIcon = (
	<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
		<path
			d="M12 3.75a8.25 8.25 0 1 0 0 16.5 8.25 8.25 0 0 0 0-16.5Zm0 1.5a6.75 6.75 0 1 1 0 13.5 6.75 6.75 0 0 1 0-13.5Zm-1.75 3.4v6.7L16 12l-5.75-3.35Z"
			fill="currentColor"
		/>
	</svg>
);

export const videoBlockIcon = (
	<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
		<path
			d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1.5 2v10h13V7h-13ZM10 9.5l5 2.5-5 2.5v-5Z"
			fill="currentColor"
		/>
	</svg>
);

export const buttonBlockIcon = (
	<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
		<path
			d="M3 8h18a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Zm.5 1.5v5h17v-5h-17ZM8 10.5l4 1.5-4 1.5v-3Z"
			fill="currentColor"
		/>
	</svg>
);
