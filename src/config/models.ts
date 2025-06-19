import { AIModel } from '../types';

export const AI_MODELS: AIModel[] = [
  // Chat Models
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    description: 'Most capable GPT-4 model with 128k context',
    capabilities: ['chat', 'reasoning', 'analysis', 'coding'],
    maxTokens: 128000,
    costPer1kTokens: 0.01,
    category: 'chat'
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Most powerful Claude model for complex tasks',
    capabilities: ['chat', 'reasoning', 'analysis', 'creative'],
    maxTokens: 200000,
    costPer1kTokens: 0.015,
    category: 'chat'
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    description: 'Google\'s advanced multimodal AI',
    capabilities: ['chat', 'multimodal', 'reasoning'],
    maxTokens: 32000,
    costPer1kTokens: 0.0005,
    category: 'multimodal'
  },
  {
    id: 'llama-3-70b',
    name: 'Llama 3 70B',
    provider: 'Meta',
    description: 'Open-source powerhouse for general tasks',
    capabilities: ['chat', 'reasoning', 'multilingual'],
    maxTokens: 8000,
    costPer1kTokens: 0.0008,
    category: 'chat'
  },
  {
    id: 'mixtral-8x7b',
    name: 'Mixtral 8x7B',
    provider: 'Mistral',
    description: 'Efficient mixture of experts model',
    capabilities: ['chat', 'coding', 'multilingual'],
    maxTokens: 32000,
    costPer1kTokens: 0.0006,
    category: 'chat'
  },
  
  // Code Models
  {
    id: 'codellama-34b',
    name: 'CodeLlama 34B',
    provider: 'Meta',
    description: 'Specialized for code generation and debugging',
    capabilities: ['coding', 'debugging', 'explanation'],
    maxTokens: 16000,
    costPer1kTokens: 0.0008,
    category: 'code'
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    provider: 'DeepSeek',
    description: 'Advanced coding assistant',
    capabilities: ['coding', 'architecture', 'optimization'],
    maxTokens: 16000,
    costPer1kTokens: 0.0014,
    category: 'code'
  },
  {
    id: 'wizardcoder-34b',
    name: 'WizardCoder 34B',
    provider: 'WizardLM',
    description: 'Powerful code generation model',
    capabilities: ['coding', 'refactoring', 'documentation'],
    maxTokens: 8000,
    costPer1kTokens: 0.0008,
    category: 'code'
  },

  // Specialized Models
  {
    id: 'grok-1',
    name: 'Grok-1',
    provider: 'xAI',
    description: 'Rebellious AI with real-time web access',
    capabilities: ['chat', 'web-search', 'humor', 'uncensored'],
    maxTokens: 8000,
    costPer1kTokens: 0.005,
    category: 'chat'
  },
  {
    id: 'perplexity-70b',
    name: 'Perplexity 70B',
    provider: 'Perplexity',
    description: 'Search-focused AI with citations',
    capabilities: ['search', 'research', 'citations'],
    maxTokens: 4000,
    costPer1kTokens: 0.001,
    category: 'chat'
  }
];

export const getModelById = (id: string): AIModel | undefined => {
  return AI_MODELS.find(model => model.id === id);
};

export const getModelsByCategory = (category: string): AIModel[] => {
  return AI_MODELS.filter(model => model.category === category);
};

export const getDefaultModel = (category: string = 'chat'): AIModel => {
  const models = getModelsByCategory(category);
  return models[0] || AI_MODELS[0];
};