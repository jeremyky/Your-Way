# Your Way - Personal Growth Platform

A guided journey of self-discovery and personal growth, inspired by Taoist wisdom. Map your inner landscape, understand your relationships, and find your authentic path.

This is part of my Public Interest Technology project for the build4good Navigators program organized by New America.

## 🌟 Features

### Core Modules
- **Self-Discovery**: Personality assessments, mood tracking, values exploration
- **Reflective Journaling**: Daily prompts, life timeline, guided exercises
- **Relationship Dynamics**: Relationship mapping, interaction logging, pattern recognition
- **Inner Guide**: AI-powered conversational coaching and personalized guidance
- **Resource Library**: Curated articles, guided practices, tools
- **Community Support**: Anonymous forums, group challenges, peer support

### Technical Features
- 🔐 Secure authentication with Supabase
- 🤖 AI-powered insights with OpenAI
- 📱 Responsive design for all devices
- 🎨 Beautiful Taoist-inspired UI
- 🔒 Privacy-first approach
- 📊 Data visualization and insights
- 🔄 Real-time updates

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd yourway
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your API keys:
   - Supabase URL and keys
   - OpenAI API key
   - Other optional services

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the database migrations (see `supabase/migrations/`)
   - Configure authentication settings

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
yourway/
├── app/                    # Next.js 13+ app directory
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   ├── charts/           # Data visualization
│   └── layout/           # Layout components
├── lib/                  # Utility functions
│   ├── supabase.ts       # Supabase client
│   ├── openai.ts         # OpenAI client
│   └── utils.ts          # General utilities
├── types/                # TypeScript type definitions
├── hooks/                # Custom React hooks
├── styles/               # Additional styles
└── public/               # Static assets
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue tones (#0ea5e9) - Trust, wisdom
- **Sage**: Green tones (#5f715f) - Growth, nature
- **Earth**: Neutral tones (#78716c) - Stability, grounding
- **Flow**: Teal tones (#14b8a6) - Movement, transformation

### Typography
- **Primary**: Inter - Clean, modern
- **Serif**: Merriweather - For quotes and emphasis
- **Mono**: JetBrains Mono - For code and data

### Components
- Consistent button styles with hover states
- Card-based layouts for content organization
- Smooth animations and transitions
- Accessible form controls

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages

### Testing
```bash
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run test:watch   # Run tests in watch mode
```

## 🗄️ Database Schema

### Core Tables
- `users` - User profiles and preferences
- `journal_entries` - Personal journal entries
- `assessments` - Assessment results and insights
- `relationships` - Relationship mapping
- `interactions` - Relationship interaction logs
- `chat_sessions` - AI conversation history
- `resources` - Educational content
- `forum_posts` - Community discussions

### Key Relationships
- Users have many journal entries, assessments, relationships
- Relationships have many interactions
- Chat sessions contain multiple messages
- Resources are categorized and tagged

## 🔐 Security & Privacy

### Data Protection
- End-to-end encryption for sensitive data
- GDPR-compliant data handling
- User-controlled privacy settings
- Secure API authentication

### Privacy Features
- Anonymous community participation
- Granular data sharing controls
- Data export and deletion options
- No third-party tracking

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Other Platforms
- **Netlify**: Similar to Vercel setup
- **Railway**: Good for full-stack apps
- **Heroku**: Traditional deployment option

### Environment Variables
Ensure all required environment variables are set in your deployment platform.

## 📈 Analytics & Monitoring

### Built-in Analytics
- User engagement metrics
- Feature usage tracking
- Performance monitoring
- Error tracking

### Optional Integrations
- Google Analytics
- Plausible Analytics
- Sentry for error tracking
- LogRocket for session replay

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines
- Follow the existing code style
- Add TypeScript types for new features
- Update documentation as needed
- Test thoroughly before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Taoist philosophy and wisdom
- Built with modern web technologies
- Community-driven development
- Open source contributions welcome

## 📞 Support

- **Documentation**: [docs.yourway.app](https://docs.yourway.app)
- **Issues**: [GitHub Issues](https://github.com/yourusername/yourway/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/yourway/discussions)
- **Email**: support@yourway.app

---

**Your Way** - Discover your authentic path to growth and self-understanding. 🌱 