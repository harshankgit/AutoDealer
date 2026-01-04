/**
 * Role-based access control utilities
 */

export type UserRole = 'user' | 'admin' | 'superadmin';

/**
 * Check if a user has a specific role
 */
export const hasRole = (userRole: string | undefined, requiredRole: UserRole): boolean => {
  if (!userRole) return false;
  return userRole === requiredRole;
};

/**
 * Check if a user has admin or superadmin role
 */
export const isAdminOrSuperAdmin = (userRole: string | undefined): boolean => {
  return hasRole(userRole, 'admin') || hasRole(userRole, 'superadmin');
};

/**
 * Check if a user has superadmin role
 */
export const isSuperAdmin = (userRole: string | undefined): boolean => {
  return hasRole(userRole, 'superadmin');
};

/**
 * Check if a user has admin role
 */
export const isAdmin = (userRole: string | undefined): boolean => {
  return hasRole(userRole, 'admin');
};

/**
 * Check if a user has user role
 */
export const isUser = (userRole: string | undefined): boolean => {
  return hasRole(userRole, 'user');
};

/**
 * Get allowed navigation items based on user role
 */
export const getAllowedNavigationItems = (userRole: string | undefined) => {
  const items = {
    showCarsDropdown: true,
    showServicesDropdown: true,
    showChatSystem: false,
    showManageShowroom: false,
    showSuperAdmin: false,
    showUserSpecificItems: false,
    showFavorites: false,
    showBookings: false, // For regular users to view their bookings
    showNotifications: false,
    showManageBookings: false, // For admins to manage all bookings
  };

  if (userRole) {
    items.showUserSpecificItems = true;

    if (isAdminOrSuperAdmin(userRole)) {
      items.showChatSystem = true;
      items.showManageShowroom = true;
      items.showManageBookings = true; // Admins can manage bookings
    }

    if (isSuperAdmin(userRole)) {
      items.showSuperAdmin = true;
    }

    if (isUser(userRole)) {
      items.showFavorites = true;
      items.showBookings = true; // Regular users can view their own bookings
      items.showNotifications = true;
    }
  }

  return items;
};