"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Clock, 
  Users, 
  Package, 
  ChefHat, 
  Coffee, 
  Wind,
  Settings,
  Volume2,
  VolumeX,
  Filter,
  Search,
  RefreshCw,
  Download,
  Archive,
  Eye,
  EyeOff,
  Zap,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckSquare,
  Square
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'order' | 'system' | 'staff' | 'inventory' | 'alert';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  dismissed: boolean;
  data?: any;
  department?: 'kitchen' | 'barista' | 'shisha' | 'admin';
  actionRequired?: boolean;
  soundEnabled?: boolean;
}

interface NotificationCenterProps {
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onDismiss?: (notificationId: string) => void;
  onBulkAction?: (action: string, notificationIds: string[]) => void;
}

const notificationTypes = [
  { value: 'order', label: 'الطلبات', color: 'blue', icon: Package },
  { value: 'system', label: 'النظام', color: 'purple', icon: Settings },
  { value: 'staff', label: 'الموظفين', color: 'green', icon: Users },
  { value: 'inventory', label: 'المخزون', color: 'orange', icon: Package },
  { value: 'alert', label: 'التنبيهات', color: 'red', icon: AlertTriangle }
];

const priorityLevels = [
  { value: 'urgent', label: 'عاجل', color: 'red' },
  { value: 'high', label: 'عالي', color: 'orange' },
  { value: 'medium', label: 'متوسط', color: 'yellow' },
  { value: 'low', label: 'منخفض', color: 'green' }
];

