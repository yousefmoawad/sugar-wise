import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WeeklyProgressChart = () => {
  const weeklyProgress = [
    { day: 'Mon', glucose: 120, carbs: 180 },
    { day: 'Tue', glucose: 115, carbs: 160 },
    { day: 'Wed', glucose: 135, carbs: 210 },
    { day: 'Thu', glucose: 110, carbs: 150 },
    { day: 'Fri', glucose: 125, carbs: 190 },
    { day: 'Sat', glucose: 140, carbs: 220 },
    { day: 'Sun', glucose: 118, carbs: 170 }
  ];

  return (
    // Container: Added dark:bg-gray-800 and dark:border-gray-700
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-800 transition-colors duration-300">
      
      {/* [DIAGRAM HEADER]: Branded title with elevated font */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Weekly Health Progress
      </h2>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyProgress}>
            <CartesianGrid strokeDasharray="3 3" stroke="#9CA3AF" strokeOpacity={0.2} />
            
            {/* [AXIS LABELS]: Increased font size for legibility */}
            <XAxis dataKey="day" stroke="#9CA3AF" fontSize={14} tickLine={false} axisLine={false} />
            <YAxis stroke="#9CA3AF" fontSize={14} tickLine={false} axisLine={false} />
            
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            />
            
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '14px' }} />
            
            {/* [BARS]: Branded Blue and Green identity */}
            <Bar dataKey="glucose" name="Glucose (mg/dL)" fill="#8EC641" radius={[6, 6, 0, 0]} />
            <Bar dataKey="carbs" name="Carbs (g)" fill="#2DA1D7" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyProgressChart;