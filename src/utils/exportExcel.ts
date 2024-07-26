import ExcelJS from 'exceljs'
import { IMembersInfo } from '../service/types'
import { Response } from 'express'
import log from './logger'
import { IStateRecord } from '../model/box.model'

export async function exportExcel(membersInfo: IMembersInfo, res: Response){
try {
  let {members, boxName} = membersInfo
  boxName = convertBoxToArabic(boxName)

  // Create and configure the Excel workbook
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('members')
  sheet.columns = [
    {header: 'Id', key: 'id', width: 10, },
    {header: 'First Name', key: 'firstName', width: 25},
    {header: 'Last Name', key: 'lastName', width: 25},
    {header: 'SSN', key: 'ssn', width: 15},
    {header: 'State', key: 'ARState', width: 15},
  ]

  // Set the main header for the worksheet
  const numColumns = sheet.columns.length
  const mergeRange = `A1:${String.fromCharCode(65 + numColumns - 1)}1`
  sheet.mergeCells(mergeRange)

  const headerCell = sheet.getCell('A1');
  headerCell.value = boxName;
  headerCell.font = { bold: true, size: 14 };
  headerCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'ff4f81bd' } 
  };
  
  // Style the table headers
  const headerRow = sheet.getRow(2);
  sheet.getRow(2).font = { bold: true, color: {argb: 'ff000000'} }
  sheet.getRow(1).font = { bold: true, color: {argb: 'ffffffff'}, size: 14}
  headerRow.values = ['رقم', 'الاسم الاول', 'الاسم الاخير', 'رقم الوطني', 'التصويت'];

  // Apply fill to the header cells in row 2
  headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'ffdaeef3' } // Blue background
    };
  });
  
  members.forEach((member, idx)=> {
    let {firstName, lastName, state, ssn} = member
    const ARState  = getState(state)
    sheet.addRow({id:idx + 1, firstName, lastName, ARState , ssn})
})

    // Set all cells to left alignment
    sheet.eachRow({ includeEmpty: true }, (row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      });
    });
    headerCell.alignment = { horizontal: 'center' };

  // Set response headers for Excel file download
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=members.xlsx');

  await workbook.xlsx.write(res)
  res.end()
} catch (error:any) {
  log.error('Error in exportExcel function: ', error.message)
  throw new Error(error)
}
}

function getState(state: IStateRecord){
  const {VOTE, NOT_VOTE, SECRET, OTHERS} = IStateRecord
switch(state){
  case VOTE :
    return 'نعم'
  case NOT_VOTE :
    return 'لا'
  case SECRET :
    return 'سري'
  case OTHERS :
    return 'للغير'
    default: 
    return 'غير معروف' // Default case to handle unexpected values
}
}

function convertBoxToArabic(boxName:string) {
    const startWithBox = boxName.startsWith('box')
    const match = boxName.match(/\d+/)
    const firstNumber = match ? Number(match[0]) : null

    if(startWithBox && firstNumber !== null){
      return `${firstNumber} صندوق`
    } else {
      return boxName;
    }
}