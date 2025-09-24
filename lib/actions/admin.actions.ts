"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Admin from "../database/models/admin.model";
import { AdminParams } from "@/types";

// ====== CREATE ADMIN
export const createAdmin = async (params: AdminParams) => {
  try {
    await connectToDatabase();
    const newAdmin = await Admin.create(params);
    return JSON.parse(JSON.stringify(newAdmin));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET ALL ADMINS
export const getAllAdmins = async () => {
  try {
    await connectToDatabase();
    const admins = await Admin.find().sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(admins));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET SINGLE ADMIN BY EMAIL
export const getAdminByEmail = async (email: string) => {
  try {
    await connectToDatabase();

    const admin = await Admin.findOne({ email }).lean();

    if (!admin) {
      console.warn(`Admin not found for email: ${email}`);
      return null;
    }

    return JSON.parse(JSON.stringify(admin));
  } catch (error) {
    console.error("Error fetching admin by email:", error);
    handleError(error);
    return null;
  }
};

// ====== GET ADMIN BY ID
export const getAdminById = async (adminId: string) => {
  try {
    await connectToDatabase();

    const admin = await Admin.findById(adminId).lean();

    if (!admin) {
      throw new Error("Admin not found");
    }

    return JSON.parse(JSON.stringify(admin));
  } catch (error) {
    handleError(error);
  }
};

// ====== UPDATE ADMIN
export const updateAdmin = async (
  adminId: string,
  updateData: Partial<AdminParams>
) => {
  try {
    await connectToDatabase();

    const updatedAdmin = await Admin.findByIdAndUpdate(adminId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedAdmin) {
      throw new Error("Admin not found");
    }

    return JSON.parse(JSON.stringify(updatedAdmin));
  } catch (error) {
    handleError(error);
  }
};

// ====== DELETE ADMIN
export const deleteAdmin = async (adminId: string) => {
  try {
    await connectToDatabase();

    const deletedAdmin = await Admin.findByIdAndDelete(adminId);

    if (!deletedAdmin) {
      throw new Error("Admin not found");
    }

    return { message: "Admin deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};

export async function isAdmin(email: string): Promise<boolean> {
  if (!email) {
    return false;
  }

  try {
    await connectToDatabase();

    const admin = await Admin.findOne({ email });

    if (!admin) {
      console.log(`No admin found for email: ${email}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

// ====== GET ADMIN ROLE PERMISSIONS BY EMAIL
export const getAdminRolePermissionsByEmail = async (email: string): Promise<string[]> => {
  try {
    await connectToDatabase();
    const admin = await Admin.findOne({ email });

    if (!admin) {
      console.warn(`Admin not found for email: ${email}`);
      return [];
    }

    return admin.rolePermissions || [];
  } catch (error) {
    console.error("Error fetching role permissions:", error);
    handleError(error);
    return [];
  }
};

// ====== GET ADMIN COUNTRIES BY EMAIL
export const getAdminCountriesByEmail = async (email: string): Promise<string[]> => {
  try {
    await connectToDatabase();
    const admin = await Admin.findOne({ email });

    if (!admin) {
      console.warn(`Admin not found for email: ${email}`);
      return [];
    }

    return admin.countries || [];
  } catch (error) {
    console.error("Error fetching countries:", error);
    handleError(error);
    return [];
  }
};

