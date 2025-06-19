import React, { useState } from 'react';
import { Copy, Check, User, Bot, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { useTheme } from '../contexts/ThemeContext';
import { useChat } from '../contexts/ChatContext';

interface MessageProps {
  message: {
    id: string;
    content: string;
    sender: 'user' | 'assistant';
    timestamp: Date;
    files?: File[];
  };
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();
  const { isNormalMode } = useChat();

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

  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start space-x-3 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          message.sender === 'user' 
            ? getUserGradient()
            : getAssistantGradient()
        }`}>
          {message.sender === 'user' ? (
            <User className="h-4 w-4 text-white" />
          ) : (
            <Bot className="h-4 w-4 text-white" />
          )}
        </div>

        {/* Message Content */}
        <div className={`relative group ${message.sender === 'user' ? getUserGradient() + ' text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'} rounded-2xl px-4 py-3 shadow-lg`}>
          {message.sender === 'assistant' ? (
            <div className="prose prose-sm dark:prose-invert prose-pre:bg-gray-900 dark:prose-pre:bg-gray-800 prose-pre:text-gray-100 dark:prose-pre:text-gray-200 max-w-none">
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
          
          {/* Copy button for user messages */}
          {message.sender === 'user' && (
            <button
              onClick={() => copyToClipboard(message.content)}
              className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-lg border border-gray-200 dark:border-gray-700 transition-opacity"
            >
              {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-gray-600 dark:text-gray-400" />}
            </button>
          )}
          
          {/* Copy button for assistant messages */}
          {message.sender === 'assistant' && (
            <button
              onClick={() => copyToClipboard(message.content)}
              className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-lg border border-gray-200 dark:border-gray-700 transition-opacity"
            >
              {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-gray-600 dark:text-gray-400" />}
            </button>
          )}

          {/* Timestamp */}
          <div className={`text-xs mt-2 ${message.sender === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;