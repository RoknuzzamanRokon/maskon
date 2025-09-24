import {
  fetchWithErrorHandling,
  ChatError,
  ValidationError,
  NetworkError,
  withRetry,
  ErrorHandlerOptions
} from './errorHandler';

const API_BASE_URL = 'http://localhost:8000/api'

// Auth utilities
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token')
  }
  return null
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token)
  }
}

export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_info')
  }
}

export function getAuthHeaders() {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function getBlogPosts(limit?: number, category?: string) {
  try {
    let url = `${API_BASE_URL}/posts`
    const params = new URLSearchParams()

    if (limit) params.append('limit', limit.toString())
    if (category) params.append('category', category)

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) {
      throw new Error('Failed to fetch posts')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

export async function getBlogPost(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, { cache: 'no-store' })
    if (!response.ok) {
      throw new Error('Failed to fetch post')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

export async function getPortfolio() {
  try {
    const response = await fetch(`${API_BASE_URL}/portfolio`, { cache: 'no-store' })
    if (!response.ok) {
      throw new Error('Failed to fetch portfolio')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return []
  }
}

export async function createPortfolioItem(portfolioData: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/portfolio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(portfolioData),
    })

    if (!response.ok) {
      throw new Error('Failed to create portfolio item')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating portfolio item:', error)
    throw error
  }
}

export async function updatePortfolioItem(id: number, portfolioData: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/portfolio/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(portfolioData),
    })

    if (!response.ok) {
      throw new Error('Failed to update portfolio item')
    }

    return await response.json()
  } catch (error) {
    console.error('Error updating portfolio item:', error)
    throw error
  }
}

export async function deletePortfolioItem(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/portfolio/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to delete portfolio item')
    }

    return await response.json()
  } catch (error) {
    console.error('Error deleting portfolio item:', error)
    throw error
  }
}

// Authentication API functions
export async function login(username: string, password: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      throw new Error('Invalid username or password')
    }

    const data = await response.json()
    setAuthToken(data.access_token)
    localStorage.setItem('user_info', JSON.stringify({
      user_id: data.user_id,
      username: data.username,
      is_admin: data.is_admin
    }))

    return data
  } catch (error) {
    console.error('Error logging in:', error)
    throw error
  }
}

export async function register(username: string, email: string, password: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Registration failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Error registering:', error)
    throw error
  }
}

export async function getCurrentUser() {
  try {
    const response = await fetch(`${API_BASE_URL}/me`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to get user info')
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting current user:', error)
    throw error
  }
}

export function logout() {
  removeAuthToken()
}

export function getUserInfo() {
  if (typeof window !== 'undefined') {
    const userInfo = localStorage.getItem('user_info')
    return userInfo ? JSON.parse(userInfo) : null
  }
  return null
}

export function isAdmin(): boolean {
  const userInfo = getUserInfo()
  return userInfo?.is_admin || false
}

export function isLoggedIn(): boolean {
  return getAuthToken() !== null
}

export async function createPost(postData: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(postData),
    })

    if (!response.ok) {
      throw new Error('Failed to create post')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating post:', error)
    throw error
  }
}

export async function deletePost(postId: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to delete post')
    }

    return await response.json()
  } catch (error) {
    console.error('Error deleting post:', error)
    throw error
  }
}

export async function uploadImage(file: File) {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/upload-image`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to upload image')
    }

    return await response.json()
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

export async function uploadMultipleMedia(files: File[]) {
  try {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })

    const response = await fetch(`${API_BASE_URL}/upload-media`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to upload media files')
    }

    return await response.json()
  } catch (error) {
    console.error('Error uploading media files:', error)
    throw error
  }
}

// Anonymous post interactions (likes/dislikes) - no login required
export async function interactWithPost(postId: number, interactionType: 'like' | 'dislike') {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/interact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ post_id: postId, interaction_type: interactionType }),
    })

    if (!response.ok) {
      throw new Error('Failed to interact with post')
    }

    return await response.json()
  } catch (error) {
    console.error('Error interacting with post:', error)
    throw error
  }
}

// Anonymous comments - no login required
export async function addAnonymousComment(postId: number, content: string, username: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, username }),
    })

    if (!response.ok) {
      throw new Error('Failed to add comment')
    }

    return await response.json()
  } catch (error) {
    console.error('Error adding comment:', error)
    throw error
  }
}

export async function getComments(postId: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`)

    if (!response.ok) {
      throw new Error('Failed to fetch comments')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching comments:', error)
    return []
  }
}

