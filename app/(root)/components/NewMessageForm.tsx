"use client";

import Image from "next/image";

const NewMessageForm = ({
  allUsers,
  onSelectUser,
  agencyProfiles,
}: {
  allUsers: { email: string; name?: string }[];
  onSelectUser: (email: string) => void;
  agencyProfiles: Record<string, { name?: string; logo?: string }>;
}) => {
  return (
    <div className="space-y-4 h-full overflow-y-auto">
      <h3 className="text-lg font-semibold">Send New Message</h3>
      <div className="space-y-2 mt-2">
        {allUsers.map((user) => (
          <div
            key={user.email}
            onClick={() => onSelectUser(user.email)}
            className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-purple-500 hover:text-white transition"
          >
            {agencyProfiles[user.email]?.logo ? (
              <Image
                src={agencyProfiles[user.email]?.logo ?? "/assets/user.png"}
                alt={user.name || user.email}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full" />
            )}
            <div className="font-medium text-sm line-clamp-1">
              {user.name || user.email}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewMessageForm;
