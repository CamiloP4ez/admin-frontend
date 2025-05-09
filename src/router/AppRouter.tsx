import React from "react";
import type { JSX } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import { useAuth } from "../hooks/useAuth";
import LoginPage from "../pages/LoginPage";
import DashboardLayout from "../components/layout/DashboardLayout";
import UsersPage from "../pages/UserPage";
import PostsPage from "../pages/PostPage";
import AdminsPage from "../pages/AdminPage";

interface ProtectedRouteProps {
  element: JSX.Element;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  requiredRole,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !user?.roles.includes(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  return element;
};

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/users" replace />} />
            <Route
              path="users"
              element={<ProtectedRoute element={<UsersPage />} />}
            />
            <Route
              path="posts"
              element={<ProtectedRoute element={<PostsPage />} />}
            />
            <Route
              path="admins"
              element={
                <ProtectedRoute
                  element={<AdminsPage />}
                  requiredRole="ROLE_SUPERADMIN"
                />
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />{" "}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRouter;
