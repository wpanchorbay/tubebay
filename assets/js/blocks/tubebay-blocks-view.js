/**
 * TubeBay blocks — frontend behaviour.
 *
 * Loaded only on pages that actually contain a TubeBay block: it is declared as
 * `viewScript` in each block.json, so WordPress enqueues it from render_block.
 * Do not move any of this into assets/js/public.js, which loads on every single
 * frontend page.
 *
 * Deliberately plain JavaScript with no build step. It ships as written.
 */
( function () {
	'use strict';

	var cfg = window.tubebayBlocks || {};
	var i18n = cfg.i18n || {};

	/* ------------------------------------------------------------------ *
	 * Embed URL
	 * ------------------------------------------------------------------ */

	/**
	 * Built at click time, never at save time.
	 *
	 * This is the whole reason the blocks store only a video ID: flipping the
	 * privacy_mode setting switches every already-published post to
	 * youtube-nocookie.com with no re-save and no post revision.
	 */
	function embedUrl( videoId, autoplay, start ) {
		var host = cfg.privacyMode
			? 'www.youtube-nocookie.com'
			: 'www.youtube.com';
		var query = 'rel=0&playsinline=1' + ( autoplay ? '&autoplay=1' : '' );

		// Authors enter mm:ss; the editor stores whole seconds, which is what
		// YouTube's `start` parameter takes. Anything non-numeric is ignored
		// rather than passed through, so a malformed value plays from 0:00.
		var seconds = parseInt( start, 10 );

		if ( Number.isFinite( seconds ) && seconds > 0 ) {
			query += '&start=' + seconds;
		}

		return (
			'https://' + host + '/embed/' + encodeURIComponent( videoId ) + '?' + query
		);
	}

	function buildIframe( videoId, title, excludeFromTabOrder, start ) {
		var iframe = document.createElement( 'iframe' );

		if ( excludeFromTabOrder ) {
			iframe.setAttribute( 'tabindex', '-1' );
		}

		iframe.setAttribute( 'src', embedUrl( videoId, true, start ) );
		iframe.setAttribute( 'title', title || i18n.dialog || 'Video player' );
		iframe.setAttribute( 'frameborder', '0' );
		iframe.setAttribute(
			'allow',
			'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
		);
		iframe.setAttribute( 'allowfullscreen', 'true' );
		/*
		 * Without this, YouTube shows "Error 153 — Video player configuration
		 * error" on any site whose Referrer-Policy withholds the referrer
		 * cross-origin (`same-origin`, `no-referrer`, and similar, which are
		 * common hardening defaults). YouTube verifies the embedding domain
		 * from the referrer; with none it refuses to play.
		 *
		 * The iframe attribute overrides the document policy for this one
		 * request. This is the exact value YouTube's own oEmbed markup uses.
		 */
		iframe.setAttribute( 'referrerpolicy', 'strict-origin-when-cross-origin' );
		iframe.className = 'tubebay-block-iframe';

		return iframe;
	}

	/* ------------------------------------------------------------------ *
	 * Lightbox
	 * ------------------------------------------------------------------ */

	var overlay = null;
	var content = null;
	var closeBtn = null;
	var sentinelStart = null;
	var sentinelEnd = null;
	var lastFocused = null;

	// The body's own inline values, saved while the lightbox borrows them.
	var bodyStyle = { overflow: '', paddingRight: '' };

	function isOpen() {
		return !! overlay && overlay.classList.contains( 'tubebay-active' );
	}

	/**
	 * Tab stops inside the dialog.
	 *
	 * The YouTube iframe is deliberately NOT one of them, and is given
	 * tabindex="-1" when built. The reason is a hard constraint, not a
	 * preference: it is cross-origin, so once focus is inside it every keydown
	 * — Escape included — fires in YouTube's document and never reaches ours.
	 * A modal that cannot be dismissed from the keyboard is a keyboard trap
	 * (WCAG 2.1.2), which is a worse failure than not being able to Tab to the
	 * player's own controls. Mouse and touch users click into the player as
	 * normal, and YouTube's shortcuts work once they do.
	 */
	function focusable() {
		return [ closeBtn ];
	}

	/**
	 * The keydown trap below is a backstop for focus that has escaped the
	 * dialog entirely. It cannot be the primary mechanism: once focus is inside
	 * the cross-origin YouTube iframe, keydown fires in that document and never
	 * reaches ours, so the sentinels do the real work.
	 */

	/**
	 * Keep Tab inside the dialog. The lightbox this replaces had no focus
	 * management at all — a keyboard user could tab straight out behind the
	 * overlay with no way to tell where they were.
	 */
	function trapFocus( event ) {
		if ( event.key !== 'Tab' || ! isOpen() ) {
			return;
		}

		var items = focusable().filter( function ( el ) {
			return el && el.offsetParent !== null;
		} );

		if ( ! items.length ) {
			return;
		}

		var first = items[ 0 ];
		var last = items[ items.length - 1 ];
		var active = document.activeElement;

		// If focus has escaped the dialog altogether, pull it back. Without
		// this, Tab walks into whatever is behind the overlay.
		if ( ! overlay.contains( active ) ) {
			event.preventDefault();
			first.focus();
			return;
		}

		if ( event.shiftKey && active === first ) {
			event.preventDefault();
			last.focus();
		} else if ( ! event.shiftKey && active === last ) {
			event.preventDefault();
			first.focus();
		}
	}

	function createLightbox() {
		if ( overlay ) {
			return;
		}

		overlay = document.createElement( 'div' );
		overlay.className = 'tubebay-lightbox-overlay';
		overlay.setAttribute( 'role', 'dialog' );
		overlay.setAttribute( 'aria-modal', 'true' );
		overlay.setAttribute( 'aria-label', i18n.dialog || 'Video player' );

		// A real button, not the <div> the previous implementation used.
		closeBtn = document.createElement( 'button' );
		closeBtn.type = 'button';
		closeBtn.className = 'tubebay-lightbox-close';
		closeBtn.setAttribute( 'aria-label', i18n.close || 'Close video' );
		closeBtn.innerHTML = '&times;';

		content = document.createElement( 'div' );
		content.className = 'tubebay-lightbox-content';

		// Focus guards. See trapFocus() for why the keydown handler alone is
		// not enough once focus is inside the YouTube iframe.
		sentinelStart = document.createElement( 'span' );
		sentinelEnd = document.createElement( 'span' );

		[ sentinelStart, sentinelEnd ].forEach( function ( el ) {
			el.className = 'tubebay-lightbox-sentinel';
			el.tabIndex = 0;
			el.setAttribute( 'aria-hidden', 'true' );
		} );

		overlay.appendChild( sentinelStart );
		overlay.appendChild( closeBtn );
		overlay.appendChild( content );
		overlay.appendChild( sentinelEnd );
		document.body.appendChild( overlay );

		// Tabbing past the last stop wraps to the first, and vice versa.
		sentinelEnd.addEventListener( 'focus', function () {
			closeBtn.focus();
		} );

		sentinelStart.addEventListener( 'focus', function () {
			var items = focusable();
			items[ items.length - 1 ].focus();
		} );

		// Bound once, at creation — the old implementation re-bound these on
		// every open and leaked a listener each time.
		closeBtn.addEventListener( 'click', closeLightbox );

		overlay.addEventListener( 'click', function ( event ) {
			if ( event.target === overlay ) {
				closeLightbox();
			}
		} );

		document.addEventListener( 'keydown', function ( event ) {
			if ( ! isOpen() ) {
				return;
			}

			if ( event.key === 'Escape' ) {
				closeLightbox();
				return;
			}

			trapFocus( event );
		} );

		// Swipe down to dismiss on touch devices.
		var touchStartY = 0;

		overlay.addEventListener(
			'touchstart',
			function ( event ) {
				touchStartY = event.changedTouches[ 0 ].screenY;
			},
			{ passive: true }
		);

		overlay.addEventListener(
			'touchend',
			function ( event ) {
				// Downward only. Math.abs() here also caught upward drags and
				// the vertical component of horizontal gestures.
				if ( event.changedTouches[ 0 ].screenY - touchStartY > 50 ) {
					closeLightbox();
				}
			},
			{ passive: true }
		);
	}

	/**
	 * Ratios the video block offers, as CSS aspect-ratio values.
	 */
	var RATIOS = {
		'16-9': '16 / 9',
		'4-3': '4 / 3',
		'1-1': '1 / 1',
		'9-16': '9 / 16',
	};

	/**
	 * Size the dialog from the block that opened it.
	 *
	 * @param {string} width Author-supplied width, e.g. "80vw". Empty means
	 *                       fall back to the stylesheet default.
	 * @param {string} ratio A data-ratio key, e.g. "9-16".
	 */
	function applySize( width, ratio ) {
		var aspect = RATIOS[ ratio ] || RATIOS[ '16-9' ];
		var parts = aspect.split( '/' );
		var ratioNumber = parseFloat( parts[ 0 ] ) / parseFloat( parts[ 1 ] );

		// The dialog is reused by every trigger on the page, so last time's
		// size must not leak into this one.
		content.style.aspectRatio = aspect;
		content.style.maxWidth = 'none';

		/*
		 * Never let the dialog grow taller than the viewport. The overlay is
		 * position:fixed with no overflow, so anything past the bottom edge is
		 * cropped with no way to scroll to it — a 9:16 Short at the default
		 * width is 900x1600, which loses 700px on a 900px-tall screen.
		 *
		 * This cap has to apply whether or not the author set a width. The
		 * stylesheet default (90%, capped at 900px) is repeated here rather
		 * than left to CSS, because once maxWidth is cleared for the cap the
		 * stylesheet's own max-width can no longer participate.
		 */
		var cap = 'calc(90dvh * ' + ratioNumber + ')';

		content.style.width = width
			? 'min(' + width + ', ' + cap + ')'
			: 'min(90%, 900px, ' + cap + ')';
	}

	function openLightbox( videoId, title, width, ratio, start ) {
		createLightbox();

		lastFocused = document.activeElement;

		applySize( width, ratio );

		content.innerHTML = '';
		content.appendChild( buildIframe( videoId, title, true, start ) );

		// Always reset: otherwise an untitled video reopens still announcing
		// the title of whichever video was shown before it.
		overlay.setAttribute(
			'aria-label',
			title || i18n.dialog || 'Video player'
		);

		// Compensate for the scrollbar so locking scroll doesn't shift layout.
		var scrollbar = window.innerWidth - document.documentElement.clientWidth;

		/*
		 * Remember what was on the body before we touch it. Blanking these on
		 * close would silently discard an inline overflow or padding-right set
		 * by a theme's sticky header or another plugin's modal — we are a
		 * guest on this element, not its owner.
		 */
		bodyStyle.overflow = document.body.style.overflow;
		bodyStyle.paddingRight = document.body.style.paddingRight;

		document.body.style.overflow = 'hidden';

		if ( scrollbar > 0 ) {
			document.body.style.paddingRight = scrollbar + 'px';
		}

		overlay.classList.add( 'tubebay-active' );

		focusClose();
	}

	/**
	 * Move focus to the close button once the overlay can actually take it.
	 *
	 * The class added above starts a 0.3s transition off visibility:hidden, and
	 * focusing a hidden element is a silent no-op — the keyboard would be left
	 * stranded on the page behind the dialog. A fixed number of frames is not
	 * enough: two rAFs sit right on the boundary of when the transition has
	 * begun, and under load it lands early and does nothing (caught as an
	 * intermittent e2e failure, TC-28). So retry until it takes, then stop.
	 */
	function focusClose() {
		var attempts = 0;

		( function attempt() {
			if ( ! overlay || ! closeBtn || ! isOpen() ) {
				return;
			}

			closeBtn.focus();

			// Give up after ~500ms rather than spinning forever if something
			// else on the page is holding focus.
			if ( document.activeElement === closeBtn || attempts++ > 30 ) {
				return;
			}

			requestAnimationFrame( attempt );
		} )();
	}

	function closeLightbox() {
		if ( ! overlay ) {
			return;
		}

		overlay.classList.remove( 'tubebay-active' );

		// Destroying the iframe is what actually stops playback.
		content.innerHTML = '';

		// Put back exactly what was there, not an empty string.
		document.body.style.overflow = bodyStyle.overflow;
		document.body.style.paddingRight = bodyStyle.paddingRight;

		// Send the keyboard back where it came from.
		if ( lastFocused && typeof lastFocused.focus === 'function' ) {
			lastFocused.focus();
		}

		lastFocused = null;
	}

	/* ------------------------------------------------------------------ *
	 * Binding
	 * ------------------------------------------------------------------ */

	function playInline( facade ) {
		var videoId = facade.getAttribute( 'data-tubebay-video' );
		var title = facade.getAttribute( 'data-title' );

		// The inline path is the only one the video block uses when it is not
		// set to open in a popup, so start time has to be honoured here too --
		// not just in the lightbox.
		var iframe = buildIframe(
			videoId,
			title,
			false,
			facade.getAttribute( 'data-start' )
		);

		facade.innerHTML = '';
		facade.appendChild( iframe );
		facade.classList.add( 'is-playing' );

		// Without this, focus is dumped on <body> after the button disappears.
		iframe.focus();
	}

	/**
	 * Give every facade play button a properly localised accessible name.
	 *
	 * save() stores only the raw video title, because a translated string
	 * frozen into post content would invalidate the block for any user whose
	 * admin locale differs from the author's. Doing it here is free of that
	 * constraint.
	 */
	function localizePlayButtons() {
		var buttons = document.querySelectorAll(
			'.tubebay-block-facade .tubebay-block-play'
		);

		Array.prototype.forEach.call( buttons, function ( button ) {
			var facade = button.closest( '.tubebay-block-facade' );
			var title = facade ? facade.getAttribute( 'data-title' ) : '';
			var template = i18n.playVideoTitled || 'Play video: %s';

			button.setAttribute(
				'aria-label',
				title
					? template.replace( '%s', title )
					: i18n.playVideo || 'Play video'
			);
		} );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', localizePlayButtons );
	} else {
		localizePlayButtons();
	}

	/*
	 * The click handler is delegated so that lazily-rendered blocks work; the
	 * naming pass has to keep up with them too, or a video with no title (any
	 * manually pasted URL) is announced as just "button". Cheap: it only reads
	 * attributes, and only when nodes are actually added.
	 */
	if ( window.MutationObserver ) {
		var relabelScheduled = false;

		new MutationObserver( function ( records ) {
			/*
			 * Coalesce to one pass per frame. This watches the whole document
			 * for the life of the page, so on a site with a carousel, ads or
			 * infinite scroll it fires constantly — and it used to run a
			 * full-document querySelectorAll every time, including for the
			 * iframe this script inserts itself.
			 */
			if ( relabelScheduled ) {
				return;
			}

			for ( var i = 0; i < records.length; i++ ) {
				if ( ! records[ i ].addedNodes.length ) {
					continue;
				}

				relabelScheduled = true;

				requestAnimationFrame( function () {
					relabelScheduled = false;
					localizePlayButtons();
				} );

				return;
			}
		} ).observe( document.body, { childList: true, subtree: true } );
	}

	// Delegated, so blocks inside AJAX-loaded or lazily-rendered content work.
	// Note the hook class is `tubebay-block-facade`, NOT `tubebay-video-facade`:
	// assets/js/public.js binds the latter on every page and forces inline
	// playback, which would hijack any block set to open a popup.
	document.addEventListener( 'click', function ( event ) {
		var facade = event.target.closest
			? event.target.closest( '.tubebay-block-facade' )
			: null;

		if ( facade ) {
			event.preventDefault();

			var videoId = facade.getAttribute( 'data-tubebay-video' );

			if ( ! videoId ) {
				return;
			}

			if ( facade.getAttribute( 'data-modal' ) === 'true' ) {
				openLightbox(
					videoId,
					facade.getAttribute( 'data-title' ),
					facade.getAttribute( 'data-popup-width' ),
					// Carry the block's own aspect ratio across, so a 9:16
					// Shorts video is not letterboxed into a 16:9 dialog.
					facade.getAttribute( 'data-ratio' ),
					facade.getAttribute( 'data-start' )
				);
			} else {
				playInline( facade );
			}

			return;
		}

		var trigger = event.target.closest
			? event.target.closest( 'a[data-tubebay-video]' )
			: null;

		if ( ! trigger ) {
			return;
		}

		// Let ctrl/cmd/shift/middle-click fall through to the real href, so
		// "open in new tab" keeps working.
		if (
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.button !== 0
		) {
			return;
		}

		event.preventDefault();
		openLightbox(
			trigger.getAttribute( 'data-tubebay-video' ),
			trigger.getAttribute( 'data-title' ),
			trigger.getAttribute( 'data-popup-width' ),
			// Both the button block and the inline link format now carry their
			// own shape; 16:9 remains the default when the attribute is absent.
			trigger.getAttribute( 'data-ratio' ),
			trigger.getAttribute( 'data-start' )
		);
	} );

	/**
	 * Thumbnail fallback.
	 *
	 * maxresdefault.jpg does not exist for every video, and static save means
	 * there is no server-side place to correct it after the fact. Capturing
	 * phase, because error events do not bubble.
	 */
	document.addEventListener(
		'error',
		function ( event ) {
			var img = event.target;

			if (
				! img ||
				! img.matches ||
				! img.matches( '.tubebay-block-facade__thumb' ) ||
				img.dataset.tubebayFallbackApplied
			) {
				return;
			}

			var fallback = img.getAttribute( 'data-fallback' );

			if ( fallback ) {
				img.dataset.tubebayFallbackApplied = '1';
				img.src = fallback;
			}
		},
		true
	);
} )();
