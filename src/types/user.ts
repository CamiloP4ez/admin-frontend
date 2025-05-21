// src/types/api.ts
export interface UserResponseDto {
  id: string;
  username: string;
  email: string;
  profilePictureUri: string | null;
  createdAt: string;
  roles: string[];
  enabled: boolean;
  followersCount: number;
  followingCount: number;
}

export interface UserUpdateRequestDto {
  username?: string;
  email?: string;
  profilePictureUri?: string | null;
}

export interface UserRoleUpdateRequestDto {
  roles: string[];
}
export interface UserStatusUpdateDto {
  enabled: boolean;
}
