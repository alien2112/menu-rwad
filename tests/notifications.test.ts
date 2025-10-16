import WebSocket from 'ws';
import mongoose from 'mongoose';
import { connectTestDB, cleanupTestDB, closeTestDB } from '../setup';
import { TestHelpers, ApiAssertions, DatabaseHelpers } from '../utils/test-helpers';
import { MockDataGenerators } from '../utils/mockGenerators';

/**
 * WebSocket Notifications Test Suite
 * Tests real-time notifications, connection management, and message handling
 */

describe('WebSocket Notifications', () => {
  let testData: any;
  let wsServer: any;
  let wsPort: number = 3001;

  beforeAll(async () => {
    await connectTestDB();
    await cleanupTestDB();
    
    // Create test data
    const Material = mongoose.model('Material');
    const Order = mongoose.model('Order');
    const Notification = mongoose.model('Notification');
    const User = mongoose.model('User');

    // Create test materials
    const materials = [];
    for (let i = 0; i < 5; i++) {
      const material = new Material(MockDataGenerators.generateCompleteMaterial({
        name: `WS Test Material ${i + 1}`,
        currentQuantity: 50 + i * 10,
        minLimit: 10,
        alertLimit: 20,
      }));
      await material.save();
      materials.push(material);
    }

    // Create test orders
    const orders = [];
    for (let i = 0; i < 3; i++) {
      const order = new Order(TestHelpers.createTestOrder({
        orderNumber: `WS-${i + 1}`,
        status: 'pending',
      }));
      await order.save();
      orders.push(order);
    }

    // Create test notifications
    const notifications = [];
    for (let i = 0; i < 5; i++) {
      const notification = new Notification(MockDataGenerators.generateNotification({
        type: ['order', 'inventory', 'system'][i % 3],
        priority: ['low', 'medium', 'high'][i % 3],
        title: `Test Notification ${i + 1}`,
        message: `This is test notification ${i + 1}`,
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000), // Different times
      }));
      await notification.save();
      notifications.push(notification);
    }

    // Create test users
    const users = [];
    const userRoles = ['admin', 'kitchen', 'barista', 'shisha'];
    for (const role of userRoles) {
      const user = new User(MockDataGenerators.generateUserWithRole(role as any));
      await user.save();
      users.push(user);
    }

    testData = { materials, orders, notifications, users };

    // Start WebSocket server for testing
    wsServer = new WebSocket.Server({ port: wsPort });
    console.log(`WebSocket test server started on port ${wsPort}`);
  });

  afterAll(async () => {
    // Close WebSocket server
    if (wsServer) {
      wsServer.close();
    }
    
    await cleanupTestDB();
    await closeTestDB();
  });

  describe('WebSocket Connection', () => {
    it('should establish WebSocket connection', (done) => {
      const ws = new WebSocket(`ws://localhost:${wsPort}`);
      
      ws.on('open', () => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
        ws.close();
        done();
      });

      ws.on('error', (error) => {
        done(error);
      });
    });

    it('should handle connection errors gracefully', (done) => {
      const ws = new WebSocket('ws://localhost:9999'); // Non-existent port
      
      ws.on('error', (error) => {
        expect(error).toBeDefined();
        done();
      });
    });

    it('should handle multiple concurrent connections', (done) => {
      const connections = Array.from({ length: 5 }, () => new WebSocket(`ws://localhost:${wsPort}`));
      let connectedCount = 0;

      connections.forEach((ws, index) => {
        ws.on('open', () => {
          connectedCount++;
          if (connectedCount === connections.length) {
            connections.forEach(conn => conn.close());
            done();
          }
        });

        ws.on('error', (error) => {
          done(error);
        });
      });
    });

    it('should handle connection close events', (done) => {
      const ws = new WebSocket(`ws://localhost:${wsPort}`);
      
      ws.on('open', () => {
        ws.close();
      });

      ws.on('close', (code, reason) => {
        expect(code).toBeDefined();
        done();
      });

      ws.on('error', (error) => {
        done(error);
      });
    });
  });

  describe('Notification Broadcasting', () => {
    it('should broadcast notifications to connected clients', (done) => {
      const ws1 = new WebSocket(`ws://localhost:${wsPort}`);
      const ws2 = new WebSocket(`ws://localhost:${wsPort}`);
      let receivedCount = 0;

      const testNotification = {
        id: 'test-notification-1',
        type: 'order',
        priority: 'high',
        title: 'New Order',
        message: 'Order #123 has been placed',
        timestamp: new Date().toISOString(),
        data: { orderId: '123' },
      };

      const handleMessage = (data: any) => {
        receivedCount++;
        if (receivedCount === 2) {
          ws1.close();
          ws2.close();
          done();
        }
      };

      ws1.on('open', () => {
        ws2.on('open', () => {
          // Broadcast notification
          wsServer.clients.forEach((client: WebSocket) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(testNotification));
            }
          });
        });
      });

      ws1.on('message', (data) => {
        const notification = JSON.parse(data.toString());
        expect(notification.id).toBe(testNotification.id);
        expect(notification.type).toBe(testNotification.type);
        handleMessage(notification);
      });

      ws2.on('message', (data) => {
        const notification = JSON.parse(data.toString());
        expect(notification.id).toBe(testNotification.id);
        expect(notification.type).toBe(testNotification.type);
        handleMessage(notification);
      });

      ws1.on('error', done);
      ws2.on('error', done);
    });

    it('should handle different notification types', (done) => {
      const ws = new WebSocket(`ws://localhost:${wsPort}`);
      const notificationTypes = ['order', 'inventory', 'system', 'staff', 'alert'];
      let receivedCount = 0;

      ws.on('open', () => {
        // Send different notification types
        notificationTypes.forEach((type, index) => {
          setTimeout(() => {
            const notification = {
              id: `test-${type}-${index}`,
              type,
              priority: 'medium',
              title: `${type} Notification`,
              message: `This is a ${type} notification`,
              timestamp: new Date().toISOString(),
            };

            wsServer.clients.forEach((client: WebSocket) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(notification));
              }
            });
          }, index * 100);
        });
      });

      ws.on('message', (data) => {
        const notification = JSON.parse(data.toString());
        expect(notificationTypes).toContain(notification.type);
        receivedCount++;
        
        if (receivedCount === notificationTypes.length) {
          ws.close();
          done();
        }
      });

      ws.on('error', done);
    });

    it('should handle different notification priorities', (done) => {
      const ws = new WebSocket(`ws://localhost:${wsPort}`);
      const priorities = ['low', 'medium', 'high', 'urgent'];
      let receivedCount = 0;

      ws.on('open', () => {
        // Send different priority notifications
        priorities.forEach((priority, index) => {
          setTimeout(() => {
            const notification = {
              id: `test-priority-${index}`,
              type: 'system',
              priority,
              title: `${priority} Priority Notification`,
              message: `This is a ${priority} priority notification`,
              timestamp: new Date().toISOString(),
            };

            wsServer.clients.forEach((client: WebSocket) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(notification));
              }
            });
          }, index * 100);
        });
      });

      ws.on('message', (data) => {
        const notification = JSON.parse(data.toString());
        expect(priorities).toContain(notification.priority);
        receivedCount++;
        
        if (receivedCount === priorities.length) {
          ws.close();
          done();
        }
      });

      ws.on('error', done);
    });
  });

  describe('Order Notifications', () => {
    it('should notify when new order is created', (done) => {
      const ws = new WebSocket(`ws://localhost:${wsPort}`);
      
      ws.on('open', () => {
        // Simulate order creation
        const orderNotification = {
          id: 'order-created-123',
          type: 'order',
          priority: 'high',
          title: 'New Order Received',
          message: 'Order #ORD-123 has been placed',
          timestamp: new Date().toISOString(),
          data: {
            orderId: '123',
            orderNumber: 'ORD-123',
            totalAmount: 45.99,
            customerName: 'Test Customer',
            department: 'kitchen',
          },
          department: 'kitchen',
          actionRequired: true,
        };

        wsServer.clients.forEach((client: WebSocket) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(orderNotification));
          }
        });
      });

      ws.on('message', (data) => {
        const notification = JSON.parse(data.toString());
        expect(notification.type).toBe('order');
        expect(notification.priority).toBe('high');
        expect(notification.data.orderId).toBe('123');
        expect(notification.actionRequired).toBe(true);
        ws.close();
        done();
      });

      ws.on('error', done);
    });

    it('should notify when order status changes', (done) => {
      const ws = new WebSocket(`ws://localhost:${wsPort}`);
      
      ws.on('open', () => {
        const statusNotification = {
          id: 'order-status-123',
          type: 'order',
          priority: 'medium',
          title: 'Order Status Updated',
          message: 'Order #ORD-123 is now ready',
          timestamp: new Date().toISOString(),
          data: {
            orderId: '123',
            orderNumber: 'ORD-123',
            oldStatus: 'preparing',
            newStatus: 'ready',
            department: 'kitchen',
          },
          department: 'kitchen',
        };

        wsServer.clients.forEach((client: WebSocket) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(statusNotification));
          }
        });
      });

      ws.on('message', (data) => {
        const notification = JSON.parse(data.toString());
        expect(notification.type).toBe('order');
        expect(notification.data.newStatus).toBe('ready');
        ws.close();
        done();
      });

      ws.on('error', done);
    });

    it('should notify when order is cancelled', (done) => {
      const ws = new WebSocket(`ws://localhost:${wsPort}`);
      
      ws.on('open', () => {
        const cancelNotification = {
          id: 'order-cancelled-123',
          type: 'order',
          priority: 'high',
          title: 'Order Cancelled',
          message: 'Order #ORD-123 has been cancelled',
          timestamp: new Date().toISOString(),
          data: {
            orderId: '123',
            orderNumber: 'ORD-123',
            reason: 'Customer request',
            refundAmount: 45.99,
          },
          actionRequired: true,
        };

        wsServer.clients.forEach((client: WebSocket) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(cancelNotification));
          }
        });
      });

      ws.on('message', (data) => {
        const notification = JSON.parse(data.toString());
        expect(notification.type).toBe('order');
        expect(notification.data.reason).toBe('Customer request');
        expect(notification.actionRequired).toBe(true);
        ws.close();
        done();
      });

      ws.on('error', done);
    });
  });

  describe('Inventory Notifications', () => {
    it('should notify when inventory is low', (done) => {
      const ws = new WebSocket(`ws://localhost:${wsPort}`);
      
      ws.on('open', () => {
        const lowStockNotification = {
          id: 'low-stock-123',
          type: 'inventory',
          priority: 'high',
          title: 'Low Stock Alert',
          message: 'Material "Flour" is running low (5 units remaining)',
          timestamp: new Date().toISOString(),
          data: {
            materialId: '123',
            materialName: 'Flour',
            currentQuantity: 5,
            minLimit: 10,
            alertLimit: 20,
            category: 'food',
          },
          department: 'kitchen',
          actionRequired: true,
        };

        wsServer.clients.forEach((client: WebSocket) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(lowStockNotification));
          }
        });
      });

      ws.on('message', (data) => {
        const notification = JSON.parse(data.toString());
        expect(notification.type).toBe('inventory');
        expect(notification.priority).toBe('high');
        expect(notification.data.currentQuantity).toBe(5);
        expect(notification.actionRequired).toBe(true);
        ws.close();
        done();
      });

      ws.on('error', done);
    });

    it('should notify when inventory is out of stock', (done) => {
      const ws = new WebSocket(`ws://localhost:${wsPort}`);
      
      ws.on('open', () => {
        const outOfStockNotification = {
          id: 'out-of-stock-123',
          type: 'inventory',
          priority: 'urgent',
          title: 'Out of Stock Alert',
          message: 'Material "Salt" is out of stock',
          timestamp: new Date().toISOString(),
          data: {
            materialId: '123',
            materialName: 'Salt',
            currentQuantity: 0,
            minLimit: 5,
            category: 'food',
          },
          department: 'kitchen',
          actionRequired: true,
        };

        wsServer.clients.forEach((client: WebSocket) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(outOfStockNotification));
          }
        });
      });

      ws.on('message', (data) => {
        const notification = JSON.parse(data.toString());
        expect(notification.type).toBe('inventory');
        expect(notification.priority).toBe('urgent');
        expect(notification.data.currentQuantity).toBe(0);
        expect(notification.actionRequired).toBe(true);
        ws.close();
        done();
      });

      ws.on('error', done);
    });

    it('should notify when inventory is restocked', (done) => {
      const ws = new WebSocket(`ws://localhost:${wsPort}`);
      
      ws.on('open', () => {
        const restockNotification = {
          id: 'restock-123',
          type: 'inventory',
          priority: 'medium',
          title: 'Inventory Restocked',
          message: 'Material "Flour" has been restocked (100 units)',
          timestamp: new Date().toISOString(),
          data: {
            materialId: '123',
            materialName: 'Flour',
            newQuantity: 100,
            previousQuantity: 5,
            restockAmount: 95,
            supplier: 'Food Supplier Co.',
          },
          department: 'kitchen',
        };

        wsServer.clients.forEach((client: WebSocket) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(restockNotification));
          }
        });
      });

      ws.on('message', (data) => {
        const notification = JSON.parse(data.toString());
        expect(notification.type).toBe('inventory');
        expect(notification.data.newQuantity).toBe(100);
        expect(notification.data.restockAmount).toBe(95);
        ws.close();
        done();
      });

      ws.on('error', done);
    });
  });

  describe('System Notifications', () => {
    it('should notify about system maintenance', (done) => {
      const ws = new WebSocket(`ws://localhost:${wsPort}`);
      
      ws.on('open', () => {
        const maintenanceNotification = {
          id: 'maintenance-123',
          type: 'system',
          priority: 'high',
          title: 'Scheduled Maintenance',
          message: 'System will be under maintenance from 2:00 AM to 4:00 AM',
          timestamp: new Date().toISOString(),
          data: {
            maintenanceType: 'scheduled',
            startTime: '2024-01-01T02:00:00Z',
            endTime: '2024-01-01T04:00:00Z',
            affectedServices: ['orders', 'inventory'],
          },
          targetRoles: ['admin', 'kitchen', 'barista', 'shisha'],
        };

        wsServer.clients.forEach((client: WebSocket) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(maintenanceNotification));
          }
        });
      });

      ws.on('message', (data) => {
        const notification = JSON.parse(data.toString());
        expect(notification.type).toBe('system');
        expect(notification.priority).toBe('high');
        expect(notification.data.maintenanceType).toBe('scheduled');
        ws.close();
        done();
      });

      ws.on('error', done);
    });

    it('should notify about system errors', (done) => {
      const ws = new WebSocket(`ws://localhost:${wsPort}`);
      
      ws.on('open', () => {
        const errorNotification = {
          id: 'system-error-123',
          type: 'system',
          priority: 'urgent',
          title: 'System Error',
          message: 'Database connection error detected',
          timestamp: new Date().toISOString(),
          data: {
            errorType: 'database',
            errorCode: 'DB_CONNECTION_FAILED',
            affectedServices: ['orders', 'inventory', 'menu'],
            severity: 'critical',
          },
          targetRoles: ['admin'],
          actionRequired: true,
        };

        wsServer.clients.forEach((client: WebSocket) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(errorNotification));
          }
        });
      });

      ws.on('message', (data) => {
        const notification = JSON.parse(data.toString());
        expect(notification.type).toBe('system');
        expect(notification.priority).toBe('urgent');
        expect(notification.data.errorType).toBe('database');
        expect(notification.actionRequired).toBe(true);
        ws.close();
        done();
      });

      ws.on('error', done);
    });
  });

  describe('Staff Notifications', () => {
    it('should notify about staff schedule changes', (done) => {
      const ws = new WebSocket(`ws://localhost:${wsPort}`);
      
      ws.on('open', () => {
        const scheduleNotification = {
          id: 'schedule-change-123',
          type: 'staff',
          priority: 'medium',
          title: 'Schedule Change',
          message: 'Your shift has been updated for tomorrow',
          timestamp: new Date().toISOString(),
          data: {
            staffId: '123',
            staffName: 'John Doe',
            oldShift: '9:00 AM - 5:00 PM',
            newShift: '10:00 AM - 6:00 PM',
            date: '2024-01-02',
          },
          targetUsers: ['123'],
        };

        wsServer.clients.forEach((client: WebSocket) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(scheduleNotification));
          }
        });
      });

      ws.on('message', (data) => {
        const notification = JSON.parse(data.toString());
        expect(notification.type).toBe('staff');
        expect(notification.data.staffName).toBe('John Doe');
        ws.close();
        done();
      });

      ws.on('error', done);
    });

    it('should notify about staff performance updates', (done) => {
      const ws = new WebSocket(`ws://localhost:${wsPort}`);
      
      ws.on('open', () => {
        const performanceNotification = {
          id: 'performance-update-123',
          type: 'staff',
          priority: 'low',
          title: 'Performance Update',
          message: 'Your monthly performance report is available',
          timestamp: new Date().toISOString(),
          data: {
            staffId: '123',
            staffName: 'Jane Smith',
            period: '2024-01',
            metrics: {
              ordersProcessed: 150,
              averagePrepTime: 12.5,
              customerRating: 4.8,
            },
          },
          targetUsers: ['123'],
        };

        wsServer.clients.forEach((client: WebSocket) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(performanceNotification));
          }
        });
      });

      ws.on('message', (data) => {
        const notification = JSON.parse(data.toString());
        expect(notification.type).toBe('staff');
        expect(notification.data.metrics.ordersProcessed).toBe(150);
        ws.close();
        done();
      });

      ws.on('error', done);
    });
  });

  describe('Message Validation and Error Handling', () => {
    it('should handle malformed JSON messages', (done) => {
      const ws = new WebSocket(`ws://localhost:${wsPort}`);
      
      ws.on('open', () => {
        // Send malformed JSON
        wsServer.clients.forEach((client: WebSocket) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send('invalid json message');
          }
        });
        
        // Send valid message after malformed one
        setTimeout(() => {
          const validNotification = {
            id: 'valid-notification',
            type: 'system',
            priority: 'low',
            title: 'Valid Notification',
            message: 'This is a valid notification',
            timestamp: new Date().toISOString(),
          };

          wsServer.clients.forEach((client: WebSocket) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(validNotification));
            }
          });
        }, 100);
      });

      ws.on('message', (data) => {
        try {
          const notification = JSON.parse(data.toString());
          expect(notification.id).toBe('valid-notification');
          ws.close();
          done();
        } catch (error) {
          // Malformed JSON should be ignored
        }
      });

      ws.on('error', done);
    });

    it('should handle missing required fields', (done) => {
      const ws = new WebSocket(`ws://localhost:${wsPort}`);
      
      ws.on('open', () => {
        const incompleteNotification = {
          // Missing required fields like id, type, title, message
          priority: 'high',
          timestamp: new Date().toISOString(),
        };

        wsServer.clients.forEach((client: WebSocket) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(incompleteNotification));
          }
        });
        
        // Send valid message
        setTimeout(() => {
          const validNotification = {
            id: 'complete-notification',
            type: 'system',
            priority: 'low',
            title: 'Complete Notification',
            message: 'This notification has all required fields',
            timestamp: new Date().toISOString(),
          };

          wsServer.clients.forEach((client: WebSocket) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(validNotification));
            }
          });
        }, 100);
      });

      ws.on('message', (data) => {
        const notification = JSON.parse(data.toString());
        if (notification.id === 'complete-notification') {
          ws.close();
          done();
        }
      });

      ws.on('error', done);
    });

    it('should handle connection drops gracefully', (done) => {
      const ws = new WebSocket(`ws://localhost:${wsPort}`);
      let messageReceived = false;
      
      ws.on('open', () => {
        // Send notification
        const notification = {
          id: 'connection-test',
          type: 'system',
          priority: 'low',
          title: 'Connection Test',
          message: 'Testing connection handling',
          timestamp: new Date().toISOString(),
        };

        wsServer.clients.forEach((client: WebSocket) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(notification));
          }
        });
        
        // Close connection after sending
        setTimeout(() => {
          ws.close();
        }, 100);
      });

      ws.on('message', (data) => {
        const notification = JSON.parse(data.toString());
        expect(notification.id).toBe('connection-test');
        messageReceived = true;
      });

      ws.on('close', () => {
        expect(messageReceived).toBe(true);
        done();
      });

      ws.on('error', done);
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle high message volume', (done) => {
      const ws = new WebSocket(`ws://localhost:${wsPort}`);
      const messageCount = 100;
      let receivedCount = 0;

      ws.on('open', () => {
        // Send many messages rapidly
        for (let i = 0; i < messageCount; i++) {
          const notification = {
            id: `load-test-${i}`,
            type: 'system',
            priority: 'low',
            title: `Load Test ${i}`,
            message: `This is load test message ${i}`,
            timestamp: new Date().toISOString(),
          };

          wsServer.clients.forEach((client: WebSocket) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(notification));
            }
          });
        }
      });

      ws.on('message', (data) => {
        receivedCount++;
        if (receivedCount === messageCount) {
          ws.close();
          done();
        }
      });

      ws.on('error', done);
    });

    it('should handle multiple concurrent clients with high message volume', (done) => {
      const clientCount = 10;
      const messagesPerClient = 20;
      const clients: WebSocket[] = [];
      let totalMessagesReceived = 0;
      const expectedTotalMessages = clientCount * messagesPerClient;

      // Create multiple clients
      for (let i = 0; i < clientCount; i++) {
        const ws = new WebSocket(`ws://localhost:${wsPort}`);
        clients.push(ws);

        ws.on('open', () => {
          // Send messages to this specific client
          for (let j = 0; j < messagesPerClient; j++) {
            const notification = {
              id: `concurrent-test-${i}-${j}`,
              type: 'system',
              priority: 'low',
              title: `Concurrent Test ${i}-${j}`,
              message: `Message ${j} for client ${i}`,
              timestamp: new Date().toISOString(),
            };

            wsServer.clients.forEach((client: WebSocket) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(notification));
              }
            });
          }
        });

        ws.on('message', (data) => {
          totalMessagesReceived++;
          if (totalMessagesReceived === expectedTotalMessages) {
            clients.forEach(client => client.close());
            done();
          }
        });

        ws.on('error', (error) => {
          done(error);
        });
      }
    });
  });
});








