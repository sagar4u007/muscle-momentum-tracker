
// User types
export interface User {
  id: string;
  username: string;
  email: string;
  weight?: number;
  height?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Exercise types
export type MuscleGroup = 'CHEST' | 'BACK' | 'SHOULDERS' | 'ARMS' | 'LEGS' | 'CORE' | 'FULL_BODY' | 'CARDIO' | 'OTHER';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  description: string;
  requiresWeight: boolean;
  userId?: string;
}

export interface ExerciseSet {
  reps: number;
  weight: number;
}

// Workout types
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface WorkoutExercise {
  exerciseId: string;
  name?: string; // This comes in responses but not needed in requests
  sets: ExerciseSet[];
}

export interface Workout {
  id?: string;
  date: string;
  dayOfWeek: DayOfWeek;
  userId?: string;
  exercises: WorkoutExercise[];
}

// Template types
export type TemplateType = 'SYSTEM' | 'CUSTOM';

export interface TemplateExercise {
  name: string;
  muscleGroup: MuscleGroup;
  description: string;
  requiresWeight: boolean;
  recommendedSets: number;
  recommendedRepsRange: string;
}

export interface TemplateDay {
  name: string;
  exercises: TemplateExercise[];
}

export interface Template {
  id?: string;
  name: string;
  description: string;
  type?: TemplateType;
  userId?: string;
  days: TemplateDay[];
}

// Data for charts
export interface VolumeData {
  date: string;
  volume: number;
}

// Form data types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ProfileFormData {
  username: string;
  weight?: number;
  height?: number;
}

export interface PasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
