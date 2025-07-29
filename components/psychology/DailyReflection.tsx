'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Sun, 
  PenTool, 
  Sparkles, 
  Send, 
  RefreshCw,
  Lightbulb,
  Heart,
  Target,
  Brain
} from 'lucide-react';

interface ReflectionData {
  prompt: string;
  context?: string;
  suggestions?: string[];
}

interface DailyReflectionProps {
  userId: string;
  onReflectionSubmitted?: () => void;
}

export function DailyReflection({ userId, onReflectionSubmitted }: DailyReflectionProps) {
  const [reflectionData, setReflectionData] = useState<ReflectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const { register, handleSubmit, reset, watch } = useForm<{ reflection: string }>();
  const reflectionText = watch('reflection', '');

  useEffect(() => {
    loadDailyReflection();
    checkTodaySubmission();
  }, [userId]);

  const loadDailyReflection = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/psychology/reflection?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setReflectionData(data.data);
      } else {
        throw new Error(data.error || 'Failed to load reflection');
      }
    } catch (error) {
      console.error('Error loading daily reflection:', error);
      toast.error('Failed to load reflection prompt');
      
      // Fallback prompt
      setReflectionData({
        prompt: 'Take a moment to reflect on your day. What stood out to you, and how are you feeling?',
        suggestions: [
          'Think about a challenge you faced and how you handled it',
          'Consider what you\'re grateful for today',
          'Reflect on a moment of growth or learning'
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkTodaySubmission = async () => {
    try {
      const today = new Date().toDateString();
      const response = await fetch(`/api/psychology/reflection?userId=${userId}&date=${today}`);
      const data = await response.json();
      setHasSubmittedToday(data.hasSubmitted || false);
    } catch (error) {
      console.error('Error checking today\'s submission:', error);
    }
  };

  const onSubmit = async (data: { reflection: string }) => {
    if (!data.reflection.trim()) return;

    setIsSubmitting(true);
    
    try {
      // Submit the reflection
      const response = await fetch('/api/psychology/reflection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          content: data.reflection,
          type: 'reflection'
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Reflection saved successfully!');
        setHasSubmittedToday(true);
        reset();
        
        if (onReflectionSubmitted) {
          onReflectionSubmitted();
        }
      } else {
        throw new Error(result.error || 'Failed to save reflection');
      }
    } catch (error) {
      console.error('Error submitting reflection:', error);
      toast.error('Failed to save reflection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewPrompt = () => {
    loadDailyReflection();
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading your daily reflection...</span>
        </div>
      </Card>
    );
  }

  if (hasSubmittedToday) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <Heart className="w-12 h-12 mx-auto mb-4 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Reflection Complete for Today
          </h3>
          <p className="text-gray-600 mb-4">
            You've already completed your daily reflection. Great job taking time for self-reflection!
          </p>
          <Button 
            onClick={handleNewPrompt}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Get New Prompt
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-6 rounded-lg">
        <div className="flex items-center space-x-3">
          <Sun className="w-8 h-8" />
          <div>
            <h2 className="text-xl font-semibold">Daily Reflection</h2>
            <p className="text-orange-100">Take a moment to pause and reflect on your day</p>
          </div>
        </div>
      </div>

      {/* Reflection Prompt */}
      <Card className="p-6">
        <div className="flex items-start space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Today's Reflection Prompt
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {reflectionData?.prompt}
            </p>
          </div>
        </div>

        {reflectionData?.context && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Context:</strong> {reflectionData.context}
            </p>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button 
            onClick={handleNewPrompt}
            variant="outline"
            className="text-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            New Prompt
          </Button>
        </div>
      </Card>

      {/* Suggestions */}
      {reflectionData?.suggestions && reflectionData.suggestions.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Lightbulb className="w-6 h-6 text-yellow-600" />
            <h3 className="text-lg font-semibold">Reflection Suggestions</h3>
          </div>
          <div className="space-y-3">
            {reflectionData.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <Target className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{suggestion}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Reflection Form */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <PenTool className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold">Your Reflection</h3>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <textarea
              {...register('reflection')}
              rows={6}
              placeholder="Share your thoughts, feelings, and insights from today..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {reflectionText.length} characters
            </p>
            
            <Button
              type="submit"
              disabled={isSubmitting || !reflectionText.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Save Reflection
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Benefits */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center space-x-3 mb-4">
          <Heart className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold">Why Daily Reflection Matters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg border border-green-200">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Brain className="w-4 h-4 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Self-Awareness</h4>
            <p className="text-sm text-gray-600">
              Understand your thoughts, feelings, and patterns
            </p>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Growth</h4>
            <p className="text-sm text-gray-600">
              Identify areas for improvement and celebrate progress
            </p>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Clarity</h4>
            <p className="text-sm text-gray-600">
              Gain perspective and make better decisions
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
} 