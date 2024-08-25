import ExcelJS from "exceljs";
import { IMembersInfo } from "../service/types";
import { Response } from "express";
import log from "./logger";
import { IStateRecord } from "../model/box.model";
import fs from "fs";
import path from "path";
import { uploadExcelToCloudinary } from "./upload";
import { ceil } from "lodash";

export async function exportExcel(
  membersInfo: IMembersInfo,
  envoyId: string,
  res: Response
) {
  try {
    let { members, boxName } = membersInfo;
    boxName = convertBoxToArabic(boxName);

    // Create and configure the Excel workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("members");
    sheet.columns = [
      { header: "Id", key: "id", width: 10 },
      { header: "First Name", key: "firstName", width: 25 },
      { header: "Second Name", key: "secondName", width: 25 },
      { header: "third Name", key: "thirdName", width: 25 },
      { header: "Last Name", key: "lastName", width: 25 },
      { header: "SSN", key: "ssn", width: 15 },
      { header: "State", key: "ARState", width: 15 },
    ];

    // Set the main header for the worksheet
    const numColumns = sheet.columns.length;
    const mergeRange = `A1:${String.fromCharCode(65 + numColumns - 1)}1`;
    sheet.mergeCells(mergeRange);

    const headerCell = sheet.getCell("A1");
    headerCell.value = boxName;
    headerCell.font = { bold: true, size: 14 };
    headerCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "ff4f81bd" },
    };

    // Style the table headers
    const headerRow = sheet.getRow(2);
    sheet.getRow(2).font = { bold: true, color: { argb: "ff000000" } };
    sheet.getRow(1).font = {
      bold: true,
      color: { argb: "ffffffff" },
      size: 14,
    };
    headerRow.values = [
      "رقم",
      "الاسم الاول",
      "الاسم الثاني",
      "الاسم الثالث",
      "الاسم الاخير",
      "رقم الوطني",
      "التصويت",
    ];

    // Apply fill to the header cells in row 2
    headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "ffdaeef3" }, // Blue background
      };
      cell.border = {
        left: { style: 'thin' },
        right: { style: 'thin' },
      }

    });
    sheet.getRow(2).eachCell((ceil, numRows)=> {
      ceil.border = {
        left: { style: 'thin' },
        right: { style: 'thin' },
      }
    })

    members.forEach((member, idx) => {
      let { firstName, secondName, thirdName, lastName, state, ssn } = member;
      const ARState = getState(state);
      const row = sheet.addRow({
        id: idx + 1,
        firstName,
        secondName,
        thirdName,
        lastName,
        ARState,
        ssn,
      });

      // style every state with special color
      row.eachCell(function (ceil, rowNumber) {
        ceil.border = {
          left: { style: 'thin' },
          right: { style: 'thin' },
        }

        if (rowNumber === numColumns) {
          const colorCode = getColorCode(ceil.value as string);
          ceil.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: colorCode }, // Blue background
          };
        }
      });
    });


    sheet.getRow(1).eachCell((ceil, colNumber)=> {
      ceil.border = {
        top: {style: 'thin'}
      }
    })
    sheet.getRow(members.length + 2).eachCell((ceil, colNumber)=> {
      ceil.border = {
        bottom: {style: 'thin'},
        left: {style: 'thin'},
        right: {style: 'thin'}
      }
    })

    // Set all cells to left alignment
    sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.alignment = { horizontal: "right", vertical: "middle" };
      });
    });
    headerCell.alignment = { horizontal: "center" };

    // Ensure the directory exists
    const tempDir = path.join(__dirname, "excelFile");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Save the workbook to temporary file
    const fileName = "members" + envoyId;
    const tempFilePath = path.join(tempDir, `${fileName}.xlsx`);

    await workbook.xlsx.writeFile(tempFilePath);

    // Response with the URL to download file
    const url = await uploadExcelToCloudinary(tempFilePath, fileName);

    // Clean up: remove the file after uploading
    fs.unlinkSync(tempFilePath);

    return { url, fileName };
  } catch (error: any) {
    log.error("Error in exportExcel function: ", error.message);
    throw new Error(error);
  }
}

function getState(state: IStateRecord) {
  const { VOTE, NOT_VOTE, SECRET, OTHERS } = IStateRecord;
  switch (state) {
    case VOTE:
      return "نعم";
    case NOT_VOTE:
      return "لا";
    case SECRET:
      return "سري";
    case OTHERS:
      return "للغير";
    default:
      return "غير معروف"; // Default case to handle unexpected values
  }
}

function getColorCode(state: string) {
  const colorMap: any = {
    لا: "ffffb09c",
    نعم: "ffa4ffa4",
    للغير: "ffeeeeee",
    سري: "ffeeeeee",
  };

  return colorMap[state] || "ffeeeeee";
}

function convertBoxToArabic(boxName: string) {
  const startWithBox = boxName.startsWith("box");
  const match = boxName.match(/\d+/);
  const firstNumber = match ? Number(match[0]) : null;

  if (startWithBox && firstNumber !== null) {
    return `${firstNumber} صندوق`;
  } else {
    return boxName;
  }
}
