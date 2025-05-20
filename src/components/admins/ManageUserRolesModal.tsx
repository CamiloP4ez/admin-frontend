// src/components/admins/ManageUserRolesModal.tsx
import React, { useState, useEffect } from "react";
import type { FormEvent } from "react";
import Modal from "../common/Modal";
import { updateUserRoles } from "../../services/userService";
import type {
  UserResponseDto,
  UserRoleUpdateRequestDto,
} from "../../types/user";

const AVAILABLE_ROLES = ["ROLE_USER", "ROLE_ADMIN"];

interface ManageUserRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserResponseDto | null;
  onUserRolesUpdated: (updatedUser: UserResponseDto) => void;
}

const ManageUserRolesModal: React.FC<ManageUserRolesModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserRolesUpdated,
}) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setSelectedRoles(
        user.roles.filter((role) => AVAILABLE_ROLES.includes(role))
      );
      setError(null);
    }
  }, [user]);

  const handleRoleChange = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (
      !selectedRoles.includes("ROLE_USER") &&
      AVAILABLE_ROLES.includes("ROLE_USER")
    ) {
      alert("Un usuario debe tener al menos el rol USER.");
      return;
    }

    const finalRoles = new Set<string>();
    user.roles.forEach((role) => {
      if (!AVAILABLE_ROLES.includes(role)) {
        finalRoles.add(role);
      }
    });
    selectedRoles.forEach((role) => finalRoles.add(role));

    setIsLoading(true);
    setError(null);

    const rolesUpdate: UserRoleUpdateRequestDto = {
      roles: Array.from(finalRoles),
    };

    try {
      const response = await updateUserRoles(user.id, rolesUpdate);
      if (response.data && response.code === 200) {
        onUserRolesUpdated(response.data);
        onClose();
      } else {
        setError(
          response.message || "Error al actualizar los roles del usuario."
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
      title={`Gestionar Roles de ${user.username}`}
    >
      <form onSubmit={handleSubmit}>
        <p>Selecciona los roles para el usuario:</p>
        <div className="roles-checkbox-group" style={{ marginBottom: "20px" }}>
          {AVAILABLE_ROLES.map((role) => (
            <div key={role} className="form-check">
              <input
                type="checkbox"
                id={`role-${role}`}
                value={role}
                checked={selectedRoles.includes(role)}
                onChange={() => handleRoleChange(role)}
                disabled={isLoading}
              />
              <label
                htmlFor={`role-${role}`}
                style={{ marginLeft: "8px", fontWeight: "normal" }}
              >
                {role.replace("ROLE_", "")}
              </label>
            </div>
          ))}
        </div>

        {user.roles.includes("ROLE_SUPERADMIN") && (
          <p
            style={{
              fontStyle: "italic",
              color: "var(--color-text-secondary)",
            }}
          >
            El rol SUPERADMIN no se puede modificar desde esta interfaz.
          </p>
        )}

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
            {isLoading ? "Guardando..." : "Guardar Roles"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ManageUserRolesModal;
