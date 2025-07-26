import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";
import { parse as parseCSV } from "csv-parse/sync";

export const parseCsvExcelFile = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".csv") {
    // CSV Parsing
    const csvContent = fs.readFileSync(filePath, "utf8");
    const records = parseCSV(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    return records;

  } else if (ext === ".xlsx") {
    // Excel Parsing
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];

    const headers = [];
    const data = [];

    worksheet.eachRow((row, rowNumber) => {
      const values = row.values.slice(1);

      if (rowNumber === 1) {
        headers.push(...values);
      } else {
        const rowData = {};
        headers.forEach((key, i) => {
          rowData[key] = values[i] ?? null;
        });
        data.push(rowData);
      }
    });

    return data;

  } else {
    throw new Error("Unsupported file type. Only .csv and .xlsx are allowed.");
  }
};


