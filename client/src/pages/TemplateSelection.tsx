import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const TemplateSelection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const { state, openAuthModal } = useAuth();

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'tech', label: 'Technology' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'finance', label: 'Finance' },
    { id: 'marketing', label: 'Marketing' }
  ];

  const templates = [
    {
      id: '1',
      name: 'Modern Tech',
      category: 'tech',
      isFree: true,
      previewUrl: '/previews/modern-tech.jpg',
      description: 'Clean, modern design perfect for software engineers and tech professionals'
    },
    {
      id: '2',
      name: 'Healthcare Professional',
      category: 'healthcare',
      isFree: true,
      previewUrl: '/previews/healthcare.jpg',
      description: 'Professional layout designed for medical and healthcare workers'
    },
    {
      id: '3',
      name: 'Executive Premium',
      category: 'finance',
      isFree: false,
      previewUrl: '/previews/executive.jpg',
      description: 'Elegant design for senior executives and finance professionals'
    },
    {
      id: '4',
      name: 'Creative Marketing',
      category: 'marketing',
      isFree: false,
      previewUrl: '/previews/creative.jpg',
      description: 'Eye-catching layout perfect for marketing and creative roles'
    },
    {
      id: '5',
      name: 'Minimal Professional',
      category: 'all',
      isFree: true,
      previewUrl: '/previews/minimal.jpg',
      description: 'Versatile, clean design suitable for any industry'
    },
    {
      id: '6',
      name: 'Data Scientist',
      category: 'tech',
      isFree: false,
      previewUrl: '/previews/data-science.jpg',
      description: 'Specialized template for data science and analytics roles'
    }
  ];

  const filteredTemplates = templates.filter(template => {
    const categoryMatch = selectedCategory === 'all' || template.category === selectedCategory;
    const premiumMatch = !showPremiumOnly || !template.isFree;
    return categoryMatch && premiumMatch;
  });

  const handleUseTemplate = (template: any) => {
    if (!template.isFree && !state.user?.isPremium) {
      // Redirect to pricing page for premium templates
      return;
    }
    
    if (!state.user) {
      openAuthModal('register');
      return;
    }

    // Navigate to editor with template
    window.location.href = `/editor/${template.id}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Template
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select from our collection of ATS-optimized resume templates designed by career experts
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Premium Filter */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="premium-only"
                checked={showPremiumOnly}
                onChange={(e) => setShowPremiumOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="premium-only" className="text-sm font-medium text-gray-700">
                Premium only
              </label>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group"
            >
              {/* Template Preview */}
              <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center mb-4">
                      <span className="text-2xl">📄</span>
                    </div>
                    <p className="text-gray-600 font-medium">{template.name}</p>
                  </div>
                </div>
                
                {/* Premium Badge */}
                {!template.isFree && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      PREMIUM
                    </span>
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Use Template
                  </button>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{template.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    template.isFree 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {template.isFree ? 'Free' : 'Premium'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                
                <button
                  onClick={() => handleUseTemplate(template)}
                  className={`w-full py-2 rounded-lg font-medium transition-colors ${
                    template.isFree || state.user?.isPremium
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!template.isFree && !state.user?.isPremium}
                >
                  {!template.isFree && !state.user?.isPremium
                    ? 'Upgrade to Premium'
                    : 'Use This Template'
                  }
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500">Try adjusting your filters to see more results.</p>
          </div>
        )}

        {/* CTA for Premium */}
        {!state.user?.isPremium && (
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Unlock All Premium Templates
            </h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Get access to our entire collection of premium templates, unlimited ATS scans, 
              and advanced job matching features.
            </p>
            <Link
              to="/pricing"
              className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              View Pricing Plans
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateSelection;