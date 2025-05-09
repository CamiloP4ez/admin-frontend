import apiClient from "./apiClient";
import type { ApiResponseDto } from "../types/api";
import type { AuthResponseDto, AuthLoginRequestDto } from "../types/auth";

export const loginUser = async (
  credentials: AuthLoginRequestDto
): Promise<ApiResponseDto<AuthResponseDto>> => {
  const response = await apiClient.post<ApiResponseDto<AuthResponseDto>>(
    "/auth/login",
    credentials
  );
  return response.data;
};
