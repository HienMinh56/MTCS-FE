import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    mtcs: {
      primary: string;
      secondary: string;
    };
  }
  interface PaletteOptions {
    mtcs: {
      primary: string;
      secondary: string;
    };
  }
}

export const theme = createTheme({
  typography: {
    fontFamily: ["Roboto", "Arial", "sans-serif"].join(","),
    h1: {
      fontSize: "2.75rem",
      fontWeight: 600,
    },
    h2: {
      fontSize: "2.6rem",
      fontWeight: 600,
    },
    h3: {
      fontSize: "2.4rem",
      fontWeight: 500,
    },
    h4: {
      fontSize: "2.2rem",
      fontWeight: 500,
    },
    h5: {
      fontSize: "2rem",
      fontWeight: 500,
    },
    h6: {
      fontSize: "1.8rem",
      fontWeight: 500,
    },
    body1: {
      fontSize: "1.2rem",
      fontWeight: 400,
    },
    body2: {
      fontSize: "1rem",
      fontWeight: 400,
    },
    button: {
      fontSize: "1rem",
      fontWeight: 500,
      textTransform: "none",
    },
  },
  palette: {
    primary: {
      main: "#0146C7",
      light: "#3369d1",
      dark: "#00318b",
    },
    secondary: {
      main: "#75EDD1",
      light: "#9ff2df",
      dark: "#52a592",
    },
    mtcs: {
      primary: "#0146C7",
      secondary: "#75EDD1",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        contained: {
          background: "linear-gradient(135deg, #0146C7, #75EDD1)",
          "&:hover": {
            background: "linear-gradient(135deg, #00318b, #52a592)",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "1.2rem",
          fontFamily: ["Roboto", "Arial", "sans-serif"].join(","),
        },
      },
    },
  },
});
