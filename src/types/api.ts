export interface ApiResponseDto<T> {
  timestamp: string;
  message: string;
  code: number;
  data: T;
}

export interface UserCreateRequestDto {
  username?: string;
  email?: string;
  password?: string;
  roles?: string[];
  profilePictureUri?: string | null;
  enabled?: boolean;
}

export interface AdminUserUpdateRequestDto {
  username?: string;
  email?: string;
  password?: string;
  profilePictureUri?: string | null;
  roles?: string[];
  enabled?: boolean;
}
