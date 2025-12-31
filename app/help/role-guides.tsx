import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, User, Car, MessageCircle, Home, Calendar, CreditCard, Key, CheckCircle, XCircle, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

const renderRoleSpecificGuides = () => (
  <div className="space-y-6">
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-3"
    >
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
        <User className="h-6 w-6 text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-bold">Role-Specific Feature Guides</h2>
        <p className="text-gray-600 dark:text-gray-300">Detailed guides for each user role on the platform</p>
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-1 gap-6"
    >
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">User Guide</CardTitle>
              <CardDescription>Complete guide for regular platform users</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              As a User, you can:
            </h3>
            <ul className="space-y-2">
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="mt-1 bg-blue-100 dark:bg-blue-900/50 p-1 rounded-full">
                  <Car className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <span><strong>Room Browsing:</strong> Explore various rooms to find cars that match your preferences</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="mt-1 bg-blue-100 dark:bg-blue-900/50 p-1 rounded-full">
                  <Car className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <span><strong>Car Discovery:</strong> Browse detailed car listings with images and specifications</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <div className="mt-1 bg-blue-100 dark:bg-blue-900/50 p-1 rounded-full">
                  <MessageCircle className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <span><strong>Real-time Chat:</strong> Communicate with admins to ask questions about specific cars</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <div className="mt-1 bg-blue-100 dark:bg-blue-900/50 p-1 rounded-full">
                  <Calendar className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <span><strong>Booking Management:</strong> Book cars that interest you and track your reservations</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <div className="mt-1 bg-blue-100 dark:bg-blue-900/50 p-1 rounded-full">
                  <CreditCard className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <span><strong>Secure Payments:</strong> Complete transactions with encrypted payment processing</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <div className="mt-1 bg-blue-100 dark:bg-blue-900/50 p-1 rounded-full">
                  <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <span><strong>Profile Management:</strong> Update your personal information and preferences</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
              >
                <div className="mt-1 bg-blue-100 dark:bg-blue-900/50 p-1 rounded-full">
                  <Key className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <span><strong>Favorite System:</strong> Save cars and rooms for quick access later</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.8 }}
              >
                <div className="mt-1 bg-blue-100 dark:bg-blue-900/50 p-1 rounded-full">
                  <Calendar className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <span><strong>Booking History:</strong> Review your past bookings and payments</span>
              </motion.li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Best Practices for Users:
            </h3>
            <ul className="space-y-2">
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.9 }}
              >
                <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                  <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span>Be specific about your car preferences when chatting with admins</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 1.0 }}
              >
                <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                  <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span>Ask detailed questions about car condition and history</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 1.1 }}
              >
                <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                  <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span>Review all booking details before confirming</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 1.2 }}
              >
                <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                  <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span>Keep your contact information updated for important notifications</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 1.3 }}
              >
                <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                  <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span>Check your email regularly for booking confirmations and updates</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 1.4 }}
              >
                <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                  <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span>Provide feedback about your experience to help improve the platform</span>
              </motion.li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-900">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
              <Home className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Admin Guide</CardTitle>
              <CardDescription>Complete guide for platform administrators</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Home className="h-4 w-4 text-green-500" />
              As an Admin, you can:
            </h3>
            <ul className="space-y-2">
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                  <Home className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span><strong>Room Management:</strong> Create, update, and manage your rooms for users</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                  <Car className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span><strong>Car Listings:</strong> Add and manage detailed car listings with images and specs</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                  <MessageCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span><strong>Customer Interaction:</strong> Chat with users to answer questions and provide information</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                  <Calendar className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span><strong>Booking Oversight:</strong> Manage and process booking requests from users</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                  <CreditCard className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span><strong>Payment Processing:</strong> Handle payment confirmations and document verification</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                  <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span><strong>Scanner Verification:</strong> Use scanner feature to verify user documents</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
              >
                <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                  <Car className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span><strong>Analytics Dashboard:</strong> Monitor room performance and user engagement</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.8 }}
              >
                <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                  <Car className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span><strong>Content Management:</strong> Update room information and car availability</span>
              </motion.li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Best Practices for Admins:
            </h3>
            <ul className="space-y-2">
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.9 }}
              >
                <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                  <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span>Respond promptly to user inquiries to maintain engagement</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 1.0 }}
              >
                <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                  <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span>Keep car listings current and accurately reflect availability</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 1.1 }}
              >
                <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                  <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span>Use high-quality images and detailed descriptions for better conversions</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 1.2 }}
              >
                <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                  <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span>Monitor your dashboard regularly to track performance metrics</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 1.3 }}
              >
                <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                  <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span>Verify all documents through the scanner feature for security</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 1.4 }}
              >
                <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                  <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span>Keep room information updated with current inventory</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 1.5 }}
              >
                <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                  <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span>Provide excellent customer service to build trust</span>
              </motion.li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-gray-900">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Superadmin Guide</CardTitle>
              <CardDescription>Complete guide for platform super administrators</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-500" />
              As a Superadmin, you can:
            </h3>
            <ul className="space-y-2">
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="mt-1 bg-orange-100 dark:bg-orange-900/50 p-1 rounded-full">
                  <User className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                </div>
                <span><strong>Global User Management:</strong> Manage all users across the entire platform</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="mt-1 bg-orange-100 dark:bg-orange-900/50 p-1 rounded-full">
                  <Home className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                </div>
                <span><strong>System Oversight:</strong> Monitor all rooms, cars, and platform activity</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <div className="mt-1 bg-orange-100 dark:bg-orange-900/50 p-1 rounded-full">
                  <Shield className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                </div>
                <span><strong>Admin Management:</strong> Create, modify, or suspend admin accounts</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <div className="mt-1 bg-orange-100 dark:bg-orange-900/50 p-1 rounded-full">
                  <Key className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                </div>
                <span><strong>Configuration Control:</strong> Adjust system-wide settings and parameters</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <div className="mt-1 bg-orange-100 dark:bg-orange-900/50 p-1 rounded-full">
                  <CheckCircle className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                </div>
                <span><strong>Content Moderation:</strong> Review and manage platform content</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <div className="mt-1 bg-orange-100 dark:bg-orange-900/50 p-1 rounded-full">
                  <Car className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                </div>
                <span><strong>Performance Monitoring:</strong> Track system performance and usage metrics</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
              >
                <div className="mt-1 bg-orange-100 dark:bg-orange-900/50 p-1 rounded-full">
                  <Shield className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                </div>
                <span><strong>Security Management:</strong> Implement security policies and monitor threats</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.8 }}
              >
                <div className="mt-1 bg-orange-100 dark:bg-orange-900/50 p-1 rounded-full">
                  <Key className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                </div>
                <span><strong>System Configuration:</strong> Configure platform settings and integrations</span>
              </motion.li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Best Practices for Superadmins:
            </h3>
            <ul className="space-y-2">
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.9 }}
              >
                <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                  <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span>Maintain platform integrity and security at all times</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 1.0 }}
              >
                <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                  <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span>Respect user privacy and handle data according to regulations</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 1.1 }}
              >
                <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                  <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span>Document administrative actions for accountability</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 1.2 }}
              >
                <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                  <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span>Coordinate with admins for smooth platform operation</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 1.3 }}
              >
                <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                  <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span>Schedule system updates during low-usage periods</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 1.4 }}
              >
                <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                  <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span>Monitor for security threats and suspicious activities</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 1.5 }}
              >
                <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                  <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span>Provide support to admins when needed</span>
              </motion.li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-lg">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Feature Comparison by Role</CardTitle>
              <CardDescription>Overview of features available to each user role</CardDescription>
            </div>
          </div>
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
                  <td className="text-center py-2"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                  <td className="text-center py-2"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> (Own)</td>
                  <td className="text-center py-2"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> (All)</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Car Browsing</td>
                  <td className="text-center py-2"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                  <td className="text-center py-2"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> (Own)</td>
                  <td className="text-center py-2"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> (All)</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Car Management</td>
                  <td className="text-center py-2"><XCircle className="h-4 w-4 text-red-500 mx-auto" /></td>
                  <td className="text-center py-2"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                  <td className="text-center py-2"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Booking Management</td>
                  <td className="text-center py-2">View Own</td>
                  <td className="text-center py-2"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> (Own Cars)</td>
                  <td className="text-center py-2"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> (All)</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Chat Communication</td>
                  <td className="text-center py-2"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                  <td className="text-center py-2"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                  <td className="text-center py-2"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Room Creation</td>
                  <td className="text-center py-2"><XCircle className="h-4 w-4 text-red-500 mx-auto" /></td>
                  <td className="text-center py-2"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                  <td className="text-center py-2"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">User Management</td>
                  <td className="text-center py-2"><XCircle className="h-4 w-4 text-red-500 mx-auto" /></td>
                  <td className="text-center py-2">Limited</td>
                  <td className="text-center py-2"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> (Full)</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">System Configuration</td>
                  <td className="text-center py-2"><XCircle className="h-4 w-4 text-red-500 mx-auto" /></td>
                  <td className="text-center py-2"><XCircle className="h-4 w-4 text-red-500 mx-auto" /></td>
                  <td className="text-center py-2"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  </div>
);

export default renderRoleSpecificGuides;