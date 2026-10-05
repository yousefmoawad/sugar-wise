import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const normalizeRole = (role) => {
  const value = String(role || "").trim().toLowerCase();
  if (value === "super admin" || value === "superadmin" || value === "subadmin") return "superadmin";
  if (value === "admin") return "admin";
  if (value === "doctor") return "doctor";
  if (value === "patient") return "patient";
  return "guest";
};

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0) {
    const role = normalizeRole(user?.role);
    const normalizedAllowed = allowedRoles.map((r) => normalizeRole(r));
    if (!normalizedAllowed.includes(role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
