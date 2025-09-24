"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Download from "../database/models/download.model";
import { DownloadParams } from "@/types";

// ====== CREATE DOWNLOAD
export const createDownload = async (params: DownloadParams) => {
  try {
    await connectToDatabase();

    const newDownload = await Download.create(params);

    return JSON.parse(JSON.stringify(newDownload));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET ALL DOWNLOADS
export const getAllDownloads = async () => {
  try {
    await connectToDatabase();

    const downloads = await Download.find().sort({ createdAt: -1 }).lean();

    return JSON.parse(JSON.stringify(downloads));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET DOWNLOAD BY ID
export const getDownloadById = async (downloadId: string) => {
  try {
    await connectToDatabase();

    const download = await Download.findById(downloadId).lean();

    if (!download) {
      throw new Error("Download not found");
    }

    return JSON.parse(JSON.stringify(download));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET DOWNLOADS BY AGENCY
export const getDownloadsByAgency = async (author: string) => {

  try {
    await connectToDatabase();

    const downloads = await Download.find({ author }).lean();

    if (!downloads || downloads.length === 0) {
      console.log(`No downloads found for author: ${author}`);
      return null;
    }

    return JSON.parse(JSON.stringify(downloads));
  } catch (error) {
    console.error("Error fetching downloads by author:", error);
    handleError(error);
  }
};

// ====== UPDATE DOWNLOAD
export const updateDownload = async (
  downloadId: string,
  updateData: Partial<DownloadParams>
) => {
  try {
    await connectToDatabase();

    const updatedDownload = await Download.findByIdAndUpdate(
      downloadId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedDownload) {
      throw new Error("Download not found");
    }

    return JSON.parse(JSON.stringify(updatedDownload));
  } catch (error) {
    handleError(error);
  }
};

// ====== DELETE DOWNLOAD
export const deleteDownload = async (downloadId: string) => {
  try {
    await connectToDatabase();

    const deletedDownload = await Download.findByIdAndDelete(
      downloadId
    );

    if (!deletedDownload) {
      throw new Error("Download not found");
    }

    return { message: "Download deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};

