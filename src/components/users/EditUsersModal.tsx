import React, { useState, useEffect } from "react";
import type { FormEvent } from "react";
import Modal from "../common/Modal";
import { updateUserStatus } from "../../services/userService";
import { useAuth } from "../../hooks/useAuth";
import type { UserResponseDto, UserStatusUpdateDto } from "../../types/user";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserResponseDto | null;
  onUserUpdated: (updatedUser: UserResponseDto) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserUpdated,
}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user: loggedInUser } = useAuth();

  useEffect(() => {
    if (user) {
      setIsEnabled(user.enabled);
      setError(null);
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (loggedInUser && loggedInUser.userId === user.id && !isEnabled) {
      setError("No puedes deshabilitarte a ti mismo.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const statusUpdate: UserStatusUpdateDto = { enabled: isEnabled };

    try {
      const response = await updateUserStatus(user.id, statusUpdate);
      if (response.data && (response.code === 200 || response.code === 204)) {
        onUserUpdated(response.data);
        onClose();
      } else {
        setError(
          response.message || "Error al actualizar el estado del usuario."
        );
      }
    } catch (err: unknown) {
      console.error("Error updating user status:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error al actualizar el usuario.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar Estado de ${user.username}`}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="isEnabled">Estado del Usuario:</label>
          <select
            id="isEnabled"
            value={isEnabled ? "true" : "false"}
            onChange={(e) => setIsEnabled(e.target.value === "true")}
            disabled={isLoading}
          >
            <option value="true">Habilitado</option>
            <option value="false">Deshabilitado</option>
          </select>
        </div>

        {error && (
          <p
            className="error-message"
            style={{ color: "var(--color-danger)", marginBottom: "10px" }}
          >
            {error}
          </p>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={onClose}
            className="cancel-button"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditUserModal;
