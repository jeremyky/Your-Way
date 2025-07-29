# YourWay Psychology Assistant - Implementation Guide

## Overview

The YourWay Psychology Assistant is a RAG-powered AI system designed to support personal growth and self-reflection. It combines Retrieval-Augmented Generation (RAG) with psychology-informed coaching to provide personalized insights and guidance.

## 🎯 Mission & Guard Rails

### Mission
- Help users surface patterns in mood, habits, triggers, and goals
- Offer psycho-educational tips grounded in CBT, ACT, mindfulness, and journaling
- Reference user's own notes, journal entries, and past conversations
- Support self-reflection and personal growth

### Guard Rails
- **NOT a licensed clinician** - Cannot provide diagnosis or treatment
- **Privacy-first** - All data encrypted and user-controlled
- **Crisis detection** - Automatic detection and appropriate response to crisis indicators
- **Educational focus** - Self-reflection and growth, not clinical treatment

## 🏗️ Architecture

```
Frontend (Next.js) → API Routes → Psychology Assistant Service → RAG Pipeline → OpenAI
                                    ↓
                              Supabase Database
```

### Core Components

1. **Psychology Assistant Service** (`lib/psychology-assistant-service.ts`)
   - Main orchestrator for AI interactions
   - Handles safety checks and crisis detection
   - Manages user profiles and context

2. **RAG Pipeline** (`lib/rag-pipeline.ts`)
   - Text chunking and embedding
   - Vector similarity search
   - Context retrieval for AI responses

3. **Safety System** (`lib/psychology-assistant.ts`)
   - Crisis keyword detection
   - Appropriate crisis response protocols
   - Guard rail enforcement

4. **UI Components**
   - `PsychologyChat` - Main conversation interface
   - `InsightsDashboard` - Pattern analysis and insights
   - `DailyReflection` - Guided reflection prompts

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Copy environment variables
cp env.example .env.local

# Add your API keys
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Database Setup

```bash
# Run the migration
npx supabase db push

# Or manually run the SQL
psql -h your-db-host -U your-user -d your-db -f supabase/migrations/20240101000000_create_psychology_tables.sql
```

### 3. Start Development

```bash
npm run dev
```

Navigate to `http://localhost:3000/psychology`

## 📊 Features

### 1. InnerGuide Chat
- **Conversational AI** with psychology-informed responses
- **Context-aware** - References user's personal history
- **Safety-first** - Automatic crisis detection and response
- **Insights extraction** - Identifies patterns and provides recommendations

### 2. Insights Dashboard
- **Pattern analysis** - Identifies recurring themes and behaviors
- **Progress tracking** - Visualizes growth over time
- **Goal monitoring** - Tracks goal progress and achievements
- **Mood trends** - Analyzes emotional patterns

### 3. Daily Reflection
- **Personalized prompts** - AI-generated based on user history
- **Guided reflection** - Structured prompts for deeper insights
- **Progress tracking** - Daily reflection streak and insights

## 🔧 Configuration

### Psychology Assistant Settings

```typescript
// lib/psychology-assistant.ts
export const PSYCHOLOGY_ASSISTANT_CONFIG = {
  mission: "You are InnerGuide, a psychology-informed personal growth coach...",
  guardRails: [
    "Never act as a licensed clinician",
    "Always respond to crisis indicators",
    // ... more guard rails
  ],
  crisisKeywords: [
    "suicide", "kill myself", "end it all",
    // ... crisis detection keywords
  ],
  maxContextTokens: 8000,
  chunkSize: 1000,
  chunkOverlap: 150
};
```

### Environment Variables

```bash
# Core functionality
PSYCHOLOGY_ASSISTANT_ENABLED=true
PSYCHOLOGY_CRISIS_DETECTION_ENABLED=true

# RAG configuration
PSYCHOLOGY_MAX_CONTEXT_TOKENS=8000
PSYCHOLOGY_CHUNK_SIZE=1000
PSYCHOLOGY_CHUNK_OVERLAP=150
```

## 🛡️ Safety & Privacy

### Crisis Detection
- **Automatic scanning** of all user messages
- **Keyword detection** for crisis indicators
- **Immediate response** with crisis resources
- **Professional referral** to appropriate services

### Privacy Protection
- **End-to-end encryption** of all data
- **User-controlled** data retention
- **No data sharing** with third parties
- **Local processing** where possible

### Data Security
- **Row Level Security** (RLS) in Supabase
- **User isolation** - users can only access their own data
- **Audit logging** of all interactions
- **Secure API endpoints** with authentication

## 📈 Usage Examples

### Starting a Conversation
```typescript
// User types: "I'm feeling overwhelmed with work lately"
// System retrieves relevant context:
// - Past journal entries about work stress
// - Previous mood entries showing similar patterns
// - Goals related to work-life balance

// AI responds with:
// - CBT-based reframing techniques
// - Specific patterns from user's history
// - Actionable suggestions
// - Follow-up question for deeper exploration
```