export async function deleteComment(commentId: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to delete comment')
    }

    return await response.json()
  } catch (error) {
    console.error('Error deleting comment:', error)
    throw error
  }
}

// Product API functions
export async function getProducts(limit?: number, category?: string) {
  try {
    let url = `${API_BASE_URL}/products`
    const params = new URLSearchParams()

    if (limit) params.append('limit', limit.toString())
    if (category && category !== 'all') params.append('category', category)

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) {
      throw new Error('Failed to fetch products')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export async function getProduct(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, { cache: 'no-store' })
    if (!response.ok) {
      throw new Error('Failed to fetch product')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export async function createProduct(productData: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(productData),
    })

    if (!response.ok) {
      throw new Error('Failed to create product')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating product:', error)
    throw error
  }
}

export async function updateProduct(productId: number, productData: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(productData),
    })

    if (!response.ok) {
      throw new Error('Failed to update product')
    }

    return await response.json()
  } catch (error) {
    console.error('Error updating product:', error)
    throw error
  }
}

export async function deleteProduct(productId: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to delete product')
    }

    return await response.json()
  } catch (error) {
    console.error('Error deleting product:', error)
    throw error
  }
}

// Chat API functions
export interface ChatMessage {
  id: number
  session_id: number
  sender_type: 'customer' | 'admin' | 'system'
  sender_id?: number
  sender_name?: string
  message_text: string
  message_type: 'text' | 'system' | 'image' | 'file'
  is_read: boolean
  created_at: string
  updated_at: string
}

export interface ChatSession {
  id: number
  product_id: number
  session_id: string
  customer_email?: string
  customer_name?: string
  status: string
  priority: string
  created_at: string
  updated_at: string
  last_message_at: string
  assigned_admin_id?: number
}

// Re-export session management functions for backward compatibility
export { generateSessionId, getProductSessionId, sessionManager } from './sessionManager';

// Enhanced chat API with message persistence and history support
export interface ChatMessageResponse {
  messages: ChatMessage[]
  session_info?: {
    session_id: string
    customer_name?: string
    customer_email?: string
    status: string
    created_at: string
    last_message_at: string
  }
  pagination: {
    total_count: number
    limit: number
    offset: number
    has_more: boolean
    has_previous: boolean
    current_page: number
    total_pages: number
  }
  unread_count: number
}

export async function startChatSession(productId: number, sessionData: {
  session_id: string
  customer_email?: string
  customer_name?: string
  initial_message?: string
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/chat/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...sessionData,
        product_id: productId
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to start chat session')
    }

    return await response.json()
  } catch (error) {
    console.error('Error starting chat session:', error)
    throw error
  }
}

