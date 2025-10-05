"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";

import Admin from "../database/models/admin.model";
import Resource from "../database/models/resource.model";
import Course from "../database/models/course.model";
import Download from "../database/models/download.model";
import Lead from "../database/models/lead.model";
import Profile from "../database/models/profile.model";
import Promotion from "../database/models/promotion.model";
import Service from "../database/models/service.model";
import User from "../database/models/user.model";
import EventCalendar from "../database/models/eventCalender.model";

// ====== GET DASHBOARD SUMMARY
export const getDashboardSummary = async () => {
  try {
    await connectToDatabase();

    const [
      admins,
      resources,
      courses,
      downloads,
      eventCalendars,
      leads,
      profiles,
      promotions,
      services,
      users,
    ] = await Promise.all([
      Admin.find().lean(),
      Resource.find().lean(),
      Course.find().lean(),
      Download.find().lean(),
      EventCalendar.find().lean(),
      Lead.find().lean(),
      Profile.find().lean(),
      Promotion.find().lean(),
      Service.find().lean(),
      User.find().lean(),
    ]);

    return JSON.parse(
      JSON.stringify({
        admins,
        resources,
        courses,
        downloads,
        eventCalendars,
        leads,
        profiles,
        promotions,
        services,
        users,
      })
    );
  } catch (error) {
    handleError(error);
  }
};
