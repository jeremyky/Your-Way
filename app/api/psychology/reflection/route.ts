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
    const { userId, content, type } = await request.json();

    if (!userId || !content || !type) {
      return NextResponse.json(
        { error: 'UserId, content, and type are required' },
        { status: 400 }
      );
    }

    // Development mode - return success if environment not configured
    if (isDevelopment && (!supabaseUrl || !openaiApiKey)) {
      return NextResponse.json({
        success: true,
        message: `${type} entry added successfully (development mode)`
      });
    }

    // Add the content to the RAG pipeline
    await psychologyService.addUserContent(
      content,
      userId,
      type,
      `${type}-${Date.now()}`,
      type === 'mood' ? [content.toLowerCase()] : undefined
    );

    // Store in the appropriate database table
    if (supabase) {
      let tableName: string;
      let insertData: any;

      switch (type) {
        case 'journal':
          tableName = 'journal_entries';
          insertData = {
            user_id: userId,
            content: content,
            created_at: new Date().toISOString()
          };
          break;
        case 'mood':
          tableName = 'mood_entries';
          insertData = {
            user_id: userId,
            mood: content,
            notes: content,
            created_at: new Date().toISOString()
          };
          break;
        case 'goal':
          tableName = 'goals';
          insertData = {
            user_id: userId,
            title: content,
            description: content,
            created_at: new Date().toISOString()
          };
          break;
        case 'reflection':
          tableName = 'reflections';
          insertData = {
            user_id: userId,
            content: content,
            created_at: new Date().toISOString()
          };
          break;
        default:
          return NextResponse.json(
            { error: 'Invalid content type' },
            { status: 400 }
          );
      }

      const { error: insertError } = await supabase
        .from(tableName)
        .insert(insertData);

      if (insertError) {
        console.error(`Error storing ${type} entry:`, insertError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${type} entry added successfully`
    });

  } catch (error) {
    console.error('Error adding content:', error);
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

    // Development mode - return mock reflection if environment not configured
    if (isDevelopment && (!supabaseUrl || !openaiApiKey)) {
      return NextResponse.json({
        success: true,
        data: {
          prompt: "Take a moment to reflect on your day. What stood out to you, and how are you feeling?",
          context: "This is a development mode reflection prompt.",
          suggestions: [
            "Think about a challenge you faced and how you handled it",
            "Consider what you're grateful for today",
            "Reflect on a moment of growth or learning"
          ]
        }
      });
    }

    // Generate daily reflection prompt
    const reflection = await psychologyService.generateDailyReflection(userId);

    // Store the generated reflection prompt
    if (supabase) {
      const { error: insertError } = await supabase
        .from('reflection_prompts')
        .insert({
          user_id: userId,
          prompt: reflection.prompt,
          context: reflection.context,
          suggestions: reflection.suggestions,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error storing reflection prompt:', insertError);
      }
    }

    return NextResponse.json({
      success: true,
      data: reflection
    });

  } catch (error) {
    console.error('Error generating reflection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 