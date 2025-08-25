"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  User,
  Bot,
  Minimize2,
  Maximize2,
  Clock,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { ChatMessage, startChatSession, sendChatMessage } from "../lib/api";
import { sessionManager } from "../lib/sessionManager";
import useWebSocket from "../hooks/useWebSocket";
import { useChatHistory } from "../hooks/useChatHistory";
import { ConnectionState } from "../lib/websocketManager";
import { useChatErrorHandler } from "../hooks/useErrorHandler";
import ErrorNotification, { ConnectionStatus } from "./ErrorNotification";
import { ChatError, NetworkError, ValidationError } from "../lib/errorHandler";

interface ChatWidgetProps {
  productId?: number;
  productName?: string;
}

export default function ChatWidget({
  productId,
  productName,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [showNameForm, setShowNameForm] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Error handling
  const {
    error: errorState,
    handleMessageSendError,
    handleConnectionError,
    clearError,
    retry,
    withErrorHandling,
  } = useChatErrorHandler({
    maxRetries: 3,
    context: "chat-widget",
    onRetry: (attempt, error) => {
      console.log(
        `Retrying chat operation (attempt ${attempt}):`,
        error.message
      );
    },
  });

  // Use the chat history hook for message persistence
  const {
    messages,
    unreadCount,
    isLoading: historyLoading,
    refresh: refreshHistory,
    addMessage,
    markAsRead,
  } = useChatHistory({
    productId: productId || 0,
    sessionId,
    autoLoad: isSessionStarted && !!productId && !!sessionId,
    pageSize: 30, // Smaller page size for widget
    markAsReadOnLoad: isOpen,
  });

  // WebSocket integration
  const {
    connectionState,
    isConnected,
    sendMessage: sendWebSocketMessage,
    sendTyping,
  } = useWebSocket({
    sessionId: sessionId || undefined,
    productId,
    userName: customerName || "Anonymous",
    userType: "customer",
    autoConnect: isSessionStarted && !!sessionId,
    onMessage: (message) => {
      // Handle incoming WebSocket messages
      const newMessage: ChatMessage = {
        id: message.message_id || Date.now(),
        session_id: parseInt(sessionId) || 0,
        sender_type: message.sender_type,
        sender_name: message.sender_name,
        message_text: message.message,
        message_type: "text",
        is_read: false,
        created_at: message.timestamp,
        updated_at: message.timestamp,
      };

      // Add message using the history hook
      addMessage(newMessage);
    },
    onTyping: (typing) => {
      // Handle typing indicators
      if (typing.user_type !== "customer") {
        setTypingUsers((prev) => {
          if (typing.is_typing) {
            return prev.includes(typing.user_name)
              ? prev
              : [...prev, typing.user_name];
          } else {
            return prev.filter((name) => name !== typing.user_name);
          }
        });
      }
    },
    onConnectionChange: (state) => {
      console.log("WebSocket connection state:", state);
    },
  });

  // Initialize session on component mount
  useEffect(() => {
    if (!productId) return;

    // Get or create product-specific session
    const productSession = sessionManager.getProductSession(productId);
    setSessionId(productSession.sessionId);

    // Load stored customer info from user preferences
    const userPrefs = sessionManager.getUserPreferences();
    if (userPrefs.name) setCustomerName(userPrefs.name);
    if (userPrefs.email) setCustomerEmail(userPrefs.email);

    // Check if session already exists and has customer info
    if (productSession.customerName && productSession.customerEmail) {
      setCustomerName(productSession.customerName);
      setCustomerEmail(productSession.customerEmail);
      setIsSessionStarted(true);
    }
  }, [productId]);

  // Refresh messages when widget is opened and mark as read
  useEffect(() => {
    if (isOpen && isSessionStarted && productId && sessionId) {
      refreshHistory();
      // Mark messages as read when widget is opened
      if (unreadCount > 0) {
        markAsRead();
      }
    }
  }, [
    isOpen,
    isSessionStarted,
    productId,
    sessionId,
    refreshHistory,
    unreadCount,
    markAsRead,
  ]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle return visits - check for existing chat history
  useEffect(() => {
    if (productId && sessionId && isSessionStarted) {
      const sessionHistory = sessionManager.getSessionHistory(productId);
      if (sessionHistory.hasHistory && sessionHistory.messageCount > 0) {
        // User has chat history, refresh to get latest messages
        refreshHistory();
      }
    }
  }, [productId, sessionId, isSessionStarted, refreshHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeChat = async (
    name: string,
    email: string,
    initialMessage?: string
  ) => {
    if (!productId || !sessionId) return;

    setIsLoading(true);

    const result = await withErrorHandling(async () => {
      // Validate inputs
      if (!name.trim()) {
        throw new ValidationError("Name is required");
      }

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new ValidationError("Please enter a valid email address");
      }

      await startChatSession(productId, {
        session_id: sessionId,
        customer_name: name,
        customer_email: email,
        initial_message: initialMessage,
      });

      // Store customer info in session manager
      sessionManager.updateUserPreferences({ name, email });
      sessionManager.updateProductSession(productId, {
        customerName: name,
        customerEmail: email,
        isActive: true,
      });

      setCustomerName(name);
      setCustomerEmail(email);
      setIsSessionStarted(true);
      setShowNameForm(false);

      // Refresh history after session is created
      await refreshHistory();
    });

    setIsLoading(false);

    if (!result) {
      // Error occurred, handled by error handler
      console.error("Failed to start chat session");
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !productId || !sessionId) return;

    // If session not started, show name form
    if (!isSessionStarted) {
      setShowNameForm(true);
      return;
    }

    setIsLoading(true);
    const messageText = inputText;
    setInputText("");

    // Create optimistic message
    const optimisticMessage: ChatMessage = {
      id: Date.now(),
      session_id: 0,
      sender_type: "customer",
      sender_name: customerName,
      message_text: messageText,
      message_type: "text",
      is_read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add to UI immediately using the history hook
    addMessage(optimisticMessage);

    const result = await withErrorHandling(async () => {
      // Validate message
      if (messageText.length > 2000) {
        throw new ValidationError(
          "Message is too long. Please keep it under 2000 characters."
        );
      }

      // Try WebSocket first if connected
      if (isConnected) {
        const sent = sendWebSocketMessage(messageText);
        if (sent) {
          // WebSocket message sent successfully
          if (productId) {
            sessionManager.incrementMessageCount(productId);
          }
          return;
        }
      }

      // Fallback to HTTP API
      await sendChatMessage(productId, sessionId, {
        message_text: messageText,
        sender_type: "customer",
        sender_name: customerName,
        customer_email: customerEmail,
      });

      // Update session activity
      if (productId) {
        sessionManager.incrementMessageCount(productId);
      }

      // Refresh history to get the server response
      await refreshHistory();
    });

    setIsLoading(false);

    if (!result) {
      // Error occurred - restore input text for retry
      setInputText(messageText);
      // Remove optimistic message since send failed
      // Note: In a production app, you might want to mark the message as failed instead
    }
  };

  const handleStartChat = async (name: string, email: string) => {
    const initialMessage = inputText.trim();
    setInputText("");
    await initializeChat(name, email, initialMessage);
  };

  // Typing indicator handling
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const handleTyping = (value: string) => {
    if (!isConnected || !sessionId) return;

    const hasText = value.trim().length > 0;

    // Send typing start if not already typing and has text
    if (hasText && !isTypingRef.current) {
      sendTyping(true);
      isTypingRef.current = true;
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        sendTyping(false);
        isTypingRef.current = false;
      }
    }, 1000);

    // Stop typing immediately if no text
    if (!hasText && isTypingRef.current) {
      sendTyping(false);
      isTypingRef.current = false;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {/* Error Notification */}
      <ErrorNotification
        error={errorState.error}
        isRetrying={errorState.isRetrying}
        canRetry={errorState.canRetry}
        onRetry={retry}
        onDismiss={clearError}
      />

      {/* Chat Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group"
            onClick={() => setIsOpen(true)}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <MessageCircle className="w-6 h-6 group-hover:animate-pulse" />
            {unreadCount > 0 && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </div>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 ${
              isMinimized ? "w-80 h-16" : "w-80 h-96"
            }`}
            initial={{ scale: 0, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">
                    {productName ? `${productName} Support` : "Product Support"}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-blue-100">
                    <span>
                      {isSessionStarted ? "Chat active" : "Ready to help"}
                    </span>
                    {isSessionStarted && (
                      <ConnectionStatus
                        isConnected={
                          connectionState === ConnectionState.CONNECTED
                        }
                        isConnecting={
                          connectionState === ConnectionState.CONNECTING ||
                          connectionState === ConnectionState.RECONNECTING
                        }
                        error={
                          errorState.error instanceof NetworkError
                            ? errorState.error
                            : null
                        }
                        className="text-blue-100"
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {productId && (
                  <Link
                    href={`/products/${productId}/chat`}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    title="Open full chat"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4" />
                  ) : (
                    <Minimize2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Name Form */}
                {showNameForm && (
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Let's get started! Please provide your details:
                    </h4>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Your name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                      />
                      <input
                        type="email"
                        placeholder="Your email (optional)"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            handleStartChat(customerName, customerEmail)
                          }
                          disabled={!customerName.trim() || isLoading}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {isLoading ? "Starting..." : "Start Chat"}
                        </button>
                        <button
                          onClick={() => setShowNameForm(false)}
                          className="px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages Area */}
                <div className="flex-1 p-4 h-64 overflow-y-auto space-y-4">
                  {messages.length === 0 && !showNameForm && (
                    <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-8">
                      <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>
                        Start a conversation about{" "}
                        {productName || "this product"}!
                      </p>
                      <p className="text-xs mt-1">
                        We're here to help with any questions.
                      </p>
                    </div>
                  )}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_type === "customer"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex items-start max-w-xs ${
                          message.sender_type === "customer"
                            ? "flex-row-reverse"
                            : "flex-row"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            message.sender_type === "customer"
                              ? "bg-blue-600 text-white ml-2"
                              : message.sender_type === "admin"
                              ? "bg-green-600 text-white mr-2"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 mr-2"
                          }`}
                        >
                          {message.sender_type === "customer" ? (
                            <User className="w-3 h-3" />
                          ) : (
                            <Bot className="w-3 h-3" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <div
                            className={`px-3 py-2 rounded-2xl text-sm ${
                              message.sender_type === "customer"
                                ? "bg-blue-600 text-white rounded-br-sm"
                                : message.sender_type === "admin"
                                ? "bg-green-100 dark:bg-green-800 text-green-900 dark:text-green-100 rounded-bl-sm"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm"
                            }`}
                          >
                            {message.sender_name &&
                              message.sender_type !== "customer" && (
                                <div className="text-xs opacity-75 mb-1">
                                  {message.sender_name}
                                </div>
                              )}
                            {message.message_text}
                          </div>
                          <div
                            className={`flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400 ${
                              message.sender_type === "customer"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTimestamp(message.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {typingUsers.length > 0 && (
                    <div className="flex justify-start">
                      <div className="flex items-start max-w-xs">
                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 mr-2 flex items-center justify-center">
                          <Bot className="w-3 h-3" />
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg">
                          <div className="flex items-center space-x-1">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 ml-2">
                              {typingUsers.join(", ")}{" "}
                              {typingUsers.length === 1 ? "is" : "are"}{" "}
                              typing...
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Loading Indicator */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-start max-w-xs">
                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 mr-2 flex items-center justify-center">
                          <Bot className="w-3 h-3" />
                        </div>
                        <div className="px-3 py-2 rounded-2xl rounded-bl-sm bg-gray-100 dark:bg-gray-700">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => {
                        setInputText(e.target.value);
                        handleTyping(e.target.value);
                      }}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                      placeholder={
                        !isSessionStarted
                          ? "Type your question to start chatting..."
                          : "Type your message..."
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                    />
                    <motion.button
                      onClick={handleSendMessage}
                      className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!inputText.trim() || isLoading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Send className="w-4 h-4" />
                    </motion.button>
                  </div>
                  {!isSessionStarted && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      We'll ask for your name to personalize the conversation
                    </p>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
