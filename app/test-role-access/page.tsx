'use client';

import { useState } from 'react';
import { 
  hasRole, 
  isAdminOrSuperAdmin, 
  isSuperAdmin, 
  isAdmin, 
  isUser, 
  getAllowedNavigationItems 
} from '@/lib/roleUtils';

export default function RoleTestPage() {
  const [testRole, setTestRole] = useState<string>('user');
  
  const allowedNavItems = getAllowedNavigationItems(testRole as any);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Role-Based Access Control Test</h1>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Test Role:
          </label>
          <select 
            value={testRole} 
            onChange={(e) => setTestRole(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">No Role (Not Logged In)</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">Role Checks</h2>
            <div className="space-y-2">
              <p><strong>hasRole('{testRole}', 'user'):</strong> {JSON.stringify(hasRole(testRole, 'user'))}</p>
              <p><strong>hasRole('{testRole}', 'admin'):</strong> {JSON.stringify(hasRole(testRole, 'admin'))}</p>
              <p><strong>hasRole('{testRole}', 'superadmin'):</strong> {JSON.stringify(hasRole(testRole, 'superadmin'))}</p>
              <p><strong>isAdminOrSuperAdmin:</strong> {JSON.stringify(isAdminOrSuperAdmin(testRole))}</p>
              <p><strong>isSuperAdmin:</strong> {JSON.stringify(isSuperAdmin(testRole))}</p>
              <p><strong>isAdmin:</strong> {JSON.stringify(isAdmin(testRole))}</p>
              <p><strong>isUser:</strong> {JSON.stringify(isUser(testRole))}</p>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">Allowed Navigation Items</h2>
            <div className="space-y-2">
              <p><strong>showCarsDropdown:</strong> {JSON.stringify(allowedNavItems.showCarsDropdown)}</p>
              <p><strong>showServicesDropdown:</strong> {JSON.stringify(allowedNavItems.showServicesDropdown)}</p>
              <p><strong>showChatSystem:</strong> {JSON.stringify(allowedNavItems.showChatSystem)}</p>
              <p><strong>showManageShowroom:</strong> {JSON.stringify(allowedNavItems.showManageShowroom)}</p>
              <p><strong>showSuperAdmin:</strong> {JSON.stringify(allowedNavItems.showSuperAdmin)}</p>
              <p><strong>showUserSpecificItems:</strong> {JSON.stringify(allowedNavItems.showUserSpecificItems)}</p>
              <p><strong>showFavorites:</strong> {JSON.stringify(allowedNavItems.showFavorites)}</p>
              <p><strong>showBookings:</strong> {JSON.stringify(allowedNavItems.showBookings)}</p>
              <p><strong>showNotifications:</strong> {JSON.stringify(allowedNavItems.showNotifications)}</p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-blue-50">
          <h2 className="text-lg font-semibold mb-3">Expected Navigation Behavior</h2>
          <ul className="list-disc pl-5 space-y-1">
            {testRole === 'user' && (
              <>
                <li>Can see Cars dropdown</li>
                <li>Can see Services dropdown (but only Chat System if they have access)</li>
                <li>Can see Account dropdown with Favorites, Bookings, Notifications</li>
                <li>Cannot see Manage Showroom or Super Admin links</li>
              </>
            )}
            {testRole === 'admin' && (
              <>
                <li>Can see Cars dropdown</li>
                <li>Can see Services dropdown with Chat System and Manage Showroom</li>
                <li>Can see Account dropdown with Favorites, Bookings, Notifications</li>
                <li>Cannot see Super Admin link</li>
              </>
            )}
            {testRole === 'superadmin' && (
              <>
                <li>Can see Cars dropdown</li>
                <li>Can see Services dropdown with Chat System, Manage Showroom, and Super Admin</li>
                <li>Can see Account dropdown with Favorites, Bookings, Notifications</li>
                <li>Can access Super Admin panel</li>
              </>
            )}
            {!testRole && (
              <>
                <li>Can see Cars dropdown</li>
                <li>Can see Services dropdown (but no protected links)</li>
                <li>Can see Login/Register options</li>
                <li>Cannot see any user-specific or admin links</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}