export async function getChatMessages(
  productId: number,
  sessionId: string,
  options: {
    limit?: number
    offset?: number
    order?: 'asc' | 'desc'
  } = {}
): Promise<ChatMessageResponse> {
  // Validate inputs
  if (!productId || productId <= 0) {
    throw new ValidationError('Invalid product ID');
  }

  if (!sessionId || !sessionId.trim()) {
    throw new ValidationError('Session ID is required');
  }

  const { limit = 50, offset = 0, order = 'asc' } = options;

  // Validate pagination parameters
  if (limit <= 0 || limit > 100) {
    throw new ValidationError('Limit must be between 1 and 100');
  }

  if (offset < 0) {
    throw new ValidationError('Offset must be non-negative');
  }

  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
    order
  });

  const retryOptions: ErrorHandlerOptions = {
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
    onRetry: (attempt, error) => {
      console.warn(`Retrying getChatMessages (attempt ${attempt}):`, error.message);
    }
  };

  try {
    const response = await fetchWithErrorHandling(
      `${API_BASE_URL}/products/${productId}/chat/sessions/${sessionId}/messages?${params}`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      },
      retryOptions
    );

    const data = await response.json();

    // Validate response structure
    if (!data || typeof data !== 'object') {
      throw new ChatError('Invalid response format from server');
    }

    return {
      messages: Array.isArray(data.messages) ? data.messages : [],
      pagination: data.pagination || {
        total_count: 0,
        limit,
        offset,
        has_more: false,
        has_previous: false,
        current_page: 1,
        total_pages: 0
      },
      unread_count: typeof data.unread_count === 'number' ? data.unread_count : 0,
      session_info: data.session_info
    };
  } catch (error) {
    if (error instanceof ChatError) {
      throw error;
    }

    console.error('Error fetching chat messages:', error);

    // Return empty response for non-critical errors to prevent UI breaks
    return {
      messages: [],
      pagination: {
        total_count: 0,
        limit,
        offset,
        has_more: false,
        has_previous: false,
        current_page: 1,
        total_pages: 0
      },
      unread_count: 0
    };
  }
}

export async function getChatHistory(
  productId: number,
  sessionId: string,
  page: number = 1,
  pageSize: number = 50
): Promise<ChatMessageResponse> {
  const offset = (page - 1) * pageSize
  return getChatMessages(productId, sessionId, {
    limit: pageSize,
    offset,
    order: 'asc'
  })
}

export async function loadMoreMessages(
  productId: number,
  sessionId: string,
  currentOffset: number,
  limit: number = 50
): Promise<ChatMessageResponse> {
  return getChatMessages(productId, sessionId, {
    limit,
    offset: currentOffset,
    order: 'asc'
  })
}

export async function sendChatMessage(productId: number, sessionId: string, messageData: {
  message_text: string
  sender_type?: 'customer' | 'admin' | 'system'
  sender_name?: string
  customer_email?: string
  message_type?: 'text' | 'system' | 'image' | 'file'
}) {
  // Validate inputs
  if (!productId || productId <= 0) {
    throw new ValidationError('Invalid product ID');
  }

  if (!sessionId || !sessionId.trim()) {
    throw new ValidationError('Session ID is required');
  }

  if (!messageData.message_text || !messageData.message_text.trim()) {
    throw new ValidationError('Message text is required');
  }

  if (messageData.message_text.length > 2000) {
    throw new ValidationError('Message text cannot exceed 2000 characters');
  }

  const retryOptions: ErrorHandlerOptions = {
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
    onRetry: (attempt, error) => {
      console.warn(`Retrying sendChatMessage (attempt ${attempt}):`, error.message);
    }
  };

  const response = await fetchWithErrorHandling(
    `${API_BASE_URL}/products/${productId}/chat/sessions/${sessionId}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({
        ...messageData,
        sender_type: messageData.sender_type || 'customer'
      }),
    },
    retryOptions
  );

  const data = await response.json();

  // Validate response
  if (!data || typeof data !== 'object') {
    throw new ChatError('Invalid response format from server');
  }

  return data;
}

export async function markMessagesAsRead(
  productId: number,
  sessionId: string,
  options: {
    messageIds?: number[]
    markAll?: boolean
  } = {}
) {
  try {
    const { messageIds, markAll = false } = options

    const response = await fetch(`${API_BASE_URL}/products/${productId}/chat/sessions/${sessionId}/messages/read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message_ids: messageIds,
        mark_all: markAll
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to mark messages as read')
    }

    return await response.json()
  } catch (error) {
    console.error('Error marking messages as read:', error)
    throw error
  }
}

// Dashboard API functions
export interface DashboardMetrics {
  totalPosts: number;
  totalPortfolioItems: number;
  totalProducts: number;
  totalUsers: number;
  recentActivity: ActivityItem[];
  systemHealth: SystemStatus;
}

