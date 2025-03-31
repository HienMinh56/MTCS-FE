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
import DriverDetailPage from "./pages/DriverDetailPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import OrderApiTester from "./components/OrderApiTester";

const HomeRoute = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user && ["Staff", "Admin"].includes(user.role)) {
    return <Navigate to="/staff-menu/orders" replace />;
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

              <Route
                element={<ProtectedRoute allowedRoles={["Staff", "Admin"]} />}
              >
                <Route path="/staff-menu/*" element={<StaffMenu />} />
                <Route
                  path="/drivers/:driverId"
                  element={<DriverDetailPage />}
                />
                <Route
                  path="/staff-menu/orders/:orderId"
                  element={<OrderDetailPage />}
                />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </LocalizationProvider>
  );
}

export default App;
