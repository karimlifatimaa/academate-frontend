export type UserRole = "STUDENT" | "TEACHER" | "PARENT" | "ADMIN";

export interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  username: string | null;
  role: UserRole;
  avatarUrl: string | null;
  emailVerified: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserResponse;
}
