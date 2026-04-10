"use client";

import { IPromotion } from "@/lib/database/models/promotion.model";
import PromotionCard from "./PromotionCard";
import { IProfile } from "@/lib/database/models/profile.model";
import { ICourse } from "@/lib/database/models/course.model";
import { IServices } from "@/lib/database/models/service.model";

type Props = {
  email: string;
  agencies: IProfile[];
  courses: ICourse[];
  services: IServices[];
  promotions: IPromotion[];
  agency: IProfile;
  isAdmin?: boolean;
};

const PromotionListClient = ({
  email,
  promotions,
  isAdmin,
  agencies,
  courses,
  services,
}: Props) => {
  return (
    <section className="">
      <h3 className="h3-bold text-center sm:text-left mb-6">
        Current Promotions
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 rounded-2xl bg-white dark:bg-gray-800 p-4">
        {promotions.length > 0 ? (
          promotions.map((promotion, index) => (
            <PromotionCard
              key={index}
              email={email}
              promotion={promotion}
              isAdmin={isAdmin}
              agency={agencies}
              courses={courses}
              services={services}
            />
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-full">
            No promotions found.
          </p>
        )}
      </div>
    </section>
  );
};

export default PromotionListClient;
