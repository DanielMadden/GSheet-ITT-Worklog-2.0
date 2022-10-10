import DayDataType from "./models/data/dayData";
import WeekDataType from "./models/data/weekData";
import EntryType from "./models/data/stat";
import { sheets } from "googleapis/build/src/apis/sheets";

// @ts-ignore
// var sheet = SpreadsheetApp.getActive().getActiveSheet();
var sheet = SpreadsheetApp.getActive().getSheetByName("✅ 10 || 03 - 07");
var sheetName = sheet.getName();

let startingColumn = 4;
let startingTimeRow = 6;
let startingStatsCanvasRow = 6;
let startingStatsRow = 6;

let currentColumn = startingColumn;
let currentRow = startingStatsRow;

let weekData: WeekDataType;

function weekMaster() {
  getWeekData();
}

function getWeekData() {
  let thereIsANextDay = true;
  let dayOfWeek = 1;

  getDayData();

  //   while (thereIsANextDay) {
  //     let dayColumnEnd = dayOfWeek++;
  //   }
}

function getDayData() {
  let thereIsANextEntry = true;
  currentRow = startingStatsRow;
  currentColumn = startingColumn;

  let stat: EntryType = getEntryData();
  console.log(stat);

  //   while (thereIsANextEntry) {

  //     let stat: EntryType = getEntryData();
  //     currentRow++;
  //   }
}

function getEntryData(): EntryType {
  console.log("sheet: " + sheet);
  console.log("sheetName: " + sheetName);

  let name = sheet.getRange(currentRow, currentColumn).getValue();
  let startTime = sheet.getRange(currentRow, currentColumn + 1).getValue();
  let endTime = sheet.getRange(currentRow, currentColumn + 2).getValue();

  console.log("name: " + name);
  console.log("startTime: " + startTime);
  console.log("endTime: " + endTime);

  let startHours = startTime.getHours() + 1;
  let startMinutes = startTime.getMinutes();

  let endHours = endTime.getHours() + 1;
  let endMinutes = endTime.getMinutes();

  let duration = endHours - startHours + (endMinutes - startMinutes) / 60;

  return {
    name: name,
    time: duration,
  };
}
