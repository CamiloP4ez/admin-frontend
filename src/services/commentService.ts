import type { ApiResponseDto } from "../types/api";
import type { CommentResponseDto } from "../types/comment";
import apiClient from "./apiClient";

export const getAllComments = async (): Promise<
  ApiResponseDto<CommentResponseDto[]>
> => {
  const response = await apiClient.get<ApiResponseDto<CommentResponseDto[]>>(
    `/v1/comments`
  );

  if (response.data && Array.isArray(response.data.data)) {
    response.data.data.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  return response.data;
};

export const getCommentsByPostId = async (
  postId: string
): Promise<ApiResponseDto<CommentResponseDto[]>> => {
  const response = await apiClient.get<ApiResponseDto<CommentResponseDto[]>>(
    `/v1/posts/${postId}/comments`
  );
  if (response.data && Array.isArray(response.data.data)) {
    response.data.data.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  return response.data;
};

export const deleteComment = async (commentId: string): Promise<void> => {
  await apiClient.delete(`/v1/comments/${commentId}`);
};
