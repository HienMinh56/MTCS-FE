import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme/theme";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import StaffMenu from "./pages/StaffMenu";
import ProfilePage from "./pages/ProfilePage";
import "./index.css";
import MTCSLogistics from "./pages/Home";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MTCSLogistics />} />
          <Route path="/staff-menu/*" element={<StaffMenu />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
