import React, { useState, useEffect } from 'react';
import Logo_Cycle from "../../Images/BrandLogo/logo-cycle.png";

const Loading = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Set a timer to hide the component after 500ms
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 500);

    return () => clearTimeout(timer); // Cleanup timer if component unmounts
  }, []);

  // If not visible, return null so nothing is rendered
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
      
      {/* Animated Brand Container */}
      <div className="relative mb-8 group">
        <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
        
        <div className="relative w-24 h-24 p-1 rounded-full border-4 border-transparent border-t-blue-500 border-r-teal-500 animate-spin">
          <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden animate-reverse-spin">
            <img 
              src={Logo_Cycle} 
              alt="Loading SugarWise" 
              className="w-16 h-16 object-contain p-1"
            />
          </div>
        </div>
      </div>

      <div className="text-center space-y-4 w-64">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-wide animate-pulse">
          SugarWise
        </h3>
        
        <div className="relative h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-full animate-loading-bar"></div>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          Setting up your experience...
        </p>
      </div>

      <style jsx>{`
        @keyframes reverse-spin {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-reverse-spin {
          animation: reverse-spin 1s linear infinite;
        }
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-bar {
          width: 60%;
          animation: loading-bar 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Loading;