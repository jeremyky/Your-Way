import Link from 'next/link'
import { ArrowRightIcon, SparklesIcon, HeartIcon, LightBulbIcon, UsersIcon } from '@heroicons/react/24/outline'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-50 via-sage-50 to-primary-50">
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-flow-500 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-earth-900">Your Way</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-earth-700 hover:text-primary-600 transition-colors">
              Features
            </Link>
            <Link href="#about" className="text-earth-700 hover:text-primary-600 transition-colors">
              About
            </Link>
            <Link href="/auth" className="btn-secondary">
              Sign In
            </Link>
            <Link href="/auth" className="btn-primary">
              Begin Journey
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto text-center">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-flow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '2s' }}></div>
          </div>

          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-earth-900 mb-6">
              Discover{' '}
              <span className="text-gradient">Your Way</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-earth-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              A guided journey of self-discovery and personal growth, inspired by Taoist wisdom. 
              Map your inner landscape, understand your relationships, and find your authentic path.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/auth" className="btn-primary text-lg px-8 py-4 flex items-center space-x-2 group">
                <span>Begin Your Journey</span>
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="#features" className="btn-secondary text-lg px-8 py-4">
                Explore Features
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-earth-600">
              <div className="flex items-center space-x-2">
                <HeartIcon className="w-5 h-5 text-primary-500" />
                <span>Private & Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <LightBulbIcon className="w-5 h-5 text-flow-500" />
                <span>AI-Powered Insights</span>
              </div>
              <div className="flex items-center space-x-2">
                <UsersIcon className="w-5 h-5 text-sage-500" />
                <span>Community Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-earth-900 mb-4">
              Your Personal Path to Growth
            </h2>
            <p className="text-xl text-earth-700 max-w-2xl mx-auto">
              Comprehensive tools and insights to guide your journey of self-discovery
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Self-Discovery */}
            <div className="card group hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                <LightBulbIcon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-earth-900 mb-3">Self-Discovery</h3>
              <p className="text-earth-700 mb-4">
                Take personality assessments, track your emotional patterns, and gain insights into your core values and motivations.
              </p>
              <ul className="text-sm text-earth-600 space-y-1">
                <li>• Personality assessments</li>
                <li>• Mood tracking</li>
                <li>• Values exploration</li>
              </ul>
            </div>

            {/* Journaling */}
            <div className="card group hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-flow-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-flow-200 transition-colors">
                <HeartIcon className="w-6 h-6 text-flow-600" />
              </div>
              <h3 className="text-xl font-semibold text-earth-900 mb-3">Reflective Journaling</h3>
              <p className="text-earth-700 mb-4">
                Daily prompts, life timeline mapping, and guided reflection to deepen your self-understanding.
              </p>
              <ul className="text-sm text-earth-600 space-y-1">
                <li>• Daily reflection prompts</li>
                <li>• Life timeline</li>
                <li>• Guided exercises</li>
              </ul>
            </div>

            {/* Relationships */}
            <div className="card group hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-sage-200 transition-colors">
                <UsersIcon className="w-6 h-6 text-sage-600" />
              </div>
              <h3 className="text-xl font-semibold text-earth-900 mb-3">Relationship Dynamics</h3>
              <p className="text-earth-700 mb-4">
                Map your relationships, understand patterns, and track interactions to build healthier connections.
              </p>
              <ul className="text-sm text-earth-600 space-y-1">
                <li>• Relationship mapping</li>
                <li>• Interaction logging</li>
                <li>• Pattern recognition</li>
              </ul>
            </div>

            {/* AI Guide */}
            <div className="card group hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                <SparklesIcon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-earth-900 mb-3">Inner Guide</h3>
              <p className="text-earth-700 mb-4">
                Your personal AI coach for deep conversations, reframing challenges, and personalized guidance.
              </p>
              <ul className="text-sm text-earth-600 space-y-1">
                <li>• Conversational coaching</li>
                <li>• Contextual insights</li>
                <li>• Personalized exercises</li>
              </ul>
            </div>

            {/* Resources */}
            <div className="card group hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-flow-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-flow-200 transition-colors">
                <SparklesIcon className="w-6 h-6 text-flow-600" />
              </div>
              <h3 className="text-xl font-semibold text-earth-900 mb-3">Resource Library</h3>
              <p className="text-earth-700 mb-4">
                Curated articles, guided practices, and tools to support your growth journey.
              </p>
              <ul className="text-sm text-earth-600 space-y-1">
                <li>• Psychology articles</li>
                <li>• Guided meditations</li>
                <li>• Book recommendations</li>
              </ul>
            </div>

            {/* Community */}
            <div className="card group hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-sage-200 transition-colors">
                <UsersIcon className="w-6 h-6 text-sage-600" />
              </div>
              <h3 className="text-xl font-semibold text-earth-900 mb-3">Community Support</h3>
              <p className="text-earth-700 mb-4">
                Connect with others on similar journeys through anonymous forums and group challenges.
              </p>
              <ul className="text-sm text-earth-600 space-y-1">
                <li>• Anonymous forums</li>
                <li>• Group challenges</li>
                <li>• Peer support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="px-6 py-20 bg-gradient-to-br from-sage-50 to-earth-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-earth-900 mb-6">
            The Way of Transformation
          </h2>
          <p className="text-lg text-earth-700 mb-8 leading-relaxed">
            Inspired by Taoist philosophy, "Your Way" recognizes that personal growth is not a linear path but a flowing journey. 
            Like water that finds its way around obstacles, we each have our unique path to self-understanding and fulfillment.
          </p>
          <p className="text-lg text-earth-700 leading-relaxed">
            Our platform provides the tools and guidance to help you navigate your inner landscape, 
            understand your relationships, and discover the authentic path that's uniquely yours.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-earth-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-flow-500 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Your Way</span>
              </div>
              <p className="text-earth-300">
                A guided journey of self-discovery and personal growth, inspired by Taoist wisdom.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-earth-300">
                <li><Link href="#" className="hover:text-white transition-colors">Self-Discovery</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Journaling</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Relationships</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Inner Guide</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-earth-300">
                <li><Link href="#" className="hover:text-white transition-colors">Articles</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Guided Practices</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Community</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-earth-300">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Data Export</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-earth-800 mt-8 pt-8 text-center text-earth-400">
            <p>&copy; 2024 Your Way. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 