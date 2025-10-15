import { useEffect, useRef, useState, useCallback } from 'react';

interface NotificationMessage {
  id: string;
  type: 'order' | 'system' | 'staff' | 'inventory' | 'alert';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  timestamp: Date;
  data?: any;
  department?: 'kitchen' | 'barista' | 'shisha' | 'admin';
  actionRequired?: boolean;
  soundEnabled?: boolean;
}

interface WebSocketNotificationHook {
  notifications: NotificationMessage[];
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  sendMessage: (message: any) => void;
  clearNotifications: () => void;
  markAsRead: (notificationId: string) => void;
  dismissNotification: (notificationId: string) => void;
}

/**
 * Custom hook for WebSocket notifications
 * Provides real-time notification functionality for admin and staff dashboards
 */
export function useWebSocketNotifications(
  userId?: string,
  role?: string,
  options: {
    autoConnect?: boolean;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    enableSound?: boolean;
  } = {}
): WebSocketNotificationHook {
  const {
    autoConnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
    enableSound = true
  } = options;

  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (enableSound && typeof window !== 'undefined') {
      try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Fallback to system beep if audio file doesn't exist
          console.log('\u0007'); // ASCII bell character
        });
      } catch (error) {
        console.log('Could not play notification sound:', error);
      }
    }
  }, [enableSound]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus('connecting');
    
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/notifications`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;

        // Send authentication if provided
        if (userId && role) {
          ws.send(JSON.stringify({
            type: 'auth',
            userId,
            role
          }));
        }

        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'pong') {
            return; // Heartbeat response
          }
          
          if (message.type === 'connection') {
            console.log('WebSocket connection established:', message.message);
            return;
          }

          // Handle notification message
          if (message.id && message.title && message.message) {
            const notification: NotificationMessage = {
              id: message.id,
              type: message.type,
              priority: message.priority,
              title: message.title,
              message: message.message,
              timestamp: new Date(message.timestamp),
              data: message.data,
              department: message.department,
              actionRequired: message.actionRequired,
              soundEnabled: message.soundEnabled
            };

            setNotifications(prev => [notification, ...prev]);
            
            // Play sound for high priority notifications
            if (message.priority === 'high' || message.priority === 'urgent') {
              playNotificationSound();
            }

            // Show browser notification if permission granted
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(message.title, {
                body: message.message,
                icon: '/favicon.ico',
                tag: message.id
              });
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }

        // Attempt to reconnect if not a manual close
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setConnectionStatus('error');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setConnectionStatus('error');
    }
  }, [userId, role, reconnectInterval, maxReconnectAttempts, playNotificationSound]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  // Send message through WebSocket
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  }, []);

  // Dismiss notification
  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== notificationId)
    );
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  return {
    notifications,
    isConnected,
    connectionStatus,
    sendMessage,
    clearNotifications,
    markAsRead,
    dismissNotification
  };
}






