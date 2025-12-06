"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { getAdminCountriesByEmail } from "@/lib/actions/admin.actions";
import {
  deleteSingleMessage,
  getMessagesByEmail,
} from "@/lib/actions/message.actions";
import { Trash } from "lucide-react";
import toast from "react-hot-toast";
import { timeAgo } from "@/lib/utils";
import MessageForm from "./MessageForm";

interface MessageEntry {
  _id: string;
  text: string;
  senderRole: string;
  senderEmail?: string;
  country?: string;
  timestamp: string;
}

interface IMessageResponse {
  _id: string;
  userEmail: string;
  messages: MessageEntry[];
}

interface ConversationProps {
  userEmail: string;
  country?: string;
}

const Conversation: React.FC<ConversationProps> = ({ userEmail, country }) => {
  const [messages, setMessages] = useState<MessageEntry[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const adminCountry = await getAdminCountriesByEmail(userEmail);
      const data: IMessageResponse = await getMessagesByEmail(userEmail);

      if (data?.messages?.length) {
        setThreadId(data._id.toString());

        const filteredMessages = data.messages
          .filter((msg) => msg.text && msg.senderRole)
          .filter(
            (msg) =>
              !msg.country ||
              (Array.isArray(adminCountry)
                ? adminCountry.includes(msg.country)
                : msg.country === adminCountry)
          )
          .sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

        setMessages(filteredMessages);
      } else {
        setMessages([]);
        setThreadId(null);
      }
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleDeleteMessage = useCallback(
    async (messageId: string) => {
      if (!threadId) return;
      try {
        await deleteSingleMessage(threadId, messageId);
        toast.success("Message deleted");
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      } catch (err) {
        console.error("Failed to delete message", err);
        toast.error("Failed to delete");
      }
    },
    [threadId]
  );

  return (
    <section className="flex flex-col h-[calc(100vh-10rem)] bg-gray-100 dark:bg-gray-700 rounded-2xl p-4">
      {/* Scrollable messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent"
      >
        {messages.length ? (
          messages.map((msg) => {
            const isUser = msg.senderRole === "user";
            return (
              <div
                key={msg._id}
                className={`flex flex-col ${
                  isUser ? "items-end" : "items-start"
                } space-y-1`}
              >
                {/* Message bubble */}
                <div
                  className={`relative group max-w-[75%] px-4 py-2 rounded-2xl shadow-md text-sm transition 
                    ${
                      isUser
                        ? "bg-gray-600 text-white rounded-br-none hover:bg-gray-700"
                        : "bg-gray-200 text-gray-900 rounded-bl-none hover:bg-gray-300"
                    }`}
                >
                  <p>{msg.text}</p>

                  {/* Delete button for user messages */}
                  {isUser && (
                    <button
                      onClick={() => handleDeleteMessage(msg._id)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 
                        hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash size={14} />
                    </button>
                  )}
                </div>

                {/* Timestamp outside the bubble */}
                <span
                  className={`text-xs text-gray-500 dark:text-gray-400 ${
                    isUser ? "text-right" : "text-left"
                  }`}
                >
                  {timeAgo(msg.timestamp)}
                </span>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-sm text-center">No messages found</p>
        )}
      </div>

      {/* Input at the bottom */}
      <div className="mt-2">
        <MessageForm
          userEmail={userEmail}
          senderEmail={userEmail}
          country={country}
          senderRole="user"
          type="Create"
          onMessageSent={(newMsg) => {
            if (newMsg._id) {
              setMessages((prev) => [...prev, newMsg as MessageEntry]);
            }
          }}
        />
      </div>
    </section>
  );
};

export default Conversation;
