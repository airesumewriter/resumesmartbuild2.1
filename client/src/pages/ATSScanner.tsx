import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { scanAPI } from '../services/api';
import toast from 'react-hot-toast';

interface ScanResult {
  score: number;
  suggestions: string[];
  keywords: {
    found: string[];
    missing: string[];
  };
  structure: {
    present: string[];
    missing: string[];
  };
  readability: {
    score: number;
    level: string;
  };
}

const ATSScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobPosition, setJobPosition] = useState('');
  const { state, openAuthModal, updateScansRemaining } = useAuth();

  const handleScan = async () => {
    if (!resumeText.trim()) {
      toast.error('Please paste your resume content');
      return;
    }

    if (!state.user) {
      openAuthModal('register');
      return;
    }

    if (!state.user.isPremium && state.user.scansRemaining <= 0) {
      toast.error('No scans remaining. Upgrade to premium for unlimited scans.');
      return;
    }

    setIsScanning(true);
    
    try {
      // Create a temporary resume for scanning
      const tempResume = {
        content: {
          summary: resumeText,
          personalInfo: { name: '', email: '', phone: '', location: '' },
          experience: [],
          education: [],
          skills: []
        }
      };

      // This would normally call the API with a real resume ID
      // For demo purposes, we'll simulate the scan result
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate scanning time

      const mockResult: ScanResult = {
        score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
        suggestions: [
          'Add more relevant keywords for your target position',
          'Include specific metrics and achievements',
          'Use standard section headers (Experience, Education, Skills)',
          'Optimize for ATS readability with bullet points',
          'Include relevant certifications and training'
        ],
        keywords: {
          found: ['leadership', 'project management', 'python', 'sql'],
          missing: ['agile', 'aws', 'docker', 'kubernetes', 'machine learning']
        },
        structure: {
          present: ['experience', 'education'],
          missing: ['skills', 'summary', 'certifications']
        },
        readability: {
          score: 85,
          level: 'good'
        }
      };

      setScanResult(mockResult);
      
      if (!state.user.isPremium) {
        updateScansRemaining(state.user.scansRemaining - 1);
      }
      
      toast.success('Resume scan completed!');
    } catch (error) {
      toast.error('Scan failed. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return '🏆 Excellent';
    if (score >= 80) return '⭐ Good';
    if (score >= 70) return '👍 Fair';
    return '⚠️ Needs Work';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ATS Resume Scanner
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get instant feedback on your resume's ATS compatibility and receive 
            personalized suggestions to improve your chances of getting interviews.
          </p>
          {state.user && !state.user.isPremium && (
            <p className="mt-4 text-sm text-gray-500">
              {state.user.scansRemaining} free scans remaining
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Paste Your Resume Content
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="jobPosition" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Job Position (Optional)
                </label>
                <input
                  type="text"
                  id="jobPosition"
                  value={jobPosition}
                  onChange={(e) => setJobPosition(e.target.value)}
                  placeholder="e.g., Software Engineer, Marketing Manager"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="resumeText" className="block text-sm font-medium text-gray-700 mb-2">
                  Resume Content
                </label>
                <textarea
                  id="resumeText"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows={12}
                  placeholder="Paste your resume text here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <button
                onClick={handleScan}
                disabled={isScanning || !resumeText.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScanning ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                    Scanning Resume...
                  </div>
                ) : (
                  'Scan My Resume'
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Scan Results
            </h2>

            <AnimatePresence>
              {isScanning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <div className="pacman-animation text-6xl mb-4">🟡</div>
                  <p className="text-gray-600">Analyzing your resume...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <div className="bg-blue-600 h-2 rounded-full progress-animated" style={{'--progress-width': '100%'} as any}></div>
                  </div>
                </motion.div>
              )}

              {!isScanning && !scanResult && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-500">Paste your resume content and click scan to get started</p>
                </div>
              )}

              {scanResult && !isScanning && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Score */}
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className={`text-4xl font-bold ${getScoreColor(scanResult.score)} mb-2`}>
                      {scanResult.score}%
                    </div>
                    <div className="text-lg font-medium text-gray-900">
                      {getScoreBadge(scanResult.score)}
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">💡 Improvement Suggestions</h3>
                    <ul className="space-y-2">
                      {scanResult.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <span className="text-sm text-gray-700">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Keywords */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">🔑 Keywords Analysis</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-green-700 mb-1">Found Keywords:</p>
                        <div className="flex flex-wrap gap-1">
                          {scanResult.keywords.found.map((keyword, index) => (
                            <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-700 mb-1">Missing Keywords:</p>
                        <div className="flex flex-wrap gap-1">
                          {scanResult.keywords.missing.map((keyword, index) => (
                            <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Optimize Resume
                    </button>
                    <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                      Download Report
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            What Our ATS Scanner Checks
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-gray-900 mb-2">Keyword Optimization</h3>
              <p className="text-sm text-gray-600">Analyzes job-relevant keywords and suggests improvements</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">📋</div>
              <h3 className="font-semibold text-gray-900 mb-2">Structure & Format</h3>
              <p className="text-sm text-gray-600">Ensures your resume has all required sections and proper formatting</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-gray-900 mb-2">Readability Score</h3>
              <p className="text-sm text-gray-600">Checks if your content is clear and easy to understand</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ATSScanner;