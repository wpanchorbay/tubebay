import { FC, useState } from "react";
import { __ } from "@wordpress/i18n";
import { useWpabStore } from "../store/wpabStore";
import { Link } from "react-router-dom";
import { ClassicTable } from "../components/classics/ClassicTable";
import { ClassicButton } from "../components/classics/ClassicButton";

// Demo data for the table
const DEMO_DATA = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  name: `Demo Item ${i + 1}`,
  status: i % 3 === 0 ? "Inactive" : "Active",
  date: new Date(Date.now() - Math.random() * 10000000000)
    .toISOString()
    .split("T")[0],
}));

const Dashboard: FC = () => {
  const store = useWpabStore();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(DEMO_DATA.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = DEMO_DATA.slice(startIndex, startIndex + itemsPerPage);

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "status", label: "Status" },
    { key: "date", label: "Date" },
  ];

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };



  return (
    <div className="">
      {/* Welcome Banner */}
      <div className="wpab-bg-white wpab-rounded-[12px] wpab-p-[24px] wpab-mb-[24px] wpab-border wpab-border-gray-200">
        <div className="wpab-flex wpab-items-center wpab-justify-between">
          <div>
            <p className="wpab-text-[15px] wpab-text-gray-600 wpab-mb-2">
              {__(
                "Your plugin is ready. Start building something amazing with our dual modern and classic components!",
                "wpab-boilerplate",
              )}
            </p>
            <p className="wpab-text-[12px] wpab-text-gray-400">
              {__("Version", "wpab-boilerplate")}: {store.version}
            </p>
          </div>
          <div>
            <Link to="/components-classic">
              <ClassicButton variant="primary">
                {__("View Classic Components", "wpab-boilerplate")}
              </ClassicButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="wpab-grid wpab-grid-cols-1 md:wpab-grid-cols-3 wpab-gap-[16px] wpab-mb-[24px]">
        {/* Card 1 */}
        <div className="wpab-bg-white wpab-rounded-[12px] wpab-p-[20px] wpab-border wpab-border-gray-200">
          <div className="wpab-flex wpab-items-center wpab-gap-[12px] wpab-mb-[12px]">
            <div className="wpab-w-[40px] wpab-h-[40px] wpab-bg-blue-100 wpab-rounded-[8px] wpab-flex wpab-items-center wpab-justify-center">
              <span className="wpab-text-[20px]">📄</span>
            </div>
            <h3 className="wpab-text-[16px] wpab-font-[600] wpab-text-gray-900">
              {__("REST API", "wpab-boilerplate")}
            </h3>
          </div>
          <p className="wpab-text-[13px] wpab-text-gray-600">
            {__(
              "A REST API controller is included. See app/Api/SettingsController.php for the pattern.",
              "wpab-boilerplate",
            )}
          </p>
        </div>

        {/* Card 2 */}
        <div className="wpab-bg-white wpab-rounded-[12px] wpab-p-[20px] wpab-border wpab-border-gray-200">
          <div className="wpab-flex wpab-items-center wpab-gap-[12px] wpab-mb-[12px]">
            <div className="wpab-w-[40px] wpab-h-[40px] wpab-bg-green-100 wpab-rounded-[8px] wpab-flex wpab-items-center wpab-justify-center">
              <span className="wpab-text-[20px]">⚛️</span>
            </div>
            <h3 className="wpab-text-[16px] wpab-font-[600] wpab-text-gray-900">
              {__("React Components", "wpab-boilerplate")}
            </h3>
          </div>
          <p className="wpab-text-[13px] wpab-text-gray-600">
            {__(
              "Pre-built UI components: Button, Input, Select, Modal, Toast, and more in src/components/common/.",
              "wpab-boilerplate",
            )}
          </p>
        </div>

        {/* Card 3 */}
        <div className="wpab-bg-white wpab-rounded-[12px] wpab-p-[20px] wpab-border wpab-border-gray-200">
          <div className="wpab-flex wpab-items-center wpab-gap-[12px] wpab-mb-[12px]">
            <div className="wpab-w-[40px] wpab-h-[40px] wpab-bg-purple-100 wpab-rounded-[8px] wpab-flex wpab-items-center wpab-justify-center">
              <span className="wpab-text-[20px]">🗃️</span>
            </div>
            <h3 className="wpab-text-[16px] wpab-font-[600] wpab-text-gray-900">
              {__("Database", "wpab-boilerplate")}
            </h3>
          </div>
          <p className="wpab-text-[13px] wpab-text-gray-600">
            {__(
              "Custom table creation on activation via app/Data/DbManager.php. Includes example items table.",
              "wpab-boilerplate",
            )}
          </p>
        </div>
      </div>

      {/* Demo Table with Pagination */}
      <div className="wpab-bg-white wpab-rounded-[12px] wpab-p-[24px] wpab-border wpab-border-gray-200">
        <h3 className="wpab-text-[18px] wpab-font-[600] wpab-text-gray-900 wpab-mb-[16px]">
          {__("Demo Data Table", "wpab-boilerplate")}
        </h3>

        <ClassicTable
          columns={columns}
          data={currentData}
          keyField="id"
          renderCell={(item, columnKey) => {
            if (columnKey === "status") {
              return (
                <span
                  className={`wpab-px-2 wpab-py-1 wpab-rounded-full wpab-text-xs ${
                    item.status === "Active"
                      ? "wpab-bg-green-100 wpab-text-green-800"
                      : "wpab-bg-gray-100 wpab-text-gray-800"
                  }`}
                >
                  {item[columnKey]}
                </span>
              );
            }
            return <>{item[columnKey as keyof typeof item]}</>;
          }}
        />

        {/* Pagination Controls */}
        <div className="wpab-flex wpab-items-center wpab-justify-between wpab-mt-[16px] wpab-py-[12px] wpab-border-t wpab-border-gray-100">
          <div className="wpab-text-[13px] wpab-text-gray-600">
            {__("Showing", "wpab-boilerplate")} {startIndex + 1}{" "}
            {__("to", "wpab-boilerplate")}{" "}
            {Math.min(startIndex + itemsPerPage, DEMO_DATA.length)}{" "}
            {__("of", "wpab-boilerplate")} {DEMO_DATA.length}{" "}
            {__("entries", "wpab-boilerplate")}
          </div>
          <div className="wpab-flex wpab-items-center wpab-gap-[8px]">
            <ClassicButton
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="!wpab-px-3 !wpab-py-1"
            >
              {__("Previous", "wpab-boilerplate")}
            </ClassicButton>
            <span className="wpab-text-[13px] wpab-font-medium wpab-px-2">
              {currentPage} / {totalPages}
            </span>
            <ClassicButton
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="!wpab-px-3 !wpab-py-1"
            >
              {__("Next", "wpab-boilerplate")}
            </ClassicButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
