import PromotionTable from "../components/PromotionTable";
import PromotionListClient from "../components/PromotionListClient";
import AddPromotionDialog from "@/components/shared/AddPromotionDialog";
import { getAllPromotions } from "@/lib/actions/promotion.actions";
import { getAllProfiles } from "@/lib/actions/profile.actions";
import { getCoursesByCountry } from "@/lib/actions/course.actions";
import { getAllServices } from "@/lib/actions/service.actions";
import { IPromotion } from "@/lib/database/models/promotion.model";
import { PromotionParams } from "@/types";
import { getUserContext } from "@/lib/actions/userContext.actions";

const Page = async () => {
  // 🔑 One call enforces access rules and gives you user context
  const { email, adminStatus, adminCountry, myProfile } =
    await getUserContext("promotions");

  const allPromotions = await getAllPromotions();

  // Agency resolution
  const agency = adminStatus
    ? await getAllProfiles()
    : myProfile
      ? [myProfile]
      : [];

  let filteredPromotions: IPromotion[] = [];

  if (adminStatus) {
    filteredPromotions = allPromotions.filter((promotion: IPromotion) => {
      if (!adminCountry || adminCountry.length === 0) return true;
      if (!promotion.countries || promotion.countries.length === 0) return true;
      return promotion.countries.some((c) => adminCountry.includes(c));
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

  // Date filtering
  const now = Date.now();
  const dateFilteredPromotions = filteredPromotions.filter(
    (promo: PromotionParams) => {
      const start = new Date(promo.startDate).getTime();
      const end = new Date(promo.endDate).getTime();
      return start <= now && end >= now;
    },
  );

  const courses = await getCoursesByCountry();
  const services = await getAllServices();

  return (
    <>
      {/* Client Promotions */}
      <section className="p-4">
        <PromotionListClient
          email={email}
          promotions={dateFilteredPromotions}
          agency={agency}
          courses={courses}
          services={services}
          agencies={agency}
          isAdmin={adminStatus}
        />
      </section>

      {/* Admin Table */}
      {adminStatus && (
        <section className="p-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h3 className="h3-bold text-center sm:text-left">All Promotions</h3>
            <AddPromotionDialog
              agency={agency}
              courses={courses}
              services={services}
            />
          </div>

          <div className="overflow-x-auto">
            <PromotionTable
              promotions={filteredPromotions}
              agency={agency}
              courses={courses}
              services={services}
            />
          </div>
        </section>
      )}
    </>
  );
};

export default Page;
