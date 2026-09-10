document.addEventListener('DOMContentLoaded', function () {

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
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
            iframe.setAttribute('allowfullscreen', 'true');

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

    // 1. Bind immediately on load
    bindVideoFacades();
    autoplayFirstVideo();

    // 2. Bind when WooCommerce FlexSlider initializes (to catch cloned slides)
    if (window.jQuery) {
        window.jQuery(document).on('woocommerce_gallery_init_flexslider', function() {
            bindVideoFacades();
            setTimeout(bindVideoFacades, 100);
            setTimeout(bindVideoFacades, 500);
        });
    }
    
    setTimeout(bindVideoFacades, 1000);
});
