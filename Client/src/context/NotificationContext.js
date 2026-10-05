import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    // تختفي الإشعارات تلقائياً بعد 4 ثوانٍ
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      {/* حاوية الإشعارات المنبثقة */}
      <div className="fixed top-20 right-5 z-[10000] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-center gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-md pointer-events-auto animate-fade-in transition-all ${
              n.type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-700 dark:bg-emerald-900/80 dark:border-emerald-800 dark:text-emerald-300' :
              n.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-700 dark:bg-red-900/80 dark:border-red-800 dark:text-red-300' :
              'bg-blue-50/90 border-blue-200 text-blue-700 dark:bg-blue-900/80 dark:border-blue-800 dark:text-blue-300'
            }`}
          >
            {n.type === 'success' && <CheckCircle size={20} />}
            {n.type === 'error' && <AlertCircle size={20} />}
            {n.type === 'info' && <Info size={20} />}
            <p className="flex-1 text-sm font-bold">{n.message}</p>
            <button onClick={() => removeNotification(n.id)} className="opacity-50 hover:opacity-100 transition">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};