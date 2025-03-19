import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme/theme";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import StaffMenu from "./pages/StaffMenu";
import ProfilePage from "./pages/ProfilePage";
import "./index.css";
import MTCSLogistics from "./pages/Home";
import { AuthProvider } from "./contexts/AuthContext";
import { useEffect } from "react";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MTCSLogistics />} />
            <Route path="/staff-menu/*" element={<StaffMenu />} />
            {/* <Route path="/staff-menu/orders/:orderId/trip/:tripId" element={<TripPage />} /> */}
            
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
