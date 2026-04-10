import { getAllStudentResources } from "@/lib/actions/student-resource.actions";
import StudentResourceTable from "../../components/StudentResourceTable";
import AddStudentResourceDialog from "@/components/shared/AddStudentResourceDialog";
import { getUserContext } from "@/lib/actions/userContext.actions";

const Page = async () => {
  const { adminStatus } = await getUserContext("resources");

  const resources = await getAllStudentResources();

  return (
    <>
      <section className="p-4">
        {/* Header + Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4">
          <h3 className="h3-bold text-center sm:text-left">
            Student Resources
          </h3>

          {/* Action Button */}
          {adminStatus && <AddStudentResourceDialog />}
        </div>

        <div className="overflow-x-auto my-8">
          <StudentResourceTable resources={resources} isAdmin={adminStatus} />
        </div>
      </section>
    </>
  );
};

export default Page;