export default function NotificationCenter({ 
  onNotificationClick, 
  onMarkAsRead, 
  onDismiss, 
  onBulkAction 
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filterType, setFilterType] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');
        
        ws.onopen = () => {
          setIsConnected(true);
          console.log('WebSocket connected');
        };
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          handleIncomingNotification(data);
        };
        
        ws.onclose = () => {
          setIsConnected(false);
          console.log('WebSocket disconnected');
          // Reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };
        
        wsRef.current = ws;
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setIsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Initialize audio for notifications
  useEffect(() => {
    audioRef.current = new Audio('/sounds/notification.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  // Handle incoming notifications
  const handleIncomingNotification = useCallback((data: any) => {
    const notification: Notification = {
      id: data.id || Date.now().toString(),
      type: data.type || 'system',
      priority: data.priority || 'medium',
      title: data.title || 'إشعار جديد',
      message: data.message || '',
      timestamp: new Date(data.timestamp || Date.now()),
      read: false,
      dismissed: false,
      data: data.data,
      department: data.department,
      actionRequired: data.actionRequired || false,
      soundEnabled: data.soundEnabled !== false
    };

    setNotifications(prev => [notification, ...prev]);
    
    // Play sound if enabled
    if (soundEnabled && notification.soundEnabled && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
    
    // Update unread count
    setUnreadCount(prev => prev + 1);
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  }, [soundEnabled]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesType = !filterType || notification.type === filterType;
    const matchesPriority = !filterPriority || notification.priority === filterPriority;
    const matchesSearch = !searchTerm || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesPriority && matchesSearch && !notification.dismissed;
  });

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      onMarkAsRead?.(notification.id);
    }
    onNotificationClick?.(notification);
  };

  // Handle dismiss notification
  const handleDismiss = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, dismissed: true } : n)
    );
    onDismiss?.(notificationId);
  };

  // Handle mark as read
  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    onMarkAsRead?.(notificationId);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  // Handle individual selection
  const handleNotificationSelect = (notificationId: string) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    const selectedIds = Array.from(selectedNotifications);
    
    switch (action) {
      case 'mark_read':
        setNotifications(prev => 
          prev.map(n => selectedIds.includes(n.id) ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - selectedIds.length));
        break;
      case 'dismiss':
        setNotifications(prev => 
          prev.map(n => selectedIds.includes(n.id) ? { ...n, dismissed: true } : n)
        );
        break;
      case 'delete':
        setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
        break;
    }
    
    setSelectedNotifications(new Set());
    onBulkAction?.(action, selectedIds);
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    const typeConfig = notificationTypes.find(t => t.value === type);
    return typeConfig?.icon || Bell;
  };

  // Get notification color
  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'urgent') return 'red';
    if (priority === 'high') return 'orange';
    if (priority === 'medium') return 'yellow';
    if (priority === 'low') return 'green';
    
    const typeConfig = notificationTypes.find(t => t.value === type);
    return typeConfig?.color || 'blue';
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    const priorityConfig = priorityLevels.find(p => p.value === priority);
    return priorityConfig?.color || 'gray';
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {!isConnected && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute top-12 right-0 w-96 max-h-[80vh] glass-effect rounded-2xl border border-white/10 shadow-2xl z-50">
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-white" />
                <h3 className="text-lg font-bold text-white">الإشعارات</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-1 rounded transition-colors ${
                    soundEnabled ? 'text-green-400' : 'text-gray-400'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-1 text-white/70 hover:text-white transition-colors"
                >
                  <Filter className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
              <span className="text-xs text-white/70">
                {isConnected ? 'متصل' : 'غير متصل'}
              </span>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="p-4 border-b border-white/10">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-white/70 mb-1">النوع</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">جميع الأنواع</option>
                    {notificationTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs text-white/70 mb-1">الأولوية</label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">جميع الأولويات</option>
                    {priorityLevels.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs text-white/70 mb-1">البحث</label>
                  <div className="relative">
                    <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white/50" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="البحث في الإشعارات..."
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1 pr-8 text-white text-sm placeholder-white/50 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedNotifications.size > 0 && (
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">
                  {selectedNotifications.size} إشعار محدد
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBulkAction('mark_read')}
                    className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-500/30 transition-colors"
                  >
                    تحديد كمقروء
                  </button>
                  <button
                    onClick={() => handleBulkAction('dismiss')}
                    className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded hover:bg-orange-500/30 transition-colors"
                  >
                    إخفاء
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded hover:bg-red-500/30 transition-colors"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-white/30 mx-auto mb-3" />
                <p className="text-white/70">لا توجد إشعارات</p>
              </div>
            ) : (
              <div className="space-y-1">
                {/* Select All */}
                <div className="p-3 border-b border-white/5">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {selectedNotifications.size === filteredNotifications.length ? 
                      <CheckSquare className="w-4 h-4" /> : 
                      <Square className="w-4 h-4" />
                    }
                    تحديد الكل
                  </button>
                </div>
                
                {filteredNotifications.map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type);
                  const color = getNotificationColor(notification.type, notification.priority);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-3 hover:bg-white/5 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-blue-500/10 border-r-4 border-blue-500' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationSelect(notification.id);
                          }}
                          className="mt-1 text-white/50 hover:text-white transition-colors"
                        >
                          {selectedNotifications.has(notification.id) ? 
                            <CheckSquare className="w-4 h-4" /> : 
                            <Square className="w-4 h-4" />
                          }
                        </button>
                        
                        <div className={`p-2 rounded-lg ${
                          color === 'red' ? 'bg-red-500/20' :
                          color === 'orange' ? 'bg-orange-500/20' :
                          color === 'yellow' ? 'bg-yellow-500/20' :
                          color === 'green' ? 'bg-green-500/20' :
                          'bg-blue-500/20'
                        }`}>
                          <IconComponent className={`w-4 h-4 ${
                            color === 'red' ? 'text-red-400' :
                            color === 'orange' ? 'text-orange-400' :
                            color === 'yellow' ? 'text-yellow-400' :
                            color === 'green' ? 'text-green-400' :
                            'text-blue-400'
                          }`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`text-sm font-bold ${
                              !notification.read ? 'text-white' : 'text-white/80'
                            }`}>
                              {notification.title}
                            </h4>
                            
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              getPriorityColor(notification.priority) === 'red' ? 'bg-red-500/20 text-red-400' :
                              getPriorityColor(notification.priority) === 'orange' ? 'bg-orange-500/20 text-orange-400' :
                              getPriorityColor(notification.priority) === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {priorityLevels.find(p => p.value === notification.priority)?.label}
                            </span>
                            
                            {notification.actionRequired && (
                              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                                يتطلب إجراء
                              </span>
                            )}
                          </div>
                          
                          <p className={`text-xs ${
                            !notification.read ? 'text-white/80' : 'text-white/60'
                          } mb-2`}>
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white/50">
                              {notification.timestamp.toLocaleTimeString('ar-SA')}
                            </span>
                            
                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notification.id);
                                  }}
                                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                  تحديد كمقروء
                                </button>
                              )}
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDismiss(notification.id);
                                }}
                                className="text-xs text-white/50 hover:text-white transition-colors"
                              >
                                إخفاء
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">
                {filteredNotifications.length} إشعار
              </span>
              
              <button
                onClick={() => {
                  setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  setUnreadCount(0);
                }}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                تحديد الكل كمقروء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}






