import React, { useState, useEffect } from "react";
import apiFetch from "@wordpress/api-fetch";
import { ClassicButton, ClassicInput } from "../components/classics";
import { useToast } from "../store/toast/use-toast";

interface ProductVideo {
    id: string;
    type: string;
    title?: string;
    thumbnail?: string;
}

interface Product {
    id: number;
    name: string;
    sku: string;
    thumbnail: string;
    assigned_videos: ProductVideo[];
    video_count: number;
}

export default function Manager() {
    const { addToast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [bulkAction, setBulkAction] = useState("");
    const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);

    // For bulk assign modal
    const [availableVideos, setAvailableVideos] = useState<any[]>([]);
    const [selectedVideosToAssign, setSelectedVideosToAssign] = useState<string[]>([]);
    const [loadingVideos, setLoadingVideos] = useState(false);

    useEffect(() => {
        // Check for URL parameters if we came from Channel Library
        const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
        const action = hashParams.get('action');
        const videosToAssign = hashParams.get('videos');

        if (action === 'assign' && videosToAssign) {
            setSelectedVideosToAssign(videosToAssign.split(','));
            setIsBulkAssignModalOpen(true);
            fetchAvailableVideos();
        }

        fetchProducts();
    }, [currentPage]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response: any = await apiFetch({
                path: `/tubebay/v1/products?page=${currentPage}&search=${searchInput}`,
            });
            if (response.success) {
                setProducts(response.products);
                setTotalPages(response.total_pages);
                setTotalItems(response.total_items);
            }
        } catch (error) {
            addToast(`Failed to load products: ${(error as Error).message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchProducts();
    };

    const toggleSelectAll = () => {
        if (selectedProducts.length === products.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(products.map((p) => p.id));
        }
    };

    const toggleSelectProduct = (id: number) => {
        setSelectedProducts((prev) =>
            prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
        );
    };

    const handleApplyBulkAction = () => {
        if (selectedProducts.length === 0 || !bulkAction) return;

        if (bulkAction === 'assign') {
            fetchAvailableVideos();
            setIsBulkAssignModalOpen(true);
        } else if (bulkAction === 'remove') {
            if (confirm("Are you sure you want to remove all videos from the selected products?")) {
                handleBulkAssign(true); // true means remove
            }
        }
    };

    const fetchAvailableVideos = async () => {
        setLoadingVideos(true);
        try {
            const response: any = await apiFetch({
                path: `/tubebay/v1/youtube/videos`,
            });
            if (response.success && response.videos) {
                setAvailableVideos(response.videos);
            }
        } catch (error) {
            addToast(`Failed to load videos: ${(error as Error).message}`, "error");
        } finally {
            setLoadingVideos(false);
        }
    };

    const toggleVideoSelection = (id: string) => {
        setSelectedVideosToAssign(prev =>
            prev.includes(id) ? prev.filter(vId => vId !== id) : [...prev, id]
        );
    };

    const handleBulkAssign = async (isRemove = false) => {
        if (!isRemove && selectedVideosToAssign.length === 0) {
            addToast("Please select at least one video to assign.", "error");
            return;
        }

        try {
            // Include full video objects so titles/thumbnails aren't lost in meta
            const fullVideoObjectsToAssign = availableVideos.filter(v => selectedVideosToAssign.includes(v.id)).map(v => ({
                id: v.id,
                type: 'youtube',
                title: v.title,
                thumbnail: v.thumbnail_url
            }));

            const response: any = await apiFetch({
                path: `/tubebay/v1/products/bulk-assign`,
                method: 'POST',
                data: {
                    product_ids: selectedProducts,
                    video_ids: isRemove ? [] : fullVideoObjectsToAssign,
                    action: isRemove ? 'remove' : 'assign'
                }
            });

            if (response.success) {
                addToast(`Successfully ${isRemove ? 'removed' : 'assigned'} videos.`, "success");
                setIsBulkAssignModalOpen(false);
                setSelectedVideosToAssign([]);
                setSelectedProducts([]);
                setBulkAction("");
                fetchProducts();

                // Clear URL params if any
                window.location.hash = "/manager";
            }
        } catch (error) {
            addToast(`Operation failed: ${(error as Error).message}`, "error");
        }
    };

    return (
        <div className="wrap tubebay-wrap">
            <h1 className="tubebay-ignore-preflight">TubeBay Manager</h1>
            <p className="description" style={{ marginBottom: '15px' }}>
                Manage video assignments across your WooCommerce products.
            </p>

            <div className="tablenav top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                <div className="alignleft actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <select
                        value={bulkAction}
                        onChange={(e) => setBulkAction(e.target.value)}
                    >
                        <option value="">Bulk Actions</option>
                        <option value="assign">Assign Videos</option>
                        {/* <option value="remove">Remove Videos</option>  We'll keep it simple for now and just support assigning from here, or remove specific */}
                    </select>
                    <ClassicButton
                        variant="secondary"
                        onClick={handleApplyBulkAction}
                        disabled={!bulkAction || selectedProducts.length === 0}
                        style={{ margin: 0 }}
                    >
                        Apply
                    </ClassicButton>
                </div>

                <div className="tablenav-pages">
                    <span className="displaying-num">{totalItems} items</span>
                    {totalPages > 1 && (
                        <span className="pagination-links" style={{ marginLeft: '10px' }}>
                            <ClassicButton variant="secondary" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>&laquo;</ClassicButton>
                            <span className="paging-input" style={{ margin: '0 10px' }}>{currentPage} of {totalPages}</span>
                            <ClassicButton variant="secondary" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>&raquo;</ClassicButton>
                        </span>
                    )}
                </div>

                <div className="alignright">
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '5px' }}>
                        <ClassicInput
                            type="search"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search products..."
                        />
                        <ClassicButton type="submit" variant="secondary">Search</ClassicButton>
                    </form>
                </div>
            </div>

            <table className="wp-list-table widefat fixed striped table-view-list">
                <thead>
                    <tr>
                        <th scope="col" id="cb" className="manage-column column-cb check-column" style={{ width: '2.2em' }}>
                            <input
                                type="checkbox"
                                checked={products.length > 0 && selectedProducts.length === products.length}
                                onChange={toggleSelectAll}
                            />
                        </th>
                        <th scope="col" style={{ width: '60px' }}>Image</th>
                        <th scope="col" className="column-primary">Product Name</th>
                        <th scope="col">SKU</th>
                        <th scope="col">Assigned Videos</th>
                        <th scope="col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={6}>Loading products...</td></tr>
                    ) : products.length === 0 ? (
                        <tr><td colSpan={6}>No products found.</td></tr>
                    ) : (
                        products.map((product) => (
                            <tr key={product.id}>
                                <th scope="row" className="check-column">
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.includes(product.id)}
                                        onChange={() => toggleSelectProduct(product.id)}
                                    />
                                </th>
                                <td>
                                    <img src={product.thumbnail} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                                </td>
                                <td className="column-primary">
                                    <strong><a href={`post.php?post=${product.id}&action=edit`}>{product.name}</a></strong>
                                </td>
                                <td>{product.sku || '—'}</td>
                                <td>
                                    {product.video_count > 0 ? (
                                        <span className="awaiting-mod count" style={{ display: 'inline-block' }}>
                                            <span className="pending-count">{product.video_count}</span>
                                        </span>
                                    ) : 'None'}
                                </td>
                                <td>
                                    <a href={`post.php?post=${product.id}&action=edit`} className="button button-small">Edit Videos</a>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Bulk Assign Modal */}
            {isBulkAssignModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: '#fff', padding: '20px', borderRadius: '4px',
                        width: '90%', maxWidth: '800px', maxHeight: '90vh',
                        display: 'flex', flexDirection: 'column'
                    }}>
                        <h2>Assign Videos to {selectedProducts.length} Product(s)</h2>

                        <div style={{ flex: 1, overflowY: 'auto', margin: '15px 0', border: '1px solid #ccd0d4', padding: '10px' }}>
                            {loadingVideos ? (
                                <p>Loading videos...</p>
                            ) : availableVideos.length === 0 ? (
                                <p>No videos available. Please sync your library first.</p>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                                    {availableVideos.map(video => (
                                        <div
                                            key={video.id}
                                            style={{
                                                border: `2px solid ${selectedVideosToAssign.includes(video.id) ? '#2271b1' : '#eee'}`,
                                                padding: '5px', cursor: 'pointer', borderRadius: '4px'
                                            }}
                                            onClick={() => toggleVideoSelection(video.id)}
                                        >
                                            <img src={video.thumbnail_url} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
                                            <p style={{ fontSize: '12px', margin: '5px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {video.title}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <ClassicButton variant="secondary" onClick={() => { setIsBulkAssignModalOpen(false); setSelectedVideosToAssign([]); }}>Cancel</ClassicButton>
                            <ClassicButton variant="primary" onClick={() => handleBulkAssign(false)} disabled={selectedVideosToAssign.length === 0}>Assign Videos</ClassicButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
