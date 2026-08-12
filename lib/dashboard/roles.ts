/**
 * Central role/permission registry for the dashboard.
 *
 * To add a new role in the future (e.g. "reviewer", "analyst"):
 *   1. Add it to the `dashboard_role` Postgres enum (supabase/migrations).
 *   2. Add it to the `DashboardRole` union below.
 *   3. Add its permissions to ROLE_PERMISSIONS.
 *   4. Add nav items in NAV_ITEMS with the roles allowed to see them.
 * No other file needs to change — every check in the app reads from here.
 */

export type DashboardRole = 'admin' | 'editor';

export type Permission =
  | 'article:create'
  | 'article:edit_own'
  | 'article:edit_any'
  | 'article:view_own'
  | 'article:view_any'
  | 'article:publish'
  | 'user:manage'
  | 'settings:manage'
  | 'homepage:manage'
  | 'taxonomy:manage'
  | 'media:manage'
  | 'activity_log:view';

export const ROLE_PERMISSIONS: Record<DashboardRole, Permission[]> = {
  editor: [
    'article:create',
    'article:edit_own',
    'article:view_own',
  ],
  admin: [
    'article:create',
    'article:edit_own',
    'article:edit_any',
    'article:view_own',
    'article:view_any',
    'article:publish',
    'user:manage',
    'settings:manage',
    'homepage:manage',
    'taxonomy:manage',
    'media:manage',
    'activity_log:view',
  ],
};

export function hasPermission(role: DashboardRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export interface NavItem {
  href: string;
  label: string;
  roles: DashboardRole[];
}

/**
 * Sidebar navigation, filtered per-request by the current user's role.
 * Add new sections here as features are built — no layout changes needed.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Overview', roles: ['admin', 'editor'] },
  { href: '/dashboard/articles', label: 'My Articles', roles: ['admin', 'editor'] },
  { href: '/dashboard/articles/new', label: 'New Article', roles: ['admin', 'editor'] },
  { href: '/dashboard/admin', label: 'Admin', roles: ['admin'] },
  { href: '/dashboard/admin/users', label: 'Users', roles: ['admin'] },
];
