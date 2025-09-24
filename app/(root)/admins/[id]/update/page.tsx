import AdminForm from "@/app/(root)/components/AdminForm";
import { getAdminById } from "@/lib/actions/admin.actions";

type PageProps = {
  params: Promise<{ id: string }>;
};
const UpdatePage = async ({ params }: PageProps) => {
  const { id } = await params;

  const admin = await getAdminById(id);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Update Admin Info</h2>
      <AdminForm Admin={admin} AdminId={id} type="Update" />
    </div>
  );
};

export default UpdatePage;