### Daily Reflection
```typescript
// System generates personalized prompt:
// "I notice you've been writing about work stress in your journal. 
// Today, let's reflect on what specific aspects of work are most 
// challenging and what small changes might help."

// User responds with reflection
// System stores and analyzes for future insights
```

### Pattern Recognition
```typescript
// System identifies patterns:
// - "You tend to feel stressed on Mondays"
// - "Work-related anxiety peaks before deadlines"
// - "You feel most energized after exercise"

// Provides insights and recommendations based on patterns
```

## 🔄 API Endpoints

### Chat Endpoint
```typescript
POST /api/psychology/chat
{
  "message": "I'm feeling anxious about my presentation tomorrow",
  "userId": "user-uuid"
}

Response:
{
  "success": true,
  "data": {
    "message": "I understand presentation anxiety...",
    "isCrisis": false,
    "insights": {
      "patterns": ["You often feel anxious before public speaking"],
      "recommendations": ["Try the 4-7-8 breathing technique"]
    },
    "followUpQuestion": "What specific thoughts are running through your mind?"
  }
}
```

### Reflection Endpoint
```typescript
GET /api/psychology/reflection?userId=user-uuid

Response:
{
  "success": true,
  "data": {
    "prompt": "Today's reflection prompt...",
    "context": "Based on your recent entries...",
    "suggestions": ["Consider...", "Reflect on..."]
  }
}
```

### Insights Endpoint
```typescript
GET /api/psychology/insights?userId=user-uuid

Response:
{
  "success": true,
  "data": {
    "totalEntries": 45,
    "contentTypes": { "journal": 20, "mood": 15, "goals": 10 },
    "patterns": ["Pattern 1", "Pattern 2"],
    "weeklySummary": "This week you showed...",
    "moodTrends": { "2024-01-15": ["anxious", "stressed"] },
    "goalProgress": { "in_progress": 3, "completed": 2 }
  }
}
```

## 🧪 Testing

### Unit Tests
```bash
# Test psychology assistant service
npm test psychology-assistant-service.test.ts

# Test RAG pipeline
npm test rag-pipeline.test.ts

# Test safety functions
npm test psychology-assistant.test.ts
```

### Integration Tests
```bash
# Test API endpoints
npm test api/psychology.test.ts

# Test crisis detection
npm test crisis-detection.test.ts
```

### Manual Testing
1. **Crisis Detection**: Test with crisis keywords
2. **Context Retrieval**: Verify relevant context is found
3. **Response Quality**: Check AI response appropriateness
4. **Privacy**: Verify data isolation between users

## 🚨 Crisis Response Protocol

### Detection
- Automatic scanning of all user input
- Keyword matching against crisis indicators
- Context analysis for severity assessment

### Response
1. **Immediate crisis response** with resources
2. **Professional referral** to crisis services
3. **Safety confirmation** before continuing
4. **Logging** of crisis interactions

### Resources Provided
- **988** - Suicide & Crisis Lifeline
- **741741** - Crisis Text Line
- **911** - Emergency services
- **Local mental health resources**

## 🔮 Future Enhancements

### Planned Features
- **Voice interaction** for more natural conversations
- **Mood prediction** using ML models
- **Group therapy** features for community support
- **Integration** with wearable devices for mood tracking
- **Advanced analytics** with visualization dashboards

### Technical Improvements
- **Hybrid search** (BM25 + vector) for better retrieval
- **Re-ranking** with cross-encoders
- **Self-RAG** for iterative question refinement
- **Long-context RAG** for deeper conversations

## 📚 Resources

### Psychology Frameworks
- **CBT (Cognitive Behavioral Therapy)** - Thought reframing
- **ACT (Acceptance and Commitment Therapy)** - Value-based living
- **Mindfulness** - Present-moment awareness
- **Positive Psychology** - Strengths-based approach

### Technical Resources
- [OpenAI Embeddings Documentation](https://platform.openai.com/docs/guides/embeddings)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [RAG Best Practices](https://arxiv.org/abs/2312.10997)

### Safety Resources
- [Crisis Response Guidelines](https://988lifeline.org/)
- [AI Safety Best Practices](https://www.anthropic.com/safety)
- [Mental Health AI Ethics](https://www.who.int/publications/i/item/9789240031029)

## 🤝 Contributing

### Development Guidelines
1. **Safety first** - All changes must maintain safety protocols
2. **Privacy by design** - User data protection is paramount
3. **Psychology-informed** - Responses must be grounded in evidence-based practices
4. **User-centered** - Focus on user growth and well-being

### Code Review Checklist
- [ ] Safety protocols maintained
- [ ] Privacy protections in place
- [ ] Crisis detection working
- [ ] Response quality appropriate
- [ ] Performance optimized
- [ ] Tests passing

## 📞 Support

For technical issues or questions about the psychology assistant:

- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Check this guide and inline code comments
- **Community**: Join the YourWay community forum
- **Professional Support**: For mental health concerns, contact licensed professionals

---

**Remember**: This tool is designed to support personal growth, not replace professional mental health care. Always encourage users to seek professional help when needed. 