// Custom lightbox module for TubeBay video galleries
document.addEventListener('DOMContentLoaded', function() {
    var gallery = document.querySelector('.woocommerce-product-gallery');

    // Inject custom variables for the lightbox
    if (gallery) {
        gallery.addEventListener('click', function(e) {
            var slide = e.target.closest('.tubebay-video-slide');
            if (!slide) return;

            // Allow native link behaviors or gallery if configured
            var wrapper = slide.querySelector('.tubebay-video-facade');
            if (wrapper) {
                e.preventDefault();
                e.stopPropagation(); // prevent wc gallery lightbox

                var vidId = wrapper.getAttribute('data-video-id');
                var vidType = wrapper.getAttribute('data-video-type') || 'youtube';

                // If it's inline mode, replace facade with iframe/video
                var isLightboxMode = window.tubebaySettings && window.tubebaySettings.galleryMode === 'lightbox';

                if (isLightboxMode) {
                    if (typeof tubebayLightbox !== 'undefined') {
                        tubebayLightbox.open(slide);
                    }
                } else {
                    var container = slide.querySelector('.tubebay-video-wrapper');
                    if (!container) return;

                    var autoplay = 1;
                    var mute = 1;

                    if (vidType === 'youtube') {
                        var privacyMode = window.tubebaySettings && window.tubebaySettings.privacyMode;
                        var domain = privacyMode ? 'www.youtube-nocookie.com' : 'www.youtube.com';
                        var controls = (window.tubebaySettings && window.tubebaySettings.showControls === false) ? 0 : 1;
                        var iframe = document.createElement('iframe');
                        iframe.src = 'https://' + domain + '/embed/' + vidId + '?autoplay=' + autoplay + '&mute=' + mute + '&rel=0&controls=' + controls;
                        iframe.style.position = 'absolute';
                        iframe.style.top = '0';
                        iframe.style.left = '0';
                        iframe.style.width = '100%';
                        iframe.style.height = '100%';
                        iframe.style.border = '0';
                        iframe.setAttribute('allowfullscreen', 'true');
                        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');

                        container.innerHTML = '';
                        container.appendChild(iframe);
                    } else {
                        var video = document.createElement('video');
                        video.src = vidId;
                        video.style.position = 'absolute';
                        video.style.top = '0';
                        video.style.left = '0';
                        video.style.width = '100%';
                        video.style.height = '100%';
                        video.style.objectFit = 'contain';

                        if (autoplay) video.setAttribute('autoplay', '');
                        if (mute) video.setAttribute('muted', '');
                        video.setAttribute('playsinline', '');

                        var showControls = !(window.tubebaySettings && window.tubebaySettings.showControls === false);
                        if (showControls) video.setAttribute('controls', '');

                        var poster = slide.getAttribute('data-tubebay-poster');
                        if (poster) {
                            video.setAttribute('poster', poster);
                        }

                        container.innerHTML = '';
                        container.appendChild(video);
                        video.play().catch(function(e){ console.log("Autoplay prevented:", e); });
                    }
                }
            }
        }, true);
    }
});

