"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Message, { IChatMessage } from "../database/models/message.model";
import { MessageParams } from "@/types";
import {
  getAdminCountriesByEmail,
  isAdmin,
} from "./admin.actions";
import { getProfileByEmail } from "./profile.actions";

// ====== CREATE OR APPEND MESSAGE
export const createMessage = async (params: MessageParams) => {
  try {
    await connectToDatabase();

    const { userEmail, senderEmail, senderRole, text, country } = params;

    const newChatMessage = {
      senderEmail,
      senderRole,
      text,
      timestamp: new Date(),
      read: senderEmail === userEmail ? true : false,
    };

    const existingThread = await Message.findOne({ userEmail });

    if (existingThread) {
      if (!existingThread.country && country) {
        existingThread.country = country;
      }
      existingThread.messages.push(newChatMessage);
      await existingThread.save();
      return JSON.parse(JSON.stringify(existingThread));
    } else {
      const newThread = await Message.create({
        userEmail,
        country,
        messages: [newChatMessage],
      });
      return JSON.parse(JSON.stringify(newThread));
    }
  } catch (error) {
    handleError(error);
  }
};

// ====== GET ALL CONVERSATIONS
export const getAllMessages = async () => {
  try {
    await connectToDatabase();
    const messages = await Message.find().sort({ updatedAt: -1 }).lean();
    return JSON.parse(JSON.stringify(messages));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET CONVERSATION BY USER EMAIL
export const getMessagesByEmail = async (email: string) => {
  try {
    await connectToDatabase();
    const conversation = await Message.findOne({ userEmail: email }).lean();

    if (!conversation) {
      console.warn(`No conversation found for email: ${email}`);
      return null;
    }

    return JSON.parse(JSON.stringify(conversation));
  } catch (error) {
    console.error("Error fetching messages by email:", error);
    handleError(error);
  }
};

// ====== UPDATE SPECIFIC MESSAGE IN THREAD
export const updateMessage = async (
  messageId: string,
  updateData: Partial<MessageParams>
) => {
  try {
    await connectToDatabase();

    const updated = await Message.findOneAndUpdate(
      { "messages._id": messageId },
      {
        $set: {
          "messages.$.text": updateData.text,
          "messages.$.timestamp": new Date(),
        },
      },
      { new: true }
    );

    if (!updated) throw new Error("Message not found");

    return JSON.parse(JSON.stringify(updated));
  } catch (error) {
    handleError(error);
  }
};

// ====== APPEND MESSAGE TO USER CONVERSATION
export const appendMessageByEmail = async (
  email: string,
  messageData: Omit<MessageParams, "userEmail">
) => {
  try {
    await connectToDatabase();

    const conversation = await Message.findOne({ userEmail: email });
    if (!conversation) throw new Error(`No conversation for: ${email}`);

    const newMessage = {
      ...messageData,
      timestamp: new Date(),
    };

    conversation.messages.push(newMessage);
    await conversation.save();

    return JSON.parse(JSON.stringify(conversation));
  } catch (error) {
    handleError(error);
  }
};

// ====== DELETE ENTIRE THREAD
export const deleteMessage = async (messageId: string) => {
  try {
    await connectToDatabase();

    const deleted = await Message.findByIdAndDelete(messageId);
    if (!deleted) throw new Error("Message thread not found");

    return { message: "Conversation deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};

// ====== DELETE SINGLE MESSAGE IN THREAD
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

    return JSON.parse(JSON.stringify(updated));
  } catch (error) {
    handleError(error);
  }
};

// ====== UNREAD SUMMARY (for admin)
export const getUnreadSummary = async (adminEmail: string) => {
  try {
    await connectToDatabase();

    const isCurrentAdmin = await isAdmin(adminEmail);
    const allowedCountries = isCurrentAdmin
      ? await getAdminCountriesByEmail(adminEmail)
      : [];

    const allThreads = await Message.find();

    let totalUnread = 0;

    const filteredThreads = isCurrentAdmin
      ? allowedCountries.length === 0
        ? allThreads
        : allThreads.filter((thread) =>
            allowedCountries.includes(thread.country)
          )
      : [];

    const unreadCounts = filteredThreads.map((thread) => {
      const messages = thread.messages || [];

      let lastAdminTime: Date | null = null;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].senderRole === "admin") {
          lastAdminTime = new Date(messages[i].timestamp);
          break;
        }
      }

      const unreadMessages = messages.filter((msg: IChatMessage) => {
        return (
          msg.senderRole === "user" &&
          (!lastAdminTime || new Date(msg.timestamp) > lastAdminTime)
        );
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
  }
};

// ====== GET MESSAGES FOR SUB-AGENTS OF USER
export const getMessagesOfSubAgents = async (email: string) => {
  try {
    await connectToDatabase();

    const profile = await getProfileByEmail(email);

    if (!profile || !profile.subAgents || profile.subAgents.length === 0) {
      return [];
    }

    const messages = await Message.find({
      userEmail: { $in: profile.subAgents },
    }).sort({ updatedAt: -1 });

    return JSON.parse(JSON.stringify(messages));
  } catch (error) {
    console.error("Error fetching sub-agent messages:", error);
    return [];
  }
};
