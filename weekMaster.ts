import DayDataType from "./models/data/dayData";
import WeekDataType from "./models/data/weekData";
import EntryType from "./models/data/stat";
import { sheets } from "googleapis/build/src/apis/sheets";

// @ts-ignore
// var sheet = SpreadsheetApp.getActive().getActiveSheet();
var sheet = SpreadsheetApp.getActive().getSheetByName("✅ 10 || 03 - 07");
var sheetName = sheet.getName();

let startingColumn = 4;
// let startingTimeRow = 6;
// let startingStatsCanvasRow = 6;
// let startingStatsRow = 6;

let rows = {
  dayName: 2,
  totalHours: 3,
  headers: 5,
  entries: 6,
  summary: 7,
};

let columns = {
  summaryStart: 1,
  summaryEnd: 1,
  daysStart: 4,
};

let currentColumn = columns.daysStart;
let currentRow = rows.entries;

let weekData: WeekDataType;

function weekMaster() {
  getWeekData();
}

function getWeekData() {
  let thereIsANextDay = true;
  let dayOfWeek = 1;

  getDayData();

  let weekData: WeekDataType = {
    monthId: 1,
    dayRange: "03 - 07",
    totalHours: 0,
    daysDataArray: [],
  };

  while (thereIsANextDay) {
    currentColumn = columns.daysStart + 3 * dayOfWeek;
    let dayData: DayDataType = getDayData();
    weekData.daysDataArray.push(dayData);
    if (!sheet.getRange(rows.dayName, currentColumn + 3).getValue())
      thereIsANextDay = false;
    dayOfWeek++;
  }

  console.log(weekData);

  return weekData;
}

function getDayData(): DayDataType {
  let thereIsANextEntry = true;
  currentRow = rows.entries;

  let dayData: DayDataType = {
    day: sheet.getRange(rows.dayName, currentColumn).getValue(),
    entries: [],
  };

  while (thereIsANextEntry) {
    let entry: EntryType = getEntryData();
    dayData.entries.push(entry);
    if (!sheet.getRange(currentRow + 1, currentColumn).getValue())
      thereIsANextEntry = false;
    currentRow++;
  }

  return dayData;
}

function getEntryData(): EntryType {
  //   console.log("sheet: " + sheet);
  //   console.log("sheetName: " + sheetName);

  let name = sheet.getRange(currentRow, currentColumn).getValue();
  let startTime = sheet.getRange(currentRow, currentColumn + 1).getValue();
  let endTime = sheet.getRange(currentRow, currentColumn + 2).getValue();

  //   console.log("name: " + name);
  //   console.log("startTime: " + startTime);
  //   console.log("endTime: " + endTime);

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
