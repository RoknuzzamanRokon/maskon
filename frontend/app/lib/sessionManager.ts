/**
 * Session Management for Anonymous Chat Users
 * Handles session creation, persistence, and tracking across page reloads
 */

export interface ChatSessionData {
  sessionId: string;
  productId?: number;
  customerName?: string;
  customerEmail?: string;
  createdAt: string;
  lastActivity: string;
  messageCount: number;
  isActive: boolean;
}

export interface SessionStorage {
  globalSessionId: string;
  productSessions: Record<string, ChatSessionData>;
  userPreferences: {
    name?: string;
    email?: string;
    theme?: 'light' | 'dark';
  };
}

class SessionManager {
  private static instance: SessionManager;
  private readonly STORAGE_KEY = 'chat_session_data';
  private readonly GLOBAL_SESSION_KEY = 'global_chat_session';
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {}

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Generate a unique session ID
   */
  private generateUniqueId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    const browserFingerprint = this.getBrowserFingerprint();
    return `session_${timestamp}_${random}_${browserFingerprint}`;
  }

  /**
   * Create a simple browser fingerprint for session uniqueness
   */
  private getBrowserFingerprint(): string {
    if (typeof window === 'undefined') return 'server';
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('fingerprint', 10, 10);
    const canvasFingerprint = canvas.toDataURL().slice(-10);
    
    const fingerprint = [
      navigator.userAgent.slice(-10),
      screen.width,
      screen.height,
      new Date().getTimezoneOffset(),
      canvasFingerprint
    ].join('').replace(/[^a-zA-Z0-9]/g, '').slice(-8);
    
    return fingerprint;
  }

  /**
   * Get or create global session ID
   */
  public getGlobalSessionId(): string {
    if (typeof window === 'undefined') {
      return this.generateUniqueId();
    }

    let globalSessionId = localStorage.getItem(this.GLOBAL_SESSION_KEY);
    
    if (!globalSessionId) {
      globalSessionId = this.generateUniqueId();
      localStorage.setItem(this.GLOBAL_SESSION_KEY, globalSessionId);
    }

    return globalSessionId;
  }

  /**
   * Get session data from localStorage
   */
  private getSessionStorage(): SessionStorage {
    if (typeof window === 'undefined') {
      return {
        globalSessionId: this.generateUniqueId(),
        productSessions: {},
        userPreferences: {}
      };
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SessionStorage;
        // Clean up expired sessions
        this.cleanupExpiredSessions(parsed);
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to parse session storage:', error);
    }

    // Return default structure
    return {
      globalSessionId: this.getGlobalSessionId(),
      productSessions: {},
      userPreferences: {}
    };
  }

  /**
   * Save session data to localStorage
   */
  private saveSessionStorage(data: SessionStorage): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save session storage:', error);
    }
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(storage: SessionStorage): void {
    const now = Date.now();
    const productSessions = storage.productSessions;

    Object.keys(productSessions).forEach(key => {
      const session = productSessions[key];
      const lastActivity = new Date(session.lastActivity).getTime();
      
      if (now - lastActivity > this.SESSION_TIMEOUT) {
        delete productSessions[key];
      }
    });
  }

  /**
   * Get or create session for a specific product with enhanced persistence
   */
  public getProductSession(productId: number): ChatSessionData {
    const storage = this.getSessionStorage();
    const productKey = `product_${productId}`;
    
    let session = storage.productSessions[productKey];
    
    if (!session) {
      session = {
        sessionId: this.generateUniqueId(),
        productId,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        messageCount: 0,
        isActive: true
      };
      
      storage.productSessions[productKey] = session;
      this.saveSessionStorage(storage);
    } else {
      // Update last activity when accessing existing session
      session.lastActivity = new Date().toISOString();
      storage.productSessions[productKey] = session;
      this.saveSessionStorage(storage);
    }

    return session;
  }

  /**
   * Update session activity and data
   */
  public updateProductSession(productId: number, updates: Partial<ChatSessionData>): void {
    const storage = this.getSessionStorage();
    const productKey = `product_${productId}`;
    
    if (storage.productSessions[productKey]) {
      storage.productSessions[productKey] = {
        ...storage.productSessions[productKey],
        ...updates,
        lastActivity: new Date().toISOString()
      };
      
      this.saveSessionStorage(storage);
    }
  }

  /**
   * Increment message count for a session
   */
  public incrementMessageCount(productId: number): void {
    const storage = this.getSessionStorage();
    const productKey = `product_${productId}`;
    
    if (storage.productSessions[productKey]) {
      storage.productSessions[productKey].messageCount++;
      storage.productSessions[productKey].lastActivity = new Date().toISOString();
      this.saveSessionStorage(storage);
    }
  }

  /**
   * Get user preferences
   */
  public getUserPreferences(): SessionStorage['userPreferences'] {
    const storage = this.getSessionStorage();
    return storage.userPreferences;
  }

  /**
   * Update user preferences
   */
  public updateUserPreferences(preferences: Partial<SessionStorage['userPreferences']>): void {
    const storage = this.getSessionStorage();
    storage.userPreferences = {
      ...storage.userPreferences,
      ...preferences
    };
    this.saveSessionStorage(storage);
  }

  /**
   * Get all active product sessions
   */
  public getActiveProductSessions(): ChatSessionData[] {
    const storage = this.getSessionStorage();
    return Object.values(storage.productSessions).filter(session => session.isActive);
  }

  /**
   * Mark session as inactive
   */
  public deactivateProductSession(productId: number): void {
    this.updateProductSession(productId, { isActive: false });
  }

  /**
   * Clear all session data (for logout or reset)
   */
  public clearAllSessions(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.GLOBAL_SESSION_KEY);
    localStorage.removeItem('chat_session_id'); // Legacy cleanup
    localStorage.removeItem('chat_customer_name');
    localStorage.removeItem('chat_customer_email');
  }

  /**
   * Get session statistics
   */
  public getSessionStats(): {
    totalSessions: number;
    activeSessions: number;
    totalMessages: number;
    oldestSession?: string;
  } {
    const storage = this.getSessionStorage();
    const sessions = Object.values(storage.productSessions);
    
    const activeSessions = sessions.filter(s => s.isActive);
    const totalMessages = sessions.reduce((sum, s) => sum + s.messageCount, 0);
    const oldestSession = sessions.length > 0 
      ? sessions.reduce((oldest, current) => 
          new Date(current.createdAt) < new Date(oldest.createdAt) ? current : oldest
        ).createdAt
      : undefined;

    return {
      totalSessions: sessions.length,
      activeSessions: activeSessions.length,
      totalMessages,
      oldestSession
    };
  }

  /**
   * Export session data (for debugging or analytics)
   */
  public exportSessionData(): SessionStorage {
    return this.getSessionStorage();
  }

  /**
   * Check if session exists for product
   */
  public hasProductSession(productId: number): boolean {
    const storage = this.getSessionStorage();
    const productKey = `product_${productId}`;
    return !!storage.productSessions[productKey];
  }

  /**
   * Get session history metadata for better persistence tracking
   */
  public getSessionHistory(productId: number): {
    hasHistory: boolean;
    lastActivity: string;
    messageCount: number;
    sessionAge: number; // in milliseconds
  } {
    const session = this.getProductSession(productId);
    const sessionAge = Date.now() - new Date(session.createdAt).getTime();
    
    return {
      hasHistory: session.messageCount > 0,
      lastActivity: session.lastActivity,
      messageCount: session.messageCount,
      sessionAge
    };
  }

  /**
   * Mark session as having persistent history
   */
  public markSessionWithHistory(productId: number): void {
    this.updateProductSession(productId, {
      isActive: true,
      lastActivity: new Date().toISOString()
    });
  }

  /**
   * Migrate legacy session data
   */
  public migrateLegacyData(): void {
    if (typeof window === 'undefined') return;

    const legacySessionId = localStorage.getItem('chat_session_id');
    const legacyName = localStorage.getItem('chat_customer_name');
    const legacyEmail = localStorage.getItem('chat_customer_email');

    if (legacySessionId || legacyName || legacyEmail) {
      const storage = this.getSessionStorage();
      
      if (legacyName || legacyEmail) {
        storage.userPreferences = {
          ...storage.userPreferences,
          name: legacyName || undefined,
          email: legacyEmail || undefined
        };
      }

      this.saveSessionStorage(storage);

      // Clean up legacy data
      if (legacySessionId) localStorage.removeItem('chat_session_id');
      if (legacyName) localStorage.removeItem('chat_customer_name');
      if (legacyEmail) localStorage.removeItem('chat_customer_email');
    }
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();

// Convenience functions for backward compatibility
export function generateSessionId(): string {
  return sessionManager.getGlobalSessionId();
}

export function getProductSessionId(productId: number): string {
  return sessionManager.getProductSession(productId).sessionId;
}

export function updateSessionActivity(productId: number): void {
  sessionManager.updateProductSession(productId, {
    lastActivity: new Date().toISOString()
  });
}

// Initialize migration on module load
if (typeof window !== 'undefined') {
  sessionManager.migrateLegacyData();
}