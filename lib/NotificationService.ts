import { WebSocketServer } from 'ws';
import { Server } from 'http';
import dbConnect from './mongodb';
import Notification from './models/Notification';

interface WebSocketClient {
  ws: any;
  userId?: string;
  role?: string;
  isAlive: boolean;
}

class NotificationService {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocketClient> = new Map();
  private heartbeatInterval: NodeJS.Timeout;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws/notifications'
    });

    this.setupWebSocketServer();
    this.startHeartbeat();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws, req) => {
      console.log('New WebSocket connection');
      
      const clientId = this.generateClientId();
      const client: WebSocketClient = {
        ws,
        isAlive: true
      };
      
      this.clients.set(clientId, client);

      // Handle incoming messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(clientId, message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      // Handle connection close
      ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.clients.delete(clientId);
      });

      // Handle pong responses
      ws.on('pong', () => {
        const client = this.clients.get(clientId);
        if (client) {
          client.isAlive = true;
        }
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to notification service',
        clientId
      }));
    });
  }

  private handleMessage(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'auth':
        client.userId = message.userId;
        client.role = message.role;
        break;
      
      case 'subscribe':
        // Handle subscription to specific notification types
        break;
      
      case 'ping':
        client.ws.send(JSON.stringify({ type: 'pong' }));
        break;
      
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client, clientId) => {
        if (!client.isAlive) {
          client.ws.terminate();
          this.clients.delete(clientId);
          return;
        }

        client.isAlive = false;
        client.ws.ping();
      });
    }, 30000); // 30 seconds
  }

  private generateClientId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Public methods for sending notifications
  public async sendNotification(notification: {
    type: 'order' | 'system' | 'staff' | 'inventory' | 'alert';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    title: string;
    message: string;
    data?: any;
    department?: 'kitchen' | 'barista' | 'shisha' | 'admin';
    actionRequired?: boolean;
    targetRoles?: string[];
    targetUsers?: string[];
  }) {
    try {
      await dbConnect();
      
      // Save notification to database
      const savedNotification = new Notification({
        ...notification,
        timestamp: new Date(),
        read: false,
        dismissed: false
      });
      
      await savedNotification.save();

      // Send to connected clients
      const message = {
        id: savedNotification._id.toString(),
        type: notification.type,
        priority: notification.priority,
        title: notification.title,
        message: notification.message,
        timestamp: savedNotification.timestamp,
        data: notification.data,
        department: notification.department,
        actionRequired: notification.actionRequired,
        soundEnabled: true
      };

      this.clients.forEach((client, clientId) => {
        if (client.ws.readyState === 1) { // WebSocket.OPEN
          // Check if client should receive this notification
          if (this.shouldReceiveNotification(client, notification)) {
            client.ws.send(JSON.stringify(message));
          }
        }
      });

      return savedNotification;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  private shouldReceiveNotification(client: WebSocketClient, notification: any): boolean {
    // If no target specified, send to all
    if (!notification.targetRoles && !notification.targetUsers) {
      return true;
    }

    // Check role-based targeting
    if (notification.targetRoles && client.role) {
      return notification.targetRoles.includes(client.role);
    }

    // Check user-specific targeting
    if (notification.targetUsers && client.userId) {
      return notification.targetUsers.includes(client.userId);
    }

    return false;
  }

  public async sendOrderNotification(orderData: any) {
    const notification = {
      type: 'order' as const,
      priority: 'high' as const,
      title: 'طلب جديد',
      message: `طلب جديد رقم ${orderData.orderNumber} بقيمة ${orderData.totalAmount} ر.س`,
      data: orderData,
      department: this.getOrderDepartment(orderData),
      actionRequired: true,
      targetRoles: this.getTargetRolesForOrder(orderData)
    };

    return this.sendNotification(notification);
  }

  public async sendSystemNotification(message: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium') {
    const notification = {
      type: 'system' as const,
      priority,
      title: 'إشعار النظام',
      message,
      actionRequired: false,
      targetRoles: ['admin']
    };

    return this.sendNotification(notification);
  }

  public async sendStaffNotification(staffId: string, message: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium') {
    const notification = {
      type: 'staff' as const,
      priority,
      title: 'إشعار الموظفين',
      message,
      actionRequired: false,
      targetUsers: [staffId]
    };

    return this.sendNotification(notification);
  }

  public async sendInventoryNotification(message: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium') {
    const notification = {
      type: 'inventory' as const,
      priority,
      title: 'إشعار المخزون',
      message,
      actionRequired: true,
      targetRoles: ['admin', 'kitchen']
    };

    return this.sendNotification(notification);
  }

  private getOrderDepartment(orderData: any): 'kitchen' | 'barista' | 'shisha' | 'admin' {
    // Determine department based on order items
    const hasKitchenItems = orderData.items?.some((item: any) => item.department === 'kitchen');
    const hasBaristaItems = orderData.items?.some((item: any) => item.department === 'barista');
    const hasShishaItems = orderData.items?.some((item: any) => item.department === 'shisha');

    if (hasKitchenItems) return 'kitchen';
    if (hasBaristaItems) return 'barista';
    if (hasShishaItems) return 'shisha';
    return 'admin';
  }

  private getTargetRolesForOrder(orderData: any): string[] {
    const roles = ['admin'];
    
    if (orderData.items?.some((item: any) => item.department === 'kitchen')) {
      roles.push('kitchen');
    }
    if (orderData.items?.some((item: any) => item.department === 'barista')) {
      roles.push('barista');
    }
    if (orderData.items?.some((item: any) => item.department === 'shisha')) {
      roles.push('shisha');
    }
    
    return roles;
  }

  public getConnectedClientsCount(): number {
    return this.clients.size;
  }

  public getConnectedClients(): Array<{ clientId: string; userId?: string; role?: string }> {
    return Array.from(this.clients.entries()).map(([clientId, client]) => ({
      clientId,
      userId: client.userId,
      role: client.role
    }));
  }

  public cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.clients.forEach((client) => {
      client.ws.close();
    });
    
    this.clients.clear();
  }
}

export default NotificationService;






