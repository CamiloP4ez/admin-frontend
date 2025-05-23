import React, { useEffect, useState, useCallback } from "react";
import Modal from "../common/Modal";
import { getFollowers, getFollowing } from "../../services/userService";
import type { UserResponseDto } from "../../types/user";

type ConnectionType = "followers" | "following";

interface ViewUserConnectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserResponseDto | null;
  type: ConnectionType;
}

const ViewUserConnectionsModal: React.FC<ViewUserConnectionsModalProps> = ({
  isOpen,
  onClose,
  user,
  type,
}) => {
  const [connections, setConnections] = useState<UserResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const response =
        type === "followers"
          ? await getFollowers(user.id)
          : await getFollowing(user.id);

      if (response.data && response.code === 200) {
        setConnections(response.data);
      } else {
        setError(response.message || `Error al cargar ${type}.`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || `Ocurrió un error.`);
      } else {
        setError(`Ocurrió un error desconocido.`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, type]);

  useEffect(() => {
    if (isOpen && user) {
      fetchConnections();
    }
  }, [isOpen, user, fetchConnections]);

  if (!user) return null;

  const title =
    type === "followers"
      ? `Seguidores de ${user.username} (${user.followersCount})`
      : `${user.username} sigue a (${user.followingCount})`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {isLoading && <p>Cargando...</p>}
      {error && <p className="error-message">{error}</p>}
      {!isLoading && !error && connections.length === 0 && (
        <p>
          {type === "followers"
            ? "Nadie sigue a este usuario."
            : "Este usuario no sigue a nadie."}
        </p>
      )}
      {!isLoading && !error && connections.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            maxHeight: "50vh",
            overflowY: "auto",
          }}
        >
          {connections.map((connUser) => (
            <li
              key={connUser.id}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              {connUser.profilePictureUri && (
                <img
                  src={connUser.profilePictureUri}
                  alt={connUser.username}
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    marginRight: "10px",
                  }}
                />
              )}

              <span>{connUser.username}</span>
              <small
                style={{
                  marginLeft: "auto",
                  color: "var(--color-text-secondary)",
                }}
              >
                {connUser.enabled ? "Activo" : "Inactivo"}
              </small>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
};

export default ViewUserConnectionsModal;
