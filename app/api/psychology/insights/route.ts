import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PsychologyAssistantService } from '@/lib/psychology-assistant-service';

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
}

// Only create Supabase client if we have valid credentials
let supabase: any = null;
if (supabaseUrl && supabaseServiceKey && supabaseUrl !== 'your_supabase_url_here') {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
  }
}

// Initialize psychology assistant service
const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  console.error('Missing OpenAI API key');
}

const psychologyService = new PsychologyAssistantService(
  openaiApiKey || ''
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'UserId is required' },
        { status: 400 }
      );
    }

    // Development mode - return mock insights if environment not configured
    if (isDevelopment && (!supabaseUrl || !openaiApiKey)) {
      return NextResponse.json({
        success: true,
        data: {
          totalEntries: 5,
          contentTypes: { "journal": 2, "mood": 2, "goals": 1 },
          recentActivity: {
            journalEntries: [],
            moodEntries: [],
            goals: [],
            conversations: []
          },
          moodTrends: {},
          goalProgress: { "in_progress": 1 },
          weeklySummary: "This is a development mode summary. Configure your environment for real insights.",
          patterns: ["You're exploring personal growth tools", "You show interest in self-reflection"]
        }
      });
    }

    // Get user insights from the psychology assistant
    const insights = await psychologyService.getUserInsights(userId);

    // Get additional data from database for comprehensive insights
    let journalEntries = null;
    let moodEntries = null;
    let goals = null;
    let conversations = null;

    if (supabase) {
      const [
        journalResult,
        moodResult,
        goalsResult,
        conversationsResult
      ] = await Promise.all([
        supabase
          .from('journal_entries')
          .select('content, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('mood_entries')
          .select('mood, notes, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('goals')
          .select('title, description, status, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('conversations')
          .select('message, response, insights, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      journalEntries = journalResult.data;
      moodEntries = moodResult.data;
      goals = goalsResult.data;
      conversations = conversationsResult.data;
    }

    // Calculate mood trends
    const moodTrends = moodEntries?.reduce((acc: any, entry) => {
      const date = new Date(entry.created_at).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(entry.mood);
      return acc;
    }, {});

    // Calculate goal progress
    const goalProgress = goals?.reduce((acc: any, goal) => {
      acc[goal.status] = (acc[goal.status] || 0) + 1;
      return acc;
    }, {});

    // Generate weekly summary
    const weeklySummary = await generateWeeklySummary(userId, {
      journalEntries,
      moodEntries,
      goals,
      conversations
    });

    return NextResponse.json({
      success: true,
      data: {
        ...insights,
        moodTrends,
        goalProgress,
        weeklySummary,
        recentActivity: {
          journalEntries: journalEntries?.slice(0, 3) || [],
          moodEntries: moodEntries?.slice(0, 3) || [],
          goals: goals?.slice(0, 3) || [],
          conversations: conversations?.slice(0, 3) || []
        }
      }
    });

  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateWeeklySummary(userId: string, data: any) {
  try {
    const summaryPrompt = `Generate a brief weekly summary for a user based on their recent activity:

Journal Entries: ${data.journalEntries?.map((e: any) => e.content.substring(0, 100)).join('; ') || 'None'}
Mood Entries: ${data.moodEntries?.map((e: any) => `${e.mood}: ${e.notes}`).join('; ') || 'None'}
Goals: ${data.goals?.map((e: any) => `${e.title} (${e.status})`).join('; ') || 'None'}

Provide a 2-3 sentence summary that highlights:
1. Key themes or patterns
2. Progress or challenges
3. One positive observation

Keep it encouraging and growth-focused.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: summaryPrompt
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    const result = await response.json();
    return result.choices?.[0]?.message?.content || 'No recent activity to summarize.';

  } catch (error) {
    console.error('Error generating weekly summary:', error);
    return 'Unable to generate summary at this time.';
  }
} 