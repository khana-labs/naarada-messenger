import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import api, {
  getApiErrorMessage,
} from "../services/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "narada-token";
const USER_KEY = "narada-user";

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem(USER_KEY);

    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(() =>
    localStorage.getItem(TOKEN_KEY)
  );
  const [loading, setLoading] = useState(true);

  const saveSession = useCallback(
    (sessionToken, sessionUser) => {
      localStorage.setItem(TOKEN_KEY, sessionToken);
      localStorage.setItem(
        USER_KEY,
        JSON.stringify(sessionUser)
      );

      setToken(sessionToken);
      setUser(sessionUser);
    },
    []
  );

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setToken(null);
    setUser(null);
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);

    if (!storedToken) {
      setLoading(false);
      return null;
    }

    try {
      const response = await api.get("/auth/me");
      const currentUser = response.data.user;

      localStorage.setItem(
        USER_KEY,
        JSON.stringify(currentUser)
      );

      setToken(storedToken);
      setUser(currentUser);

      return currentUser;
    } catch {
      clearSession();
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession();
    };

    window.addEventListener(
      "narada:unauthorized",
      handleUnauthorized
    );

    return () => {
      window.removeEventListener(
        "narada:unauthorized",
        handleUnauthorized
      );
    };
  }, [clearSession]);

  const register = async (formData) => {
    try {
      const response = await api.post(
        "/auth/register",
        formData
      );

      saveSession(
        response.data.token,
        response.data.user
      );

      return {
        success: true,
        user: response.data.user,
      };
    } catch (error) {
      return {
        success: false,
        message: getApiErrorMessage(
          error,
          "Registration failed"
        ),
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      saveSession(
        response.data.token,
        response.data.user
      );

      return {
        success: true,
        user: response.data.user,
      };
    } catch (error) {
      return {
        success: false,
        message: getApiErrorMessage(
          error,
          "Login failed"
        ),
      };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post("/auth/logout");
      }
    } catch {
      // The local session should still be cleared.
    } finally {
      clearSession();
    }
  };

  const updateLocalUser = (updatedUser) => {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify(updatedUser)
    );

    setUser(updatedUser);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      register,
      login,
      logout,
      fetchCurrentUser,
      updateLocalUser,
    }),
    [
      user,
      token,
      loading,
      fetchCurrentUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}