import React from 'react';

const RevisionModal = ({ onClose, revisionDates, questions, completedQuestions, markForRevision }) => {
  const getScheduledRevisions = () => {
    const scheduled = [];
    const today = new Date();
    
    Object.entries(revisionDates).forEach(([id, date]) => {
      const question = questions.find(q => q.id === parseInt(id));
      if (question && !completedQuestions[id]) {
        const revisionDate = new Date(date);
        const daysUntil = Math.ceil((revisionDate - today) / (1000 * 60 * 60 * 24));
        
        scheduled.push({
          ...question,
          revisionDate,
          daysUntil
        });
      }
    });
    
    return scheduled.sort((a, b) => a.daysUntil - b.daysUntil);
  };

  const scheduledRevisions = getScheduledRevisions();

  const getStatusColor = (daysUntil) => {
    if (daysUntil < 0) return 'border-red-500 bg-red-900 bg-opacity-20';
    if (daysUntil === 0) return 'border-yellow-500 bg-yellow-900 bg-opacity-20';
    if (daysUntil <= 3) return 'border-green-500 bg-green-900 bg-opacity-20';
    return 'border-blue-500 bg-blue-900 bg-opacity-20';
  };

  const getStatusText = (daysUntil) => {
    if (daysUntil < 0) return 'Overdue';
    if (daysUntil === 0) return 'Today';
    if (daysUntil === 1) return 'Tomorrow';
    return `In ${daysUntil} days`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 p-4">
      <div className="bg-gray-800 rounded-xl p-4 md:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-yellow-400">Revision Schedule</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {scheduledRevisions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No scheduled revisions.</p>
            <p className="text-gray-500 mt-2">Complete questions to set revision dates!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {scheduledRevisions.map(question => (
              <div
                key={question.id}
                className={`rounded-lg p-4 border-l-4 ${getStatusColor(question.daysUntil)}`}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{question.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(question.daysUntil) === 'border-red-500 bg-red-900 bg-opacity-20' ? 'bg-red-900 text-red-300' :
                        question.difficulty === 'Easy' ? 'bg-green-900 text-green-300' :
                        question.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
                        question.difficulty === 'Hard' ? 'bg-red-900 text-red-300' :
                        'bg-purple-900 text-purple-300'
                      }`}>
                        {question.difficulty}
                      </span>
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                        {question.topic}
                      </span>
                      <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full">
                        {question.pattern}
                      </span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className={`text-sm font-semibold ${getStatusColor(question.daysUntil) === 'border-red-500 bg-red-900 bg-opacity-20' ? 'text-red-400' :
                      question.daysUntil === 0 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {getStatusText(question.daysUntil)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {question.revisionDate.toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {/* Quick actions */}
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => markForRevision(question.id, 3)}
                    className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-full transition-colors"
                  >
                    Reschedule (3 days)
                  </button>
                  <button
                    onClick={() => markForRevision(question.id, 7)}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full transition-colors"
                  >
                    Reschedule (7 days)
                  </button>
                  <button
                    onClick={() => markForRevision(question.id, 14)}
                    className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-full transition-colors"
                  >
                    Reschedule (14 days)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RevisionModal;