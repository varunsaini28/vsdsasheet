import React from 'react';

const QuestionList = ({ 
  questions, 
  completedQuestions, 
  reviewLater,
  overdueRevisions,
  onToggleComplete, 
  onToggleReview,
  onMarkRevision,
  onOpenSolution 
}) => {
  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'bg-green-900 text-green-300';
      case 'Medium': return 'bg-yellow-900 text-yellow-300';
      case 'Hard': return 'bg-red-900 text-red-300';
      case 'Very Hard': return 'bg-purple-900 text-purple-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  const getPatternColor = (pattern) => {
    const colors = {
      'Two Pointer': 'bg-blue-900 text-blue-300',
      'Sliding Window': 'bg-indigo-900 text-indigo-300',
      'Binary Search': 'bg-cyan-900 text-cyan-300',
      'DP': 'bg-pink-900 text-pink-300',
      'DFS': 'bg-emerald-900 text-emerald-300',
      'BFS': 'bg-teal-900 text-teal-300',
      'Backtracking': 'bg-orange-900 text-orange-300',
      'Greedy': 'bg-amber-900 text-amber-300',
      'Stack': 'bg-stone-900 text-stone-300',
      'Queue': 'bg-neutral-900 text-neutral-300',
      'Heap': 'bg-lime-900 text-lime-300',
      'Hash Map': 'bg-rose-900 text-rose-300',
      'Math': 'bg-fuchsia-900 text-fuchsia-300',
      'Bit': 'bg-violet-900 text-violet-300',
      'Trie': 'bg-sky-900 text-sky-300',
      'Segment Tree': 'bg-slate-900 text-slate-300',
      'DSU': 'bg-zinc-900 text-zinc-300',
      'MST': 'bg-stone-900 text-stone-300',
      'Dijkstra': 'bg-amber-900 text-amber-300',
      'Bellman Ford': 'bg-amber-900 text-amber-300',
      'Floyd Warshall': 'bg-amber-900 text-amber-300',
      'Topological Sort': 'bg-emerald-900 text-emerald-300',
      'Kadane': 'bg-pink-900 text-pink-300',
      'Moore Voting': 'bg-rose-900 text-rose-300',
      'Prefix Sum': 'bg-cyan-900 text-cyan-300',
      'Sorting': 'bg-gray-900 text-gray-300',
      'Merge Sort': 'bg-gray-900 text-gray-300',
      'Quick Sort': 'bg-gray-900 text-gray-300',
      'Recursion': 'bg-orange-900 text-orange-300',
      'Matrix': 'bg-indigo-900 text-indigo-300',
      'String Matching': 'bg-sky-900 text-sky-300',
      'KMP': 'bg-sky-900 text-sky-300',
      'Manacher': 'bg-sky-900 text-sky-300',
      'LIS': 'bg-pink-900 text-pink-300',
      'MCM': 'bg-pink-900 text-pink-300',
      'Knapsack': 'bg-pink-900 text-pink-300',
      'Bitmask DP': 'bg-pink-900 text-pink-300',
      'Digit DP': 'bg-pink-900 text-pink-300',
      'Tree DP': 'bg-pink-900 text-pink-300',
      'Game DP': 'bg-pink-900 text-pink-300',
      'Stock DP': 'bg-pink-900 text-pink-300',
      'String DP': 'bg-pink-900 text-pink-300',
      'Monotonic Stack': 'bg-stone-900 text-stone-300',
      'Monotonic Queue': 'bg-stone-900 text-stone-300',
      'SCC': 'bg-emerald-900 text-emerald-300',
      'Eulerian': 'bg-emerald-900 text-emerald-300',
      'Max Flow': 'bg-emerald-900 text-emerald-300',
      'Binary Lifting': 'bg-cyan-900 text-cyan-300',
      'Sparse Table': 'bg-cyan-900 text-cyan-300',
      'Fenwick Tree': 'bg-cyan-900 text-cyan-300',
      'Persistent Segment Tree': 'bg-cyan-900 text-cyan-300',
      'Mo\'s Algorithm': 'bg-cyan-900 text-cyan-300',
      'Geometry': 'bg-fuchsia-900 text-fuchsia-300',
      'Sieve': 'bg-fuchsia-900 text-fuchsia-300',
      'Inclusion Exclusion': 'bg-fuchsia-900 text-fuchsia-300',
      'Matrix Exponentiation': 'bg-fuchsia-900 text-fuchsia-300',
      'Meet in Middle': 'bg-violet-900 text-violet-300',
      'Basic': 'bg-gray-700 text-gray-300',
      'Cyclic Sort': 'bg-blue-900 text-blue-300',
      'Divide Conquer': 'bg-purple-900 text-purple-300',
      'Ordered Set': 'bg-indigo-900 text-indigo-300',
      'Sweep Line': 'bg-amber-900 text-amber-300',
      'Rolling Hash': 'bg-sky-900 text-sky-300',
      'Morris': 'bg-teal-900 text-teal-300',
      'BST': 'bg-emerald-900 text-emerald-300',
    };
    return colors[pattern] || 'bg-gray-700 text-gray-300';
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No questions found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {questions.map((question) => {
        const isOverdue = overdueRevisions[question.id];
        
        return (
          <div
            key={question.id}
            className={`rounded-lg p-4 border-l-4 transition-all hover:shadow-lg ${
              completedQuestions[question.id] 
                ? 'bg-gray-800 bg-opacity-50 border-green-500' 
                : isOverdue
                  ? 'bg-red-900 bg-opacity-20 border-red-500 animate-pulse'
                  : reviewLater[question.id]
                    ? 'bg-yellow-900 bg-opacity-20 border-yellow-500'
                    : 'bg-gray-800 border-gray-600'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => onToggleComplete(question.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-colors ${
                      completedQuestions[question.id]
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-500 hover:border-purple-500'
                    }`}
                  >
                    {completedQuestions[question.id] && (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  
                  <h3 className="text-lg font-medium text-white">{question.name}</h3>
                </div>
                
                <div className="mt-2 flex flex-wrap items-center gap-2 ml-9">
                  <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty}
                  </span>
                  
                  <span className={`px-2 py-1 text-xs rounded-full ${getPatternColor(question.pattern)}`}>
                    {question.pattern}
                  </span>
                  
                  {question.sources && question.sources.split(', ').map(source => (
                    <span key={source} className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded-full">
                      {source}
                    </span>
                  ))}
                  
                  <span className="text-sm text-purple-400">{question.topic}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 ml-9 sm:ml-0">
                {/* Solution Button */}
                <button
                  onClick={() => onOpenSolution(question)}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Add solution"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>

                {/* Review Later Button */}
                <button
                  onClick={() => onToggleReview(question.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    reviewLater[question.id] 
                      ? 'bg-yellow-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  title="Mark for review later"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>

                {/* Revision Dropdown */}
                <select
                  onChange={(e) => onMarkRevision(question.id, parseInt(e.target.value))}
                  className="bg-gray-700 text-white rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  defaultValue=""
                >
                  <option value="" disabled>Set Revision</option>
                  <option value="1">Tomorrow</option>
                  <option value="3">In 3 days</option>
                  <option value="7">In 7 days</option>
                  <option value="14">In 14 days</option>
                  <option value="30">In 30 days</option>
                </select>
              </div>
            </div>

            {/* Overdue Warning */}
            {isOverdue && !completedQuestions[question.id] && (
              <div className="mt-2 ml-9 text-red-400 text-sm flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Revision overdue! Please review this question.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default QuestionList;



