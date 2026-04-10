
import React from 'react';

interface DistributionListItemProps {
  label: string;
  count: number;
  percentage: string;
}

const DistributionListItem = ({
  label,
  count,
  percentage,
}: DistributionListItemProps) => {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
      <span className="text-gray-700 dark:text-gray-300">{label}</span>
      <span className="font-semibold text-gray-900 dark:text-gray-100">
        {`${count} (${percentage})`}
      </span>
    </div>
  );
};

export default DistributionListItem;