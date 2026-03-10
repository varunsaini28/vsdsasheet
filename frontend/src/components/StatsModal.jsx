import React, { useState } from 'react';

const StatsModal = ({ onClose, progress, topicProgress, patternProgress }) => {
  const [activeTab, setActiveTab] = useState('topics');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 p-4">
      <div className="bg-gray-800 rounded-xl p-4 md:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-400">Progress Statistics</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Overall Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-400">{progress.completed}</div>
            <div className="text-sm text-gray-400">Completed</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">{progress.reviewCount}</div>
            <div className="text-sm text-gray-400">To Review</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-red-400">{progress.overdueCount}</div>
            <div className="text-sm text-gray-400">Overdue</div>
          </div>
        </div>
        
        {/* Overall Progress Bar */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Overall Progress</h3>
          <div className="w-full bg-gray-700 rounded-full h-4">
            <div 
              className="bg-purple-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
          <p className="text-right text-sm text-gray-400 mt-1">{progress.percentage}% Complete</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setActiveTab('topics')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'topics' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Topic Wise
          </button>
          <button
            onClick={() => setActiveTab('patterns')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'patterns' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Pattern Wise
          </button>
        </div>
        
        {/* Topic-wise Progress */}
        {activeTab === 'topics' && (
          <div className="space-y-3">
            <h3 className="font-semibold mb-3">Topic-wise Progress</h3>
            {Object.entries(topicProgress).sort().map(([topic, data]) => (
              <div key={topic}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{topic}</span>
                  <span>{data.completed}/{data.total} ({((data.completed/data.total)*100).toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(data.completed/data.total)*100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pattern-wise Progress */}
        {activeTab === 'patterns' && (
          <div className="space-y-3">
            <h3 className="font-semibold mb-3">Pattern-wise Progress</h3>
            {Object.entries(patternProgress).sort().map(([pattern, data]) => (
              <div key={pattern}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{pattern}</span>
                  <span>{data.completed}/{data.total} ({((data.completed/data.total)*100).toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(data.completed/data.total)*100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsModal;