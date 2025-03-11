import React, { createContext, useState, useContext, useEffect } from "react";
import Cookies from "js-cookie";

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthStatus: () => boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  checkAuthStatus: () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const checkAuthStatus = (): boolean => {
    const token = Cookies.get("token");
    const isAuth = !!token && token !== "";
    return isAuth;
  };

  useEffect(() => {
    const updateAuthState = () => {
      const authState = checkAuthStatus();
      setIsAuthenticated(authState);
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
      value={{ isAuthenticated, setIsAuthenticated, checkAuthStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
