import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Overview from "./components/Overview";
import { useAuth } from "./AuthProvider";
import Login from "./components/Login";
import Detailview from "./components/Detailview";
import { useState, useEffect } from "react";
import { initI18n } from "./i18n";
import {
  ThemeProvider,
  CssBaseline,
  CircularProgress,
  IconButton,
  Box,
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { getTheme } from "./components/theme";
import { useMediaQuery } from "@mui/material";

function App() {
  const { token } = useAuth();
  const [i18nInitialized, setI18nInitialized] = useState(false);
  const [mode, setMode] = useState<"light" | "dark">("dark");
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = getTheme(prefersDarkMode ? "dark" : "light");

  useEffect(() => {
    initI18n(token).then(() => {
      setI18nInitialized(true);
    });
  }, [token]);

  if (!i18nInitialized) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ position: "absolute", top: 16, right: 16 }}>
        <IconButton
          onClick={() => setMode(mode === "dark" ? "light" : "dark")}
          color="inherit"
        >
          {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Box>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/overview"
            element={
              <PrivateRoute>
                <Overview />
              </PrivateRoute>
            }
          />
          <Route
            path="/detailview/:id"
            element={
              <PrivateRoute>
                <Detailview />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
