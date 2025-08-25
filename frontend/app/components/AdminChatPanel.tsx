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
  Package,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { getUserInfo } from "../lib/api";

interface ChatMessage {
  id: number;
  session_id: number;
  sender_type: string;
  sender_name?: string;
  message_text: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

interface Inquiry {
  id: number;
  product_id: number;
  session_id: string;
  customer_email?: string;
  customer_name?: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  assigned_admin_id?: number;
  product_name?: string;
  product_price?: number;
  assigned_admin_name?: string;
  total_messages: number;
  unread_messages: number;
}

interface AdminChatPanelProps {
  inquiry: Inquiry;
  onStatusUpdate?: (inquiryId: number, status: string) => void;
  onClose?: () => void;
  className?: string;
}

export default function AdminChatPanel({
  inquiry,
  onStatusUpdate,
  onClose,
  className = "",
}: AdminChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [responseText, setResponseText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(inquiry.status);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const userInfo = getUserInfo();

  useEffect(() => {
    loadMessages();
  }, [inquiry.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        }/api/admin/inquiries/${inquiry.id}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendResponse = async () => {
    if (!responseText.trim()) return;

    setIsSending(true);
    const messageText = responseText;
    setResponseText("");

    // Add optimistic message
    const optimisticMessage: ChatMessage = {
      id: Date.now(),
      session_id: inquiry.id,
      sender_type: "admin",
      sender_name: userInfo?.username || "Admin",
      message_text: messageText,
      message_type: "text",
      is_read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        }/api/admin/inquiries/${inquiry.id}/respond`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message_text: messageText,
            admin_id: userInfo?.id,
            admin_name: userInfo?.username,
          }),
        }
      );

      if (response.ok) {
        // Reload messages to get the actual message with proper ID
        await loadMessages();
      } else {
        // Remove optimistic message on error
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== optimisticMessage.id)
        );
        setResponseText(messageText);
      }
    } catch (error) {
      console.error("Failed to send response:", error);
      // Remove optimistic message on error
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== optimisticMessage.id)
      );
      setResponseText(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        }/api/admin/inquiries/${inquiry.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        setCurrentStatus(newStatus);
        onStatusUpdate?.(inquiry.id, newStatus);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-4 h-4" />;
      case "in_progress":
        return <Clock className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4" />;
      case "closed":
        return <XCircle className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <div
      className={`flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {inquiry.customer_name || "Anonymous Customer"}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <Package className="w-4 h-4" />
                <span>{inquiry.product_name}</span>
                {inquiry.product_price && (
                  <span className="font-medium">${inquiry.product_price}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadMessages}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Refresh messages"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Customer Info */}
        <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
          {inquiry.customer_email && (
            <div className="flex items-center space-x-1">
              <Mail className="w-4 h-4" />
              <span>{inquiry.customer_email}</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>Created {formatDate(inquiry.created_at)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageSquare className="w-4 h-4" />
            <span>{inquiry.total_messages} messages</span>
          </div>
        </div>

        {/* Status and Priority */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2 py-1 text-xs rounded-full border ${getStatusColor(
                currentStatus
              )}`}
            >
              {getStatusIcon(currentStatus)}
              <span className="ml-1 capitalize">
                {currentStatus.replace("_", " ")}
              </span>
            </span>
            <span className="px-2 py-1 text-xs rounded-full border bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
              {inquiry.priority} priority
            </span>
          </div>

          <select
            value={currentStatus}
            onChange={(e) => updateStatus(e.target.value)}
            className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-500 dark:text-gray-400">
              Loading messages...
            </span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
          </div>
        ) : (
          messages.map((message, index) => {
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
                      {formatDate(message.created_at)} at{" "}
                      {formatTimestamp(message.created_at)}
                    </span>
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    isAdmin ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                      isAdmin ? "flex-row-reverse space-x-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isAdmin
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {isAdmin ? (
                        <Bot className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className="flex flex-col">
                      {message.sender_name && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-1">
                          {message.sender_name}
                        </span>
                      )}

                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isAdmin
                            ? "bg-blue-600 text-white rounded-br-md"
                            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.message_text}
                        </p>
                      </div>

                      {/* Message Time */}
                      <div
                        className={`flex items-center mt-1 space-x-1 text-xs text-gray-400 ${
                          isAdmin ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span>{formatTimestamp(message.created_at)}</span>
                        {isAdmin && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Response Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && !e.shiftKey && sendResponse()
              }
              placeholder="Type your response..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm resize-none"
              disabled={isSending}
            />
          </div>

          <motion.button
            onClick={sendResponse}
            disabled={!responseText.trim() || isSending}
            className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Press Enter to send</span>
          {isSending && (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600 mr-1"></div>
              Sending...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
