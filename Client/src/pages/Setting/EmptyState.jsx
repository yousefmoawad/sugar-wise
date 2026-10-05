import React from 'react';
import { Construction } from 'lucide-react';

/**
 * [COMPONENT]: EmptyState
 * Purpose: A standardized placeholder for sub-pages or specific data views that have no content.
 * Styling: Clean, minimal clinical aesthetic using light brand grey and blue accents.
 */
const EmptyState = ({ title, description, icon: Icon = Construction }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-12 animate-fade-in relative overflow-hidden">
      
      {/* Decorative Brand Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-[#2DA1D7]/5 to-[#8EC641]/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Icon Graphic */}
      <div className="relative mb-10 group">
        <div className="absolute inset-0 bg-[#2DA1D7]/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-50"></div>
        <div className="relative w-32 h-32 bg-white dark:bg-gray-800 rounded-[2.5rem] flex items-center justify-center shadow-xl border border-gray-100 dark:border-gray-700 transform group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
          <Icon size={56} className="text-[#2DA1D7] dark:text-[#2DA1D7]/80" />
        </div>
      </div>

      {/* Primary message */}
      <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight transition-colors duration-300 relative">
        {title}
      </h2>

      {/* Helper description */}
      <p className="text-xl text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed font-medium transition-colors duration-300 relative">
        {description}
      </p>

      {/* Secondary accent bar */}
      <div className="mt-12 w-16 h-1.5 bg-[#8EC641] rounded-full opacity-30"></div>
      
    </div>
  );
};

export default EmptyState;