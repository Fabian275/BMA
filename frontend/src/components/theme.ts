import { createTheme } from "@mui/material/styles";

export const getTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      background: {
        default: mode === "dark" ? "#2e2e2eff" : "#f5f5f5",
        paper: mode === "dark" ? "#434343ff" : "#ffffff",
      },
      text: {
        primary: mode === "dark" ? "#fff" : "#000",
        secondary: mode === "dark" ? "#ccc" : "#555",
      },
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: mode === "dark" ? "#aaa" : undefined,
              },
              "&:hover fieldset": {
                borderColor: mode === "dark" ? "#fff" : undefined,
              },
              "&.Mui-focused fieldset": {
                borderColor: mode === "dark" ? "#90caf9" : undefined,
              },
            },
            "& .MuiInputLabel-root": {
              color: mode === "dark" ? "#ccc" : undefined,
            },
            "& .MuiInputBase-input": {
              color: mode === "dark" ? "#fff" : undefined,
            },
          },
        },
      },
    },
  });