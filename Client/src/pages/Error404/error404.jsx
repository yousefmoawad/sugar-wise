import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, AlertCircle} from 'lucide-react';

const Error404 = () => {
  
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6 transition-colors duration-300">
      <div className="max-w-2xl w-full text-center">
        
        {/* Animated 404 Illustration */}
        <div className="relative mb-12">
          <h1 className="text-[150px] md:text-[200px] font-black text-gray-200/50 dark:text-gray-700/30 select-none leading-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 md:w-48 md:h-48 bg-white dark:bg-gray-800 rounded-full shadow-2xl flex items-center justify-center border-4 border-blue-500 animate-bounce-slow">
               <AlertCircle size={80} className="text-blue-500 md:w-24 md:h-24" />
            </div>
          </div>
        </div>

        {/* Messaging */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Oops! Page Not Found
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-md mx-auto">
          The page you are looking for might have been moved, deleted, or perhaps it never existed in the first place.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-8 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-300 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 hover:scale-105 active:scale-95 transition duration-300 flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Return Home
          </button>
        </div>

        
      </div>
    </div>
  );
};

export default Error404;