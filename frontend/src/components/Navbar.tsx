import {
  AppBar,
  Avatar,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useAuth } from "../AuthProvider";
import { useTranslation } from "react-i18next";
import { useThemeMode } from "../components/ThemeContext";


interface Props {
  title: string;
}

const Navbar = (props: Props) => {
  const { title } = props;
  const { logout } = useAuth();
  const { t, i18n } = useTranslation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { toggleMode, icon } = useThemeMode();


  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLanguageSelect = (lang: string) => {
    i18n.changeLanguage(lang);
    handleMenuClose();
  };

  return (
    <>
      <AppBar>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {t(title)}
          </Typography>
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <Avatar alt="Profil" />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={() => handleLanguageSelect("de")}>Deutsch</MenuItem>
        <MenuItem onClick={() => handleLanguageSelect("en")}>English</MenuItem>
        <MenuItem onClick={() => handleLanguageSelect("fr")}>Français</MenuItem>
        <Divider />

        <MenuItem onClick={toggleMode}>
          {icon}
        </MenuItem>

        <Divider />
        <MenuItem
          onClick={() => {
            logout();
          }}
        >
          {t("logout")}
        </MenuItem>
      </Menu>
    </>
  );
};

export default Navbar;
