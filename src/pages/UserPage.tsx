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
import "./UserPage.css";

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
      setError("Ocurrió un error al intentar contactar el servidor.");
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
        setIsLoading(true);
        await deleteUserService(userIdToDelete);
        setUsers((prevUsers) =>
          prevUsers.filter((u) => u.id !== userIdToDelete)
        );
        alert(`Usuario ${username} eliminado con éxito.`);
      } catch (err: unknown) {
        console.error("Error deleting user:", err);
        let errorMessage = "Error al eliminar el usuario.";
        if (err && typeof err === "object" && "response" in err) {
          const errorObj = err as {
            response?: { data?: { message?: string } };
          };
          errorMessage = errorObj.response?.data?.message || errorMessage;
        }
        alert(errorMessage);
        setError(errorMessage);
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

  if (isLoading && users.length === 0)
    return <p className="loading-message">Cargando usuarios...</p>;

  return (
    <div className="page-container users-page">
      <div className="page-header">
        <h1>Gestión de Usuarios</h1>
        {isAdminOrSuperAdmin && (
          <button
            onClick={handleOpenCreateUserModal}
            className="btn btn-primary"
          >
            <span className="icon-add">+</span> Crear Usuario
          </button>
        )}
      </div>

      {error && <p className="error-message">Error: {error}</p>}

      {isLoading && (
        <p className="loading-inline-message">Actualizando datos...</p>
      )}

      <div className="table-responsive-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Roles</th>
              <th>Estado</th>
              <th className="text-center">Seguidores</th>
              <th className="text-center">Siguiendo</th>
              <th>Registrado</th>
              <th className="text-center">Publicaciones</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && !isLoading && !error && (
              <tr>
                <td colSpan={9} className="text-center empty-table-message">
                  No hay usuarios para mostrar.
                </td>
              </tr>
            )}
            {users.map((user) => (
              <tr key={user.id}>
                <td data-label="Username">{user.username}</td>
                <td data-label="Email">{user.email}</td>
                <td data-label="Roles">
                  {user.roles.join(", ").replace(/ROLE_/g, "")}
                </td>
                <td data-label="Estado">
                  <span
                    className={`status-badge ${
                      user.enabled ? "status-enabled" : "status-disabled"
                    }`}
                  >
                    {user.enabled ? "Habilitado" : "Deshabilitado"}
                  </span>
                </td>
                <td data-label="Seguidores" className="text-center">
                  <button
                    onClick={() => handleOpenFollowersModal(user)}
                    className="btn-link"
                    disabled={user.followersCount === 0}
                    title="Ver seguidores"
                  >
                    {user.followersCount}
                  </button>
                </td>
                <td data-label="Siguiendo" className="text-center">
                  <button
                    onClick={() => handleOpenFollowingModal(user)}
                    className="btn-link"
                    disabled={user.followingCount === 0}
                    title="Ver a quién sigue"
                  >
                    {user.followingCount}
                  </button>
                </td>
                <td data-label="Registrado">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td data-label="Publicaciones" className="text-center">
                  <button
                    onClick={() => handleOpenPostsModal(user)}
                    className="btn btn-secondary btn-small"
                    title="Ver publicaciones del usuario"
                  >
                    Ver
                  </button>
                </td>
                <td data-label="Acciones" className="actions-cell">
                  {isAdminOrSuperAdmin && (
                    <button
                      onClick={() => handleOpenEditUserModal(user)}
                      className="btn btn-primary btn-small"
                      title="Editar usuario"
                    >
                      <span className="icon-edit">✎</span> Editar
                    </button>
                  )}
                  {isSuperAdmin && (
                    <button
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      className="btn btn-danger btn-small"
                      disabled={loggedInUser?.userId === user.id}
                      title="Borrar usuario"
                    >
                      <span className="icon-delete">🗑</span> Borrar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAdminOrSuperAdmin && isUserFormModalOpen && (
        <UserFormModal
          isOpen={isUserFormModalOpen}
          onClose={closeModalAndClearSelection}
          userToEdit={selectedUserForAction}
          onUserSaved={handleUserSaved}
        />
      )}

      {isPostsModalOpen && selectedUserForAction && (
        <UserPostsModal
          isOpen={isPostsModalOpen}
          onClose={closeModalAndClearSelection}
          userId={selectedUserForAction.id}
          username={selectedUserForAction.username}
        />
      )}

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
