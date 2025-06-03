import React, { useState } from "react";
import { ExpenseReport, ExpenseReportFile } from "../../types/expenseReport";

interface ExpenseReportDisplayProps {
  expenseReports: ExpenseReport[];
  title?: string;
  showTripInfo?: boolean;
}

interface ExpenseReportCardProps {
  expenseReport: ExpenseReport;
  showTripInfo?: boolean;
}

interface FileDisplayModalProps {
  file: ExpenseReportFile;
  isOpen: boolean;
  onClose: () => void;
}

const FileDisplayModal: React.FC<FileDisplayModalProps> = ({
  file,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const isImage =
    file.fileType.toLowerCase().includes("image") ||
    file.fileType.toLowerCase().includes("jpeg") ||
    file.fileType.toLowerCase().includes("jpg") ||
    file.fileType.toLowerCase().includes("png") ||
    file.fileType.toLowerCase().includes("webp");

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{file.fileName}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">File Type: {file.fileType}</p>
          <p className="text-sm text-gray-600">Uploaded by: {file.uploadBy}</p>
          <p className="text-sm text-gray-600">
            Upload Date: {new Date(file.uploadDate).toLocaleString()}
          </p>
          {file.description && (
            <p className="text-sm text-gray-600">
              Description: {file.description}
            </p>
          )}
          {file.note && (
            <p className="text-sm text-gray-600">Note: {file.note}</p>
          )}
        </div>

        {isImage ? (
          <div className="text-center">
            <img
              src={file.fileUrl}
              alt={file.fileName}
              className="max-w-full max-h-96 object-contain mx-auto"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
            <div className="hidden text-gray-500 p-4">
              Failed to load image.{" "}
              <a
                href={file.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Open in new tab
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-gray-500 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">
              Preview not available for this file type
            </p>
            <a
              href={file.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Download File
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

const ExpenseReportCard: React.FC<ExpenseReportCardProps> = ({
  expenseReport,
  showTripInfo = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<ExpenseReportFile | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getReportTypeDisplay = (reportTypeId: string) => {
    const typeMap: { [key: string]: { label: string; color: string } } = {
      fuel_report: { label: "Fuel", color: "bg-blue-100 text-blue-800" },
      toll: { label: "Toll", color: "bg-yellow-100 text-yellow-800" },
      "car wash": { label: "Car Wash", color: "bg-green-100 text-green-800" },
      other: { label: "Other", color: "bg-gray-100 text-gray-800" },
    };

    return (
      typeMap[reportTypeId] || {
        label: reportTypeId,
        color: "bg-gray-100 text-gray-800",
      }
    );
  };

  const handleFileClick = (file: ExpenseReportFile) => {
    setSelectedFile(file);
    setIsModalOpen(true);
  };

  const reportTypeInfo = getReportTypeDisplay(expenseReport.reportTypeId);

  return (
    <>
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${reportTypeInfo.color}`}
            >
              {reportTypeInfo.label}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                expenseReport.isPay
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {expenseReport.isPay ? "Paid" : "Unpaid"}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {expenseReport.reportId}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {formatCurrency(expenseReport.cost)}
            </h3>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Reported by:</span>{" "}
              {expenseReport.reportBy}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Date:</span>{" "}
              {new Date(expenseReport.reportTime).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Location:</span>{" "}
              {expenseReport.location}
            </p>
          </div>

          {showTripInfo && expenseReport.trip && (
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium text-gray-900 mb-2">
                Trip Information
              </h4>
              <p className="text-sm text-gray-600">
                Trip ID: {expenseReport.trip.tripId}
              </p>
              <p className="text-sm text-gray-600">
                Driver: {expenseReport.trip.driverId}
              </p>
              <p className="text-sm text-gray-600">
                Status: {expenseReport.trip.status}
              </p>
            </div>
          )}
        </div>

        {expenseReport.description && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">
              Description:
            </p>
            <p className="text-sm text-gray-600">{expenseReport.description}</p>
          </div>
        )}

        {expenseReport.expenseReportFiles &&
          expenseReport.expenseReportFiles.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Attachments ({expenseReport.expenseReportFiles.length})
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {expenseReport.expenseReportFiles.map((file) => (
                  <div
                    key={file.fileId}
                    className="border border-gray-200 rounded-lg p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleFileClick(file)}
                  >
                    <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
                      {file.fileType.toLowerCase().includes("image") ||
                      file.fileType.toLowerCase().includes("jpeg") ||
                      file.fileType.toLowerCase().includes("jpg") ||
                      file.fileType.toLowerCase().includes("png") ||
                      file.fileType.toLowerCase().includes("webp") ? (
                        <img
                          src={file.fileUrl}
                          alt={file.fileName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling?.classList.remove(
                              "hidden"
                            );
                          }}
                        />
                      ) : (
                        <svg
                          className="h-8 w-8 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      )}
                      <div className="hidden h-8 w-8 text-gray-400">
                        <svg
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                    </div>
                    <p
                      className="text-xs text-gray-600 truncate"
                      title={file.fileName}
                    >
                      {file.fileName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      {selectedFile && (
        <FileDisplayModal
          file={selectedFile}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedFile(null);
          }}
        />
      )}
    </>
  );
};

const ExpenseReportDisplay: React.FC<ExpenseReportDisplayProps> = ({
  expenseReports,
  title = "Expense Reports",
  showTripInfo = false,
}) => {
  const [sortBy, setSortBy] = useState<"date" | "cost" | "type">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPaid, setFilterPaid] = useState<string>("all");

  // Get unique report types for filter
  const reportTypes = Array.from(
    new Set(expenseReports.map((report) => report.reportTypeId))
  );

  // Filter and sort reports
  const filteredAndSortedReports = expenseReports
    .filter((report) => {
      if (filterType !== "all" && report.reportTypeId !== filterType)
        return false;
      if (filterPaid === "paid" && !report.isPay) return false;
      if (filterPaid === "unpaid" && report.isPay) return false;
      return true;
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "date":
          aValue = new Date(a.reportTime).getTime();
          bValue = new Date(b.reportTime).getTime();
          break;
        case "cost":
          aValue = a.cost;
          bValue = b.cost;
          break;
        case "type":
          aValue = a.reportTypeId;
          bValue = b.reportTypeId;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const totalCost = filteredAndSortedReports.reduce(
    (sum, report) => sum + report.cost,
    0
  );
  const paidCount = filteredAndSortedReports.filter(
    (report) => report.isPay
  ).length;
  const unpaidCount = filteredAndSortedReports.filter(
    (report) => !report.isPay
  ).length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header and Summary */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-600">Total Reports</p>
            <p className="text-2xl font-bold text-blue-900">
              {filteredAndSortedReports.length}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm font-medium text-green-600">Total Cost</p>
            <p className="text-2xl font-bold text-green-900">
              {formatCurrency(totalCost)}
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm font-medium text-yellow-600">Paid</p>
            <p className="text-2xl font-bold text-yellow-900">{paidCount}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-sm font-medium text-red-600">Unpaid</p>
            <p className="text-2xl font-bold text-red-900">{unpaidCount}</p>
          </div>
        </div>{" "}
        {/* Filters and Sorting */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <label
              htmlFor="type-filter"
              className="text-sm font-medium text-gray-700"
            >
              Type:
            </label>
            <select
              id="type-filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              aria-label="Filter by expense report type"
            >
              <option value="all">All Types</option>
              {reportTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label
              htmlFor="payment-filter"
              className="text-sm font-medium text-gray-700"
            >
              Payment:
            </label>
            <select
              id="payment-filter"
              value={filterPaid}
              onChange={(e) => setFilterPaid(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              aria-label="Filter by payment status"
            >
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label
              htmlFor="sort-by"
              className="text-sm font-medium text-gray-700"
            >
              Sort by:
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "date" | "cost" | "type")
              }
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              aria-label="Sort expense reports by"
            >
              <option value="date">Date</option>
              <option value="cost">Cost</option>
              <option value="type">Type</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-1 text-gray-500 hover:text-gray-700"
              aria-label={`Sort ${
                sortOrder === "asc" ? "descending" : "ascending"
              }`}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>
      </div>

      {/* Expense Reports List */}
      <div className="space-y-4">
        {filteredAndSortedReports.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
            <p className="text-gray-500">
              No expense reports found matching the current filters.
            </p>
          </div>
        ) : (
          filteredAndSortedReports.map((report) => (
            <ExpenseReportCard
              key={report.reportId}
              expenseReport={report}
              showTripInfo={showTripInfo}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ExpenseReportDisplay;
