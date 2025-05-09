import apiClient from "./apiClient";
import { type ApiResponseDto } from "../types/api";
import type {
  UserResponseDto,
  UserRoleUpdateRequestDto,
  UserStatusUpdateDto,
  UserUpdateRequestDto,
} from "../types/user";

// Get All Users (Admin, SuperAdmin)
export const getAllUsers = async (): Promise<
  ApiResponseDto<UserResponseDto[]>
> => {
  const response = await apiClient.get<ApiResponseDto<UserResponseDto[]>>(
    "/v1/users"
  );
  return response.data;
};

// Get User By ID (Admin, SuperAdmin)
export const getUserById = async (
  userId: string
): Promise<ApiResponseDto<UserResponseDto>> => {
  const response = await apiClient.get<ApiResponseDto<UserResponseDto>>(
    `/v1/users/${userId}`
  );
  return response.data;
};

// Update User Roles (SuperAdmin)
export const updateUserRoles = async (
  userId: string,
  rolesData: UserRoleUpdateRequestDto
): Promise<ApiResponseDto<UserResponseDto>> => {
  const response = await apiClient.put<ApiResponseDto<UserResponseDto>>(
    `/v1/users/${userId}/roles`,
    rolesData
  );
  return response.data;
};

// Update User Status (Admin, SuperAdmin) - Enable/Disable
export const updateUserStatus = async (
  userId: string,
  statusData: UserStatusUpdateDto
): Promise<ApiResponseDto<UserResponseDto>> => {
  const response = await apiClient.patch<ApiResponseDto<UserResponseDto>>(
    `/v1/users/${userId}/status`,
    statusData
  );
  return response.data;
};

// Delete User (SuperAdmin)
export const deleteUser = async (
  userId: string
): Promise<ApiResponseDto<null> | void> => {
  // Puede ser 204 No Content
  const response = await apiClient.delete(`/v1/users/${userId}`);
  // Si es 204, response.data puede ser undefined o null.
  // El backend especifica "Sin cuerpo de respuesta" para 204.
  if (response.status === 204) {
    return; // O podrías devolver un objeto con un mensaje de éxito si prefieres
  }
  return response.data as ApiResponseDto<null>; // Para otros códigos de éxito con cuerpo
};

// Get My Profile (Authenticated User)
export const getMyProfile = async (): Promise<
  ApiResponseDto<UserResponseDto>
> => {
  const response = await apiClient.get<ApiResponseDto<UserResponseDto>>(
    "/v1/users/me"
  );
  return response.data;
};

// Update My Profile (Authenticated User)
export const updateMyProfile = async (
  profileData: UserUpdateRequestDto
): Promise<ApiResponseDto<UserResponseDto>> => {
  const response = await apiClient.put<ApiResponseDto<UserResponseDto>>(
    "/v1/users/me",
    profileData
  );
  return response.data;
};

// (Opcional si se necesita para UsersPostModal) Get posts by a specific user ID
// Esto no está explícitamente en tu API de /users, pero podría estar en /posts?userId=...
// Si no, el UserPostsModal tendría que obtener todos los posts y filtrar por userId, lo cual es ineficiente.
// Vamos a asumir por ahora que existe un endpoint o que se puede filtrar en el cliente si es una lista pequeña.
// O bien, que la API /api/v1/posts puede tomar un query param como ?userId=...
// Si tu API `GET /api/v1/posts` puede ser filtrada por `userId` (ej. `/api/v1/posts?userId=someUserId`),
// entonces deberíamos añadir esa funcionalidad al postService.
