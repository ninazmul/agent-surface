"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { getAllProfiles } from "@/lib/actions/profile.actions";
import MessageForm from "./MessageForm";

interface NewMessageFormProps {
  senderEmail: string;
  senderRole: "user" | "admin";
  country?: string;
}

const NewMessageForm = ({
  senderEmail,
  senderRole,
  country,
}: NewMessageFormProps) => {
  const [allUsers, setAllUsers] = useState<{ email: string; name?: string }[]>(
    []
  );
  const [selectedUser, setSelectedUser] = useState<string>(""); // enforce string, not null

  const fetchAllUsers = useCallback(async () => {
    try {
      const profiles = await getAllProfiles();
      setAllUsers(profiles || []);
    } catch (err) {
      console.error("Failed to fetch all users", err, selectedUser);
    }
  }, [selectedUser]);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  return (
    <div className="p-4 border rounded-2xl space-y-3 bg-gray-50 dark:bg-gray-900">
      <h3 className="text-lg font-semibold">Send New Message</h3>
      <div className="flex flex-col gap-2">
        <Select
          value={selectedUser}
          onValueChange={(val) => setSelectedUser(val)}
        >
          <SelectTrigger className="w-full md:w-1/3">
            <SelectValue placeholder="Select a user" />
          </SelectTrigger>
          <SelectContent>
            {allUsers.map((user) => (
              <SelectItem key={user.email} value={user.email}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedUser && (
          <div className="flex-1">
            <MessageForm
              userEmail={selectedUser}
              senderEmail={senderEmail}
              country={country || ""}
              senderRole={senderRole}
              type="Create"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NewMessageForm;
