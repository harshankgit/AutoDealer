'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MessageCircle,
  Car,
  Users,
  Settings,
  Key,
  User,
  CreditCard,
  Home,
  Shield,
  Mail,
  Search,
  BookOpen,
  FileText,
  Calendar,
  Eye,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import RoleGuides from './role-guides';

export default function HelpPage() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const helpSections = [
    {
      id: 'chat',
      title: 'Chat Assistant',
      description: 'Real-time chat with other users and admins',
      icon: MessageCircle,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      roles: ['user', 'admin', 'superadmin']
    },
    {
      id: 'rooms',
      title: 'Rooms Management',
      description: 'Create, manage, and join rooms',
      icon: Home,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      roles: ['admin', 'superadmin']
    },
    {
      id: 'cars',
      title: 'Car Listings',
      description: 'Add, edit, and manage car listings',
      icon: Car,
      color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      roles: ['admin', 'superadmin']
    },
    {
      id: 'bookings',
      title: 'Bookings & Payments',
      description: 'Manage car bookings and payments',
      icon: Calendar,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      roles: ['user', 'admin', 'superadmin']
    },
    {
      id: 'profile',
      title: 'Profile & Security',
      description: 'Manage your profile and account security',
      icon: User,
      color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
      roles: ['user', 'admin', 'superadmin']
    },
    {
      id: 'auth',
      title: 'Authentication',
      description: 'Login, registration, and password management',
      icon: Key,
      color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
      roles: ['user', 'admin', 'superadmin']
    },
    {
      id: 'admin',
      title: 'Admin Features',
      description: 'Advanced admin and superadmin tools',
      icon: Shield,
      color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      roles: ['admin', 'superadmin']
    },
    {
      id: 'roles',
      title: 'Role-Specific Guides',
      description: 'Detailed guides for each user role',
      icon: User,
      color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
      roles: ['user', 'admin', 'superadmin']
    }
  ];

  const renderChatAssistantHelp = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <MessageCircle className="h-6 w-6" />
        Chat Assistant
      </h2>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>How to use the chat system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">For Users:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Joining Rooms:</strong> Browse available rooms and join one to start chatting with the admin</li>
                <li><strong>Asking Questions:</strong> Type your questions about cars, pricing, availability, or any other details in the chat</li>
                <li><strong>Car Details:</strong> Request specific car information by mentioning the car name or asking for details</li>
                <li><strong>File Sharing:</strong> Send images or documents to the admin if needed for your inquiry</li>
                <li><strong>Real-time Communication:</strong> Get instant responses from admins during their active hours</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">For Admins:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Manage Conversations:</strong> View all active chats in your rooms and respond to user inquiries</li>
                <li><strong>Share Car Information:</strong> Send detailed car information, specifications, and images directly in chat</li>
                <li><strong>Document Verification:</strong> Use the scanner feature to verify documents shared by users</li>
                <li><strong>Track Interactions:</strong> Monitor user engagement and frequently asked questions</li>
                <li><strong>Multi-room Management:</strong> Handle conversations across multiple rooms simultaneously</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features & Capabilities</CardTitle>
            <CardDescription>Detailed functionality breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Real-time Communication:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Typing Indicators:</strong> See when the other person is typing a message</li>
                <li><strong>Read Receipts:</strong> Know when your messages have been read</li>
                <li><strong>Online Status:</strong> Check if admins/users are currently online</li>
                <li><strong>Notifications:</strong> Get alerts for new messages when you're away</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">File & Media Sharing:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Image Sharing:</strong> Send and receive car photos and documents</li>
                <li><strong>Document Upload:</strong> Share PDFs, contracts, or other important files</li>
                <li><strong>File Previews:</strong> View shared content without downloading</li>
                <li><strong>Secure Transfer:</strong> All files are securely transmitted and stored</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Conversation Management:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Message History:</strong> Access all previous conversations with users</li>
                <li><strong>Search Functionality:</strong> Find specific messages or conversations</li>
                <li><strong>Conversation Archiving:</strong> Organize and store completed conversations</li>
                <li><strong>Quick Responses:</strong> Use saved templates for common questions</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting & Best Practices</CardTitle>
            <CardDescription>Common issues and optimization tips</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Best Practices for Users:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Be specific about the car you're interested in</li>
                <li>Ask about pricing, condition, and availability upfront</li>
                <li>Share relevant documents if you need financing assistance</li>
                <li>Be respectful and patient with admin response times</li>
                <li>Use the chat to clarify any doubts before booking</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Best Practices for Admins:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Respond promptly to user inquiries to maintain engagement</li>
                <li>Provide detailed and accurate information about cars</li>
                <li>Use car cards and images to make conversations more visual</li>
                <li>Keep track of frequently asked questions to improve service</li>
                <li>Verify all documents shared by users through the scanner feature</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderRoomsHelp = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Home className="h-6 w-6" />
        Rooms Management
      </h2>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Creating Rooms</CardTitle>
            <CardDescription>How to create and manage your rooms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">For Admins:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Navigate to Dashboard:</strong> Go to Admin Dashboard → Create Room</li>
                <li><strong>Basic Information:</strong> Fill in room name, description, and location</li>
                <li><strong>Contact Details:</strong> Add phone, email, or other contact information for users</li>
                <li><strong>Visual Appeal:</strong> Upload a high-quality room image to attract users</li>
                <li><strong>Activation:</strong> Save the room to make it active and visible to users</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Room Settings & Configuration:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Activation Control:</strong> Enable/disable room access for users</li>
                <li><strong>Information Updates:</strong> Modify room details anytime after creation</li>
                <li><strong>Activity Monitoring:</strong> View room statistics and user engagement</li>
                <li><strong>Access Management:</strong> Control user permissions and access levels</li>
                <li><strong>Customization:</strong> Add custom instructions or guidelines for users</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Room Management Features</CardTitle>
            <CardDescription>Advanced tools for room administration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Room Analytics:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Visitor Tracking:</strong> Monitor how many users visit your room</li>
                <li><strong>Engagement Metrics:</strong> Track chat interactions and user activity</li>
                <li><strong>Performance Insights:</strong> Analyze which cars generate most interest</li>
                <li><strong>Time-based Reports:</strong> View activity patterns and peak times</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Content Management:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Car Integration:</strong> Link car listings directly to your room</li>
                <li><strong>Announcement System:</strong> Post important updates or promotions</li>
                <li><strong>FAQ Section:</strong> Add common questions and answers for users</li>
                <li><strong>Document Repository:</strong> Share important documents with visitors</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Best Practices & Optimization</CardTitle>
            <CardDescription>Maximize your room's effectiveness</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Optimization Tips:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Compelling Titles:</strong> Create room names that clearly indicate your specialty</li>
                <li><strong>Detailed Descriptions:</strong> Explain what makes your inventory special</li>
                <li><strong>High-Quality Images:</strong> Use professional photos that showcase your space</li>
                <li><strong>Regular Updates:</strong> Keep room information current with new inventory</li>
                <li><strong>Active Presence:</strong> Respond promptly to user inquiries to maintain engagement</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Common Mistakes to Avoid:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Leaving room information outdated</li>
                <li>Not responding to user messages in a timely manner</li>
                <li>Using low-quality or misleading images</li>
                <li>Having inconsistent car inventory information</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCarsHelp = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Car className="h-6 w-6" />
        Car Listings
      </h2>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Adding New Cars</CardTitle>
            <CardDescription>How to create and manage car listings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">For Admins:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Access Dashboard:</strong> Go to Admin Dashboard → Add Car</li>
                <li><strong>Basic Information:</strong> Fill in car title, brand, model, and manufacturing year</li>
                <li><strong>Technical Specifications:</strong> Enter mileage, fuel type, transmission, and ownership history</li>
                <li><strong>Pricing Details:</strong> Set the asking price and any special pricing information</li>
                <li><strong>Visual Content:</strong> Upload high-quality images from multiple angles</li>
                <li><strong>Location Assignment:</strong> Select the room where the car will be listed</li>
                <li><strong>Availability Status:</strong> Set status as Available, Pending, or Sold</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Required Car Information:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Identification:</strong> Title, brand, model, year of manufacture</li>
                <li><strong>Technical Specs:</strong> Mileage, fuel type, transmission, engine details</li>
                <li><strong>Condition & History:</strong> Overall condition, ownership history, accident records</li>
                <li><strong>Financial Info:</strong> Asking price, financing options, trade-in acceptance</li>
                <li><strong>Visual Documentation:</strong> Multiple high-resolution images (exterior, interior, engine)</li>
                <li><strong>Detailed Description:</strong> Features, options, maintenance history, special notes</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Car Listing Features</CardTitle>
            <CardDescription>Advanced tools for car management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Listing Management:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Image Gallery:</strong> Upload multiple images with zoom functionality</li>
                <li><strong>Specification Editor:</strong> Add detailed technical specifications</li>
                <li><strong>Price Adjustments:</strong> Update pricing with historical tracking</li>
                <li><strong>Availability Control:</strong> Mark as available, reserved, or sold</li>
                <li><strong>Feature Highlighting:</strong> Emphasize special features or deals</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Integration Features:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Room Association:</strong> Link cars to specific rooms for targeted visibility</li>
                <li><strong>Chat Integration:</strong> Enable users to request details directly from listings</li>
                <li><strong>Booking Connection:</strong> Allow direct booking from car listings</li>
                <li><strong>Analytics Tracking:</strong> Monitor views, inquiries, and interest levels</li>
                <li><strong>Search Optimization:</strong> Make listings discoverable through filters</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Best Practices & Optimization</CardTitle>
            <CardDescription>Maximize your car listing effectiveness</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Listing Optimization Tips:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>High-Quality Photography:</strong> Use well-lit, high-resolution images from multiple angles</li>
                <li><strong>Detailed Descriptions:</strong> Include all relevant information about the car's condition</li>
                <li><strong>Accurate Specifications:</strong> Ensure all technical details are correct and complete</li>
                <li><strong>Competitive Pricing:</strong> Research market values for similar vehicles</li>
                <li><strong>Regular Updates:</strong> Keep listings current and mark sold cars immediately</li>
                <li><strong>Honest Representation:</strong> Be transparent about any issues or needed repairs</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Common Mistakes to Avoid:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Using low-quality or misleading photos</li>
                <li>Omitting important details about the car's condition</li>
                <li>Setting unrealistic prices that don't match market value</li>
                <li>Failing to update availability status when a car is sold</li>
                <li>Providing incomplete or inaccurate technical specifications</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderBookingsHelp = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Calendar className="h-6 w-6" />
        Bookings & Payments
      </h2>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>For Users</CardTitle>
            <CardDescription>How to book cars and manage payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Booking Process:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Car Discovery:</strong> Browse available cars in various rooms to find your preferred vehicle</li>
                <li><strong>Detail Review:</strong> Click on any car to view complete specifications, images, and pricing</li>
                <li><strong>Booking Initiation:</strong> Click "Book Now" to start the reservation process</li>
                <li><strong>Booking Configuration:</strong> Select preferred dates and confirm all booking details</li>
                <li><strong>Secure Payment:</strong> Proceed to payment to secure your booking with encrypted processing</li>
                <li><strong>Confirmation:</strong> Receive booking confirmation and details via email and in your profile</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Payment Process:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Secure Processing:</strong> All payments are processed through encrypted, secure channels</li>
                <li><strong>Multiple Options:</strong> Choose from various supported payment methods</li>
                <li><strong>Instant Confirmation:</strong> Receive immediate payment confirmation upon successful transaction</li>
                <li><strong>Receipt Management:</strong> Access digital receipts and transaction records in your profile</li>
                <li><strong>Status Tracking:</strong> Monitor payment status and booking progress in your dashboard</li>
                <li><strong>Refund Policy:</strong> Understand cancellation and refund terms before booking</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>For Admins</CardTitle>
            <CardDescription>Managing bookings and payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Booking Management:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Booking Dashboard:</strong> View all reservations for your listed cars in a centralized dashboard</li>
                <li><strong>Request Handling:</strong> Approve, modify, or respond to booking requests from users</li>
                <li><strong>Status Tracking:</strong> Monitor payment statuses and booking progression</li>
                <li><strong>Information Updates:</strong> Update booking details as needed with proper notifications</li>
                <li><strong>Sales Processing:</strong> Handle completed sales and update inventory accordingly</li>
                <li><strong>Communication:</strong> Keep users informed about booking status changes</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Payment Handling:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Payment Review:</strong> Access and review all payment confirmations for your cars</li>
                <li><strong>Admin Approval:</strong> Process necessary administrative approvals for transactions</li>
                <li><strong>Document Verification:</strong> Use scanner feature to verify payment and identity documents</li>
                <li><strong>Dispute Resolution:</strong> Manage any payment disputes or issues that may arise</li>
                <li><strong>Financial Reporting:</strong> Track revenue and transaction history for business analysis</li>
                <li><strong>Record Keeping:</strong> Maintain comprehensive records of all transactions</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Security & Policies</CardTitle>
            <CardDescription>Important information about payment processing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Security Features:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Encryption:</strong> All payment data is encrypted during transmission and storage</li>
                <li><strong>PCI Compliance:</strong> Payment processing meets industry security standards</li>
                <li><strong>Secure Storage:</strong> Payment information is not stored on our servers</li>
                <li><strong>Fraud Protection:</strong> Advanced systems monitor for suspicious activities</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Policies & Procedures:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Cancellation Terms:</strong> Understand the cancellation policy before making a booking</li>
                <li><strong>Refund Process:</strong> Learn how refunds are processed and timeframes</li>
                <li><strong>Payment Methods:</strong> Check which payment methods are accepted</li>
                <li><strong>Dispute Resolution:</strong> Know the process if you encounter payment issues</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderProfileHelp = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <User className="h-6 w-6" />
        Profile & Security
      </h2>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Management</CardTitle>
            <CardDescription>Updating your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">General Profile Information:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Personal Details:</strong> Update your username, phone number, and location information</li>
                <li><strong>Profile Picture:</strong> Upload a clear, recognizable profile image</li>
                <li><strong>Favorites Management:</strong> Save and organize your preferred cars and rooms</li>
                <li><strong>Account Statistics:</strong> View your activity metrics and booking history</li>
                <li><strong>Contact Information:</strong> Keep your contact details current for important notifications</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Role-Specific Features:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>For Admins:</strong> Upload scanner image for document verification processes</li>
                <li><strong>Admin Settings:</strong> Manage admin-specific profile configurations</li>
                <li><strong>Room Contact Info:</strong> Update contact information that appears in your rooms</li>
                <li><strong>Business Details:</strong> Add business information for customer reference</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Managing account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Password Management:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Regular Updates:</strong> Change your password regularly for enhanced security</li>
                <li><strong>Strong Passwords:</strong> Use complex passwords with letters, numbers, and special characters</li>
                <li><strong>Unique Credentials:</strong> Avoid using the same password across multiple platforms</li>
                <li><strong>Session Management:</strong> Log out of inactive sessions, especially on shared devices</li>
                <li><strong>Security Notifications:</strong> Enable alerts for password changes and account access</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Account Security Features:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Login Activity:</strong> Monitor recent login attempts and locations</li>
                <li><strong>Connected Devices:</strong> Review and manage devices logged into your account</li>
                <li><strong>Security Alerts:</strong> Receive notifications for suspicious account activity</li>
                <li><strong>Two-Factor Authentication:</strong> Enable additional security layer when available</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy & Data Management</CardTitle>
            <CardDescription>Controlling your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Privacy Controls:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Profile Visibility:</strong> Control what information is visible to other users</li>
                <li><strong>Data Sharing:</strong> Manage how your information is used for recommendations</li>
                <li><strong>Communication Preferences:</strong> Select which notifications you receive</li>
                <li><strong>Information Access:</strong> Review what data is collected and stored</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Data Management:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Export Data:</strong> Download a copy of your account information</li>
                <li><strong>Account Deletion:</strong> Understand the process for permanently deleting your account</li>
                <li><strong>Booking History:</strong> Access and manage your complete booking and payment history</li>
                <li><strong>Chat Records:</strong> Review your communication history with other users</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAuthHelp = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Key className="h-6 w-6" />
        Authentication & Account Security
      </h2>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Login Process</CardTitle>
            <CardDescription>How to securely access your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Standard Login:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Email & Password:</strong> Use your registered email and password combination</li>
                <li><strong>Multi-Device Access:</strong> Access your account from any device with internet connection</li>
                <li><strong>Secure Sessions:</strong> Benefit from encrypted session management</li>
                <li><strong>Session Management:</strong> Log out properly, especially on shared or public devices</li>
                <li><strong>Account Recovery:</strong> Use password reset if you forget your credentials</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Security Best Practices:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Never share your login credentials with others</li>
                <li>Use strong, unique passwords for your account</li>
                <li>Be cautious when logging in on public networks</li>
                <li>Regularly check your account activity for unauthorized access</li>
                <li>Enable additional security measures when available</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registration Process</CardTitle>
            <CardDescription>Creating a new account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Account Creation Steps:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Email Verification:</strong> Provide a valid email address for account verification</li>
                <li><strong>Secure Password:</strong> Create a strong password with letters, numbers, and special characters</li>
                <li><strong>OTP Verification:</strong> Complete email verification through One-Time Password (OTP)</li>
                <li><strong>Profile Setup:</strong> Complete your profile information for better experience</li>
                <li><strong>Role Selection:</strong> Choose the appropriate role during registration (user/admin)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Registration Requirements:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>A valid email address that you have access to</li>
                <li>Compliance with platform terms and conditions</li>
                <li>Accurate information during registration process</li>
                <li>Agreement to privacy policy and data usage terms</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password Management</CardTitle>
            <CardDescription>Resetting and changing passwords</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Forgot Password Process:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Initiate Reset:</strong> Click "Forgot Password" link on the login page</li>
                <li><strong>Email Verification:</strong> Enter your registered email address</li>
                <li><strong>Email Confirmation:</strong> Check your email (including spam folder) for reset instructions</li>
                <li><strong>Secure Link:</strong> Click the secure reset link in the email (valid for 1 hour)</li>
                <li><strong>Create New Password:</strong> Enter a new, strong password in the reset form</li>
                <li><strong>Confirmation:</strong> Password is updated and you can log in with new credentials</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Change Password in Profile:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Access Profile:</strong> Go to your profile page and navigate to Security tab</li>
                <li><strong>Current Password:</strong> Enter your current password for verification</li>
                <li><strong>New Password:</strong> Enter your new password twice for confirmation</li>
                <li><strong>Save Changes:</strong> Click "Update Password" to save the new credentials</li>
                <li><strong>Security Notice:</strong> This feature is not available for superadmin accounts</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Password Security Guidelines:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Use at least 8 characters with a mix of uppercase, lowercase, numbers, and symbols</li>
                <li>Avoid common words, personal information, or predictable patterns</li>
                <li>Do not reuse passwords from other accounts</li>
                <li>Change passwords regularly, especially if you suspect compromise</li>
                <li>Use a reputable password manager for secure credential storage</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAdminHelp = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Shield className="h-6 w-6" />
        Admin & Superadmin Features
      </h2>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>Managing your administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Dashboard Overview:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Performance Metrics:</strong> View comprehensive statistics for your rooms and car listings</li>
                <li><strong>Booking Analytics:</strong> Monitor booking activity, revenue, and conversion rates</li>
                <li><strong>User Engagement:</strong> Track user interactions, inquiries, and chat activity</li>
                <li><strong>Inventory Management:</strong> Get an overview of your car inventory and availability</li>
                <li><strong>Revenue Tracking:</strong> Monitor income from bookings and sales</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Admin Tools & Features:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Room Management:</strong> Create, edit, and monitor your rooms</li>
                <li><strong>Car Management:</strong> Add, update, and manage your car listings</li>
                <li><strong>Booking Oversight:</strong> Review and manage all booking requests</li>
                <li><strong>Payment Monitoring:</strong> Track payment confirmations and processing</li>
                <li><strong>Chat Management:</strong> Monitor and participate in conversations</li>
                <li><strong>User Communication:</strong> Send announcements or updates to users</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Superadmin Features</CardTitle>
            <CardDescription>Advanced system management capabilities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">System Management:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Global User Management:</strong> Manage all users across the entire platform</li>
                <li><strong>Platform Oversight:</strong> Monitor all rooms, car listings, and activities</li>
                <li><strong>Performance Monitoring:</strong> Track system performance and usage metrics</li>
                <li><strong>Configuration Control:</strong> Configure system-wide settings and parameters</li>
                <li><strong>Admin Account Management:</strong> Create, modify, or suspend admin accounts</li>
                <li><strong>Content Moderation:</strong> Review and manage platform content</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Advanced Controls:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>System Configuration:</strong> Adjust platform settings and features</li>
                <li><strong>Security Management:</strong> Implement security policies and monitor threats</li>
                <li><strong>Data Analytics:</strong> Access comprehensive platform analytics and reports</li>
                <li><strong>User Support:</strong> Handle escalated user issues and support requests</li>
                <li><strong>API Management:</strong> Configure and monitor API access and integrations</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Best Practices</CardTitle>
            <CardDescription>Optimizing your administrative experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Admin Optimization:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Regular Monitoring:</strong> Check your dashboard regularly for new activity</li>
                <li><strong>Responsive Communication:</strong> Respond promptly to user inquiries</li>
                <li><strong>Inventory Updates:</strong> Keep car listings current and accurate</li>
                <li><strong>Performance Tracking:</strong> Monitor your metrics to improve business</li>
                <li><strong>Security Vigilance:</strong> Maintain strong security practices</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Superadmin Guidelines:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>System Integrity:</strong> Ensure platform stability and security</li>
                <li><strong>User Privacy:</strong> Respect user data and privacy regulations</li>
                <li><strong>Documentation:</strong> Maintain proper records of administrative actions</li>
                <li><strong>Communication:</strong> Coordinate with other admins as needed</li>
                <li><strong>Updates & Maintenance:</strong> Schedule and perform system updates</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderRoleSpecificGuides = () => <RoleGuides />;

  const renderMainHelp = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to CarSelling Platform Help Center</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Find answers to common questions and learn how to make the most of our platform. 
          Select a topic from the categories below to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {helpSections.map((section) => {
          const IconComponent = section.icon;
          return (
            <Card 
              key={section.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedSection(section.id)}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${section.color}`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <CardTitle className="flex items-center justify-between">
                  {section.title}
                  <ChevronRight className="h-4 w-4" />
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Available for: {section.roles.join(', ')}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Need More Help?</CardTitle>
          <CardDescription>
            Can't find what you're looking for? Contact our support team for personalized assistance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="w-full sm:w-auto">
              <Mail className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              <FileText className="h-4 w-4 mr-2" />
              View Documentation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    if (!selectedSection) {
      return renderMainHelp();
    }

    switch (selectedSection) {
      case 'chat':
        return renderChatAssistantHelp();
      case 'rooms':
        return renderRoomsHelp();
      case 'cars':
        return renderCarsHelp();
      case 'bookings':
        return renderBookingsHelp();
      case 'profile':
        return renderProfileHelp();
      case 'auth':
        return renderAuthHelp();
      case 'admin':
        return renderAdminHelp();
      case 'roles':
        return renderRoleSpecificGuides();
      default:
        return renderMainHelp();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {selectedSection && (
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedSection(null)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Help Topics
            </Button>
          </div>
        )}
        
        {renderContent()}
      </div>
    </div>
  );
}