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

export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json();

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Message and userId are required' },
        { status: 400 }
      );
    }

    // Development mode - return mock response if environment not configured
    if (isDevelopment && (!supabaseUrl || !openaiApiKey)) {
      return NextResponse.json({
        success: true,
        data: {
          message: "I'm here to support your personal growth journey. This is a development mode response. Please configure your environment variables for full functionality.",
          isCrisis: false,
          insights: {
            patterns: ["You're exploring personal growth tools"],
            recommendations: ["Continue with your self-reflection journey"]
          },
          followUpQuestion: "What aspect of personal growth would you like to explore today?"
        }
      });
    }

    // Verify user exists and get their profile
    if (!supabase) {
      // Development mode - return mock response if environment not configured
      return NextResponse.json({
        success: true,
        data: {
          message: "I'm here to support your personal growth journey. This is a development mode response. Please configure your environment variables for full functionality.",
          isCrisis: false,
          insights: {
            patterns: ["You're exploring personal growth tools"],
            recommendations: ["Continue with your self-reflection journey"]
          },
          followUpQuestion: "What aspect of personal growth would you like to explore today?"
        }
      });
    }

    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create user profile for the psychology assistant
    const userProfile = {
      id: userId,
      name: user.full_name,
      goals: user.goals || [],
      preferences: {
        communicationStyle: user.communication_style || 'gentle',
        focusAreas: user.focus_areas || []
      },
      recentMood: user.recent_mood,
      lastSession: new Date()
    };

    // Process the query through the psychology assistant
    const response = await psychologyService.processQuery(
      message,
      userId,
      userProfile
    );

    // Store the conversation in the database
    if (supabase) {
      const { error: conversationError } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          message: message,
          response: response.message,
          is_crisis: response.isCrisis,
          insights: response.insights,
          follow_up_question: response.followUpQuestion,
          created_at: new Date().toISOString()
        });

      if (conversationError) {
        console.error('Error storing conversation:', conversationError);
      }
    }

    // Add the conversation to the RAG pipeline for future context
    await psychologyService.addUserContent(
      `User: ${message}\nAssistant: ${response.message}`,
      userId,
      'conversation',
      `conv-${Date.now()}`,
      response.isCrisis ? ['crisis'] : undefined
    );

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error in psychology chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    // Development mode - return mock data if environment not configured
    if (isDevelopment && (!supabaseUrl || !openaiApiKey)) {
      return NextResponse.json({
        success: true,
        data: [
          {
            id: 'mock-1',
            message: 'Hello, I need some support',
            response: 'I\'m here to help you on your journey.',
            created_at: new Date().toISOString()
          }
        ]
      });
    }

    // Get conversation history
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch conversation history' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: conversations || []
    });

  } catch (error) {
    console.error('Error fetching conversation history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 