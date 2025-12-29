import { Button } from "@/components/ui/button";
import { getAllResources } from "@/lib/actions/resource.actions";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import {
  getAdminCountriesByEmail,
  getAdminRolePermissionsByEmail,
  isAdmin,
} from "@/lib/actions/admin.actions";
import { getProfileByEmail } from "@/lib/actions/profile.actions";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import MarketingResourceTable from "../../components/MarketingResourceTable";
import { IMarketingResource } from "@/lib/database/models/marketing-resource.model";

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);
  const adminCountry = await getAdminCountriesByEmail(email);
  const rolePermissions = await getAdminRolePermissionsByEmail(email);
  const myProfile = await getProfileByEmail(email);
  const agentCountry = myProfile?.country;

  // ====== ADMIN PATH (profile not required)
  if (adminStatus && !rolePermissions.includes("resources")) {
    redirect("/");
  }

  // ====== NON-ADMIN PATH (profile required)
  if (!adminStatus && myProfile?.status !== "Approved") {
    redirect("/profile");
  }

  const allResources = await getAllResources();

  let resources: IMarketingResource[] = [];

  if (adminStatus) {
    // Admin sees all resources if no country restrictions
    resources =
      !adminCountry || adminCountry.length === 0
        ? allResources
        : allResources.filter((r: IMarketingResource) =>
            r.priceList.some((price) => adminCountry.includes(price.country))
          );
  } else {
    // Normal agent: show only resources where agent's country matches any resource price country
    if (agentCountry) {
      resources = allResources.filter((r: IMarketingResource) =>
        r.priceList.some((price) => price.country === agentCountry)
      );
    }
  }

  return (
    <section className="p-4">
      {/* Header + Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4">
        <h3 className="h3-bold text-center sm:text-left">
          Marketing Resources
        </h3>

        {adminStatus && (
          <a href="/resources/marketing/create" className="w-full sm:w-auto">
            <Button
              size="sm"
              className="rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white flex items-center gap-1"
            >
              <Plus size={16} /> Add Resource
            </Button>
          </a>
        )}
      </div>

      <div className="overflow-x-auto my-8">
        <MarketingResourceTable
          resources={resources || []}
          isAdmin={adminStatus}
          userCountry={agentCountry}
        />
      </div>
    </section>
  );
};

export default Page;
