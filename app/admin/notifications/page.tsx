"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/Card";
import { Button } from "@/components/admin/Button";
import { Badge } from "@/components/admin/Badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/Select";
import { AlertTriangle, Package, CheckCircle, X, Bell } from "lucide-react";

interface Notification {
  _id: string;
  type: 'low_stock' | 'out_of_stock' | 'expiry_warning' | 'order_alert' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'inventory' | 'order' | 'system' | 'maintenance';
  isRead: boolean;
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
  metadata?: {
    materialId?: string;
    materialName?: string;
    currentQuantity?: number;
    alertLimit?: number;
    orderId?: string;
    orderNumber?: string;
    department?: string;
  };
}

export default function NotificationsDashboard() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [placeName, setPlaceName] = useState<string>('مركش');
  const [placeTagline, setPlaceTagline] = useState<string>('نظام إدارة المطاعم');

  useEffect(() => {
    fetchNotifications();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load and persist place settings to localStorage
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('admin_place_name');
      const savedTag = localStorage.getItem('admin_place_tagline');
      if (savedName) setPlaceName(savedName);
      if (savedTag) setPlaceTagline(savedTag);
    } catch {}
  }, []);

  const savePlaceSettings = () => {
    try {
      localStorage.setItem('admin_place_name', placeName || '');
      localStorage.setItem('admin_place_tagline', placeTagline || '');
      // Fire storage event for other tabs/components
      window.dispatchEvent(new StorageEvent('storage', { key: 'admin_place_name', newValue: placeName } as any));
      window.dispatchEvent(new StorageEvent('storage', { key: 'admin_place_tagline', newValue: placeTagline } as any));
    } catch {}
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}&action=read`, {
        method: 'PUT',
      });

      if (response.ok) {
        setNotifications(notifications.map(n => 
          n._id === notificationId ? { ...n, isRead: true } : n
        ));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAsResolved = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}&action=resolve`, {
        method: 'PUT',
      });

      if (response.ok) {
        setNotifications(notifications.map(n => 
          n._id === notificationId ? { ...n, isResolved: true, resolvedAt: new Date().toISOString() } : n
        ));
      }
    } catch (error) {
      console.error('Error marking notification as resolved:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications(notifications.filter(n => n._id !== notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge>Urgent</Badge>;
      case 'high':
        return <Badge>High</Badge>;
      case 'medium':
        return <Badge>Medium</Badge>;
      case 'low':
        return <Badge>Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
      case 'out_of_stock':
        return <Package className="w-5 h-5 text-orange-500" />;
      case 'expiry_warning':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'order_alert':
        return <Bell className="w-5 h-5 text-blue-500" />;
      case 'system':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'unread' && !notification.isRead) ||
      (filterStatus === 'read' && notification.isRead) ||
      (filterStatus === 'resolved' && notification.isResolved);
    
    return matchesType && matchesPriority && matchesStatus;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.isResolved).length;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="h-24 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Place Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">إعدادات الإشعار - اسم المكان والشعار</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm mb-2">اسم المكان</label>
              <input
                type="text"
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                className="admin-input w-full"
                placeholder="مثال: مركش"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">سطر الوصف</label>
              <input
                type="text"
                value={placeTagline}
                onChange={(e) => setPlaceTagline(e.target.value)}
                className="admin-input w-full"
                placeholder="مثال: نظام إدارة المطاعم"
              />
            </div>
            <div className="flex md:justify-end">
              <Button onClick={savePlaceSettings} className="w-full md:w-auto">حفظ</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bell className="w-8 h-8" />
          Notifications Dashboard
        </h1>
        <div className="text-sm">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <AlertTriangle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <AlertTriangle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{urgentCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            <SelectItem value="expiry_warning">Expiry Warning</SelectItem>
            <SelectItem value="order_alert">Order Alert</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notifications */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <Card key={notification._id} className={`${!notification.isRead ? 'border-orange-200 bg-orange-50' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  {getTypeIcon(notification.type)}
                  <div>
                    <CardTitle className="text-lg">{notification.title}</CardTitle>
                    <div className="text-sm mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                      {notification.resolvedAt && (
                        <span> | Resolved: {new Date(notification.resolvedAt).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {getPriorityBadge(notification.priority)}
                  {notification.isResolved && (
                    <Badge>Resolved</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{notification.message}</p>
              
              {/* Metadata */}
              {notification.metadata && (
                <div className="admin-card p-3 rounded-lg mb-4">
                  <h4 className="font-medium mb-2">Details:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {notification.metadata.materialName && (
                      <div>Material: {notification.metadata.materialName}</div>
                    )}
                    {notification.metadata.currentQuantity !== undefined && (
                      <div>Current Quantity: {notification.metadata.currentQuantity}</div>
                    )}
                    {notification.metadata.alertLimit !== undefined && (
                      <div>Alert Limit: {notification.metadata.alertLimit}</div>
                    )}
                    {notification.metadata.orderNumber && (
                      <div>Order: {notification.metadata.orderNumber}</div>
                    )}
                    {notification.metadata.department && (
                      <div>Department: {notification.metadata.department}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {!notification.isRead && (
                  <Button
                    size="sm"
                    onClick={() => markAsRead(notification._id)}
                  >
                    Mark as Read
                  </Button>
                )}
                {!notification.isResolved && (
                  <Button
                    size="sm"
                    onClick={() => markAsResolved(notification._id)}
                  >
                    Mark as Resolved
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => deleteNotification(notification._id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Bell className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No notifications found</h3>
            <p>Notifications will appear here when alerts are triggered</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