// Lightbox Module
window.tubebayLightbox = (function() {
    var overlay, contentContainer, currentVideoIndex = -1, allVideos = [];

    function init() {
        if (document.getElementById('tubebay-lightbox')) return;

        overlay = document.createElement('div');
        overlay.id = 'tubebay-lightbox';
        overlay.className = 'tubebay-lightbox-overlay';

        var content = document.createElement('div');
        content.className = 'tubebay-lightbox-content';

        contentContainer = document.createElement('div');
        contentContainer.className = 'tubebay-responsive-iframe-container';

        var closeBtn = document.createElement('button');
        closeBtn.className = 'tubebay-lightbox-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = close;

        var prevBtn = document.createElement('button');
        prevBtn.className = 'tubebay-lightbox-nav tubebay-lightbox-prev';
        prevBtn.innerHTML = '&lsaquo;';
        prevBtn.onclick = prev;
        prevBtn.style.display = 'none'; // hide until needed

        var nextBtn = document.createElement('button');
        nextBtn.className = 'tubebay-lightbox-nav tubebay-lightbox-next';
        nextBtn.innerHTML = '&rsaquo;';
        nextBtn.onclick = next;
        nextBtn.style.display = 'none';

        content.appendChild(closeBtn);
        content.appendChild(contentContainer);
        overlay.appendChild(prevBtn);
        overlay.appendChild(nextBtn);
        overlay.appendChild(content);

        document.body.appendChild(overlay);

        // Close on overlay click
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                close();
            }
        });

        // Close on ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && overlay.classList.contains('tubebay-lightbox-open')) {
                close();
            } else if (e.key === 'ArrowLeft') {
                prev();
            } else if (e.key === 'ArrowRight') {
                next();
            }
        });

        // Swipe support for mobile
        var touchstartX = 0;
        var touchendX = 0;

        overlay.addEventListener('touchstart', function(e) {
            touchstartX = e.changedTouches[0].screenX;
        }, {passive: true});

        overlay.addEventListener('touchend', function(e) {
            touchendX = e.changedTouches[0].screenX;
            handleSwipe();
        }, {passive: true});

        function handleSwipe() {
            if (touchendX < touchstartX - 50) next();
            if (touchendX > touchstartX + 50) prev();
        }
    }

    function open(slideEl) {
        init();

        // Gather all videos on page
        var slides = document.querySelectorAll('.tubebay-video-slide');
        allVideos = [];
        for (var i = 0; i < slides.length; i++) {
            var wrapper = slides[i].querySelector('.tubebay-video-facade');
            if (wrapper) {
                allVideos.push(slides[i]);
                if (slides[i] === slideEl) {
                    currentVideoIndex = allVideos.length - 1;
                }
            }
        }

        renderCurrent();
        overlay.classList.add('tubebay-lightbox-open');
    }

    function renderCurrent() {
        if (currentVideoIndex < 0 || currentVideoIndex >= allVideos.length) return;

        var slide = allVideos[currentVideoIndex];
        var wrapper = slide.querySelector('.tubebay-video-facade');
        if (!wrapper) return;

        var vidId = wrapper.getAttribute('data-video-id');
        var vidType = wrapper.getAttribute('data-video-type') || 'youtube';
        var autoplay = 1; // Always autoplay when opening lightbox
        var mute = 0; // Don't mute in lightbox usually

        contentContainer.innerHTML = '';

        if (vidType === 'youtube') {
            var privacyMode = window.tubebaySettings && window.tubebaySettings.privacyMode;
            var domain = privacyMode ? 'www.youtube-nocookie.com' : 'www.youtube.com';
            var controls = (window.tubebaySettings && window.tubebaySettings.showControls === false) ? 0 : 1;

            var iframe = document.createElement('iframe');
            iframe.src = 'https://' + domain + '/embed/' + vidId + '?autoplay=' + autoplay + '&mute=' + mute + '&rel=0&controls=' + controls;
            iframe.style.position = 'absolute';
            iframe.style.top = '0';
            iframe.style.left = '0';
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = '0';
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');

            contentContainer.appendChild(iframe);
        } else {
            var video = document.createElement('video');
            video.src = vidId;
            video.style.position = 'absolute';
            video.style.top = '0';
            video.style.left = '0';
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'contain';

            if (autoplay) video.setAttribute('autoplay', '');
            if (mute) video.setAttribute('muted', '');
            video.setAttribute('playsinline', '');

            var showControls = !(window.tubebaySettings && window.tubebaySettings.showControls === false);
            if (showControls) video.setAttribute('controls', '');

            var poster = slide.getAttribute('data-tubebay-poster');
            if (poster) {
                video.setAttribute('poster', poster);
            }

            contentContainer.appendChild(video);
            video.play().catch(function(e){ console.log("Autoplay prevented:", e); });
        }

        // Update nav buttons
        var prevBtn = overlay.querySelector('.tubebay-lightbox-prev');
        var nextBtn = overlay.querySelector('.tubebay-lightbox-next');

        if (allVideos.length > 1) {
            prevBtn.style.display = 'block';
            nextBtn.style.display = 'block';
        } else {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        }
    }

    function close() {
        if (!overlay) return;
        overlay.classList.remove('tubebay-lightbox-open');
        setTimeout(function() {
            contentContainer.innerHTML = '';
        }, 300);
    }

    function prev(e) {
        if (e) e.stopPropagation();
        if (allVideos.length <= 1) return;
        currentVideoIndex--;
        if (currentVideoIndex < 0) currentVideoIndex = allVideos.length - 1;
        renderCurrent();
    }

    function next(e) {
        if (e) e.stopPropagation();
        if (allVideos.length <= 1) return;
        currentVideoIndex++;
        if (currentVideoIndex >= allVideos.length) currentVideoIndex = 0;
        renderCurrent();
    }

    return {
        open: open,
        close: close
    };
})();
// Adds logic to pause videos when WooCommerce FlexSlider changes slides
document.addEventListener('DOMContentLoaded', function() {
    var $ = window.jQuery;
    if (typeof $ !== 'undefined') {
        $('.woocommerce-product-gallery').on('afterChange', function(event, slick, currentSlide) {
             pauseAllVideos();
        });

        // WooCommerce default gallery uses FlexSlider
        $('.woocommerce-product-gallery').on('woocommerce_gallery_after_slide_change', function() {
             pauseAllVideos();
        });
    }

    function pauseAllVideos() {
        var iframes = document.querySelectorAll('.woocommerce-product-gallery iframe');
        for (var i = 0; i < iframes.length; i++) {
            iframes[i].contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        }
        var videos = document.querySelectorAll('.woocommerce-product-gallery video');
        for (var j = 0; j < videos.length; j++) {
            videos[j].pause();
        }
    }
});
