import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, Paperclip, Mic, Image, Video, MicOff, Upload, Download, AlertCircle, Zap, Settings, Globe, Code, FileText, Sparkles } from 'lucide-react';
import EnhancedMessage from './EnhancedMessage';
import { useChat } from '../contexts/ChatContext';
import { enhancedApiService } from '../utils/enhancedApi';
import { codeGeneratorService } from '../utils/codeGenerator';
import { documentGeneratorService } from '../utils/documentGenerator';
import TypingIndicator from './TypingIndicator';
import ThemeToggle from './ThemeToggle';
import ModelSelector from './ModelSelector';
import { Message } from '../types';

interface EnhancedChatProps {
  onOpenSidebar: () => void;
}

const EnhancedChat: React.FC<EnhancedChatProps> = ({ onOpenSidebar }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showFileOptions, setShowFileOptions] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4-turbo');
  const [webSearchEnabled, setWebSearchEnabled] = useState(true);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4000);
  const [language, setLanguage] = useState('en');
  const [uncensoredMode, setUncensoredMode] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const { messages, addMessage, isNormalMode, getContextMessages } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && uploadedFiles.length === 0) || isTyping) return;

    let userMessage = input.trim();
    setError(null);
    
    // Handle file uploads
    if (uploadedFiles.length > 0) {
      const fileDescriptions = uploadedFiles.map(file => `[Uploaded: ${file.name}]`).join(' ');
      userMessage = `${userMessage} ${fileDescriptions}`.trim();
    }

    setInput('');
    setUploadedFiles([]);
    
    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      content: userMessage,
      sender: 'user',
      timestamp: new Date(),
      files: uploadedFiles.length > 0 ? uploadedFiles : undefined
    };
    
    addMessage(userMsg);
    setIsTyping(true);
    
    try {
      // Get context messages for better conversation flow
      const contextMessages = getContextMessages();
      
      // Determine mode based on current chat mode
      let mode = isNormalMode ? 'normal' : 'cyber';
      
      // Auto-detect if user wants code generation
      if (userMessage.toLowerCase().includes('generate code') || 
          userMessage.toLowerCase().includes('create app') ||
          userMessage.toLowerCase().includes('build project')) {
        mode = 'coder';
      }
      
      // Auto-detect if user wants research
      if (userMessage.toLowerCase().includes('research') || 
          userMessage.toLowerCase().includes('analyze') ||
          userMessage.toLowerCase().includes('study')) {
        mode = 'research';
      }

      const result = await enhancedApiService.sendMessage(userMessage, {
        mode,
        contextMessages,
        webSearch: webSearchEnabled,
        model: selectedModel,
        temperature,
        maxTokens,
        language,
        enableUncensored: uncensoredMode
      });
      
      // Add AI response with metadata
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: result.response,
        sender: 'assistant',
        timestamp: new Date(),
        model: result.model,
        tokens: result.tokens,
        metadata: {
          searchResults: result.searchResults,
          ...(result.metadata || {})
        }
      };
      
      addMessage(assistantMsg);
      
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      addMessage({
        id: (Date.now() + 1).toString(),
        content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
        sender: 'assistant',
        timestamp: new Date()
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not supported in your browser');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        setError(null);
      } catch (err) {
        setError('Failed to start speech recognition');
        setIsRecording(false);
      }
    }
  };

  const handleFileUpload = (type: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    
    switch (type) {
      case 'image':
        input.accept = 'image/*';
        break;
      case 'audio':
        input.accept = 'audio/*';
        break;
      case 'video':
        input.accept = 'video/*';
        break;
      case 'document':
        input.accept = '.pdf,.doc,.docx,.txt,.md';
        break;
      default:
        input.accept = '*/*';
    }
    
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      
      // Validate file sizes
      const oversizedFiles = files.filter(file => file.size > 50 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setError(`Some files are too large. Maximum file size is 50MB.`);
        return;
      }
      
      setUploadedFiles(prev => [...prev, ...files]);
      setShowFileOptions(false);
      setError(null);
    };
    
    input.click();
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const downloadChat = () => {
    if (messages.length === 0) {
      setError('No messages to download');
      return;
    }

    try {
      const chatContent = messages.map(message => {
        const timestamp = message.timestamp.toLocaleString();
        const sender = message.sender === 'user' ? 'You' : (isNormalMode ? 'Enhanced AI Assistant' : 'CyberAI Pro');
        return `[${timestamp}] ${sender}: ${message.content}`;
      }).join('\n\n');

      const blob = new Blob([chatContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cyberai-ultimate-chat-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setError(null);
    } catch (err) {
      setError('Failed to download chat');
    }
  };

  const generateDocument = async (type: 'pdf' | 'word' | 'excel') => {
    if (messages.length === 0) {
      setError('No messages to generate document from');
      return;
    }

    try {
      const content = messages
        .filter(msg => msg.sender === 'assistant')
        .map(msg => msg.content)
        .join('\n\n');

      switch (type) {
        case 'pdf':
          await documentGeneratorService.generatePDF(content, {
            title: 'CyberAI Ultimate Chat Export',
            author: 'CyberAI Ultimate'
          });
          break;
        case 'word':
          await documentGeneratorService.generateWord(content, {
            title: 'CyberAI Ultimate Chat Export'
          });
          break;
        case 'excel':
          const data = messages.map(msg => ({
            Timestamp: msg.timestamp.toLocaleString(),
            Sender: msg.sender === 'user' ? 'User' : 'AI',
            Content: msg.content,
            Model: msg.model || 'N/A',
            Tokens: msg.tokens || 0
          }));
          await documentGeneratorService.generateExcel(data, {
            filename: 'cyberai-chat-data'
          });
          break;
      }
    } catch (err) {
      setError(`Failed to generate ${type.toUpperCase()} document`);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const getPlaceholderText = () => {
    if (isRecording) return "Listening...";
    if (isNormalMode) return "Ask me anything - I have comprehensive knowledge across all domains...";
    return "Ask about cybersecurity, Kali Linux, penetration testing, or any security topic...";
  };

  const getWelcomeTitle = () => {
    return isNormalMode ? "Welcome to CyberAI Ultimate" : "Welcome to CyberAI Pro Ultimate";
  };

  const getWelcomeDescription = () => {
    return isNormalMode 
      ? "Your ultimate AI assistant with unrestricted access to comprehensive knowledge across all domains, real-time web search, and advanced capabilities."
      : "Your elite cybersecurity expert with unrestricted access to advanced penetration testing knowledge, real-time threat intelligence, and cutting-edge security techniques.";
  };

  const getSuggestions = () => {
    return isNormalMode 
      ? [
          "🧠 Explain quantum computing with practical examples",
          "💻 Generate a full-stack React app with authentication",
          "🌐 Research the latest AI developments and trends",
          "📊 Create a comprehensive business analysis report"
        ]
      : [
          "🔒 Show me advanced Nmap scanning techniques with stealth options",
          "🛡️ Explain the latest OWASP Top 10 with real-world examples",
          "🔍 How to perform advanced memory forensics with Volatility?",
          "⚡ Design a comprehensive red team engagement methodology"
        ];
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'zh', name: '中文' },
    { code: 'ar', name: 'العربية' },
    { code: 'ru', name: 'Русский' }
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" ref={chatContainerRef}>
      {/* Enhanced Header */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 ${isNormalMode ? 'bg-gradient-to-br from-purple-500 to-pink-600' : 'bg-gradient-to-br from-cyan-500 to-blue-600'} rounded-xl flex items-center justify-center relative shadow-lg`}>
                <span className="text-white text-lg font-bold">AI</span>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Zap className="h-2.5 w-2.5 text-yellow-800" />
                </div>
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white text-lg">
                  {isNormalMode ? 'CyberAI Ultimate' : 'CyberAI Pro Ultimate'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isNormalMode ? 'Unrestricted AI Assistant' : 'Elite Cybersecurity Expert'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Header Controls */}
          <div className="flex items-center space-x-3">
            {/* Model Selector */}
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
            
            {/* Advanced Options Toggle */}
            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className={`p-2 rounded-lg transition-colors ${showAdvancedOptions ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
              title="Advanced Options"
            >
              <Settings className="h-4 w-4" />
            </button>
            
            {/* Web Search Toggle */}
            <button
              onClick={() => setWebSearchEnabled(!webSearchEnabled)}
              className={`p-2 rounded-lg transition-colors ${webSearchEnabled ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
              title="Web Search"
            >
              <Globe className="h-4 w-4" />
            </button>
            
            {/* AI Status */}
            <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Ultimate AI Online</span>
            </div>
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Download Options */}
            {messages.length > 0 && (
              <div className="relative group">
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Download className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[150px] z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={downloadChat}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FileText className="h-3 w-3" />
                    <span>Download TXT</span>
                  </button>
                  <button
                    onClick={() => generateDocument('pdf')}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FileText className="h-3 w-3" />
                    <span>Generate PDF</span>
                  </button>
                  <button
                    onClick={() => generateDocument('word')}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FileText className="h-3 w-3" />
                    <span>Generate Word</span>
                  </button>
                  <button
                    onClick={() => generateDocument('excel')}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FileText className="h-3 w-3" />
                    <span>Generate Excel</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Advanced Options Panel */}
        {showAdvancedOptions && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Temperature */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Creativity: {temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              
              {/* Max Tokens */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Tokens: {maxTokens}
                </label>
                <input
                  type="range"
                  min="1000"
                  max="8000"
                  step="500"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              {/* Language */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Uncensored Mode Toggle */}
            <div className="mt-3 flex items-center space-x-2">
              <input
                type="checkbox"
                id="uncensored"
                checked={uncensoredMode}
                onChange={(e) => setUncensoredMode(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="uncensored" className="text-xs text-gray-700 dark:text-gray-300">
                🔓 Uncensored Mode (No content restrictions)
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-2xl">
              <div className={`w-20 h-20 ${isNormalMode ? 'bg-gradient-to-br from-purple-500 to-pink-600' : 'bg-gradient-to-br from-cyan-500 to-blue-600'} rounded-2xl flex items-center justify-center mx-auto mb-6 relative shadow-2xl`}>
                <span className="text-white text-3xl font-bold">AI</span>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Zap className="h-4 w-4 text-yellow-800" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {getWelcomeTitle()}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                {getWelcomeDescription()}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {getSuggestions().map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(suggestion.replace(/^[🔒🛡️🔍⚡🧠💻🌐📊]\s/, ''))}
                    className="p-4 text-left rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 hover:shadow-lg hover:scale-105"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <EnhancedMessage 
                key={message.id} 
                message={message} 
                isLatest={index === messages.length - 1}
              />
            ))}
            {isTyping && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input */}
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl">
        {/* Error Banner */}
        {error && (
          <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700 transition-colors"
            >
              ×
            </button>
          </div>
        )}

        {/* Uploaded Files Preview */}
        {uploadedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2 border border-blue-200 dark:border-blue-700">
                <Upload className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-700 dark:text-blue-300 truncate max-w-[150px]">
                  {file.name}
                </span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end space-x-3">
            {/* File Upload */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFileOptions(!showFileOptions)}
                className="p-3 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
              >
                <Paperclip className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              {showFileOptions && (
                <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 min-w-[180px] z-10">
                  <button
                    type="button"
                    onClick={() => handleFileUpload('image')}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Image className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Images</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFileUpload('video')}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Video className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Videos</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFileUpload('audio')}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Mic className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Audio</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFileUpload('document')}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Documents</span>
                  </button>
                </div>
              )}
            </div>

            {/* Voice Input */}
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-3 rounded-xl border transition-all shadow-sm ${
                isRecording 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600' 
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {isRecording ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder={getPlaceholderText()}
                className="w-full resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 pr-12 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
                disabled={isRecording}
              />
              {input && (
                <div className="absolute right-3 top-3 text-xs text-gray-400">
                  {input.length} chars
                </div>
              )}
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={(!input.trim() && uploadedFiles.length === 0) || isTyping}
              className={`p-3 ${isNormalMode ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700' : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'} text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedChat;