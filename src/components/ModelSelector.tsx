import React, { useState } from 'react';
import { ChevronDown, Cpu, Zap, Brain, Code, Search, Sparkles } from 'lucide-react';
import { AI_MODELS, getModelsByCategory } from '../config/models';
import { AIModel } from '../types';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  className?: string;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('chat');

  const categories = [
    { id: 'chat', name: 'Chat Models', icon: Brain, color: 'text-blue-500' },
    { id: 'code', name: 'Code Models', icon: Code, color: 'text-green-500' },
    { id: 'multimodal', name: 'Multimodal', icon: Sparkles, color: 'text-purple-500' }
  ];

  const getModelIcon = (model: AIModel) => {
    if (model.capabilities.includes('uncensored')) return Zap;
    if (model.capabilities.includes('coding')) return Code;
    if (model.capabilities.includes('search')) return Search;
    if (model.capabilities.includes('multimodal')) return Sparkles;
    return Brain;
  };

  const getModelColor = (model: AIModel) => {
    if (model.provider === 'OpenAI') return 'text-green-500';
    if (model.provider === 'Anthropic') return 'text-orange-500';
    if (model.provider === 'Google') return 'text-blue-500';
    if (model.provider === 'Meta') return 'text-purple-500';
    if (model.provider === 'xAI') return 'text-red-500';
    return 'text-gray-500';
  };

  const selectedModelData = AI_MODELS.find(m => m.id === selectedModel);
  const categoryModels = getModelsByCategory(selectedCategory);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        {selectedModelData && (
          <>
            {React.createElement(getModelIcon(selectedModelData), {
              className: `h-4 w-4 ${getModelColor(selectedModelData)}`
            })}
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedModelData.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({selectedModelData.provider})
            </span>
          </>
        )}
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50">
          {/* Category Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-xs font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {React.createElement(category.icon, { className: `h-3 w-3 ${category.color}` })}
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* Model List */}
          <div className="max-h-64 overflow-y-auto">
            {categoryModels.map((model) => {
              const Icon = getModelIcon(model);
              return (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelChange(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedModel === model.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <Icon className={`h-4 w-4 ${getModelColor(model)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {model.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {model.provider}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {model.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {model.maxTokens.toLocaleString()} tokens
                      </span>
                      <span className="text-xs text-green-600 dark:text-green-400">
                        ${model.costPer1kTokens}/1k
                      </span>
                    </div>
                  </div>
                  {selectedModel === model.id && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {categoryModels.length} models available in {categories.find(c => c.id === selectedCategory)?.name}
            </p>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ModelSelector;