import React from 'react';
import { Bot, Zap } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';

const TypingIndicator: React.FC = () => {
  const { isNormalMode } = useChat();

  const getGradient = () => {
    return isNormalMode 
      ? 'bg-gradient-to-br from-purple-500 to-pink-600' 
      : 'bg-gradient-to-br from-cyan-500 to-blue-600';
  };

  const getTypingText = () => {
    return isNormalMode ? 'Enhanced AI is analyzing...' : 'CyberAI Pro is processing...';
  };

  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start space-x-3 max-w-[85%]">
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full ${getGradient()} flex items-center justify-center relative`}>
          <Bot className="h-4 w-4 text-white" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
            <Zap className="h-2 w-2 text-yellow-800" />
          </div>
        </div>

        {/* Typing Animation */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-lg">
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">{getTypingText()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;