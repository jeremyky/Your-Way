'use client'

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface JournalEntry {
  id: string;
  content: string;
  created_at: string;
}

const FALLBACK_PROMPT = "What's on your mind today?";

export default function ReflectiveJournalingPage() {
  const [prompt, setPrompt] = useState(FALLBACK_PROMPT);
  const [entry, setEntry] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
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

  // Fetch daily prompt
  useEffect(() => {
    async function fetchPrompt() {
      try {
        const res = await fetch('/api/psychology/reflection?userId=' + userId);
        if (res.ok) {
          const data = await res.json();
          setPrompt(data?.data?.prompt || FALLBACK_PROMPT);
        }
      } catch {
        setPrompt(FALLBACK_PROMPT);
      }
    }
    if (userId) fetchPrompt();
  }, [userId]);

  // Fetch recent journal entries
  useEffect(() => {
    async function fetchEntries() {
      setIsLoadingEntries(true);
      try {
        const res = await fetch('/api/psychology/insights?userId=' + userId);
        if (res.ok) {
          const data = await res.json();
          setRecentEntries(data?.data?.recentActivity?.journalEntries || []);
        } else {
          // fallback to localStorage
          const local = localStorage.getItem('yourway-journal');
          if (local) setRecentEntries(JSON.parse(local));
        }
      } catch {
        const local = localStorage.getItem('yourway-journal');
        if (local) setRecentEntries(JSON.parse(local));
      }
      setIsLoadingEntries(false);
    }
    if (userId) fetchEntries();
  }, [userId, success]);

  // Handle journal entry submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    if (!entry.trim()) {
      setError('Please write something.');
      setLoading(false);
      return;
    }
    try {
      // Try API first
      const res = await fetch('/api/psychology/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          content: entry,
          type: 'journal',
        }),
      });
      if (res.ok) {
        setSuccess(true);
        setEntry('');
      } else {
        // fallback to localStorage
        const local = localStorage.getItem('yourway-journal');
        const entries: JournalEntry[] = local ? JSON.parse(local) : [];
        const newEntry: JournalEntry = {
          id: 'local-' + Date.now(),
          content: entry,
          created_at: new Date().toISOString(),
        };
        localStorage.setItem('yourway-journal', JSON.stringify([newEntry, ...entries]));
        setSuccess(true);
        setEntry('');
      }
    } catch {
      // fallback to localStorage
      const local = localStorage.getItem('yourway-journal');
      const entries: JournalEntry[] = local ? JSON.parse(local) : [];
      const newEntry: JournalEntry = {
        id: 'local-' + Date.now(),
        content: entry,
        created_at: new Date().toISOString(),
      };
      localStorage.setItem('yourway-journal', JSON.stringify([newEntry, ...entries]));
      setSuccess(true);
      setEntry('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-primary-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center mb-2">Reflective Journaling</CardTitle>
            <div className="text-center text-primary-700 text-lg mb-2">{prompt}</div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="Write your thoughts here..."
                value={entry}
                onChange={e => setEntry(e.target.value)}
                disabled={loading}
              />
              {error && <div className="text-red-600 text-sm">{error}</div>}
              {success && <div className="text-green-600 text-sm">Journal entry saved!</div>}
              <Button type="submit" className="w-full" loading={loading}>
                Save Entry
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Recent Journal Entries</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingEntries ? (
                <div className="text-center text-gray-500 py-8">Loading...</div>
              ) : recentEntries.length === 0 ? (
                <div className="text-center text-gray-400 py-8">No entries yet. Start journaling above!</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {recentEntries.map(entry => (
                    <li key={entry.id} className="py-4">
                      <div className="text-sm text-gray-700 mb-1">
                        {new Date(entry.created_at).toLocaleDateString()} • {entry.content.slice(0, 100)}{entry.content.length > 100 ? '...' : ''}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 