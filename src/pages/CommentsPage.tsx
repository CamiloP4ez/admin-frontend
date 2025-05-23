import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  getAllComments,
  deleteComment as deleteCommentService,
} from "../services/commentService";
import type { CommentResponseDto } from "../types/comment";
import "./CommentsPage.css";

const CommentsPage: React.FC = () => {
  const [allComments, setAllComments] = useState<CommentResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filterAuthor, setFilterAuthor] = useState("");
  const [filterContent, setFilterContent] = useState("");

  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);

  const [selectedCommentIds, setSelectedCommentIds] = useState<Set<string>>(
    new Set()
  );

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllComments();
      if (response.data && response.code === 200) {
        setAllComments(response.data);
      } else {
        setError(response.message || "Error al cargar comentarios.");
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
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleDeleteComment = async (
    commentId: string,
    commentContent: string
  ) => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar el comentario: "${commentContent.substring(
          0,
          50
        )}..."?`
      )
    ) {
      try {
        await deleteCommentService(commentId);
        setAllComments((prev) => prev.filter((c) => c.id !== commentId));
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || `Ocurrió un error.`);
        } else {
          setError(`Ocurrió un error desconocido.`);
        }
      }
    }
  };

  const filteredComments = useMemo(() => {
    return allComments.filter((comment) => {
      const authorMatch = filterAuthor
        ? comment.authorUsername
            .toLowerCase()
            .includes(filterAuthor.toLowerCase())
        : true;
      const contentMatch = filterContent
        ? comment.content.toLowerCase().includes(filterContent.toLowerCase())
        : true;

      return authorMatch && contentMatch;
    });
  }, [allComments, filterAuthor, filterContent]);

  const handleSelectComment = (commentId: string) => {
    setSelectedCommentIds((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(commentId)) {
        newSelected.delete(commentId);
      } else {
        newSelected.add(commentId);
      }
      return newSelected;
    });
  };

  const handleSelectAllVisibleComments = () => {
    const visibleCommentIds = filteredComments.map((c) => c.id);
    const allVisibleSelected = visibleCommentIds.every((id) =>
      selectedCommentIds.has(id)
    );

    if (allVisibleSelected && visibleCommentIds.length > 0) {
      setSelectedCommentIds((prevSelected) => {
        const newSelected = new Set(prevSelected);
        visibleCommentIds.forEach((id) => newSelected.delete(id));
        return newSelected;
      });
    } else {
      setSelectedCommentIds((prevSelected) => {
        const newSelected = new Set(prevSelected);
        visibleCommentIds.forEach((id) => newSelected.add(id));
        return newSelected;
      });
    }
  };

  const handleDeleteSelectedComments = async () => {
    if (selectedCommentIds.size === 0) {
      alert("No hay comentarios seleccionados para borrar.");
      return;
    }

    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar ${selectedCommentIds.size} comentario(s) seleccionado(s)?`
      )
    ) {
      setIsDeletingMultiple(true);
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const commentId of selectedCommentIds) {
        try {
          await deleteCommentService(commentId);
          successCount++;
        } catch (err: unknown) {
          if (err instanceof Error) {
            errors.push(`Error al borrar ${commentId}: ${err.message}`);
            errorCount++;
            console.error(`Error deleting comment ${commentId}:`, err);
          }
        }
      }

      setIsDeletingMultiple(false);

      if (errorCount > 0) {
        alert(
          `Se eliminaron ${successCount} comentarios.\n${errorCount} comentarios no pudieron ser eliminados.\nErrores:\n${errors
            .slice(0, 5)
            .join("\n")}${errors.length > 5 ? "\n..." : ""}`
        );
      } else {
        alert(`${successCount} comentario(s) eliminado(s) exitosamente.`);
      }

      // Actualizar la lista de comentarios y limpiar selección
      setAllComments((prev) =>
        prev.filter((c) => !selectedCommentIds.has(c.id))
      );
      setSelectedCommentIds(new Set());
    }
  };

  if (isLoading && allComments.length === 0)
    return <p>Cargando todos los comentarios...</p>;
  if (error)
    return (
      <p className="error-message" style={{ color: "var(--color-danger)" }}>
        {error}
      </p>
    );
  const areAllVisibleSelected =
    filteredComments.length > 0 &&
    filteredComments.every((c) => selectedCommentIds.has(c.id));

  return (
    <div className="page-container">
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Gestión Global de Comentarios</h1>
        {selectedCommentIds.size > 0 && ( // Mostrar botón solo si hay selecciones
          <button
            onClick={handleDeleteSelectedComments}
            className="delete-btn" // Reutilizar estilo o crear uno específico
            disabled={isDeletingMultiple}
            style={{ backgroundColor: "var(--color-danger)", color: "white" }}
          >
            {isDeletingMultiple
              ? `Borrando ${selectedCommentIds.size}...`
              : `Borrar ${selectedCommentIds.size} Seleccionado(s)`}
          </button>
        )}
      </div>

      <div
        className="filters-container"
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#f8f9fa",
          borderRadius: "5px",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* ... (filtros sin cambios) ... */}
        <div>
          <label
            htmlFor="filterAuthor"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Filtrar por Autor:
          </label>
          <input
            type="text"
            id="filterAuthor"
            placeholder="Nombre de usuario..."
            value={filterAuthor}
            onChange={(e) => setFilterAuthor(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid var(--color-border)",
            }}
          />
        </div>
        <div>
          <label
            htmlFor="filterContent"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Filtrar por Contenido:
          </label>
          <input
            type="text"
            id="filterContent"
            placeholder="Palabra clave en comentario..."
            value={filterContent}
            onChange={(e) => setFilterContent(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid var(--color-border)",
            }}
          />
        </div>
      </div>

      {isLoading && <p>Filtrando/Cargando comentarios...</p>}
      {filteredComments.length === 0 && !isLoading && (
        <p>
          No se encontraron comentarios con los filtros actuales o no hay
          comentarios.
        </p>
      )}

      {filteredComments.length > 0 && (
        <table className="admin-table comments-table">
          <thead>
            <tr>
              <th style={{ width: "30px", textAlign: "center" }}>
                <input
                  type="checkbox"
                  title={
                    areAllVisibleSelected
                      ? "Deseleccionar todos los visibles"
                      : "Seleccionar todos los visibles"
                  }
                  checked={areAllVisibleSelected}
                  onChange={handleSelectAllVisibleComments}
                  disabled={filteredComments.length === 0}
                />
              </th>
              <th>Autor</th>
              <th>Comentario</th>
              <th>En Post ID</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredComments.map((comment) => (
              <tr
                key={comment.id}
                className={
                  selectedCommentIds.has(comment.id) ? "selected-row" : ""
                }
              >
                <td style={{ textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={selectedCommentIds.has(comment.id)}
                    onChange={() => handleSelectComment(comment.id)}
                  />
                </td>
                <td>{comment.authorUsername}</td>
                <td
                  title={comment.content}
                  style={{
                    maxWidth: "400px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {comment.content}
                </td>
                <td>{comment.postId}</td>
                <td>{new Date(comment.createdAt).toLocaleString()}</td>
                <td className="actions-cell">
                  <button
                    onClick={() =>
                      handleDeleteComment(comment.id, comment.content)
                    }
                    className="delete-btn"
                  >
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {filteredComments.length > 15 && (
        <p
          style={{
            textAlign: "center",
            marginTop: "10px",
            fontStyle: "italic",
          }}
        >
          Considerar añadir paginación para muchos resultados.
        </p>
      )}
    </div>
  );
};

export default CommentsPage;
