import DayDataType from "./models/data/dayData";
import WeekDataType from "./models/data/weekData";
import EntryType from "./models/data/stat";
import { sheets } from "googleapis/build/src/apis/sheets";
import RawEntryDataType from "./models/data/rawEntryData";

// @ts-ignore
// var sheet = SpreadsheetApp.getActive().getActiveSheet();
var sheet = SpreadsheetApp.getActive().getSheetByName("✅ 10 || 03 - 07");
var sheetName = sheet.getName();

let rows = {
  dayName: 2,
  totalHours: 3,
  headers: 5,
  entries: 6,
  summary: 7,
};

let columns = {
  summaryStart: 1,
  summaryEnd: 3,
  daysStart: 4,
};

let currentColumn = columns.daysStart;
let currentRow = rows.entries;

let weekData: WeekDataType;

function weekMaster() {
  getWeekData();
  writeWeekData();
}

function getWeekData() {
  let thereIsANextDay = true;
  let dayOfWeek = 1;

  let weekData: WeekDataType = {
    monthId: 1,
    dayRange: "03 - 07",
    totalHours: 0,
    daysDataArray: [],
  };

  //   NOTE getDayData
  function getDayData(): DayDataType {
    let thereIsANextEntry = true;
    currentRow = rows.entries;

    let dayData: DayDataType = {
      day: sheet.getRange(rows.dayName, currentColumn).getValue(),
      entries: [],
    };

    // NOTE getEntryData
    function getEntryData(): EntryType | undefined {
      // Grab the raw cell data
      let rawEntryData: RawEntryDataType = getEntryAtRow();

      //   NOTE getRawEntryData
      function getEntryAtRow(): RawEntryDataType {
        let name = sheet.getRange(currentRow, currentColumn).getValue();
        let startTime = sheet
          .getRange(currentRow, currentColumn + 1)
          .getValue();
        let endTime = sheet.getRange(currentRow, currentColumn + 2).getValue();

        return {
          name: name,
          startTime: startTime,
          endTime: endTime,
        };
      }

      //   If neither start or end cells are dates, return undefined.
      if (
        !(rawEntryData.startTime instanceof Date) ||
        !(rawEntryData.endTime instanceof Date)
      )
        return;

      let startHours = rawEntryData.startTime.getHours() + 1;
      let startMinutes = rawEntryData.startTime.getMinutes();

      let endHours = rawEntryData.endTime.getHours() + 1;
      let endMinutes = rawEntryData.endTime.getMinutes();

      let duration = endHours - startHours + (endMinutes - startMinutes) / 60;

      console.log("name: " + rawEntryData.name);
      console.log("duration: " + duration);

      return {
        name: rawEntryData.name,
        time: duration,
      };
    }

    while (thereIsANextEntry) {
      // Run a pre-entry check to see if this is a valid entry
      let preEntryCheck = getEntryData();
      if (preEntryCheck !== undefined) {
        let entry: EntryType = preEntryCheck;
        dayData.entries.push(entry);
      }
      if (!sheet.getRange(currentRow + 1, currentColumn).getValue())
        thereIsANextEntry = false;
      currentRow++;
    }

    console.log(dayData);

    return dayData;
  }

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

function writeWeekData(): void {
  sheet.getRange("A" + rows.summary + ":C100").setValue("");
}
