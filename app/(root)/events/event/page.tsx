import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { getAllEvents, getEventsByEmail } from "@/lib/actions/event.actions";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import {
  getAdminRolePermissionsByEmail,
  isAdmin,
} from "@/lib/actions/admin.actions";
import { getProfileByEmail } from "@/lib/actions/profile.actions";
import { redirect } from "next/navigation";
import { IEvent } from "@/lib/database/models/event.model";
import EventForm from "../../components/EventForm";
import EventTable from "../../components/EventTable";
import { Plus } from "lucide-react";

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);
  const rolePermissions = await getAdminRolePermissionsByEmail(email);

  if (adminStatus && !rolePermissions.includes("events")) {
    redirect("/");
  }

  let events: IEvent[] = [];

  if (adminStatus) {
    events = await getAllEvents();
  } else {
    const profile = await getProfileByEmail(email);
    const subAgents = profile?.subAgents || [];

    const myEvents = (await getEventsByEmail(email)) || [];
    let subAgentEvents: IEvent[] = [];

    for (const agentEmail of subAgents) {
      const agentEvents = await getEventsByEmail(agentEmail);
      if (agentEvents) {
        subAgentEvents = subAgentEvents.concat(agentEvents);
      }
    }

    events = [...myEvents, ...subAgentEvents];
  }

  return (
    <>
      <section className="p-4">
        <Sheet>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4">
            <h3 className="h3-bold text-center sm:text-left">Our Events</h3>
            <SheetTrigger className="w-full md:w-max">
              <Button
                size="sm"
                className="rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white flex items-center gap-1"
              >
                <Plus size={16} /> Add Event
              </Button>
            </SheetTrigger>
          </div>

          <SheetContent className="bg-white dark:bg-gray-800">
            <SheetHeader>
              <SheetTitle>Add a Event</SheetTitle>
              <SheetDescription>
                Use this form to add a event to the system. Ensure the
                information provided is accurate and complete, adhering to the
                system&apos;s guidelines for proper record management and
                organization.
              </SheetDescription>
            </SheetHeader>
            <div className="py-5">
              <EventForm email={email} type="Create" />
            </div>
          </SheetContent>
        </Sheet>

        <div className="overflow-x-auto my-8">
          <EventTable events={events} />
        </div>
      </section>
    </>
  );
};

export default Page;
