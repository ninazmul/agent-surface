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
 * Flattens a nested object into dot notation
 * Example: { user: { name: "Alice" } } -> { "user.name": "Alice" }
 */
const flattenObject = (obj: any, parentKey = "", res: Record<string, any> = {}) => {
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const newKey = parentKey ? `${parentKey}.${key}` : key;

    if (Array.isArray(obj[key])) {
      if (obj[key].every((item: any) => typeof item !== "object")) {
        // Array of primitives -> join as string
        res[newKey] = obj[key].join(", ");
      } else {
        // Array of objects -> stringify (expanded later)
        res[newKey] = obj[key].map((item: any) => JSON.stringify(item)).join(" | ");
      }
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      flattenObject(obj[key], newKey, res);
    } else {
      res[newKey] = obj[key];
    }
  }
  return res;
};

/**
 * Expands arrays of objects into multiple rows
 */
const normalizeData = (data: any[]) => {
  const result: any[] = [];

  data.forEach((item) => {
    let hasNestedArray = false;

    for (const key in item) {
      if (Array.isArray(item[key]) && item[key].every((el: any) => typeof el === "object")) {
        hasNestedArray = true;

        item[key].forEach((nestedObj: any) => {
          const flattenedMain = flattenObject(item);
          const flattenedNested = flattenObject(nestedObj, key);
          result.push({ ...flattenedMain, ...flattenedNested });
        });
      }
    }

    if (!hasNestedArray) {
      result.push(flattenObject(item));
    }
  });

  return result;
};

const JsonToExcel = ({ data, fileName, sheetName }: JsonToExcelProps) => {
  const handleDownloadExcel = () => {
    const normalizedData = normalizeData(data);

    const worksheet = XLSX.utils.json_to_sheet(normalizedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || "Sheet1");

    XLSX.writeFile(workbook, fileName || "data.xlsx");
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
