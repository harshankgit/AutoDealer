'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Car, LogOut, User, Menu, X, MessageCircle, Bell, HelpCircle, Home, Settings, Shield, Heart, Sparkles, ChevronDown } from 'lucide-react';
import { useUser } from '@/context/user-context'; // Corrected import path
import NotificationBadge from '@/components/realtime/NotificationBadge';
import ProfileDropdown from '@/components/user/ProfileDropdown';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllowedNavigationItems } from '@/lib/roleUtils';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCarsDropdownOpen, setIsCarsDropdownOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useUser(); // Use the global user context

  // Get allowed navigation items based on user role
  const allowedNavItems = getAllowedNavigationItems(user?.role);

  const handleLogout = () => {
    // Use logout from context
    logout();
    router.push('/');
  };

  // Animation variants for mobile menu
  const mobileMenuVariants = {
    closed: {
      height: 0,
      opacity: 0,
      overflow: 'hidden'
    },
    open: {
      height: 'auto',
      opacity: 1,
      overflow: 'visible',
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1] as const
      }
    }
  };

  // Animation variants for menu items
  const menuItemVariants = {
    closed: {
      opacity: 0,
      x: -20
    },
    open: (index: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: index * 0.05,
        duration: 0.2
      }
    })
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">AutoDealer</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Main Navigation Links with Dropdowns */}
            <div className="relative">
              <Button
                variant="ghost"
                className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-all duration-200 group text-sm px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800"
                onMouseEnter={() => setIsCarsDropdownOpen(true)}
                onMouseLeave={() => setIsCarsDropdownOpen(false)}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="mr-2"
                >
                  <Car className="h-4 w-4" />
                </motion.div>
                <span className="font-medium">Cars</span>
                <motion.div
                  animate={{ rotate: isCarsDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-1"
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </Button>

              <AnimatePresence>
                {isCarsDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute left-0 mt-2 w-60 bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                    onMouseEnter={() => setIsCarsDropdownOpen(true)}
                    onMouseLeave={() => setIsCarsDropdownOpen(false)}
                  >
                    <div className="py-2">
                      <Link
                        href="/rooms"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150"
                        onClick={() => setIsCarsDropdownOpen(false)}
                      >
                        <motion.div
                          whileHover={{ x: 4 }}
                          className="mr-3"
                        >
                          <Home className="h-4 w-4 text-blue-500" />
                        </motion.div>
                        <div>
                          <div className="font-medium">Browse Rooms</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Explore showrooms</div>
                        </div>
                      </Link>
                      <Link
                        href="/find-perfect-car"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150"
                        onClick={() => setIsCarsDropdownOpen(false)}
                      >
                        <motion.div
                          whileHover={{ x: 4 }}
                          className="mr-3"
                        >
                          <Car className="h-4 w-4 text-blue-500" />
                        </motion.div>
                        <div>
                          <div className="font-medium">Find Perfect Car</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">AI-powered recommendations</div>
                        </div>
                      </Link>
                      <Link
                        href="/estimate-car-value"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150"
                        onClick={() => setIsCarsDropdownOpen(false)}
                      >
                        <motion.div
                          whileHover={{ x: 4 }}
                          className="mr-3"
                        >
                          <Sparkles className="h-4 w-4 text-blue-500" />
                        </motion.div>
                        <div>
                          <div className="font-medium">AI Price Check</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Instant valuation</div>
                        </div>
                      </Link>
                      <Link
                        href="/advanced-car-prediction"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150"
                        onClick={() => setIsCarsDropdownOpen(false)}
                      >
                        <motion.div
                          whileHover={{ x: 4 }}
                          className="mr-3"
                        >
                          <Sparkles className="h-4 w-4 text-purple-500" />
                        </motion.div>
                        <div>
                          <div className="font-medium">Advanced Prediction</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Detailed analysis</div>
                        </div>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {(allowedNavItems.showChatSystem || allowedNavItems.showManageShowroom || allowedNavItems.showSuperAdmin) && (
              <div className="relative">
                <Button
                  variant="ghost"
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-all duration-200 group text-sm px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800"
                  onMouseEnter={() => setIsServicesDropdownOpen(true)}
                  onMouseLeave={() => setIsServicesDropdownOpen(false)}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="mr-2"
                  >
                    <Settings className="h-4 w-4" />
                  </motion.div>
                  <span className="font-medium">Services</span>
                  <motion.div
                    animate={{ rotate: isServicesDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-1"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </Button>

                <AnimatePresence>
                  {isServicesDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute left-0 mt-2 w-60 bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                      onMouseEnter={() => setIsServicesDropdownOpen(true)}
                      onMouseLeave={() => setIsServicesDropdownOpen(false)}
                    >
                      <div className="py-2">
                        {allowedNavItems.showChatSystem && (
                          <Link
                            href="/dashboard"
                            className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150"
                            onClick={() => setIsServicesDropdownOpen(false)}
                          >
                            <motion.div
                              whileHover={{ x: 4 }}
                              className="mr-3"
                            >
                              <MessageCircle className="h-4 w-4 text-blue-500" />
                            </motion.div>
                            <div>
                              <div className="font-medium">Chat System</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Real-time communication</div>
                            </div>
                          </Link>
                        )}
                        {allowedNavItems.showManageShowroom && (
                          <Link
                            href="/admin"
                            className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150"
                            onClick={() => setIsServicesDropdownOpen(false)}
                          >
                            <motion.div
                              whileHover={{ x: 4 }}
                              className="mr-3"
                            >
                              <Settings className="h-4 w-4 text-blue-500" />
                            </motion.div>
                            <div>
                              <div className="font-medium">Manage Showroom</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Admin panel</div>
                            </div>
                          </Link>
                        )}
                        {allowedNavItems.showSuperAdmin && (
                          <Link
                            href="/admin/superadmin"
                            className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150"
                            onClick={() => setIsServicesDropdownOpen(false)}
                          >
                            <motion.div
                              whileHover={{ x: 4 }}
                              className="mr-3"
                            >
                              <Shield className="h-4 w-4 text-blue-500" />
                            </motion.div>
                            <div>
                              <div className="font-medium">Super Admin</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">System management</div>
                            </div>
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* User-specific navigation */}
            {user ? (
              <div className="flex items-center space-x-1">
                {/* Account dropdown */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-all duration-200 group text-sm px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800"
                    onMouseEnter={() => setIsAccountDropdownOpen(true)}
                    onMouseLeave={() => setIsAccountDropdownOpen(false)}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="mr-2"
                    >
                      <User className="h-4 w-4" />
                    </motion.div>
                    <span className="font-medium">Account</span>
                    <motion.div
                      animate={{ rotate: isAccountDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-1"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  </Button>

                  <AnimatePresence>
                    {isAccountDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute left-0 mt-2 w-60 bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                        onMouseEnter={() => setIsAccountDropdownOpen(true)}
                        onMouseLeave={() => setIsAccountDropdownOpen(false)}
                      >
                        <div className="py-2">
                          {allowedNavItems.showFavorites && (
                            <Link
                              href="/favorites"
                              className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150"
                              onClick={() => setIsAccountDropdownOpen(false)}
                            >
                              <motion.div
                                whileHover={{ x: 4 }}
                                className="mr-3"
                              >
                                <Heart className="h-4 w-4 text-blue-500" />
                              </motion.div>
                              <div>
                                <div className="font-medium">Favorites</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Saved cars</div>
                              </div>
                            </Link>
                          )}
                          {allowedNavItems.showBookings && (
                            <Link
                              href="/bookings"
                              className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150"
                              onClick={() => setIsAccountDropdownOpen(false)}
                            >
                              <motion.div
                                whileHover={{ x: 4 }}
                                className="mr-3"
                              >
                                <Car className="h-4 w-4 text-blue-500" />
                              </motion.div>
                              <div>
                                <div className="font-medium">Bookings</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Your appointments</div>
                              </div>
                            </Link>
                          )}
                          {allowedNavItems.showManageBookings && (
                            <Link
                              href="/admin/bookings"
                              className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150"
                              onClick={() => setIsAccountDropdownOpen(false)}
                            >
                              <motion.div
                                whileHover={{ x: 4 }}
                                className="mr-3"
                              >
                                <Car className="h-4 w-4 text-purple-500" />
                              </motion.div>
                              <div>
                                <div className="font-medium">Manage Bookings</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Manage all appointments</div>
                              </div>
                            </Link>
                          )}
                          {allowedNavItems.showNotifications && (
                            <Link
                              href="/notifications"
                              className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150"
                              onClick={() => setIsAccountDropdownOpen(false)}
                            >
                              <motion.div
                                whileHover={{ x: 4 }}
                                className="mr-3"
                              >
                                <Bell className="h-4 w-4 text-blue-500" />
                              </motion.div>
                              <div>
                                <div className="font-medium">Notifications</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Updates & alerts</div>
                              </div>
                            </Link>
                          )}
                          <Link
                            href="/profile"
                            className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150"
                            onClick={() => setIsAccountDropdownOpen(false)}
                          >
                            <motion.div
                              whileHover={{ x: 4 }}
                              className="mr-3"
                            >
                              <User className="h-4 w-4 text-blue-500" />
                            </motion.div>
                            <div>
                              <div className="font-medium">Profile</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Account settings</div>
                            </div>
                          </Link>
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsAccountDropdownOpen(false);
                            }}
                            className="w-full text-left flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
                          >
                            <motion.div
                              whileHover={{ x: 4 }}
                              className="mr-3"
                            >
                              <LogOut className="h-4 w-4 text-red-500" />
                            </motion.div>
                            <div>
                              <div className="font-medium">Logout</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Sign out</div>
                            </div>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <ProfileDropdown />

                <Link href="/help" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200 group text-sm">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="mr-2"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </motion.div>
                  <span className="font-medium">Help</span>
                </Link>

                <div className="px-1 py-1 rounded hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ThemeToggle />
                  </motion.div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <Link href="/help" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200 group text-sm">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="mr-2"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </motion.div>
                  <span className="font-medium">Help</span>
                </Link>

                <Link href="/login" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200 group text-sm">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="mr-2"
                  >
                    <User className="h-4 w-4" />
                  </motion.div>
                  <span className="font-medium">Login</span>
                </Link>

                <Link href="/register" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200 group text-sm">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="mr-2"
                  >
                    <User className="h-4 w-4" />
                  </motion.div>
                  <span className="font-medium">Register</span>
                </Link>

                <div className="px-1 py-1 rounded hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ThemeToggle />
                  </motion.div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <div className="px-1 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ThemeToggle />
              </motion.div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={mobileMenuVariants}
              className="md:hidden border-t bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <motion.div
                  custom={0}
                  variants={menuItemVariants}
                  initial="closed"
                  animate="open"
                >
                  <Link
                    href="/rooms"
                    className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    <span>Browse Rooms</span>
                  </Link>
                </motion.div>

                <motion.div
                  custom={1}
                  variants={menuItemVariants}
                  initial="closed"
                  animate="open"
                >
                  <Link
                    href="/find-perfect-car"
                    className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Car className="h-4 w-4 mr-2" />
                    <span>Find Perfect Car</span>
                  </Link>
                </motion.div>

                <motion.div
                  custom={2}
                  variants={menuItemVariants}
                  initial="closed"
                  animate="open"
                >
                  <Link
                    href="/estimate-car-value"
                    className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    <span>AI Price Check</span>
                  </Link>
                </motion.div>
                <motion.div
                  custom={3}
                  variants={menuItemVariants}
                  initial="closed"
                  animate="open"
                >
                  <Link
                    href="/advanced-car-prediction"
                    className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                    <span>Advanced Prediction</span>
                  </Link>
                </motion.div>

                {user ? (
                  <>
                    {(allowedNavItems.showChatSystem || allowedNavItems.showManageShowroom || allowedNavItems.showSuperAdmin) && (
                      <>
                        {allowedNavItems.showChatSystem && (
                          <motion.div
                            custom={4}
                            variants={menuItemVariants}
                            initial="closed"
                            animate="open"
                          >
                            <Link
                              href="/dashboard"
                              className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              <span>Chat System</span>
                            </Link>
                          </motion.div>
                        )}
                        {allowedNavItems.showManageShowroom && (
                          <motion.div
                            custom={5}
                            variants={menuItemVariants}
                            initial="closed"
                            animate="open"
                          >
                            <Link
                              href="/admin"
                              className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              <span>Manage Your Showroom</span>
                            </Link>
                          </motion.div>
                        )}
                        {allowedNavItems.showSuperAdmin && (
                          <motion.div
                            custom={6}
                            variants={menuItemVariants}
                            initial="closed"
                            animate="open"
                          >
                            <Link
                              href="/admin/superadmin"
                              className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              <span>Super Admin</span>
                            </Link>
                          </motion.div>
                        )}
                      </>
                    )}
                    {allowedNavItems.showFavorites && (
                      <motion.div
                        custom={7}
                        variants={menuItemVariants}
                        initial="closed"
                        animate="open"
                      >
                        <Link
                          href="/favorites"
                          className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          <span>Favorites</span>
                        </Link>
                      </motion.div>
                    )}
                    {allowedNavItems.showBookings && (
                      <motion.div
                        custom={8}
                        variants={menuItemVariants}
                        initial="closed"
                        animate="open"
                      >
                        <Link
                          href="/bookings"
                          className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Car className="h-4 w-4 mr-2" />
                          <span>Bookings</span>
                        </Link>
                      </motion.div>
                    )}
                    {allowedNavItems.showManageBookings && (
                      <motion.div
                        custom={8.5}
                        variants={menuItemVariants}
                        initial="closed"
                        animate="open"
                      >
                        <Link
                          href="/admin/bookings"
                          className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Car className="h-4 w-4 mr-2 text-purple-500" />
                          <span>Manage Bookings</span>
                        </Link>
                      </motion.div>
                    )}
                    {allowedNavItems.showNotifications && (
                      <motion.div
                        custom={9.5}
                        variants={menuItemVariants}
                        initial="closed"
                        animate="open"
                      >
                        <Link
                          href="/notifications"
                          className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Bell className="h-4 w-4 mr-2" />
                          <span>Notifications</span>
                        </Link>
                      </motion.div>
                    )}

                    <motion.div
                      custom={10.5}
                      variants={menuItemVariants}
                      initial="closed"
                      animate="open"
                    >
                      <Link
                        href="/profile"
                        className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        <span>Profile</span>
                      </Link>
                    </motion.div>

                    <motion.div
                      custom={11.5}
                      variants={menuItemVariants}
                      initial="closed"
                      animate="open"
                    >
                      <Link
                        href="/help"
                        className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <HelpCircle className="h-4 w-4 mr-2" />
                        <span>Help & Support</span>
                      </Link>
                    </motion.div>

                    <motion.div
                      custom={12.5}
                      variants={menuItemVariants}
                      initial="closed"
                      animate="open"
                    >
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div
                      custom={3}
                      variants={menuItemVariants}
                      initial="closed"
                      animate="open"
                    >
                      <Link
                        href="/help"
                        className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <HelpCircle className="h-4 w-4 mr-2" />
                        <span>Help & Support</span>
                      </Link>
                    </motion.div>
                    <motion.div
                      custom={4}
                      variants={menuItemVariants}
                      initial="closed"
                      animate="open"
                    >
                      <Link
                        href="/login"
                        className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        <span>Login</span>
                      </Link>
                    </motion.div>
                    <motion.div
                      custom={5}
                      variants={menuItemVariants}
                      initial="closed"
                      animate="open"
                    >
                      <Link
                        href="/register"
                        className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        <span>Register</span>
                      </Link>
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}