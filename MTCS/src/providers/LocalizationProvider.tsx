import React from "react";
import { LocalizationProvider as MuiLocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/vi"; // Import Vietnamese locale

interface LocalizationProviderProps {
  children: React.ReactNode;
}

const LocalizationProvider: React.FC<LocalizationProviderProps> = ({
  children,
}) => {
  return (
    <MuiLocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      {children}
    </MuiLocalizationProvider>
  );
};

export default LocalizationProvider;
