import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import GenericLogo from "../../assets/lookLogo.png";
import "./Navbar.css";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isSuperAdmin = user?.roles.includes("ROLE_SUPERADMIN");

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-brand-link">
          <img src={GenericLogo} alt="Logo" className="navbar-logo" />
          <span className="navbar-title">Admin Panel</span>
        </Link>
      </div>
      <div className="navbar-links">
        <NavLink
          to="/users"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Usuarios
        </NavLink>
        <NavLink
          to="/posts"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Publicaciones
        </NavLink>
        <NavLink
          to="/comments"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Comentarios
        </NavLink>
        {isSuperAdmin && (
          <NavLink
            to="/admins"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Administradores
          </NavLink>
        )}
      </div>
      <div className="navbar-actions">
        {user && <span className="navbar-username">Hola, {user.username}</span>}
        <button onClick={handleLogout} className="logout-button">
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
