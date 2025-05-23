import React, { useState, useEffect } from "react";
import type { FormEvent } from "react";
import Modal from "../common/Modal";
import { updatePost } from "../../services/postService";
import type { PostRequestDto, PostResponseDto } from "../../types/post";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: PostResponseDto | null;
  onPostUpdated: (updatedPost: PostResponseDto) => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({
  isOpen,
  onClose,
  post,
  onPostUpdated,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState<string | null>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setImageUri(post.imageUri || "");
      setError(null);
    }
  }, [post]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!post) return;

    setIsLoading(true);
    setError(null);

    const postData: PostRequestDto = {
      title: title.trim(),
      content: content.trim(),

      imageUri: imageUri && imageUri.trim() !== "" ? imageUri.trim() : null,
    };

    try {
      const response = await updatePost(post.id, postData);
      if (response.data && response.code === 200) {
        onPostUpdated(response.data);
        onClose();
      } else {
        setError(response.message || "Error al actualizar la publicación.");
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

  if (!post) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar Publicación: ${post.title}`}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="postTitle">Título</label>
          <input
            type="text"
            id="postTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="postContent">Contenido</label>
          <textarea
            id="postContent"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="postImageUri">URL de la Imagen (opcional)</label>
          <input
            type="text"
            id="postImageUri"
            value={imageUri || ""}
            onChange={(e) => setImageUri(e.target.value)}
            placeholder="http://ejemplo.com/imagen.jpg"
            disabled={isLoading}
          />
          {imageUri && (
            <img
              src={imageUri}
              alt="Vista previa"
              style={{
                maxWidth: "100px",
                maxHeight: "100px",
                marginTop: "10px",
                display: "block",
              }}
            />
          )}
        </div>

        {error && (
          <p
            className="error-message"
            style={{ color: "var(--color-danger)", marginBottom: "10px" }}
          >
            {error}
          </p>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={onClose}
            className="cancel-button"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditPostModal;
