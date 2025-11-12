"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

export default function Breadcrumbs() {
  const pathname = usePathname();

  const isMongoId = (segment: string) => /^[a-f\d]{24}$/i.test(segment);

  const segments = pathname
    .split("/")
    .filter((segment) => segment && !isMongoId(segment));

  const createBreadcrumbLabel = (segment: string) =>
    decodeURIComponent(segment)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <nav className="text-md text-gray-500 font-semibold dark:text-gray-300 px-1 no-print" aria-label="Breadcrumb">
      <div className="w-full overflow-hidden">
        <ol className="flex items-center space-x-1 text-ellipsis whitespace-nowrap overflow-hidden min-w-0">
          {/* Home link */}
          <li className="flex items-center shrink-0">
            <a
              href={"/"}
              className="flex items-center text-gray-500 dark:text-gray-300 hover:text-gray-600 transition-colors"
            >
              <span className="hidden sm:inline">Home</span>
            </a>
          </li>

          {/* Segments */}
          {segments.map((segment, index) => {
            const href = "/" + segments.slice(0, index + 1).join("/");
            const isLast = index === segments.length - 1;

            return (
              <li
                key={href}
                className="flex items-center shrink-0 text-ellipsis overflow-hidden"
              >
                <ChevronRight size={16} className="mx-1 text-gray-500 dark:text-gray-300" />
                {isLast ? (
                  <span className="text-gray-500 dark:text-gray-300 truncate">
                    {createBreadcrumbLabel(segment)}
                  </span>
                ) : (
                  <a
                    href={href}
                    className="text-gray-500 dark:text-gray-300 hover:text-gray-600 transition-colors truncate"
                  >
                    {createBreadcrumbLabel(segment)}
                  </a>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
