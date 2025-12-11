"use server";

import { connectToDatabase } from "../database";
import { getProfileByEmail } from "./profile.actions";
import { getAdminCountriesByEmail, isAdmin } from "./admin.actions";
import Message, {
  IChatMessage,
  IMessage,
  Role,
} from "../database/models/message.model";
import { Types } from "mongoose";
import { handleError } from "../utils";

// ---------- CREATE OR APPEND MESSAGE ----------
export const createOrAppendMessage = async ({
  userEmail,
  senderEmail,
  senderRole,
  text,
  country,
}: {
  userEmail: string;
  senderEmail: string;
  senderRole: Role;
  text: string;
  country?: string;
}): Promise<IMessage> => {
  try {
    await connectToDatabase();

    const chatMessage: IChatMessage = {
      _id: new Types.ObjectId(),
      senderEmail,
      senderRole,
      text,
      timestamp: new Date(),
      read: senderEmail === userEmail,
      country,
    };

    const thread = await Message.findOne({ userEmail });

    if (thread) {
      if (!thread.country && country) thread.country = country;
      thread.messages.push(chatMessage);
      await thread.save();
      return thread.toObject();
    } else {
      const newThread = await Message.create({
        userEmail,
        country,
        messages: [chatMessage],
      });
      return newThread.toObject();
    }
  } catch (err) {
    console.error("createOrAppendMessage error:", err);
    throw new Error("Failed to create or append message");
  }
};

// ---------- GET MESSAGES BASED ON ROLE ----------
export const getMessagesForUser = async (
  email: string,
  role: Role
): Promise<IMessage[]> => {
  try {
    await connectToDatabase();
    let threads: IMessage[] = [];
    const allMessages = (await Message.find()
      .sort({ updatedAt: -1 })
      .lean()) as unknown as IMessage[];

    if (role === "Admin") {
      const adminCountries = await getAdminCountriesByEmail(email);
      threads = adminCountries.length
        ? allMessages.filter(
            (m) => !m.country || adminCountries.includes(m.country)
          )
        : allMessages;
    } else if (role === "Agent") {
      const profile = await getProfileByEmail(email);
      const subAgents = profile?.subAgents || [];

      threads = allMessages.filter(
        (m) =>
          m.userEmail === profile?.email || // thread belongs to agent
          subAgents.includes(m.userEmail) || // thread belongs to sub-agent
          m.messages.some(
            (msg) => msg.senderRole === "Admin" || msg.senderEmail === email
          ) // admin or me sent message
      );
    } else if (role === "Sub Agent") {
      const profile = await getProfileByEmail(email);
      if (!profile?.agentEmail) return [];

      threads = allMessages.filter(
        (m) =>
          m.userEmail === profile.agentEmail || // agent thread
          m.messages.some((msg) => msg.senderEmail === email)
      );
    } else if (role === "Student") {
      threads = allMessages.filter((m) =>
        m.messages.some(
          (msg) => msg.senderRole === "Admin" || msg.senderEmail === email
        )
      );
    }

    return threads;
  } catch (err) {
    console.error("getMessagesForUser error:", err);
    throw new Error("Failed to fetch messages");
  }
};

// ---------- DELETE MESSAGE THREAD ----------
export const deleteMessageThread = async (threadId: string) => {
  try {
    await connectToDatabase();
    const deleted = await Message.findByIdAndDelete(threadId);
    if (!deleted) throw new Error("Thread not found");
    return { message: "Thread deleted successfully" };
  } catch (err) {
    console.error("deleteMessageThread error:", err);
    throw new Error("Failed to delete thread");
  }
};

// ---------- DELETE SINGLE MESSAGE ----------
export const deleteSingleMessage = async (
  threadId: string,
  messageId: string
) => {
  try {
    await connectToDatabase();
    const updated = await Message.findByIdAndUpdate(
      threadId,
      { $pull: { messages: { _id: messageId } } },
      { new: true }
    );
    if (!updated) throw new Error("Thread or message not found");
    return updated.toObject();
  } catch (err) {
    console.error("deleteSingleMessage error:", err);
    throw new Error("Failed to delete single message");
  }
};

// ====== UNREAD SUMMARY FOR ADMIN ======
export const getUnreadSummary = async (adminEmail: string) => {
  try {
    await connectToDatabase();

    const isCurrentAdmin = await isAdmin(adminEmail);
    if (!isCurrentAdmin) {
      throw new Error("User is not an admin");
    }

    const allowedCountries = await getAdminCountriesByEmail(adminEmail);

    const allThreads = await Message.find().lean();

    let totalUnread = 0;

    const filteredThreads = allowedCountries.length
      ? allThreads.filter((thread) => allowedCountries.includes(thread.country))
      : allThreads;

    const unreadCounts = filteredThreads.map((thread) => {
      const messages: IChatMessage[] = thread.messages || [];

      // Find the last admin message timestamp
      const lastAdminMsg = [...messages]
        .reverse()
        .find((msg) => msg.senderRole === "Admin");

      const lastAdminTime = lastAdminMsg
        ? new Date(lastAdminMsg.timestamp)
        : null;

      const unreadMessages = messages.filter((msg) => {
        // Only user messages after last admin reply are unread
        const isUserMsg = msg.senderRole !== "Admin"; // any non-admin message
        const isUnread =
          !lastAdminTime || new Date(msg.timestamp) > lastAdminTime;

        return isUserMsg && isUnread;
      });

      totalUnread += unreadMessages.length;

      return {
        userEmail: thread.userEmail,
        unreadCount: unreadMessages.length,
      };
    });

    return {
      totalUnread,
      unreadCounts,
    };
  } catch (error) {
    handleError(error);
    return { totalUnread: 0, unreadCounts: [] };
  }
};
