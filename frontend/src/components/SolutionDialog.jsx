import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';

const SolutionDialog = ({ isOpen, onClose, question, userId, serverUrl, onSave }) => {
  const [code, setCode] = useState('');
  const [links, setLinks] = useState(['']);
  const [language, setLanguage] = useState('cpp');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && question) {
      loadSolution();
    }
  }, [isOpen, question]);

  const loadSolution = async () => {
    setLoading(true);
    setError('');
    try {
      console.log(`Loading solution for question ${question.id} for user ${userId}`);
      
      // IMPORTANT: Add headers with user-id
      const response = await axios.get(`${serverUrl}/api/solutions/${userId}/${question.id}`, {
        headers: { 
          'user-id': userId  // This is required by verifyUser middleware
        }
      });
      
      console.log('Loaded solution:', response.data);
      
      setCode(response.data.code || '');
      setLinks(response.data.links?.length ? response.data.links : ['']);
    } catch (error) {
      console.error('Error loading solution:', error);
      if (error.response?.status === 401) {
        setError('Authentication failed. Please try logging in again.');
      } else {
        setError('Failed to load solution');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = () => {
    setLinks([...links, '']);
  };

  const handleLinkChange = (index, value) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const handleRemoveLink = (index) => {
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks.length ? newLinks : ['']);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const filteredLinks = links.filter(link => link.trim() !== '');
      console.log('Saving solution:', { questionId: question.id, code, links: filteredLinks });
      
      await axios.post(`${serverUrl}/api/solutions/save`, {
        questionId: question.id,
        code,
        links: filteredLinks
      }, {
        headers: { 'user-id': userId }
      });
      
      console.log('Solution saved successfully');
      onSave?.();
      onClose();
    } catch (error) {
      console.error('Error saving solution:', error);
      if (error.response?.status === 401) {
        setError('Authentication failed. Please try logging in again.');
      } else {
        setError('Failed to save solution');
      }
    } finally {
      setSaving(false);
    }
  };

  // Also update the solution when language changes? (optional)
  // This is just for UI, doesn't affect saved solution
  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  if (!isOpen) return null;

  const getLanguageForPrism = (lang) => {
    switch(lang) {
      case 'cpp': return languages.cpp;
      case 'java': return languages.java;
      case 'python': return languages.python;
      case 'javascript': return languages.javascript;
      default: return languages.cpp;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-5xl max-h-[95vh] overflow-hidden border border-purple-500/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-3 md:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white">{question.name}</h2>
            <p className="text-sm text-gray-300 mt-1">
              {question.topic} • {question.difficulty} • {question.pattern}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white transition-colors self-end sm:self-auto"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-gray-400 mt-2">Loading solution...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {!loading && (
            <>
              {/* Language Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Language
                </label>
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>

              {/* Code Editor */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Solution Code
                </label>
                <div className="border border-gray-700 rounded-lg overflow-hidden">
                  <Editor
                    value={code}
                    onValueChange={setCode}
                    highlight={code => highlight(code, getLanguageForPrism(language), language)}
                    padding={16}
                    className="bg-gray-800 text-gray-100 font-mono text-sm min-h-[300px]"
                    style={{
                      fontFamily: '"Fira Code", "Fira Mono", monospace',
                      fontSize: 14,
                    }}
                  />
                </div>
              </div>

              {/* Links */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Reference Links
                </label>
                <div className="space-y-3">
                  {links.map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => handleLinkChange(index, e.target.value)}
                        placeholder="https://..."
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={() => handleRemoveLink(index)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        title="Remove link"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleAddLink}
                    className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Link
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800 p-3 md:p-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 order-1 sm:order-2"
          >
            {saving ? 'Saving...' : 'Save Solution'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SolutionDialog;