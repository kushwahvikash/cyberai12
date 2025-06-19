import React, { useState, useEffect } from 'react';
import { Copy, Check, User, Bot, Download, Volume2, Search, Code, FileText, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { useTheme } from '../contexts/ThemeContext';
import { useChat } from '../contexts/ChatContext';
import { Message } from '../types';
import TypewriterText from './TypewriterText';
import VoiceControls from './VoiceControls';

interface EnhancedMessageProps {
  message: Message;
  isLatest?: boolean;
}

const EnhancedMessage: React.FC<EnhancedMessageProps> = ({ message, isLatest = false }) => {
  const [copied, setCopied] = useState(false);
  const [showTypewriter, setShowTypewriter] = useState(false);
  const { theme } = useTheme();
  const { isNormalMode } = useChat();

  useEffect(() => {
    if (isLatest && message.sender === 'assistant') {
      setShowTypewriter(true);
    }
  }, [isLatest, message.sender]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderFilePreview = (file: File) => {
    const fileType = file.type.split('/')[0];
    const fileUrl = URL.createObjectURL(file);

    switch (fileType) {
      case 'image':
        return (
          <div className="mt-2 relative group">
            <img 
              src={fileUrl} 
              alt={file.name}
              className="max-w-xs max-h-48 rounded-lg object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
              <a
                href={fileUrl}
                download={file.name}
                className="opacity-0 group-hover:opacity-100 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg transition-opacity"
              >
                <Download className="h-4 w-4" />
              </a>
            </div>
          </div>
        );
      case 'audio':
        return (
          <div className="mt-2">
            <audio controls className="max-w-xs">
              <source src={fileUrl} type={file.type} />
              Your browser does not support the audio element.
            </audio>
          </div>
        );
      case 'video':
        return (
          <div className="mt-2">
            <video controls className="max-w-xs max-h-48 rounded-lg">
              <source src={fileUrl} type={file.type} />
              Your browser does not support the video element.
            </video>
          </div>
        );
      default:
        return (
          <div className="mt-2 flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-2 max-w-xs">
            <div className="flex-1 truncate">
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <a
              href={fileUrl}
              download={file.name}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              <Download className="h-4 w-4" />
            </a>
          </div>
        );
    }
  };

  const getUserGradient = () => {
    return isNormalMode 
      ? 'bg-gradient-to-br from-purple-500 to-pink-600' 
      : 'bg-gradient-to-br from-purple-500 to-pink-600';
  };

  const getAssistantGradient = () => {
    return isNormalMode 
      ? 'bg-gradient-to-br from-purple-500 to-pink-600' 
      : 'bg-gradient-to-br from-cyan-500 to-blue-600';
  };

  const renderSearchResults = () => {
    if (!message.metadata?.searchResults) return null;

    return (
      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="flex items-center space-x-2 mb-2">
          <Search className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Web Search Results
          </span>
        </div>
        <div className="space-y-2">
          {message.metadata.searchResults.slice(0, 3).map((result, index) => (
            <div key={index} className="text-xs">
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {result.title}
              </a>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {result.snippet.substring(0, 100)}...
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCodeFiles = () => {
    if (!message.metadata?.codeFiles) return null;

    return (
      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
        <div className="flex items-center space-x-2 mb-2">
          <Code className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            Generated Code Files
          </span>
        </div>
        <div className="space-y-2">
          {message.metadata.codeFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-gray-500">({file.language})</span>
              </div>
              <button
                onClick={() => copyToClipboard(file.content)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex items-start space-x-3 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center relative ${
          message.sender === 'user' 
            ? getUserGradient()
            : getAssistantGradient()
        }`}>
          {message.sender === 'user' ? (
            <User className="h-5 w-5 text-white" />
          ) : (
            <Bot className="h-5 w-5 text-white" />
          )}
          {message.sender === 'assistant' && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
              <Zap className="h-2.5 w-2.5 text-yellow-800" />
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className={`relative group ${message.sender === 'user' ? getUserGradient() + ' text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'} rounded-2xl px-5 py-4 shadow-lg`}>
          {message.sender === 'assistant' ? (
            <div className="prose prose-sm dark:prose-invert prose-pre:bg-gray-900 dark:prose-pre:bg-gray-800 prose-pre:text-gray-100 dark:prose-pre:text-gray-200 max-w-none">
              {showTypewriter && isLatest ? (
                <TypewriterText
                  text={message.content}
                  speed={20}
                  onComplete={() => setShowTypewriter(false)}
                />
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <div className="relative">
                          <div className="flex items-center justify-between bg-gray-800 dark:bg-gray-900 text-gray-200 dark:text-gray-300 px-4 py-2 rounded-t-lg text-sm">
                            <span>{match[1]}</span>
                            <button
                              onClick={() => copyToClipboard(String(children).replace(/\n$/, ''))}
                              className="flex items-center space-x-1 hover:bg-gray-700 dark:hover:bg-gray-800 px-2 py-1 rounded transition-colors"
                            >
                              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              <span className="text-xs">{copied ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          <SyntaxHighlighter
                            style={theme === 'dark' ? oneDark : oneLight}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              borderTopLeftRadius: 0,
                              borderTopRightRadius: 0,
                              borderBottomLeftRadius: '0.5rem',
                              borderBottomRightRadius: '0.5rem',
                              backgroundColor: theme === 'dark' ? '#1a1b26' : '#f8f9fa'
                            }}
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-1 py-0.5 rounded text-sm" {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}
              
              {/* Render metadata */}
              {renderSearchResults()}
              {renderCodeFiles()}
            </div>
          ) : (
            <div>
              <p className="text-white whitespace-pre-wrap">{message.content}</p>
              {/* Render uploaded files for user messages */}
              {message.files && message.files.map((file, index) => (
                <div key={index}>
                  {renderFilePreview(file)}
                </div>
              ))}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              {/* Voice Controls for Assistant Messages */}
              {message.sender === 'assistant' && (
                <VoiceControls
                  text={message.content}
                  className="flex items-center space-x-1"
                />
              )}
              
              {/* Model Info */}
              {message.model && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {message.model}
                </span>
              )}
              
              {/* Token Count */}
              {message.tokens && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {message.tokens} tokens
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Copy Button */}
              <button
                onClick={() => copyToClipboard(message.content)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Copy message"
              >
                {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-gray-500" />}
              </button>
              
              {/* Timestamp */}
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMessage;