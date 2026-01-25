export type UserRole = 'admin' | 'estimator' | 'viewer';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  is_active?: boolean;
  created_at?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface Client {
  id: number;
  user_id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postcode?: string;
  country: string;
  website?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClientRequest {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postcode?: string;
  country?: string;
  website?: string;
  notes?: string;
}

export interface BuildingContractor {
  id: number;
  user_id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postcode?: string;
  country: string;
  website?: string;
  specialization?: string;
  is_active: boolean;
  rating: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateContractorRequest {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postcode?: string;
  country?: string;
  website?: string;
  specialization?: string;
  notes?: string;
}
