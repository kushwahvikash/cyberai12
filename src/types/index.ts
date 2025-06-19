export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  files?: File[];
  model?: string;
  tokens?: number;
  isTyping?: boolean;
  reactions?: string[];
  metadata?: {
    searchResults?: SearchResult[];
    codeFiles?: CodeFile[];
    generatedContent?: GeneratedContent;
  };
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  timestamp: Date;
}

export interface CodeFile {
  name: string;
  content: string;
  language: string;
  path: string;
}

export interface GeneratedContent {
  type: 'document' | 'presentation' | 'spreadsheet' | 'image' | 'video';
  content: string;
  metadata: Record<string, any>;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  capabilities: string[];
  maxTokens: number;
  costPer1kTokens: number;
  category: 'chat' | 'code' | 'image' | 'audio' | 'video' | 'multimodal';
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  mode: 'cyber' | 'normal' | 'coder' | 'creative' | 'research';
  model: string;
  settings: SessionSettings;
}

export interface SessionSettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  systemPrompt?: string;
  webSearch: boolean;
  codeGeneration: boolean;
  voiceEnabled: boolean;
  language: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  preferences: UserPreferences;
  subscription: 'free' | 'pro' | 'enterprise';
  usage: UsageStats;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'cyber' | 'neon';
  language: string;
  voiceSettings: VoiceSettings;
  shortcuts: Record<string, string>;
  notifications: boolean;
  autoSave: boolean;
  privacy: PrivacySettings;
}

export interface VoiceSettings {
  enabled: boolean;
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  autoPlay: boolean;
}

export interface PrivacySettings {
  dataCollection: boolean;
  analytics: boolean;
  personalization: boolean;
  shareUsage: boolean;
}

export interface UsageStats {
  messagesCount: number;
  tokensUsed: number;
  filesUploaded: number;
  codeGenerated: number;
  documentsCreated: number;
  lastActive: Date;
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  enabled: boolean;
  settings: Record<string, any>;
}

export interface WebSearchOptions {
  enabled: boolean;
  maxResults: number;
  sources: string[];
  timeRange: 'day' | 'week' | 'month' | 'year' | 'all';
  safeSearch: boolean;
}

export interface CodeGenerationOptions {
  framework: string;
  language: string;
  includeTests: boolean;
  includeDocumentation: boolean;
  fileStructure: 'single' | 'modular' | 'enterprise';
  deploymentConfig: boolean;
}