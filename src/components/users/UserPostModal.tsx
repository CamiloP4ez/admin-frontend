import React, { useEffect, useState } from "react";
import Modal from "../common/Modal";
import { getPostsByUserId } from "../../services/postService";
import "./UserPostModal.css";
import type { PostResponseDto } from "../../types/post";

interface UserPostsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  username: string;
}

const UserPostsModal: React.FC<UserPostsModalProps> = ({
  isOpen,
  onClose,
  userId,
  username,
}) => {
  const [posts, setPosts] = useState<PostResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      const fetchUserPosts = async () => {
        setIsLoading(true);
        setError(null);
        setPosts([]);
        try {
          const response = await getPostsByUserId(userId);
          if (response.data && response.code === 200) {
            setPosts(response.data);
          } else {
            setError(
              response.message ||
                "Error al cargar las publicaciones del usuario."
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
      fetchUserPosts();
    }
  }, [isOpen, userId]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Publicaciones de ${username}`}
    >
      {isLoading && <p>Cargando publicaciones...</p>}
      {error && (
        <p className="error-message" style={{ color: "var(--color-danger)" }}>
          {error}
        </p>
      )}
      {!isLoading && !error && posts.length === 0 && (
        <p>Este usuario no tiene publicaciones.</p>
      )}
      {!isLoading && !error && posts.length > 0 && (
        <div className="user-posts-list">
          {posts.map((post) => (
            <div key={post.id} className="user-post-item">
              {post.imageUri && (
                <img
                  src={post.imageUri}
                  alt={post.title}
                  className="user-post-image"
                />
              )}
              <div className="user-post-content">
                <h4>{post.title}</h4>
                <p>{post.content}</p>
                <small>
                  Publicado el: {new Date(post.createdAt).toLocaleDateString()}
                </small>
                <small> Likes: {post.likeCount}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default UserPostsModal;
