import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, User, Car, MessageCircle, Home, Calendar, CreditCard, Key } from 'lucide-react';

const renderRoleSpecificGuides = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold flex items-center gap-2">
      <User className="h-6 w-6" />
      Role-Specific Feature Guides
    </h2>
    
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle>User Guide</CardTitle>
              <CardDescription>Complete guide for regular platform users</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">As a User, you can:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Room Browsing:</strong> Explore various rooms to find cars that match your preferences</li>
              <li><strong>Car Discovery:</strong> Browse detailed car listings with images and specifications</li>
              <li><strong>Real-time Chat:</strong> Communicate with admins to ask questions about specific cars</li>
              <li><strong>Booking Management:</strong> Book cars that interest you and track your reservations</li>
              <li><strong>Secure Payments:</strong> Complete transactions with encrypted payment processing</li>
              <li><strong>Profile Management:</strong> Update your personal information and preferences</li>
              <li><strong>Favorite System:</strong> Save cars and rooms for quick access later</li>
              <li><strong>Booking History:</strong> Review your past bookings and payments</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Best Practices for Users:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Be specific about your car preferences when chatting with admins</li>
              <li>Ask detailed questions about car condition and history</li>
              <li>Review all booking details before confirming</li>
              <li>Keep your contact information updated for important notifications</li>
              <li>Check your email regularly for booking confirmations and updates</li>
              <li>Provide feedback about your experience to help improve the platform</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
              <Home className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle>Admin Guide</CardTitle>
              <CardDescription>Complete guide for platform administrators</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">As an Admin, you can:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Room Management:</strong> Create, update, and manage your rooms for users</li>
              <li><strong>Car Listings:</strong> Add and manage detailed car listings with images and specs</li>
              <li><strong>Customer Interaction:</strong> Chat with users to answer questions and provide information</li>
              <li><strong>Booking Oversight:</strong> Manage and process booking requests from users</li>
              <li><strong>Payment Processing:</strong> Handle payment confirmations and document verification</li>
              <li><strong>Scanner Verification:</strong> Use scanner feature to verify user documents</li>
              <li><strong>Analytics Dashboard:</strong> Monitor room performance and user engagement</li>
              <li><strong>Content Management:</strong> Update room information and car availability</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Best Practices for Admins:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Respond promptly to user inquiries to maintain engagement</li>
              <li>Keep car listings current and accurately reflect availability</li>
              <li>Use high-quality images and detailed descriptions for better conversions</li>
              <li>Monitor your dashboard regularly to track performance metrics</li>
              <li>Verify all documents through the scanner feature for security</li>
              <li>Keep room information updated with current inventory</li>
              <li>Provide excellent customer service to build trust</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
              <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <CardTitle>Superadmin Guide</CardTitle>
              <CardDescription>Complete guide for platform super administrators</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">As a Superadmin, you can:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Global User Management:</strong> Manage all users across the entire platform</li>
              <li><strong>System Oversight:</strong> Monitor all rooms, cars, and platform activity</li>
              <li><strong>Admin Management:</strong> Create, modify, or suspend admin accounts</li>
              <li><strong>Configuration Control:</strong> Adjust system-wide settings and parameters</li>
              <li><strong>Content Moderation:</strong> Review and manage platform content</li>
              <li><strong>Performance Monitoring:</strong> Track system performance and usage metrics</li>
              <li><strong>Security Management:</strong> Implement security policies and monitor threats</li>
              <li><strong>System Configuration:</strong> Configure platform settings and integrations</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Best Practices for Superadmins:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Maintain platform integrity and security at all times</li>
              <li>Respect user privacy and handle data according to regulations</li>
              <li>Document administrative actions for accountability</li>
              <li>Coordinate with admins for smooth platform operation</li>
              <li>Schedule system updates during low-usage periods</li>
              <li>Monitor for security threats and suspicious activities</li>
              <li>Provide support to admins when needed</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison by Role</CardTitle>
          <CardDescription>Overview of features available to each user role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Feature</th>
                  <th className="text-center py-2">User</th>
                  <th className="text-center py-2">Admin</th>
                  <th className="text-center py-2">Superadmin</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-2 font-medium">Room Access</td>
                  <td className="text-center py-2">✓</td>
                  <td className="text-center py-2">✓ (Own)</td>
                  <td className="text-center py-2">✓ (All)</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Car Browsing</td>
                  <td className="text-center py-2">✓</td>
                  <td className="text-center py-2">✓ (Own)</td>
                  <td className="text-center py-2">✓ (All)</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Car Management</td>
                  <td className="text-center py-2">✗</td>
                  <td className="text-center py-2">✓</td>
                  <td className="text-center py-2">✓</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Booking Management</td>
                  <td className="text-center py-2">View Own</td>
                  <td className="text-center py-2">✓ (Own Cars)</td>
                  <td className="text-center py-2">✓ (All)</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Chat Communication</td>
                  <td className="text-center py-2">✓</td>
                  <td className="text-center py-2">✓</td>
                  <td className="text-center py-2">✓</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Room Creation</td>
                  <td className="text-center py-2">✗</td>
                  <td className="text-center py-2">✓</td>
                  <td className="text-center py-2">✓</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">User Management</td>
                  <td className="text-center py-2">✗</td>
                  <td className="text-center py-2">Limited</td>
                  <td className="text-center py-2">Full</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">System Configuration</td>
                  <td className="text-center py-2">✗</td>
                  <td className="text-center py-2">✗</td>
                  <td className="text-center py-2">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default renderRoleSpecificGuides;