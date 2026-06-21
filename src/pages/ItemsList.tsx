import { useState, useEffect, useCallback } from "react";
import { __, sprintf } from "@wordpress/i18n";
import {
  ClassicButton,
  ClassicCheckbox,
} from "../components/classics";
import apiFetch from "../utils/apiFetch";
import { SkeletonAddonList } from "../components/loading/SkeletonAddonList";
import { TopProgressBar } from "../components/loading/TopProgressBar";
import { useToast } from "../store/toast/use-toast";

interface Item {
  id: number;
  title: string;
  status: string;
  date_created: string;
}

interface ListResponse {
  items: Item[];
  total: number;
  total_pages: number;
  page: number;
  per_page: number;
  counts: {
    all: number;
    publish: number;
    draft: number;
  };
}

export default function ItemsList() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("any");
  const [counts, setCounts] = useState({
    all: 0,
    publish: 0,
    draft: 0,
  });

  const { addToast } = useToast();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await apiFetch({
        path: `items?page=${page}&per_page=10&status=${statusFilter}`,
        method: "GET",
      })) as ListResponse;
      setItems(data.items || []);
      setTotalPages(data.total_pages || 1);
      setTotal(data.total || 0);
      setCounts(data.counts);
    } catch (err) {
      console.error("Failed to fetch items:", err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const renderPagination = () => {
    return (
      <div className="tablenav-pages wpab-flex wpab-items-center wpab-gap-2">
        <span className="displaying-num wpab-text-[13px] wpab-mr-2">
          {total} {__("items", "wpab-boilerplate")}
        </span>
        <ClassicButton
          variant="secondary"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          {__("← Previous", "wpab-boilerplate")}
        </ClassicButton>
        <span className="wpab-leading-[30px] wpab-px-2">
          {__("Page", "wpab-boilerplate")} {page} {__("of", "wpab-boilerplate")} {totalPages}
        </span>
        <ClassicButton
          variant="secondary"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          {__("Next →", "wpab-boilerplate")}
        </ClassicButton>
      </div>
    );
  };

  return (
    <div className="wpab-ignore-preflight">
      <TopProgressBar isSaving={loading} />
      <div className="wpab-flex wpab-justify-between wpab-items-center wpab-mb-4">
        <h2 className="wpab-m-0">{__("Paginated Items Example", "wpab-boilerplate")}</h2>
        <div className="wpab-flex wpab-gap-4 wpab-items-center">
             {renderPagination()}
        </div>
      </div>

      <div className="wpab-table-responsive">
        <table className="wp-list-table widefat fixed striped">
          <thead>
            <tr>
              <th className="wpab-w-[10%]">{__("ID", "wpab-boilerplate")}</th>
              <th className="wpab-w-[60%]">{__("Title", "wpab-boilerplate")}</th>
              <th>{__("Status", "wpab-boilerplate")}</th>
              <th>{__("Date", "wpab-boilerplate")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonAddonList />
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} className="wpab-text-center wpab-p-10">
                  {__("No items found.", "wpab-boilerplate")}
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>
                    <strong>{item.title}</strong>
                  </td>
                  <td>{item.status}</td>
                  <td>{item.date_created}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
