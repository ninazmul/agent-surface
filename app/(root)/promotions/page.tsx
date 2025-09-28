import { Button } from "@/components/ui/button";
import { getAllPromotions } from "@/lib/actions/promotion.actions";
import PromotionTable from "../components/PromotionTable";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import {
  getAdminCountriesByEmail,
  getAdminRolePermissionsByEmail,
  isAdmin,
} from "@/lib/actions/admin.actions";
import { PromotionParams } from "@/types";
import PromotionListClient from "../components/PromotionListClient";
import {
  getAllProfiles,
  getProfileByEmail,
} from "@/lib/actions/profile.actions";
import { redirect } from "next/navigation";
import { IPromotion } from "@/lib/database/models/promotion.model";

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);

  const adminStatus = await isAdmin(email);
  const allPromotions = await getAllPromotions();
  const myProfile = await getProfileByEmail(email);

  if (!adminStatus && myProfile?.role === "Student") {
    redirect("/profile");
  }

  let agency = [];
  if (adminStatus) {
    agency = await getAllProfiles();
  } else {
    if (myProfile) agency = [myProfile];
  }

  let filteredPromotions: IPromotion[] = [];

  if (adminStatus) {
    const rolePermissions = await getAdminRolePermissionsByEmail(email);
    if (!rolePermissions.includes("promotions")) {
      redirect("/");
    }

    const adminCountries = await getAdminCountriesByEmail(email);

    filteredPromotions = allPromotions.filter((promotion: IPromotion) => {
      if (!adminCountries || adminCountries.length === 0) return true;

      if (!promotion.countries || promotion.countries.length === 0) return true;

      return promotion.countries.some((c) => adminCountries.includes(c));
    });
  } else {
    const userCountry = myProfile?.country || null;

    filteredPromotions = allPromotions.filter((promotion: IPromotion) => {
      if (promotion.isPaused) return false;

      const countryMatch =
        !promotion.countries || promotion.countries.length === 0
          ? true
          : userCountry != null && promotion.countries.includes(userCountry);

      const agencyMatch =
        !promotion.agencies || promotion.agencies.length === 0
          ? true
          : promotion.agencies.includes(email);

      return countryMatch || agencyMatch;
    });
  }

  const now = Date.now();

  const dateFilteredPromotions = filteredPromotions.filter(
    (promo: PromotionParams) => {
      const start = new Date(promo.startDate).getTime();
      const end = new Date(promo.endDate).getTime();
      return start <= now && end >= now;
    }
  );

  return (
    <>
      {/* Client Promotions */}
      <section className="m-4 p-4 bg-white dark:bg-gray-900 rounded-2xl">
        <PromotionListClient
          promotions={dateFilteredPromotions}
          agency={agency}
          isAdmin={adminStatus}
        />
      </section>

      {/* Admin Table */}
      {adminStatus && (
        <section className="m-4 p-4 bg-white dark:bg-gray-900 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4">
            <h3 className="h3-bold text-center sm:text-left">All Promotions</h3>
            <a href="/promotions/create" className="w-full sm:w-auto">
              <Button size="lg" className="rounded-full w-full sm:w-auto">
                Add Promotion
              </Button>
            </a>
          </div>

          <div className="overflow-x-auto my-8">
            <PromotionTable promotions={filteredPromotions} />
          </div>
        </section>
      )}
    </>
  );
};

export default Page;
