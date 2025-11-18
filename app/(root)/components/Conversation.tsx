"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { getAdminCountriesByEmail } from "@/lib/actions/admin.actions";
import {
  deleteSingleMessage,
  getMessagesByEmail,
} from "@/lib/actions/message.actions";
import { Trash } from "lucide-react";
import toast from "react-hot-toast";

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
}

const Conversation: React.FC<ConversationProps> = ({ userEmail }) => {
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
        setMessages((prev) =>
          prev.filter((msg) => msg._id.toString() !== messageId)
        );
      } catch (err) {
        console.error("Failed to delete message", err);
        toast.error("Failed to delete");
      }
    },
    [threadId]
  );

  return (
    <section className="p-4 bg-blue-50 dark:bg-gray-800 rounded-2xl rounded-b-none flex flex-col h-[28rem] shadow-lg">
      <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
        Conversation
      </h2>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 p-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent"
      >
        {messages.length ? (
          messages.map((msg) => {
            const isUser = msg.senderRole === "user";
            return (
              <div
                key={msg._id.toString()}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`relative group max-w-[75%] px-4 py-2 rounded-2xl shadow-md text-sm transition 
                    ${
                      isUser
                        ? "bg-blue-500 text-white rounded-br-none hover:bg-blue-600"
                        : "bg-gray-200 text-gray-900 rounded-bl-none hover:bg-gray-300"
                    }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`text-xs mt-1 block ${
                      isUser
                        ? "text-blue-100 text-right"
                        : "text-gray-500 text-left"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleString("en-GB")}
                  </span>

                  {isUser && (
                    <button
                      onClick={() => handleDeleteMessage(msg._id.toString())}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 
                      hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-sm">No messages found</p>
        )}
      </div>
    </section>
  );
};

export default Conversation;
