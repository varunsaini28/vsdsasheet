import React from 'react';

const StreakCard = ({ streak, longestStreak }) => {
  const getStreakMessage = () => {
    if (streak === 0) return "Start your journey today!";
    if (streak === 1) return "Great start! Keep it up!";
    if (streak < 7) return "You're on fire! 🔥";
    if (streak < 30) return "Amazing consistency! 🌟";
    return "Legendary streak! 👑";
  };

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg px-4 py-2 text-white relative overflow-hidden group">
      {/* Fire animation background */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 200 200\'%3E%3Cpath fill=\'%23FFD700\' d=\'M100 0L120 70L200 70L140 115L160 185L100 140L40 185L60 115L0 70L80 70L100 0Z\'/%3E%3C/svg%3E')] bg-repeat opacity-20"></div>
      </div>
      
      <div className="relative z-10 flex items-center space-x-3">
        <div className="flex items-center">
          <span className="text-2xl mr-1">🔥</span>
          <span className="text-2xl font-bold">{streak}</span>
        </div>
        <div className="border-l border-white/30 pl-3">
          <div className="text-xs opacity-90">Longest</div>
          <div className="font-semibold">{longestStreak} days</div>
        </div>
        <div className="hidden md:block text-sm max-w-[150px] opacity-90">
          {getStreakMessage()}
        </div>
      </div>
    </div>
  );
};

export default StreakCard;