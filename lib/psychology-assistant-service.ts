import OpenAI from 'openai';
import { RAGPipeline } from './rag-pipeline';
import { safetyCheck, createPsychologyPrompt, PSYCHOLOGY_ASSISTANT_CONFIG } from './psychology-assistant';

export interface PsychologyResponse {
  message: string;
  isCrisis: boolean;
  suggestions?: string[];
  followUpQuestion?: string;
  insights?: {
    patterns?: string[];
    recommendations?: string[];
  };
}

export interface UserProfile {
  id: string;
  name?: string;
  goals?: string[];
  preferences?: {
    communicationStyle?: 'direct' | 'gentle' | 'analytical';
    focusAreas?: string[];
  };
  recentMood?: string;
  lastSession?: Date;
}

export class PsychologyAssistantService {
  private openai: OpenAI;
  private ragPipeline: RAGPipeline;
  private userProfiles: Map<string, UserProfile> = new Map();

  constructor(openaiApiKey: string) {
    this.openai = new OpenAI({ apiKey: openaiApiKey });
    this.ragPipeline = new RAGPipeline(openaiApiKey);
  }

  // Main method to process user queries
  async processQuery(
    query: string,
    userId: string,
    userProfile?: UserProfile
  ): Promise<PsychologyResponse> {
    // First, check for crisis indicators
    const safetyResult = safetyCheck(query);
    if (safetyResult.isCrisis) {
      return {
        message: safetyResult.response!,
        isCrisis: true
      };
    }

    // Update user profile if provided
    if (userProfile) {
      this.userProfiles.set(userId, userProfile);
    }

    try {
      // Get relevant context from user's personal data
      const context = await this.ragPipeline.getContextForQuery(query, userId);
      
      // Create the psychology prompt
      const prompt = createPsychologyPrompt(query, context, this.userProfiles.get(userId));
      
      // Generate AI response
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: prompt
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      const aiMessage = response.choices[0]?.message?.content || 'I apologize, but I\'m having trouble processing your request right now.';

      // Extract insights and suggestions from the response
      const insights = await this.extractInsights(query, context, userId);
      
      // Generate follow-up question
      const followUpQuestion = await this.generateFollowUpQuestion(query, aiMessage, userId);

      return {
        message: aiMessage,
        isCrisis: false,
        insights,
        followUpQuestion
      };

    } catch (error) {
      console.error('Error processing psychology query:', error);
      return {
        message: 'I\'m experiencing some technical difficulties right now. Please try again in a moment, or feel free to continue journaling while I get back online.',
        isCrisis: false
      };
    }
  }

  // Add user content to the knowledge base
  async addUserContent(
    content: string,
    userId: string,
    type: 'journal' | 'mood' | 'goal' | 'reflection' | 'conversation',
    sourceId: string,
    tags?: string[]
  ): Promise<void> {
    await this.ragPipeline.addContent(content, userId, type, sourceId, tags);
  }

