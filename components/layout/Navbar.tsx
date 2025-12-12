'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Car, LogOut, User, Menu, X, MessageCircle, Bell, HelpCircle, Home, Settings, Shield, Heart } from 'lucide-react';
import { useUser } from '@/context/user-context'; // Corrected import path
import NotificationBadge from '@/components/realtime/NotificationBadge';
import ProfileDropdown from '@/components/user/ProfileDropdown';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useUser(); // Use the global user context

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
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/rooms" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-all duration-300 group">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="mr-1"
              >
                <Home className="h-4 w-4" />
              </motion.div>
              <span>Browse Rooms</span>
            </Link>

            {user ? (
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-4">
                  {user.role === 'admin' && (
                    <>
                      <Link href="/dashboard" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-all duration-300 group">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="mr-1"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </motion.div>
                        <span>Chat System</span>
                      </Link>
                      <Link href="/admin" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-all duration-300 group">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="mr-1"
                        >
                          <Settings className="h-4 w-4" />
                        </motion.div>
                        <span>Manage Showroom</span>
                      </Link>
                    </>
                  )}
                  {user.role === 'superadmin' && (
                    <>
                      <Link href="/dashboard" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-all duration-300 group">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="mr-1"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </motion.div>
                        <span>Chat System</span>
                      </Link>
                      <Link href="/admin/superadmin" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-all duration-300 group">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="mr-1"
                        >
                          <Shield className="h-4 w-4" />
                        </motion.div>
                        <span>Super Admin</span>
                      </Link>
                    </>
                  )}
                  {user.role === 'user' && (
                    <Link href="/favorites" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-all duration-300 group">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="mr-1"
                      >
                        <Heart className="h-4 w-4" />
                      </motion.div>
                      <span>Favorites</span>
                    </Link>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {user.role === 'user' && (
                    <>
                      <Link href="/bookings" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="mr-1"
                        >
                          <Car className="h-4 w-4" />
                        </motion.div>
                        <span>Bookings</span>
                      </Link>
                      <Link href="/notifications" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="mr-1"
                        >
                          <Bell className="h-4 w-4" />
                        </motion.div>
                        <span>Notifications</span>
                      </Link>
                    </>
                  )}
                  <ProfileDropdown />

                  <div className="hidden md:flex items-center px-1 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ThemeToggle />
                    </motion.div>
                  </div>
                  <Link href="/help" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="mr-1"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </motion.div>
                    <span>Help</span>
                  </Link>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="flex items-center text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-medium px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    <span>Logout</span>
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <Link href="/help" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="mr-1"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </motion.div>
                  <span>Help</span>
                </Link>
                <div className="px-1 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ThemeToggle />
                  </motion.div>
                </div>
                <Link href="/login" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="mr-1"
                  >
                    <User className="h-4 w-4" />
                  </motion.div>
                  <span>Login</span>
                </Link>
                <Link href="/register" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="mr-1"
                  >
                    <User className="h-4 w-4" />
                  </motion.div>
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
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
                    className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    <span>Browse Rooms</span>
                  </Link>
                </motion.div>

                {user ? (
                  <>
                    {user.role === 'admin' && (
                      <>
                        <motion.div
                          custom={1}
                          variants={menuItemVariants}
                          initial="closed"
                          animate="open"
                        >
                          <Link
                            href="/dashboard"
                            className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            <span>Chat System</span>
                          </Link>
                        </motion.div>
                        <motion.div
                          custom={2}
                          variants={menuItemVariants}
                          initial="closed"
                          animate="open"
                        >
                          <Link
                            href="/admin"
                            className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            <span>Manage Your Showroom</span>
                          </Link>
                        </motion.div>
                      </>
                    )}
                    {user.role === 'superadmin' && (
                      <>
                        <motion.div
                          custom={1}
                          variants={menuItemVariants}
                          initial="closed"
                          animate="open"
                        >
                          <Link
                            href="/dashboard"
                            className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            <span>Chat System</span>
                          </Link>
                        </motion.div>
                        <motion.div
                          custom={2}
                          variants={menuItemVariants}
                          initial="closed"
                          animate="open"
                        >
                          <Link
                            href="/admin/superadmin"
                            className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            <span>Super Admin</span>
                          </Link>
                        </motion.div>
                      </>
                    )}
                    {user.role === 'user' && (
                      <>
                        <motion.div
                          custom={1}
                          variants={menuItemVariants}
                          initial="closed"
                          animate="open"
                        >
                          <Link
                            href="/favorites"
                            className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            <span>Favorites</span>
                          </Link>
                        </motion.div>
                        <motion.div
                          custom={2}
                          variants={menuItemVariants}
                          initial="closed"
                          animate="open"
                        >
                          <Link
                            href="/bookings"
                            className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Car className="h-4 w-4 mr-2" />
                            <span>Bookings</span>
                          </Link>
                        </motion.div>
                        <motion.div
                          custom={3}
                          variants={menuItemVariants}
                          initial="closed"
                          animate="open"
                        >
                          <Link
                            href="/notifications"
                            className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Bell className="h-4 w-4 mr-2" />
                            <span>Notifications</span>
                          </Link>
                        </motion.div>
                      </>
                    )}

                    <motion.div
                      custom={4}
                      variants={menuItemVariants}
                      initial="closed"
                      animate="open"
                    >
                      <Link
                        href="/help"
                        className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <HelpCircle className="h-4 w-4 mr-2" />
                        <span>Help & Support</span>
                      </Link>
                    </motion.div>

                    <motion.div
                      custom={5}
                      variants={menuItemVariants}
                      initial="closed"
                      animate="open"
                    >
                      <Link
                        href="/profile"
                        className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        <span>Profile</span>
                      </Link>
                    </motion.div>

                    <motion.div
                      custom={6}
                      variants={menuItemVariants}
                      initial="closed"
                      animate="open"
                    >
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-medium"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div
                      custom={1}
                      variants={menuItemVariants}
                      initial="closed"
                      animate="open"
                    >
                      <Link
                        href="/help"
                        className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <HelpCircle className="h-4 w-4 mr-2" />
                        <span>Help & Support</span>
                      </Link>
                    </motion.div>
                    <motion.div
                      custom={2}
                      variants={menuItemVariants}
                      initial="closed"
                      animate="open"
                    >
                      <Link
                        href="/login"
                        className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        <span>Login</span>
                      </Link>
                    </motion.div>
                    <motion.div
                      custom={3}
                      variants={menuItemVariants}
                      initial="closed"
                      animate="open"
                    >
                      <Link
                        href="/register"
                        className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        <span>Register</span>
                      </Link>
                    </motion.div>
                  </>
                )}
                <motion.div
                  custom={7}
                  variants={menuItemVariants}
                  initial="closed"
                  animate="open"
                >
                  <div className="px-3 py-2 flex items-center">
                    <div className="mr-2">
                      <ThemeToggle />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Theme</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}