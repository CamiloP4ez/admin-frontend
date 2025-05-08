export interface PostRequestDto {
  title?: string;
  content?: string;
  imageUri?: string | null;
}

export interface PostResponseDto {
  id: string;
  userId: string;
  title: string;
  content: string;
  imageUri: string | null;
  createdAt: string;
  likeCount: number;
  authorUsername?: string;
}
