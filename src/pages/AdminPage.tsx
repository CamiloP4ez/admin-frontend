import React, { useEffect, useState, useCallback } from "react";
import {
  getAllUsers,
  updateUserStatus,
  deleteUser as deleteUserService,
} from "../services/userService";
import { useAuth } from "../hooks/useAuth";
import ManageUserRolesModal from "../components/admins/ManageUserRolesModal";
import type { UserResponseDto } from "../types/user";

const AdminsPage: React.FC = () => {
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(
    null
  );

  const { user: loggedInUser } = useAuth();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllUsers();
      if (response.data && response.code === 200) {
        setUsers(response.data);
      } else {
        setError(response.message || "Error al cargar usuarios.");
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
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenRolesModal = (user: UserResponseDto) => {
    setSelectedUser(user);
    setIsRolesModalOpen(true);
  };

  const handleUserRolesUpdated = (updatedUser: UserResponseDto) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
  };

  const handleToggleUserStatus = async (userToUpdate: UserResponseDto) => {
    if (loggedInUser?.userId === userToUpdate.id) {
      alert("No puedes cambiar tu propio estado desde esta interfaz.");
      return;
    }
    const newStatus = !userToUpdate.enabled;
    const action = newStatus ? "habilitar" : "deshabilitar";
    if (
      window.confirm(
        `¿Estás seguro de que quieres ${action} a ${userToUpdate.username}?`
      )
    ) {
      try {
        const response = await updateUserStatus(userToUpdate.id, {
          enabled: newStatus,
        });
        if (response.data) {
          handleUserRolesUpdated(response.data);
        }
      } catch (err: unknown) {
        console.error("Error updating user status:", err);

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Ocurrió un error al actualizar el usuario.");
        }
      }
    }
  };

  const handleDeleteUser = async (userIdToDelete: string, username: string) => {
    if (loggedInUser?.userId === userIdToDelete) {
      alert("No puedes eliminarte a ti mismo.");
      return;
    }
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar PERMANENTEMENTE a ${username}? Esta acción no se puede deshacer.`
      )
    ) {
      try {
        await deleteUserService(userIdToDelete);
        setUsers((prevUsers) =>
          prevUsers.filter((u) => u.id !== userIdToDelete)
        );
      } catch (err: unknown) {
        console.error("Error updating user status:", err);

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Ocurrió un error al actualizar el usuario.");
        }
      }
    }
  };

  if (isLoading && users.length === 0) return <p>Cargando usuarios...</p>;
  if (error)
    return (
      <p className="error-message" style={{ color: "var(--color-danger)" }}>
        {error}
      </p>
    );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestión Avanzada de Usuarios (SuperAdmin)</h1>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Roles Actuales</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.roles.join(", ").replace(/ROLE_/g, "")}</td>
              <td>
                <span
                  style={{
                    color: user.enabled ? "green" : "red",
                    fontWeight: "bold",
                  }}
                >
                  {user.enabled ? "Habilitado" : "Deshabilitado"}
                </span>
              </td>
              <td className="actions-cell">
                <button
                  onClick={() => handleOpenRolesModal(user)}
                  className="edit-btn" // Reutilizar estilo
                  disabled={
                    user.id === loggedInUser?.userId &&
                    user.roles.includes("ROLE_SUPERADMIN")
                  }
                  title={
                    user.id === loggedInUser?.userId &&
                    user.roles.includes("ROLE_SUPERADMIN")
                      ? "No puedes gestionar tus propios roles de SuperAdmin"
                      : "Gestionar Roles"
                  }
                >
                  Gestionar Roles
                </button>
                <button
                  onClick={() => handleToggleUserStatus(user)}
                  className={user.enabled ? "delete-btn" : "view-btn"}
                  disabled={user.id === loggedInUser?.userId}
                  title={
                    user.id === loggedInUser?.userId
                      ? "No puedes cambiar tu propio estado aquí"
                      : user.enabled
                      ? "Deshabilitar Usuario"
                      : "Habilitar Usuario"
                  }
                >
                  {user.enabled ? "Deshabilitar" : "Habilitar"}
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id, user.username)}
                  className="delete-btn"
                  disabled={user.id === loggedInUser?.userId}
                  title={
                    user.id === loggedInUser?.userId
                      ? "No puedes eliminarte a ti mismo"
                      : "Eliminar Usuario"
                  }
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser && (
        <ManageUserRolesModal
          isOpen={isRolesModalOpen}
          onClose={() => setIsRolesModalOpen(false)}
          user={selectedUser}
          onUserRolesUpdated={handleUserRolesUpdated}
        />
      )}
    </div>
  );
};

export default AdminsPage;
