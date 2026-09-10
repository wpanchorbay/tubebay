/**
 * The click-to-play facade.
 *
 * Rendered by both edit() and save() so the editor preview and the saved
 * markup can never drift. Note the class is `tubebay-block-facade`, NOT
 * `tubebay-video-facade`: assets/js/public.js binds the latter on every page
 * and forces inline playback, which would hijack blocks set to open a modal.
 */

import { fallbackThumbnailUrl } from './parseYouTube';

export type AspectRatio = '16-9' | '4-3' | '1-1' | '9-16';

interface FacadeProps {
	videoId: string;
	title: string;
	thumbnailUrl: string;
	aspectRatio: AspectRatio;
	openInModal: boolean;
	/** e.g. "80vw". Empty means the stylesheet's default popup size. */
	popupWidth?: string;
	/** Whole seconds to start from. Empty means from the beginning. */
	startTime?: string;
	/** Editor previews must not be focusable or clickable. */
	isPreview?: boolean;
}

export const Facade = ( {
	videoId,
	title,
	thumbnailUrl,
	aspectRatio,
	openInModal,
	popupWidth = '',
	startTime = '',
	isPreview = false,
}: FacadeProps ) => {
	/*
	 * The accessible name must be DETERMINISTIC — never a translated string.
	 * This markup is frozen into post content, and block validation re-renders
	 * save() and compares token by token. WordPress resolves the admin locale
	 * per user, so a translated aria-label would regenerate differently for an
	 * editor in another language and invalidate every published block
	 * ("this block contains unexpected or invalid content").
	 *
	 * So the saved name is the video title, which is data, not UI copy. The
	 * view script upgrades it to a properly localised "Play video: <title>" at
	 * runtime, where translation is free of validation.
	 *
	 * The 'Play video' fallback is never dropped for `undefined`: the badge is
	 * an empty element (see below), so with no title the button would carry no
	 * accessible name at all. Untranslated here for the same reason, and
	 * localised at runtime by the same view-script pass.
	 */
	const label = title || 'Play video';

	return (
		<div
			className="tubebay-block-facade"
			data-tubebay-video={ videoId }
			data-modal={ openInModal ? 'true' : 'false' }
			data-ratio={ aspectRatio }
			data-title={ title || undefined }
			// Only meaningful in popup mode; omitted otherwise so the saved
			// markup stays as small as it can be.
			data-popup-width={
				openInModal && popupWidth ? popupWidth : undefined
			}
			// Applies to both playback modes, unlike popup width.
			data-start={ startTime || undefined }
		>
			<img
				className="tubebay-block-facade__thumb"
				src={ thumbnailUrl }
				alt={ title || '' }
				loading="lazy"
				// maxresdefault does not exist for every video; the view script
				// swaps to this on error rather than leaving a broken image.
				data-fallback={ videoId ? fallbackThumbnailUrl( videoId ) : undefined }
			/>
			{ /*
			   The badge is EMPTY on purpose — it is drawn entirely by CSS
			   (.tubebay-block-play in assets/css/blocks/tubebay-blocks.css).
			   It used to contain an inline <svg>, which cannot survive here:
			   this markup is frozen into post content, and wp_kses_post()
			   allows no `svg` or `path` element, so for any author without
			   `unfiltered_html` — Author and Contributor, and Editor on
			   multisite — the whole badge was stripped on save. That both
			   broke block validation ("this block contains unexpected or
			   invalid content") and left an invisible play button, since the
			   CSS gives the element no background of its own.

			   Same reason video-button/save.tsx draws its play icon from
			   [data-play-icon] rather than emitting a glyph. */ }
			{ isPreview ? (
				<span className="tubebay-block-play" aria-hidden="true" />
			) : (
				<button
					type="button"
					className="tubebay-block-play"
					aria-label={ label }
				/>
			) }
		</div>
	);
};