export interface ActivityItem {
  id: string;
  type: "post" | "portfolio" | "product" | "user";
  action: "created" | "updated" | "deleted" | "viewed";
  title: string;
  description?: string;
  timestamp: string;
  user: {
    name: string;
    avatar?: string;
  };
  metadata?: {
    [key: string]: any;
  };
}

export interface SystemStatus {
  serverHealth: "healthy" | "warning" | "error";
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  memoryUsage: number;
  cpuUsage: number;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/metrics`, {
      headers: getAuthHeaders(),
      cache: 'no-store'
    });

    if (!response.ok) {
      console.warn('Dashboard metrics API returned error status, using mock data');
      return getMockDashboardMetrics();
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    // Return mock data for development - don't throw
    return getMockDashboardMetrics();
  }
}

export async function getRecentActivity(limit: number = 10): Promise<ActivityItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/activity?limit=${limit}`, {
      headers: getAuthHeaders(),
      cache: 'no-store'
    });

    if (!response.ok) {
      console.warn('Recent activity API returned error status, using mock data');
      return getMockRecentActivity();
    }

    const data = await response.json();
    return data.activities || [];
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    // Return mock data for development - don't throw
    return getMockRecentActivity();
  }
}

export async function getSystemMetrics(): Promise<SystemStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/system/metrics`, {
      headers: getAuthHeaders(),
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch system metrics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    // Return mock data for development - don't throw
    return getMockSystemMetrics();
  }
}

// Mock data functions for development
function getMockDashboardMetrics(): DashboardMetrics {
  return {
    totalPosts: 42,
    totalPortfolioItems: 18,
    totalProducts: 25,
    totalUsers: 156,
    recentActivity: getMockRecentActivity(),
    systemHealth: {
      serverHealth: "healthy",
      uptime: 99.8,
      responseTime: 245,
      errorRate: 0.2,
      activeUsers: 23,
      memoryUsage: 68.5,
      cpuUsage: 34.2
    }
  };
}

function getMockRecentActivity(): ActivityItem[] {
  const now = new Date();
  return [
    {
      id: "1",
      type: "post",
      action: "created",
      title: "New Blog Post: Getting Started with React",
      description: "A comprehensive guide for beginners",
      timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
      user: { name: "Admin User", avatar: undefined }
    },
    {
      id: "2",
      type: "portfolio",
      action: "updated",
      title: "Portfolio Project: E-commerce Platform",
      description: "Updated project description and images",
      timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      user: { name: "Admin User", avatar: undefined }
    }
  ];
}

function getMockSystemMetrics(): SystemStatus {
  return {
    serverHealth: "healthy",
    uptime: 99.8,
    responseTime: 245,
    errorRate: 0.02,
    activeUsers: 42,
    memoryUsage: 68.5,
    cpuUsage: 23.7
  };
}

// Notification API functions
export interface NotificationResponse {
  notifications: Array<{
    id: string;
    type: "info" | "warning" | "error" | "success";
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    actionUrl?: string;
    actionLabel?: string;
    category?: "system" | "user" | "content" | "security";
    priority?: "low" | "medium" | "high" | "critical";
    metadata?: { [key: string]: any };
  }>;
  unreadCount: number;
  totalCount: number;
}

export async function getNotifications(
  limit: number = 50,
  offset: number = 0,
  filters?: {
    type?: string;
    category?: string;
    isRead?: boolean;
    priority?: string;
  }
): Promise<NotificationResponse> {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/admin/notifications?${params}`, {
      headers: getAuthHeaders(),
      cache: 'no-store'
    });

    if (!response.ok) {
      console.warn('Notifications API returned error status, using mock data');
      return getMockNotifications();
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    // Return mock data for development - don't throw
    return getMockNotifications();
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    // Don't throw in development mode
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/notifications/read-all`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    // Don't throw in development mode
  }
}

export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete notification');
    }
  } catch (error) {
    console.error('Error deleting notification:', error);
    // Don't throw in development mode
  }
}

export async function clearAllNotifications(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/notifications/clear-all`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to clear all notifications');
    }
  } catch (error) {
    console.error('Error clearing all notifications:', error);
    // Don't throw in development mode
  }
}

