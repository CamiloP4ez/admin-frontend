import React, { useEffect, useState, useCallback } from "react";
import {
  getAllPosts,
  deletePost as deletePostService,
} from "../services/postService";
import EditPostModal from "../components/posts/EditPostModal";
import type { PostResponseDto } from "../types/post";
import ViewPostCommentsModal from "../components/posts/ViewPostCommentsModal";
import ViewPostLikesModal from "../components/posts/ViewPostLikesModal";
import { getUserById } from "../services/userService";
import "./PostPage.css";

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

  const [authorsData, setAuthorsData] = useState<
    Record<
      string,
      { username: string | null; isLoading: boolean; error: boolean }
    >
  >({});

  const [filterQuery, setFilterQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<PostResponseDto[]>([]);

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
      console.error("Error fetching posts:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error al cargar las publicaciones.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    posts.forEach((post) => {
      if (
        post.userId &&
        !authorsData[post.userId]?.username &&
        !authorsData[post.userId]?.isLoading
      ) {
        setAuthorsData((prev) => ({
          ...prev,
          [post.userId]: { username: null, isLoading: true, error: false },
        }));

        getUserById(post.userId)
          .then((response) => {
            if (response.data && response.code === 200) {
              setAuthorsData((prev) => ({
                ...prev,
                [post.userId]: {
                  username: response.data.username,
                  isLoading: false,
                  error: false,
                },
              }));
            } else {
              setAuthorsData((prev) => ({
                ...prev,
                [post.userId]: {
                  username: "Usuario no encontrado",
                  isLoading: false,
                  error: true,
                },
              }));
            }
          })
          .catch((err) => {
            console.error(
              `Error fetching username for userId ${post.userId}:`,
              err
            );
            setAuthorsData((prev) => ({
              ...prev,
              [post.userId]: {
                username: "Error al cargar",
                isLoading: false,
                error: true,
              },
            }));
          });
      }
    });
  }, [posts, authorsData]);

  useEffect(() => {
    if (!filterQuery) {
      setFilteredPosts(posts);
      return;
    }

    const lowerCaseQuery = filterQuery.toLowerCase();
    const newFilteredPosts = posts.filter((post) => {
      const authorUsername =
        authorsData[post.userId]?.username?.toLowerCase() || "";
      return (
        post.title.toLowerCase().includes(lowerCaseQuery) ||
        post.content.toLowerCase().includes(lowerCaseQuery) ||
        (authorUsername && authorUsername.includes(lowerCaseQuery))
      );
    });
    setFilteredPosts(newFilteredPosts);
  }, [filterQuery, posts, authorsData]);

  const handleOpenEditModal = (post: PostResponseDto) => {
    setSelectedPost(post);
    setIsEditModalOpen(true);
  };

  const handlePostUpdated = (updatedPost: PostResponseDto) => {
    const newPosts = posts.map((p) =>
      p.id === updatedPost.id ? updatedPost : p
    );
    setPosts(newPosts);
  };

  const handleDeletePost = async (postIdToDelete: string) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar esta publicación?")
    ) {
      setIsLoading(true);
      try {
        await deletePostService(postIdToDelete);
        const newPosts = posts.filter((p) => p.id !== postIdToDelete);
        setPosts(newPosts);
      } catch (err: unknown) {
        if (err instanceof Error) {
          const errorMessage =
            err.message || "Error al eliminar el comentario.";
          setError(errorMessage);
          alert(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const closeModalAndClearSelection = () => {
    setIsEditModalOpen(false);
    setIsCommentsModalOpen(false);
    setIsLikesModalOpen(false);
    setSelectedPost(null);
  };

  if (isLoading && posts.length === 0)
    return <p className="loading-message">Cargando publicaciones...</p>;

  return (
    <div className="page-container posts-page">
      <div className="page-header">
        <h1>Gestión de Publicaciones</h1>
        {/* <button className="btn btn-primary">Crear Publicación</button> */}
      </div>

      <div className="filter-container">
        <input
          type="text"
          placeholder="Filtrar por título, contenido o autor..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className="filter-input"
        />
      </div>

      {error && <p className="error-message">Error: {error}</p>}

      {isLoading && posts.length > 0 && (
        <p className="loading-inline-message">Actualizando publicaciones...</p>
      )}

      {!isLoading && posts.length === 0 && !error && (
        <p className="info-message">No hay publicaciones para mostrar.</p>
      )}
      {!isLoading &&
        posts.length > 0 &&
        filteredPosts.length === 0 &&
        filterQuery && (
          <p className="info-message">
            No se encontraron publicaciones que coincidan con "{filterQuery}".
          </p>
        )}

      <div className="posts-list">
        {filteredPosts.map((post) => {
          const authorInfo = authorsData[post.userId];
          let authorDisplay: React.ReactNode;

          if (authorInfo?.isLoading) {
            authorDisplay = (
              <span className="author-loading-text">Cargando autor...</span>
            );
          } else if (authorInfo?.error || !authorInfo?.username) {
            authorDisplay = (
              <span className="author-error-text">
                {authorInfo?.username || "Autor desconocido"}
              </span>
            );
          } else {
            authorDisplay = <span>{authorInfo.username}</span>;
          }

          return (
            <div key={post.id} className="post-card">
              {post.imageUri && (
                <div className="post-card-image-container">
                  <img
                    src={post.imageUri}
                    alt={post.title}
                    className="post-card-image"
                  />
                </div>
              )}
              <div className="post-card-content">
                <h3 className="post-card-title">{post.title}</h3>
                <p className="post-content-summary">{post.content}</p>
                <div className="post-meta">
                  <span>
                    Publicado: {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                  <span className="post-author">Por: {authorDisplay}</span>
                  <span>Likes: {post.likeCount}</span>
                </div>
                <div className="post-actions">
                  <button
                    onClick={() => handleOpenEditModal(post)}
                    className="btn btn-primary btn-small"
                    title="Editar publicación"
                  >
                    <span className="icon-edit">✎</span> Editar
                  </button>
                  <button
                    onClick={() => handleOpenCommentsModal(post)}
                    className="btn btn-secondary btn-small"
                    title="Ver comentarios"
                  >
                    <span className="icon-comment">💬</span> Comentarios
                  </button>
                  <button
                    onClick={() => handleOpenLikesModal(post)}
                    className="btn btn-secondary btn-small btn-icon"
                    title="Ver Me Gusta"
                    disabled={post.likeCount === 0}
                  >
                    ❤️ <span className="sr-only">Me gusta</span>
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="btn btn-danger btn-small"
                    title="Borrar publicación"
                  >
                    <span className="icon-delete">🗑</span> Borrar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedPost && (
        <EditPostModal
          isOpen={isEditModalOpen}
          onClose={closeModalAndClearSelection}
          post={selectedPost}
          onPostUpdated={handlePostUpdated}
        />
      )}
      {selectedPost && typeof ViewPostCommentsModal !== "undefined" && (
        <ViewPostCommentsModal
          isOpen={isCommentsModalOpen}
          onClose={closeModalAndClearSelection}
          post={selectedPost}
        />
      )}
      {selectedPost && typeof ViewPostLikesModal !== "undefined" && (
        <ViewPostLikesModal
          isOpen={isLikesModalOpen}
          onClose={closeModalAndClearSelection}
          post={selectedPost}
        />
      )}
    </div>
  );
};
export default PostsPage;
