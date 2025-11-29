import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import Navbar from '@/components/layout/Navbar';
import { Toaster } from '@/components/ui/toaster';
import { UserProvider } from '../context/user-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AutoDealer - Multi-Showroom Car Platform',
  description: 'Find your perfect car from multiple showrooms with direct dealer chat',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            <Navbar />
            <main>{children}</main>
            <Toaster />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}