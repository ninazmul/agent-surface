"use client";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const NewMessageForm = ({
  allUsers,
  onSelectUser,
}: {
  allUsers: { email: string; name?: string }[];
  onSelectUser: (email: string) => void;
}) => {
  return (
    <div className="p-4 border rounded-2xl space-y-3 bg-gray-50 dark:bg-gray-900">
      <h3 className="text-lg font-semibold">Send New Message</h3>
      <Select onValueChange={onSelectUser} defaultValue="">
        <SelectTrigger className="w-full md:w-1/3">
          <SelectValue placeholder="Select a user" />
        </SelectTrigger>
        <SelectContent>
          {allUsers.map((user) => (
            <SelectItem key={user.email} value={user.email}>
              {user.name || user.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default NewMessageForm;
