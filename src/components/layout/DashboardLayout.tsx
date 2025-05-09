// src/components/layout/DashboardLayout.tsx
import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useAuth } from "../../hooks/useAuth";
import "./DashboardLayout.css";

const DashboardLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Cargando autenticación...</div>; // O un spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="dashboard-layout">
      <Navbar />
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
