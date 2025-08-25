"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import websocketManager, { 
  WebSocketEventType, 
  WebSocketEventHandler, 
  ConnectionState,
  ChatMessage,
  TypingIndicator,
  UserJoined,
  UserLeft,
  MessageRead
} from '../lib/websocketManager';

export interface UseWebSocketOptions {
  sessionId?: string;
  productId?: number;
  userName?: string;
  userType?: 'customer' | 'admin';
  autoConnect?: boolean;
  onMessage?: (message: ChatMessage) => void;
  onTyping?: (typing: TypingIndicator) => void;
  onUserJoined?: (user: UserJoined) => void;
  onUserLeft?: (user: UserLeft) => void;
  onMessageRead?: (read: MessageRead) => void;
  onConnectionChange?: (state: ConnectionState) => void;
}

export interface UseWebSocketReturn {
  connectionState: ConnectionState;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendMessage: (message: string) => boolean;
  sendTyping: (isTyping: boolean) => boolean;
  markAsRead: (messageIds: number[]) => boolean;
  stats: any;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    sessionId,
    productId,
    userName = 'Anonymous',
    userType = 'customer',
    autoConnect = true,
    onMessage,
    onTyping,
    onUserJoined,
    onUserLeft,
    onMessageRead,
    onConnectionChange
  } = options;

  const [connectionState, setConnectionState] = useState<ConnectionState>(
    websocketManager.getConnectionState()
  );
  const [stats, setStats] = useState(websocketManager.getStats());

  // Refs to store current values for event handlers
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Event handlers
  const handleMessage = useCallback((event: WebSocketEventType) => {
    if (event.type === 'chat_message' && optionsRef.current.onMessage) {
      optionsRef.current.onMessage(event as ChatMessage);
    }
  }, []);

  const handleTyping = useCallback((event: WebSocketEventType) => {
    if (event.type === 'typing_indicator' && optionsRef.current.onTyping) {
      optionsRef.current.onTyping(event as TypingIndicator);
    }
  }, []);

  const handleUserJoined = useCallback((event: WebSocketEventType) => {
    if (event.type === 'user_joined' && optionsRef.current.onUserJoined) {
      optionsRef.current.onUserJoined(event as UserJoined);
    }
  }, []);

  const handleUserLeft = useCallback((event: WebSocketEventType) => {
    if (event.type === 'user_left' && optionsRef.current.onUserLeft) {
      optionsRef.current.onUserLeft(event as UserLeft);
    }
  }, []);

  const handleMessageRead = useCallback((event: WebSocketEventType) => {
    if (event.type === 'message_read' && optionsRef.current.onMessageRead) {
      optionsRef.current.onMessageRead(event as MessageRead);
    }
  }, []);

  const handleConnectionStatus = useCallback((event: WebSocketEventType) => {
    if (event.type === 'connection_status') {
      const newState = (event as any).status as ConnectionState;
      setConnectionState(newState);
      setStats(websocketManager.getStats());
      
      if (optionsRef.current.onConnectionChange) {
        optionsRef.current.onConnectionChange(newState);
      }
    }
  }, []);

  // Connect function
  const connect = useCallback(async (): Promise<void> => {
    if (!sessionId) {
      throw new Error('Session ID is required for WebSocket connection');
    }

    const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    let wsUrl: string;

    if (userType === 'admin') {
      wsUrl = `${baseUrl}/ws/chat/admin/${userName}`;
    } else {
      wsUrl = `${baseUrl}/ws/chat/customer/${productId}/${sessionId}?customer_name=${encodeURIComponent(userName)}`;
    }

    await websocketManager.connect(wsUrl);
  }, [sessionId, productId, userName, userType]);

  // Disconnect function
  const disconnect = useCallback(() => {
    websocketManager.disconnect();
  }, []);

  // Send message function
  const sendMessage = useCallback((message: string): boolean => {
    if (!sessionId) return false;
    return websocketManager.sendChatMessage(sessionId, message, userName, userType);
  }, [sessionId, userName, userType]);

  // Send typing indicator
  const sendTyping = useCallback((isTyping: boolean): boolean => {
    if (!sessionId) return false;
    return websocketManager.sendTypingIndicator(sessionId, isTyping, userName);
  }, [sessionId, userName]);

  // Mark messages as read
  const markAsRead = useCallback((messageIds: number[]): boolean => {
    if (!sessionId) return false;
    return websocketManager.markMessagesAsRead(sessionId, messageIds);
  }, [sessionId]);

  // Setup event listeners
  useEffect(() => {
    const handlers: Array<[string, WebSocketEventHandler]> = [
      ['chat_message', handleMessage],
      ['typing_indicator', handleTyping],
      ['user_joined', handleUserJoined],
      ['user_left', handleUserLeft],
      ['message_read', handleMessageRead],
      ['connection_status', handleConnectionStatus],
    ];

    // Add event listeners
    handlers.forEach(([event, handler]) => {
      websocketManager.addEventListener(event, handler);
    });

    // Cleanup function
    return () => {
      handlers.forEach(([event, handler]) => {
        websocketManager.removeEventListener(event, handler);
      });
    };
  }, [
    handleMessage,
    handleTyping,
    handleUserJoined,
    handleUserLeft,
    handleMessageRead,
    handleConnectionStatus
  ]);

  // Auto-connect effect
  useEffect(() => {
    if (autoConnect && sessionId && connectionState === ConnectionState.DISCONNECTED) {
      connect().catch(error => {
        console.error('Auto-connect failed:', error);
      });
    }

    // Cleanup on unmount
    return () => {
      if (autoConnect) {
        disconnect();
      }
    };
  }, [autoConnect, sessionId, connectionState, connect, disconnect]);

  // Update stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(websocketManager.getStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    connectionState,
    isConnected: connectionState === ConnectionState.CONNECTED,
    connect,
    disconnect,
    sendMessage,
    sendTyping,
    markAsRead,
    stats
  };
}

export default useWebSocket;