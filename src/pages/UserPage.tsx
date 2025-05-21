import React, { useEffect, useState, useCallback } from "react";
import {
  getAllUsers,
  deleteUser as deleteUserService,
} from "../services/userService";
import { useAuth } from "../hooks/useAuth";
import UserPostsModal from "../components/users/UserPostModal";
import EditUserModal from "../components/users/EditUsersModal";
import type { UserResponseDto } from "../types/user";

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPostsModalOpen, setIsPostsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(
    null
  );

  const { user: loggedInUser } = useAuth();
  const isSuperAdmin = loggedInUser?.roles.includes("ROLE_SUPERADMIN");

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

  const handleOpenEditModal = (user: UserResponseDto) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleOpenPostsModal = (user: UserResponseDto) => {
    setSelectedUser(user);
    setIsPostsModalOpen(true);
  };

  const handleUserUpdated = (updatedUser: UserResponseDto) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    fetchUsers();
  };

  const handleDeleteUser = async (userIdToDelete: string) => {
    if (!isSuperAdmin) {
      alert("No tienes permiso para borrar usuarios.");
      return;
    }
    if (loggedInUser?.userId === userIdToDelete) {
      alert("No puedes eliminarte a ti mismo.");
      return;
    }

    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer."
      )
    ) {
      setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading && users.length === 0) return <p>Cargando usuarios...</p>;
  if (error)
    return (
      <p className="error-message" style={{ color: "var(--color-danger)" }}>
        Error: {error}
      </p>
    );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestión de Usuarios</h1>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Roles</th>
            <th>Estado</th>
            <th>Seguidores</th>
            <th>Siguiendo</th>
            <th>Registrado</th>
            <th>Publicaciones</th>
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
              <td style={{ textAlign: "center" }}>{user.followersCount}</td>{" "}
              <td style={{ textAlign: "center" }}>{user.followingCount}</td>{" "}
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td style={{ textAlign: "center" }}>
                <button
                  onClick={() => handleOpenPostsModal(user)}
                  className="view-btn"
                  title="Ver publicaciones del usuario"
                >
                  Ver
                </button>
              </td>
              <td className="actions-cell">
                <button
                  onClick={() => handleOpenEditModal(user)}
                  className="edit-btn"
                >
                  Editar Estado
                </button>
                {isSuperAdmin && (
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="delete-btn"
                    disabled={loggedInUser?.userId === user.id}
                  >
                    Borrar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={selectedUser}
          onUserUpdated={handleUserUpdated}
        />
      )}

      {selectedUser && (
        <UserPostsModal
          isOpen={isPostsModalOpen}
          onClose={() => setIsPostsModalOpen(false)}
          userId={selectedUser.id}
          username={selectedUser.username}
        />
      )}
    </div>
  );
};

export default UsersPage;
