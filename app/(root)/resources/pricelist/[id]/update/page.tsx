import { redirect } from "next/navigation";
import { getResourceById } from "@/lib/actions/resource.actions";
import StudentResourceForm from "@/app/(root)/components/StudentResourceForm";

type PageProps = {
  params: Promise<{ id: string }>;
};
const UpdatePage = async ({ params }: PageProps) => {
  const { id } = await params;

  const resource = await getResourceById(id);
  if (!resource) redirect("/resources");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Update Resource</h2>
      <StudentResourceForm resource={resource} resourceId={id} type="Update" />
    </div>
  );
};

export default UpdatePage;
