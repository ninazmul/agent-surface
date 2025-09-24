"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  appendMessageByEmail,
  deleteMessage,
  deleteSingleMessage,
  getAllMessages,
  getMessagesByEmail,
} from "@/lib/actions/message.actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash, SortAsc, SortDesc } from "lucide-react";
import { IMessage } from "@/lib/database/models/message.model";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getProfileByEmail } from "@/lib/actions/profile.actions";
import { getAdminCountriesByEmail, isAdmin } from "@/lib/actions/admin.actions";
import NewMessageForm from "./NewMessageForm";

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
  const [sortKey, setSortKey] = useState<"userEmail" | "createdAt" | null>(
    null
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [activeUserEmail, setActiveUserEmail] = useState<string | null>(null);
  const [agencyNames, setAgencyNames] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

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

  // Sorting and filtering
  const filteredMessages = useMemo(() => {
    const filtered = messages.filter((msg) =>
      msg.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (sortKey) {
      filtered.sort((a, b) => {
        if (sortKey === "createdAt") {
          return sortOrder === "asc"
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else {
          return sortOrder === "asc"
            ? a.userEmail.toLowerCase().localeCompare(b.userEmail.toLowerCase())
            : b.userEmail
                .toLowerCase()
                .localeCompare(a.userEmail.toLowerCase());
        }
      });
    }
    return filtered;
  }, [messages, searchQuery, sortKey, sortOrder]);

  const paginatedMessages = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMessages.slice(start, start + itemsPerPage);
  }, [filteredMessages, currentPage, itemsPerPage]);

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

  const handleSort = useCallback(
    (key: "userEmail" | "createdAt") => {
      if (sortKey === key) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
      else {
        setSortKey(key);
        setSortOrder("asc");
      }
    },
    [sortKey]
  );

  return (
    <div className="space-y-4">
      <NewMessageForm
        senderEmail={email}
        senderRole="admin"
        country={country?.[0] || ""}
      />
      <Input
        placeholder="Search by user email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 w-full md:w-1/2 lg:w-1/3 rounded-2xl"
      />

      <div className="overflow-x-auto rounded-2xl bg-blue-50 dark:bg-gray-800 scrollbar-hide">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => handleSort("userEmail")}
                >
                  Agency{" "}
                  {sortKey === "userEmail" &&
                    (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
                </div>
              </TableHead>
              <TableHead>Messages</TableHead>
              <TableHead>
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => handleSort("createdAt")}
                >
                  Date{" "}
                  {sortKey === "createdAt" &&
                    (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedMessages.map((message, index) => (
              <TableRow key={message._id}>
                <TableCell>
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell>
                  {agencyNames[message.userEmail]}
                  {agencyNames[message.userEmail] && (
                    <div className="text-xs text-muted-foreground">
                      {message.userEmail}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="px-3 py-1.5 text-sm font-medium text-blue-500 hover:text-blue-600 border border-blue-500 hover:bg-blue-200 transition-all rounded-full rounded-br-none"
                      >
                        View Messages
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="max-w-md max-h-72 overflow-hidden text-sm">
                      <div className="overflow-y-auto flex-1 space-y-3 pr-1">
                        {message.messages.map((msg) => {
                          const isAdminMsg = msg.senderRole === "admin";
                          return (
                            <div
                              key={msg._id}
                              className={`flex ${
                                isAdminMsg ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`group relative max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm ${
                                  isAdminMsg
                                    ? "bg-blue-500 text-white rounded-br-none"
                                    : "bg-gray-200 text-black rounded-bl-none"
                                }`}
                              >
                                <p>{msg.text}</p>
                                <span className="text-xs text-gray-600 mt-1 block text-right">
                                  {new Date(msg.timestamp).toLocaleString(
                                    "en-GB"
                                  )}
                                </span>

                                {role === "admin" && (
                                  <button
                                    onClick={() =>
                                      handleDeleteSingleMessage(
                                        message._id,
                                        msg._id
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
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Input
                          value={
                            activeUserEmail === message.userEmail
                              ? newMessageText
                              : ""
                          }
                          onChange={(e) => {
                            setActiveUserEmail(message.userEmail);
                            setNewMessageText(e.target.value);
                          }}
                          placeholder="Type a message..."
                          className="flex-1"
                          onKeyDown={async (e) =>
                            e.key === "Enter" && (await handleAppendMessage())
                          }
                        />
                        <Button
                          size="sm"
                          onClick={handleAppendMessage}
                          disabled={sending}
                        >
                          {sending ? (
                            <svg
                              className="animate-spin h-4 w-4 text-white mx-auto"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8z"
                              ></path>
                            </svg>
                          ) : (
                            "Send"
                          )}
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>
                  {new Date(
                    message.updatedAt || message.createdAt
                  ).toLocaleDateString("en-GB")}
                </TableCell>
                <TableCell className="flex items-center space-x-2">
                  {role === "admin" && (
                    <Button
                      onClick={() => setConfirmDeleteId(message._id)}
                      variant="outline"
                      className="text-red-500"
                    >
                      <Trash />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-muted-foreground">
          Showing{" "}
          {Math.min(itemsPerPage * currentPage, filteredMessages.length)} of{" "}
          {filteredMessages.length} messages
        </span>
        <div className="flex items-center space-x-2">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            size="sm"
            className="rounded-2xl"
          >
            Previous
          </Button>
          <Button
            disabled={
              currentPage === Math.ceil(filteredMessages.length / itemsPerPage)
            }
            onClick={() => setCurrentPage((p) => p + 1)}
            size="sm"
            className="rounded-2xl"
          >
            Next
          </Button>
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
