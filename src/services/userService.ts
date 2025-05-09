import apiClient from "./apiClient";
import { type ApiResponseDto } from "../types/api";
import type {
  UserResponseDto,
  UserRoleUpdateRequestDto,
  UserStatusUpdateDto,
  UserUpdateRequestDto,
} from "../types/user";

export const getAllUsers = async (): Promise<
  ApiResponseDto<UserResponseDto[]>
> => {
  const response = await apiClient.get<ApiResponseDto<UserResponseDto[]>>(
    "/v1/users"
  );
  return response.data;
};

export const getUserById = async (
  userId: string
): Promise<ApiResponseDto<UserResponseDto>> => {
  const response = await apiClient.get<ApiResponseDto<UserResponseDto>>(
    `/v1/users/${userId}`
  );
  return response.data;
};

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

export const deleteUser = async (
  userId: string
): Promise<ApiResponseDto<null> | void> => {
  const response = await apiClient.delete(`/v1/users/${userId}`);
  if (response.status === 204) {
    return;
  }
  return response.data as ApiResponseDto<null>;
};

export const getMyProfile = async (): Promise<
  ApiResponseDto<UserResponseDto>
> => {
  const response = await apiClient.get<ApiResponseDto<UserResponseDto>>(
    "/v1/users/me"
  );
  return response.data;
};

export const updateMyProfile = async (
  profileData: UserUpdateRequestDto
): Promise<ApiResponseDto<UserResponseDto>> => {
  const response = await apiClient.put<ApiResponseDto<UserResponseDto>>(
    "/v1/users/me",
    profileData
  );
  return response.data;
};
