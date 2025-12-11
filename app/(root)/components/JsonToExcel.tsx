/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface JsonToExcelProps {
  data: any[];
  fileName?: string;
  sheetName?: string;
}

/**
 * Flattens nested objects safely
 */
const flattenObject = (
  obj: Record<string, any>,
  parentKey = "",
  out: Record<string, any> = {}
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
const normalizeData = (data: any[]) => {
  const output: any[] = [];

  for (const row of data) {
    const nestedKeys = Object.entries(row).filter(
      ([, v]) => Array.isArray(v) && v.every((el) => typeof el === "object")
    );

    // If no nested arrays → push flattened row
    if (nestedKeys.length === 0) {
      output.push(flattenObject(row));
      continue;
    }

    // For rows with nested array-objects:
    for (const [key, arr] of nestedKeys) {
      for (const nestedObj of arr as any[]) {
        const base = flattenObject(row);
        const nested = flattenObject(nestedObj, key);
        output.push({ ...base, ...nested });
      }
    }
  }

  return output;
};

const JsonToExcel = ({ data, fileName, sheetName }: JsonToExcelProps) => {
  const handleDownloadExcel = () => {
    if (!data || data.length === 0) {
      console.warn("JsonToExcel: No data to export.");
      return;
    }

    const normalized = normalizeData(data);
    const worksheet = XLSX.utils.json_to_sheet(normalized);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || "Sheet1");
    XLSX.writeFile(workbook, fileName || "data.xlsx");
  };

  return (
    <Button variant="outline" className="rounded-full" onClick={handleDownloadExcel}>
      <Download className="w-4 h-4" />
    </Button>
  );
};

export default JsonToExcel;
