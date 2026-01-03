"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Profile from "../database/models/profile.model";
import { ProfileParams } from "@/types";
import { revalidatePath } from "next/cache";

// ====== CREATE PROFILE
export const createProfile = async (params: ProfileParams) => {
  try {
    await connectToDatabase();

    const newProfile = await Profile.create(params);

    revalidatePath("/profile");

    return JSON.parse(JSON.stringify(newProfile));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET ALL PROFILES
export const getAllProfiles = async () => {
  try {
    await connectToDatabase();

    const profiles = await Profile.find().sort({ createdAt: -1 }).lean();

    return JSON.parse(JSON.stringify(profiles));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET PROFILE BY ID
export const getProfileById = async (profileId: string) => {
  try {
    await connectToDatabase();

    const profile = await Profile.findById(profileId).lean();

    if (!profile) {
      throw new Error("Profile not found");
    }

    return JSON.parse(JSON.stringify(profile));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET PROFILE BY EMAIL (SINGLE)
export const getProfileByEmail = async (email: string) => {
  try {
    await connectToDatabase();

    const profile = await Profile.findOne({ email }).lean();

    if (!profile) {
      console.log(`No profile found for email: ${email}`);
      return null;
    }

    return JSON.parse(JSON.stringify(profile));
  } catch (error) {
    console.error("Error fetching profile by email:", error);
    handleError(error);
  }
};

// ====== GET PROFILES BY EMAIL
export const getProfilesByEmail = async (email: string) => {

  try {
    await connectToDatabase();

    const profiles = await Profile.find({ email }).lean();

    if (!profiles || profiles.length === 0) {
      console.log(`No profiles found for email: ${email}`);
      return null;
    }

    return JSON.parse(JSON.stringify(profiles));
  } catch (error) {
    console.error("Error fetching profiles by email:", error);
    handleError(error);
  }
};

export const getSubAgentsByEmail = async (email: string) => {
  try {
    const parentProfile = await Profile.findOne({ email });

    if (!parentProfile || !parentProfile.subAgents || parentProfile.subAgents.length === 0) {
      return [];
    }

    const subAgentProfiles = await Profile.find({
      email: { $in: parentProfile.subAgents },
    });

    return subAgentProfiles;
  } catch (error) {
    console.error("Error fetching sub agents:", error);
    return [];
  }
};

// ====== UPDATE PROFILE
export const updateProfile = async (
  profileId: string,
  updateData: Partial<ProfileParams>
) => {
  try {
    await connectToDatabase();

    const updatedProfile = await Profile.findByIdAndUpdate(
      profileId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      throw new Error("Profile not found");
    }

    revalidatePath("/profile");

    return JSON.parse(JSON.stringify(updatedProfile));
  } catch (error) {
    handleError(error);
  }
};

// ====== DELETE PROFILE
export const deleteProfile = async (profileId: string) => {
  try {
    await connectToDatabase();

    const deletedProfile = await Profile.findByIdAndDelete(
      profileId
    );

    if (!deletedProfile) {
      throw new Error("Profile not found");
    }

    revalidatePath("/profile");

    return { message: "Profile deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};

// ====== CHECK PROFILE EXISTENCE BY EMAIL
export const isRegisteredByEmail = async (email: string): Promise<boolean> => {

  try {
    await connectToDatabase();

    // Check if a profile exists with a status other than "pending" using email
    const profile = await Profile.findOne({
      email,
      status: { $ne: "pending" }, // Exclude "pending" status
    });

    if (!profile) {
      console.log(`No non-pending profile found for email: ${email}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking profile status by email:", error);
    handleError(error);
    return false;
  }
};

// ====== CHECK SUBMIT PROFILE EXISTENCE BY EMAIL
export const isSubmittedByEmail = async (email: string): Promise<boolean> => {

  try {
    await connectToDatabase();

    const submitProfile = await Profile.findOne({ email });

    if (!submitProfile) {
      console.log(`No profile found for email: ${email}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking profile status by email:", error);
    handleError(error);
    return false;
  }
};

// ====== ADD SUBAGENT TO PROFILE
export const addSubAgentByEmailToProfile = async (
  agentEmail: string,
  subAgentEmail: string
) => {
  try {
    await connectToDatabase();

    const agentProfile = await Profile.findOne({ email: agentEmail });
    if (!agentProfile) throw new Error("Agent profile not found");

    // Ensure subAgents is initialized as an array
    const subAgentsSet = new Set(agentProfile.subAgents || []);
    subAgentsSet.add(subAgentEmail);

    agentProfile.subAgents = Array.from(subAgentsSet);
    await agentProfile.save();

    return JSON.parse(JSON.stringify(agentProfile));
  } catch (error) {
    handleError(error);
  }
};


export const uploadSignatureDocument = async (
  profileId: string,
  signatureDocument: string
) => {
  try {
    await connectToDatabase();

    const profile = await Profile.findByIdAndUpdate(
      profileId,
      { signatureDocument },
      { new: true, runValidators: true }
    );

    if (!profile) {
      throw new Error("Profile not found");
    }

    revalidatePath("/profile");

    return JSON.parse(JSON.stringify(profile));
  } catch (error) {
    handleError(error);
  }
};