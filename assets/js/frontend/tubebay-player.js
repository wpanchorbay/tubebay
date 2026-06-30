/**
 * TubeBay Player
 * Handles HTML generation and lifecycle of YouTube and Self-Hosted players.
 */
(function() {
    window.TubeBayPlayer = {
        createPlayerHtml: function(videoId, type, autoPlay, videoUrl, mimeType, posterUrl) {
            const configEl = document.getElementById('tubebay-gallery-data');
            let config = { privacy_mode: false };
            if (configEl && configEl.dataset.config) {
                try { config = JSON.parse(configEl.dataset.config); } catch(e) {}
            }

            if (type === 'youtube') {
                const domain = config.privacy_mode ? 'youtube-nocookie.com' : 'youtube.com';
                let src = `https://www.${domain}/embed/${videoId}?rel=0`;

                if (autoPlay) src += '&autoplay=1';

                return `<iframe
                    src="${src}"
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen>
                </iframe>`;
            } else if (type === 'self_hosted') {
                let attrs = 'controls playsinline style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; background: #000;"';
                if (autoPlay) attrs += ' autoplay';
                if (posterUrl) attrs += ` poster="${posterUrl}"`;

                return `<video ${attrs}>
                    <source src="${videoUrl}" type="${mimeType || 'video/mp4'}">
                    Your browser does not support the video tag.
                </video>`;
            }
        },

        pauseAll: function(container) {
            if (!container) container = document;

            // Pause iframes
            const iframes = container.querySelectorAll('iframe[src*="youtube"]');
            iframes.forEach(iframe => {
                iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');

                // Fallback: reset src to stop playback completely
                const src = iframe.src;
                iframe.src = src;
            });

            // Pause native video
            const videos = container.querySelectorAll('video');
            videos.forEach(video => {
                video.pause();
            });
        }
    };
})();
