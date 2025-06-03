import React from "react";
import ExpenseReportDisplay from "./ExpenseReportDisplay";
import { ExpenseReport } from "../../types/expenseReport";

// Example usage with sample data
const ExpenseReportExample: React.FC = () => {
  // Sample data based on your API response
  const sampleExpenseReports: ExpenseReport[] = [
    {
      reportId: "EXPEN082767b940",
      tripId: "TRIP48c99ea4af",
      reportTypeId: "fuel_report",
      cost: 100000,
      location: "Ngã tư Đồng Tâm , Thành phố Mỹ Tho, Tiền Giang, Việt Nam",
      reportTime: "2025-06-01T20:23:27.95",
      reportBy: "Trần Nhựt Minh Tâm",
      isPay: 1,
      description: null,
      expenseReportFiles: [
        {
          fileId: "d0cd78e5-5696-47c5-b58e-561aab98fb3a",
          reportId: "EXPEN082767b940",
          fileName: "scaled_1000122402.webp",
          fileType: "application/octet-stream",
          uploadDate: "2025-06-01T13:23:28.143",
          uploadBy: "Trần Nhựt Minh Tâm",
          description: "Expense Report File",
          note: "Uploaded via create",
          deletedDate: null,
          deletedBy: null,
          fileUrl:
            "https://firebasestorage.googleapis.com/v0/b/nomnomfood-3f50b.appspot.com/o/scaled_1000122402_44dec08e-2daf-464a-88fa-199b4d6ddd46.webp?alt=media",
          modifiedDate: null,
          modifiedBy: null,
          report: null,
        },
      ],
      reportType: null,
      trip: {
        tripId: "TRIP48c99ea4af",
        orderDetailId: "4e962f3e-f611-4dce-8731-f85b16420dc0",
        driverId: "DRI005",
        tractorId: "TRC015",
        trailerId: "TRL011",
        startTime: "2025-06-01T20:22:56.887",
        endTime: "2025-06-01T20:25:42.15",
        status: "completed",
        matchType: 1,
        matchBy: "Nguyễn Hiển Minh",
        matchTime: "2025-06-01T20:20:05.653",
        note: null,
        deliveryReports: [],
        driver: null,
        expenseReports: [],
        incidentReports: [],
        orderDetail: null,
        tractor: null,
        trailer: null,
        tripStatusHistories: [],
      },
    },
    {
      reportId: "EXPEN322fb5bb75",
      tripId: "TRIP88da58bd04",
      reportTypeId: "toll",
      cost: 20000,
      location: "string",
      reportTime: "2025-05-26T19:10:47.417",
      reportBy: "Nguyễn Hiển Minh",
      isPay: 0,
      description: "string",
      expenseReportFiles: [],
      reportType: null,
      trip: {
        tripId: "TRIP88da58bd04",
        orderDetailId: "211a3365-c39d-4c64-8441-5fb1183d7035",
        driverId: "DRI003",
        tractorId: "TRC001",
        trailerId: "TRL001",
        startTime: null,
        endTime: null,
        status: "not_started",
        matchType: 2,
        matchBy: "System",
        matchTime: "2025-05-26T18:39:32.313",
        note: null,
        deliveryReports: [],
        driver: null,
        expenseReports: [],
        incidentReports: [],
        orderDetail: null,
        tractor: null,
        trailer: null,
        tripStatusHistories: [],
      },
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Expense Report Display Example
      </h1>

      <div className="space-y-8">
        {/* Example 1: Simple display */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Basic Usage</h2>
          <ExpenseReportDisplay
            expenseReports={sampleExpenseReports}
            title="Sample Expense Reports"
          />
        </div>

        {/* Example 2: With trip information */}
        <div>
          <h2 className="text-xl font-semibold mb-4">With Trip Information</h2>
          <ExpenseReportDisplay
            expenseReports={sampleExpenseReports}
            title="Expense Reports with Trip Details"
            showTripInfo={true}
          />
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">How to Use</h3>
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <strong>Basic Usage:</strong>
            <pre className="bg-gray-800 text-green-400 p-3 rounded mt-2 overflow-x-auto">
              {`import ExpenseReportDisplay from './components/finance/ExpenseReportDisplay';
import { getExpenseReportByTrip } from './services/expenseReportApi';

// In your component
const [reports, setReports] = useState([]);

useEffect(() => {
  const loadReports = async () => {
    const data = await getExpenseReportByTrip('TRIP123');
    setReports(data);
  };
  loadReports();
}, []);

return (
  <ExpenseReportDisplay 
    expenseReports={reports}
    title="Trip Expense Reports"
    showTripInfo={true}
  />
);`}
            </pre>
          </div>

          <div>
            <strong>Features:</strong>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Displays expense reports in a card layout</li>
              <li>Shows file attachments with preview capability</li>
              <li>Filtering by report type and payment status</li>
              <li>Sorting by date, cost, or type</li>
              <li>Summary statistics (total cost, paid/unpaid counts)</li>
              <li>Optional trip information display</li>
              <li>Modal for viewing file details and images</li>
            </ul>
          </div>

          <div>
            <strong>Props:</strong>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>
                <code>expenseReports</code> - Array of expense report objects
              </li>
              <li>
                <code>title</code> - Optional title for the component (default:
                "Expense Reports")
              </li>
              <li>
                <code>showTripInfo</code> - Boolean to show/hide trip
                information (default: false)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseReportExample;
