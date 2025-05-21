import React, { useEffect, useState, useCallback } from "react";
import {
  getAllPosts,
  deletePost as deletePostService,
} from "../services/postService";
import EditPostModal from "../components/posts/EditPostModal";
import type { PostResponseDto } from "../types/post";
import ViewPostCommentsModal from "../components/posts/ViewPostCommentsModal";
import ViewPostLikesModal from "../components/posts/ViewPostLikesModal";

const PostsPage: React.FC = () => {
  const [posts, setPosts] = useState<PostResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostResponseDto | null>(
    null
  );

  const handleOpenCommentsModal = (post: PostResponseDto) => {
    setSelectedPost(post);
    setIsCommentsModalOpen(true);
  };
  const handleOpenLikesModal = (post: PostResponseDto) => {
    setSelectedPost(post);
    setIsLikesModalOpen(true);
  };

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllPosts();
      if (response.data && response.code === 200) {
        setPosts(response.data);
      } else {
        setError(response.message || "Error al cargar las publicaciones.");
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
    fetchPosts();
  }, [fetchPosts]);

  const handleOpenEditModal = (post: PostResponseDto) => {
    setSelectedPost(post);
    setIsEditModalOpen(true);
  };

  const handlePostUpdated = (updatedPost: PostResponseDto) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
  };

  const handleDeletePost = async (postIdToDelete: string) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar esta publicación?")
    ) {
      try {
        await deletePostService(postIdToDelete);
        setPosts((prevPosts) =>
          prevPosts.filter((p) => p.id !== postIdToDelete)
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

  if (isLoading && posts.length === 0) return <p>Cargando publicaciones...</p>;
  if (error)
    return (
      <p className="error-message" style={{ color: "var(--color-danger)" }}>
        {error}
      </p>
    );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestión de Publicaciones</h1>
      </div>

      {posts.length === 0 && !isLoading && (
        <p>No hay publicaciones para mostrar.</p>
      )}

      <div className="posts-list">
        {" "}
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            {post.imageUri && <img src={post.imageUri} alt={post.title} />}
            <h3>{post.title}</h3>
            <p className="post-content-summary">{post.content}</p>{" "}
            <div className="post-meta">
              <span>
                Publicado: {new Date(post.createdAt).toLocaleDateString()}
              </span>
              <span>Por: {post.username || "Desconocido"}</span>{" "}
              <span>Likes: {post.likeCount}</span>
            </div>
            <div className="post-actions">
              <button
                onClick={() => handleOpenEditModal(post)}
                className="edit-btn"
              >
                Editar
              </button>
              <button
                onClick={() => handleOpenCommentsModal(post)}
                className="view-btn"
                style={{
                  backgroundColor: "var(--color-primary-light, #7b6fbe)",
                  color: "white",
                }}
              >
                Comentarios
              </button>
              <button
                onClick={() => handleOpenLikesModal(post)}
                className="info-btn"
                title="Ver quién dio like"
                disabled={post.likeCount === 0}
              >
                ❤️
              </button>
              <button
                onClick={() => handleDeletePost(post.id)}
                className="delete-btn"
              >
                Borrar
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedPost && (
        <EditPostModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          post={selectedPost}
          onPostUpdated={handlePostUpdated}
        />
      )}
      {selectedPost && (
        <ViewPostCommentsModal
          isOpen={isCommentsModalOpen}
          onClose={() => {
            setIsCommentsModalOpen(false);
            setSelectedPost(null);
          }}
          post={selectedPost}
        />
      )}
      {selectedPost && (
        <ViewPostLikesModal
          isOpen={isLikesModalOpen}
          onClose={() => {
            setIsLikesModalOpen(false);
            setSelectedPost(null);
          }}
          post={selectedPost}
        />
      )}
    </div>
  );
};

export default PostsPage;
