/**
 * TubeBay Lightbox
 * Pure Vanilla JS Lightbox for video playback.
 */
(function() {
    let lightboxOverlay = null;
    let lightboxContent = null;

    function createLightbox() {
        if (lightboxOverlay) return;

        lightboxOverlay = document.createElement('div');
        lightboxOverlay.className = 'tubebay-lightbox-overlay';

        const closeBtn = document.createElement('div');
        closeBtn.className = 'tubebay-lightbox-close';
        closeBtn.innerHTML = '&times;';

        lightboxContent = document.createElement('div');
        lightboxContent.className = 'tubebay-lightbox-content';

        lightboxOverlay.appendChild(closeBtn);
        lightboxOverlay.appendChild(lightboxContent);
        document.body.appendChild(lightboxOverlay);

        // Events
        closeBtn.addEventListener('click', closeLightbox);
        lightboxOverlay.addEventListener('click', function(e) {
            if (e.target === lightboxOverlay) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && lightboxOverlay.classList.contains('tubebay-active')) {
                closeLightbox();
            }
        });
    }

    function openLightbox(htmlContent) {
        createLightbox();
        lightboxContent.innerHTML = htmlContent;

        // Ensure auto-play triggers correctly on mobile if applicable
        const videoEl = lightboxContent.querySelector('video');
        if (videoEl) {
            videoEl.play().catch(e => console.log('Lightbox auto-play prevented', e));
        }

        lightboxOverlay.classList.add('tubebay-active');
        document.body.style.overflow = 'hidden'; // prevent bg scroll

        // Add swipe support for mobile
        let touchstartY = 0;
        let touchendY = 0;

        lightboxOverlay.addEventListener('touchstart', function(e) {
            touchstartY = e.changedTouches[0].screenY;
        }, { passive: true });

        lightboxOverlay.addEventListener('touchend', function(e) {
            touchendY = e.changedTouches[0].screenY;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            // If swiped down or up more than 50px, close
            if (Math.abs(touchendY - touchstartY) > 50) {
                closeLightbox();
            }
        }
    }

    function closeLightbox() {
        if (!lightboxOverlay) return;

        // Stop videos
        if (window.TubeBayPlayer) {
            window.TubeBayPlayer.pauseAll(lightboxContent);
        }

        lightboxContent.innerHTML = '';
        lightboxOverlay.classList.remove('tubebay-active');
        document.body.style.overflow = '';
    }

    window.TubeBayLightbox = {
        open: openLightbox,
        close: closeLightbox
    };
})();
