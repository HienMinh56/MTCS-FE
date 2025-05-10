import React, { createContext, useState, useContext, useEffect } from "react";
import Cookies from "js-cookie";
import { logout } from "../services/authApi";
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  role: "Staff" | "Admin" | string;
  fullName?: string;
}

interface JwtPayload {
  userId: string;
  sub: string;
  role?: "Staff" | "Admin" | string;
  exp: number;
  [key: string]: any;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  checkAuthStatus: () => boolean;
  hasRole: (requiredRoles: string | string[]) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  setIsAuthenticated: () => {},
  setUser: () => {},
  checkAuthStatus: () => false,
  hasRole: () => false,
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const token = Cookies.get("token");
    return !!token && token !== "";
  });

  const [user, setUser] = useState<User | null>(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        const userId =
          decoded.sub || decoded.userId || localStorage.getItem("userId");
        const msRole =
          decoded[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ];
        const role = decoded.role || msRole;

        // Check all possible formats of the name claim
        const fullName =
          decoded["name"] ||
          decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
          ] ||
          decoded[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/name"
          ] ||
          "Nhân viên";
        console.log("Token decoded:", decoded);
        console.log("FullName found:", fullName);

        if (userId && role) {
          return { id: userId, role, fullName };
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
    return null;
  });

  const checkAuthStatus = (): boolean => {
    const token = Cookies.get("token");
    return !!token && token !== "";
  };

  const hasRole = (requiredRoles: string | string[]): boolean => {
    if (!user) return false;

    const userRole = user.role;

    if (typeof requiredRoles === "string") {
      return userRole.toLowerCase() === requiredRoles.toLowerCase();
    }

    return requiredRoles.some(
      (role) => userRole.toLowerCase() === role.toLowerCase()
    );
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = "/";
  };

  useEffect(() => {
    const updateAuthState = () => {
      const token = Cookies.get("token");
      const authState = !!token && token !== "";
      setIsAuthenticated(authState);

      if (authState && token) {
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          const userId =
            decoded.sub || decoded.userId || localStorage.getItem("userId");
          const msRole =
            decoded[
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            ];
          const role = decoded.role || msRole;

          // Check all possible formats of the name claim
          const fullName =
            decoded["name"] ||
            decoded[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
            ] ||
            decoded[
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/name"
            ] ||
            "Nhân viên";
          console.log("Token refresh - decoded:", decoded);
          console.log("Token refresh - FullName found:", fullName);

          if (userId && role) {
            setUser({ id: userId, role, fullName });
          }
        } catch (error) {
          console.error("Failed to decode token:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

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
        setUser,
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
