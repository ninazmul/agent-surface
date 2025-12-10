"use client";

import { useState, useEffect, useCallback } from "react";
import {
  createOrAppendMessage,
  getMessagesForUser,
} from "@/lib/actions/message.actions";
import {
  getAllProfiles,
  getProfileByEmail,
  getSubAgentsByEmail,
} from "@/lib/actions/profile.actions";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import NewMessageForm from "./NewMessageForm";
import { timeAgo } from "@/lib/utils";
import {
  IMessage,
  IChatMessage,
  Role,
} from "@/lib/database/models/message.model";
import { isAdmin } from "@/lib/actions";

interface MessageTableProps {
  email: string;
  role: Role;
}

const MessageTable = ({ email, role }: MessageTableProps) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedThread, setSelectedThread] = useState<IMessage | null>(null);
  const [newMessageUser, setNewMessageUser] = useState<string>("");
  const [newMessageText, setNewMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [allUsers, setAllUsers] = useState<{ email: string; name?: string }[]>(
    []
  );
  const [agencyProfiles, setAgencyProfiles] = useState<
    Record<string, { name?: string; logo?: string }>
  >({});
  const [availableUsers, setAvailableUsers] = useState<
    { email: string; name?: string }[]
  >([]);

  // Fetch all users for NewMessageForm
  const fetchAllUsers = useCallback(async () => {
    try {
      const profiles = await getAllProfiles();
      setAllUsers(profiles || []);
    } catch (err) {
      console.error("Failed to fetch all users", err);
    }
  }, []);

  // Fetch messages based on role
  const fetchMessages = useCallback(async () => {
    try {
      const threads = await getMessagesForUser(email, role);
      setMessages(threads);

      // populate agencyProfiles for display
      const profileMap: Record<string, { name?: string; logo?: string }> = {};
      await Promise.all(
        threads.map(async (t) => {
          if (!profileMap[t.userEmail]) {
            const profile = await getProfileByEmail(t.userEmail);
            profileMap[t.userEmail] = profile || {};
          }
        })
      );
      setAgencyProfiles(profileMap);
    } catch (err) {
      console.error("Error fetching messages", err);
    }
  }, [email, role]);

  useEffect(() => {
    fetchAllUsers();
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchAllUsers, fetchMessages]);

  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!selectedThread && !newMessageUser) return;
    const targetEmail = selectedThread?.userEmail || newMessageUser;
    if (!targetEmail || !newMessageText.trim()) return;

    try {
      setSending(true);
      await createOrAppendMessage({
        userEmail: targetEmail,
        senderEmail: email,
        senderRole: role,
        text: newMessageText,
      });
      setNewMessageText("");
      toast.success("Message sent");
      fetchMessages();
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  }, [
    selectedThread,
    newMessageUser,
    newMessageText,
    email,
    role,
    fetchMessages,
  ]);

  const getAvailableUsers = async (
    email: string,
    allUsers: { email: string; name?: string }[]
  ) => {
    const adminStatus = await isAdmin(email);

    // Admin → can message anyone
    if (adminStatus) return allUsers;

    // Fetch user profile for role determination
    const profile = await getProfileByEmail(email);
    const role = profile?.role;

    // Agent → can message Sub Agents and Admins
    if (role === "Agent") {
      const subAgents = await getSubAgentsByEmail(email); // returns array of emails
      // Admins from allUsers, filtered by isAdmin
      const adminEmails = (
        await Promise.all(
          allUsers.map(async (u) => ((await isAdmin(u.email)) ? u.email : null))
        )
      ).filter(Boolean) as string[];

      return allUsers.filter(
        (u) => subAgents.includes(u.email) || adminEmails.includes(u.email)
      );
    }

    // Sub Agent → can message only their Agent
    if (role === "Sub Agent") {
      if (!profile?.countryAgent) return [];
      return allUsers.filter((u) => u.email === profile.countryAgent);
    }

    // Student → can message only Admins
    if (role === "Student") {
      const adminEmails = (
        await Promise.all(
          allUsers.map(async (u) => ((await isAdmin(u.email)) ? u.email : null))
        )
      ).filter(Boolean) as string[];
      return allUsers.filter((u) => adminEmails.includes(u.email));
    }

    return [];
  };

  useEffect(() => {
    const fetchAvailableUsers = async () => {
      const users = await getAvailableUsers(email, allUsers);
      setAvailableUsers(users);
    };

    if (allUsers.length > 0) fetchAvailableUsers();
  }, [email, allUsers]);

  return (
    <div className="space-y-6">
      <div className="flex h-[calc(100vh-10rem)] w-full lg:bg-white lg:dark:bg-gray-800 rounded-2xl overflow-hidden lg:p-4 gap-4">
        {/* Left sidebar */}
        <div className="hidden lg:block w-[320px] flex-shrink-0 bg-gray-100 dark:bg-gray-700 h-full overflow-y-auto p-4 space-y-4 rounded-2xl">
          <h3 className="text-lg font-semibold">Messages</h3>
          <Input
            placeholder="Search by user email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl"
          />
          <Table>
            <TableBody>
              {messages
                .filter((m) =>
                  m.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((message) => {
                  const lastMsg =
                    message.messages[message.messages.length - 1]?.text || "";
                  return (
                    <TableRow
                      key={message._id.toString()}
                      onClick={() => {
                        setSelectedThread(message);
                        setNewMessageUser("");
                      }}
                      className="hover:bg-purple-500 hover:text-white rounded-2xl border-none flex items-center justify-between"
                    >
                      <TableCell className="flex items-center space-x-2">
                        <Image
                          src={
                            agencyProfiles[message.userEmail]?.logo ||
                            "/assets/user.png"
                          }
                          alt="logo"
                          width={48}
                          height={48}
                          className="rounded-full object-cover w-10 h-10"
                        />
                        <div>
                          <p className="line-clamp-1 font-bold">
                            {agencyProfiles[message.userEmail]?.name ||
                              message.userEmail}
                          </p>
                          <div className="text-xs max-w-[180px] truncate line-clamp-1">
                            {lastMsg || "No messages yet"}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>

        {/* Main conversation panel */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-700 p-4 flex flex-col h-full overflow-hidden rounded-2xl">
          {!selectedThread && !newMessageUser ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a profile to view messages or send a new message
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {(selectedThread ? selectedThread.messages : []).map(
                  (msg: IChatMessage) => {
                    const isAdminMsg = msg.senderRole === "Admin";
                    return (
                      <div
                        key={msg._id.toString()}
                        className={`flex flex-col ${
                          isAdminMsg ? "items-end" : "items-start"
                        } space-y-1`}
                      >
                        <div
                          className={`group relative max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm ${
                            isAdminMsg
                              ? "bg-gray-600 text-white rounded-br-none"
                              : "bg-gray-200 text-black rounded-bl-none"
                          }`}
                        >
                          <p>{msg.text}</p>
                        </div>
                        <span
                          className={`text-xs text-gray-500 dark:text-gray-400 ${
                            isAdminMsg ? "text-right" : "text-left"
                          }`}
                        >
                          {timeAgo(msg.timestamp)}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t">
                <Input
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={async (e) =>
                    e.key === "Enter" && (await handleSendMessage())
                  }
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={sending}
                >
                  <Send /> {sending ? "..." : "Send"}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Right sidebar - New Message */}
        <div className="hidden lg:block w-[320px] flex-shrink-0 bg-gray-100 dark:bg-gray-700 h-full overflow-y-auto p-4 rounded-2xl">
          <NewMessageForm
            allUsers={availableUsers}
            agencyProfiles={agencyProfiles}
            onSelectUser={(email) => {
              setNewMessageUser(email);
              setSelectedThread(null);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MessageTable;
