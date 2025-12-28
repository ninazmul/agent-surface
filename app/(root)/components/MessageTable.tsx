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
import { IMessage, Role } from "@/lib/database/models/message.model";
import { isAdmin } from "@/lib/actions";

interface MessageTableProps {
  email: string;
  role: Role;
}

const POLL_INTERVAL = 5000; // milliseconds

const MessageTable = ({ email, role }: MessageTableProps) => {
  const [threads, setThreads] = useState<IMessage[]>([]);
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
  const isAdminUser = role === "Admin";

  // ====== FETCH USERS ======
  const fetchAllUsers = useCallback(async () => {
    try {
      const profiles = await getAllProfiles();
      setAllUsers(profiles || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // ====== FETCH THREADS ======
  const fetchThreads = useCallback(async () => {
    try {
      const fetchedThreads = await getMessagesForUser(email, role);

      setThreads(fetchedThreads);

      // Preload profiles
      const map: Record<string, { name?: string; logo?: string }> = {};
      await Promise.all(
        fetchedThreads.map(async (t) => {
          if (!map[t.userEmail]) {
            const p = await getProfileByEmail(t.userEmail);
            map[t.userEmail] = p || {};
          }
        })
      );
      setAgencyProfiles(map);
    } catch (err) {
      console.error("Failed to fetch threads:", err);
    }
  }, [email, role]);

  // ====== SEND MESSAGE ======
  const handleSendMessage = useCallback(async () => {
    const targetEmail = selectedThread?.userEmail || newMessageUser;
    if (!targetEmail || !newMessageText.trim()) return;

    try {
      setSending(true);
      await createOrAppendMessage({
        userEmail: targetEmail,
        senderEmail: email,
        senderRole: isAdminUser ? "Admin" : role,
        text: newMessageText,
      });

      setNewMessageText("");
      fetchThreads();
      toast.success("Message sent");
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
    isAdminUser,
    fetchThreads,
  ]);

  // ====== AVAILABLE USERS FOR NEW MESSAGE ======
  const getAvailableUsers = useCallback(async () => {
    if (isAdminUser) return allUsers;

    const profile = await getProfileByEmail(email);
    const userRole = profile?.role;

    if (userRole === "Agent") {
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

    if (userRole === "Sub Agent") {
      if (!profile?.countryAgent) return [];
      return allUsers.filter((u) => u.email === profile.countryAgent);
    }

    if (userRole === "Student") {
      const adminEmails = (
        await Promise.all(
          allUsers.map(async (u) => ((await isAdmin(u.email)) ? u.email : null))
        )
      ).filter(Boolean) as string[];
      return allUsers.filter((u) => adminEmails.includes(u.email));
    }

    return [];
  }, [allUsers, email, isAdminUser]);

  useEffect(() => {
    const fetchAvailable = async () => {
      const users = await getAvailableUsers();
      setAvailableUsers(users);
    };
    if (allUsers.length > 0) fetchAvailable();
  }, [allUsers, getAvailableUsers]);

  // ====== AUTO SCROLL ======
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedThread, threads]);

  // ====== INITIAL LOAD & POLLING ======
  useEffect(() => {
    fetchAllUsers();
    fetchThreads();

    const interval = setInterval(fetchThreads, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAllUsers, fetchThreads]);

  const currentRecipientName = selectedThread
    ? agencyProfiles[selectedThread.userEmail]?.name || selectedThread.userEmail
    : newMessageUser
    ? agencyProfiles[newMessageUser]?.name || newMessageUser
    : "";

  // ====== RENDER ======
  return (
    <div className="space-y-6">
      <div className="flex h-[calc(100vh-10rem)] w-full lg:bg-white lg:dark:bg-gray-800 rounded-2xl overflow-hidden lg:p-4 gap-4">
        {/* LEFT SIDEBAR */}
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
              {threads
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

        {/* MIDDLE PANEL */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-700 p-4 flex flex-col h-full overflow-hidden rounded-2xl">
          {!selectedThread && !newMessageUser ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a thread or start a new message
            </div>
          ) : (
            <>
              {/* RECIPIENT NAME */}
              <div className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
                {currentRecipientName}
              </div>

              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-3 pr-2"
              >
                {(selectedThread?.messages || []).map((msg) => {
                  const isOwnMsg = msg.senderEmail === email;
                  const isAdminMsg = msg.senderRole === "Admin";
                  return (
                    <div
                      key={msg._id.toString()}
                      className={`flex flex-col ${
                        isOwnMsg ? "items-end" : "items-start"
                      } space-y-1`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm ${
                          isAdminMsg
                            ? "bg-purple-600 text-white rounded-br-none"
                            : isOwnMsg
                            ? "bg-gray-600 text-white rounded-br-none"
                            : "bg-gray-200 text-black rounded-bl-none"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span
                        className={`text-xs text-gray-500 ${
                          isOwnMsg ? "text-right" : "text-left"
                        }`}
                      >
                        {timeAgo(msg.timestamp)} {isAdminMsg ? "(Admin)" : ""}
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

        {/* RIGHT SIDEBAR */}
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
