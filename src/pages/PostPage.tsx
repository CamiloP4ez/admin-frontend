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

  // New state for filtering
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
        // setFilteredPosts(response.data); // Initialize filteredPosts here or in useEffect
      } else {
        setError(response.message || "Error al cargar las publicaciones.");
      }
    } catch (err: unknown) {
      console.error("Error fetching posts:", err); // Updated console log
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error al cargar las publicaciones."); // More specific error
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Effect for fetching author data
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
  }, [posts, authorsData]); // authorsData dependency prevents infinite loop if an error occurs and we retry

  // Effect for filtering posts
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
    // Update both original posts and filtered posts
    const newPosts = posts.map((p) =>
      p.id === updatedPost.id ? updatedPost : p
    );
    setPosts(newPosts);
    // The filtering useEffect will automatically update filteredPosts
  };

  const handleDeletePost = async (postIdToDelete: string) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar esta publicación?")
    ) {
      setIsLoading(true); // Set loading true during deletion
      try {
        await deletePostService(postIdToDelete);
        const newPosts = posts.filter((p) => p.id !== postIdToDelete);
        setPosts(newPosts);
        // The filtering useEffect will automatically update filteredPosts
      } catch (err: unknown) {
        console.error("Error deleting post:", err); // Updated console log
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Ocurrió un error al eliminar la publicación."); // More specific error
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading && posts.length === 0) return <p>Cargando publicaciones...</p>;
  if (error && posts.length === 0)
    // Only show full page error if no posts are loaded
    return (
      <p className="error-message" style={{ color: "var(--color-danger)" }}>
        {error}
      </p>
    );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestión de Publicaciones</h1>
        {/* <button className="add-button">Crear Publicación</button> */}
      </div>
      <div
        className="filter-container"
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <input
          type="text"
          placeholder="Filtrar por título, contenido o autor..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          style={{
            padding: "10px",
            width: "50%",
            minWidth: "250px",
            borderRadius: "var(--border-radius-md)",
            border: "1px solid var(--color-grey-light)",
          }}
        />
      </div>
      {isLoading && posts.length > 0 && <p>Actualizando publicaciones...</p>}{" "}
      {/* Show if loading more/updating */}
      {error && posts.length > 0 && (
        <p className="error-message" style={{ color: "var(--color-warning)" }}>
          Error: {error}
        </p>
      )}{" "}
      {/* Show non-blocking error */}
      {!isLoading && posts.length === 0 && !error && (
        <p>No hay publicaciones para mostrar.</p>
      )}
      {!isLoading &&
        posts.length > 0 &&
        filteredPosts.length === 0 &&
        filterQuery && (
          <p>
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
              {post.imageUri && <img src={post.imageUri} alt={post.title} />}
              <h3>{post.title}</h3>
              <p className="post-content-summary">{post.content}</p>
              <div className="post-meta">
                <span>
                  Publicado: {new Date(post.createdAt).toLocaleDateString()}
                </span>
                <span>Por: {authorDisplay}</span>
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
          );
        })}
      </div>
      {selectedPost && (
        <EditPostModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedPost(null); // Clear selected post on close
          }}
          post={selectedPost}
          onPostUpdated={handlePostUpdated}
        />
      )}
      {selectedPost && typeof ViewPostCommentsModal !== "undefined" && (
        <ViewPostCommentsModal
          isOpen={isCommentsModalOpen}
          onClose={() => {
            setIsCommentsModalOpen(false);
            setSelectedPost(null); // Clear selected post on close
          }}
          post={selectedPost}
        />
      )}
      {selectedPost && typeof ViewPostLikesModal !== "undefined" && (
        <ViewPostLikesModal
          isOpen={isLikesModalOpen}
          onClose={() => {
            setIsLikesModalOpen(false);
            setSelectedPost(null); // Clear selected post on close
          }}
          post={selectedPost}
        />
      )}
    </div>
  );
};
export default PostsPage;
