"use client";

import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";
import { ILead } from "@/lib/database/models/lead.model";

interface ExportLeadsExcelProps {
  data: ILead[];
  fileName?: string;
}

export default function ExportLeadsExcelClient({ data, fileName = "leads.xlsx" }: ExportLeadsExcelProps) {
  const handleExport = () => {
    if (!data || data.length === 0) return;

    const formattedData = data.map((lead) => ({
      name: lead.name,
      email: lead.email,
      phone: lead.number,
      gender: lead.gender,
      marital_status: lead.maritalStatus,
      date_of_birth: lead.dateOfBirth ? new Date(lead.dateOfBirth).toLocaleDateString() : "",
      home_address: lead.home?.address || "",
      home_city: lead.home?.city || "",
      home_state: lead.home?.state || "",
      home_zip: lead.home?.zip || "",
      home_country: lead.home?.country || "",
      passport_number: lead.passport?.number || "",
      passport_visa: lead.passport?.visa ? "yes" : "no",
      passport_country: lead.passport?.country || "",
      passport_expiry: lead.passport?.expirationDate
        ? new Date(lead.passport.expirationDate).toLocaleDateString()
        : "",
      progress: lead.progress,
      status: lead.status || "",
      created_at: lead.createdAt ? new Date(lead.createdAt).toLocaleString() : "",
      updated_at: lead.updatedAt ? new Date(lead.updatedAt).toLocaleString() : "",
      assigned_to: lead.assignedTo?.join(", ") || "",
      payment_status: lead.paymentStatus || "",
      payment_method: lead.paymentMethod || "",
      quotation_status: lead.quotationStatus ? "yes" : "no",
      note: lead.note || "",
      source: lead.source || "",
      courses: lead.course?.map((c) => c.name).join(", ") || "",
      services: lead.services?.map((s) => s.title).join(", ") || "",
      transcript_amounts: lead.transcript?.map((t) => t.amount).join(", ") || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "leads");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, fileName);
  };

  return (
    <Button
      size="sm"
      className="rounded-xl bg-green-600 hover:bg-green-500 text-white flex items-center gap-1"
      onClick={handleExport}
    >
      <Download size={16} /> Export
    </Button>
  );
}
