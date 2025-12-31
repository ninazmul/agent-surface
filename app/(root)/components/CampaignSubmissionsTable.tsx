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

export default function CampaignSubmissionsTable({
  submissions,
}: {
  submissions: Submission[];
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [activeSubmission, setActiveSubmission] =
    useState<Submission | null>(null);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelected(
      selected.length === submissions.length
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
                  checked={selected.length === submissions.length}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead className="text-white">#</TableHead>
              <TableHead className="text-white">Submitted At</TableHead>
              <TableHead className="text-white text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {submissions.map((sub, idx) => (
              <TableRow key={sub._id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                <TableCell>
                  <Checkbox
                    checked={selected.includes(sub._id)}
                    onCheckedChange={() => toggleSelect(sub._id)}
                  />
                </TableCell>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>
                  {new Date(sub.submittedAt).toLocaleString()}
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

      {/* Details Modal */}
      <Dialog
        open={!!activeSubmission}
        onOpenChange={() => setActiveSubmission(null)}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {activeSubmission &&
              Object.entries(activeSubmission.answers).map(
                ([key, value]) => (
                  <div key={key} className="flex justify-between gap-4">
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
