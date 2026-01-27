import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserEmailById } from "@/lib/actions/user.actions";
import {
  getAdminCountriesByEmail,
  getAdminRolePermissionsByEmail,
  isAdmin,
} from "@/lib/actions/admin.actions";
import { getAllAgents, getProfileByEmail } from "@/lib/actions/profile.actions";
import { getAllEventCalendars } from "@/lib/actions/eventCalender.actions";
import { IEventCalendar } from "@/lib/database/models/eventCalender.model";
import EventCalendar from "../components/EventCalenderTable";

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);

  const adminStatus = await isAdmin(email);
  const rolePermissions = await getAdminRolePermissionsByEmail(email);
  const myProfile = await getProfileByEmail(email);
  const agencies = await getAllAgents();

  // ===== ACCESS CONTROL
  if (adminStatus) {
    if (!rolePermissions.includes("events")) redirect("/");
  } else {
    if (myProfile?.status !== "Approved") redirect("/profile");
    if (myProfile?.role === "Student") redirect("/profile");
  }

  const allEvents = await getAllEventCalendars();
  let filteredEvents: IEventCalendar[] = [];

  // ===== FILTERING (SAME PATTERN AS PROMOTIONS)
  if (adminStatus) {
    const adminCountries = await getAdminCountriesByEmail(email);

    filteredEvents = allEvents.filter((event: IEventCalendar) => {
      if (!adminCountries || adminCountries.length === 0) return true;
      if (!event.countries || event.countries.length === 0) return true;
      return event.countries.some((c) => adminCountries.includes(c));
    });
  } else {
    const userCountry = myProfile?.country || null;

    filteredEvents = allEvents.filter((event: IEventCalendar) => {
      const countryMatch =
        !event.countries || event.countries.length === 0
          ? true
          : userCountry && event.countries.includes(userCountry);

      const agencyMatch =
        !event.agencies || event.agencies.length === 0
          ? true
          : event.agencies.includes(email);

      return countryMatch || agencyMatch;
    });
  }

  return (
    <section className="p-4">
      <h3 className="h3-bold mb-6">All Events</h3>

      <EventCalendar
        isAdmin={adminStatus}
        agencies={agencies}
        events={filteredEvents} // ✅ PASS FILTERED DATA
      />
    </section>
  );
};

export default Page;
