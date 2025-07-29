'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  TrendingUp, 
  Brain, 
  Target, 
  Calendar, 
  BarChart3, 
  Lightbulb,
  RefreshCw,
  Activity
} from 'lucide-react';

interface InsightsData {
  totalEntries: number;
  contentTypes: Record<string, number>;
  recentActivity: {
    journalEntries: any[];
    moodEntries: any[];
    goals: any[];
    conversations: any[];
  };
  moodTrends?: Record<string, string[]>;
  goalProgress?: Record<string, number>;
  weeklySummary?: string;
  patterns?: string[];
}

interface InsightsDashboardProps {
  userId: string;
}

export function InsightsDashboard({ userId }: InsightsDashboardProps) {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInsights();
  }, [userId]);

  const loadInsights = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/psychology/insights?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setInsights(data.data);
      } else {
        throw new Error(data.error || 'Failed to load insights');
      }
    } catch (err) {
      console.error('Error loading insights:', err);
      setError('Failed to load insights. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading your insights...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadInsights} className="bg-blue-600 hover:bg-blue-700">
          Try Again
        </Button>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="text-center p-8">
        <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-600">No insights available yet.</p>
        <p className="text-sm text-gray-500">Start journaling and chatting to see your patterns.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Your Insights</h2>
            <p className="text-purple-100">Personal growth patterns and recommendations</p>
          </div>
          <Button 
            onClick={loadInsights}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold text-gray-900">{insights.totalEntries}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Brain className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Content Types</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(insights.contentTypes).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Goals</p>
              <p className="text-2xl font-bold text-gray-900">
                {insights.goalProgress?.in_progress || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Mood Entries</p>
              <p className="text-2xl font-bold text-gray-900">
                {insights.contentTypes.mood || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly Summary */}
      {insights.weeklySummary && (
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold">Weekly Summary</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">{insights.weeklySummary}</p>
        </Card>
      )}

      {/* Patterns */}
      {insights.patterns && insights.patterns.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold">Patterns I Notice</h3>
          </div>
          <div className="space-y-3">
            {insights.patterns.map((pattern, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">{pattern}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Content Type Breakdown */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <BarChart3 className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold">Your Activity Breakdown</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(insights.contentTypes).map(([type, count]) => (
            <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-sm text-gray-600 capitalize">{type} entries</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Goal Progress */}
      {insights.goalProgress && Object.keys(insights.goalProgress).length > 0 && (
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Target className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold">Goal Progress</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(insights.goalProgress).map(([status, count]) => (
              <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-600 capitalize">
                  {status.replace('_', ' ')} goals
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Activity className="w-6 h-6 text-orange-600" />
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </div>
        <div className="space-y-4">
          {insights.recentActivity.journalEntries.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recent Journal Entries</h4>
              <div className="space-y-2">
                {insights.recentActivity.journalEntries.slice(0, 3).map((entry, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {entry.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insights.recentActivity.moodEntries.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recent Mood Entries</h4>
              <div className="space-y-2">
                {insights.recentActivity.moodEntries.slice(0, 3).map((entry, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{entry.mood}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Suggestions */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center space-x-3 mb-4">
          <Lightbulb className="w-6 h-6 text-yellow-600" />
          <h3 className="text-lg font-semibold">Growth Suggestions</h3>
        </div>
        <div className="space-y-3">
          <div className="p-4 bg-white rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>Keep journaling regularly</strong> - Your consistent entries help identify patterns and track progress.
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-purple-200">
            <p className="text-sm text-gray-700">
              <strong>Try mood tracking</strong> - Understanding your emotional patterns can lead to better self-awareness.
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-green-200">
            <p className="text-sm text-gray-700">
              <strong>Set specific goals</strong> - Clear, measurable goals help maintain focus and motivation.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
} 