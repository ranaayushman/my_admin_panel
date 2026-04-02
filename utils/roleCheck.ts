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

/** Roles that may use the admin panel (recruitment RBAC + legacy admin) */
const ADMIN_PANEL_ROLES = new Set([
  'super_admin',
  'super_domain_admin',
  'domain_lead',
]);

/**
 * Check if user may access the admin panel (legacy admin/super_admin + recruitment roles)
 */
export function isAdmin(user: User | null): boolean {
  return !!user?.role && ADMIN_PANEL_ROLES.has(user.role);
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
 * Check if user can access admin panel
 */
export function canAccessAdminPanel(user: User | null): boolean {
  return isAdmin(user);
}

/**
 * Get user access level
 */
export function getUserAccessLevel(
  user: User | null
): 'none' | 'staff' | 'super_admin' {
  if (isSuperAdmin(user)) return 'super_admin';
  if (isAdmin(user)) return 'staff';
  return 'none';
}
