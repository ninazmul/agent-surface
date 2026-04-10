/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import ExcelJS from "exceljs";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface JsonToExcelProps {
  data: Record<string, any>[];
  fileName?: string;
  sheetName?: string;
}

/**
 * Flattens nested objects safely
 */
const flattenObject = (
  obj: Record<string, any>,
  parentKey = "",
  out: Record<string, any> = {},
) => {
  for (const key of Object.keys(obj)) {
    const newKey = parentKey ? `${parentKey}.${key}` : key;
    const value = obj[key];

    if (value === null || value === undefined) {
      out[newKey] = "";
      continue;
    }

    if (Array.isArray(value)) {
      if (value.every((el) => typeof el !== "object")) {
        out[newKey] = value.join(", ");
      } else {
        out[newKey] = JSON.stringify(value);
      }
      continue;
    }

    if (typeof value === "object") {
      flattenObject(value, newKey, out);
      continue;
    }

    out[newKey] = value;
  }

  return out;
};

/**
 * Converts nested array rows into clean tabular format.
 */
const normalizeData = (data: Record<string, any>[]) => {
  const output: Record<string, any>[] = [];

  for (const row of data) {
    const nestedKeys = Object.entries(row).filter(
      ([, v]) => Array.isArray(v) && v.every((el) => typeof el === "object"),
    );

    if (nestedKeys.length === 0) {
      output.push(flattenObject(row));
      continue;
    }

    for (const [key, arr] of nestedKeys) {
      for (const nestedObj of arr as Record<string, any>[]) {
        const base = flattenObject(row);
        const nested = flattenObject(nestedObj, key);
        output.push({ ...base, ...nested });
      }
    }
  }

  return output;
};

const JsonToExcel = ({ data, fileName, sheetName }: JsonToExcelProps) => {
  const handleDownloadExcel = async () => {
    if (!data || data.length === 0) {
      console.warn("JsonToExcel: No data to export.");
      return;
    }

    const normalized = normalizeData(data);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName || "Sheet1");

    // Dynamically set columns based on keys
    const columns = Object.keys(normalized[0]).map((key) => ({
      header: key,
      key,
    }));
    worksheet.columns = columns;

    worksheet.addRows(normalized);

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "data.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      className="rounded-full"
      onClick={handleDownloadExcel}
    >
      <Download className="w-4 h-4" />
    </Button>
  );
};

export default JsonToExcel;
