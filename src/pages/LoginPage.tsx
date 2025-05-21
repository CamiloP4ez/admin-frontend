import React, { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { loginUser } from "../services/authService";
import GenericLogo from "../assets/lookLogo.png";
import "./LoginPage.css";
// Iconos (ejemplo, podrías usar react-icons o SVGs)
// import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Nuevo estado
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const response = await loginUser({ username, password });
      if (response.code === 200 && response.data) {
        login(response.data);
        navigate("/");
      } else {
        setError(response.message || "Error desconocido en el login.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Login failed:", err.message);
        setError(
          err.message ||
            "Error al intentar iniciar sesión. Verifica tus credenciales."
        );
      } else {
        setError("Ocurrió un error desconocido.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-form-container">
        <img
          src={GenericLogo}
          alt="Logo de la empresa"
          className="login-logo"
        />
        <h1 className="login-title">Login</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Usuario</label> {/* Cambiado a español */}
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              aria-describedby={error ? "login-error-message" : undefined}
            />
          </div>
          <div className="form-group password-group">
            {" "}
            {/* Clase para posicionar el botón */}
            <label htmlFor="password">Contraseña</label>{" "}
            {/* Cambiado a español */}
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              aria-describedby={error ? "login-error-message" : undefined}
            />
            <button
              type="button"
              className="password-toggle-button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {/* Idealmente usar un SVG o un componente de icono */}
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {error && (
            <p
              id="login-error-message"
              className="error-message"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </p>
          )}
          {/* Opcional: Enlace para "Olvidé mi contraseña" */}
          <div className="form-options">
            <a href="/forgot-password" className="forgot-password-link">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? "Cargando..." : "Aceptar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
