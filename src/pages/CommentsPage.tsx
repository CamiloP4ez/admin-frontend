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
        setSelectedCommentIds((prevSelected) => {
          const newSelected = new Set(prevSelected);
          newSelected.delete(commentId);
          return newSelected;
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          const errorMessage =
            err.message || "Error al eliminar el comentario.";
          setError(errorMessage);
          alert(errorMessage);
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
    const allVisibleSelected =
      visibleCommentIds.length > 0 &&
      visibleCommentIds.every((id) => selectedCommentIds.has(id));

    if (allVisibleSelected) {
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
      setError(null);
      let successCount = 0;
      const errorMessages: string[] = [];

      for (const commentId of selectedCommentIds) {
        try {
          await deleteCommentService(commentId);
          successCount++;
        } catch (err: unknown) {
          if (err instanceof Error) {
            const errorMessage =
              err.message || "Error al eliminar el comentario.";
            setError(errorMessage);
            alert(errorMessage);
          }
        }
      }

      setIsDeletingMultiple(false);

      if (errorMessages.length > 0) {
        alert(
          `Se eliminaron ${successCount} comentarios.\n${
            errorMessages.length
          } comentarios no pudieron ser eliminados.\nErrores:\n${errorMessages
            .slice(0, 5)
            .join("\n")}${errorMessages.length > 5 ? "\n..." : ""}`
        );
        setError(
          `Algunos comentarios no pudieron ser eliminados. ${errorMessages.join(
            "; "
          )}`
        );
      } else {
        alert(`${successCount} comentario(s) eliminado(s) exitosamente.`);
      }

      setAllComments((prev) =>
        prev.filter((c) => !selectedCommentIds.has(c.id))
      );
      setSelectedCommentIds(new Set());
    }
  };

  if (isLoading && allComments.length === 0)
    return <p className="loading-message">Cargando todos los comentarios...</p>;

  const areAllVisibleSelected =
    filteredComments.length > 0 &&
    filteredComments.every((c) => selectedCommentIds.has(c.id));

  return (
    <div className="page-container comments-page">
      <div className="page-header">
        <h1>Gestión Global de Comentarios</h1>
        {selectedCommentIds.size > 0 && (
          <button
            onClick={handleDeleteSelectedComments}
            className="btn btn-danger"
            disabled={isDeletingMultiple}
          >
            <span className="icon-delete">🗑️</span>
            {isDeletingMultiple
              ? `Borrando ${selectedCommentIds.size}...`
              : `Borrar ${selectedCommentIds.size} Seleccionado(s)`}
          </button>
        )}
      </div>

      {error && !isDeletingMultiple && (
        <p className="error-message">Error: {error}</p>
      )}

      <div className="filters-container">
        <div className="filter-item">
          <label htmlFor="filterAuthor">Filtrar por Autor:</label>
          <input
            type="text"
            id="filterAuthor"
            className="filter-input"
            placeholder="Nombre de usuario..."
            value={filterAuthor}
            onChange={(e) => setFilterAuthor(e.target.value)}
          />
        </div>
        <div className="filter-item">
          <label htmlFor="filterContent">Filtrar por Contenido:</label>
          <input
            type="text"
            id="filterContent"
            className="filter-input"
            placeholder="Palabra clave en comentario..."
            value={filterContent}
            onChange={(e) => setFilterContent(e.target.value)}
          />
        </div>
      </div>

      {isLoading && allComments.length > 0 && (
        <p className="loading-inline-message">Actualizando comentarios...</p>
      )}

      {!isLoading && filteredComments.length === 0 && (
        <p className="info-message">
          No se encontraron comentarios con los filtros actuales o no hay
          comentarios para mostrar.
        </p>
      )}

      {filteredComments.length > 0 && (
        <div className="table-responsive-container">
          <table className="data-table comments-table">
            <thead>
              <tr>
                <th className="cell-checkbox select-all-checkbox-header">
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
                <th className="cell-comment-content-header">Comentario</th>
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
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (
                      target.tagName !== "BUTTON" &&
                      !target.closest("button") &&
                      target.tagName !== "INPUT"
                    ) {
                      handleSelectComment(comment.id);
                    }
                  }}
                >
                  <td className="cell-checkbox" data-label="Seleccionar">
                    <input
                      type="checkbox"
                      checked={selectedCommentIds.has(comment.id)}
                      onChange={() => handleSelectComment(comment.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td data-label="Autor">{comment.authorUsername}</td>
                  <td
                    data-label="Comentario"
                    title={comment.content}
                    className="cell-comment-content"
                  >
                    {comment.content}
                  </td>
                  <td data-label="Post ID">{comment.postId}</td>
                  <td data-label="Fecha">
                    {new Date(comment.createdAt).toLocaleString()}
                  </td>
                  <td data-label="Acciones" className="actions-cell">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteComment(comment.id, comment.content);
                      }}
                      className="btn btn-danger btn-small"
                      title="Borrar comentario"
                    >
                      <span className="icon-delete">🗑️</span> Borrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {filteredComments.length > 15 && (
        <p className="pagination-suggestion">
          Considerar añadir paginación para mejorar el rendimiento con muchos
          resultados.
        </p>
      )}
    </div>
  );
};

export default CommentsPage;
