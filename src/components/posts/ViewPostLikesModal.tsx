import React, { useEffect, useState, useCallback } from "react";
import Modal from "../common/Modal";

import { getLikesForPost } from "../../services/postService";
import { getAllUsers } from "../../services/userService";
import type { PostResponseDto } from "../../types/post";
import type { LikeResponseDto } from "../../types/like";
import "./ViewPostLikesModal.css";

interface ViewPostLikesModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: PostResponseDto | null;
}

const ViewPostLikesModal: React.FC<ViewPostLikesModalProps> = ({
  isOpen,
  onClose,
  post,
}) => {
  const [likes, setLikes] = useState<LikeResponseDto[]>([]);
  const [usersMap, setUsersMap] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLikesAndUsers = useCallback(async () => {
    if (!post) return;
    setIsLoading(true);
    setError(null);
    try {
      const [likesResponse, usersResponse] = await Promise.all([
        getLikesForPost(post.id),
        getAllUsers(),
      ]);

      if (likesResponse.data && likesResponse.code === 200) {
        setLikes(likesResponse.data);
      } else {
        setError(likesResponse.message || "Error al cargar likes.");
      }

      if (usersResponse.data && usersResponse.code === 200) {
        const uMap = new Map<string, string>();
        usersResponse.data.forEach((u) => uMap.set(u.id, u.username));
        setUsersMap(uMap);
      } else {
        console.warn(
          usersResponse.message ||
            "No se pudo cargar el mapa de usuarios para los likes."
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const errorMessage = err.message || "Error al eliminar el comentario.";
        setError(errorMessage);
        alert(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [post]);

  useEffect(() => {
    if (isOpen && post) {
      setLikes([]);
      setError(null);
      fetchLikesAndUsers();
    }
  }, [isOpen, post, fetchLikesAndUsers]);

  if (!post) return null;

  const modalTitle = `Me gusta en: "${post.title}" ${
    !isLoading && !error && likes.length > 0
      ? `(${likes.length})`
      : post.likeCount > 0 && (isLoading || error)
      ? `(${post.likeCount})`
      : ""
  }`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <div className="view-likes-modal-content">
        {isLoading && (
          <p className="loading-message">
            Cargando personas a las que les gusta...
          </p>
        )}
        {error && <p className="error-message">{error}</p>}

        {!isLoading && !error && likes.length === 0 && (
          <p className="info-message">
            Nadie ha dado me gusta a esta publicación aún.
          </p>
        )}

        {!isLoading && !error && likes.length > 0 && (
          <ul className="likes-list">
            {likes.map((like) => {
              const username = like.username || usersMap.get(like.userId);
              return (
                <li key={like.id || like.userId} className="likes-list-item">
                  {/* Opcional: Placeholder para avatar */}
                  {/* {username && (
                    <span className="user-avatar-placeholder">
                      {username.substring(0, 1)}
                    </span>
                  )} */}
                  {username ? (
                    <span className="username">{username}</span>
                  ) : (
                    <span className="user-id-fallback">
                      Usuario ID: {like.userId}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
};

export default ViewPostLikesModal;
