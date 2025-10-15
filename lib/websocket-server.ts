import { Server } from 'http';
import NotificationService from './NotificationService';

let notificationService: NotificationService | null = null;

export function initializeWebSocketServer(server: Server) {
  if (!notificationService) {
    notificationService = new NotificationService(server);
    console.log('WebSocket server initialized');
  }
  return notificationService;
}

export function getNotificationService(): NotificationService | null {
  return notificationService;
}

export function cleanupWebSocketServer() {
  if (notificationService) {
    notificationService.cleanup();
    notificationService = null;
    console.log('WebSocket server cleaned up');
  }
}

// Export for use in API routes
export { NotificationService };






