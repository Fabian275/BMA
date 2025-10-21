import {
  AppBar,
  Avatar,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import PeopleIcon from "@mui/icons-material/People";
import axios from "axios";
import PersonIcon from "@mui/icons-material/Person";
import { useAuth } from "../AuthProvider";
import { useTranslation } from "react-i18next";
interface User {
  username: string;
  customer_id: number;
  role_id: number;
}

interface Props {
  title: string;
}

const Navbar = (props: Props) => {
  const { title } = props;
  const { token, logout } = useAuth();
  const { t, i18n } = useTranslation();

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [role, setRole] = useState<number | null>(null);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
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

  const getUsers = async () => {
    await axios
      .get("http://localhost:5000/api/users", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      })
      .then((response) => {
        if (response.status === 200) {
          setUsers(response.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  };

  useEffect(() => {
    if (!token) {
      return;
    }
    const tokenData = JSON.parse(atob(token.split(".")[1]));
    setRole(tokenData.role_id);
    if (tokenData.role_id === 2) {
      getUsers();
    }
  }, []);

  return (
    <>
      <AppBar>
        <Toolbar>
          {role === 2 && (
            <IconButton edge="start" color="inherit" onClick={handleOpen}>
              <PeopleIcon />
            </IconButton>
          )}
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
        <MenuItem
          onClick={() => {
            logout();
          }}
        >
          {t("logout")}
        </MenuItem>
      </Menu>
      {role === 2 && (
        <Dialog
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: {
              m: 0,
              position: "absolute",
              left: 0,
              top: 0,
              height: "100%",
              maxWidth: 300,
              width: "100%",
            },
          }}
        >
          <DialogTitle>{t("userList")}</DialogTitle>
          <DialogContent>
            <List>
              {users.map((user, index) => (
                <ListItem key={index}>
                  <PersonIcon
                    color={user.role_id === 2 ? "warning" : "action"}
                  />
                  <ListItemText primary={user.username} />
                </ListItem>
              ))}
            </List>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default Navbar;
