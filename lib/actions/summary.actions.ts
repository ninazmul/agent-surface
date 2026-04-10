"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";

import Admin, { IAdmin } from "../database/models/admin.model";
import Resource, { IResource } from "../database/models/resource.model";
import Course, { ICourse } from "../database/models/course.model";
import Download, { IDownload } from "../database/models/download.model";
import Lead, { ILead } from "../database/models/lead.model";
import Profile, { IProfile } from "../database/models/profile.model";
import Promotion, { IPromotion } from "../database/models/promotion.model";
import Service, { IServices } from "../database/models/service.model";
import EventCalendar, {
  IEventCalendar,
} from "../database/models/eventCalender.model";

// ===== TypeScript interface for summary
export interface DashboardSummary {
  admins: IAdmin[];
  resources: IResource[];
  courses: ICourse[];
  downloads: IDownload[];
  eventCalendars: IEventCalendar[];
  leads: ILead[];
  profiles: IProfile[];
  promotions: IPromotion[];
  services: IServices[];
}

// ===== GET DASHBOARD SUMMARY
export const getDashboardSummary =
  async (): Promise<DashboardSummary | null> => {
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
      ] = await Promise.all([
        Admin.find().lean<IAdmin[]>(),
        Resource.find().lean<IResource[]>(),
        Course.find().lean<ICourse[]>(),
        Download.find().lean<IDownload[]>(),
        EventCalendar.find().lean<IEventCalendar[]>(),
        Lead.find().lean<ILead[]>(),
        Profile.find().lean<IProfile[]>(),
        Promotion.find().lean<IPromotion[]>(),
        Service.find().lean<IServices[]>(),
      ]);

      return {
        admins: admins || [],
        resources: resources || [],
        courses: courses || [],
        downloads: downloads || [],
        eventCalendars: eventCalendars || [],
        leads: leads || [],
        profiles: profiles || [],
        promotions: promotions || [],
        services: services || [],
      };
    } catch (error) {
      handleError(error);
      return null;
    }
  };
