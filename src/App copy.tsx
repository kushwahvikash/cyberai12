import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import WelcomeModal from './components/WelcomeModal';
import FeaturePopup from './components/FeaturePopup';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { ChatProvider } from './contexts/ChatContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { useVisitorTracking } from './hooks/useVisitorTracking';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();
  const { isFirstTime, setIsFirstTime } = useUser();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showFeaturePopup, setShowFeaturePopup] = useState(false);

  // Track visitors
  useVisitorTracking();

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  useEffect(() => {
    if (isFirstTime) {
      setShowWelcome(true);
    } else {
      // Show feature popup for returning users (only once per session)
      const hasSeenFeaturePopup = sessionStorage.getItem('cyberai_feature_popup_shown');
      if (!hasSeenFeaturePopup) {
        setTimeout(() => {
          setShowFeaturePopup(true);
          sessionStorage.setItem('cyberai_feature_popup_shown', 'true');
        }, 3000); // Show after 3 seconds
      }
    }
  }, [isFirstTime]);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    setIsFirstTime(false);
    // Show feature popup after welcome for new users
    setTimeout(() => {
      setShowFeaturePopup(true);
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Chat onOpenSidebar={() => setSidebarOpen(true)} />
      </div>

      {/* Welcome Modal */}
      {showWelcome && (
        <WelcomeModal onComplete={handleWelcomeComplete} />
      )}

      {/* Feature Popup */}
      {showFeaturePopup && (
        <FeaturePopup onClose={() => setShowFeaturePopup(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <ChatProvider>
          <AppContent />
        </ChatProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;