/**
 * TubeBay Video Facade (Lazy Loading)
 * Loads the actual player (iframe or video) only when the facade is clicked.
 */
document.addEventListener('DOMContentLoaded', function() {
    function initFacades() {
        const facades = document.querySelectorAll('.tubebay-video-facade:not(.tubebay-gallery-facade)');

        facades.forEach(function(facade) {
            if (facade.dataset.initialized) return;
            facade.dataset.initialized = 'true';

            if (facade.dataset.autoplay === 'true' && 'IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            activateFacade(facade);
                            observer.disconnect();
                        }
                    });
                });
                observer.observe(facade);
            }

            facade.addEventListener('click', function(e) {
                e.preventDefault();
                activateFacade(this);
            });
        });
    }

    function activateFacade(facade) {
        const videoId = facade.dataset.videoId;
        const videoType = facade.dataset.videoType || 'youtube';
        const videoUrl = facade.dataset.videoUrl;
        const mimeType = facade.dataset.mimeType;
        const posterUrl = facade.dataset.poster;

        if (window.TubeBayPlayer) {
            const playerHtml = window.TubeBayPlayer.createPlayerHtml(videoId, videoType, true, videoUrl, mimeType, posterUrl);

            const container = facade.parentElement;
            container.innerHTML = playerHtml;

            if (videoType === 'self_hosted') {
                const videoEl = container.querySelector('video');
                if (videoEl) {
                    videoEl.play().catch(e => console.log('Autoplay prevented:', e));
                }
            }
        }
    }

    window.TubeBayFacade = {
        init: initFacades,
        activate: activateFacade
    };

    initFacades();
});
