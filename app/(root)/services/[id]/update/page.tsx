import { redirect } from "next/navigation";
import ServiceForm from "@/app/(root)/components/ServiceForm";
import { getServiceById } from "@/lib/actions/service.actions";

type PageProps = {
  params: Promise<{ id: string }>;
};
const UpdatePage = async ({ params }: PageProps) => {
  const { id } = await params;

  const service = await getServiceById(id);
  if (!service) redirect("/services");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Update Service</h2>
      <ServiceForm Service={service} ServiceId={id} type="Update" />
    </div>
  );
};

export default UpdatePage;
