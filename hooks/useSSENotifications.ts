'use client';

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

interface SSENotificationHook {
  notifications: NotificationMessage[];
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  clearNotifications: () => void;
  markAsRead: (notificationId: string) => void;
  dismissNotification: (notificationId: string) => void;
}

/**
 * Custom hook for Server-Sent Events (SSE) notifications
 * Compatible with Vercel deployment
 */
export function useSSENotifications(
  userId?: string,
  role?: string,
  options: {
    autoConnect?: boolean;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    enableSound?: boolean;
  } = {}
): SSENotificationHook {
  const {
    autoConnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
    enableSound = true
  } = options;

  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Connect to SSE
  const connect = useCallback(() => {
    if (eventSourceRef.current?.readyState === EventSource.OPEN) {
      return;
    }

    setConnectionStatus('connecting');
    
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (role) params.append('role', role);
      
      const url = `/api/sse?${params.toString()}`;
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('✅ SSE connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'connection') {
            console.log('SSE connection established:', message.message);
            return;
          }

          // Handle notification message
          if (message.title && message.message) {
            const notification: NotificationMessage = {
              id: message.id || Date.now().toString(),
              type: message.type || 'system',
              priority: message.priority || 'medium',
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
                tag: notification.id
              });
            }
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        setIsConnected(false);
        setConnectionStatus('error');
        
        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`Attempting to reconnect SSE (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else {
          setConnectionStatus('error');
        }
      };

    } catch (error) {
      console.error('Error creating SSE connection:', error);
      setConnectionStatus('error');
    }
  }, [userId, role, reconnectInterval, maxReconnectAttempts, playNotificationSound]);

  // Disconnect from SSE
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
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
    clearNotifications,
    markAsRead,
    dismissNotification
  };
}





