/**
 * TubeBay Gallery Integration
 * Injects videos into WooCommerce's native FlexSlider gallery and handles interactions.
 */
document.addEventListener('DOMContentLoaded', function() {
    // Only run if we are on a product page with the gallery and our data
    const flexsliderElement = document.querySelector('.woocommerce-product-gallery');
    if (!flexsliderElement) return;

    const galleryDataEl = document.getElementById('tubebay-gallery-data');
    if (!galleryDataEl) return; // No videos

    let config = { player_mode: 'inline', placement: 'first' };
    try {
        config = JSON.parse(galleryDataEl.dataset.config);
    } catch (e) {}

    // Find all injected videos
    // They are currently sitting inside the flexslider directly, or right before/after the main image
    const videos = Array.from(document.querySelectorAll('.woocommerce-product-gallery__image.tubebay-virtual-slide'));

    if (videos.length === 0) return;

    // WooCommerce initializes Flexslider usually on window load.
    // If placement is 'last' or 'mixed', we must physically move the HTML nodes
    // to the correct spot within the gallery before FlexSlider initializes.
    // By default, PHP injected them all at the beginning (because of how the filter fires).
    const galleryWrapper = flexsliderElement.querySelector('.woocommerce-product-gallery__wrapper');
    if (galleryWrapper) {
        if (config.placement === 'last') {
            // Move all videos to the end of the wrapper
            videos.forEach(video => {
                galleryWrapper.appendChild(video);
            });
        }
        // If 'mixed', it follows the drag-drop order exactly as output by PHP, so we do nothing.
    }

    // Now mark them so facade.js doesn't touch them independently
    videos.forEach(videoSlide => {
        const facade = videoSlide.querySelector('.tubebay-video-facade');
        if (facade) {
            facade.classList.add('tubebay-gallery-facade');

            facade.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation(); // Stop flexslider from doing weird things

                const videoId = this.dataset.videoId;
                const videoType = this.dataset.videoType;
                const videoUrl = this.dataset.videoUrl;
                const mimeType = this.dataset.mimeType;
                const posterUrl = this.dataset.poster;

                if (config.player_mode === 'lightbox') {
                    if (window.TubeBayPlayer && window.TubeBayLightbox) {
                        const html = window.TubeBayPlayer.createPlayerHtml(videoId, videoType, true, videoUrl, mimeType, posterUrl);
                        window.TubeBayLightbox.open(html);
                    }
                } else {
                    // Inline mode
                    if (window.TubeBayPlayer) {
                        const html = window.TubeBayPlayer.createPlayerHtml(videoId, videoType, true, videoUrl, mimeType, posterUrl);
                        this.parentElement.innerHTML = html;

                        if (videoType === 'self_hosted') {
                            const videoEl = this.parentElement.querySelector('video');
                            if (videoEl) videoEl.play().catch(e => console.log('Autoplay prevented', e));
                        }
                    }
                }
            });

            // Handle intersection observer for autoplay first video
            if (facade.dataset.autoplay === 'true' && config.player_mode !== 'lightbox' && 'IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            facade.click();
                            observer.disconnect();
                        }
                    });
                });
                observer.observe(facade);
            }
        }
    });

    // Hook into Flexslider slide change to pause videos when swiping away
    if (window.jQuery) {
        jQuery(flexsliderElement).on('woocommerce_gallery_init_flexslider', function() {
            // Need to get the flexslider instance once it's built
            setTimeout(() => {
                const flexslider = jQuery(flexsliderElement).data('flexslider');
                if (flexslider) {
                    // Overwrite before/after methods safely
                    const originalBefore = flexslider.vars.before;
                    flexslider.vars.before = function(slider) {
                        if (typeof originalBefore === 'function') originalBefore(slider);

                        // Pause everything
                        if (window.TubeBayPlayer) {
                            window.TubeBayPlayer.pauseAll(galleryWrapper);
                        }
                    };
                }
            }, 100);
        });
    }
});
