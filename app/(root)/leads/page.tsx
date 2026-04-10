import { Button } from "@/components/ui/button";
import LeadTable from "../components/LeadTable";
import { Download } from "lucide-react";
import SendRemindersButton from "@/components/shared/SendRemindersButton";
import ExportLeadsExcelClient from "@/components/shared/ExportToExcelClient";
import AddLeadDialog from "@/components/shared/AddLeadDialog";
import { getUserContext } from "@/lib/actions/userContext.actions";

const Page = async () => {
  const { email, adminStatus, agency, leads, courses, services } =
    await getUserContext("leads");

  return (
    <>
      <section className="p-4">
        {/* Header + Actions */}
        <div className="px-2 sm:px-4 flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Title */}
          <h3 className="h3-bold text-center sm:text-left">All Leads</h3>

          {/* Actions: tight, compact, auto-wrap cluster */}
          <div className="flex flex-wrap gap-2">
            <a href={"/leads/create/bulk-import"}>
              <Button
                size="sm"
                className="rounded-xl bg-white hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-black dark:text-white flex items-center gap-1"
              >
                <Download size={16} /> Import
              </Button>
            </a>

            <AddLeadDialog
              email={email}
              agency={agency}
              courses={courses}
              services={services}
              isAdmin={adminStatus}
            />

            <ExportLeadsExcelClient data={leads} fileName="all_leads.xlsx" />

            {adminStatus && (
              <div>
                <SendRemindersButton />
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto my-8">
          <LeadTable
            leads={leads}
            isAdmin={adminStatus}
            email={email}
            agency={agency}
            courses={courses}
            services={services}
          />
        </div>
      </section>
    </>
  );
};

export default Page;
