import OpenAI from 'openai';
import { PSYCHOLOGY_ASSISTANT_CONFIG } from './psychology-assistant';

// Types for our RAG system
export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    source: string;
    userId: string;
    timestamp: Date;
    type: 'journal' | 'mood' | 'goal' | 'reflection' | 'conversation';
    tags?: string[];
  };
  embedding?: number[];
}

export interface SearchResult {
  chunk: DocumentChunk;
  score: number;
  relevance: string;
}

// Text chunking utility
export class TextChunker {
  private chunkSize: number;
  private chunkOverlap: number;

  constructor(chunkSize = PSYCHOLOGY_ASSISTANT_CONFIG.chunkSize, chunkOverlap = PSYCHOLOGY_ASSISTANT_CONFIG.chunkOverlap) {
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
  }

  chunkText(text: string, metadata: Omit<DocumentChunk['metadata'], 'timestamp'>): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const words = text.split(/\s+/);
    
    for (let i = 0; i < words.length; i += this.chunkSize - this.chunkOverlap) {
      const chunkWords = words.slice(i, i + this.chunkSize);
      const chunkText = chunkWords.join(' ');
      
      if (chunkText.trim().length > 0) {
        chunks.push({
          id: `${metadata.source}-${i}-${Date.now()}`,
          content: chunkText,
          metadata: {
            ...metadata,
            timestamp: new Date()
          }
        });
      }
    }
    
    return chunks;
  }

  // Specialized chunking for different content types
  chunkJournalEntry(content: string, userId: string, entryId: string): DocumentChunk[] {
    return this.chunkText(content, {
      source: `journal-${entryId}`,
      userId,
      type: 'journal'
    });
  }

  chunkMoodEntry(content: string, userId: string, entryId: string, mood: string): DocumentChunk[] {
    return this.chunkText(content, {
      source: `mood-${entryId}`,
      userId,
      type: 'mood',
      tags: [mood]
    });
  }

  chunkGoalEntry(content: string, userId: string, goalId: string): DocumentChunk[] {
    return this.chunkText(content, {
      source: `goal-${goalId}`,
      userId,
      type: 'goal'
    });
  }
}

// Embedding service using OpenAI
export class EmbeddingService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async embedText(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float'
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  async embedChunks(chunks: DocumentChunk[]): Promise<DocumentChunk[]> {
    const embeddedChunks: DocumentChunk[] = [];
    
    for (const chunk of chunks) {
      try {
        const embedding = await this.embedText(chunk.content);
        embeddedChunks.push({
          ...chunk,
          embedding
        });
      } catch (error) {
        console.error(`Failed to embed chunk ${chunk.id}:`, error);
        // Continue with other chunks
      }
    }
    
    return embeddedChunks;
  }
}

// Vector similarity search
export class VectorSearch {
  static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  static search(
    queryEmbedding: number[],
    chunks: DocumentChunk[],
    topK: number = 5
  ): SearchResult[] {
    const results: SearchResult[] = [];
    
    for (const chunk of chunks) {
      if (!chunk.embedding) continue;
      
      const similarity = this.cosineSimilarity(queryEmbedding, chunk.embedding);
      results.push({
        chunk,
        score: similarity,
        relevance: this.getRelevanceDescription(similarity)
      });
    }
    
    // Sort by similarity score (highest first)
    results.sort((a, b) => b.score - a.score);
    
    return results.slice(0, topK);
  }

  private static getRelevanceDescription(similarity: number): string {
    if (similarity > 0.8) return 'highly relevant';
    if (similarity > 0.6) return 'relevant';
    if (similarity > 0.4) return 'somewhat relevant';
    return 'low relevance';
  }
}

// Main RAG pipeline orchestrator
export class RAGPipeline {
  private chunker: TextChunker;
  private embeddingService: EmbeddingService;
  private chunks: Map<string, DocumentChunk[]> = new Map();

  constructor(openaiApiKey: string) {
    this.chunker = new TextChunker();
    this.embeddingService = new EmbeddingService(openaiApiKey);
  }

  // Add user content to the knowledge base
  async addContent(
    content: string,
    userId: string,
    type: DocumentChunk['metadata']['type'],
    sourceId: string,
    tags?: string[]
  ): Promise<void> {
    const chunks = this.chunker.chunkText(content, {
      source: `${type}-${sourceId}`,
      userId,
      type,
      tags
    });

    const embeddedChunks = await this.embeddingService.embedChunks(chunks);
    
    // Store chunks by user
    if (!this.chunks.has(userId)) {
      this.chunks.set(userId, []);
    }
    this.chunks.get(userId)!.push(...embeddedChunks);
  }

  // Search for relevant content
  async search(
    query: string,
    userId: string,
    topK: number = 5
  ): Promise<SearchResult[]> {
    const userChunks = this.chunks.get(userId) || [];
    if (userChunks.length === 0) {
      return [];
    }

    const queryEmbedding = await this.embeddingService.embedText(query);
    return VectorSearch.search(queryEmbedding, userChunks, topK);
  }

  // Get context for psychology assistant
  async getContextForQuery(
    query: string,
    userId: string,
    maxTokens: number = PSYCHOLOGY_ASSISTANT_CONFIG.maxContextTokens
  ): Promise<string> {
    const results = await this.search(query, userId, 10);
    
    let context = '';
    let tokenCount = 0;
    
    for (const result of results) {
      const chunkText = `[${result.chunk.metadata.type.toUpperCase()}] ${result.chunk.content}\n\n`;
      const estimatedTokens = chunkText.split(/\s+/).length * 1.3; // Rough token estimation
      
      if (tokenCount + estimatedTokens > maxTokens) break;
      
      context += chunkText;
      tokenCount += estimatedTokens;
    }
    
    return context.trim();
  }

  // Get user's content summary for insights
  async getUserInsights(userId: string): Promise<{
    totalEntries: number;
    contentTypes: Record<string, number>;
    recentActivity: string;
  }> {
    const userChunks = this.chunks.get(userId) || [];
    
    const contentTypes = userChunks.reduce((acc, chunk) => {
      acc[chunk.metadata.type] = (acc[chunk.metadata.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentChunks = userChunks
      .sort((a, b) => b.metadata.timestamp.getTime() - a.metadata.timestamp.getTime())
      .slice(0, 5);

    const recentActivity = recentChunks
      .map(chunk => `${chunk.metadata.type}: ${chunk.content.substring(0, 100)}...`)
      .join('\n');

    return {
      totalEntries: userChunks.length,
      contentTypes,
      recentActivity
    };
  }
} 