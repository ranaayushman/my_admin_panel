import { User } from '@/types';

/**
 * Role-based access control utilities for super admin and admin features
 */

/**
 * Check if user has a specific role
 */
export function hasRole(user: User | null, role: string): boolean {
  return user?.role === role;
}

/**
 * Check if user is admin or super_admin
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin' || user?.role === 'super_admin';
}

/**
 * Check if user is super_admin
 */
export function isSuperAdmin(user: User | null): boolean {
  return user?.role === 'super_admin';
}

/**
 * Check if user can manage admins (only super_admin)
 */
export function canManageAdmins(user: User | null): boolean {
  return isSuperAdmin(user);
}

/**
 * Check if user can view activity logs (only super_admin)
 */
export function canViewActivityLogs(user: User | null): boolean {
  return isSuperAdmin(user);
}

/**
 * Check if user can access admin panel (admin or super_admin)
 */
export function canAccessAdminPanel(user: User | null): boolean {
  return isAdmin(user);
}

/**
 * Get user access level
 */
export function getUserAccessLevel(user: User | null): 'none' | 'admin' | 'super_admin' {
  if (isSuperAdmin(user)) return 'super_admin';
  if (hasRole(user, 'admin')) return 'admin';
  return 'none';
}
