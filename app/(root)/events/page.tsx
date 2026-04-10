import { getAllAgents } from "@/lib/actions/profile.actions";
import { getAllEventCalendars } from "@/lib/actions/eventCalender.actions";
import { IEventCalendar } from "@/lib/database/models/eventCalender.model";
import EventCalendar from "../components/EventCalenderTable";
import { getUserContext } from "@/lib/actions/userContext.actions";

const Page = async () => {
  const { email, adminStatus, adminCountry, myProfile } =
    await getUserContext("events");

  const agencies = await getAllAgents();
  const allEvents = await getAllEventCalendars();
  let filteredEvents: IEventCalendar[] = [];

  if (adminStatus) {
    // Admins: filter by their countries
    filteredEvents = allEvents.filter((event: IEventCalendar) => {
      if (!adminCountry || adminCountry.length === 0) return true;
      if (!event.countries || event.countries.length === 0) return true;
      return event.countries.some((c) => adminCountry.includes(c));
    });
  } else {
    // Non-admins: filter by their profile country or agency
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
