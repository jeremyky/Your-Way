# YourWay Psychology Assistant - Setup Guide

## 🚀 Quick Start

The psychology assistant is now running in **development mode** without requiring any external services. You can:

1. **Test the UI**: Visit `http://localhost:3000/psychology` to see the interface
2. **Test the APIs**: All endpoints work with mock responses
3. **Explore the features**: Chat, insights, and daily reflection are all functional

## 🔧 Full Setup (Optional)

When you're ready to use the full functionality with real AI responses and data persistence, follow these steps:

### 1. Set Up OpenAI

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to "API Keys" in your dashboard
4. Create a new API key
5. Copy the key (it starts with `sk-`)

### 2. Set Up Supabase

1. Go to [Supabase](https://supabase.com/)
2. Create an account or sign in
3. Create a new project
4. Once created, go to Settings → API
5. Copy your:
   - **Project URL** (looks like: `https://your-project.supabase.co`)
   - **Service Role Key** (starts with `eyJ...`)

### 3. Configure Environment Variables

1. Open your `.env.local` file
2. Replace the placeholder values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Psychology Assistant Configuration
PSYCHOLOGY_ASSISTANT_ENABLED=true
PSYCHOLOGY_CRISIS_DETECTION_ENABLED=true
PSYCHOLOGY_MAX_CONTEXT_TOKENS=8000
PSYCHOLOGY_CHUNK_SIZE=1000
PSYCHOLOGY_CHUNK_OVERLAP=150
```

### 4. Set Up Database Tables

1. In your Supabase dashboard, go to SQL Editor
2. Run the migration script from `supabase/migrations/20240101000000_create_psychology_tables.sql`
3. This creates all the necessary tables for the psychology assistant

### 5. Restart the Development Server

```bash
npm run dev
```

## 🧪 Testing the Full Setup

Once configured, you can test the full functionality:

### Test Chat API
```bash
curl -X POST http://localhost:3000/api/psychology/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I\'m feeling anxious about my upcoming presentation",
    "userId": "test-user-123"
  }'
```

### Test Reflection API
```bash
curl -X GET "http://localhost:3000/api/psychology/reflection?userId=test-user-123"
```

### Test Insights API
```bash
curl -X GET "http://localhost:3000/api/psychology/insights?userId=test-user-123"
```

## 🔒 Security Notes

- **Never commit your `.env.local` file** to version control
- The `.env.example` file is safe to commit (it contains no real secrets)
- Keep your API keys secure and rotate them regularly
- The service role key has admin privileges - use it only on the server side

## 🛠️ Development Mode Features

Even without the full setup, you can:

- ✅ View the psychology assistant interface
- ✅ Test the chat interface (with mock responses)
- ✅ Test the insights dashboard (with mock data)
- ✅ Test the daily reflection feature (with mock prompts)
- ✅ Explore the UI components and styling
- ✅ Test the crisis detection UI (without real detection)

## 🚨 Crisis Detection

The psychology assistant includes crisis detection for sensitive topics. In development mode:
- Crisis detection UI is available
- Mock crisis responses are shown
- No real crisis detection occurs

For production use, ensure you have proper crisis response protocols in place.

## 📚 Next Steps

1. **Explore the codebase**: Check out the implementation in `lib/psychology-assistant.ts`
2. **Customize prompts**: Modify the psychology prompts in the configuration
3. **Add features**: Extend the assistant with new capabilities
4. **Style the UI**: Customize the components in `components/psychology/`
5. **Deploy**: When ready, deploy to your preferred hosting platform

## 🆘 Troubleshooting

### Common Issues

1. **"Invalid URL" error**: Make sure your Supabase URL is correct and doesn't have trailing slashes
2. **"Missing API key" error**: Ensure your OpenAI API key is valid and has credits
3. **Database connection issues**: Check your Supabase service role key and project URL
4. **Build errors**: Make sure all environment variables are properly set

### Getting Help

- Check the console for detailed error messages
- Verify your environment variables are correctly set
- Ensure your Supabase project is active and accessible
- Test your OpenAI API key separately

## 🎯 What's Next?

The psychology assistant is now ready for development and testing. You can:

1. **Continue development** without external dependencies
2. **Set up the full environment** when ready for production features
3. **Customize the assistant** to match your specific needs
4. **Add new features** like mood tracking, goal setting, etc.

Happy coding! 🚀 