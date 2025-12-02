'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// This component only renders on the client side to avoid hydration issues
const ClientOnlyFirstVisitAnimation = ({ children }: { children: React.ReactNode }) => {
  const [showAnimation, setShowAnimation] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Check if user has visited today using localStorage
    const today = new Date().toDateString(); // Format: "Mon Dec 02 2024"
    const lastVisitDate = localStorage.getItem('lastVisitDate');
    
    // If the last visit was today, skip animation
    if (lastVisitDate === today) {
      setShowAnimation(false);
    } else {
      setShowAnimation(true);
    }
  }, []);

  const handleAnimationComplete = () => {
    // Mark as visited after animation completes using localStorage
    const today = new Date().toDateString();
    localStorage.setItem('lastVisitDate', today);
    setShowAnimation(false);
  };

  // While still loading or if animation is not needed, show children
  if (!isClient || !showAnimation) {
    return <>{children}</>;
  }

  // Show the animation
  return (
    <>
      {/* Hidden children to satisfy React */}
      <div style={{ display: 'none' }}>
        {children}
      </div>
      
      <AnimatePresence>
        <motion.div 
          className="fixed inset-0 z-[100] bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center px-4">
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="block">HARSHANK</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600">KANUNGO</span>
            </motion.h1>
            
            <motion.p
              className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Welcome to the Premium Car Selling Platform
            </motion.p>

            <motion.div
              className="relative w-64 h-1 bg-gray-700 mx-auto rounded-full overflow-hidden"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 2, delay: 0.8, ease: "easeInOut" }}
            >
              <motion.div
                className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                transition={{ duration: 2, delay: 0.8, ease: "easeInOut" }}
              />
            </motion.div>

            <motion.div
              className="mt-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 2.5 }}
              onAnimationComplete={handleAnimationComplete}
            >
              <div className="inline-block animate-bounce">
                <svg 
                  className="w-8 h-8 text-blue-300 mx-auto" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 14l-7 7m0 0l-7-7m7 7V3" 
                  />
                </svg>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

// This component will render nothing on the server and only render on the client
const FirstVisitAnimation = ({ children }: { children: React.ReactNode }) => {
  return <ClientOnlyFirstVisitAnimation>{children}</ClientOnlyFirstVisitAnimation>;
};

export default FirstVisitAnimation;