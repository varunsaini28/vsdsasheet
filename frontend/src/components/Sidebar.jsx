import React from 'react';

const Sidebar = ({ 
  isOpen, 
  topics, 
  patterns,
  selectedTopic, 
  selectedPattern,
  setSelectedTopic, 
  setSelectedPattern,
  topicProgress,
  patternProgress,
  reviewCount,
  showReviewOnly,
  setShowReviewOnly,
  showOverdueOnly,
  setShowOverdueOnly,
  overdueCount
}) => {
  return (
    <aside className={`fixed left-0 top-20 md:top-16 h-full bg-gray-800 transition-all duration-300 overflow-y-auto z-10 ${isOpen ? 'w-64' : 'w-0'} md:z-0`}>
      <div className="p-4">
        <h2 className="text-lg font-semibold text-purple-400 mb-4"></h2>
        
        {/* Special Sections */}
        <div className="mb-4 space-y-2">
          <button
            onClick={() => {
              setShowReviewOnly(!showReviewOnly);
              setShowOverdueOnly(false);
              setSelectedTopic('All');
              setSelectedPattern('All');
            }}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex justify-between items-center ${
              showReviewOnly ? 'bg-yellow-600 text-white' : 'hover:bg-gray-700 text-gray-300'
            }`}
          >
            <span>📌 Review Later</span>
            {reviewCount > 0 && (
              <span className="bg-yellow-500 text-white px-2 py-0.5 rounded-full text-xs">
                {reviewCount}
              </span>
            )}
          </button>
          
          <button
            onClick={() => {
              setShowOverdueOnly(!showOverdueOnly);
              setShowReviewOnly(false);
              setSelectedTopic('All');
              setSelectedPattern('All');
            }}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex justify-between items-center ${
              showOverdueOnly ? 'bg-red-600 text-white' : 'hover:bg-gray-700 text-gray-300'
            }`}
          >
            <span>⚠️ Overdue Revision</span>
            {overdueCount > 0 && (
              <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs animate-pulse">
                {overdueCount}
              </span>
            )}
          </button>
        </div>

        <div className="border-t border-gray-700 my-4"></div>

        {/* Topics Section */}
        <h3 className="text-sm font-semibold text-gray-400 mb-2">TOPICS</h3>
        <ul className="space-y-1 mb-4">
          {topics.map(topic => (
            <li key={topic}>
              <button
                onClick={() => {
                  setSelectedTopic(topic);
                  setSelectedPattern('All');
                  setShowReviewOnly(false);
                  setShowOverdueOnly(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex justify-between items-center text-sm ${
                  selectedTopic === topic && !showReviewOnly && !showOverdueOnly && selectedPattern === 'All'
                    ? 'bg-purple-600 text-white' 
                    : 'hover:bg-gray-700 text-gray-300'
                }`}
              >
                <span>{topic}</span>
                {topic !== 'All' && topicProgress[topic] && (
                  <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                    {topicProgress[topic].completed}/{topicProgress[topic].total}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>

        <div className="border-t border-gray-700 my-4"></div>

        {/* Patterns Section */}
        <h3 className="text-sm font-semibold text-gray-400 mb-2">PATTERNS</h3>
        <ul className="space-y-1">
          {patterns.map(pattern => (
            <li key={pattern}>
              <button
                onClick={() => {
                  setSelectedPattern(pattern);
                  setSelectedTopic('All');
                  setShowReviewOnly(false);
                  setShowOverdueOnly(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex justify-between items-center text-sm ${
                  selectedPattern === pattern && !showReviewOnly && !showOverdueOnly && selectedTopic === 'All'
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-gray-700 text-gray-300'
                }`}
              >
                <span>{pattern}</span>
                {pattern !== 'All' && patternProgress[pattern] && (
                  <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                    {patternProgress[pattern].completed}/{patternProgress[pattern].total}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;