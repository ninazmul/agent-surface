"use client";

import { useState, useEffect, useCallback } from "react";
import {
  appendMessageByEmail,
  deleteMessage,
  deleteSingleMessage,
  getAllMessages,
  getMessagesByEmail,
} from "@/lib/actions/message.actions";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessagesSquare, PencilRulerIcon, Send, Trash } from "lucide-react";
import { IMessage } from "@/lib/database/models/message.model";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  getAllProfiles,
  getProfileByEmail,
} from "@/lib/actions/profile.actions";
import { getAdminCountriesByEmail, isAdmin } from "@/lib/actions/admin.actions";
import NewMessageForm from "./NewMessageForm";
import Image from "next/image";
import { timeAgo } from "@/lib/utils";
import MessageForm from "./MessageForm";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const MessageTable = ({
  email,
  role,
  country,
}: {
  email: string;
  role: string;
  country: string[];
}) => {
  const router = useRouter();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [activeUserEmail, setActiveUserEmail] = useState<string | null>(null);
  const [agencyNames, setAgencyNames] = useState<Record<string, string>>({});
  const [agencyProfiles, setAgencyProfiles] = useState<
    Record<string, { name?: string; logo?: string }>
  >({});
  const [sending, setSending] = useState(false);
  const [selectedThread, setSelectedThread] = useState<IMessage | null>(null);
  const [newMessageUser, setNewMessageUser] = useState<string>("");
  const [allUsers, setAllUsers] = useState<{ email: string; name?: string }[]>(
    []
  );
  const [showLeftSheet, setShowLeftSheet] = useState(false);
  const [showRightSheet, setShowRightSheet] = useState(false);

  // Fetch all users for NewMessageForm
  const fetchAllUsers = useCallback(async () => {
    try {
      const profiles = await getAllProfiles();
      setAllUsers(profiles || []);
    } catch (err) {
      console.error("Failed to fetch all users", err);
    }
  }, []);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  // Fetch agency names (only missing emails)
  const fetchAgencyNames = useCallback(
    async (emails: string[]) => {
      const missingEmails = emails.filter((email) => !agencyNames[email]);
      if (!missingEmails.length) return;

      const nameMap: Record<string, string> = {};
      await Promise.all(
        missingEmails.map(async (email) => {
          try {
            const profile = await getProfileByEmail(email);
            if (profile?.name) nameMap[email] = profile.name;
          } catch (err) {
            console.error(`Failed to fetch profile for ${email}`, err);
          }
        })
      );
      setAgencyNames((prev) => ({ ...prev, ...nameMap }));
    },
    [agencyNames]
  );

  const fetchAgencyProfiles = useCallback(
    async (emails: string[]) => {
      const missing = emails.filter((e) => !agencyProfiles[e]);
      if (!missing.length) return;

      const map: Record<string, { name?: string; logo?: string }> = {};

      await Promise.all(
        missing.map(async (email) => {
          try {
            const profile = await getProfileByEmail(email);
            if (profile) {
              map[email] = {
                name: profile.name,
                logo: profile.logo, // <-- fetch logo
              };
            }
          } catch (err) {
            console.error(`Failed to fetch profile for ${email}`, err);
          }
        })
      );

      setAgencyProfiles((prev) => ({ ...prev, ...map }));
    },
    [agencyProfiles]
  );

  useEffect(() => {
    if (messages.length > 0) {
      const emails = messages.map((m) => m.userEmail);
      fetchAgencyProfiles(emails);
    }
  }, [messages, fetchAgencyProfiles]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      const adminStatus = await isAdmin(email);
      const adminCountry = await getAdminCountriesByEmail(email);
      let msgs: IMessage[] = [];

      if (adminStatus) {
        const allMessages = await getAllMessages();
        msgs =
          adminCountry.length > 0
            ? allMessages.filter(
                (m: IMessage) => !m.country || adminCountry.includes(m.country)
              )
            : allMessages;
      } else {
        msgs = (await getMessagesByEmail(email)) || [];
      }

      setMessages(msgs);
      const uniqueEmails = [...new Set(msgs.map((m) => m.userEmail))].filter(
        Boolean
      ) as string[];
      await fetchAgencyNames(uniqueEmails);
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  }, [email, fetchAgencyNames]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Reduced frequency
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleDeleteMessage = useCallback(
    async (id: string) => {
      if (role !== "admin") return;
      try {
        await deleteMessage(id);
        toast.success("Message deleted successfully");
        router.refresh();
      } catch {
        toast.error("Failed to delete message");
      } finally {
        setConfirmDeleteId(null);
      }
    },
    [role, router]
  );

  const handleDeleteSingleMessage = useCallback(
    async (threadId: string, messageId: string) => {
      if (role !== "admin") return;
      try {
        await deleteSingleMessage(threadId, messageId);
        toast.success("Message deleted");
        router.refresh();
      } catch {
        toast.error("Failed to delete message");
      }
    },
    [role, router]
  );

  const handleAppendMessage = useCallback(async () => {
    if (!activeUserEmail || !newMessageText.trim()) return;
    try {
      setSending(true);
      await appendMessageByEmail(activeUserEmail, {
        senderEmail: email,
        text: newMessageText,
        senderRole: role === "admin" ? "admin" : "user",
        country: "",
      });
      setNewMessageText("");
      toast.success("Reply sent");
      router.refresh();
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  }, [activeUserEmail, newMessageText, email, role, router]);

  return (
    <div className="space-y-6">
      <div className="flex h-[calc(100vh-10rem)] w-full lg:bg-white lg:dark:bg-gray-800 rounded-2xl overflow-hidden lg:p-4 gap-4">
        <div className="hidden lg:flex w-[320px] flex-shrink-0 bg-gray-100 dark:bg-gray-700 h-full overflow-y-auto p-4 space-y-4 rounded-2xl">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Messages</h3>
            <Input
              placeholder="Search by user email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl"
            />
          </div>
          <Table>
            <TableBody>
              {messages.map((message) => {
                const lastMsg =
                  message.messages.length > 0
                    ? message.messages[message.messages.length - 1].text
                    : null;

                return (
                  <TableRow
                    key={message._id.toString()}
                    onClick={() => setSelectedThread(message)}
                    className="hover:bg-purple-500 hover:text-white rounded-2xl border-none flex items-center justify-between"
                  >
                    <TableCell className="flex items-center space-x-2">
                      {agencyProfiles[message.userEmail]?.logo && (
                        <Image
                          src={
                            agencyProfiles[message.userEmail]?.logo ??
                            "/assets/user.png"
                          }
                          alt="logo"
                          width={80}
                          height={80}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="line-clamp-1 font-bold">
                          {agencyNames[message.userEmail] || "User Name"}
                        </p>
                        {agencyNames[message.userEmail] && lastMsg && (
                          <div className="text-xs max-w-[180px] truncate line-clamp-1">
                            {lastMsg || "No messages yet"}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="flex items-center space-x-2">
                      <div className="relative group w-fit cursor-default">
                        <span className="opacity-100 group-hover:opacity-0 transition-opacity">
                          ...
                        </span>

                        <span className="absolute left-0 top-0 opacity-0 group-hover:opacity-100 whitespace-nowrap text-black dark:text-white bg-white dark:bg-gray-900 p-1 rounded-md shadow transition-opacity z-10">
                          {timeAgo(message.updatedAt || message.createdAt)}
                        </span>
                      </div>
                      {role === "admin" && (
                        <Button
                          onClick={() =>
                            setConfirmDeleteId(message._id.toString())
                          }
                          variant={"ghost"}
                          size={"icon"}
                        >
                          <Trash className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="flex-1 bg-gray-100 dark:bg-gray-700 p-4 flex flex-col h-full overflow-hidden rounded-2xl">
          <div className="flex justify-between mb-2 lg:hidden">
            <Sheet open={showLeftSheet} onOpenChange={setShowLeftSheet}>
              <SheetTrigger asChild>
                <MessagesSquare />
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[320px] bg-white dark:bg-gray-800"
              >
                <SheetHeader>
                  <SheetTitle className="text-lg font-semibold mb-2">
                    Messages
                  </SheetTitle>
                </SheetHeader>
                {/* Move your left sidebar code here */}
                <div className="space-y-4">
                  <Input
                    placeholder="Search by user email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-2xl"
                  />
                  <Table>
                    <TableBody>
                      {messages.map((message) => {
                        const lastMsg =
                          message.messages.length > 0
                            ? message.messages[message.messages.length - 1].text
                            : null;

                        return (
                          <TableRow
                            key={message._id.toString()}
                            onClick={() => setSelectedThread(message)}
                            className="hover:bg-purple-500 hover:text-white rounded-2xl border-none flex items-center justify-between"
                          >
                            <TableCell className="flex items-center space-x-2">
                              {agencyProfiles[message.userEmail]?.logo && (
                                <Image
                                  src={
                                    agencyProfiles[message.userEmail]?.logo ??
                                    "/assets/user.png"
                                  }
                                  alt="logo"
                                  width={80}
                                  height={80}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              )}
                              <div>
                                <p className="line-clamp-1 font-bold">
                                  {agencyNames[message.userEmail] ||
                                    "User Name"}
                                </p>
                                {agencyNames[message.userEmail] && lastMsg && (
                                  <div className="text-xs max-w-[180px] truncate line-clamp-1">
                                    {lastMsg || "No messages yet"}
                                  </div>
                                )}
                              </div>
                            </TableCell>

                            <TableCell className="flex items-center space-x-2">
                              <div className="relative group w-fit cursor-default">
                                <span className="opacity-100 group-hover:opacity-0 transition-opacity">
                                  ...
                                </span>

                                <span className="absolute left-0 top-0 opacity-0 group-hover:opacity-100 whitespace-nowrap text-black dark:text-white bg-white dark:bg-gray-900 p-1 rounded-md shadow transition-opacity z-10">
                                  {timeAgo(
                                    message.updatedAt || message.createdAt
                                  )}
                                </span>
                              </div>
                              {role === "admin" && (
                                <Button
                                  onClick={() =>
                                    setConfirmDeleteId(message._id.toString())
                                  }
                                  variant={"ghost"}
                                  size={"icon"}
                                >
                                  <Trash className="w-4 h-4 text-red-600" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </SheetContent>
            </Sheet>

            <Sheet open={showRightSheet} onOpenChange={setShowRightSheet}>
              <SheetTrigger asChild>
                <PencilRulerIcon />
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[320px] bg-white dark:bg-gray-800"
              >
                <SheetHeader>
                  <SheetTitle className="text-lg font-semibold mb-2">
                    New Message
                  </SheetTitle>
                </SheetHeader>
                <NewMessageForm
                  allUsers={allUsers}
                  agencyProfiles={agencyProfiles}
                  onSelectUser={(email) => {
                    setNewMessageUser(email);
                    setSelectedThread(null);
                    setShowRightSheet(false);
                  }}
                />
              </SheetContent>
            </Sheet>
          </div>

          {!selectedThread && !newMessageUser ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a profile to view messages or send a new message
            </div>
          ) : selectedThread ? (
            <>
              <div className="flex items-center gap-3 mb-4 border-b pb-2">
                {agencyProfiles[selectedThread.userEmail]?.logo && (
                  <Image
                    src={
                      agencyProfiles[selectedThread.userEmail]?.logo ??
                      "/assets/user.png"
                    }
                    alt="logo"
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                )}
                <div className="font-semibold text-lg">
                  {agencyNames[selectedThread.userEmail] ||
                    selectedThread.userEmail}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {selectedThread.messages.map((msg) => {
                  const isAdminMsg = msg.senderRole === "admin";
                  return (
                    <div
                      key={msg._id.toString()}
                      className={`flex flex-col ${
                        isAdminMsg ? "items-end" : "items-start"
                      } space-y-1`} // space between bubble and timestamp
                    >
                      {/* Message bubble */}
                      <div
                        className={`group relative max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm ${
                          isAdminMsg
                            ? "bg-gray-600 text-white rounded-br-none"
                            : "bg-gray-200 text-black rounded-bl-none"
                        }`}
                      >
                        <p>{msg.text}</p>

                        {/* Admin-only delete button */}
                        {role === "admin" && (
                          <button
                            onClick={() =>
                              handleDeleteSingleMessage(
                                selectedThread._id.toString(),
                                msg._id.toString()
                              )
                            }
                            className={`absolute -top-1 ${
                              isAdminMsg ? "-left-1" : "-right-1"
                            } bg-red-500 text-white rounded-full p-1 hover:bg-red-600 
                            transition opacity-0 group-hover:opacity-100`}
                          >
                            <Trash size={14} />
                          </button>
                        )}
                      </div>

                      {/* Timestamp outside the bubble */}
                      <span
                        className={`text-xs text-gray-500 dark:text-gray-400 ${
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
                  value={
                    activeUserEmail === selectedThread.userEmail
                      ? newMessageText
                      : ""
                  }
                  onChange={(e) => {
                    setActiveUserEmail(selectedThread.userEmail);
                    setNewMessageText(e.target.value);
                  }}
                  placeholder="Type a message..."
                  onKeyDown={async (e) =>
                    e.key === "Enter" && (await handleAppendMessage())
                  }
                />
                <Button
                  size="sm"
                  onClick={handleAppendMessage}
                  disabled={sending}
                >
                  <Send /> {sending ? "..." : "Send"}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <MessageForm
                userEmail={newMessageUser}
                senderEmail={email}
                country={country?.[0] || ""}
                senderRole="admin"
                type="Create"
              />
            </div>
          )}
        </div>
        <div className="hidden lg:flex w-[320px] flex-shrink-0 bg-gray-100 dark:bg-gray-700 h-full overflow-y-auto p-4 rounded-2xl">
          <NewMessageForm
            allUsers={allUsers}
            agencyProfiles={agencyProfiles}
            onSelectUser={(email) => {
              setNewMessageUser(email);
              setSelectedThread(null);
            }}
          />
        </div>
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white text-black p-6 rounded-md space-y-4">
            <p>Are you sure you want to delete this message?</p>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setConfirmDeleteId(null)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteMessage(confirmDeleteId)}
                variant="destructive"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageTable;
