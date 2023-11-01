import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Define a PrivateRoute component that wraps child components to ensure user authentication
export const PrivateRoute: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { token, user } = useAuth();

  if (!token || !user?._id) return <Navigate to="/login" replace />;

  // If authenticated, render the child components
  return children;
};