// Mock data function for development
function getMockNotifications(): NotificationResponse {
  const now = new Date();
  return {
    notifications: [
      {
        id: "notif_1",
        type: "info",
        title: "System Update Available",
        message: "A new system update (v2.1.0) is available for installation.",
        timestamp: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
        isRead: false,
        category: "system",
        priority: "medium",
        actionUrl: "/admin/system/updates",
        actionLabel: "View Update"
      },
      {
        id: "notif_2",
        type: "success",
        title: "New User Registration",
        message: "A new user (jane.smith@example.com) has successfully registered.",
        timestamp: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
        isRead: false,
        category: "user",
        priority: "low"
      }
    ],
    unreadCount: 2,
    totalCount: 2
  };
}

// User Management API functions
import type { AdminUser } from '../admin/dashboard/types/dashboard';

export type { AdminUser };

export interface UserActivityLog {
  id: string;
  userId: number;
  action: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: { [key: string]: any };
}

export interface UserManagementResponse {
  users: AdminUser[];
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
}

export async function getUsers(
  limit: number = 50,
  offset: number = 0,
  filters?: {
    role?: string;
    isActive?: boolean;
    search?: string;
  }
): Promise<UserManagementResponse> {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
      headers: getAuthHeaders(),
      cache: 'no-store'
    });

    if (!response.ok) {
      console.warn('Users API returned error status, using mock data');
      return getMockUsers();
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    return getMockUsers();
  }
}

export async function getUserActivityLogs(
  userId: number,
  limit: number = 50,
  offset: number = 0
): Promise<{ logs: UserActivityLog[]; totalCount: number }> {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/activity?${params}`, {
      headers: getAuthHeaders(),
      cache: 'no-store'
    });

    if (!response.ok) {
      console.warn('User activity API returned error status, using mock data');
      return getMockUserActivityLogs();
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user activity logs:', error);
    return getMockUserActivityLogs();
  }
}

export async function updateUserRole(userId: number, role: "admin" | "user"): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      throw new Error('Failed to update user role');
    }
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

export async function updateUserStatus(userId: number, isActive: boolean): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ is_active: isActive }),
    });

    if (!response.ok) {
      throw new Error('Failed to update user status');
    }
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
}

export async function deleteUser(userId: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Mock data functions for development
function getMockUsers(): UserManagementResponse {
  const now = new Date();
  return {
    users: [
      {
        id: 1,
        username: "admin",
        email: "admin@example.com",
        role: "admin",
        isActive: true,
        lastLogin: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        registrationDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        activityCount: 156
      }
    ],
    totalCount: 1,
    activeCount: 1,
    inactiveCount: 0
  };
} function
  getMockUserActivityLogs(): { logs: UserActivityLog[]; totalCount: number } {
  const now = new Date();
  return {
    logs: [
      {
        id: "log_1",
        userId: 1,
        action: "login",
        description: "User logged in successfully",
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    ],
    totalCount: 1
  };
}

// Enhanced authentication checks for dashboard
export function requireAdminAuth(): boolean {
  const token = getAuthToken();
  const userInfo = getUserInfo();

  if (!token || !userInfo || !userInfo.is_admin) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return false;
  }

  return true;
}

export async function validateAdminSession(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/validate-session`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      removeAuthToken();
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating admin session:', error);
    return false;
  }
}

// Data Caching and Optimization
class DashboardCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

export const dashboardCache = new DashboardCache();

// Admin Notifications API
export async function getAdminNotifications(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/notifications`, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    throw error;
  }
}

// Admin Settings API
export async function getAdminSettings(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/settings`, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch settings: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    throw error;
  }
}

export async function updateAdminSettings(settings: any): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error(`Failed to update settings: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating admin settings:', error);
    throw error;
  }
}