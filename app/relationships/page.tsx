'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Relationship {
  id: string;
  name: string;
  type: 'family' | 'friend' | 'partner' | 'colleague' | 'other';
  closeness: number; // 1-10 scale
  supportLevel: number; // 1-10 scale
  conflictLevel: number; // 1-10 scale
  notes: string;
  created_at: string;
}

const RELATIONSHIP_TYPES = [
  { value: 'family', label: 'Family', color: 'bg-blue-500' },
  { value: 'friend', label: 'Friend', color: 'bg-green-500' },
  { value: 'partner', label: 'Partner', color: 'bg-red-500' },
  { value: 'colleague', label: 'Colleague', color: 'bg-purple-500' },
  { value: 'other', label: 'Other', color: 'bg-gray-500' },
];

export default function RelationshipDynamicsPage() {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'friend' as Relationship['type'],
    closeness: 5,
    supportLevel: 5,
    conflictLevel: 3,
    notes: '',
  });
  const [userId, setUserId] = useState<string | null>(null);

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

  // Load relationships from localStorage
  useEffect(() => {
    if (userId) {
      const saved = localStorage.getItem('yourway-relationships');
      if (saved) {
        setRelationships(JSON.parse(saved));
      }
    }
  }, [userId]);

  // Save relationships to localStorage
  useEffect(() => {
    if (userId && relationships.length > 0) {
      localStorage.setItem('yourway-relationships', JSON.stringify(relationships));
    }
  }, [relationships, userId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newRelationship: Relationship = {
      id: 'rel-' + Date.now(),
      ...formData,
      created_at: new Date().toISOString(),
    };

    setRelationships(prev => [...prev, newRelationship]);
    setFormData({
      name: '',
      type: 'friend',
      closeness: 5,
      supportLevel: 5,
      conflictLevel: 3,
      notes: '',
    });
    setShowForm(false);
  };

  const getRelationshipColor = (type: Relationship['type']) => {
    return RELATIONSHIP_TYPES.find(t => t.value === type)?.color || 'bg-gray-500';
  };

  const getClosenessColor = (closeness: number) => {
    if (closeness >= 8) return 'border-green-500';
    if (closeness >= 6) return 'border-blue-500';
    if (closeness >= 4) return 'border-yellow-500';
    return 'border-gray-500';
  };

  const getSupportColor = (support: number) => {
    if (support >= 8) return 'text-green-600';
    if (support >= 6) return 'text-blue-600';
    if (support >= 4) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getConflictColor = (conflict: number) => {
    if (conflict >= 8) return 'text-red-600';
    if (conflict >= 6) return 'text-orange-600';
    if (conflict >= 4) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-primary-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Relationship Dynamics</h1>
          <p className="text-lg text-gray-600">Map and understand your relationships</p>
        </div>

        {/* Add Relationship Button */}
        <div className="text-center mb-8">
          <Button
            onClick={() => setShowForm(true)}
            className="bg-primary-600 hover:bg-primary-700"
          >
            Add New Relationship
          </Button>
        </div>

        {/* Add Relationship Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Relationship</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                      placeholder="Enter person's name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as Relationship['type'] })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                    >
                      {RELATIONSHIP_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Closeness (1-10)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.closeness}
                      onChange={(e) => setFormData({ ...formData, closeness: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-gray-600">{formData.closeness}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Support Level (1-10)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.supportLevel}
                      onChange={(e) => setFormData({ ...formData, supportLevel: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-gray-600">{formData.supportLevel}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Conflict Level (1-10)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.conflictLevel}
                      onChange={(e) => setFormData({ ...formData, conflictLevel: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-gray-600">{formData.conflictLevel}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                    placeholder="Add notes about this relationship..."
                    rows={3}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">
                    Add Relationship
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Relationship Map */}
        {relationships.length > 0 ? (
          <div className="space-y-8">
            {/* Visual Relationship Tree */}
            <Card>
              <CardHeader>
                <CardTitle>Your Relationship Network</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative min-h-[400px] bg-white rounded-lg border-2 border-dashed border-gray-300 p-8">
                  {/* Center node (You) */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      You
                    </div>
                  </div>

                  {/* Relationship nodes */}
                  {relationships.map((rel, index) => {
                    const angle = (index * 360) / relationships.length;
                    const radius = 150;
                    const x = Math.cos((angle * Math.PI) / 180) * radius;
                    const y = Math.sin((angle * Math.PI) / 180) * radius;
                    const centerX = 200; // Half of container width
                    const centerY = 200; // Half of container height

                    return (
                      <div key={rel.id}>
                        {/* Connection line */}
                        <svg
                          className="absolute top-0 left-0 w-full h-full pointer-events-none"
                          style={{ zIndex: 1 }}
                        >
                          <line
                            x1={centerX}
                            y1={centerY}
                            x2={centerX + x}
                            y2={centerY + y}
                            stroke={getClosenessColor(rel.closeness).replace('border-', '')}
                            strokeWidth={rel.closeness / 2}
                            strokeDasharray={rel.conflictLevel > 5 ? "5,5" : "none"}
                          />
                        </svg>

                        {/* Relationship node */}
                        <div
                          className={`absolute w-12 h-12 ${getRelationshipColor(rel.type)} rounded-full flex items-center justify-center text-white font-bold text-xs cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform`}
                          style={{
                            left: centerX + x,
                            top: centerY + y,
                            zIndex: 2,
                          }}
                          onClick={() => setSelectedRelationship(rel)}
                          title={rel.name}
                        >
                          {rel.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Relationship List */}
            <Card>
              <CardHeader>
                <CardTitle>All Relationships</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relationships.map((rel) => (
                    <div
                      key={rel.id}
                      className={`p-4 rounded-lg border-2 ${getClosenessColor(rel.closeness)} cursor-pointer hover:shadow-md transition-shadow`}
                      onClick={() => setSelectedRelationship(rel)}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-3 h-3 ${getRelationshipColor(rel.type)} rounded-full`}></div>
                        <h3 className="font-semibold">{rel.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {RELATIONSHIP_TYPES.find(t => t.value === rel.type)?.label}
                      </p>
                      <div className="space-y-1 text-xs">
                        <div className={`${getSupportColor(rel.supportLevel)}`}>
                          Support: {rel.supportLevel}/10
                        </div>
                        <div className={`${getConflictColor(rel.conflictLevel)}`}>
                          Conflict: {rel.conflictLevel}/10
                        </div>
                        <div className="text-gray-600">
                          Closeness: {rel.closeness}/10
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No relationships yet</h3>
              <p className="text-gray-600 mb-4">Start mapping your relationships to see your network</p>
              <Button onClick={() => setShowForm(true)}>
                Add Your First Relationship
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Relationship Detail Modal */}
        {selectedRelationship && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className={`w-4 h-4 ${getRelationshipColor(selectedRelationship.type)} rounded-full`}></div>
                  <span>{selectedRelationship.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <p className="text-gray-900">
                    {RELATIONSHIP_TYPES.find(t => t.value === selectedRelationship.type)?.label}
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Closeness</label>
                    <div className={`text-lg font-bold ${getClosenessColor(selectedRelationship.closeness).replace('border-', 'text-')}`}>
                      {selectedRelationship.closeness}/10
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Support</label>
                    <div className={`text-lg font-bold ${getSupportColor(selectedRelationship.supportLevel)}`}>
                      {selectedRelationship.supportLevel}/10
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Conflict</label>
                    <div className={`text-lg font-bold ${getConflictColor(selectedRelationship.conflictLevel)}`}>
                      {selectedRelationship.conflictLevel}/10
                    </div>
                  </div>
                </div>

                {selectedRelationship.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <p className="text-gray-900">{selectedRelationship.notes}</p>
                  </div>
                )}

                <div className="text-sm text-gray-500">
                  Added: {new Date(selectedRelationship.created_at).toLocaleDateString()}
                </div>

                <Button
                  onClick={() => setSelectedRelationship(null)}
                  className="w-full"
                >
                  Close
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 