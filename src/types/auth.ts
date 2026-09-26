export type UserRole = 'ADMIN' | 'INVENTORY_MANAGER' | 'WAREHOUSE_STAFF';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  warehouseId?: string;
  warehouseName?: string;
  department?: string;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}
