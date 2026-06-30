document.addEventListener('DOMContentLoaded', function () {
    
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

                const videoId = this.getAttribute('data-video-id');
                const videoType = this.getAttribute('data-video-type') || 'youtube';

                // Clear the image and play button
                this.innerHTML = '';
                this.style.cursor = 'default';

                if (videoType === 'youtube') {
                    // Create the iframe exactly like old time
                    const iframe = document.createElement('iframe');
                    iframe.setAttribute('src', 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0');
                    iframe.setAttribute('frameborder', '0');
                    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
                    iframe.setAttribute('allowfullscreen', 'true');
                    
                    iframe.style.position = 'absolute';
                    iframe.style.top = '0';
                    iframe.style.left = '0';
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                    
                    this.appendChild(iframe);
                } else if (videoType === 'self_hosted') {
                    // Same simple approach for self-hosted
                    const videoUrl = this.getAttribute('data-video-url');
                    const mimeType = this.getAttribute('data-mime-type') || 'video/mp4';
                    
                    const video = document.createElement('video');
                    video.setAttribute('controls', 'controls');
                    video.setAttribute('autoplay', 'autoplay');
                    video.setAttribute('playsinline', 'playsinline');
                    video.style.position = 'absolute';
                    video.style.top = '0';
                    video.style.left = '0';
                    video.style.width = '100%';
                    video.style.height = '100%';
                    video.style.objectFit = 'contain';
                    video.style.background = '#000';
                    
                    const source = document.createElement('source');
                    source.setAttribute('src', videoUrl);
                    source.setAttribute('type', mimeType);
                    video.appendChild(source);
                    
                    this.appendChild(video);
                }
            });
        });
    }

    // 1. Bind immediately on load
    bindVideoFacades();

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
