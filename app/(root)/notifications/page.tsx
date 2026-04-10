import NotificationTable from "../components/NotificationTable";
import {
  getAllNotifications,
  getNotificationsByAgency,
} from "@/lib/actions/notification.actions";
import { getUserContext } from "@/lib/actions/userContext.actions";
import { INotification } from "@/lib/database/models/notification.model";

type NotificationWithStatus = INotification & {
  userStatus: "Read" | "Unread";
};

const Page = async () => {
  // 🔑 One call enforces access rules and gives you user context
  const { email, adminStatus, adminCountry, myProfile } =
    await getUserContext("notifications");

  let notifications: NotificationWithStatus[] = [];

  if (adminStatus) {
    const allNotifications = await getAllNotifications();

    const filtered = adminCountry.length
      ? allNotifications.filter((n: INotification) =>
          adminCountry.includes(n.country),
        )
      : allNotifications;

    notifications = filtered.map((n: INotification) => {
      const readEntry = n.readBy?.find((r) => r.email === email);
      const status = readEntry?.status === "read" ? "Read" : "Unread";
      return { ...n, userStatus: status };
    });
  } else {
    const subAgents = myProfile?.subAgents || [];

    const myNotifications = await getNotificationsByAgency(email);
    const subAgentNotifications: INotification[] = [];

    for (const subAgentEmail of subAgents) {
      const subNotifs = await getNotificationsByAgency(subAgentEmail);
      if (subNotifs) subAgentNotifications.push(...subNotifs);
    }

    const merged = [...myNotifications, ...subAgentNotifications];

    // Avoid duplicates by _id
    const uniqueMap = new Map();
    for (const notif of merged) {
      uniqueMap.set(notif._id.toString(), notif);
    }

    notifications = Array.from(uniqueMap.values()).map((n) => {
      const readEntry = n.readBy?.find(
        (r: { email: string }) => r.email === email,
      );
      const status = readEntry?.status === "read" ? "Read" : "Unread";
      return { ...n, userStatus: status };
    });
  }

  return (
    <section className="m-4 p-4 bg-white dark:bg-gray-900 rounded-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4">
        <h3 className="h3-bold text-center sm:text-left">All Notifications</h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto my-8">
        <NotificationTable notifications={notifications} email={email} />
      </div>
    </section>
  );
};

export default Page;
