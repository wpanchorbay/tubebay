jQuery(document).ready(function ($) {
    var modal = $('#tubebay-video-modal');
    var selectYtBtn = $('#tubebay_select_youtube_btn');
    var selectWpBtn = $('#tubebay_select_self_hosted_btn');
    var closeModal = $('#tubebay-modal-close-btn');
    var backdrop = $('#tubebay-modal-backdrop');

    var videoGrid = $('#tubebay-modal-video-grid');
    var searchInput = $('#tubebay-modal-search');
    var sortSelect = $('#tubebay-modal-sort');
    var loadMoreBtn = $('#tubebay-modal-load-more');
    var loadMoreContainer = $('#tubebay-modal-footer');

    var isLoaded = false;
    var currentSearch = '';
    var currentSort = 'date_desc';
    var nextPageToken = null;
    var searchTimeout = null;
    var isLoading = false;
    var isConnected = !!tubebayMetabox.isConnected;

    // Data layer for videos
    var videoIdsInput = $('#tubebay_video_ids');
    var currentVideos = [];
    try {
        currentVideos = JSON.parse(videoIdsInput.val() || '[]');
    } catch(e) {
        currentVideos = [];
    }

    // Toggle gallery settings
    $('.tubebay-gallery-settings-toggle').on('click', function() {
        $('.tubebay-gallery-settings').slideToggle('fast');
        var icon = $(this).find('.dashicons');
        if (icon.hasClass('dashicons-arrow-down-alt2')) {
            icon.removeClass('dashicons-arrow-down-alt2').addClass('dashicons-arrow-up-alt2');
        } else {
            icon.removeClass('dashicons-arrow-up-alt2').addClass('dashicons-arrow-down-alt2');
        }
    });

    // Render list
    function renderVideoList() {
        var listContainer = $('#tubebay-video-list');
        listContainer.empty();

        if (currentVideos.length === 0) {
            listContainer.append('<p class="description">No videos selected.</p>');
            videoIdsInput.val('[]');
            return;
        }

        currentVideos.forEach(function(vid, index) {
            var icon = vid.type === 'youtube' ? 'dashicons-youtube' : 'dashicons-video-alt3';
            var html = '<div class="tubebay-list-item" data-index="' + index + '" style="display: flex; align-items: center; padding: 5px; border: 1px solid #ccc; margin-bottom: 5px; background: #fff; cursor: move;">';
            html += '<span class="dashicons dashicons-menu" style="color: #999; margin-right: 5px;"></span>';
            html += '<img src="' + vid.thumbnail + '" style="width: 40px; height: 30px; object-fit: cover; margin-right: 10px;" />';
            html += '<div style="flex-grow: 1; overflow: hidden;">';
            html += '<div style="font-weight: bold; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + vid.title + '</div>';
            html += '<div style="font-size: 10px; color: #666;"><span class="dashicons ' + icon + '" style="font-size: 12px; width: 12px; height: 12px; margin-top: 1px;"></span> ' + (vid.type === 'youtube' ? 'YouTube' : 'Self-Hosted') + '</div>';
            html += '</div>';
            html += '<a href="#" class="tubebay-remove-item delete" style="color: #b32d2e; text-decoration: none; padding: 0 5px;" title="Remove">&times;</a>';
            html += '</div>';
            listContainer.append(html);
        });

        // Update hidden input
        videoIdsInput.val(JSON.stringify(currentVideos));

        // Make sortable
        if (typeof $.fn.sortable !== 'undefined') {
            listContainer.sortable({
                handle: '.dashicons-menu',
                update: function(event, ui) {
                    var newOrder = [];
                    listContainer.find('.tubebay-list-item').each(function() {
                        var oldIndex = $(this).data('index');
                        newOrder.push(currentVideos[oldIndex]);
                    });
                    currentVideos = newOrder;
                    renderVideoList(); // Re-render to update indices
                }
            });
        }

        // Attach remove handlers
        $('.tubebay-remove-item').on('click', function(e) {
            e.preventDefault();
            var index = $(this).closest('.tubebay-list-item').data('index');
            currentVideos.splice(index, 1);
            renderVideoList();
        });
    }

    // Initial render
    renderVideoList();

    // Show Modal
    function openModal() {
        if (!isConnected) return;
        modal.show();
        $('body').addClass('modal-open');
        if (!isLoaded) {
            fetchVideos();
        }
    }

    // Hide Modal
    function hideModal() {
        modal.hide();
        $('body').removeClass('modal-open');
    }

    selectYtBtn.on('click', function (e) {
        e.preventDefault();
        openModal();
    });

    closeModal.on('click', function () {
        hideModal();
    });

    backdrop.on('click', function () {
        hideModal();
    });

    // WP Media Frame for Self-Hosted
    var wpMediaFrame;
    selectWpBtn.on('click', function(e) {
        e.preventDefault();

        if (wpMediaFrame) {
            wpMediaFrame.open();
            return;
        }

        wpMediaFrame = wp.media({
            title: 'Select Video',
            button: {
                text: 'Add to Product Gallery'
            },
            multiple: true,
            library: {
                type: 'video'
            }
        });

        wpMediaFrame.on('select', function() {
            var selections = wpMediaFrame.state().get('selection');
            selections.map(function(attachment) {
                attachment = attachment.toJSON();

                // Show warning for MKV/AVI formats since they aren't fully supported by browsers natively
                var mime = attachment.mime || '';
                var isWarningFormat = mime.includes('mkv') || mime.includes('avi') || attachment.filename.endsWith('.mkv') || attachment.filename.endsWith('.avi');
                if (isWarningFormat) {
                    alert('Warning: The selected video format (' + attachment.filename + ') may not play natively in all web browsers. MP4 or WebM formats are recommended.');
                }

                // Find a thumbnail
                var thumb = attachment.thumb?.src || attachment.image?.src || attachment.icon;
                if (!thumb && attachment.meta && attachment.meta.length > 0) {
                   thumb = attachment.meta[0].thumb;
                }

                currentVideos.push({
                    id: attachment.id.toString(),
                    type: 'self_hosted',
                    title: attachment.title || attachment.filename,
                    thumbnail: thumb || '' // WP core provides a video icon fallback
                });
            });
            renderVideoList();
        });

        wpMediaFrame.open();
    });


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

    // Fetch videos via REST API
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

                if (response && response.success) {
                    if (response.videos && response.videos.length > 0) {
                        var html = '';
                        response.videos.forEach(function (video) {
                            html += '<div class="tubebay-modal-video-item" data-id="' + video.id + '" data-title="' + video.title + '" data-thumbnail="' + video.thumbnail_url + '">';
                            html += '<img src="' + video.thumbnail_url + '" alt="Thumbnail" />';
                            html += '<p title="' + video.title + '">' + video.title + '</p>';
                            html += '</div>';
                        });

                        videoGrid.append(html);

                        // Add click handlers for the newly loaded items
                        $('.tubebay-modal-video-item').off('click').on('click', function () {
                            var vidId = $(this).data('id');
                            var vidTitle = $(this).data('title');
                            var vidThumb = $(this).data('thumbnail');

                            // Avoid duplicates
                            var exists = currentVideos.some(function(v) { return v.id === vidId; });
                            if (!exists) {
                                currentVideos.push({
                                    id: vidId,
                                    type: 'youtube',
                                    title: vidTitle,
                                    thumbnail: vidThumb
                                });
                                renderVideoList();
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
                            videoGrid.html('<p class="tubebay-loading-text">' + tubebayMetabox.i18n.noVideos + '</p>');
                        }
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
});
