export interface ApiResponseDto<T> {
  timestamp: string;
  message: string;
  code: number;
  data: T;
}
