import type { UserRole } from "./auth";

export interface MyProfileResponse {
  id: string;
  fullName: string;
  email: string;
  username: string | null;
  phone: string | null;
  avatarUrl: string | null;
  preferredLanguage: string;
  role: UserRole;
  emailVerified: boolean;
  // STUDENT
  grade?: number;
  schoolName?: string;
  city?: string;
  birthDate?: string;
  // TEACHER
  bio?: string;
  hourlyRate?: number;
  rating?: number;
  isVerified?: boolean;
  subjects?: string[];
  // PARENT
  occupation?: string;
}

export type LessonStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface LessonResponse {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherAvatarUrl: string | null;
  studentId: string;
  studentName: string;
  subject: string;
  scheduledAt: string;
  durationMinutes: number;
  status: LessonStatus;
  meetingLink: string | null;
  notes: string | null;
  cancellationReason: string | null;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface ChildResponse {
  id: string;
  fullName: string;
  role: UserRole;
  avatarUrl: string | null;
  emailVerified: boolean;
}

export interface TeacherSearchResponse {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  subjects: string[];
}

export interface TeacherPublicProfile {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  hourlyRate: number;
  rating: number;
  isVerified: boolean;
  subjects: string[];
}

export interface AvailabilitySlot {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface BookedTimeRange {
  startTime: string;
  endTime: string;
}

export interface ReviewResponse {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatarUrl: string | null;
  rating: number;
  comment: string | null;
  createdAt: string;
}
