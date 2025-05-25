import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  getAllUsers,
  updateUserStatus,
  deleteUser as deleteUserService,
} from "../services/userService";
import { useAuth } from "../hooks/useAuth";
import ManageUserRolesModal from "../components/admins/ManageUserRolesModal";
import type { UserResponseDto } from "../types/user";
import "./AdminPage.css";

const AdminsPage: React.FC = () => {
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

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
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error al cargar los usuarios.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loggedInUser) {
      fetchUsers();
    }
  }, [fetchUsers, loggedInUser]);

  const handleOpenRolesModal = (userToManage: UserResponseDto) => {
    if (!loggedInUser) return;

    if (userToManage.id === loggedInUser.userId) {
      alert("No puedes gestionar tus propios roles desde esta interfaz.");
      return;
    }

    const loggedInUserIsSuperAdmin =
      loggedInUser.roles.includes("ROLE_SUPERADMIN");
    const loggedInUserIsAdminOnly =
      loggedInUser.roles.includes("ROLE_ADMIN") && !loggedInUserIsSuperAdmin;

    const targetUserIsAdmin = userToManage.roles.includes("ROLE_ADMIN");
    const targetUserIsSuperAdmin =
      userToManage.roles.includes("ROLE_SUPERADMIN");

    if (
      loggedInUserIsAdminOnly &&
      (targetUserIsAdmin || targetUserIsSuperAdmin)
    ) {
      alert(
        "Un Admin no puede gestionar los roles de otros Admins o SuperAdmins."
      );
      return;
    }

    setSelectedUser(userToManage);
    setIsRolesModalOpen(true);
  };

  const handleUserRolesUpdated = (updatedUser: UserResponseDto) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
  };

  const handleToggleUserStatus = async (userToUpdate: UserResponseDto) => {
    if (!loggedInUser || userToUpdate.id === loggedInUser.userId) {
      alert(
        "No puedes cambiar tu propio estado desde esta interfaz o no estás logueado."
      );
      return;
    }

    const loggedInUserIsSuperAdmin =
      loggedInUser.roles.includes("ROLE_SUPERADMIN");
    const loggedInUserIsAdminOnly =
      loggedInUser.roles.includes("ROLE_ADMIN") && !loggedInUserIsSuperAdmin;

    const targetUserIsAdmin = userToUpdate.roles.includes("ROLE_ADMIN");
    const targetUserIsSuperAdmin =
      userToUpdate.roles.includes("ROLE_SUPERADMIN");

    if (
      loggedInUserIsAdminOnly &&
      (targetUserIsAdmin || targetUserIsSuperAdmin)
    ) {
      alert(
        "Un Admin no puede cambiar el estado de otros Admins o SuperAdmins."
      );
      return;
    }

    const newStatus = !userToUpdate.enabled;
    const action = newStatus ? "habilitar" : "deshabilitar";
    if (
      window.confirm(
        `¿Estás seguro de que quieres ${action} a ${userToUpdate.username}?`
      )
    ) {
      setIsLoading(true);
      try {
        const response = await updateUserStatus(userToUpdate.id, {
          enabled: newStatus,
        });
        if (response.data && response.code === 200) {
          handleUserRolesUpdated(response.data);
          setError(null);
          alert(
            `Usuario ${userToUpdate.username} ${
              action === "habilitar" ? "habilitado" : "deshabilitado"
            } correctamente.`
          );
        } else {
          const errorMessage =
            response.message || "Error al actualizar estado del usuario.";
          setError(errorMessage);
          alert(errorMessage);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          const errorMessage =
            err.message || "Error al actualizar estado del usuario.";
          setError(errorMessage);
          alert(errorMessage);
        } else {
          setError("Ocurrió un error desconocido al actualizar el estado.");
          alert("Ocurrió un error desconocido al actualizar el estado.");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteUser = async (userIdToDelete: string, username: string) => {
    if (!loggedInUser || userIdToDelete === loggedInUser.userId) {
      alert(
        "No puedes eliminarte a ti mismo desde esta interfaz o no estás logueado."
      );
      return;
    }

    const loggedInUserIsSuperAdmin =
      loggedInUser.roles.includes("ROLE_SUPERADMIN");
    if (!loggedInUserIsSuperAdmin) {
      alert("Solo los SuperAdmins pueden eliminar usuarios.");
      return;
    }

    const userToDeleteObject = users.find((u) => u.id === userIdToDelete);
    if (!userToDeleteObject) {
      setError("Usuario no encontrado para eliminar.");
      alert("Usuario no encontrado para eliminar.");
      return;
    }
    if (userToDeleteObject.roles.includes("ROLE_SUPERADMIN")) {
      alert("Un SuperAdmin no puede eliminar a otro SuperAdmin.");
      return;
    }

    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar PERMANENTEMENTE a ${username}? Esta acción no se puede deshacer.`
      )
    ) {
      setIsLoading(true);
      try {
        const response = await deleteUserService(userIdToDelete);
        if (response && response.code === 200) {
          setUsers((prevUsers) =>
            prevUsers.filter((u) => u.id !== userIdToDelete)
          );
          setError(null);
          alert(`Usuario ${username} eliminado permanentemente.`);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          const errorMessage = err.message || "Error al eliminar el usuario.";
          setError(errorMessage);
          alert(errorMessage);
        } else {
          setError("Ocurrió un error desconocido al eliminar el usuario.");
          alert("Ocurrió un error desconocido al eliminar el usuario.");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm) {
      return users;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(lowercasedFilter) ||
        user.email.toLowerCase().includes(lowercasedFilter)
    );
  }, [users, searchTerm]);

  if (!loggedInUser) {
    return (
      <p className="loading-message">
        Cargando información de autenticación...
      </p>
    );
  }

  const canViewPage =
    loggedInUser.roles.includes("ROLE_ADMIN") ||
    loggedInUser.roles.includes("ROLE_SUPERADMIN");

  if (!canViewPage) {
    return (
      <div className="page-container admins-page">
        <p className="error-message">
          Acceso denegado. No tienes permisos para ver esta página.
        </p>
      </div>
    );
  }

  if (isLoading && users.length === 0)
    return <p className="loading-message">Cargando usuarios...</p>;

  return (
    <div className="page-container admins-page">
      <div className="page-header">
        <h1>Gestión de Usuarios y Roles</h1>
      </div>

      {error && <p className="error-message">Error: {error}</p>}
      {isLoading && users.length > 0 && (
        <p className="loading-inline-message">Actualizando datos...</p>
      )}

      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {users.length === 0 && !isLoading && !error && (
        <p className="info-message">No hay usuarios para mostrar.</p>
      )}

      {filteredUsers.length === 0 &&
        users.length > 0 &&
        !isLoading &&
        !error && (
          <p className="info-message">
            Ningún usuario coincide con tu búsqueda "{searchTerm}".
          </p>
        )}

      {filteredUsers.length > 0 && (
        <div className="table-responsive-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Roles Actuales</th>
                <th>Estado</th>
                <th className="text-center">Seguidores</th>
                <th className="text-center">Siguiendo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isSelf = user.id === loggedInUser.userId;
                const loggedInUserIsSuperAdmin =
                  loggedInUser.roles.includes("ROLE_SUPERADMIN");
                const loggedInUserIsAdminOnly =
                  loggedInUser.roles.includes("ROLE_ADMIN") &&
                  !loggedInUserIsSuperAdmin;

                const targetUserIsAdmin = user.roles.includes("ROLE_ADMIN");
                const targetUserIsSuperAdmin =
                  user.roles.includes("ROLE_SUPERADMIN");

                let showGeneralActions = false;
                if (!isSelf) {
                  if (loggedInUserIsSuperAdmin) {
                    showGeneralActions = true;
                  } else if (
                    loggedInUserIsAdminOnly &&
                    !targetUserIsAdmin &&
                    !targetUserIsSuperAdmin
                  ) {
                    showGeneralActions = true;
                  }
                }

                return (
                  <tr key={user.id}>
                    <td data-label="Username">{user.username}</td>
                    <td data-label="Email">{user.email}</td>
                    <td data-label="Roles Actuales">
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
                      {user.followersCount}
                    </td>
                    <td data-label="Siguiendo" className="text-center">
                      {user.followingCount}
                    </td>
                    <td data-label="Acciones" className="actions-cell">
                      {showGeneralActions && (
                        <>
                          <button
                            onClick={() => handleOpenRolesModal(user)}
                            className="btn btn-primary btn-small"
                            title="Gestionar Roles del Usuario"
                          >
                            <span className="icon-roles">📜</span> Gestionar
                            Roles
                          </button>

                          <button
                            onClick={() => handleToggleUserStatus(user)}
                            className={`btn btn-small ${
                              user.enabled ? "btn-warning" : "btn-success"
                            }`}
                            title={
                              user.enabled
                                ? "Deshabilitar Usuario"
                                : "Habilitar Usuario"
                            }
                          >
                            {user.enabled ? (
                              <>
                                <span className="icon-disable">🚫</span>{" "}
                                Deshabilitar
                              </>
                            ) : (
                              <>
                                <span className="icon-enable">✔</span> Habilitar
                              </>
                            )}
                          </button>

                          {loggedInUserIsSuperAdmin &&
                            !targetUserIsSuperAdmin && (
                              <button
                                onClick={() =>
                                  handleDeleteUser(user.id, user.username)
                                }
                                className="btn btn-danger btn-small"
                                title="Eliminar Usuario Permanentemente"
                              >
                                <span className="icon-delete">🗑</span> Eliminar
                              </button>
                            )}
                          {loggedInUserIsSuperAdmin &&
                            targetUserIsSuperAdmin && (
                              <button
                                className="btn btn-danger btn-small"
                                title="No se puede eliminar a otro SuperAdmin"
                                disabled
                              >
                                <span className="icon-delete">🗑</span> Eliminar
                              </button>
                            )}
                        </>
                      )}
                      {!showGeneralActions && !isSelf && (
                        <span className="no-actions-text">
                          {targetUserIsSuperAdmin || targetUserIsAdmin
                            ? "NO PUEDES EDITAR"
                            : "ERROR LÓGICA"}
                        </span>
                      )}
                      {isSelf && (
                        <span className="no-actions-text">TU MISMO</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedUser && isRolesModalOpen && (
        <ManageUserRolesModal
          isOpen={isRolesModalOpen}
          onClose={() => {
            setIsRolesModalOpen(false);
            setSelectedUser(null);
            setError(null);
          }}
          user={selectedUser}
          onUserRolesUpdated={handleUserRolesUpdated}
        />
      )}
    </div>
  );
};

export default AdminsPage;
