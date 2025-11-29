'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 text-center px-4 py-12">
      <h1 className="text-7xl md:text-9xl font-extrabold text-gray-900 dark:text-white mb-4">
        404
      </h1>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        Page Not Found
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
        Oops! The page you're looking for doesn't exist or has been moved. 
        Don't worry, you can always go back to the homepage.
      </p>
      <Link href="/">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 mb-10">
          Go to Homepage
        </Button>
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8 max-w-md mx-auto w-full">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Report an Issue</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          If you believe this is an error, please contact the website developer:
        </p>
        <div className="space-y-2 text-left mx-auto">
          <p className="text-gray-800 dark:text-gray-200"><span className="font-medium">Name:</span> Harshank Kanungo</p>
          <p className="text-gray-800 dark:text-gray-200"><span className="font-medium">Phone:</span> 8965992025</p>
          <p className="text-gray-800 dark:text-gray-200"><span className="font-medium">Location:</span> Khandwa, MP</p>
          <p className="text-gray-800 dark:text-gray-200 mt-4">
            You can also send an email to <a href="mailto:carsellingdealerhelp@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">carsellingdealerhelp@gmail.com</a> with details of the error.
          </p>
        </div>
      </div>
    </div>
  );
}
