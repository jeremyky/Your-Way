'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  MessageCircle, 
  BarChart3, 
  Sun, 
  AlertTriangle,
  Brain,
  Shield
} from 'lucide-react';
import { PsychologyChat } from '@/components/psychology/PsychologyChat';
import { InsightsDashboard } from '@/components/psychology/InsightsDashboard';
import { DailyReflection } from '@/components/psychology/DailyReflection';

type TabType = 'chat' | 'insights' | 'reflection';

// Development mode - bypass authentication for testing
const isDevelopment = process.env.NODE_ENV === 'development';
const bypassAuth = isDevelopment && (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url_here');

export default function PsychologyPage() {
  const user = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [showCrisisModal, setShowCrisisModal] = useState(false);

  // Mock user for development mode
  const mockUser = {
    id: 'dev-user-123',
    email: 'dev@yourway.com',
    user_metadata: {
      full_name: 'Development User'
    }
  };

  // Use mock user in development mode if no real user
  const currentUser = bypassAuth ? mockUser : user;

  useEffect(() => {
    // Only redirect if we're not in development mode and there's no user
    if (!bypassAuth && !user) {
      router.push('/auth');
    }
  }, [user, router, bypassAuth]);

  const handleCrisisDetected = () => {
    setShowCrisisModal(true);
    toast.error('Crisis detected - please seek professional help immediately');
  };

  const handleReflectionSubmitted = () => {
    // Refresh insights when new reflection is submitted
    if (activeTab === 'insights') {
      // Trigger insights refresh
      window.location.reload();
    }
  };

  // Show loading only if we're waiting for real authentication
  if (!bypassAuth && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'chat' as TabType,
      label: 'InnerGuide Chat',
      icon: MessageCircle,
      description: 'Talk with your AI coach'
    },
    {
      id: 'insights' as TabType,
      label: 'Insights & Patterns',
      icon: BarChart3,
      description: 'View your growth patterns'
    },
    {
      id: 'reflection' as TabType,
      label: 'Daily Reflection',
      icon: Sun,
      description: 'Daily reflection prompts'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Brain className="w-8 h-8 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">YourWay Psychology</h1>
                {bypassAuth && (
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                    Dev Mode
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Privacy-focused • AI-powered • Growth-oriented</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {currentUser?.user_metadata?.full_name || currentUser?.email}
              </span>
              {bypassAuth && (
                <button
                  onClick={() => router.push('/auth')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Setup Auth
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'chat' && (
          <PsychologyChat 
            userId={currentUser?.id || 'dev-user-123'} 
            onCrisisDetected={handleCrisisDetected}
          />
        )}
        
        {activeTab === 'insights' && (
          <InsightsDashboard userId={currentUser?.id || 'dev-user-123'} />
        )}
        
        {activeTab === 'reflection' && (
          <DailyReflection 
            userId={currentUser?.id || 'dev-user-123'} 
            onReflectionSubmitted={handleReflectionSubmitted}
          />
        )}
      </div>

      {/* Crisis Modal */}
      {showCrisisModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Crisis Alert</h3>
            </div>
            <p className="text-gray-700 mb-6">
              If you're experiencing thoughts of self-harm or suicide, please seek immediate professional help:
            </p>
            <div className="space-y-3 mb-6">
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-red-800 font-semibold">National Suicide Prevention Lifeline</p>
                <p className="text-red-700">988 or 1-800-273-8255</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-blue-800 font-semibold">Crisis Text Line</p>
                <p className="text-blue-700">Text HOME to 741741</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCrisisModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <a
                href="https://988lifeline.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-center"
              >
                Get Help Now
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 