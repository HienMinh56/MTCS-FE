import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme/theme";
import "./index.css";
import MTCSLogistics from "./pages/Home";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <MTCSLogistics />
    </ThemeProvider>
  );
}

export default App;
