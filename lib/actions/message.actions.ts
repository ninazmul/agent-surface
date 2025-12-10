"use server";

import { connectToDatabase } from "../database";
import { getProfileByEmail } from "./profile.actions";
import { getAdminCountriesByEmail } from "./admin.actions";
import Message, {
  IChatMessage,
  IMessage,
  Role,
} from "../database/models/message.model";
import { Types } from "mongoose";

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

    if (role === "Admin") {
      const adminCountries = await getAdminCountriesByEmail(email);
      const allMessages = (await Message.find()
        .sort({ updatedAt: -1 })
        .lean()) as unknown as IMessage[];

      threads = adminCountries.length
        ? allMessages.filter(
            (m) => !m.country || adminCountries.includes(m.country)
          )
        : allMessages;
    } else if (role === "Agent") {
      const profile = await getProfileByEmail(email);
      const subAgents = profile?.subAgents || [];
      const allMessages = (await Message.find()
        .sort({ updatedAt: -1 })
        .lean()) as unknown as IMessage[];

      threads = allMessages.filter(
        (m) =>
          m.userEmail === profile?.email ||
          subAgents.includes(m.userEmail) ||
          m.messages.some((msg) => msg.senderRole === "Admin")
      );
    } else if (role === "Sub Agent") {
      const profile = await getProfileByEmail(email);
      if (!profile?.agentEmail) return [];
      const agentThread = await Message.findOne({
        userEmail: profile.agentEmail,
      })
        .sort({ updatedAt: -1 })
        .lean();

      threads = agentThread ? ([agentThread] as unknown as IMessage[]) : [];
    } else if (role === "Student") {
      const allMessages = (await Message.find()
        .sort({ updatedAt: -1 })
        .lean()) as unknown as IMessage[];

      threads = allMessages.filter((m) =>
        m.messages.some((msg) => msg.senderRole === "Admin")
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
