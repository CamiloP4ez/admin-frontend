import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import type { FormEvent } from "react";

import {
  createUserByAdmin,
  updateUserByAdmin,
} from "../../services/userService";
import { useAuth } from "../../hooks/useAuth";
import type { UserResponseDto } from "../../types/user";
import type {
  AdminUserUpdateRequestDto,
  UserCreateRequestDto,
} from "../../types/api";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: UserResponseDto | null;
  onUserSaved: (savedUser: UserResponseDto) => void;
}

const AVAILABLE_MANAGEABLE_ROLES = ["ROLE_USER", "ROLE_ADMIN"];

const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  userToEdit,
  onUserSaved,
}) => {
  const { user: loggedInUser } = useAuth();
  const isEditMode = !!userToEdit;

  const [formData, setFormData] = useState<
    UserCreateRequestDto | AdminUserUpdateRequestDto
  >({});
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["ROLE_USER"]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (isEditMode && userToEdit) {
        setFormData({
          username: userToEdit.username,
          email: userToEdit.email,
          profilePictureUri: userToEdit.profilePictureUri,
          enabled: userToEdit.enabled,
        });

        setSelectedRoles(
          userToEdit.roles.filter((role) =>
            AVAILABLE_MANAGEABLE_ROLES.includes(role)
          )
        );
      } else {
        setFormData({
          username: "",
          email: "",
          password: "",
          profilePictureUri: "",
          enabled: true,
        });
        setSelectedRoles(["ROLE_USER"]);
      }
    }
  }, [isOpen, userToEdit, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRoleChange = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.username?.trim() && !isEditMode) {
      setError("El nombre de usuario es obligatorio.");
      setIsLoading(false);
      return;
    }
    if (!formData.email?.trim() && !isEditMode) {
      setError("El email es obligatorio.");
      setIsLoading(false);
      return;
    }
    if (!isEditMode && !formData.password?.trim()) {
      setError("La contraseña es obligatoria al crear un usuario.");
      setIsLoading(false);
      return;
    }
    if (selectedRoles.length === 0) {
      setError("El usuario debe tener al menos un rol.");
      setIsLoading(false);
      return;
    }
    if (!selectedRoles.includes("ROLE_USER")) {
      setError("El usuario debe tener el rol 'USER'.");
      setIsLoading(false);
    }

    const finalRoles = [...selectedRoles];

    if (isEditMode && userToEdit) {
      userToEdit.roles.forEach((existingRole) => {
        if (
          !AVAILABLE_MANAGEABLE_ROLES.includes(existingRole) &&
          !finalRoles.includes(existingRole)
        ) {
          finalRoles.push(existingRole);
        }
      });
    }

    const payload: UserCreateRequestDto | AdminUserUpdateRequestDto = {
      ...formData,
      roles: finalRoles,
      profilePictureUri:
        formData.profilePictureUri?.trim() === ""
          ? null
          : formData.profilePictureUri,
    };

    if (isEditMode && (!payload.password || payload.password.trim() === "")) {
      delete payload.password;
    }

    try {
      let response;
      if (isEditMode && userToEdit) {
        if (loggedInUser?.userId === userToEdit.id) {
          if (payload.enabled === false) {
            setError("No puedes deshabilitarte a ti mismo.");
            setIsLoading(false);
            return;
          }
        }
        response = await updateUserByAdmin(
          userToEdit.id,
          payload as AdminUserUpdateRequestDto
        );
      } else {
        response = await createUserByAdmin(payload as UserCreateRequestDto);
      }

      if (response.data && (response.code === 200 || response.code === 201)) {
        onUserSaved(response.data);
        onClose();
      } else {
        setError(
          response.message ||
            `Error al ${isEditMode ? "actualizar" : "crear"} el usuario.`
        );
      }
    } catch (err: unknown) {
      console.error(`Error ${isEditMode ? "updating" : "creating"} user:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  const modalTitle = isEditMode
    ? `Editar Usuario: ${userToEdit?.username}`
    : "Crear Nuevo Usuario";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Nombre de Usuario</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username || ""}
            onChange={handleChange}
            required={!isEditMode}
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            required={!isEditMode}
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">
            Contraseña {isEditMode && "(dejar en blanco para no cambiar)"}
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password || ""}
            onChange={handleChange}
            required={!isEditMode}
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="profilePictureUri">
            URL Foto de Perfil (opcional)
          </label>
          <input
            type="text"
            id="profilePictureUri"
            name="profilePictureUri"
            value={formData.profilePictureUri || ""}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>Roles:</label>
          {AVAILABLE_MANAGEABLE_ROLES.map((role) => (
            <div key={role} className="form-check">
              <input
                type="checkbox"
                id={`role-${role}`}
                value={role}
                checked={selectedRoles.includes(role)}
                onChange={() => handleRoleChange(role)}
                disabled={
                  isLoading ||
                  (isEditMode &&
                    userToEdit?.id === loggedInUser?.userId &&
                    role === "ROLE_SUPERADMIN")
                }
              />
              <label
                htmlFor={`role-${role}`}
                style={{ marginLeft: "8px", fontWeight: "normal" }}
              >
                {role.replace("ROLE_", "")}
              </label>
            </div>
          ))}
          {isEditMode && userToEdit?.roles.includes("ROLE_SUPERADMIN") && (
            <p
              style={{
                fontStyle: "italic",
                fontSize: "0.9em",
                color: "var(--color-text-secondary)",
              }}
            >
              El rol SUPERADMIN no se puede remover desde esta interfaz para
              este usuario.
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="enabled" className="form-check-label">
            Habilitado:
          </label>
          <input
            type="checkbox"
            id="enabled"
            name="enabled"
            checked={formData.enabled ?? true}
            onChange={handleChange}
            disabled={
              isLoading ||
              (isEditMode && userToEdit?.id === loggedInUser?.userId)
            }
            className="form-check-input"
            style={{ width: "auto", marginLeft: "10px" }}
          />
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
            {isLoading
              ? "Guardando..."
              : isEditMode
              ? "Actualizar Usuario"
              : "Crear Usuario"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserFormModal;
