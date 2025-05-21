// src/components/posts/ViewPostCommentsModal.tsx
import React, { useEffect, useState, useCallback } from "react";
import Modal from "../common/Modal";
import {
  getCommentsByPostId,
  deleteComment as deleteCommentService,
} from "../../services/commentService";
import "./ViewPostCommentsModal.css"; // Crear este CSS
import type { PostResponseDto } from "../../types/post";
import type { CommentResponseDto } from "../../types/comment";

interface ViewPostCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: PostResponseDto | null;
}

const ViewPostCommentsModal: React.FC<ViewPostCommentsModalProps> = ({
  isOpen,
  onClose,
  post,
}) => {
  const [comments, setComments] = useState<CommentResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!post) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getCommentsByPostId(post.id);
      if (response.data && response.code === 200) {
        setComments(response.data);
      } else {
        setError(response.message || "Error al cargar comentarios.");
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
      fetchComments();
    }
  }, [isOpen, post, fetchComments]);

  const handleDeleteComment = async (commentId: string) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este comentario?")
    ) {
      try {
        await deleteCommentService(commentId);
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        // Opcional: mostrar un mensaje de éxito
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || "Ocurrió un error.");
        } else {
          setError("Ocurrió un error desconocido.");
        }
      }
    }
  };

  if (!post) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Comentarios en: "${post.title}"`}
    >
      {isLoading && <p>Cargando comentarios...</p>}
      {error && <p className="error-message">{error}</p>}
      {!isLoading && !error && comments.length === 0 && (
        <p>No hay comentarios en esta publicación.</p>
      )}

      {!isLoading && !error && comments.length > 0 && (
        <ul className="comments-list">
          {comments.map((comment) => (
            <li key={comment.id} className="comment-item">
              <div className="comment-header">
                <strong>{comment.authorUsername}</strong>
                <span className="comment-date">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="comment-content">{comment.content}</p>
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="delete-comment-btn"
              >
                Borrar Comentario
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
};

export default ViewPostCommentsModal;
