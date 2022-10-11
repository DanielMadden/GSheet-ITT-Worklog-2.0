import DayDataType from "./models/data/dayData";
import WeekDataType from "./models/data/weekData";
import EntryType from "./models/data/stat";
import { sheets } from "googleapis/build/src/apis/sheets";
import RawEntryDataType from "./models/data/rawEntryData";
// import { splitWeekName } from "./splitWeekName";
import SheetNameSplitData from "./models/data/sheetNameSplitData";

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
  if (
    sheetName.includes("Summary") ||
    sheetName.includes("Template") ||
    sheetName.includes("Formatting")
  )
    return;
  getWeekData();
  writeWeekData();
}

// ANCHOR getWeekData()
function getWeekData() {
  let thereIsANextDay = true;
  let dayOfWeek = 1;

  let sheetNameSplit: SheetNameSplitData = splitWeekName(sheetName);

  let weekData: WeekDataType = {
    monthId: sheetNameSplit.monthID,
    dateRange: sheetNameSplit.dateRange,
    datesOfMonth: sheetNameSplit.dates,
    totalHours: 0,
    summary: {},
    daysDataArray: [],
  };

  //   ANCHOR getDayData()
  function getDayData(): DayDataType {
    let thereIsANextEntry = true;
    currentRow = rows.entries;

    let dayData: DayDataType = {
      day: sheet.getRange(rows.dayName, currentColumn).getValue(),
      summary: {},
      entries: [],
    };

    // ANCHOR getEntryData()
    function getEntryData(): EntryType | undefined {
      // Grab the raw cell data
      let rawEntryData: RawEntryDataType = getEntryAtRow();

      //   ANCHOR getRawEntryData()
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

      debug("name: " + rawEntryData.name);
      debug("duration: " + duration);

      return {
        name: rawEntryData.name,
        time: duration,
      };
    }

    // ANCHOR addEntryToDaySummary()
    function addEntryToDaySummary(entry: EntryType): void {
      if (!dayData.summary[entry.name]) dayData.summary[entry.name] = 0;
      dayData.summary[entry.name] += entry.time;
    }

    // ANCHOR addEntryToWeekSummary()
    function addEntryToWeekSummary(entry: EntryType): void {
      if (!weekData.summary[entry.name]) weekData.summary[entry.name] = 0;
      weekData.summary[entry.name] += entry.time;
    }

    while (thereIsANextEntry) {
      let preEntryCheck = getEntryData();
      if (preEntryCheck !== undefined) {
        let entry: EntryType = preEntryCheck;
        dayData.entries.push(entry);
        addEntryToDaySummary(entry);
        addEntryToWeekSummary(entry);
      }
      if (!sheet.getRange(currentRow + 1, currentColumn).getValue())
        thereIsANextEntry = false;
      currentRow++;
    }

    debug(dayData);

    return dayData;
  }

  while (thereIsANextDay) {
    let dayData: DayDataType = getDayData();
    weekData.daysDataArray.push(dayData);
    if (!sheet.getRange(rows.dayName, currentColumn + 3).getValue())
      thereIsANextDay = false;
    currentColumn = columns.daysStart + 3 * dayOfWeek;
    dayOfWeek++;
  }

  debug(weekData);

  return weekData;
}

function writeWeekData(): void {
  // sheet.getRange("A" + rows.summary + ":C100").setValue("");
}
