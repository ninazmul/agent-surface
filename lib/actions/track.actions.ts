"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Track from "../database/models/track.model";
import { TrackParams } from "@/types";

// ====== CREATE OR ADD TRACK EVENT
export const createTrack = async (params: TrackParams) => {
  try {
    await connectToDatabase();

    const trackDoc = await Track.findOne({ student: params.student });

    if (trackDoc) {
      trackDoc.events.push({
        event: params.event,
        route: params.route,
        status: params.status,
        createdAt: new Date(),
      });
      await trackDoc.save();
      return JSON.parse(JSON.stringify(trackDoc));
    } else {
      const newTrack = await Track.create({
        student: params.student,
        events: [
          {
            event: params.event,
            route: params.route,
            status: params.status,
            createdAt: new Date(),
          },
        ],
      });
      return JSON.parse(JSON.stringify(newTrack));
    }
  } catch (error) {
    handleError(error);
  }
};

// ====== GET ALL TRACKS (all students + their events)
export const getAllTracks = async () => {
  try {
    await connectToDatabase();
    const tracks = await Track.find().sort({ updatedAt: -1 }).lean();
    return JSON.parse(JSON.stringify(tracks));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET TRACKS BY STUDENT
export const getTracksByStudent = async (student: string) => {
  try {
    await connectToDatabase();
    const track = await Track.findOne({ student }).lean();

    if (!track) {
      console.warn(`No tracks found for student: ${student}`);
      return null;
    }

    return JSON.parse(JSON.stringify(track));
  } catch (error) {
    console.error("Error fetching tracks by student:", error);
    handleError(error);
  }
};

// ====== UPDATE SPECIFIC EVENT INSIDE STUDENT TRACK
export const updateTrackEvent = async (
  student: string,
  eventIndex: number,
  updateData: Partial<TrackParams>
) => {
  try {
    await connectToDatabase();
    const trackDoc = await Track.findOne({ student });

    if (!trackDoc) throw new Error("Student not found");
    if (!trackDoc.events[eventIndex]) throw new Error("Event not found");

    trackDoc.events[eventIndex] = {
      ...trackDoc.events[eventIndex].toObject(),
      ...updateData,
    };

    await trackDoc.save();
    return JSON.parse(JSON.stringify(trackDoc));
  } catch (error) {
    handleError(error);
  }
};

// ====== DELETE SPECIFIC EVENT FROM STUDENT TRACK
export const deleteTrackEvent = async (student: string, eventIndex: number) => {
  try {
    await connectToDatabase();
    const trackDoc = await Track.findOne({ student });

    if (!trackDoc) throw new Error("Student not found");
    if (!trackDoc.events[eventIndex]) throw new Error("Event not found");

    trackDoc.events.splice(eventIndex, 1);

    await trackDoc.save();
    return { message: "Event deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};

// ====== DELETE STUDENT TRACK ENTIRELY
export const deleteStudentTrack = async (student: string) => {
  try {
    await connectToDatabase();
    const deletedTrack = await Track.findOneAndDelete({ student });

    if (!deletedTrack) throw new Error("Track not found");

    return { message: "Student track deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};
