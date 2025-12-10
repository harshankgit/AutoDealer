import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import Navbar from '@/components/layout/Navbar';
import { Toaster } from '@/components/ui/toaster';
import { UserProvider } from '../context/user-context';
import { LoadingProvider } from '../context/loading-context';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ServiceWorkerRegistration from '@/components/pwa/ServiceWorkerRegistration';
import RealTimeNotifications from '@/components/realtime/RealTimeNotifications';
import VisitTracker from '@/components/VisitTracker';
import GlobalSpinner from '@/components/layout/GlobalSpinner';
import { ChatProvider } from '@/components/ChatProvider';
import OneSignalProvider from '@/components/OneSignalProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AutoDealer - Multi-Showroom Car Platform',
  description: 'Find your perfect car from multiple showrooms with direct dealer chat',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="CarSelling" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#3b82f6" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LoadingProvider>
            <UserProvider>
              <ChatProvider>
                <ServiceWorkerRegistration />
                <RealTimeNotifications />
                <VisitTracker />
                <OneSignalProvider />
                <Navbar />
                <div className="fixed top-16 left-0 right-0 z-50">
                  <GlobalSpinner />
                  <LoadingSpinner />
                </div>
                <main className="pt-1">{children}</main>
                <Toaster />
              </ChatProvider>
            </UserProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}