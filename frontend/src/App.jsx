import React, { useState, useEffect } from 'react';
import axios from 'axios';
import topicsData, { 
  getTopicsInOrder, 
  getPatternsInOrder, 
  getSources,
  difficulties 
} from './data/questions.jsx';
import Sidebar from './components/Sidebar';
import QuestionList from './components/QuestionList';
import StatsModal from './components/StatsModal';
import RevisionModal from './components/RevisionModal';
import SolutionDialog from './components/SolutionDialog';
import Login from './components/Login';
import StreakCard from './components/StreakCard';
import './App.css';

// Configure axios
const serverUrl = 'https://vsdsasheetserver.onrender.com';
axios.defaults.baseURL = serverUrl;

function App() {
  const [user, setUser] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedPattern, setSelectedPattern] = useState('All');
  const [questions, setQuestions] = useState(topicsData);
  const [completedQuestions, setCompletedQuestions] = useState({});
  const [reviewLater, setReviewLater] = useState({});
  const [revisionDates, setRevisionDates] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [showRevision, setShowRevision] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showReviewOnly, setShowReviewOnly] = useState(false);
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Get ordered lists
  const topics = ['All', ...getTopicsInOrder()];
  const patterns = ['All', ...getPatternsInOrder()];
  const sources = getSources();

  // Load user data from localStorage on initial render
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedUser = localStorage.getItem('vs-dsa-user');
        const savedProgress = localStorage.getItem('vs-dsa-progress');
        
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          
          if (savedProgress) {
            const progressData = JSON.parse(savedProgress);
            setCompletedQuestions(progressData.completedQuestions || {});
            setReviewLater(progressData.reviewLater || {});
            setRevisionDates(progressData.revisionDates || {});
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    // Sync questions to backend (one-time)
    const syncQuestions = async () => {
      try {
        await axios.post(`${serverUrl}/api/questions/sync`, { questions: topicsData });
        console.log('Questions synced successfully');
      } catch (error) {
        console.error('Error syncing questions:', error);
        setApiError('Cannot connect to backend server. Please make sure it\'s running on port 5000.');
      }
    };
    syncQuestions();
  }, []);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('vs-dsa-user', JSON.stringify(user));
    }
  }, [user]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      const progressData = {
        completedQuestions,
        reviewLater,
        revisionDates
      };
      localStorage.setItem('vs-dsa-progress', JSON.stringify(progressData));
    }
  }, [completedQuestions, reviewLater, revisionDates, user]);

  const handleLogin = (userData, progressData) => {
    setUser(userData);
    if (progressData) {
      setCompletedQuestions(Object.fromEntries(progressData.completedQuestions || new Map()));
      setReviewLater(Object.fromEntries(progressData.reviewLater || new Map()));
      setRevisionDates(Object.fromEntries(progressData.revisionDates || new Map()));
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCompletedQuestions({});
    setReviewLater({});
    setRevisionDates({});
    
    localStorage.removeItem('vs-dsa-user');
    localStorage.removeItem('vs-dsa-progress');
  };

  const saveProgress = async (updates) => {
    if (!user) return;
    
    try {
      await axios.post(`${serverUrl}/api/progress/update`, {
        completedQuestions,
        reviewLater,
        revisionDates,
        ...updates
      }, {
        headers: { 'user-id': user.userId }
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const toggleQuestion = (questionId) => {
    const newCompleted = {
      ...completedQuestions,
      [questionId]: !completedQuestions[questionId]
    };
    
    setCompletedQuestions(newCompleted);
    
    if (!completedQuestions[questionId]) {
      const today = new Date();
      const nextRevision = new Date(today);
      nextRevision.setDate(today.getDate() + 3);
      
      const newRevisionDates = {
        ...revisionDates,
        [questionId]: nextRevision.toISOString()
      };
      
      setRevisionDates(newRevisionDates);
      saveProgress({ completedQuestions: newCompleted, revisionDates: newRevisionDates });
    } else {
      saveProgress({ completedQuestions: newCompleted });
    }
  };

  const toggleReviewLater = (questionId) => {
    const newReviewLater = {
      ...reviewLater,
      [questionId]: !reviewLater[questionId]
    };
    setReviewLater(newReviewLater);
    saveProgress({ reviewLater: newReviewLater });
  };

  const markForRevision = (questionId, days) => {
    const today = new Date();
    const nextRevision = new Date(today);
    nextRevision.setDate(today.getDate() + days);
    
    const newRevisionDates = {
      ...revisionDates,
      [questionId]: nextRevision.toISOString()
    };
    
    setRevisionDates(newRevisionDates);
    saveProgress({ revisionDates: newRevisionDates });
  };

  const checkOverdueRevisions = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue = {};
    
    Object.entries(revisionDates).forEach(([id, date]) => {
      const revisionDate = new Date(date);
      revisionDate.setHours(0, 0, 0, 0);
      if (revisionDate < today && !completedQuestions[id]) {
        overdue[id] = true;
      }
    });
    
    return overdue;
  };

  const getFilteredQuestions = () => {
    let filtered = [...questions];
    
    if (selectedTopic !== 'All') {
      filtered = filtered.filter(q => q.topic === selectedTopic);
    }
    
    if (selectedPattern !== 'All') {
      filtered = filtered.filter(q => q.pattern === selectedPattern);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.pattern.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (difficultyFilter !== 'All') {
      filtered = filtered.filter(q => q.difficulty === difficultyFilter);
    }
    
    if (sourceFilter !== 'All') {
      filtered = filtered.filter(q => q.sources && q.sources.includes(sourceFilter));
    }
    
    if (showReviewOnly) {
      filtered = filtered.filter(q => reviewLater[q.id]);
    }
    
    if (showOverdueOnly) {
      const overdue = checkOverdueRevisions();
      filtered = filtered.filter(q => overdue[q.id]);
    }
    
    return filtered;
  };

  const getProgress = () => {
    const total = questions.length;
    const completed = Object.values(completedQuestions).filter(v => v).length;
    const reviewCount = Object.values(reviewLater).filter(v => v).length;
    const overdueCount = Object.keys(checkOverdueRevisions()).length;
    
    return { 
      total, 
      completed, 
      reviewCount, 
      overdueCount, 
      percentage: total > 0 ? ((completed / total) * 100).toFixed(1) : 0 
    };
  };

  const getTopicWiseProgress = () => {
    const topicProgress = {};
    questions.forEach(q => {
      if (!topicProgress[q.topic]) {
        topicProgress[q.topic] = { total: 0, completed: 0 };
      }
      topicProgress[q.topic].total++;
      if (completedQuestions[q.id]) {
        topicProgress[q.topic].completed++;
      }
    });
    return topicProgress;
  };

  const getPatternWiseProgress = () => {
    const patternProgress = {};
    questions.forEach(q => {
      if (!patternProgress[q.pattern]) {
        patternProgress[q.pattern] = { total: 0, completed: 0 };
      }
      patternProgress[q.pattern].total++;
      if (completedQuestions[q.id]) {
        patternProgress[q.pattern].completed++;
      }
    });
    return patternProgress;
  };

  // Show loading while checking for saved user
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-blue-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading your progress...</p>
        </div>
      </div>
    );
  }

  // Show error if backend is not responding
  if (apiError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-blue-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-red-500/30 text-center">
          <div className="text-red-500 text-6xl mb-4">🔌</div>
          <h2 className="text-2xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-gray-400 mb-6">{apiError}</p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              Retry Connection
            </button>
            <p className="text-sm text-gray-500">
              Make sure your backend server is running on port 5000
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show login page if no user
  if (!user) {
    return <Login onLogin={handleLogin} serverUrl={serverUrl} />;
  }

  const progress = getProgress();
  const filteredQuestions = getFilteredQuestions();
  const topicProgress = getTopicWiseProgress();
  const patternProgress = getPatternWiseProgress();
  const overdueRevisions = checkOverdueRevisions();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900 to-blue-900 shadow-lg fixed w-full z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-white hover:text-purple-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-white">VS DSA Sheet</h1>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
              {/* Streak Card */}
              <StreakCard streak={user.streak || 0} longestStreak={user.longestStreak || 0} />
              
              {progress.overdueCount > 0 && (
                <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm animate-pulse self-start md:self-auto">
                  {progress.overdueCount} Overdue
                </div>
              )}
              
              <div className="bg-gray-800 rounded-lg px-4 py-2 self-start md:self-auto">
                <span className="text-purple-400 font-semibold">{progress.completed}/{progress.total}</span>
                <span className="text-gray-400 ml-2">({progress.percentage}%)</span>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 self-start md:self-auto">
                <button
                  onClick={() => setShowRevision(true)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Revision
                </button>
                
                <button
                  onClick={() => setShowStats(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Stats
                </button>
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-2 bg-gray-800 rounded-lg px-4 py-2 self-start md:self-auto">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{user.name?.[0]?.toUpperCase() || 'U'}</span>
                </div>
                <span className="text-gray-300">{user.name || 'User'}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-white ml-2"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex pt-20 md:pt-16">
        <Sidebar 
          isOpen={isSidebarOpen}
          topics={topics}
          patterns={patterns}
          selectedTopic={selectedTopic}
          selectedPattern={selectedPattern}
          setSelectedTopic={setSelectedTopic}
          setSelectedPattern={setSelectedPattern}
          topicProgress={topicProgress}
          patternProgress={patternProgress}
          reviewCount={progress.reviewCount}
          showReviewOnly={showReviewOnly}
          setShowReviewOnly={setShowReviewOnly}
          showOverdueOnly={showOverdueOnly}
          setShowOverdueOnly={setShowOverdueOnly}
          overdueCount={progress.overdueCount}
        />

        {/* Main Content Area */}
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'ml-0'} p-4 md:p-6`}>
          {/* Stats Modal */}
          {showStats && (
            <StatsModal 
              onClose={() => setShowStats(false)}
              progress={progress}
              topicProgress={topicProgress}
              patternProgress={patternProgress}
            />
          )}

          {/* Revision Modal */}
          {showRevision && (
            <RevisionModal
              onClose={() => setShowRevision(false)}
              revisionDates={revisionDates}
              questions={questions}
              completedQuestions={completedQuestions}
              markForRevision={markForRevision}
            />
          )}

          {/* Solution Dialog */}
          {showSolution && selectedQuestion && (
            <SolutionDialog
              isOpen={showSolution}
              onClose={() => setShowSolution(false)}
              question={selectedQuestion}
              userId={user.userId}
              serverUrl={serverUrl}
              onSave={() => {
                // Refresh or show success message
                console.log('Solution saved');
              }}
            />
          )}

          {/* Filters */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Difficulty</label>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {difficulties.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Source</label>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {sources.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <div className="w-full bg-gray-700 rounded-lg px-3 py-2 text-gray-300 text-sm">
                  <span className="block md:hidden">Total:</span>
                  <span className="font-semibold">{filteredQuestions.length} of {questions.length}</span>
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedTopic !== 'All' && (
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm flex items-center">
                  Topic: {selectedTopic}
                  <button 
                    onClick={() => setSelectedTopic('All')}
                    className="ml-2 hover:text-purple-200"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedPattern !== 'All' && (
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center">
                  Pattern: {selectedPattern}
                  <button 
                    onClick={() => setSelectedPattern('All')}
                    className="ml-2 hover:text-blue-200"
                  >
                    ×
                  </button>
                </span>
              )}
              {showReviewOnly && (
                <span className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm flex items-center">
                  📌 Review Later
                  <button 
                    onClick={() => setShowReviewOnly(false)}
                    className="ml-2 hover:text-yellow-200"
                  >
                    ×
                  </button>
                </span>
              )}
              {showOverdueOnly && (
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm flex items-center">
                  ⚠️ Overdue
                  <button 
                    onClick={() => setShowOverdueOnly(false)}
                    className="ml-2 hover:text-red-200"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>

          {/* Questions List */}
          <QuestionList
            questions={filteredQuestions}
            completedQuestions={completedQuestions}
            reviewLater={reviewLater}
            overdueRevisions={overdueRevisions}
            onToggleComplete={toggleQuestion}
            onToggleReview={toggleReviewLater}
            onMarkRevision={markForRevision}
            onOpenSolution={(question) => {
              setSelectedQuestion(question);
              setShowSolution(true);
            }}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
