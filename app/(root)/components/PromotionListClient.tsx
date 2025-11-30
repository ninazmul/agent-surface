"use client";

import { IPromotion } from "@/lib/database/models/promotion.model";
import PromotionCard from "./PromotionCard";
import { IProfile } from "@/lib/database/models/profile.model";

type Props = {
  promotions: IPromotion[];
  agency: IProfile;
  isAdmin?: boolean;
};

const PromotionListClient = ({ promotions, isAdmin }: Props) => {
  return (
    <section className="wrapper my-2">
      <h3 className="h3-bold text-center sm:text-left mb-6">
        Current Promotions
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 rounded-2xl bg-white dark:bg-gray-800">
        {promotions.length > 0 ? (
          promotions.map((promotion, index) => (
            <PromotionCard key={index} promotion={promotion} isAdmin={isAdmin} />
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
