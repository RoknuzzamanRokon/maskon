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