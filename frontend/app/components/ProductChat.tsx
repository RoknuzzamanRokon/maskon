"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  User,
  Bot,
  Clock,
  Check,
  CheckCheck,
  Image as ImageIcon,
  Paperclip,
  MoreVertical,
  ArrowLeft,
  Phone,
  Video,
  Info,
} from "lucide-react";
import {
  ChatMessage,
  generateSessionId,
  startChatSession,
  sendChatMessage,
} from "../lib/api";
import { sessionManager } from "../lib/sessionManager";
import useWebSocket from "../hooks/useWebSocket";
import { useChatHistory } from "../hooks/useChatHistory";
import { ConnectionState } from "../lib/websocketManager";

interface ProductChatProps {
  productId: number;
  productName: string;
  productImage?: string;
  productPrice?: number;
  onClose?: () => void;
  isFullScreen?: boolean;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image_urls?: string[];
  category?: string;
}

export default function ProductChat({
  productId,
  productName,
  productImage,
  productPrice,
  onClose,
  isFullScreen = false,
}: ProductChatProps) {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [showNameForm, setShowNameForm] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "connecting" | "disconnected"
  >("connected");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use the chat history hook for message persistence and pagination
  const {
    messages,
    isLoading: historyLoading,
    hasMore,
    unreadCount,
    loadMore,
    refresh: refreshHistory,
    addMessage,
    markAsRead,
  } = useChatHistory({
    productId,
    sessionId,
    autoLoad: isSessionStarted && !!sessionId,
    pageSize: 50,
    markAsReadOnLoad: true,
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
      setConnectionStatus(
        state === ConnectionState.CONNECTED
          ? "connected"
          : state === ConnectionState.CONNECTING ||
            state === ConnectionState.RECONNECTING
          ? "connecting"
          : "disconnected"
      );
    },
  });

  // Initialize session on component mount
  useEffect(() => {
    const storedSessionId = generateSessionId();
    setSessionId(storedSessionId);

    // Load stored customer info
    const storedName = localStorage.getItem("chat_customer_name");
    const storedEmail = localStorage.getItem("chat_customer_email");
    if (storedName) setCustomerName(storedName);
    if (storedEmail) setCustomerEmail(storedEmail);

    // Check if session already exists for this product
    checkExistingSession();
  }, [productId]);

  // Check for existing session and load history on return visits
  useEffect(() => {
    if (isSessionStarted && productId && sessionId) {
      // Check if we have message history for this session
      const sessionHistory = sessionManager.getSessionHistory(productId);
      if (sessionHistory.hasHistory) {
        // Refresh history to get latest messages
        refreshHistory();
      }
    }
  }, [isSessionStarted, productId, sessionId, refreshHistory]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current && !showNameForm) {
      inputRef.current.focus();
    }
  }, [showNameForm]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkExistingSession = async () => {
    // Check if we have an existing session for this product
    const existingSessionKey = `chat_session_${productId}`;
    const existingSession = localStorage.getItem(existingSessionKey);

    if (existingSession && customerName) {
      setIsSessionStarted(true);
      await refreshHistory();
    }
  };

  // Load more messages for pagination
  const handleLoadMore = async () => {
    if (hasMore && !historyLoading) {
      await loadMore();
    }
  };

  const initializeChat = async (
    name: string,
    email: string,
    initialMessage?: string
  ) => {
    if (!productId || !sessionId) return;

    setIsLoading(true);
    setConnectionStatus("connecting");

    try {
      await startChatSession(productId, {
        session_id: sessionId,
        customer_name: name,
        customer_email: email,
        initial_message: initialMessage,
      });

      // Store customer info and session
      localStorage.setItem("chat_customer_name", name);
      localStorage.setItem("chat_customer_email", email);
      localStorage.setItem(`chat_session_${productId}`, sessionId);

      setCustomerName(name);
      setCustomerEmail(email);
      setIsSessionStarted(true);
      setShowNameForm(false);
      setConnectionStatus("connected");

      // Refresh history after session is created
      await refreshHistory();
    } catch (error) {
      console.error("Failed to start chat session:", error);
      setConnectionStatus("disconnected");
    } finally {
      setIsLoading(false);
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
    const messageId = `temp_${Date.now()}`;
    setInputText("");

    // Add optimistic message to UI
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
    addMessage(optimisticMessage);

    // Track message sending

    try {
      // Try WebSocket first if connected
      if (isConnected) {
        const sent = sendWebSocketMessage(messageText);
        if (sent) {
          // WebSocket message sent successfully
          sessionManager.incrementMessageCount(productId);
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
      sessionManager.incrementMessageCount(productId);

      // Refresh history to get the actual message with proper ID
      await refreshHistory();
    } catch (error) {
      console.error("Failed to send message:", error);

      // Handle message failure

      // Remove optimistic message and restore input text on error
      // Note: This is a simplified approach - in a real app you'd want better optimistic update handling
      setInputText(messageText);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = async (name: string, email: string) => {
    const initialMessage = inputText.trim();
    setInputText("");
    await initializeChat(name, email, initialMessage);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;

    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMessageStatus = (message: ChatMessage) => {
    if (message.sender_type !== "customer") return null;

    // Simulate message status based on timestamp
    const messageAge = Date.now() - new Date(message.created_at).getTime();
    if (messageAge < 1000) return "sending";
    if (message.is_read) return "read";
    return "delivered";
  };

  const renderMessageStatus = (status: string | null) => {
    if (!status) return null;

    switch (status) {
      case "sending":
        return <Clock className="w-3 h-3 text-gray-400 animate-pulse" />;
      case "delivered":
        return <Check className="w-3 h-3 text-gray-400" />;
      case "read":
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex flex-col bg-white dark:bg-gray-900 ${
        isFullScreen
          ? "h-screen"
          : "h-96 rounded-lg border border-gray-200 dark:border-gray-700"
      }`}
    >
      {/* Product Context Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
        <div className="flex items-center space-x-3">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/50 dark:hover:bg-gray-600/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          )}

          {productImage && (
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              <img
                src={productImage}
                alt={productName}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              {productName}
            </h3>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              {productPrice && (
                <span className="font-medium">${productPrice}</span>
              )}
              <span
                className={`flex items-center space-x-1 ${
                  connectionStatus === "connected"
                    ? "text-green-600"
                    : connectionStatus === "connecting"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    connectionStatus === "connected"
                      ? "bg-green-500"
                      : connectionStatus === "connecting"
                      ? "bg-yellow-500 animate-pulse"
                      : "bg-red-500"
                  }`}
                />
                <span className="capitalize">{connectionStatus}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-white/50 dark:hover:bg-gray-600/50 rounded-lg transition-colors">
            <Phone className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <button className="p-2 hover:bg-white/50 dark:hover:bg-gray-600/50 rounded-lg transition-colors">
            <Video className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <button className="p-2 hover:bg-white/50 dark:hover:bg-gray-600/50 rounded-lg transition-colors">
            <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Name Form */}
      <AnimatePresence>
        {showNameForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-gray-800"
          >
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              👋 Let's get started! Please introduce yourself:
            </h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Your name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  customerEmail &&
                  handleStartChat(customerName, customerEmail)
                }
              />
              <input
                type="email"
                placeholder="Your email (optional)"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  customerName &&
                  handleStartChat(customerName, customerEmail)
                }
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => handleStartChat(customerName, customerEmail)}
                  disabled={!customerName.trim() || isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {isLoading ? "Starting..." : "Start Conversation"}
                </button>
                <button
                  onClick={() => setShowNameForm(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {/* Load More Button */}
        {hasMore && messages.length > 0 && (
          <div className="text-center">
            <button
              onClick={handleLoadMore}
              disabled={historyLoading}
              className="px-4 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
            >
              {historyLoading ? "Loading..." : "Load Earlier Messages"}
            </button>
          </div>
        )}

        {messages.length === 0 && !showNameForm && !historyLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Start a conversation
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
              Ask questions about {productName}, get pricing information, or
              request support.
            </p>
          </div>
        )}

        {historyLoading && messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Loading chat history...
            </p>
          </div>
        )}

        {messages.map((message, index) => {
          const isCustomer = message.sender_type === "customer";
          const isAdmin = message.sender_type === "admin";
          const showTimestamp =
            index === 0 ||
            new Date(message.created_at).getTime() -
              new Date(messages[index - 1].created_at).getTime() >
              300000; // 5 minutes

          return (
            <div key={message.id}>
              {showTimestamp && (
                <div className="text-center my-4">
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
                    {formatTimestamp(message.created_at)}
                  </span>
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${
                  isCustomer ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                    isCustomer ? "flex-row-reverse space-x-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCustomer
                        ? "bg-blue-600 text-white"
                        : isAdmin
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {isCustomer ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className="flex flex-col">
                    {message.sender_name && !isCustomer && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-1">
                        {message.sender_name}
                      </span>
                    )}

                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isCustomer
                          ? "bg-blue-600 text-white rounded-br-md"
                          : isAdmin
                          ? "bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100 rounded-bl-md"
                          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">
                        {message.message_text}
                      </p>
                    </div>

                    {/* Message Status and Time */}
                    <div
                      className={`flex items-center mt-1 space-x-1 text-xs text-gray-400 ${
                        isCustomer ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span>
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {renderMessageStatus(getMessageStatus(message))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-start"
            >
              <div className="flex items-end space-x-2 max-w-xs">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-2xl rounded-bl-md">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-end space-x-3">
          {/* Attachment Button */}
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Input Field */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={
                !isSessionStarted
                  ? "Type your question to start chatting..."
                  : "Type a message..."
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Send Button */}
          <motion.button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>

        {!isSessionStarted && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            We'll ask for your name to personalize the conversation
          </p>
        )}
      </div>
    </div>
  );
}
