"use client";

import { usePathname } from "next/navigation";

export default function Breadcrumbs() {
  const pathname = usePathname();

  const isMongoId = (segment: string) => /^[a-f\d]{24}$/i.test(segment);

  const segments = pathname
    .split("/")
    .filter((segment) => segment && !isMongoId(segment));

  const createLabel = (segment: string) =>
    decodeURIComponent(segment)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  if (segments.length === 0) return null;

  return (
    <nav
      className="text-gray-500 dark:text-gray-300 font-semibold px-1 no-print text-sm"
      aria-label="Breadcrumb"
    >
      <ol className="flex flex-wrap items-center space-x-1 overflow-hidden">
        {/* Home link */}
        <li className="hidden sm:flex items-center">
          <a
            href={"/"}
            className="hover:text-gray-600 dark:hover:text-gray-200"
          >
            Home
          </a>
          {segments.length > 0 && (
            <span className="mx-1 hidden sm:inline">|</span>
          )}
        </li>

        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;

          // On small screens: only show the first segment
          const showOnSmall = index === 0 ? "inline" : "hidden sm:inline";

          return (
            <li key={index} className="flex items-center">
              <span className={`truncate ${showOnSmall}`}>
                {createLabel(segment)}
              </span>

              {/* Separator: only show on large screens and not after last */}
              {!isLast && <span className="mx-1 hidden sm:inline">|</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
