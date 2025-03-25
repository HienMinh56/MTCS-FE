import React, { createContext, useState, useContext, useEffect } from "react";
import Cookies from "js-cookie";
import { logout } from "../services/authApi";

interface User {
  id: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthStatus: () => boolean;
  hasRole: (requiredRoles: string | string[]) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  setIsAuthenticated: () => {},
  checkAuthStatus: () => false,
  hasRole: () => false,
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Initialize auth state immediately during component mount
    const token = Cookies.get("token");
    return !!token && token !== "";
  });

  const [user, setUser] = useState<User | null>(() => {
    // Initialize user state immediately during component mount
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("userRole");

    if (userId && userRole) {
      return { id: userId, role: userRole };
    }
    return null;
  });

  const checkAuthStatus = (): boolean => {
    const token = Cookies.get("token");
    return !!token && token !== "";
  };

  const hasRole = (requiredRoles: string | string[]): boolean => {
    if (!user) return false;

    if (typeof requiredRoles === "string") {
      return user.role.toLowerCase() === requiredRoles.toLowerCase();
    }

    return requiredRoles.some(
      (role) => user.role.toLowerCase() === role.toLowerCase()
    );
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setUser(null);

    // Force navigation to homepage when using context logout
    window.location.href = "/";
  };

  useEffect(() => {
    const updateAuthState = () => {
      const authState = checkAuthStatus();
      setIsAuthenticated(authState);

      if (authState) {
        const userId = localStorage.getItem("userId");
        const userRole = localStorage.getItem("userRole");

        if (userId && userRole) {
          setUser({ id: userId, role: userRole });
        }
      } else {
        setUser(null);
      }
    };

    // Run immediately on mount to ensure sync
    updateAuthState();

    window.addEventListener("auth-changed", updateAuthState);
    const intervalId = setInterval(updateAuthState, 5000);

    return () => {
      window.removeEventListener("auth-changed", updateAuthState);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        setIsAuthenticated,
        checkAuthStatus,
        hasRole,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
