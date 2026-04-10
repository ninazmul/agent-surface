"use client";

import { Button } from "@/components/ui/button";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";
import { ILead } from "@/lib/database/models/lead.model";

interface ExportLeadsExcelProps {
  data: ILead[];
  fileName?: string;
}

export default function ExportLeadsExcelClient({
  data,
  fileName = "leads.xlsx",
}: ExportLeadsExcelProps) {
  const handleExport = async () => {
    if (!data || data.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Leads");

    // Define columns
    worksheet.columns = [
      { header: "Name", key: "name" },
      { header: "Email", key: "email" },
      { header: "Phone", key: "phone" },
      { header: "Gender", key: "gender" },
      { header: "Marital Status", key: "marital_status" },
      { header: "Date of Birth", key: "date_of_birth" },
      { header: "Home Address", key: "home_address" },
      { header: "Home City", key: "home_city" },
      { header: "Home State", key: "home_state" },
      { header: "Home Zip", key: "home_zip" },
      { header: "Home Country", key: "home_country" },
      { header: "Passport Number", key: "passport_number" },
      { header: "Passport Visa", key: "passport_visa" },
      { header: "Passport Country", key: "passport_country" },
      { header: "Passport Expiry", key: "passport_expiry" },
      { header: "Progress", key: "progress" },
      { header: "Status", key: "status" },
      { header: "Created At", key: "created_at" },
      { header: "Updated At", key: "updated_at" },
      { header: "Assigned To", key: "assigned_to" },
      { header: "Payment Status", key: "payment_status" },
      { header: "Payment Method", key: "payment_method" },
      { header: "Quotation Status", key: "quotation_status" },
      { header: "Note", key: "note" },
      { header: "Source", key: "source" },
      { header: "Courses", key: "courses" },
      { header: "Services", key: "services" },
      { header: "Transcript Amounts", key: "transcript_amounts" },
    ];

    // Format data
    const formattedData = data.map((lead) => ({
      name: lead.name,
      email: lead.email,
      phone: lead.number,
      gender: lead.gender,
      marital_status: lead.maritalStatus,
      date_of_birth: lead.dateOfBirth
        ? new Date(lead.dateOfBirth).toLocaleDateString()
        : "",
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
      created_at: lead.createdAt
        ? new Date(lead.createdAt).toLocaleString()
        : "",
      updated_at: lead.updatedAt
        ? new Date(lead.updatedAt).toLocaleString()
        : "",
      assigned_to: lead.assignedTo?.join(", ") || "",
      payment_status: lead.paymentStatus || "",
      payment_method: lead.paymentMethod || "",
      quotation_status: lead.quotationStatus ? "yes" : "no",
      note: lead.note || "",
      source: lead.source || "",
      courses: lead.course?.map((c) => c.name).join(", ") || "",
      services: lead.services?.map((s) => s.title).join(", ") || "",
      transcript_amounts:
        lead.transcript?.map((t) => t.amount).join(", ") || "",
    }));

    worksheet.addRows(formattedData);

    // Generate buffer and save
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
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
