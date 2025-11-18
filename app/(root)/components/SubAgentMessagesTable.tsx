"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { IMessage } from "@/lib/database/models/message.model";
import { getMessagesOfSubAgents } from "@/lib/actions/message.actions";
import { getProfileByEmail } from "@/lib/actions/profile.actions";

interface SubAgentMessagesTableProps {
  email: string;
}

const SubAgentMessagesTable: React.FC<SubAgentMessagesTableProps> = ({
  email,
}) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [agencyNames, setAgencyNames] = useState<Record<string, string>>({});

  // Fetch messages and agency names
  const fetchData = useCallback(async () => {
    try {
      const subAgentMsgs = await getMessagesOfSubAgents(email);
      setMessages(subAgentMsgs || []);

      const uniqueEmails = Array.from(
        new Set(subAgentMsgs.map((msg: IMessage) => msg.userEmail))
      ).filter((e): e is string => typeof e === "string"); // <-- type assertion

      const nameMap: Record<string, string> = {};
      await Promise.all(
        uniqueEmails.map(async (email) => {
          const profile = await getProfileByEmail(email);
          if (profile?.name) nameMap[email] = profile.name;
        })
      );
      setAgencyNames(nameMap);
    } catch (err) {
      console.error("Failed to fetch sub-agent messages", err);
    }
  }, [email]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter messages based on search query
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const query = searchQuery.toLowerCase();
    return messages.filter((msg) =>
      msg.userEmail.toLowerCase().includes(query)
    );
  }, [messages, searchQuery]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Sub-Agent Messages</h2>
      <Input
        placeholder="Search by sub-agent email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full md:w-1/2 rounded-2xl"
      />

      <div className="overflow-x-auto rounded-2xl bg-blue-50 dark:bg-gray-800 scrollbar-hide">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMessages.map((msg, i) => (
              <TableRow
                key={String(msg._id.toString())}
                className="hover:bg-blue-100 dark:hover:bg-gray-800"
              >
                <TableCell>{i + 1}</TableCell>
                <TableCell>
                  <div>{agencyNames[msg.userEmail] || "Unknown"}</div>
                  <div className="text-xs text-muted-foreground">
                    {msg.userEmail}
                  </div>
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
                      {Array.isArray(msg.messages) &&
                      msg.messages.length > 0 ? (
                        msg.messages.map((m) => (
                          <div
                            key={m._id.toString()}
                            className={`flex ${
                              m.senderRole === "admin"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[75%] px-4 py-2 rounded-lg shadow-sm text-sm relative ${
                                m.senderRole === "admin"
                                  ? "bg-blue-500 text-white rounded-br-none"
                                  : "bg-gray-200 text-black rounded-bl-none"
                              }`}
                            >
                              <p>{m.text}</p>
                              <span className="text-xs text-gray-600 mt-1 block text-right">
                                {new Date(m.timestamp).toLocaleString("en-GB")}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">
                          No messages found
                        </p>
                      )}
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>
                  {new Date(msg.createdAt).toLocaleDateString("en-GB")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SubAgentMessagesTable;
