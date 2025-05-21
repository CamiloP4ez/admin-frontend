// src/components/posts/ViewPostLikesModal.tsx
import React, { useEffect, useState, useCallback } from "react";
import Modal from "../common/Modal";

import { getLikesForPost } from "../../services/postService";
import { getAllUsers } from "../../services/userService"; // Para mapear userId a username
import type { PostResponseDto } from "../../types/post";
import type { LikeResponseDto } from "../../types/like";

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
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Ocurrió un error.");
      } else {
        setError("Ocurrió un error desconocido.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [post]);

  useEffect(() => {
    if (isOpen && post) {
      fetchLikesAndUsers();
    }
  }, [isOpen, post, fetchLikesAndUsers]);

  if (!post) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Likes en: "${post.title}" (${post.likeCount})`}
    >
      {isLoading && <p>Cargando likes...</p>}
      {error && <p className="error-message">{error}</p>}
      {!isLoading && !error && likes.length === 0 && (
        <p>Nadie ha dado like a esta publicación aún.</p>
      )}

      {!isLoading && !error && likes.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {likes.map((like) => (
            <li
              key={like.id}
              style={{ padding: "5px 0", borderBottom: "1px solid #eee" }}
            >
              {like.username ||
                usersMap.get(like.userId) ||
                `Usuario ID: ${like.userId}`}
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
};

export default ViewPostLikesModal;