  // Generate daily reflection prompts
  async generateDailyReflection(userId: string): Promise<{
    prompt: string;
    context?: string;
    suggestions?: string[];
  }> {
    try {
      const insights = await this.ragPipeline.getUserInsights(userId);
      const userProfile = this.userProfiles.get(userId);

      const reflectionPrompt = `Generate a thoughtful daily reflection prompt for a user who has:
- ${insights.totalEntries} total entries in their personal growth journey
- Recent activity: ${insights.recentActivity.substring(0, 200)}...
- Focus areas: ${userProfile?.preferences?.focusAreas?.join(', ') || 'general self-reflection'}

The prompt should be:
1. Personalized to their recent activity
2. Encouraging and supportive
3. Focused on growth and self-awareness
4. Specific enough to be actionable
5. Open-ended enough for deep reflection

Format the response as a single, engaging question.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: reflectionPrompt
          }
        ],
        max_tokens: 200,
        temperature: 0.8
      });

      const prompt = response.choices[0]?.message?.content || 
        'What would you like to reflect on today?';

      return {
        prompt,
        context: insights.recentActivity,
        suggestions: this.generateReflectionSuggestions(insights)
      };

    } catch (error) {
      console.error('Error generating daily reflection:', error);
      return {
        prompt: 'Take a moment to reflect on your day. What stood out to you, and how are you feeling?'
      };
    }
  }

  // Extract patterns and insights from user data
  private async extractInsights(
    query: string,
    context: string,
    userId: string
  ): Promise<PsychologyResponse['insights']> {
    try {
      const insightsPrompt = `Based on the user's query and their personal context, identify:
1. Any patterns in their thoughts, behaviors, or emotions
2. Specific recommendations for growth or improvement

User Query: ${query}
Personal Context: ${context}

Provide insights in a structured format:
- Patterns: [list of observed patterns]
- Recommendations: [actionable suggestions]`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: insightsPrompt
          }
        ],
        max_tokens: 300,
        temperature: 0.6
      });

      const insightsText = response.choices[0]?.message?.content || '';
      
      // Simple parsing of insights (in a real implementation, you might use more sophisticated parsing)
      const patterns = insightsText.match(/Patterns?:\s*(.+?)(?=\n|$)/i)?.[1]?.split(',').map(p => p.trim()) || [];
      const recommendations = insightsText.match(/Recommendations?:\s*(.+?)(?=\n|$)/i)?.[1]?.split(',').map(r => r.trim()) || [];

      return {
        patterns: patterns.length > 0 ? patterns : undefined,
        recommendations: recommendations.length > 0 ? recommendations : undefined
      };

    } catch (error) {
      console.error('Error extracting insights:', error);
      return {};
    }
  }

  // Generate contextual follow-up questions
  private async generateFollowUpQuestion(
    originalQuery: string,
    aiResponse: string,
    userId: string
  ): Promise<string | undefined> {
    try {
      const followUpPrompt = `Based on the user's original question and your response, generate one thoughtful follow-up question that would help them:
1. Deepen their self-reflection
2. Explore the topic further
3. Take actionable steps

Original Question: ${originalQuery}
Your Response: ${aiResponse}

Generate a single, open-ended question that feels natural and supportive.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: followUpPrompt
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      });

      return response.choices[0]?.message?.content || undefined;

    } catch (error) {
      console.error('Error generating follow-up question:', error);
      return undefined;
    }
  }

  // Generate reflection suggestions based on user data
  private generateReflectionSuggestions(insights: any): string[] {
    const suggestions = [];
    
    if (insights.contentTypes.journal > 5) {
      suggestions.push('Reflect on a recent journal entry that resonated with you');
    }
    
    if (insights.contentTypes.mood > 3) {
      suggestions.push('Consider what influenced your mood today');
    }
    
    if (insights.contentTypes.goal > 2) {
      suggestions.push('Check in on your progress toward a current goal');
    }
    
    suggestions.push('Think about a challenge you faced and how you handled it');
    suggestions.push('Consider what you\'re grateful for today');
    
    return suggestions.slice(0, 3); // Return top 3 suggestions
  }

  // Get user's psychological insights summary
  async getUserInsights(userId: string): Promise<{
    totalEntries: number;
    contentTypes: Record<string, number>;
    recentActivity: string;
    patterns?: string[];
  }> {
    const insights = await this.ragPipeline.getUserInsights(userId);
    
    // Add pattern analysis if there's enough data
    if (insights.totalEntries > 5) {
      const patternAnalysis = await this.analyzeUserPatterns(userId);
      return {
        ...insights,
        patterns: patternAnalysis
      };
    }
    
    return insights;
  }

  // Analyze patterns in user's data
  private async analyzeUserPatterns(userId: string): Promise<string[]> {
    try {
      const userChunks = await this.ragPipeline.search('patterns themes recurring', userId, 20);
      const content = userChunks.map(result => result.chunk.content).join('\n');
      
      const patternPrompt = `Analyze this user's content and identify 2-3 key patterns in their thoughts, behaviors, or emotions:

${content}

Identify patterns that could be helpful for their personal growth journey.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: patternPrompt
          }
        ],
        max_tokens: 200,
        temperature: 0.6
      });

      const patternsText = response.choices[0]?.message?.content || '';
      return patternsText.split('\n').filter(line => line.trim().length > 0).slice(0, 3);

    } catch (error) {
      console.error('Error analyzing user patterns:', error);
      return [];
    }
  }
} 