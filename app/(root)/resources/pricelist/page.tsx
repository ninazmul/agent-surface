import { Button } from "@/components/ui/button";
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
import { getAllResourcePriceLists } from "@/lib/actions/resource-pricelist.actions";
import { IResourcePriceList } from "@/lib/database/models/resource-pricelist.model";
import ResourcePriceListCards from "../../components/ResourcePriceListTable";

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

  const allResources = await getAllResourcePriceLists();

  let resources: IResourcePriceList[] = [];

  if (adminStatus) {
    // Admin sees all resources if no country restrictions
    resources =
      !adminCountry || adminCountry.length === 0
        ? allResources
        : allResources.filter((r: IResourcePriceList) =>
            adminCountry.includes(r.country)
          );
  } else {
    // Normal user: show only resources matching user's country
    if (agentCountry) {
      resources = allResources.filter(
        (r: IResourcePriceList) => r.country === agentCountry
      );
    }
  }

  return (
    <>
      <section className="p-4">
        {/* Header + Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4">
          <h3 className="h3-bold text-center sm:text-left">All Price List</h3>

          {/* Action Button */}
          {adminStatus && (
            <a href="/resources/pricelist/create" className="w-full sm:w-auto">
              <Button
                size="sm"
                className="rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white flex items-center gap-1"
              >
                <Plus size={16} /> Add Price List
              </Button>
            </a>
          )}
        </div>

        <div className="overflow-x-auto my-8">
          <ResourcePriceListCards resources={resources} isAdmin={adminStatus} />
        </div>
      </section>
    </>
  );
};

export default Page;
