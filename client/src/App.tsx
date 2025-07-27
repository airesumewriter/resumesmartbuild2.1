import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ResumeProvider } from './contexts/ResumeContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import TemplateSelection from './pages/TemplateSelection';
import ResumeEditor from './pages/ResumeEditor';
import ATSScanner from './pages/ATSScanner';
import JobMatcher from './pages/JobMatcher';
import CoverLetterGenerator from './pages/CoverLetterGenerator';
import PricingPage from './pages/PricingPage';
import Dashboard from './pages/Dashboard';
import AuthModal from './components/AuthModal';
import { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ResumeProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/templates" element={<TemplateSelection />} />
                <Route path="/editor/:templateId?" element={<ResumeEditor />} />
                <Route path="/scanner" element={<ATSScanner />} />
                <Route path="/jobs" element={<JobMatcher />} />
                <Route path="/cover-letter" element={<CoverLetterGenerator />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Routes>
            </main>
            <AuthModal />
            <Toaster position="top-right" />
          </div>
        </Router>
      </ResumeProvider>
    </AuthProvider>
  );
}

export default App;