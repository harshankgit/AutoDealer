import { 
  hasRole, 
  isAdminOrSuperAdmin, 
  isSuperAdmin, 
  isAdmin, 
  isUser, 
  getAllowedNavigationItems 
} from '@/lib/roleUtils';

// Test the role utility functions
console.log('Testing role utility functions...\n');

// Test hasRole function
console.log('1. Testing hasRole function:');
console.log('User has role "user":', hasRole('user', 'user')); // Should be true
console.log('User has role "admin":', hasRole('user', 'admin')); // Should be false
console.log('Admin has role "admin":', hasRole('admin', 'admin')); // Should be true
console.log('Superadmin has role "superadmin":', hasRole('superadmin', 'superadmin')); // Should be true
console.log('Undefined role:', hasRole(undefined, 'user')); // Should be false
console.log('');

// Test isAdminOrSuperAdmin function
console.log('2. Testing isAdminOrSuperAdmin function:');
console.log('User is admin or superadmin:', isAdminOrSuperAdmin('user')); // Should be false
console.log('Admin is admin or superadmin:', isAdminOrSuperAdmin('admin')); // Should be true
console.log('Superadmin is admin or superadmin:', isAdminOrSuperAdmin('superadmin')); // Should be true
console.log('Undefined role is admin or superadmin:', isAdminOrSuperAdmin(undefined)); // Should be false
console.log('');

// Test isSuperAdmin function
console.log('3. Testing isSuperAdmin function:');
console.log('User is superadmin:', isSuperAdmin('user')); // Should be false
console.log('Admin is superadmin:', isSuperAdmin('admin')); // Should be false
console.log('Superadmin is superadmin:', isSuperAdmin('superadmin')); // Should be true
console.log('Undefined role is superadmin:', isSuperAdmin(undefined)); // Should be false
console.log('');

// Test isAdmin function
console.log('4. Testing isAdmin function:');
console.log('User is admin:', isAdmin('user')); // Should be false
console.log('Admin is admin:', isAdmin('admin')); // Should be true
console.log('Superadmin is admin:', isAdmin('superadmin')); // Should be false
console.log('Undefined role is admin:', isAdmin(undefined)); // Should be false
console.log('');

// Test isUser function
console.log('5. Testing isUser function:');
console.log('User is user:', isUser('user')); // Should be true
console.log('Admin is user:', isUser('admin')); // Should be false
console.log('Superadmin is user:', isUser('superadmin')); // Should be false
console.log('Undefined role is user:', isUser(undefined)); // Should be false
console.log('');

// Test getAllowedNavigationItems function
console.log('6. Testing getAllowedNavigationItems function:');
console.log('User navigation items:', getAllowedNavigationItems('user'));
console.log('Admin navigation items:', getAllowedNavigationItems('admin'));
console.log('Superadmin navigation items:', getAllowedNavigationItems('superadmin'));
console.log('Undefined role navigation items:', getAllowedNavigationItems(undefined));
console.log('');

console.log('All tests completed!');