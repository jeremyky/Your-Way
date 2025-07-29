// User types
export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
  preferences: UserPreferences
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  privacy_level: 'private' | 'community' | 'public'
  notifications: {
    email: boolean
    push: boolean
    weekly_digest: boolean
  }
  ai_access: {
    journal_entries: boolean
    assessments: boolean
    relationships: boolean
  }
}

// Journal types
export interface JournalEntry {
  id: string
  user_id: string
  title: string
  content: string
  mood?: number // 1-10 scale
  tags: string[]
  is_private: boolean
  created_at: string
  updated_at: string
}

export interface JournalPrompt {
  id: string
  text: string
  category: 'daily' | 'weekly' | 'reflection' | 'relationship' | 'growth'
  difficulty: 'easy' | 'medium' | 'hard'
}

// Assessment types
export interface Assessment {
  id: string
  user_id: string
  type: 'personality' | 'values' | 'emotional_awareness' | 'relationship_style'
  title: string
  description: string
  questions: AssessmentQuestion[]
  results: AssessmentResult
  completed_at: string
  created_at: string
}

export interface AssessmentQuestion {
  id: string
  text: string
  type: 'multiple_choice' | 'scale' | 'text'
  options?: string[]
  required: boolean
}

export interface AssessmentResult {
  score?: number
  category?: string
  insights: string[]
  recommendations: string[]
  raw_data: Record<string, any>
}

// Relationship types
export interface Relationship {
  id: string
  user_id: string
  person_name: string
  relationship_type: 'family' | 'friend' | 'partner' | 'colleague' | 'other'
  closeness: number // 1-10 scale
  support_level: number // 1-10 scale
  conflict_level: number // 1-10 scale
  notes: string
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Interaction {
  id: string
  relationship_id: string
  user_id: string
  date: string
  duration_minutes?: number
  mood_before: number // 1-10 scale
  mood_after: number // 1-10 scale
  notes: string
  tags: string[]
  created_at: string
}

// AI Chat types
export interface ChatMessage {
  id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  context?: {
    journal_entries?: string[]
    assessments?: string[]
    relationships?: string[]
  }
  created_at: string
}

export interface ChatSession {
  id: string
  user_id: string
  title: string
  messages: ChatMessage[]
  created_at: string
  updated_at: string
}

// Resource types
export interface Resource {
  id: string
  title: string
  description: string
  content: string
  type: 'article' | 'video' | 'exercise' | 'meditation'
  category: 'psychology' | 'mindfulness' | 'relationships' | 'growth' | 'tools'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes?: number
  tags: string[]
  created_at: string
  updated_at: string
}

// Community types
export interface ForumPost {
  id: string
  user_id: string
  title: string
  content: string
  category: 'anxiety' | 'relationships' | 'growth' | 'mindfulness' | 'general'
  is_anonymous: boolean
  likes: number
  replies: ForumReply[]
  created_at: string
  updated_at: string
}

export interface ForumReply {
  id: string
  post_id: string
  user_id: string
  content: string
  is_anonymous: boolean
  likes: number
  created_at: string
}

export interface Challenge {
  id: string
  title: string
  description: string
  duration_days: number
  category: 'gratitude' | 'boundaries' | 'mindfulness' | 'relationships' | 'growth'
  participants: string[]
  created_at: string
  start_date: string
  end_date: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface SignupForm {
  email: string
  password: string
  name: string
  accept_terms: boolean
}

export interface JournalForm {
  title: string
  content: string
  mood?: number
  tags: string[]
  is_private: boolean
}

export interface RelationshipForm {
  person_name: string
  relationship_type: string
  closeness: number
  support_level: number
  conflict_level: number
  notes: string
  tags: string[]
} 