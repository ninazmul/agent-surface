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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MessageTableProps {
  email: string;
  role: Role;
}

interface MessageProps {
  _id: string;
  text: string;
  senderEmail: string;
  senderRole: string;
  timestamp: Date;
}
const POLL_INTERVAL = 5000;

const MessageTable = ({ email, role }: MessageTableProps) => {
  const [threads, setThreads] = useState<IMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedThread, setSelectedThread] = useState<IMessage | null>(null);
  const [newMessageUser, setNewMessageUser] = useState<string>("");
  const [newMessageText, setNewMessageText] = useState("");
  const [sending, setSending] = useState(false);

  const [allUsers, setAllUsers] = useState<{ email: string; name?: string }[]>(
    [],
  );
  const [agencyProfiles, setAgencyProfiles] = useState<
    Record<string, { name?: string; logo?: string }>
  >({});
  const [availableUsers, setAvailableUsers] = useState<
    { email: string; name?: string }[]
  >([]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isAdminUser = role === "Admin";

  // ====== FETCH ALL USERS ======
  const fetchAllUsers = useCallback(async () => {
    try {
      const profiles = await getAllProfiles();
      setAllUsers(profiles || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  }, []);

  // ====== FETCH THREADS ======
  const fetchThreads = useCallback(async () => {
    if (!email) return;

    try {
      const fetchedThreads = await getMessagesForUser(email, role);
      setThreads(fetchedThreads);

      // ✅ AUTO SELECT OWN THREAD (NON-ADMIN)
      if (!isAdminUser && fetchedThreads.length > 0) {
        const ownThread =
          fetchedThreads.find((t) => t.userEmail === email) ||
          fetchedThreads[0];

        setSelectedThread((prev) => (prev ? prev : ownThread));
      }

      // Preload profiles
      const map: Record<string, { name?: string; logo?: string }> = {};
      await Promise.all(
        fetchedThreads.map(async (t) => {
          if (!map[t.userEmail]) {
            const profile = await getProfileByEmail(t.userEmail);
            map[t.userEmail] = profile || {};
          }
        }),
      );
      setAgencyProfiles(map);
    } catch (err) {
      console.error("Failed to fetch threads:", err);
    }
  }, [email, role, isAdminUser]);

  const appendMessageLocally = (targetEmail: string, message: MessageProps) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.userEmail === targetEmail
          ? ({ ...t, messages: [...t.messages, message] } as IMessage)
          : t,
      ),
    );

    setSelectedThread((prev) =>
      prev && prev.userEmail === targetEmail
        ? ({ ...prev, messages: [...prev.messages, message] } as IMessage)
        : prev,
    );
  };

  // ====== SEND MESSAGE ======
  const handleSendMessage = useCallback(async () => {
    const targetEmail = selectedThread?.userEmail || newMessageUser;
    if (!targetEmail || !newMessageText.trim()) return;

    const optimisticMessage = {
      _id: crypto.randomUUID(),
      text: newMessageText,
      senderEmail: email,
      senderRole: isAdminUser ? "Admin" : role,
      timestamp: new Date(),
    };

    // 🔥 Instant UI update
    appendMessageLocally(targetEmail, optimisticMessage);
    setNewMessageText("");

    try {
      setSending(true);
      await createOrAppendMessage({
        userEmail: targetEmail,
        senderEmail: email,
        senderRole: isAdminUser ? "Admin" : role,
        text: optimisticMessage.text,
      });
    } catch {
      toast.error("Failed to send message");
      // Optional: rollback here
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
  ]);

  // ====== AVAILABLE USERS ======
  const getAvailableUsers = useCallback(async () => {
    if (isAdminUser) return allUsers;

    const profile = await getProfileByEmail(email);
    const userRole = profile?.role;

    if (userRole === "Agent") {
      const subAgents = await getSubAgentsByEmail(email);
      const adminEmails = (
        await Promise.all(
          allUsers.map(async (u) =>
            (await isAdmin(u.email)) ? u.email : null,
          ),
        )
      ).filter(Boolean) as string[];
      return allUsers.filter(
        (u) => subAgents.includes(u.email) || adminEmails.includes(u.email),
      );
    }

    if (userRole === "Sub Agent") {
      if (!profile?.countryAgent) return [];
      return allUsers.filter((u) => u.email === profile.countryAgent);
    }

    if (userRole === "Student") {
      const adminEmails = (
        await Promise.all(
          allUsers.map(async (u) =>
            (await isAdmin(u.email)) ? u.email : null,
          ),
        )
      ).filter(Boolean) as string[];
      return allUsers.filter((u) => adminEmails.includes(u.email));
    }

    return [];
  }, [allUsers, email, isAdminUser]);

  // ====== UPDATE AVAILABLE USERS WHEN ALL USERS CHANGE ======
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

    // Only poll when tab is visible
    const poll = () => {
      if (document.visibilityState === "visible") fetchThreads();
    };

    intervalRef.current = setInterval(poll, POLL_INTERVAL);
    document.addEventListener("visibilitychange", poll);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", poll);
    };
  }, [fetchAllUsers, fetchThreads]);

  // ====== RENDER ======
  return (
    <div className="space-y-6">
      <div className="flex h-[calc(100vh-10rem)] w-full lg:bg-white lg:dark:bg-gray-800 rounded-2xl overflow-hidden lg:p-4 gap-4">
        {/* ================= LEFT SIDEBAR (DESKTOP) ================= */}
        <div className="hidden lg:block w-[320px] flex-shrink-0 bg-gray-100 dark:bg-gray-700 h-full overflow-y-auto p-4 space-y-4 rounded-2xl">
          <h3 className="text-lg font-semibold">Threads</h3>

          <Input
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Table>
            <TableBody>
              {threads
                .filter((t) =>
                  t.userEmail.toLowerCase().includes(searchQuery.toLowerCase()),
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
                      className="cursor-pointer hover:bg-purple-500 hover:text-white"
                    >
                      <TableCell className="flex gap-2">
                        <Image
                          src={
                            agencyProfiles[thread.userEmail]?.logo ||
                            "/assets/user.png"
                          }
                          alt="logo"
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div className="truncate">
                          <p className="font-semibold truncate">
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

        {/* ================= MIDDLE PANEL ================= */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-700 p-4 flex flex-col h-full overflow-hidden rounded-2xl">
          {/* ===== MOBILE HEADER ===== */}
          <div className="flex items-center justify-between mb-2 lg:hidden">
            {/* THREADS SHEET */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  Threads
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="w-[300px] p-4 bg-white dark:bg-gray-800">
                <SheetHeader>
                  <SheetTitle>Threads</SheetTitle>
                </SheetHeader>

                <Input
                  placeholder="Search by email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="my-4"
                />

                <Table>
                  <TableBody>
                    {threads
                      .filter((t) =>
                        t.userEmail
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()),
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
                            className="cursor-pointer"
                          >
                            <TableCell className="flex gap-2">
                              <Image
                                src={
                                  agencyProfiles[thread.userEmail]?.logo ||
                                  "/assets/user.png"
                                }
                                alt="logo"
                                width={36}
                                height={36}
                                className="rounded-full"
                              />
                              <div className="truncate">
                                <p className="font-semibold truncate">
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
              </SheetContent>
            </Sheet>

            {/* NEW MESSAGE SHEET */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  New
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-[300px] p-4 bg-white dark:bg-gray-800">
                <SheetHeader>
                  <SheetTitle>New Message</SheetTitle>
                </SheetHeader>

                <NewMessageForm
                  allUsers={availableUsers}
                  agencyProfiles={agencyProfiles}
                  onSelectUser={(email) => {
                    setNewMessageUser(email);
                    setSelectedThread(null);
                  }}
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* ===== EMPTY STATE ===== */}
          {!selectedThread && !newMessageUser ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a thread or start a new message
            </div>
          ) : (
            <>
              {/* ===== HEADER ===== */}
              <div className="flex items-center gap-3 mb-3 p-2 border-b">
                <Image
                  src={
                    agencyProfiles[selectedThread?.userEmail || newMessageUser]
                      ?.logo || "/assets/user.png"
                  }
                  alt="user"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div>
                  <p className="font-semibold">
                    {agencyProfiles[selectedThread?.userEmail || newMessageUser]
                      ?.name ||
                      selectedThread?.userEmail ||
                      newMessageUser}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedThread?.userEmail || newMessageUser}
                  </p>
                </div>
              </div>

              {/* ===== MESSAGES ===== */}
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
                      }`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                          isAdminMsg
                            ? "bg-purple-600 text-white"
                            : isOwnMsg
                              ? "bg-gray-600 text-white"
                              : "bg-gray-200 text-black"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-xs text-gray-500 mt-1">
                        {timeAgo(msg.timestamp)} {isAdminMsg ? "(Admin)" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* ===== INPUT ===== */}
              <div className="flex items-center gap-2 pt-2 border-t">
                <Input
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={sending}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>

        {/* ================= RIGHT SIDEBAR (DESKTOP) ================= */}
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
