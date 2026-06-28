jQuery(document).ready(function ($) {
    var modal = $('#tubebay-video-modal');
    var ytSelectBtn = $('#tubebay_select_video_btn');
    var addSelfHostedBtn = $('#tubebay_add_self_hosted_btn');
    var closeModal = $('.tubebay-modal-close');
    var overlay = $('.tubebay-modal-overlay');

    var videoGrid = $('#tubebay-modal-video-grid');
    var searchInput = $('#tubebay-modal-search');
    var sortSelect = $('#tubebay-modal-sort');
    var loadMoreBtn = $('#tubebay-modal-load-more');
    var loadMoreContainer = $('#tubebay-modal-footer');

    var selectedVideoList = $('#tubebay-selected-video-list');
    var hiddenInput = $('#tubebay_video_ids');

    var isLoaded = false;
    var currentSearch = '';
    var currentSort = 'date_desc';
    var nextPageToken = null;
    var searchTimeout = null;
    var isLoading = false;
    var isConnected = !!tubebayMetabox.isConnected;
    var maxVideos = parseInt(tubebayMetabox.maxVideos, 10);
    if (isNaN(maxVideos)) maxVideos = 0;

    // Load initial videos from hidden input
    var selectedVideos = [];
    try {
        var val = hiddenInput.val();
        if (val) {
            selectedVideos = JSON.parse(val);
        }
    } catch (e) {
        console.error("TubeBay: Error parsing initial video IDs", e);
        selectedVideos = [];
    }

    if (!Array.isArray(selectedVideos)) {
        selectedVideos = [];
    }

    renderSelectedVideos();

    // Initialize Sortable
    if (typeof Sortable !== 'undefined' && selectedVideoList.length) {
        new Sortable(selectedVideoList[0], {
            animation: 150,
            handle: '.tubebay-drag-handle',
            onEnd: function (evt) {
                // Reorder array based on DOM
                var newArray = [];
                selectedVideoList.find('.tubebay-video-card').each(function() {
                    var index = $(this).data('index');
                    if (selectedVideos[index]) {
                        newArray.push(selectedVideos[index]);
                    }
                });
                selectedVideos = newArray;
                updateHiddenInput();
                renderSelectedVideos(); // re-render to update data-index
            }
        });
    }

    function updateHiddenInput() {
        hiddenInput.val(JSON.stringify(selectedVideos));

        // Hide/show add buttons based on max limit
        if (maxVideos > 0 && selectedVideos.length >= maxVideos) {
            $('#tubebay-add-video-container').hide();
        } else {
            $('#tubebay-add-video-container').show();
        }

        // Hide/show autoplay settings
        if (selectedVideos.length > 0) {
            $('#tubebay-autoplay-setting').show();
        } else {
            $('#tubebay-autoplay-setting').hide();
        }
    }

    function renderSelectedVideos() {
        selectedVideoList.empty();

        if (selectedVideos.length === 0) {
            updateHiddenInput();
            return;
        }

        selectedVideos.forEach(function(video, index) {
            var title = video.title || (video.type === 'self-hosted' ? tubebayMetabox.i18n.selfHosted : 'YouTube Video');
            var thumb = video.thumbnail || (video.type === 'youtube' && video.id ? 'https://i.ytimg.com/vi/' + video.id + '/hqdefault.jpg' : '');

            var html = '<div class="tubebay-video-card" data-index="' + index + '">';
            html += '<div class="tubebay-drag-handle" title="Drag to reorder"><span class="dashicons dashicons-menu"></span></div>';

            html += '<div class="tubebay-video-thumbnail-wrap">';
            if (thumb) {
                html += '<img src="' + thumb + '" alt="Thumbnail" />';
            } else {
                html += '<div class="tubebay-no-thumb"><span class="dashicons dashicons-video-alt3"></span></div>';
            }
            html += '<div class="tubebay-play-icon">▶</div>';
            html += '</div>'; // end thumbnail-wrap

            html += '<div class="tubebay-video-details">';
            html += '<p class="tubebay-video-title">' + title + '</p>';

            // Duration input for self-hosted, display for YouTube
            html += '<div class="tubebay-video-meta">';
            if (video.type === 'self-hosted') {
                var dur = video.duration ? video.duration : '';
                html += '<label>' + tubebayMetabox.i18n.duration + ' (sec): <input type="number" class="tubebay-duration-input" data-index="' + index + '" value="' + dur + '" style="width: 60px;" min="0"></label>';
            } else if (video.duration) {
                var m = Math.floor(video.duration / 60);
                var s = video.duration % 60;
                html += '<span>' + tubebayMetabox.i18n.duration + ': ' + m + ':' + (s < 10 ? '0' : '') + s + '</span>';
            }
            html += '</div>'; // end meta

            html += '</div>'; // end details

            html += '<div class="tubebay-video-actions">';
            html += '<button type="button" class="button tubebay-danger-btn tubebay-remove-btn" data-index="' + index + '" title="' + tubebayMetabox.i18n.removeVideo + '"><span class="dashicons dashicons-trash"></span></button>';
            html += '</div>';

            html += '</div>';
            selectedVideoList.append(html);
        });

        updateHiddenInput();
    }

    // Handle remove video
    selectedVideoList.on('click', '.tubebay-remove-btn', function(e) {
        e.preventDefault();
        var index = $(this).data('index');
        selectedVideos.splice(index, 1);
        renderSelectedVideos();
    });

    // Handle duration change for self-hosted
    selectedVideoList.on('change', '.tubebay-duration-input', function() {
        var index = $(this).data('index');
        var val = $(this).val();
        if (selectedVideos[index] && selectedVideos[index].type === 'self-hosted') {
            selectedVideos[index].duration = val ? parseInt(val, 10) : null;
            updateHiddenInput();
        }
    });

    // YouTube Modal logic
    function openModal() {
        if (!isConnected) return;
        if (maxVideos > 0 && selectedVideos.length >= maxVideos) {
            alert('Maximum videos reached.');
            return;
        }
        modal.show();
        if (!isLoaded) {
            fetchVideos();
        }
    }

    function hideModal() {
        modal.hide();
    }

    ytSelectBtn.on('click', function (e) {
        e.preventDefault();
        openModal();
    });

    closeModal.on('click', hideModal);
    overlay.on('click', hideModal);

    // Handle Search Input with debounce
    searchInput.on('input', function () {
        clearTimeout(searchTimeout);
        var query = $(this).val();
        searchTimeout = setTimeout(function () {
            currentSearch = query;
            nextPageToken = null;
            fetchVideos(false);
        }, 500);
    });

    // Handle Sort Change
    sortSelect.on('change', function () {
        currentSort = $(this).val();
        nextPageToken = null;
        fetchVideos(false);
    });

    // Handle Load More
    loadMoreBtn.on('click', function (e) {
        e.preventDefault();
        if (nextPageToken && !isLoading) {
            fetchVideos(true);
        }
    });

    // Fetch YouTube videos via REST API
    function fetchVideos(isLoadMore) {
        if (isLoading) return;

        isLoading = true;

        if (!isLoadMore) {
            videoGrid.html('<p class="tubebay-loading-text">' + tubebayMetabox.i18n.loading + '</p>');
            loadMoreContainer.hide();
        } else {
            loadMoreBtn.prop('disabled', true).text(tubebayMetabox.i18n.loading);
        }

        $.ajax({
            url: tubebayMetabox.restUrl,
            method: 'GET',
            data: {
                search: currentSearch,
                sort: currentSort,
                page_token: isLoadMore ? nextPageToken : ''
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-WP-Nonce', tubebayMetabox.nonce);
            },
            success: function (response) {
                if (!isLoadMore) {
                    videoGrid.empty();
                }

                if (response && response.success && response.videos && response.videos.length > 0) {
                    var html = '';
                    response.videos.forEach(function (video) {
                        html += '<div class="tubebay-modal-video-item" data-id="' + video.id + '" data-title="' + video.title.replace(/"/g, '&quot;') + '" data-thumbnail="' + video.thumbnail_url + '" data-duration="' + (video.duration || '') + '">';
                        html += '<img src="' + video.thumbnail_url + '" alt="Thumbnail" />';
                        html += '<p title="' + video.title.replace(/"/g, '&quot;') + '">' + video.title + '</p>';
                        html += '</div>';
                    });

                    videoGrid.append(html);

                    // Add click handlers for the newly loaded items
                    $('.tubebay-modal-video-item').off('click').on('click', function () {
                        var vidId = $(this).data('id');
                        var vidTitle = $(this).data('title');
                        var vidThumb = $(this).data('thumbnail');
                        var vidDuration = $(this).data('duration');

                        // Check if already exists
                        var exists = selectedVideos.some(function(v) {
                            return v.type === 'youtube' && v.id === vidId;
                        });

                        if (!exists) {
                            var newVideo = {
                                type: 'youtube',
                                id: vidId,
                                title: vidTitle,
                                thumbnail: vidThumb
                            };
                            if (vidDuration) {
                                newVideo.duration = parseInt(vidDuration, 10);
                            }

                            selectedVideos.push(newVideo);
                            renderSelectedVideos();
                        }

                        hideModal();
                    });

                    // Update Pagination State
                    nextPageToken = response.next_page_token || null;
                    if (nextPageToken) {
                        loadMoreContainer.show();
                    } else {
                        loadMoreContainer.hide();
                    }

                } else {
                    if (!isLoadMore) {
                        videoGrid.html('<p class="tubebay-loading-text">' + tubebayMetabox.i18n.error + '</p>');
                    }
                    loadMoreContainer.hide();
                }
            },
            error: function () {
                if (!isLoadMore) {
                    videoGrid.html('<p class="tubebay-loading-text">' + tubebayMetabox.i18n.error + '</p>');
                }
                loadMoreContainer.hide();
            },
            complete: function () {
                isLoading = false;
                isLoaded = true;
                if (isLoadMore) {
                    loadMoreBtn.prop('disabled', false).text(tubebayMetabox.i18n.loadMore);
                }
            }
        });
    }

    // Media Picker for Self-Hosted Videos
    var mediaFrame;
    addSelfHostedBtn.on('click', function(e) {
        e.preventDefault();

        if (maxVideos > 0 && selectedVideos.length >= maxVideos) {
            alert('Maximum videos reached.');
            return;
        }

        // If the frame already exists, open it.
        if (mediaFrame) {
            mediaFrame.open();
            return;
        }

        // Create a new media frame
        mediaFrame = wp.media({
            title: tubebayMetabox.i18n.mediaPickerTitle,
            button: {
                text: tubebayMetabox.i18n.mediaPickerButton
            },
            library: {
                type: 'video' // Filter to only show videos
            },
            multiple: false
        });

        // When an image is selected in the media frame...
        mediaFrame.on('select', function() {
            var attachment = mediaFrame.state().get('selection').first().toJSON();

            var newVideo = {
                type: 'self-hosted',
                id: attachment.id,
                url: attachment.url,
                mime: attachment.mime,
                title: attachment.filename, // or attachment.title
                thumbnail: attachment.thumb ? attachment.thumb.src : attachment.icon
            };

            // Attempt to get duration if available (WordPress might store it in meta)
            if (attachment.meta && attachment.meta.length) {
                newVideo.duration = attachment.meta.length;
            } else if (attachment.fileLength) {
                // Some WP versions store it here
                var timeParts = attachment.fileLength.split(':');
                if (timeParts.length === 2) { // mm:ss
                    newVideo.duration = parseInt(timeParts[0], 10) * 60 + parseInt(timeParts[1], 10);
                }
            }

            selectedVideos.push(newVideo);
            renderSelectedVideos();
        });

        // Open the modal
        mediaFrame.open();
    });

});