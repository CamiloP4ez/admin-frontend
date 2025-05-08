export interface CommentRequestDto {
  content: string;
}

export interface CommentResponseDto {
  id: string;
  postId: string;
  userId: string;
  authorUsername: string;
  content: string;
  createdAt: string;
}
