"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash, SortAsc, SortDesc, Pencil } from "lucide-react";
import { deleteResource } from "@/lib/actions/resource.actions";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { IMarketingResource } from "@/lib/database/models/marketing-resource.model";

interface Props {
  resources: IMarketingResource[];
  isAdmin: boolean;
  userCountry?: string;
}

const MarketingResourceTable = ({ resources, isAdmin, userCountry }: Props) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<
    "fileName" | "category" | "price" | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredResources = useMemo(() => {
    const filtered = (resources || []).filter(
      (resource) =>
        resource.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortKey) {
      filtered.sort((a, b) => {
        let valueA: string | number = "";
        let valueB: string | number = "";

        switch (sortKey) {
          case "fileName":
            valueA = a.fileName?.toLowerCase() || "";
            valueB = b.fileName?.toLowerCase() || "";
            break;
          case "category":
            valueA = a.category?.toLowerCase() || "";
            valueB = b.category?.toLowerCase() || "";
            break;
          case "price":
            const aPrice = isAdmin
              ? a.priceList?.[0]?.price || 0
              : a.priceList?.find((p) => p.country === userCountry)?.price || 0;
            const bPrice = isAdmin
              ? b.priceList?.[0]?.price || 0
              : b.priceList?.find((p) => p.country === userCountry)?.price || 0;
            valueA = aPrice;
            valueB = bPrice;
            break;
          default:
            return 0;
        }

        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [resources, searchQuery, sortKey, sortOrder, isAdmin, userCountry]);

  const paginatedResources = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredResources.slice(start, start + itemsPerPage);
  }, [filteredResources, currentPage, itemsPerPage]);

  const handleDeleteResource = async (resourceId: string) => {
    try {
      const response = await deleteResource(resourceId);
      if (response) toast.success("Resource deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete resource");
      console.error(error);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleSort = (key: "fileName" | "category" | "price") => {
    if (sortKey === key) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-6">
      <Input
        placeholder="Search by File Name or Category"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full sm:w-auto sm:min-w-[220px] rounded-2xl"
      />
      <div className="overflow-x-auto rounded-2xl bg-white dark:bg-gray-800 scrollbar-hide">
        <Table>
          <TableHeader className="bg-gray-900">
            <TableRow>
              <TableHead className="text-white cursor-pointer">#</TableHead>
              <TableHead
                className="text-white cursor-pointer"
                onClick={() => handleSort("fileName")}
              >
                File Name{" "}
                {sortKey === "fileName" &&
                  (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
              </TableHead>
              <TableHead
                className="text-white cursor-pointer"
                onClick={() => handleSort("category")}
              >
                Category{" "}
                {sortKey === "category" &&
                  (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
              </TableHead>
              <TableHead
                className="text-white cursor-pointer"
                onClick={() => handleSort("price")}
              >
                Price ({userCountry}){" "}
                {sortKey === "price" &&
                  (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
              </TableHead>
              <TableHead className="text-white cursor-pointer">
                Download
              </TableHead>
              {isAdmin && (
                <TableHead className="text-white cursor-pointer">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedResources.map((resource, index) => {
              return (
                <TableRow
                  key={resource._id.toString()}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 border-b-0"
                >
                  <TableCell>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell>{resource.fileName}</TableCell>
                  <TableCell>{resource.category}</TableCell>
                  <TableCell>
                    {isAdmin ? (
                      <select className="border rounded px-2 py-1 text-sm">
                        {(resource.priceList || []).map((p) => (
                          <option key={p.country} value={p.price}>
                            {p.country}: {p.price} €
                          </option>
                        ))}
                      </select>
                    ) : resource.priceList?.find(
                        (p) => p.country === userCountry
                      ) ? (
                      `${
                        resource.priceList.find(
                          (p) => p.country === userCountry
                        )?.price
                      } €`
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <a href={resource.link} target="_blank">
                      <span className="w-full px-4 py-2 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border text-center">
                        Download File
                      </span>
                    </a>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="flex items-center space-x-2">
                      <a href={`/resources/${resource._id.toString()}/update`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="w-4 h-4 text-black" />
                        </Button>
                      </a>
                      <Button
                        onClick={() =>
                          setConfirmDeleteId(resource._id.toString())
                        }
                        variant="ghost"
                        size="icon"
                      >
                        <Trash className="w-4 h-4 text-red-600" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 w-full">
        <span className="text-sm text-muted-foreground">
          Showing{" "}
          {Math.min(itemsPerPage * currentPage, filteredResources.length)} of{" "}
          {filteredResources.length} resources
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            size="sm"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={
              currentPage === Math.ceil(filteredResources.length / itemsPerPage)
            }
          >
            Next
          </Button>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white text-black p-6 rounded-md space-y-4">
            <p>Are you sure you want to delete this resource?</p>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setConfirmDeleteId(null)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteResource(confirmDeleteId)}
                variant="destructive"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingResourceTable;
