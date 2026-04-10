import { getAllUsers } from "@/lib/actions/user.actions";
import UserTable from "../components/UserTable";
import JsonToExcel from "../components/JsonToExcel";
import { getUserContext } from "@/lib/actions/userContext.actions";

const Page = async () => {
  const { adminStatus } = await getUserContext("users");

  const users = await getAllUsers();

  return (
    <>
      <section className="m-4 p-4 bg-white dark:bg-gray-900 rounded-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <h3 className="h3-bold text-center sm:text-left">All Users</h3>
            <JsonToExcel data={users} fileName="users.xlsx" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto my-8">
          {adminStatus && <UserTable users={users} />}
        </div>
      </section>
    </>
  );
};

export default Page;
