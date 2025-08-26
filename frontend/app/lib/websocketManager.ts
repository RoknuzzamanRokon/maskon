"use client";

/**
 * WebSocket Manager for Real-time Chat
 * 
 * Handles WebSocket connections for real-time messaging in the product chat system.
 * Provides automatic reconnection, message queuing, and connection state management.
 */

export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface ChatMessage {
  type: 'chat_message';
  message_id?: number;
  session_id: string;
  product_id?: number;
  message: string;
  sender_type: 'customer' | 'admin';
  sender_name: string;
  timestamp: string;
}

export interface TypingIndicator {
  type: 'typing_indicator';
  session_id: string;
  user_name: string;
  user_type: 'customer' | 'admin';
  is_typing: boolean;
  timestamp: string;
}

export interface ConnectionStatus {
  type: 'connection_status';
  status: ConnectionState;
  connection_id?: string;
  timestamp: string;
}

export interface UserJoined {
  type: 'user_joined';
  session_id: string;
  user_name: string;
  user_type: 'customer' | 'admin';
  timestamp: string;
}

export interface UserLeft {
  type: 'user_left';
  session_id: string;
  user_name: string;
  user_type: 'customer' | 'admin';
  timestamp: string;
}

export interface MessageRead {
  type: 'message_read';
  session_id: string;
  message_ids: number[];
  read_by: string;
  read_by_type: 'customer' | 'admin';
  timestamp: string;
}

export type WebSocketEventType = 
  | ChatMessage 
  | TypingIndicator 
  | ConnectionStatus 
  | UserJoined 
  | UserLeft 
  | MessageRead;

export interface WebSocketManagerOptions {
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  messageQueueSize?: number;
}

