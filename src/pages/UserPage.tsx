import React, { useEffect, useState, useCallback } from "react";
import {
  getAllUsers,
  deleteUser as deleteUserService,
} from "../services/userService";
import UserFormModal from "../components/users/UserFormModal";
import ViewUserConnectionsModal from "../components/users/ViewUserConnectionsModal";
import { useAuth } from "../hooks/useAuth";
import UserPostsModal from "../components/users/UserPostModal";
import type { UserResponseDto } from "../types/user";

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isUserFormModalOpen, setIsUserFormModalOpen] = useState(false);
  const [isPostsModalOpen, setIsPostsModalOpen] = useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);

  const [selectedUserForAction, setSelectedUserForAction] =
    useState<UserResponseDto | null>(null);

  const { user: loggedInUser } = useAuth();
  const isSuperAdmin = loggedInUser?.roles.includes("ROLE_SUPERADMIN");
  const isAdminOrSuperAdmin = loggedInUser?.roles.some((role) =>
    ["ROLE_ADMIN", "ROLE_SUPERADMIN"].includes(role)
  );

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllUsers();
      if (response.data && response.code === 200) {
        setUsers(response.data);
      } else {
        setError(response.message || "Error al cargar usuarios.");
        setUsers([]);
      }
    } catch (err: unknown) {
      console.error("Error fetching users:", err);
      setError("Ocurrió un error.");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenCreateUserModal = () => {
    setSelectedUserForAction(null);
    setIsUserFormModalOpen(true);
  };

  const handleOpenEditUserModal = (user: UserResponseDto) => {
    setSelectedUserForAction(user);
    setIsUserFormModalOpen(true);
  };

  const handleOpenPostsModal = (user: UserResponseDto) => {
    setSelectedUserForAction(user);
    setIsPostsModalOpen(true);
  };

  const handleOpenFollowersModal = (user: UserResponseDto) => {
    setSelectedUserForAction(user);
    setIsFollowersModalOpen(true);
  };

  const handleOpenFollowingModal = (user: UserResponseDto) => {
    setSelectedUserForAction(user);
    setIsFollowingModalOpen(true);
  };

  const handleUserSaved = (savedUser: UserResponseDto) => {
    const existingUserIndex = users.findIndex((u) => u.id === savedUser.id);
    if (existingUserIndex > -1) {
      setUsers((prevUsers) => {
        const newUsers = [...prevUsers];
        newUsers[existingUserIndex] = savedUser;
        return newUsers;
      });
    } else {
      setUsers((prevUsers) => [savedUser, ...prevUsers]);
    }
  };

  const handleDeleteUser = async (userIdToDelete: string, username: string) => {
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
        `¿Estás seguro de que quieres eliminar al usuario ${username}? Esta acción no se puede deshacer.`
      )
    ) {
      try {
        await deleteUserService(userIdToDelete);
        setUsers((prevUsers) =>
          prevUsers.filter((u) => u.id !== userIdToDelete)
        );
        alert(`Usuario ${username} eliminado con éxito.`);
      } catch (err: unknown) {
        console.error("Error deleting user:", err);
        alert("Error al eliminar el usuario.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const closeModalAndClearSelection = () => {
    setIsUserFormModalOpen(false);
    setIsPostsModalOpen(false);
    setIsFollowersModalOpen(false);
    setIsFollowingModalOpen(false);
    setSelectedUserForAction(null);
  };

  if (isLoading) return <p>Cargando usuarios...</p>;
  if (error && users.length === 0)
    return (
      <p className="error-message" style={{ color: "var(--color-danger)" }}>
        Error: {error}
      </p>
    );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestión de Usuarios</h1>
        {isAdminOrSuperAdmin && (
          <button onClick={handleOpenCreateUserModal} className="add-button">
            Crear Usuario
          </button>
        )}
      </div>
      {error && (
        <p
          className="error-message"
          style={{ color: "var(--color-danger)", marginBottom: "15px" }}
        >
          Error al cargar datos: {error}
        </p>
      )}

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
              <td style={{ textAlign: "center" }}>
                <button
                  onClick={() => handleOpenFollowersModal(user)}
                  className="link-like-button"
                  disabled={user.followersCount === 0}
                  title="Ver seguidores"
                >
                  {user.followersCount}
                </button>
              </td>
              <td style={{ textAlign: "center" }}>
                <button
                  onClick={() => handleOpenFollowingModal(user)}
                  className="link-like-button"
                  disabled={user.followingCount === 0}
                  title="Ver a quién sigue"
                >
                  {user.followingCount}
                </button>
              </td>
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
                {isAdminOrSuperAdmin && (
                  <button
                    onClick={() => handleOpenEditUserModal(user)}
                    className="edit-btn"
                  >
                    Editar
                  </button>
                )}
                {isSuperAdmin && (
                  <button
                    onClick={() => handleDeleteUser(user.id, user.username)}
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

      {/* Modal para Crear/Editar Usuario */}
      {isAdminOrSuperAdmin && isUserFormModalOpen && (
        <UserFormModal
          isOpen={isUserFormModalOpen}
          onClose={closeModalAndClearSelection}
          userToEdit={selectedUserForAction}
          onUserSaved={handleUserSaved}
        />
      )}

      {/* Modal para Ver Posts del Usuario */}
      {isPostsModalOpen && selectedUserForAction && (
        <UserPostsModal
          isOpen={isPostsModalOpen}
          onClose={closeModalAndClearSelection}
          userId={selectedUserForAction.id}
          username={selectedUserForAction.username}
        />
      )}

      {/* Modales para Ver Seguidores/Siguiendo */}
      {isFollowersModalOpen && selectedUserForAction && (
        <ViewUserConnectionsModal
          isOpen={isFollowersModalOpen}
          onClose={closeModalAndClearSelection}
          user={selectedUserForAction}
          type="followers"
        />
      )}
      {isFollowingModalOpen && selectedUserForAction && (
        <ViewUserConnectionsModal
          isOpen={isFollowingModalOpen}
          onClose={closeModalAndClearSelection}
          user={selectedUserForAction}
          type="following"
        />
      )}
    </div>
  );
};

export default UsersPage;
