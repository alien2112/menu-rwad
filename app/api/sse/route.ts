import { NextRequest, NextResponse } from 'next/server';
import { sendNotification } from '@/lib/notificationUtils';

/**
 * Server-Sent Events (SSE) API for real-time notifications
 * Compatible with Vercel deployment
 */

// Store active connections
const connections = new Map<string, ReadableStreamDefaultController>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'anonymous';
  const role = searchParams.get('role') || 'user';

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // Store connection
      connections.set(userId, controller);
      
      // Send initial connection message
      const data = JSON.stringify({
        type: 'connection',
        message: 'Connected to notification service',
        userId,
        role,
        timestamp: new Date().toISOString()
      });
      
      controller.enqueue(`data: ${data}\n\n`);
      
      console.log(`✅ SSE connection established for user: ${userId}`);
    },
    
    cancel() {
      // Clean up connection
      connections.delete(userId);
      console.log(`❌ SSE connection closed for user: ${userId}`);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}

/**
 * Send notification to specific user via SSE
 */
export async function sendSSENotification(userId: string, notification: any) {
  const controller = connections.get(userId);
  
  if (controller) {
    try {
      const data = JSON.stringify({
        ...notification,
        timestamp: new Date().toISOString()
      });
      
      controller.enqueue(`data: ${data}\n\n`);
      console.log(`✅ SSE notification sent to user: ${userId}`);
    } catch (error) {
      console.error('Error sending SSE notification:', error);
      connections.delete(userId);
    }
  }
}

/**
 * Send notification to all connected users
 */
export async function broadcastSSENotification(notification: any) {
  const data = JSON.stringify({
    ...notification,
    timestamp: new Date().toISOString()
  });
  
  for (const [userId, controller] of connections) {
    try {
      controller.enqueue(`data: ${data}\n\n`);
    } catch (error) {
      console.error(`Error broadcasting to user ${userId}:`, error);
      connections.delete(userId);
    }
  }
  
  console.log(`✅ SSE notification broadcasted to ${connections.size} users`);
}

/**
 * Get connection status
 */
export async function getSSEStatus() {
  return {
    activeConnections: connections.size,
    connectedUsers: Array.from(connections.keys())
  };
}





