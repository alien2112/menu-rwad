#!/usr/bin/env node

/**
 * Development WebSocket Server
 * 
 * This script sets up a WebSocket server for real-time notifications
 * during development. In production, this would be integrated with
 * your main server.
 */

const WebSocket = require('ws');
const http = require('http');
const { connectToDatabase } = require('./lib/mongodb');
const Notification = require('./lib/models/Notification');

class DevelopmentNotificationServer {
  constructor(port = 3001) {
    this.port = port;
    this.clients = new Map();
    this.server = http.createServer();
    this.wss = new WebSocket.Server({ 
      server: this.server,
      path: '/ws/notifications'
    });
    
    this.setupWebSocketServer();
    this.startHeartbeat();
  }

  setupWebSocketServer() {
    this.wss.on('connection', (ws, req) => {
      console.log('New WebSocket connection');
      
      const clientId = this.generateClientId();
      const client = {
        ws,
        isAlive: true,
        userId: null,
        role: null
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

  handleMessage(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'auth':
        client.userId = message.userId;
        client.role = message.role;
        console.log(`Client ${clientId} authenticated as ${message.role}`);
        break;
      
      case 'subscribe':
        console.log(`Client ${clientId} subscribed to ${message.channel}`);
        break;
      
      case 'ping':
        client.ws.send(JSON.stringify({ type: 'pong' }));
        break;
      
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  startHeartbeat() {
    setInterval(() => {
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

  generateClientId() {
    return Math.random().toString(36).substr(2, 9);
  }

  async sendNotification(notification) {
    try {
      await connectToDatabase();
      
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
          if (this.shouldReceiveNotification(client, notification)) {
            client.ws.send(JSON.stringify(message));
          }
        }
      });

      console.log(`Notification sent: ${notification.title}`);
      return savedNotification;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  shouldReceiveNotification(client, notification) {
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

  start() {
    this.server.listen(this.port, () => {
      console.log(`WebSocket server running on port ${this.port}`);
      console.log(`WebSocket endpoint: ws://localhost:${this.port}/ws/notifications`);
    });
  }

  stop() {
    this.server.close();
    this.clients.forEach((client) => {
      client.ws.close();
    });
    this.clients.clear();
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  const server = new DevelopmentNotificationServer();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down WebSocket server...');
    server.stop();
    process.exit(0);
  });

  server.start();

  // Send a test notification every 30 seconds (for development)
  setInterval(() => {
    server.sendNotification({
      type: 'system',
      priority: 'medium',
      title: 'Test Notification',
      message: 'This is a test notification from the development server',
      targetRoles: ['admin']
    }).catch(console.error);
  }, 30000);
}

module.exports = DevelopmentNotificationServer;






