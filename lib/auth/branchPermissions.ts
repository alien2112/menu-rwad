import { IUser } from '../models/User';

/**
 * Branch Permission Helper Functions
 * Handles authorization logic for multi-branch restaurant management
 */

export interface BranchPermissionCheck {
  canAccess: boolean;
  reason?: string;
}

/**
 * Check if a user can access a specific branch
 */
export function canAccessBranch(
  user: IUser,
  branchId: string
): BranchPermissionCheck {
  // Admin role can access all branches
  if (user.role === 'admin' || user.permissions?.canManageAllBranches) {
    return { canAccess: true };
  }

  // Check if user has this branch assigned
  if (user.assignedBranches && user.assignedBranches.includes(branchId)) {
    return { canAccess: true };
  }

  // Check if this is user's primary branch
  if (user.primaryBranchId === branchId) {
    return { canAccess: true };
  }

  return {
    canAccess: false,
    reason: 'User does not have access to this branch',
  };
}

/**
 * Get list of branch IDs that a user can access
 */
export function getAccessibleBranches(user: IUser): string[] | 'all' {
  // Admin can access all branches
  if (user.role === 'admin' || user.permissions?.canManageAllBranches) {
    return 'all';
  }

  const branches: string[] = [];

  // Add assigned branches
  if (user.assignedBranches && user.assignedBranches.length > 0) {
    branches.push(...user.assignedBranches);
  }

  // Add primary branch if not already included
  if (user.primaryBranchId && !branches.includes(user.primaryBranchId)) {
    branches.push(user.primaryBranchId);
  }

  return branches;
}

/**
 * Check if user can manage branches (create, edit, delete)
 */
export function canManageBranches(user: IUser): boolean {
  return user.role === 'admin' || user.permissions?.canManageAllBranches === true;
}

/**
 * Check if user can view reports for a specific branch
 */
export function canViewBranchReports(user: IUser, branchId: string): boolean {
  const accessCheck = canAccessBranch(user, branchId);
  if (!accessCheck.canAccess) {
    return false;
  }

  return (
    user.role === 'admin' ||
    user.role === 'manager' ||
    user.permissions?.canViewReports === true
  );
}

/**
 * Check if user can manage menu items for a specific branch
 */
export function canManageBranchMenu(user: IUser, branchId: string): boolean {
  const accessCheck = canAccessBranch(user, branchId);
  if (!accessCheck.canAccess) {
    return false;
  }

  return (
    user.role === 'admin' ||
    user.role === 'manager' ||
    user.permissions?.canManageMenu === true
  );
}

/**
 * Check if user can manage orders for a specific branch
 */
export function canManageBranchOrders(user: IUser, branchId: string): boolean {
  const accessCheck = canAccessBranch(user, branchId);
  if (!accessCheck.canAccess) {
    return false;
  }

  return (
    user.role === 'admin' ||
    user.role === 'manager' ||
    user.permissions?.canManageOrders === true
  );
}

/**
 * Check if user can manage staff for a specific branch
 */
export function canManageBranchStaff(user: IUser, branchId: string): boolean {
  const accessCheck = canAccessBranch(user, branchId);
  if (!accessCheck.canAccess) {
    return false;
  }

  return (
    user.role === 'admin' ||
    user.role === 'manager' ||
    user.permissions?.canManageStaff === true
  );
}

/**
 * Filter query based on user's branch access
 * Returns a MongoDB query filter
 */
export function getBranchFilter(user: IUser): Record<string, any> {
  const accessibleBranches = getAccessibleBranches(user);

  if (accessibleBranches === 'all') {
    return {}; // No filter needed, user can see all branches
  }

  if (accessibleBranches.length === 0) {
    // User has no branch access, return impossible filter
    return { _id: null };
  }

  // Filter to only show branches user has access to
  return {
    $or: [
      { branchId: { $in: accessibleBranches } },
      { branchId: { $exists: false } }, // Include items without branch (global)
      { branchId: null },
    ],
  };
}

/**
 * Check if user is a branch manager for a specific branch
 */
export function isBranchManager(user: IUser, branchId: string): boolean {
  return user.role === 'manager' && user.primaryBranchId === branchId;
}

/**
 * Get user's role display name in Arabic
 */
export function getRoleDisplayName(role: string): string {
  const roleNames: Record<string, string> = {
    admin: 'مدير النظام',
    manager: 'مدير الفرع',
    staff: 'موظف',
    kitchen: 'المطبخ',
    barista: 'البارستا',
    shisha: 'الشيشة',
  };

  return roleNames[role] || role;
}
