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

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useUser(); // Use the global user context

  const handleLogout = () => {
    // Use logout from context
    logout();
    router.push('/');
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
            <Link href="/rooms" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
              <Home className="h-4 w-4 mr-1" />
              <span>Browse Rooms</span>
            </Link>

            {user ? (
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-4">
                  {user.role === 'admin' && (
                    <>
                      <Link href="/dashboard" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        <span>Chat System</span>
                      </Link>
                      <Link href="/admin" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                        <Settings className="h-4 w-4 mr-1" />
                        <span>Manage Showroom</span>
                      </Link>
                    </>
                  )}
                  {user.role === 'superadmin' && (
                    <>
                      <Link href="/dashboard" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        <span>Chat System</span>
                      </Link>
                      <Link href="/admin/superadmin" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                        <Shield className="h-4 w-4 mr-1" />
                        <span>Super Admin</span>
                      </Link>
                    </>
                  )}
                  {user.role === 'user' && (
                    <Link href="/favorites" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                      <Heart className="h-4 w-4 mr-1" />
                      <span>Favorites</span>
                    </Link>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {user.role === 'user' && (
                    <>
                      <Link href="/bookings">
                        <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                          <Car className="h-5 w-5" />
                        </Button>
                      </Link>
                      {/* Notification badge for user notifications */}
                      <Link href="/notifications">
                        <NotificationBadge />
                      </Link>
                    </>
                  )}
                  <ProfileDropdown />

                  <ThemeToggle />

                  <Link href="/help">
                    <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </Link>

                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/help">
                  <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </Link>
                <ThemeToggle />
                <Link href="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/rooms"
                className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-4 w-4 mr-2" />
                <span>Browse Rooms</span>
              </Link>

              {user ? (
                <>
                  {user.role === 'admin' && (
                    <>
                      <Link
                        href="/dashboard"
                        className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        <span>Chat System</span>
                      </Link>
                      <Link
                        href="/admin"
                        className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        <span>Manage Your Showroom</span>
                      </Link>
                    </>
                  )}
                  {user.role === 'superadmin' && (
                    <>
                      <Link
                        href="/dashboard"
                        className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        <span>Chat System</span>
                      </Link>
                      <Link
                        href="/admin/superadmin"
                        className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        <span>Super Admin</span>
                      </Link>
                    </>
                  )}
                  {user.role === 'user' && (
                    <Link
                      href="/favorites"
                      className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      <span>Favorites</span>
                    </Link>
                  )}

                  <Link
                    href="/help"
                    className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    <span>Help & Support</span>
                  </Link>

                  <Link
                    href="/profile"
                    className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span>Profile</span>
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/help"
                    className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    <span>Help & Support</span>
                  </Link>
                  <Link
                    href="/login"
                    className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span>Login</span>
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span>Register</span>
                  </Link>
                </>
              )}
              <div className="px-3 py-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}