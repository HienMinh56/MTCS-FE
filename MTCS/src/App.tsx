import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme/theme";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import StaffMenu from "./pages/StaffMenu";
import ProfilePage from "./pages/ProfilePage";
import "./index.css";
import MTCSLogistics from "./pages/Home";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import { useAuth } from "./contexts/AuthContext";
import LocalizationProvider from "./providers/LocalizationProvider";
import OrderDetailPage from "./pages/OrderDetailPage";
import TractorDetailPage from "./pages/TractorDetailPage";
import TrailerDetailPage from "./pages/TrailerDetailPage";
import DriverProfile from "./pages/DriverProfile";
import TripDetailPage from "./pages/TripDetailPage";
import CustomerDetailPage from "./pages/CustomerDetailPage";
import DistanceCalculatorPage from "./pages/DistanceCalculatorPage";
import AdminFinanceDashboard from "./pages/AdminFinanceDashboard";
import TrackingOrder from "./pages/TrackingOrder";
import { SpeedInsights } from "@vercel/speed-insights/react";

const HomeRoute = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    if (user.role === "Admin") {
      return <Navigate to="/admin/finance" replace />;
    } else if (user.role === "Staff") {
      return <Navigate to="/staff-menu/orders" replace />;
    }
  }

  return <MTCSLogistics />;
};

function App() {
  return (
    <LocalizationProvider>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomeRoute />} />
              
              {/* Public route for order tracking - accessible to everyone */}
              <Route path="/tracking-order" element={<TrackingOrder />} />

              <Route
                  path="/distance-calculator"
                  element={<DistanceCalculatorPage />}
                />
                
              <Route
                element={<ProtectedRoute allowedRoles={["Staff", "Admin"]} />}
              >
                <Route path="/staff-menu/*" element={<StaffMenu />} />
                <Route
                  path="/staff-menu/orders/:orderId"
                  element={<OrderDetailPage />}
                />
                <Route
                  path="/staff-menu/trips/:tripId"
                  element={<TripDetailPage />}
                />
                <Route
                  path="/staff-menu/tractors/:tractorId"
                  element={<TractorDetailPage />}
                />
                <Route
                  path="/staff-menu/trailers/:trailerId"
                  element={<TrailerDetailPage />}
                />
                <Route
                  path="/staff-menu/customers/:customerId"
                  element={<CustomerDetailPage />}
                />
                <Route
                  path="/staff-menu/drivers/:driverId"
                  element={<DriverProfile />}
                />
                <Route path="/drivers/:driverId" element={<DriverProfile />} />
                <Route
                  path="/distance-calculator"
                  element={<DistanceCalculatorPage />}
                />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
                <Route
                  path="/admin/finance"
                  element={<AdminFinanceDashboard />}
                />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <SpeedInsights />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </LocalizationProvider>
  );
}

export default App;
