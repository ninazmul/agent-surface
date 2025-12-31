"use client";

import { useState } from "react";
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

type Submission = {
  _id: string;
  submittedAt: string;
  answers: Record<string, unknown>;
};

const pickField = (
  answers: Record<string, unknown>,
  keys: string[]
): string => {
  for (const key of keys) {
    const value = answers?.[key];
    if (value) return String(value);
  }
  return "—";
};

export default function CampaignSubmissionsTable({
  submissions,
}: {
  submissions: Submission[];
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeSubmission, setActiveSubmission] =
    useState<Submission | null>(null);

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

  return (
    <>
      <div className="overflow-x-auto rounded-2xl bg-white dark:bg-gray-800">
        <Table>
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
              <TableHead className="text-white">Submitted At</TableHead>
              <TableHead className="text-white text-right">
                Action
              </TableHead>
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
                  {pickField(sub.answers, [
                    "name",
                    "fullName",
                    "full_name",
                    "Name",
                  ])}
                </TableCell>

                <TableCell>
                  {pickField(sub.answers, [
                    "email",
                    "emailAddress",
                    "Email",
                  ])}
                </TableCell>

                <TableCell>
                  {pickField(sub.answers, [
                    "country",
                    "Country",
                    "nation",
                  ])}
                </TableCell>

                <TableCell>
                  {new Date(sub.submittedAt).toLocaleDateString()}
                </TableCell>

                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveSubmission(sub)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Submission Details Modal */}
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
              Object.entries(activeSubmission.answers).map(
                ([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between gap-6 border-b pb-1"
                  >
                    <span className="font-semibold">{key}</span>
                    <span className="text-right text-gray-600 dark:text-gray-300">
                      {String(value)}
                    </span>
                  </div>
                )
              )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
