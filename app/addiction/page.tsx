'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface AddictionEntry {
  id: string;
  type: string;
  substance: string;
  severity: number; // 1-10 scale
  frequency: string;
  impact: string;
  triggers: string[];
  copingStrategies: string[];
  created_at: string;
}

interface ProgressEntry {
  id: string;
  date: string;
  mood: number; // 1-10 scale
  cravings: number; // 1-10 scale
  triggers: string[];
  copingUsed: string[];
  relapsed: boolean;
  notes: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  daysRequired: number;
  achieved: boolean;
  achievedDate?: string;
}

const ADDICTION_TYPES = [
  'Alcohol', 'Tobacco/Nicotine', 'Cannabis', 'Prescription Drugs', 
  'Illegal Drugs', 'Gambling', 'Gaming', 'Social Media', 
  'Shopping', 'Food', 'Exercise', 'Work', 'Other'
];

const FREQUENCY_OPTIONS = [
  'Multiple times daily', 'Daily', 'Several times a week', 
  'Weekly', 'Monthly', 'Occasionally'
];

const IMPACT_AREAS = [
  'Physical Health', 'Mental Health', 'Relationships', 
  'Work/School', 'Finances', 'Legal Issues', 'Social Life'
];

const COMMON_TRIGGERS = [
  'Stress', 'Anxiety', 'Depression', 'Boredom', 'Social situations',
  'Emotional pain', 'Celebration', 'Peer pressure', 'Accessibility',
  'Routine/habits', 'Environmental cues', 'Emotional triggers'
];

const COPING_STRATEGIES = [
  'Deep breathing', 'Meditation', 'Exercise', 'Call a friend',
  'Journaling', 'Distraction activities', 'Professional help',
  'Support groups', 'Mindfulness', 'Creative activities',
  'Nature walks', 'Reading', 'Music', 'Cooking'
];

const MILESTONES: Milestone[] = [
  { id: '1', title: 'First Day', description: 'Complete your first day of recovery', daysRequired: 1, achieved: false },
  { id: '2', title: 'One Week', description: 'One week of progress', daysRequired: 7, achieved: false },
  { id: '3', title: 'Two Weeks', description: 'Two weeks of recovery', daysRequired: 14, achieved: false },
  { id: '4', title: 'One Month', description: 'One month milestone', daysRequired: 30, achieved: false },
  { id: '5', title: 'Three Months', description: 'Three months of recovery', daysRequired: 90, achieved: false },
  { id: '6', title: 'Six Months', description: 'Half a year of progress', daysRequired: 180, achieved: false },
  { id: '7', title: 'One Year', description: 'One year of recovery', daysRequired: 365, achieved: false },
];

const CRISIS_RESOURCES = [
  {
    name: 'National Suicide Prevention Lifeline',
    phone: '988',
    description: '24/7 crisis support'
  },
  {
    name: 'SAMHSA National Helpline',
    phone: '1-800-662-HELP (4357)',
    description: 'Treatment referral and information'
  },
  {
    name: 'Crisis Text Line',
    text: 'Text HOME to 741741',
    description: '24/7 crisis counseling via text'
  }
];

