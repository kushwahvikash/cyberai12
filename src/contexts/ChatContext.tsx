import React, { createContext, useContext, useState, useEffect } from 'react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  files?: File[];
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  mode: 'cyber' | 'normal';
}

interface ChatContextType {
  messages: Message[];
  addMessage: (message: Message) => void;
  clearChat: () => void;
  isNormalMode: boolean;
  setIsNormalMode: (mode: boolean) => void;
  chatSessions: ChatSession[];
  currentSessionId: string | null;
  createNewSession: () => void;
  loadSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  getContextMessages: () => Message[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isNormalMode, setIsNormalMode] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Load chat sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('cyberai_chat_sessions');
    const savedCurrentSession = localStorage.getItem('cyberai_current_session');
    
    if (savedSessions) {
      try {
        const sessions = JSON.parse(savedSessions).map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setChatSessions(sessions);
        
        if (savedCurrentSession && sessions.find((s: ChatSession) => s.id === savedCurrentSession)) {
          loadSession(savedCurrentSession);
        } else if (sessions.length > 0) {
          loadSession(sessions[0].id);
        }
      } catch (error) {
        console.error('Error loading chat sessions:', error);
        createNewSession();
      }
    } else {
      createNewSession();
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (chatSessions.length > 0) {
      localStorage.setItem('cyberai_chat_sessions', JSON.stringify(chatSessions));
    }
  }, [chatSessions]);

  // Save current session ID
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('cyberai_current_session', currentSessionId);
    }
  }, [currentSessionId]);

  const generateSessionTitle = (firstMessage: string): string => {
    const words = firstMessage.split(' ').slice(0, 6);
    return words.join(' ') + (firstMessage.split(' ').length > 6 ? '...' : '');
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      mode: isNormalMode ? 'normal' : 'cyber'
    };

    setChatSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
  };

  const loadSession = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      setIsNormalMode(session.mode === 'normal');
    }
  };

  const deleteSession = (sessionId: string) => {
    setChatSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);
      
      // If we're deleting the current session, switch to another or create new
      if (sessionId === currentSessionId) {
        if (filtered.length > 0) {
          loadSession(filtered[0].id);
        } else {
          createNewSession();
        }
      }
      
      return filtered;
    });
  };

  const updateSessionTitle = (sessionId: string, title: string) => {
    setChatSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, title, updatedAt: new Date() }
          : session
      )
    );
  };

  const addMessage = (message: Message) => {
    setMessages(prev => {
      const newMessages = [...prev, message];
      
      // Update the current session
      setChatSessions(prevSessions => 
        prevSessions.map(session => {
          if (session.id === currentSessionId) {
            const updatedSession = {
              ...session,
              messages: newMessages,
              updatedAt: new Date(),
              mode: isNormalMode ? 'normal' : 'cyber'
            };
            
            // Auto-generate title from first user message
            if (session.title === 'New Chat' && message.sender === 'user' && newMessages.length === 1) {
              updatedSession.title = generateSessionTitle(message.content);
            }
            
            return updatedSession;
          }
          return session;
        })
      );
      
      return newMessages;
    });
  };

  const clearChat = () => {
    createNewSession();
  };

  // Get context messages for API (last 10 messages to maintain context while limiting tokens)
  const getContextMessages = (): Message[] => {
    const contextLimit = 10;
    return messages.slice(-contextLimit);
  };

  // Clean up old sessions (keep only last 50 sessions)
  useEffect(() => {
    if (chatSessions.length > 50) {
      const sortedSessions = [...chatSessions].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      const sessionsToKeep = sortedSessions.slice(0, 50);
      setChatSessions(sessionsToKeep);
    }
  }, [chatSessions]);

  return (
    <ChatContext.Provider value={{ 
      messages, 
      addMessage, 
      clearChat, 
      isNormalMode, 
      setIsNormalMode,
      chatSessions,
      currentSessionId,
      createNewSession,
      loadSession,
      deleteSession,
      updateSessionTitle,
      getContextMessages
    }}>
      {children}
    </ChatContext.Provider>
  );
};