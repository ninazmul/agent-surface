"use server";

import { connectToDatabase } from "@/lib/database";
import User from "@/lib/database/models/user.model";
import { handleError } from "@/lib/utils";

import { CreateUserParams, UpdateUserParams } from "@/types";

export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();

    const newUser = await User.create(user);
    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    handleError(error);
  }
}

export async function getAllUsers() {
  try {
    await connectToDatabase();

    const users = await User.find({});
    return JSON.parse(JSON.stringify(users));
  } catch (error) {
    handleError(error);
  }
}

export async function getUserById(userId?: string) {
  try {
    await connectToDatabase();

    const user = await User.findById(userId);

    if (!user) return false;
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}

// Get a user by their clerkId (with role included)
export async function getUserByClerkId(clerkId: string) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId }).select("role");

    if (!user) throw new Error("User not found");
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}

export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
      new: true,
    });

    if (!updatedUser) throw new Error("User update failed");
    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}

export async function deleteUser(userId: string) {
  try {
    await connectToDatabase();

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) throw new Error("User not found");

    return JSON.parse(JSON.stringify(deletedUser));
  } catch (error) {
    handleError(error);
  }
}

export async function getUserEmailById(userId?: string) {
  try {
    await connectToDatabase();

    const user = await User.findById(userId).select("email");

    if (!user) {
      return false;
    }
    return user.email;
  } catch (error) {
    handleError(error);
  }
}
