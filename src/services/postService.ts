import type { ApiResponseDto } from "../types/api";
import type { LikeResponseDto } from "../types/like";
import type { PostRequestDto, PostResponseDto } from "../types/post";
import apiClient from "./apiClient";

export const createPost = async (
  postData: PostRequestDto
): Promise<ApiResponseDto<PostResponseDto>> => {
  const response = await apiClient.post<ApiResponseDto<PostResponseDto>>(
    "/v1/posts",
    postData
  );
  return response.data;
};

export const getAllPosts = async (): Promise<
  ApiResponseDto<PostResponseDto[]>
> => {
  const response = await apiClient.get<ApiResponseDto<PostResponseDto[]>>(
    "/v1/posts"
  );
  if (response.data && Array.isArray(response.data.data)) {
    response.data.data.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  return response.data;
};
export const getPostsByUserId = async (
  userId: string
): Promise<ApiResponseDto<PostResponseDto[]>> => {
  const response = await apiClient.get<ApiResponseDto<PostResponseDto[]>>(
    `/v1/users/${userId}/posts`
  );
  if (response.data && Array.isArray(response.data.data)) {
    response.data.data.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  return response.data;
};

export const getPostById = async (
  postId: string
): Promise<ApiResponseDto<PostResponseDto>> => {
  const response = await apiClient.get<ApiResponseDto<PostResponseDto>>(
    `/v1/posts/${postId}`
  );
  return response.data;
};

export const updatePost = async (
  postId: string,
  postData: PostRequestDto
): Promise<ApiResponseDto<PostResponseDto>> => {
  const response = await apiClient.put<ApiResponseDto<PostResponseDto>>(
    `/v1/posts/${postId}`,
    postData
  );
  return response.data;
};

export const deletePost = async (
  postId: string
): Promise<ApiResponseDto<null> | void> => {
  const response = await apiClient.delete(`/v1/posts/${postId}`);
  if (response.status === 204) {
    return;
  }
  return response.data as ApiResponseDto<null>;
};

export const getLikesForPost = async (
  postId: string
): Promise<ApiResponseDto<LikeResponseDto[]>> => {
  const response = await apiClient.get<ApiResponseDto<LikeResponseDto[]>>(
    `/v1/posts/${postId}/likes`
  );
  return response.data;
};
