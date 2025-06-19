import { useEffect } from 'react';

interface VisitorData {
  ip?: string;
  userAgent: string;
  timestamp: string;
  location?: {
    country: string;
    region: string;
    city: string;
    timezone: string;
  };
  device: {
    type: string;
    browser: string;
    os: string;
  };
  sessionId: string;
}

export const useVisitorTracking = () => {
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        // Parse user agent first (this always works)
        const userAgent = navigator.userAgent;
        const device = parseUserAgent(userAgent);

        // Generate session ID
        const sessionId = localStorage.getItem('session_id') || generateSessionId();
        localStorage.setItem('session_id', sessionId);

        let locationData = null;
        
        // Try to get visitor's IP and location (optional)
        try {
          const locationResponse = await fetch('https://ipapi.co/json/', {
            timeout: 5000
          });
          if (locationResponse.ok) {
            locationData = await locationResponse.json();
          }
        } catch (locationError) {
          console.warn('Location tracking unavailable:', locationError);
          // Continue without location data
        }

        const visitorData: VisitorData = {
          ip: locationData?.ip || 'Unknown',
          userAgent,
          timestamp: new Date().toISOString(),
          location: {
            country: locationData?.country_code || 'Unknown',
            region: locationData?.region || 'Unknown',
            city: locationData?.city || 'Unknown',
            timezone: locationData?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          device,
          sessionId
        };

        // Try to send to backend (optional)
        try {
          await fetch('https://cyberai.rf.gd/backend/track-visitor.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(visitorData),
            signal: AbortSignal.timeout(5000) // 5 second timeout
          });
        } catch (backendError) {
          console.warn('Backend tracking unavailable:', backendError);
          // Store locally as fallback
          const localVisitors = JSON.parse(localStorage.getItem('local_visitors') || '[]');
          localVisitors.push(visitorData);
          // Keep only last 50 visitors to prevent storage bloat
          if (localVisitors.length > 50) {
            localVisitors.splice(0, localVisitors.length - 50);
          }
          localStorage.setItem('local_visitors', JSON.stringify(localVisitors));
        }

        // Track page views locally
        trackPageView(sessionId);
        
      } catch (error) {
        console.warn('Visitor tracking partially failed, continuing with limited functionality:', error);
        // Don't throw error - let the app continue working
      }
    };

    trackVisitor();
  }, []);

  const parseUserAgent = (userAgent: string) => {
    const device = {
      type: 'Desktop',
      browser: 'Unknown',
      os: 'Unknown'
    };

    // Detect device type
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      device.type = /iPad/.test(userAgent) ? 'Tablet' : 'Mobile';
    }

    // Detect browser
    if (userAgent.includes('Chrome')) device.browser = 'Chrome';
    else if (userAgent.includes('Firefox')) device.browser = 'Firefox';
    else if (userAgent.includes('Safari')) device.browser = 'Safari';
    else if (userAgent.includes('Edge')) device.browser = 'Edge';
    else if (userAgent.includes('Opera')) device.browser = 'Opera';

    // Detect OS
    if (userAgent.includes('Windows')) device.os = 'Windows';
    else if (userAgent.includes('Mac')) device.os = 'macOS';
    else if (userAgent.includes('Linux')) device.os = 'Linux';
    else if (userAgent.includes('Android')) device.os = 'Android';
    else if (userAgent.includes('iOS')) device.os = 'iOS';

    return device;
  };

  const generateSessionId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const trackPageView = (sessionId: string) => {
    const startTime = Date.now();
    
    const updateSession = () => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      
      // Try to update backend
      fetch('https://cyberai.rf.gd/backend/update-session.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          duration,
          pageUrl: window.location.href
        }),
        signal: AbortSignal.timeout(3000)
      }).catch(() => {
        // Fallback to local storage
        const sessionData = {
          sessionId,
          duration,
          pageUrl: window.location.href,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem(`session_${sessionId}`, JSON.stringify(sessionData));
      });
    };

    // Update session on page unload
    const handleBeforeUnload = () => {
      updateSession();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Update session every 30 seconds
    const interval = setInterval(updateSession, 30000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  };
};