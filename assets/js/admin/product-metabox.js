jQuery(document).ready(function ($) {
    var modal = $('#tubebay-video-modal');
    var selectBtn = $('#tubebay_select_video_btn');
    var editBtn = $('#tubebay_edit_video_btn');
    var removeBtn = $('#tubebay_remove_video_btn');
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

    selectBtn.on('click', function (e) {
        e.preventDefault();
        openModal();
    });

    editBtn.on('click', function (e) {
        e.preventDefault();
        openModal();
    });

    closeModal.on('click', function () {
        hideModal();
    });

    backdrop.on('click', function () {
        hideModal();
    });

    // Remove video
    removeBtn.on('click', function (e) {
        e.preventDefault();
        $('#tubebay_video_id').val('');
        $('#tubebay_video_title').val('');
        $('#tubebay_video_thumbnail').val('');

        $('#tubebay-selected-video-container').addClass('tubebay-hidden');
        $('#tubebay-add-video-container').removeClass('tubebay-hidden');
        $('#tubebay-autoplay-setting').addClass('tubebay-hidden');
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

                if (response && response.success && response.videos.length > 0) {
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

                        $('#tubebay_video_id').val(vidId);
                        $('#tubebay_video_title').val(vidTitle);
                        $('#tubebay_video_thumbnail').val(vidThumb);

                        // Update UI
                        $('#tubebay_video_title_display').text(vidTitle);
                        $('#tubebay_video_thumbnail_img').attr('src', vidThumb);

                        $('#tubebay-selected-video-container').removeClass('tubebay-hidden');
                        $('#tubebay-add-video-container').addClass('tubebay-hidden');
                        $('#tubebay-autoplay-setting').removeClass('tubebay-hidden');

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
});
