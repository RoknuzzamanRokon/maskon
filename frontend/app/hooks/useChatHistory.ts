/**
 * Custom hook for managing chat history and message persistence
 * Handles loading, pagination, and caching of chat messages
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ChatMessage, 
  ChatMessageResponse, 
  getChatMessages, 
  markMessagesAsRead 
} from '../lib/api';
import { sessionManager } from '../lib/sessionManager';

interface UseChatHistoryOptions {
  productId: number;
  sessionId: string;
  autoLoad?: boolean;
  pageSize?: number;
  markAsReadOnLoad?: boolean;
}

interface ChatHistoryState {
  messages: ChatMessage[];
  isLoading: boolean;
  hasMore: boolean;
  hasPrevious: boolean;
  totalCount: number;
  unreadCount: number;
  currentPage: number;
  totalPages: number;
  error: string | null;
}

export function useChatHistory({
  productId,
  sessionId,
  autoLoad = true,
  pageSize = 50,
  markAsReadOnLoad = true
}: UseChatHistoryOptions) {
  const [state, setState] = useState<ChatHistoryState>({
    messages: [],
    isLoading: false,
    hasMore: false,
    hasPrevious: false,
    totalCount: 0,
    unreadCount: 0,
    currentPage: 1,
    totalPages: 0,
    error: null
  });

  const loadedPagesRef = useRef<Set<number>>(new Set());
  const cacheRef = useRef<Map<string, ChatMessage[]>>(new Map());

  const loadMessages = useCallback(async (
    page: number = 1, 
    append: boolean = false
  ): Promise<void> => {
    if (!productId || !sessionId) {
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const offset = (page - 1) * pageSize;
      const cacheKey = `${productId}-${sessionId}-${page}`;
      
      // Check cache first
      let response: ChatMessageResponse;
      if (cacheRef.current.has(cacheKey)) {
        const cachedMessages = cacheRef.current.get(cacheKey)!;
        response = {
          messages: cachedMessages,
          pagination: {
            total_count: state.totalCount,
            limit: pageSize,
            offset,
            has_more: state.hasMore,
            has_previous: state.hasPrevious,
            current_page: page,
            total_pages: state.totalPages
          },
          unread_count: state.unreadCount
        };
      } else {
        response = await getChatMessages(productId, sessionId, {
          limit: pageSize,
          offset,
          order: 'asc'
        });
        

        
        // Cache the messages if response is valid
        if (response && response.messages) {
          cacheRef.current.set(cacheKey, response.messages);
        }
      }

      // Ensure response has proper structure with fallbacks
      const messages = Array.isArray(response?.messages) ? response.messages : [];
      const pagination = response?.pagination || {
        total_count: messages.length,
        limit: pageSize,
        offset,
        has_more: false,
        has_previous: false,
        current_page: page,
        total_pages: Math.ceil(messages.length / pageSize)
      };
      const unreadCount = typeof response?.unread_count === 'number' ? response.unread_count : 0;

      // Additional safety check for pagination object
      const safePagination = {
        total_count: pagination.total_count || 0,
        limit: pagination.limit || pageSize,
        offset: pagination.offset || offset,
        has_more: Boolean(pagination.has_more),
        has_previous: Boolean(pagination.has_previous),
        current_page: pagination.current_page || page,
        total_pages: pagination.total_pages || 0
      };

      setState(prev => ({
        ...prev,
        messages: append ? [...prev.messages, ...messages] : messages,
        hasMore: safePagination.has_more,
        hasPrevious: safePagination.has_previous,
        totalCount: safePagination.total_count,
        unreadCount,
        currentPage: safePagination.current_page,
        totalPages: safePagination.total_pages,
        isLoading: false
      }));

      loadedPagesRef.current.add(page);

      // Mark messages as read if requested
      if (markAsReadOnLoad && unreadCount > 0) {
        await markMessagesAsRead(productId, sessionId, { markAll: true });
        setState(prev => ({ ...prev, unreadCount: 0 }));
      }

      // Update session activity
      sessionManager.markSessionWithHistory(productId);

    } catch (error) {
      console.error('Failed to load chat history:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load messages'
      }));
    }
  }, [productId, sessionId, pageSize, markAsReadOnLoad, state.totalCount, state.hasMore, state.hasPrevious, state.totalPages, state.unreadCount]);

  // Load initial messages
  useEffect(() => {
    if (autoLoad && productId && sessionId) {
      loadMessages(1);
    }
  }, [autoLoad, productId, sessionId, loadMessages]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (state.hasMore && !state.isLoading) {
      await loadMessages(state.currentPage + 1, true);
    }
  }, [state.hasMore, state.isLoading, state.currentPage, loadMessages]);

  const loadPrevious = useCallback(async (): Promise<void> => {
    if (state.hasPrevious && !state.isLoading && state.currentPage > 1) {
      await loadMessages(state.currentPage - 1);
    }
  }, [state.hasPrevious, state.isLoading, state.currentPage, loadMessages]);

  const refresh = useCallback(async (): Promise<void> => {
    // Clear cache and reload current page
    cacheRef.current.clear();
    loadedPagesRef.current.clear();
    await loadMessages(1);
  }, [loadMessages]);

  const addMessage = useCallback((message: ChatMessage): void => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
      totalCount: prev.totalCount + 1
    }));
    
    // Update session message count
    sessionManager.incrementMessageCount(productId);
  }, [productId]);

  const markAsRead = useCallback(async (messageIds?: number[]): Promise<void> => {
    try {
      await markMessagesAsRead(productId, sessionId, {
        messageIds,
        markAll: !messageIds
      });
      
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          !messageIds || messageIds.includes(msg.id) 
            ? { ...msg, is_read: true }
            : msg
        ),
        unreadCount: messageIds ? Math.max(0, prev.unreadCount - messageIds.length) : 0
      }));
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  }, [productId, sessionId]);

  return {
    ...state,
    loadMessages,
    loadMore,
    loadPrevious,
    refresh,
    addMessage,
    markAsRead
  };
}