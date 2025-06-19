import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, Paperclip, Mic, Image, Video, MicOff, Upload, Download, AlertCircle, Zap } from 'lucide-react';
import Message from './Message';
import { useChat } from '../contexts/ChatContext';
import { sendMessage, uploadImage, optimizeContextMessages } from '../utils/api';
import TypingIndicator from './TypingIndicator';
import ThemeToggle from './ThemeToggle';

interface ChatProps {
  onOpenSidebar: () => void;
}

const Chat: React.FC<ChatProps> = ({ onOpenSidebar }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showFileOptions, setShowFileOptions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
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

  // Mobile keyboard handling
  useEffect(() => {
    const handleResize = () => {
      if (isInputFocused && window.innerWidth <= 768) {
        // Small delay to ensure keyboard is fully shown
        setTimeout(() => {
          textareaRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }, 300);
      }
    };

    const handleVisibilityChange = () => {
      if (isInputFocused && window.innerWidth <= 768) {
        setTimeout(() => {
          textareaRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isInputFocused]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

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
  }, []);

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
    const userMsg = {
      id: Date.now().toString(),
      content: userMessage,
      sender: 'user' as const,
      timestamp: new Date(),
      files: uploadedFiles.length > 0 ? uploadedFiles : undefined
    };
    
    addMessage(userMsg);
    setIsTyping(true);
    
    try {
      // Get optimized context messages for better performance and intelligence
      const contextMessages = optimizeContextMessages(getContextMessages(), 4000);
      
      const response = await sendMessage(userMessage, isNormalMode, contextMessages);
      
      // Add AI response
      addMessage({
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'assistant',
        timestamp: new Date()
      });
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

  const handleInputFocus = () => {
    setIsInputFocused(true);
    // On mobile, scroll to input after a short delay to account for keyboard animation
    if (window.innerWidth <= 768) {
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 300);
    }
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
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
      default:
        input.accept = '*/*';
    }
    
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      
      // Validate file sizes
      const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setError(`Some files are too large. Maximum file size is 10MB.`);
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
        const sender = message.sender === 'user' ? 'You' : (isNormalMode ? 'AI Assistant' : 'CyberAI');
        return `[${timestamp}] ${sender}: ${message.content}`;
      }).join('\n\n');

      const blob = new Blob([chatContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${isNormalMode ? 'ai-assistant' : 'cyberai'}-chat-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setError(null);
    } catch (err) {
      setError('Failed to download chat');
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
    return isNormalMode ? "Welcome to Enhanced AI Assistant" : "Welcome to CyberAI Pro";
  };

  const getWelcomeDescription = () => {
    return isNormalMode 
      ? "Your advanced AI assistant with comprehensive knowledge across all domains - from programming and data science to business and general knowledge."
      : "Your elite cybersecurity expert with advanced knowledge of penetration testing, digital forensics, threat analysis, and all security domains.";
  };

  const getSuggestions = () => {
    return isNormalMode 
      ? [
          "Explain machine learning algorithms with examples",
          "Help me design a scalable web application architecture",
          "What are the latest trends in cloud computing?",
          "Create a Python script for data analysis"
        ]
      : [
          "Show me advanced Nmap scanning techniques",
          "Explain the latest OWASP Top 10 vulnerabilities",
          "How to perform memory forensics with Volatility?",
          "Design a comprehensive penetration testing methodology"
        ];
  };

  return (
    <div className="flex flex-col h-full" ref={chatContainerRef}>
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 ${isNormalMode ? 'bg-gradient-to-br from-purple-500 to-pink-600' : 'bg-gradient-to-br from-cyan-500 to-blue-600'} rounded-lg flex items-center justify-center relative`}>
                <span className="text-white text-sm font-bold">AI</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Zap className="h-2 w-2 text-yellow-800" />
                </div>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {isNormalMode ? 'Enhanced AI Assistant' : 'CyberAI Pro'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isNormalMode ? 'Advanced Multi-Domain AI' : 'Elite Cybersecurity Expert'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Header Right Side */}
          <div className="flex items-center space-x-4">
            {/* AI Status */}
            <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Enhanced AI Online</span>
            </div>
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Download Chat Button */}
            {messages.length > 0 && (
              <button
                onClick={downloadChat}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Download Chat"
              >
                <Download className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className={`w-16 h-16 ${isNormalMode ? 'bg-gradient-to-br from-purple-500 to-pink-600' : 'bg-gradient-to-br from-cyan-500 to-blue-600'} rounded-xl flex items-center justify-center mx-auto mb-4 relative`}>
                <span className="text-white text-2xl font-bold">AI</span>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Zap className="h-3 w-3 text-yellow-800" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {getWelcomeTitle()}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {getWelcomeDescription()}
              </p>
              <div className="grid grid-cols-1 gap-2 text-sm">
                {getSuggestions().map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(suggestion)}
                    className="p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg transition-all duration-300 ${isInputFocused && window.innerWidth <= 768 ? 'md:transform-none' : ''}`}>
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
              <div key={index} className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                <Upload className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
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
                className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Paperclip className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              {showFileOptions && (
                <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 min-w-[150px] z-10">
                  <button
                    type="button"
                    onClick={() => handleFileUpload('image')}
                    className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Image className="h-4 w-4" />
                    <span className="text-sm">Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFileUpload('audio')}
                    className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Mic className="h-4 w-4" />
                    <span className="text-sm">Audio</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFileUpload('video')}
                    className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Video className="h-4 w-4" />
                    <span className="text-sm">Video</span>
                  </button>
                </div>
              )}
            </div>

            {/* Voice Input */}
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-3 rounded-lg border transition-colors ${
                isRecording 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {isRecording ? (
                <MicOff className="h-5 w-5 text-red-600" />
              ) : (
                <Mic className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder={getPlaceholderText()}
                className="w-full resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 pr-12 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
                disabled={isRecording}
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={(!input.trim() && uploadedFiles.length === 0) || isTyping}
              className={`p-3 ${isNormalMode ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700' : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'} text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;