export type WebSocketEventHandler = (event: WebSocketEventType) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string = '';
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private eventHandlers: Map<string, Set<WebSocketEventHandler>> = new Map();
  private messageQueue: WebSocketMessage[] = [];
  private reconnectAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private lastActivity: number = Date.now();

  // Configuration
  private readonly options: Required<WebSocketManagerOptions>;

  constructor(options: WebSocketManagerOptions = {}) {
    this.options = {
      reconnectInterval: options.reconnectInterval || 3000,
      maxReconnectAttempts: options.maxReconnectAttempts || 10,
      heartbeatInterval: options.heartbeatInterval || 30000,
      messageQueueSize: options.messageQueueSize || 100,
    };

    // Bind methods to preserve context
    this.handleOpen = this.handleOpen.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  /**
   * Connect to WebSocket server
   */
  connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connectionState === ConnectionState.CONNECTED) {
        resolve();
        return;
      }

      this.url = url;
      this.setConnectionState(ConnectionState.CONNECTING);

      try {
        this.ws = new WebSocket(url);
        this.ws.onopen = () => {
          this.handleOpen();
          resolve();
        };
        this.ws.onmessage = this.handleMessage;
        this.ws.onclose = this.handleClose;
        this.ws.onerror = (error) => {
          this.handleError(error);
          reject(error);
        };
      } catch (error) {
        this.handleError(error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.clearTimers();
    this.reconnectAttempts = 0;
    
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close(1000, 'Client disconnect');
      }
      this.ws = null;
    }
    
    this.setConnectionState(ConnectionState.DISCONNECTED);
  }

  /**
   * Send a message through WebSocket with enhanced error handling
   */
  send(message: WebSocketMessage): boolean {
    // Validate message
    if (!message || typeof message !== 'object') {
      console.error('Invalid message format:', message);
      return false;
    }

    if (this.connectionState === ConnectionState.CONNECTED && this.ws) {
      try {
        const messageString = JSON.stringify(message);
        
        // Check if WebSocket is still in OPEN state
        if (this.ws.readyState !== WebSocket.OPEN) {
          console.warn('WebSocket not in OPEN state, queueing message');
          this.queueMessage(message);
          return false;
        }
        
        this.ws.send(messageString);
        this.lastActivity = Date.now();
        return true;
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        
        // Handle specific send errors
        if (error instanceof Error) {
          if (error.name === 'InvalidStateError') {
            console.warn('WebSocket in invalid state, attempting reconnection');
            this.attemptReconnect();
          } else if (error.name === 'SyntaxError') {
            console.error('Message serialization failed:', message);
            return false; // Don't queue invalid messages
          }
        }
        
        this.queueMessage(message);
        return false;
      }
    } else {
      // Queue message if not connected
      if (this.connectionState === ConnectionState.DISCONNECTED) {
        // Attempt to reconnect if disconnected
        this.connect(this.url).catch(error => {
          console.error('Auto-reconnect failed:', error);
        });
      }
      
      this.queueMessage(message);
      return false;
    }
  }

  /**
   * Send a chat message
   */
  sendChatMessage(sessionId: string, message: string, senderName: string, senderType: 'customer' | 'admin' = 'customer'): boolean {
    return this.send({
      type: 'chat_message',
      session_id: sessionId,
      message,
      sender_name: senderName,
      sender_type: senderType,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(sessionId: string, isTyping: boolean, userName: string): boolean {
    return this.send({
      type: 'typing_indicator',
      session_id: sessionId,
      is_typing: isTyping,
      user_name: userName,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Mark messages as read
   */
  markMessagesAsRead(sessionId: string, messageIds: number[]): boolean {
    return this.send({
      type: 'message_read',
      session_id: sessionId,
      message_ids: messageIds,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Add event listener
   */
  addEventListener(eventType: string, handler: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler);
  }

  /**
   * Remove event listener
   */
  removeEventListener(eventType: string, handler: WebSocketEventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(eventType);
      }
    }
  }

  /**
   * Remove all event listeners
   */
  removeAllEventListeners(): void {
    this.eventHandlers.clear();
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connectionState === ConnectionState.CONNECTED;
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      connectionState: this.connectionState,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length,
      lastActivity: this.lastActivity,
      url: this.url,
      eventHandlers: Array.from(this.eventHandlers.keys())
    };
  }

  // Private methods

  private handleOpen(): void {
    console.log('WebSocket connected');
    this.setConnectionState(ConnectionState.CONNECTED);
    this.reconnectAttempts = 0;
    this.startHeartbeat();
    this.processMessageQueue();
  }

  private handleMessage(event: MessageEvent): void {
    this.lastActivity = Date.now();
    
    try {
      const message: WebSocketEventType = JSON.parse(event.data);
      this.emitEvent(message.type, message);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket disconnected:', event.code, event.reason);
    this.clearTimers();
    
    // Determine if reconnection should be attempted based on close code
    const shouldReconnect = this.shouldReconnectOnClose(event.code, event.reason);
    
    if (shouldReconnect && this.reconnectAttempts < this.options.maxReconnectAttempts) {
      this.attemptReconnect();
    } else {
      this.setConnectionState(ConnectionState.DISCONNECTED);
      
      // Emit close event with details
      this.emitEvent('close', {
        type: 'close',
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
        timestamp: new Date().toISOString(),
        willReconnect: shouldReconnect && this.reconnectAttempts < this.options.maxReconnectAttempts
      } as any);
    }
  }

  private shouldReconnectOnClose(code: number, reason: string): boolean {
    // Don't reconnect on normal closure
    if (code === 1000) return false;
    
    // Don't reconnect on client-initiated closure
    if (code === 1001) return false;
    
    // Don't reconnect on authentication/authorization failures
    if (code === 1008 || code === 3000) return false;
    
    // Don't reconnect on policy violations
    if (code === 1007 || code === 1003) return false;
    
    // Reconnect on all other codes (network issues, server errors, etc.)
    return true;
  }

  private handleError(error: any): void {
    console.error('WebSocket error:', error);
    
    // Determine if this is a recoverable error
    const isRecoverable = this.isRecoverableError(error);
    
    if (isRecoverable && this.reconnectAttempts < this.options.maxReconnectAttempts) {
      this.setConnectionState(ConnectionState.ERROR);
      // Attempt reconnection for recoverable errors
      setTimeout(() => {
        if (this.connectionState === ConnectionState.ERROR) {
          this.attemptReconnect();
        }
      }, 1000);
    } else {
      this.setConnectionState(ConnectionState.ERROR);
      // Emit error event for non-recoverable errors
      this.emitEvent('error', {
        type: 'error',
        error: error.message || 'WebSocket error occurred',
        timestamp: new Date().toISOString(),
        recoverable: isRecoverable
      } as any);
    }
  }

  private isRecoverableError(error: any): boolean {
    // Network errors are usually recoverable
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes('network') ||
        message.includes('connection') ||
        message.includes('timeout') ||
        message.includes('refused') ||
        message.includes('unreachable')
      );
    }
    
    // WebSocket close codes that indicate recoverable errors
    if (typeof error === 'object' && error.code) {
      const recoverableCodes = [1006, 1011, 1012, 1013, 1014];
      return recoverableCodes.includes(error.code);
    }
    
    return true; // Default to recoverable for unknown errors
  }

  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.emitEvent('connection_status', {
        type: 'connection_status',
        status: state,
        timestamp: new Date().toISOString()
      });
    }
  }

  private emitEvent(eventType: string, event: WebSocketEventType): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('Error in WebSocket event handler:', error);
        }
      });
    }

    // Also emit to 'all' handlers
    const allHandlers = this.eventHandlers.get('*');
    if (allHandlers) {
      allHandlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('Error in WebSocket event handler:', error);
        }
      });
    }
  }

  private queueMessage(message: WebSocketMessage): void {
    if (this.messageQueue.length >= this.options.messageQueueSize) {
      this.messageQueue.shift(); // Remove oldest message
    }
    this.messageQueue.push(message);
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const message = this.messageQueue.shift()!;
      if (!this.send(message)) {
        // If send fails, put message back at front of queue
        this.messageQueue.unshift(message);
        break;
      }
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.setConnectionState(ConnectionState.ERROR);
      
      // Emit final error event
      this.emitEvent('max_reconnect_attempts', {
        type: 'max_reconnect_attempts',
        attempts: this.reconnectAttempts,
        timestamp: new Date().toISOString()
      } as any);
      
      return;
    }

    this.setConnectionState(ConnectionState.RECONNECTING);
    this.reconnectAttempts++;

    // Exponential backoff with jitter
    const baseDelay = this.options.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    const jitter = Math.random() * 1000; // Add up to 1 second of jitter
    const delay = Math.min(baseDelay + jitter, 30000); // Max 30 seconds

    console.log(`Attempting to reconnect in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts}/${this.options.maxReconnectAttempts})`);

    // Emit reconnection attempt event
    this.emitEvent('reconnect_attempt', {
      type: 'reconnect_attempt',
      attempt: this.reconnectAttempts,
      maxAttempts: this.options.maxReconnectAttempts,
      delay: Math.round(delay),
      timestamp: new Date().toISOString()
    } as any);

    this.reconnectTimer = setTimeout(() => {
      this.connect(this.url).catch(error => {
        console.error(`Reconnection attempt ${this.reconnectAttempts} failed:`, error);
        
        // Emit reconnection failure event
        this.emitEvent('reconnect_failed', {
          type: 'reconnect_failed',
          attempt: this.reconnectAttempts,
          error: error.message || 'Unknown error',
          timestamp: new Date().toISOString()
        } as any);
        
        // Try again
        this.attemptReconnect();
      });
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send({
          type: 'ping',
          timestamp: new Date().toISOString()
        });
      }
    }, this.options.heartbeatInterval);
  }

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

// Export singleton instance
export const websocketManager = new WebSocketManager();
export default websocketManager;