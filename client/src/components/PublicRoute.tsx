import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Define the PublicRoute component which takes in children as its prop
export const PublicRoute: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { token, user } = useAuth();

  if (token && user?._id) return <Navigate to="/chat" replace />;

  // If no token or user ID exists, render the child components as they are
  return children;
};
