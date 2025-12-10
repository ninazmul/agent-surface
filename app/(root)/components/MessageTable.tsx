"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Fetch all users
  const fetchAllUsers = useCallback(async () => {
    try {
      const profiles = await getAllProfiles();
      setAllUsers(profiles || []);
    } catch (err) {
      console.error("Failed to fetch all users", err);
    }
  }, []);

  // Fetch messages and profiles
  const fetchMessages = useCallback(async () => {
    try {
      const threads = await getMessagesForUser(email, role);
      setMessages(threads);

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

  // Get available users
  const getAvailableUsers = useCallback(async () => {
    const adminStatus = await isAdmin(email);

    if (adminStatus) return allUsers;

    const profile = await getProfileByEmail(email);
    const roleProfile = profile?.role;

    if (roleProfile === "Agent") {
      const subAgents = await getSubAgentsByEmail(email);
      const adminEmails = (
        await Promise.all(
          allUsers.map(async (u) => ((await isAdmin(u.email)) ? u.email : null))
        )
      ).filter(Boolean) as string[];

      return allUsers.filter(
        (u) => subAgents.includes(u.email) || adminEmails.includes(u.email)
      );
    }

    if (roleProfile === "Sub Agent") {
      if (!profile?.countryAgent) return [];
      return allUsers.filter((u) => u.email === profile.countryAgent);
    }

    if (roleProfile === "Student") {
      const adminEmails = (
        await Promise.all(
          allUsers.map(async (u) => ((await isAdmin(u.email)) ? u.email : null))
        )
      ).filter(Boolean) as string[];
      return allUsers.filter((u) => adminEmails.includes(u.email));
    }

    return [];
  }, [allUsers, email]);

  useEffect(() => {
    const fetchAvailable = async () => {
      const users = await getAvailableUsers();
      setAvailableUsers(users);
    };
    if (allUsers.length > 0) fetchAvailable();
  }, [allUsers, getAvailableUsers]);

  // Scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedThread, messages]);

  return (
    <div className="space-y-6">
      <div className="flex h-[calc(100vh-10rem)] w-full lg:bg-white lg:dark:bg-gray-800 rounded-2xl overflow-hidden lg:p-4 gap-4">
        {/* Left sidebar: threads */}
        <div className="hidden lg:block w-[320px] flex-shrink-0 bg-gray-100 dark:bg-gray-700 h-full overflow-y-auto p-4 space-y-4 rounded-2xl">
          <h3 className="text-lg font-semibold">Threads</h3>
          <Input
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl"
          />
          <Table>
            <TableBody>
              {messages
                .filter((t) =>
                  t.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((thread) => {
                  const lastMsg =
                    thread.messages[thread.messages.length - 1]?.text ||
                    "No messages yet";
                  return (
                    <TableRow
                      key={thread._id.toString()}
                      onClick={() => {
                        setSelectedThread(thread);
                        setNewMessageUser("");
                      }}
                      className="hover:bg-purple-500 hover:text-white rounded-2xl border-none flex items-center justify-between cursor-pointer"
                    >
                      <TableCell className="flex items-center space-x-2">
                        <Image
                          src={
                            agencyProfiles[thread.userEmail]?.logo ||
                            "/assets/user.png"
                          }
                          alt="logo"
                          width={40}
                          height={40}
                          className="rounded-full object-cover w-10 h-10"
                        />
                        <div className="truncate">
                          <p className="font-bold truncate">
                            {agencyProfiles[thread.userEmail]?.name ||
                              thread.userEmail}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {lastMsg}
                          </p>
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
              Select a thread or start a new message
            </div>
          ) : (
            <>
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-3 pr-2"
              >
                {(selectedThread ? selectedThread.messages : []).map((msg) => {
                  const isAdminMsg = msg.senderRole === "Admin";
                  return (
                    <div
                      key={msg._id.toString()}
                      className={`flex flex-col ${
                        isAdminMsg ? "items-end" : "items-start"
                      } space-y-1`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm ${
                          isAdminMsg
                            ? "bg-purple-600 text-white rounded-br-none"
                            : "bg-gray-200 text-black rounded-bl-none"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span
                        className={`text-xs text-gray-500 ${
                          isAdminMsg ? "text-right" : "text-left"
                        }`}
                      >
                        {timeAgo(msg.timestamp)}
                      </span>
                    </div>
                  );
                })}
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
