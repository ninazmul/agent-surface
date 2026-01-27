import { getAllProfiles } from "@/lib/actions";
import EventCalendarForm from "../../components/EventCalenderForm";

const CreateleadPage = async () => {
  const agencies = await getAllProfiles();

  return (
    <section className="max-w-5xl mx-auto p-4">
      <EventCalendarForm type="Create" agencies={agencies} />
    </section>
  );
};

export default CreateleadPage;
