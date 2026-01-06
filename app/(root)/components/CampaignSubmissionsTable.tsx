"use client";

import { useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { CampaignSubmission } from "@/types";
import { bulkCreateLeadsFromSubmissions } from "@/lib/actions";

type Submission = {
  _id: string;
  submittedAt: string;
  answers: CampaignSubmission["answers"];
};

const pickField = (
  answers: Record<string, unknown>,
  keys: string[]
): string => {
  for (const key of keys) {
    const value = answers[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "—";
};

export default function CampaignSubmissionsTable({
  submissions,
  author,
}: {
  submissions: Submission[];
  author: string;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedIds(
      selectedIds.length === submissions.length
        ? []
        : submissions.map((s) => s._id)
    );
  };

  const handleCreateLeads = () => {
    const payload: CampaignSubmission[] = submissions
      .filter((s) => selectedIds.includes(s._id))
      .map((s) => ({
        answers: s.answers,
        author: author, // replace with session.user.id if needed
      }));

    if (!payload.length) {
      toast.error("No submissions selected");
      return;
    }

    startTransition(async () => {
      try {
        await bulkCreateLeadsFromSubmissions(payload);
        toast.success("Leads created successfully");
        setSelectedIds([]);
      } catch {
        toast.error("Failed to create leads");
      }
    });
  };

  return (
    <>
      {selectedIds.length > 0 && (
        <div className="mb-3 flex justify-end place-content-end gap-2">
          <Button
            onClick={handleCreateLeads}
            disabled={isPending}
            className="rounded-xl bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white flex items-center gap-1"
          >
            {isPending
              ? "Creating Leads..."
              : `Create Leads (${selectedIds.length})`}
          </Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl bg-white dark:bg-gray-800">
        <Table className="table-fixed min-w-[1400px]">
          <TableHeader className="bg-gray-900">
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={selectedIds.length === submissions.length}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead className="text-white">#</TableHead>
              <TableHead className="text-white">Name</TableHead>
              <TableHead className="text-white">Email</TableHead>
              <TableHead className="text-white">Country</TableHead>
              <TableHead className="text-white">Submitted</TableHead>
              <TableHead className="text-white text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {submissions.map((sub, idx) => (
              <TableRow
                key={sub._id}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(sub._id)}
                    onCheckedChange={() => toggleSelect(sub._id)}
                  />
                </TableCell>

                <TableCell>{idx + 1}</TableCell>

                <TableCell className="font-medium">
                  {pickField(sub.answers, ["name"])}
                </TableCell>

                <TableCell>{pickField(sub.answers, ["email"])}</TableCell>

                <TableCell>{pickField(sub.answers, ["country"])}</TableCell>

                <TableCell>
                  {new Date(sub.submittedAt).toLocaleDateString()}
                </TableCell>

                <TableCell className="text-right">
                  <span
                    className="px-4 py-2 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                    onClick={() => setActiveSubmission(sub)}
                  >
                    View Details
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* DETAILS MODAL */}
      <Dialog
        open={!!activeSubmission}
        onOpenChange={() => setActiveSubmission(null)}
      >
        <DialogContent className="max-w-xl bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {activeSubmission &&
              Object.entries(activeSubmission.answers).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between gap-6 border-b pb-1"
                >
                  <span className="font-semibold">{key}</span>
                  <span className="text-right text-gray-600 dark:text-gray-300">
                    {String(value)}
                  </span>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
