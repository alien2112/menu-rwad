'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertTriangle, Info, Zap, Clock } from 'lucide-react';
import { useSSENotifications } from '@/hooks/useSSENotifications';

interface NotificationCenterProps {
  userId?: string;
  role?: string;
  className?: string;
  maxNotifications?: number;
}

export default function SSENotificationCenter({ 
  userId, 
  role, 
  className = '',
  maxNotifications = 10
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const {
    notifications,
    isConnected,
    connectionStatus,
    markAsRead,
    dismissNotification,
    clearNotifications
  } = useSSENotifications(userId, role, {
    autoConnect: true,
    enableSound: true
  });

  // Update unread count
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Get priority icon and color
  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { icon: Zap, color: 'text-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
      case 'high':
        return { icon: AlertTriangle, color: 'text-orange-500', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
      case 'medium':
        return { icon: Info, color: 'text-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
      case 'low':
        return { icon: Clock, color: 'text-gray-500', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' };
      default:
        return { icon: Info, color: 'text-gray-500', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' };
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `${minutes} دقيقة`;
    if (hours < 24) return `${hours} ساعة`;
    return `${days} يوم`;
  };

  const displayedNotifications = notifications.slice(0, maxNotifications);

  return (
    <div className={`relative z-[9998] ${className}`}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="الإشعارات"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        
        {/* Connection Status Indicator */}
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${
          connectionStatus === 'connected' ? 'bg-green-500' :
          connectionStatus === 'connecting' ? 'bg-yellow-500' :
          connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
        }`} />
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-[9999]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">الإشعارات</h3>
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
                connectionStatus === 'connecting' ? 'bg-yellow-100 text-yellow-800' :
                connectionStatus === 'error' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {connectionStatus === 'connected' ? 'متصل' :
                 connectionStatus === 'connecting' ? 'جاري الاتصال' :
                 connectionStatus === 'error' ? 'خطأ' : 'غير متصل'}
              </span>
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  مسح الكل
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {displayedNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>لا توجد إشعارات</p>
              </div>
            ) : (
              displayedNotifications.map((notification) => {
                const priorityInfo = getPriorityInfo(notification.priority);
                const Icon = priorityInfo.icon;
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      notification.actionRequired ? priorityInfo.bgColor : ''
                    } ${priorityInfo.borderColor}`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className={`h-5 w-5 mt-0.5 ${priorityInfo.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        {notification.department && (
                          <span className="inline-block mt-2 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            {notification.department}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col space-y-1">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-gray-400 hover:text-green-600"
                            title="تعيين كمقروء"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => dismissNotification(notification.id)}
                          className="text-gray-400 hover:text-red-600"
                          title="إزالة"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > maxNotifications && (
            <div className="p-3 border-t border-gray-200 text-center">
              <span className="text-xs text-gray-500">
                عرض {maxNotifications} من {notifications.length} إشعار
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

