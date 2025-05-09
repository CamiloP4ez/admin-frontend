// src/services/postService.ts
import type { ApiResponseDto } from "../types/api";
import type { PostRequestDto, PostResponseDto } from "../types/post";
import apiClient from "./apiClient";

// Create Post (USER, ADMIN, SUPERADMIN)
export const createPost = async (
  postData: PostRequestDto
): Promise<ApiResponseDto<PostResponseDto>> => {
  const response = await apiClient.post<ApiResponseDto<PostResponseDto>>(
    "/v1/posts",
    postData
  );
  return response.data;
};

// Get All Posts (Public)
// Agregamos un parámetro opcional para filtrar por userId si la API lo soporta
export const getAllPosts = async (
  userId?: string
): Promise<ApiResponseDto<PostResponseDto[]>> => {
  let url = "/v1/posts";
  if (userId) {
    url += `?userId=${userId}`; // Asumiendo que la API soporta este filtro
  }
  const response = await apiClient.get<ApiResponseDto<PostResponseDto[]>>(url);
  // Ordenar por fecha de creación, más recientes primero
  if (response.data && Array.isArray(response.data.data)) {
    response.data.data.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  return response.data;
};

// Get Post By ID (Public)
export const getPostById = async (
  postId: string
): Promise<ApiResponseDto<PostResponseDto>> => {
  const response = await apiClient.get<ApiResponseDto<PostResponseDto>>(
    `/v1/posts/${postId}`
  );
  return response.data;
};

// Update Post (Author, ADMIN, SUPERADMIN)
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

// Delete Post (Author, ADMIN, SUPERADMIN)
export const deletePost = async (
  postId: string
): Promise<ApiResponseDto<null> | void> => {
  const response = await apiClient.delete(`/v1/posts/${postId}`);
  if (response.status === 204) {
    return;
  }
  return response.data as ApiResponseDto<null>;
};

// (Omitiendo Like/Unlike y Comments por ahora, ya que no son el foco del panel de admin,
// pero se podrían añadir aquí si fueran necesarios)
