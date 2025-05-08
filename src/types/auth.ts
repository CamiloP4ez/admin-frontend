export interface AuthLoginRequestDto {
  username?: string;
  password?: string;
}

export interface AuthResponseDto {
  accessToken: string;
  tokenType: string;
  userId: string;
  username: string;
  email: string;
  roles: string[];
}

export interface AuthRegisterRequestDto {
  username?: string;
  email?: string;
  password?: string;
}
