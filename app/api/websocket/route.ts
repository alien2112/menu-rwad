import { NextRequest, NextResponse } from 'next/server';
import { getNotificationService } from '@/lib/websocket-server';

/**
 * WebSocket API endpoint for handling WebSocket connections
 * This endpoint initializes the WebSocket server if not already running
 */
export async function GET(request: NextRequest) {
  try {
    const notificationService = getNotificationService();
    
    if (!notificationService) {
      return NextResponse.json({
        success: false,
        error: 'WebSocket server not initialized'
      }, { status: 500 });
    }

    const connectedClients = notificationService.getConnectedClients();
    const clientCount = notificationService.getConnectedClientsCount();

    return NextResponse.json({
      success: true,
      data: {
        connectedClients: clientCount,
        clients: connectedClients,
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Error getting WebSocket status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get WebSocket status'
    }, { status: 500 });
  }
}

/**
 * POST endpoint to send test notifications
 * This is useful for testing the WebSocket functionality
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, message, priority = 'medium' } = body;

    const notificationService = getNotificationService();
    
    if (!notificationService) {
      return NextResponse.json({
        success: false,
        error: 'WebSocket server not initialized'
      }, { status: 500 });
    }

    // Send test notification
    await notificationService.sendNotification({
      type: type || 'system',
      priority,
      title: 'Test Notification',
      message: message || 'This is a test notification',
      actionRequired: false,
      targetRoles: ['admin']
    });

    return NextResponse.json({
      success: true,
      message: 'Test notification sent successfully'
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send test notification'
    }, { status: 500 });
  }
}






