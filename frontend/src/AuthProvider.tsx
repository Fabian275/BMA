import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useRef,
  useEffect,
} from "react";
import axios from "axios";
import { CircularProgress } from "@mui/material";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const timerRef = useRef<number | null>(null);

  const login = (newToken: string) => {
    setToken(newToken);
  };

  const logout = async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToken(null);
    await axios.post(
      "http://localhost:5001/auth/logout",
      {},
      {
        withCredentials: true,
      }
    );
  };

  const setAuthToken = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5001/auth/refresh",
        {},
        { withCredentials: true }
      );
      setToken(response.data.accessToken);
      timerRef.current = setTimeout(setAuthToken, 15 * 60 * 1000);
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setAuthToken();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (loading)
    return (
      <div>
        <CircularProgress />
      </div>
    );

  return (
    <AuthContext.Provider
      value={{ token, isAuthenticated: !!token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error(
      "useAuth muss innerhalb eines AuthProvider verwendet werden"
    );
  return context;
};
