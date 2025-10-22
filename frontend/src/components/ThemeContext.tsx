import { createContext, useContext, useMemo, useState } from "react";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  icon: React.ReactNode;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "light",
  toggleMode: () => {},
  icon: <DarkModeIcon />,
});

export const useThemeMode = () => useContext(ThemeContext);

export const ThemeModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>(
    localStorage.getItem("themeMode") === "light" ? "light" : "dark"
  );

  const toggleMode = () => {
    const newMode = mode === "dark" ? "light" : "dark";
    setMode(newMode);
    localStorage.setItem("themeMode", newMode);
  };

  const icon = mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />;

  const value = useMemo(() => ({ mode, toggleMode, icon }), [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
