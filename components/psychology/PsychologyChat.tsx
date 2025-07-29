'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Send, AlertTriangle, Heart, Brain, Lightbulb } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isCrisis?: boolean;
  insights?: {
    patterns?: string[];
    recommendations?: string[];
  };
  followUpQuestion?: string;
}

interface PsychologyChatProps {
  userId: string;
  onCrisisDetected?: () => void;
}

export function PsychologyChat({ userId, onCrisisDetected }: PsychologyChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, reset, watch } = useForm<{ message: string }>();
  const messageText = watch('message', '');

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation history on mount
  useEffect(() => {
    loadConversationHistory();
  }, [userId]);

  const loadConversationHistory = async () => {
    try {
      const response = await fetch(`/api/psychology/chat?userId=${userId}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const history = data.data.map((conv: any) => ({
          id: conv.id,
          text: conv.message,
          isUser: true,
          timestamp: new Date(conv.created_at),
          isCrisis: conv.is_crisis
        }));
        
        setConversationHistory(history);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const onSubmit = async (data: { message: string }) => {
    if (!data.message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: data.message,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    reset();

    try {
      const response = await fetch('/api/psychology/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: data.message,
          userId: userId
        })
      });

      const result = await response.json();

      if (result.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: result.data.message,
          isUser: false,
          timestamp: new Date(),
          isCrisis: result.data.isCrisis,
          insights: result.data.insights,
          followUpQuestion: result.data.followUpQuestion
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Handle crisis detection
        if (result.data.isCrisis && onCrisisDetected) {
          onCrisisDetected();
          toast.error('Crisis detected - please seek professional help immediately');
        }
      } else {
        throw new Error(result.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I\'m having trouble connecting right now. Please try again in a moment.',
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    reset({ message: prompt });
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <Brain className="w-8 h-8" />
          <div>
            <h2 className="text-xl font-semibold">InnerGuide</h2>
            <p className="text-blue-100 text-sm">
              Your personal psychology-informed growth coach
            </p>
          </div>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="bg-gray-50 p-4 border-b">
        <p className="text-sm text-gray-600 mb-2">Quick prompts to get started:</p>
        <div className="flex flex-wrap gap-2">
          {[
            "I'm feeling overwhelmed today",
            "Help me understand my stress patterns",
            "I want to work on my self-confidence",
            "What should I reflect on today?"
          ].map((prompt, index) => (
            <button
              key={index}
              onClick={() => handleQuickPrompt(prompt)}
              className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Start a conversation with your InnerGuide</p>
            <p className="text-sm">Share your thoughts, feelings, or questions</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-lg ${
                message.isUser
                  ? 'bg-blue-600 text-white'
                  : message.isCrisis
                  ? 'bg-red-100 border border-red-300'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {message.isCrisis && (
                <div className="flex items-center space-x-2 mb-2 text-red-700">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Crisis Response</span>
                </div>
              )}
              
              <p className="whitespace-pre-wrap">{message.text}</p>
              
              {!message.isUser && message.insights && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  {message.insights.patterns && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-gray-600 mb-1">Patterns I notice:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {message.insights.patterns.map((pattern, index) => (
                          <li key={index} className="flex items-start space-x-1">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{pattern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {message.insights.recommendations && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Suggestions:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {message.insights.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-1">
                            <Lightbulb className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {!message.isUser && message.followUpQuestion && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-600 mb-1">Follow-up question:</p>
                  <p className="text-sm text-gray-700 italic">{message.followUpQuestion}</p>
                </div>
              )}
              
              <p className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSubmit(onSubmit)} className="flex space-x-2">
          <input
            {...register('message')}
            type="text"
            placeholder="Share your thoughts, feelings, or questions..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !messageText.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          InnerGuide is here to support your personal growth journey. 
          For crisis situations, please contact professional help immediately.
        </p>
      </div>
    </div>
  );
} 