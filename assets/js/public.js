function tubebayInitGallery() {

    /*
     * Settings > Player, as rendered into the page by
     * WooCommerce::render_gallery_video() (#tubebay-gallery-data).
     *
     * This block used to be written by PHP and read by nobody, so every option
     * on that screen was inert in the product gallery: privacy mode still
     * embedded youtube.com, "Show player controls" never reached the embed,
     * and "Autoplay first video" was emitted as data-autoplay and ignored.
     */
    var config = (function () {
        var el = document.getElementById('tubebay-gallery-data');

        if (!el) {
            return {};
        }

        try {
            return JSON.parse(el.getAttribute('data-config') || '{}') || {};
        } catch (e) {
            return {};
        }
    })();

    /**
     * Build the YouTube embed URL for one video.
     *
     * @param {string}  videoId Video ID.
     * @param {boolean} muted   Force muted playback (autoplay without a click
     *                          is blocked by browsers unless it is muted).
     * @return {string} Embed URL.
     */
    function youtubeEmbedUrl(videoId, muted) {
        // Privacy/GDPR mode: youtube-nocookie.com sets no cookies until play.
        var host = config.privacy_mode
            ? 'https://www.youtube-nocookie.com'
            : 'https://www.youtube.com';

        var params = ['autoplay=1', 'rel=0'];

        // Absent means "controls shown" — that is YouTube's own default, so
        // only the OFF case needs a parameter.
        if (config.show_controls === false) {
            params.push('controls=0');
        }

        // Absent means "fullscreen allowed" (the setting defaults to true).
        if (config.allow_fullscreen === false) {
            params.push('fs=0');
        }

        if (muted) {
            params.push('mute=1');
        }

        return host + '/embed/' + encodeURIComponent(videoId) + '?' + params.join('&');
    }

    /**
     * Swap a facade for a real player.
     *
     * @param {Element} facade The .tubebay-video-facade element.
     * @param {boolean} muted  Start muted.
     */
    function playFacade(facade, muted) {
        if (facade.classList.contains('tubebay-playing')) {
            return;
        }

        facade.classList.add('tubebay-playing');

        var videoId = facade.getAttribute('data-video-id');
        var videoType = facade.getAttribute('data-video-type') || 'youtube';

        // Clear the image and play button
        facade.innerHTML = '';
        facade.style.cursor = 'default';

        if (videoType === 'youtube') {
            var iframe = document.createElement('iframe');
            iframe.setAttribute('src', youtubeEmbedUrl(videoId, muted));
            iframe.setAttribute('frameborder', '0');

            // Absent means "picture-in-picture allowed" (the setting defaults to true).
            var allowTokens = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope';
            if (config.allow_pip !== false) {
                allowTokens += '; picture-in-picture';
            }
            iframe.setAttribute('allow', allowTokens);

            if (config.allow_fullscreen !== false) {
                iframe.setAttribute('allowfullscreen', 'true');
            }

            /*
             * Required on sites whose Referrer-Policy withholds the referrer
             * cross-origin (same-origin, no-referrer, ...). YouTube verifies
             * the embedding domain from the referrer and answers "Error 153 --
             * Video player configuration error" when it gets none. Matches the
             * value in YouTube's own oEmbed markup.
             */
            iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');

            iframe.style.position = 'absolute';
            iframe.style.top = '0';
            iframe.style.left = '0';
            iframe.style.width = '100%';
            iframe.style.height = '100%';

            facade.appendChild(iframe);
        } else if (videoType === 'self_hosted') {
            var videoUrl = facade.getAttribute('data-video-url');
            var mimeType = facade.getAttribute('data-mime-type') || 'video/mp4';

            var video = document.createElement('video');

            if (config.show_controls !== false) {
                video.setAttribute('controls', 'controls');
            }

            video.setAttribute('autoplay', 'autoplay');
            video.setAttribute('playsinline', 'playsinline');

            if (config.allow_fullscreen === false) {
                video.setAttribute('controlsList', 'nofullscreen');
            }

            if (config.allow_pip === false) {
                // Attribute for markup parity, property for the live element.
                video.setAttribute('disablepictureinpicture', '');
                video.disablePictureInPicture = true;
            }

            if (muted) {
                // Both: the attribute is what the autoplay policy inspects,
                // the property is what actually mutes an already-live element.
                video.setAttribute('muted', 'muted');
                video.muted = true;
            }

            video.style.position = 'absolute';
            video.style.top = '0';
            video.style.left = '0';
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'contain';
            video.style.background = '#000';

            var source = document.createElement('source');
            source.setAttribute('src', videoUrl);
            source.setAttribute('type', mimeType);
            video.appendChild(source);

            facade.appendChild(video);
        }
    }

    /*
     * "Autoplay the first video (muted)". PHP marks the intended facade with
     * data-autoplay="true"; only the first one ever carries it, and it fires
     * once per page load. Muted is not optional — an unmuted autoplay is
     * blocked outright by every current browser.
     */
    var autoplayDone = false;

    function autoplayFirstVideo() {
        if (autoplayDone) {
            return;
        }

        var target = document.querySelector('.tubebay-video-facade[data-autoplay="true"]');

        if (!target) {
            return;
        }

        autoplayDone = true;
        playFacade(target, true);
    }

    function bindVideoFacades() {
        // Find all video facades on the page that haven't been bound yet
        const facades = document.querySelectorAll('.tubebay-video-facade:not(.tubebay-bound)');

        facades.forEach(function (facade) {
            facade.classList.add('tubebay-bound');
            
            // Direct click listener exactly like the old code
            facade.addEventListener('click', function (e) {
                // Stop WooCommerce from trying to open the image Lightbox or sliding
                e.preventDefault();
                e.stopPropagation();

                // A deliberate click plays with sound.
                playFacade(this, false);
            });
        });
    }

    /**
     * Does this node contain (or is it) a video facade / video slide?
     *
     * @param {Node} node Added node.
     * @return {boolean}
     */
    function hasFacade(node) {
        if (!node || node.nodeType !== 1) {
            return false;
        }

        var sel = '.tubebay-video-facade, .tubebay-video-slide';

        return node.matches(sel) || !!node.querySelector(sel);
    }

    var bindQueued = false;

    /**
     * Coalesce a burst of mutations (FlexSlider clones several slides at
     * once) into a single bind on the next frame.
     */
    function queueBind() {
        if (bindQueued) {
            return;
        }

        bindQueued = true;

        window.requestAnimationFrame(function () {
            bindQueued = false;
            bindVideoFacades();
            bindDescriptions();
        });
    }

    /**
     * Re-bind whenever gallery nodes are added. WooCommerce's FlexSlider
     * clones slides after init (racy by nature), and the variation image swap
     * rebuilds them too. Replaces the old event hook and timer retries.
     * bindVideoFacades() is idempotent (.tubebay-bound), so extra calls are
     * harmless.
     */
    function observeGallery() {
        if (!window.MutationObserver) {
            return;
        }

        var galleries = document.querySelectorAll('.woocommerce-product-gallery');
        var scoped = galleries.length > 0;

        var observer = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var added = mutations[i].addedNodes;

                for (var j = 0; j < added.length; j++) {
                    // Inside a gallery any added element may be a clone;
                    // on the body fallback only act on facade-bearing nodes.
                    if (scoped ? added[j].nodeType === 1 : hasFacade(added[j])) {
                        queueBind();
                        return;
                    }
                }
            }
        });

        var options = { childList: true, subtree: true };

        if (scoped) {
            galleries.forEach(function (gallery) {
                observer.observe(gallery, options);
            });
        } else {
            observer.observe(document.body, options);
        }
    }

    /*
     * Video description under the gallery (gal-34).
     *
     * PHP prints data-description on a .tubebay-video-facade only when
     * "Show description" is on, so with the setting off no facade carries the
     * attribute, no gallery qualifies, and this block adds nothing to the DOM.
     *
     * One panel per gallery, inserted straight after .woocommerce-product-gallery
     * (never inside the FlexSlider viewport). It mirrors the ACTIVE slide: shown
     * with that video's description, hidden for image slides or an empty value.
     * The text is written with textContent only, so markup in a description is
     * displayed literally; line breaks are kept by CSS (white-space: pre-line).
     *
     * Strings are plain English: public.js has no i18n path today. A host can
     * override them via config.i18n.show_more / config.i18n.show_less.
     */
    var descI18n = config.i18n || {};
    var descMoreLabel = descI18n.show_more || 'Show more';
    var descLessLabel = descI18n.show_less || 'Show less';
    var descSeq = 0;

    function galleryHasDescriptions(gallery) {
        var facades = gallery.querySelectorAll('.tubebay-video-facade[data-description]');

        for (var i = 0; i < facades.length; i++) {
            if ((facades[i].getAttribute('data-description') || '').trim() !== '') {
                return true;
            }
        }

        return false;
    }

    /**
     * The facade of the slide FlexSlider currently shows, or null for an image
     * slide. Clones are ignored. Without FlexSlider (no active class) the
     * first real slide is the visible one.
     */
    function activeVideoFacade(gallery) {
        var slide = gallery.querySelector('.woocommerce-product-gallery__image.flex-active-slide:not(.clone)');

        if (!slide && !gallery.querySelector('.flexslider, .flex-viewport')) {
            slide = gallery.querySelector('.woocommerce-product-gallery__image:not(.clone)');
        }

        return slide ? slide.querySelector('.tubebay-video-facade') : null;
    }

    function createDescriptionPanel() {
        var panel = document.createElement('div');
        var text = document.createElement('div');
        var toggle = document.createElement('button');
        var id = 'tubebay-video-description-' + (++descSeq);

        panel.className = 'tubebay-video-description';
        panel.setAttribute('aria-live', 'polite');
        panel.hidden = true;

        text.className = 'tubebay-video-description__text';
        text.id = id;

        toggle.type = 'button';
        toggle.className = 'tubebay-video-description__toggle';
        toggle.setAttribute('aria-controls', id);
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = descMoreLabel;
        toggle.hidden = true;

        toggle.addEventListener('click', function () {
            var expand = toggle.getAttribute('aria-expanded') !== 'true';

            panel.classList.toggle('is-expanded', expand);
            toggle.setAttribute('aria-expanded', expand ? 'true' : 'false');
            toggle.textContent = expand ? descLessLabel : descMoreLabel;
        });

        panel.appendChild(text);
        panel.appendChild(toggle);
        
        return { panel: panel, text: text, toggle: toggle, current: null, overflow: false };
    }

    /**
     * Where the panel lives. Normally directly after the gallery element. But
     * themes such as Storefront float the gallery into a left column, and a
     * block (or float) placed after it would flow into / push down the summary
     * column. For a floated gallery the panel is therefore appended as the
     * gallery's last child (after the slider viewport and thumbnail rail, never
     * inside the viewport), which keeps it in the gallery's own column.
     */
    function placeDescription(gallery, state) {
        var floated = window.getComputedStyle(gallery).float;
        var inside = floated === 'left' || floated === 'right';
        var panel = state.panel;

        if (inside) {
            if (panel.parentNode !== gallery || gallery.lastElementChild !== panel) {
                gallery.appendChild(panel);
            }
        } else if (panel.previousElementSibling !== gallery || panel.parentNode !== gallery.parentNode) {
            if (gallery.parentNode) {
                gallery.parentNode.insertBefore(panel, gallery.nextSibling);
            }
        }
    }

    /** Show "Show more" only when the collapsed text is actually cut off. */
    function measureDescription(state) {
        if (state.panel.hidden || state.panel.classList.contains('is-expanded')) {
            return;
        }

        var cut = state.text.scrollHeight - state.text.clientHeight > 1;

        state.overflow = cut;
        state.toggle.hidden = !cut;
    }

    function syncDescription(gallery) {
        var state = gallery.tubebayDesc;

        if (!state) {
            return;
        }

        placeDescription(gallery, state);

        var facade = gallery.classList.contains('tubebaypro-mode-images') ? null : activeVideoFacade(gallery);
        var description = facade ? (facade.getAttribute('data-description') || '') : '';

        if (description.trim() === '') {
            facade = null;
        }

        // Nothing changed (class churn from sticky/playing state, etc.).
        if (facade === state.current && (facade || state.panel.hidden)) {
            return;
        }

        state.current = facade;

        if (!facade) {
            state.panel.hidden = true;
            state.text.textContent = '';
            state.toggle.hidden = true;
            return;
        }

        state.panel.classList.remove('is-expanded');
        state.toggle.setAttribute('aria-expanded', 'false');
        state.toggle.textContent = descMoreLabel;
        state.text.textContent = description;
        state.panel.hidden = false;
        measureDescription(state);
    }

    function bindDescriptions() {
        var galleries = document.querySelectorAll('.woocommerce-product-gallery');

        galleries.forEach(function (gallery) {
            if (!gallery.tubebayDesc) {
                if (!gallery.parentNode || !galleryHasDescriptions(gallery)) {
                    return;
                }

                gallery.tubebayDesc = createDescriptionPanel();
            }

            if (!gallery.tubebayDescBound) {
                gallery.tubebayDescBound = true;

                // FlexSlider flips .flex-active-slide on every slide change.
                if (window.MutationObserver) {
                    new MutationObserver(function () {
                        syncDescription(gallery);
                    }).observe(gallery, { attributes: true, attributeFilter: ['class'], subtree: true });
                }

                // Backup for arrows/thumbs where the class lands a beat later.
                gallery.addEventListener('click', function () {
                    window.setTimeout(function () { syncDescription(gallery); }, 60);
                    window.setTimeout(function () { syncDescription(gallery); }, 400);
                });
            }

            syncDescription(gallery);
        });
    }

    var descResizeTimer = null;

    window.addEventListener('resize', function () {
        window.clearTimeout(descResizeTimer);
        descResizeTimer = window.setTimeout(function () {
            document.querySelectorAll('.woocommerce-product-gallery').forEach(function (gallery) {
                if (gallery.tubebayDesc) {
                    placeDescription(gallery, gallery.tubebayDesc);
                    measureDescription(gallery.tubebayDesc);
                }
            });
        }, 150);
    });

    // Initial bind, then keep watching for cloned/re-rendered slides.
    bindVideoFacades();
    bindDescriptions();
    autoplayFirstVideo();
    observeGallery();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tubebayInitGallery);
} else {
    tubebayInitGallery();
}
