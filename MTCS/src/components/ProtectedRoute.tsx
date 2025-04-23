import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  redirectPath?: string;
  pathPrefix?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles = [],
  redirectPath = "/unauthorized",
  pathPrefix,
}) => {
  const { isAuthenticated, hasRole, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Special case: Admin should have access to all routes
  if (user?.role === "Admin") {
    // Admin can access any protected route
    return <Outlet />;
  }

  // For non-admin users, check allowed roles
  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  // Path redirection logic
  if (user?.role === "Admin" && location.pathname.startsWith("/staff-menu/")) {
    const adminPath = location.pathname.replace("/staff-menu/", "/admin/");
    return <Navigate to={adminPath} replace />;
  }

  if (user?.role === "Staff" && location.pathname.startsWith("/admin/")) {
    const staffPath = location.pathname.replace("/admin/", "/staff-menu/");
    return <Navigate to={staffPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