export default function AddictionRecoveryPage() {
  const [addictionEntries, setAddictionEntries] = useState<AddictionEntry[]>([]);
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>(MILESTONES);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tracking' | 'education' | 'resources'>('overview');
  const [userId, setUserId] = useState<string | null>(null);

  const [addictionForm, setAddictionForm] = useState({
    type: '',
    substance: '',
    severity: 5,
    frequency: 'Daily',
    impact: '',
    triggers: [] as string[],
    copingStrategies: [] as string[],
  });

  const [progressForm, setProgressForm] = useState({
    mood: 5,
    cravings: 5,
    triggers: [] as string[],
    copingUsed: [] as string[],
    relapsed: false,
    notes: '',
  });

  // Get userId from localStorage (auth bypass)
  useEffect(() => {
    const user = localStorage.getItem('yourway-user');
    if (user) {
      try {
        setUserId(JSON.parse(user).id);
      } catch {
        setUserId(null);
      }
    }
  }, []);

  // Load data from localStorage
  useEffect(() => {
    if (userId) {
      const savedAddictions = localStorage.getItem('yourway-addictions');
      const savedProgress = localStorage.getItem('yourway-addiction-progress');
      const savedMilestones = localStorage.getItem('yourway-addiction-milestones');
      
      if (savedAddictions) setAddictionEntries(JSON.parse(savedAddictions));
      if (savedProgress) setProgressEntries(JSON.parse(savedProgress));
      if (savedMilestones) setMilestones(JSON.parse(savedMilestones));
    }
  }, [userId]);

  // Save data to localStorage
  useEffect(() => {
    if (userId) {
      localStorage.setItem('yourway-addictions', JSON.stringify(addictionEntries));
      localStorage.setItem('yourway-addiction-progress', JSON.stringify(progressEntries));
      localStorage.setItem('yourway-addiction-milestones', JSON.stringify(milestones));
    }
  }, [addictionEntries, progressEntries, milestones, userId]);

  // Update milestones based on progress
  useEffect(() => {
    const cleanDays = calculateCleanDays();
    const updatedMilestones = milestones.map(milestone => ({
      ...milestone,
      achieved: cleanDays >= milestone.daysRequired,
      achievedDate: cleanDays >= milestone.daysRequired && !milestone.achievedDate 
        ? new Date().toISOString() 
        : milestone.achievedDate
    }));
    setMilestones(updatedMilestones);
  }, [progressEntries]);

  const calculateCleanDays = () => {
    if (progressEntries.length === 0) return 0;
    
    const sortedEntries = [...progressEntries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let cleanDays = 0;
    for (let i = 0; i < sortedEntries.length; i++) {
      if (sortedEntries[i].relapsed) break;
      cleanDays++;
    }
    
    return cleanDays;
  };

  const handleAddictionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addictionForm.type || !addictionForm.substance) return;

    const newEntry: AddictionEntry = {
      id: 'add-' + Date.now(),
      ...addictionForm,
      created_at: new Date().toISOString(),
    };

    setAddictionEntries(prev => [...prev, newEntry]);
    setAddictionForm({
      type: '',
      substance: '',
      severity: 5,
      frequency: 'Daily',
      impact: '',
      triggers: [],
      copingStrategies: [],
    });
    setShowAddForm(false);
  };

  const handleProgressSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newEntry: ProgressEntry = {
      id: 'prog-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      ...progressForm,
    };

    setProgressEntries(prev => [...prev, newEntry]);
    setProgressForm({
      mood: 5,
      cravings: 5,
      triggers: [],
      copingUsed: [],
      relapsed: false,
      notes: '',
    });
    setShowProgressForm(false);
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'text-green-600';
    if (mood >= 6) return 'text-blue-600';
    if (mood >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCravingsColor = (cravings: number) => {
    if (cravings <= 3) return 'text-green-600';
    if (cravings <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'text-green-600';
    if (severity <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Crisis Warning */}
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Crisis Support Available
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>If you're in crisis or having thoughts of self-harm, help is available 24/7:</p>
                <ul className="mt-1 space-y-1">
                  {CRISIS_RESOURCES.map((resource, index) => (
                    <li key={index}>
                      <strong>{resource.name}:</strong> {resource.phone || resource.text} - {resource.description}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Recovery Journey</h1>
          <p className="text-lg text-gray-600">Understanding, tracking, and overcoming addiction</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center mb-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'tracking', label: 'Progress Tracking' },
            { id: 'education', label: 'Education' },
            { id: 'resources', label: 'Resources' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 mx-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Progress Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Your Recovery Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{calculateCleanDays()}</div>
                    <div className="text-gray-600">Days Clean</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{addictionEntries.length}</div>
                    <div className="text-gray-600">Addictions Tracked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{progressEntries.length}</div>
                    <div className="text-gray-600">Progress Entries</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Milestones */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {milestones.filter(m => m.achieved).slice(-3).map(milestone => (
                    <div key={milestone.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold">{milestone.title}</div>
                        <div className="text-sm text-gray-600">{milestone.description}</div>
                        {milestone.achievedDate && (
                          <div className="text-xs text-gray-500">
                            Achieved: {new Date(milestone.achievedDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Button
                onClick={() => setShowAddForm(true)}
                className="h-32 text-lg bg-red-600 hover:bg-red-700"
              >
                Add New Addiction to Track
              </Button>
              <Button
                onClick={() => setShowProgressForm(true)}
                className="h-32 text-lg bg-blue-600 hover:bg-blue-700"
              >
                Log Today's Progress
              </Button>
            </div>
          </div>
        )}

        {/* Tracking Tab */}
        {activeTab === 'tracking' && (
          <div className="space-y-8">
            {/* Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressEntries.slice(-7).map(entry => (
                    <div key={entry.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium w-20">{entry.date}</div>
                      <div className={`text-sm ${getMoodColor(entry.mood)}`}>
                        Mood: {entry.mood}/10
                      </div>
                      <div className={`text-sm ${getCravingsColor(entry.cravings)}`}>
                        Cravings: {entry.cravings}/10
                      </div>
                      <div className="text-sm">
                        {entry.relapsed ? (
                          <span className="text-red-600 font-medium">Relapsed</span>
                        ) : (
                          <span className="text-green-600 font-medium">Stayed Clean</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Addiction List */}
            <Card>
              <CardHeader>
                <CardTitle>Tracked Addictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {addictionEntries.map(entry => (
                    <div key={entry.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{entry.substance}</h3>
                        <span className="text-sm text-gray-500">{entry.type}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Severity:</span>
                          <span className={`ml-1 ${getSeverityColor(entry.severity)}`}>
                            {entry.severity}/10
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Frequency:</span>
                          <span className="ml-1">{entry.frequency}</span>
                        </div>
                        <div>
                          <span className="font-medium">Impact:</span>
                          <span className="ml-1">{entry.impact}</span>
                        </div>
                        <div>
                          <span className="font-medium">Triggers:</span>
                          <span className="ml-1">{entry.triggers.length}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Education Tab */}
        {activeTab === 'education' && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Understanding Addiction</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <h3>What is Addiction?</h3>
                <p>
                  Addiction is a complex brain disorder characterized by compulsive engagement in rewarding stimuli, 
                  despite adverse consequences. It affects the brain's reward, motivation, and memory systems.
                </p>

                <h3>Types of Addiction</h3>
                <ul>
                  <li><strong>Substance Addictions:</strong> Alcohol, drugs, nicotine, prescription medications</li>
                  <li><strong>Behavioral Addictions:</strong> Gambling, gaming, social media, shopping, work</li>
                  <li><strong>Process Addictions:</strong> Food, exercise, sex, internet use</li>
                </ul>

                <h3>Signs and Symptoms</h3>
                <ul>
                  <li>Loss of control over use/behavior</li>
                  <li>Continued use despite negative consequences</li>
                  <li>Preoccupation with the substance/behavior</li>
                  <li>Withdrawal symptoms when not using</li>
                  <li>Tolerance (needing more to achieve the same effect)</li>
                  <li>Neglecting responsibilities and relationships</li>
                </ul>

                <h3>The Science of Addiction</h3>
                <p>
                  Addiction changes the brain's chemistry and structure, particularly affecting:
                </p>
                <ul>
                  <li><strong>Dopamine System:</strong> The brain's reward pathway</li>
                  <li><strong>Prefrontal Cortex:</strong> Decision-making and impulse control</li>
                  <li><strong>Memory Systems:</strong> Creating powerful associations</li>
                </ul>

                <h3>Recovery is Possible</h3>
                <p>
                  The brain has remarkable plasticity - it can heal and form new, healthy patterns. 
                  Recovery involves retraining the brain and developing new coping mechanisms.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Support Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Crisis Resources</h3>
                    <div className="space-y-2">
                      {CRISIS_RESOURCES.map((resource, index) => (
                        <div key={index} className="p-3 bg-red-50 rounded-lg">
                          <div className="font-medium">{resource.name}</div>
                          <div className="text-sm text-gray-600">
                            {resource.phone || resource.text}
                          </div>
                          <div className="text-xs text-gray-500">{resource.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Recovery Resources</h3>
                    <div className="space-y-2">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="font-medium">Alcoholics Anonymous (AA)</div>
                        <div className="text-sm text-gray-600">12-step program for alcohol recovery</div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="font-medium">Narcotics Anonymous (NA)</div>
                        <div className="text-sm text-gray-600">12-step program for drug recovery</div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="font-medium">Smart Recovery</div>
                        <div className="text-sm text-gray-600">Science-based recovery program</div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="font-medium">Professional Therapy</div>
                        <div className="text-sm text-gray-600">Individual and group therapy options</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add Addiction Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Add New Addiction to Track</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddictionSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Addiction Type
                      </label>
                      <select
                        value={addictionForm.type}
                        onChange={(e) => setAddictionForm({ ...addictionForm, type: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        required
                      >
                        <option value="">Select type</option>
                        {ADDICTION_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specific Substance/Behavior
                      </label>
                      <input
                        type="text"
                        value={addictionForm.substance}
                        onChange={(e) => setAddictionForm({ ...addictionForm, substance: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        placeholder="e.g., Alcohol, Social Media, etc."
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Severity (1-10)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={addictionForm.severity}
                        onChange={(e) => setAddictionForm({ ...addictionForm, severity: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="text-center text-sm text-gray-600">{addictionForm.severity}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency
                      </label>
                      <select
                        value={addictionForm.frequency}
                        onChange={(e) => setAddictionForm({ ...addictionForm, frequency: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      >
                        {FREQUENCY_OPTIONS.map(freq => (
                          <option key={freq} value={freq}>{freq}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Primary Impact Area
                    </label>
                    <select
                      value={addictionForm.impact}
                      onChange={(e) => setAddictionForm({ ...addictionForm, impact: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select impact area</option>
                      {IMPACT_AREAS.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Triggers (select all that apply)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {COMMON_TRIGGERS.map(trigger => (
                        <label key={trigger} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={addictionForm.triggers.includes(trigger)}
                            onChange={() => setAddictionForm({
                              ...addictionForm,
                              triggers: toggleArrayItem(addictionForm.triggers, trigger)
                            })}
                            className="rounded"
                          />
                          <span className="text-sm">{trigger}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coping Strategies (select all that apply)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {COPING_STRATEGIES.map(strategy => (
                        <label key={strategy} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={addictionForm.copingStrategies.includes(strategy)}
                            onChange={() => setAddictionForm({
                              ...addictionForm,
                              copingStrategies: toggleArrayItem(addictionForm.copingStrategies, strategy)
                            })}
                            className="rounded"
                          />
                          <span className="text-sm">{strategy}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button type="submit" className="flex-1">
                      Add Addiction
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 bg-gray-500 hover:bg-gray-600"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress Form */}
        {showProgressForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Log Today's Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProgressSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mood (1-10)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={progressForm.mood}
                        onChange={(e) => setProgressForm({ ...progressForm, mood: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="text-center text-sm text-gray-600">{progressForm.mood}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cravings (1-10)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={progressForm.cravings}
                        onChange={(e) => setProgressForm({ ...progressForm, cravings: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="text-center text-sm text-gray-600">{progressForm.cravings}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Triggers Today (select all that apply)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {COMMON_TRIGGERS.map(trigger => (
                        <label key={trigger} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={progressForm.triggers.includes(trigger)}
                            onChange={() => setProgressForm({
                              ...progressForm,
                              triggers: toggleArrayItem(progressForm.triggers, trigger)
                            })}
                            className="rounded"
                          />
                          <span className="text-sm">{trigger}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coping Strategies Used (select all that apply)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {COPING_STRATEGIES.map(strategy => (
                        <label key={strategy} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={progressForm.copingUsed.includes(strategy)}
                            onChange={() => setProgressForm({
                              ...progressForm,
                              copingUsed: toggleArrayItem(progressForm.copingUsed, strategy)
                            })}
                            className="rounded"
                          />
                          <span className="text-sm">{strategy}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={progressForm.relapsed}
                        onChange={(e) => setProgressForm({ ...progressForm, relapsed: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">I relapsed today</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={progressForm.notes}
                      onChange={(e) => setProgressForm({ ...progressForm, notes: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="How are you feeling? What worked today? What was challenging?"
                      rows={3}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button type="submit" className="flex-1">
                      Log Progress
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowProgressForm(false)}
                      className="flex-1 bg-gray-500 hover:bg-gray-600"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 