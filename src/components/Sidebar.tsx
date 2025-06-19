import React, { useState } from 'react';
import { Shield, X, Instagram, Settings, HelpCircle, Zap, Lock, Search, Terminal, Download, User, MessageCircle, Brain, Edit3, Plus, Trash2, MoreVertical, Cpu, Database, Code, Globe } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useChat } from '../contexts/ChatContext';
import { useUser } from '../contexts/UserContext';
import UserProfileModal from './UserProfileModal';

interface SidebarProps {
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { theme } = useTheme();
  const { 
    clearChat, 
    messages, 
    isNormalMode, 
    setIsNormalMode, 
    chatSessions, 
    currentSessionId, 
    createNewSession, 
    loadSession, 
    deleteSession, 
    updateSessionTitle 
  } = useChat();
  const { user } = useUser();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showSessionOptions, setShowSessionOptions] = useState<string | null>(null);

  const handleNewChat = () => {
    createNewSession();
    onClose();
  };

  const handleSessionClick = (sessionId: string) => {
    loadSession(sessionId);
    onClose();
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
      deleteSession(sessionId);
    }
    setShowSessionOptions(null);
  };

  const handleEditTitle = (sessionId: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(sessionId);
    setEditingTitle(currentTitle);
    setShowSessionOptions(null);
  };

  const handleSaveTitle = (sessionId: string) => {
    if (editingTitle.trim()) {
      updateSessionTitle(sessionId, editingTitle.trim());
    }
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, sessionId: string) => {
    if (e.key === 'Enter') {
      handleSaveTitle(sessionId);
    } else if (e.key === 'Escape') {
      setEditingSessionId(null);
      setEditingTitle('');
    }
  };

  const downloadAllChats = () => {
    if (messages.length === 0) {
      alert('No messages to download');
      return;
    }

    const chatContent = messages.map(message => {
      const timestamp = message.timestamp.toLocaleString();
      const sender = message.sender === 'user' ? (user.name || 'You') : (isNormalMode ? 'Enhanced AI Assistant' : 'CyberAI Pro');
      return `[${timestamp}] ${sender}: ${message.content}`;
    }).join('\n\n');

    const fullContent = `CyberAI Enhanced Chat Export\nUser: ${user.name || 'Anonymous'}\nMode: ${isNormalMode ? 'Enhanced AI Assistant' : 'CyberAI Pro'}\nExported: ${new Date().toLocaleString()}\n${'='.repeat(50)}\n\n${chatContent}\n\n${'='.repeat(50)}\nDeveloped by Udit Narayan - Instagram: @https.udit`;

    const blob = new Blob([fullContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyberai-enhanced-${user.name?.toLowerCase().replace(/\s+/g, '-') || 'user'}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <>
      <div className="h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg relative">
                <Shield className="h-6 w-6 text-white" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Zap className="h-2.5 w-2.5 text-yellow-800" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  CyberAI Pro
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Enhanced Intelligence System</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={handleNewChat}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Chat</span>
            </button>
            
            {messages.length > 0 && (
              <button
                onClick={downloadAllChats}
                className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download Chat</span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Chat History */}
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Chat History</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {chatSessions.map((session) => (
                <div
                  key={session.id}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                    session.id === currentSessionId
                      ? 'bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                  onClick={() => handleSessionClick(session.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {editingSessionId === session.id ? (
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={() => handleSaveTitle(session.id)}
                          onKeyDown={(e) => handleKeyPress(e, session.id)}
                          className="w-full bg-transparent border-none outline-none text-sm font-medium text-gray-900 dark:text-white"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {session.title}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          session.mode === 'normal'
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                            : 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400'
                        }`}>
                          {session.mode === 'normal' ? 'Enhanced AI' : 'CyberAI Pro'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(session.updatedAt)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSessionOptions(showSessionOptions === session.id ? null : session.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                      >
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      </button>
                      
                      {showSessionOptions === session.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[120px] z-10">
                          <button
                            onClick={(e) => handleEditTitle(session.id, session.title, e)}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Edit3 className="h-3 w-3" />
                            <span>Rename</span>
                          </button>
                          <button
                            onClick={(e) => handleDeleteSession(session.id, e)}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {chatSessions.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No chat history yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* User Profile Section */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-200/50 dark:border-indigo-700/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">Profile</h3>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="p-1 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-800/50 transition-colors"
                >
                  <Edit3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.name || 'Anonymous User'}
                  </p>
                  {user.email && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/50">
              <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-3">AI Mode</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setIsNormalMode(false)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    !isNormalMode 
                      ? 'bg-purple-100 dark:bg-purple-800/50 text-purple-800 dark:text-purple-200' 
                      : 'hover:bg-purple-50 dark:hover:bg-purple-900/30 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Brain className="h-4 w-4" />
                  <span className="text-sm">CyberSecurity Expert Pro</span>
                </button>
                <button
                  onClick={() => setIsNormalMode(true)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isNormalMode 
                      ? 'bg-purple-100 dark:bg-purple-800/50 text-purple-800 dark:text-purple-200' 
                      : 'hover:bg-purple-50 dark:hover:bg-purple-900/30 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">Enhanced AI Assistant</span>
                </button>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-cyan-200/50 dark:border-cyan-700/50">
              <h3 className="text-sm font-semibold text-cyan-800 dark:text-cyan-300 mb-2">About Enhanced AI</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {isNormalMode 
                  ? "Advanced AI with comprehensive knowledge across programming, data science, cloud computing, business, and all academic domains."
                  : "Elite cybersecurity expert with advanced knowledge of penetration testing, digital forensics, threat analysis, and all security domains."
                }
              </p>
            </div>

            {/* Enhanced Capabilities */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Enhanced Capabilities</h3>
              <div className="grid grid-cols-1 gap-2 text-xs">
                {(isNormalMode ? [
                  { icon: Code, text: 'Programming & Development', color: 'text-blue-500' },
                  { icon: Database, text: 'Data Science & AI/ML', color: 'text-green-500' },
                  { icon: Globe, text: 'Cloud & DevOps', color: 'text-purple-500' },
                  { icon: Cpu, text: 'System Architecture', color: 'text-orange-500' },
                  { icon: Brain, text: 'Advanced Analytics', color: 'text-pink-500' },
                  { icon: Settings, text: 'Business Strategy', color: 'text-cyan-500' }
                ] : [
                  { icon: Lock, text: 'Advanced Penetration Testing', color: 'text-red-500' },
                  { icon: Shield, text: 'Elite Security Auditing', color: 'text-blue-500' },
                  { icon: Search, text: 'Digital Forensics Pro', color: 'text-green-500' },
                  { icon: Terminal, text: 'Kali Linux Mastery', color: 'text-purple-500' },
                  { icon: Zap, text: 'Threat Intelligence', color: 'text-yellow-500' },
                  { icon: Settings, text: 'Security Architecture', color: 'text-cyan-500' }
                ]).map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <feature.icon className={`h-4 w-4 ${feature.color}`} />
                    <span className="text-gray-700 dark:text-gray-300">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Features */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Enhanced Features</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-yellow-700 dark:text-yellow-300">🧠 Advanced Intelligence</span>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 dark:text-green-300">💾 Smart Memory System</span>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-700 dark:text-blue-300">🎤 Voice Recognition</span>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-purple-700 dark:text-purple-300">📁 Multi-File Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Enhanced AI Online</span>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p className="mb-2">Developed by <span className="font-medium text-cyan-600 dark:text-cyan-400">Udit Narayan</span></p>
              <div className="flex items-center space-x-3">
                <a 
                  href="https://instagram.com/https.udit" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                >
                  <Instagram className="h-3 w-3" />
                  <span>@https.udit</span>
                </a>
              </div>
              <p className="mt-2 text-xs opacity-75">
                Enhanced with Advanced AI Intelligence
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close session options */}
      {showSessionOptions && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowSessionOptions(null)}
        />
      )}

      {/* User Profile Modal */}
      {showProfileModal && (
        <UserProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </>
  );
};

export default Sidebar;