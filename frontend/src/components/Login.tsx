import { useEffect, useState } from "react";
import { useAuth } from "../AuthProvider";
import {
  Alert,
  Box,
  Button,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("Fabian");
  const [password, setPassword] = useState("G8Zq6tKrit");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/overview");
    }
  }, [isAuthenticated]);

  const submitLogin = async () => {
    setErrorMessage("");
    try {
      const response = await axios.post(
        "http://localhost:5001/auth/login",
        { username, password },
        { withCredentials: true }
      );
      const { accessToken } = response.data;
      login(accessToken);
      navigate("/overview");
    } catch (error: any) {
      if (error.response) {
        setErrorMessage(error.response.data?.message);
      } else {
        setErrorMessage(error.message);
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography component="h1" variant="h5">
        {t("loginTitle")}
      </Typography>
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          submitLogin();
        }}
        noValidate
        sx={{ mt: 1, width: "100%" }}
      >
        <TextField
          required
          fullWidth
          id="username"
          label={t("username")}
          name="username"
          autoComplete="username"
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              submitLogin();
            }
          }}
        />
        <TextField
          required
          fullWidth
          id="password"
          label={t("password")}
          name="password"
          type="password"
          autoComplete="current-password"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              submitLogin();
            }
          }}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          {t("signIn")}
        </Button>
      </Box>
    </Container>
  );
};

export default Login;
