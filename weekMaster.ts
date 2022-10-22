import DayDataType from "./models/data/dayData";
import WeekDataType from "./models/data/weekData";
import EntryType from "./models/data/stat";
import { sheets } from "googleapis/build/src/apis/sheets";
import RawEntryDataType from "./models/data/rawEntryData";
// import { splitWeekName } from "./splitWeekName";
import SheetNameSplitData from "./models/data/sheetNameSplitData";
import LiveEntryType from "./models/data/liveEntryType";

// @ts-ignore
var sheet = SpreadsheetApp.getActive().getActiveSheet();
// var sheet = SpreadsheetApp.getActive().getSheetByName("✅ 10 || 03 - 07");
var sheetName = sheet.getName();

let rows = {
  dayName: 2,
  totalHours: 3,
  headers: 5,
  entries: 6,
  summary: 6,
};

let columns = {
  summaryEntryName: 1,
  summaryEntryTime: 2,
  summaryEntryPercentage: 3,
  daysStart: 4,
};

let currentColumn = columns.daysStart;
let currentRow = rows.entries;

let weekData: WeekDataType;

async function weekMaster() {
  if (
    sheetName.includes("Summary") ||
    sheetName.includes("Template") ||
    sheetName.includes("Formatting")
  )
    return;
  writeUpdatingStatus();
  weekData = await getWeekData();
  writeWeekData();
}

// ANCHOR writeUpdatingStatus()
function writeUpdatingStatus() {
  sheet.getRange("A" + rows.summary + ":C100").setValue("");
  sheet.getRange("A" + rows.summary).setValue("Updating...");
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
      totalHours: 0,
      day: sheet.getRange(rows.dayName, currentColumn).getValue(),
      summary: {},
      entries: [],
    };

    // ANCHOR getEntryData()
    function getEntryData(): EntryType | LiveEntryType | undefined {
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

      // Check if startTime is a date
      if (rawEntryData.startTime instanceof Date) {
        let startHours;
        let startMinutes;
        let endHours;
        let endMinutes;
        let duration;

        startHours = rawEntryData.startTime.getHours() + 1;
        if (startHours == 24) startHours = 0; // LITERALLY just for the zero time.
        startMinutes = rawEntryData.startTime.getMinutes();

        // Check if endTime is a date
        if (rawEntryData.endTime instanceof Date) {
          endHours = rawEntryData.endTime.getHours() + 1;
          endMinutes = rawEntryData.endTime.getMinutes();

          duration = endHours - startHours + (endMinutes - startMinutes) / 60;
        } else if (rawEntryData.endTime == "") {
          return {
            day: dayData.day,
            name: rawEntryData.name,
            startTime: rawEntryData.startTime,
            startTimeAsDecimal: startHours + startMinutes / 60,
          };
        }

        debug("name: " + rawEntryData.name);
        debug("duration: " + duration);

        return {
          name: rawEntryData.name,
          time: duration,
        };
      }

      // See if endTime is empty
      // if (rawEntryData.endTime == "")
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

    // ANCHOR addEntryTimeToDayTotalHours()
    function addEntryTimeToDayTotalHours(entry: EntryType): void {
      dayData.totalHours += entry.time;
    }

    // ANCHOR addEntryTimeToWeekTotalHours()
    function addEntryTimeToWeekTotalHours(entry: EntryType): void {
      weekData.totalHours += entry.time;
    }

    while (thereIsANextEntry) {
      let preEntryCheck = getEntryData();
      if (preEntryCheck !== undefined) {
        function instanceOfEntryType(data: any): data is EntryType {
          return "time" in data;
        }
        if (instanceOfEntryType(preEntryCheck)) {
          let entry: EntryType = preEntryCheck;
          dayData.entries.push(entry);
          addEntryToDaySummary(entry);
          addEntryToWeekSummary(entry);
          addEntryTimeToDayTotalHours(entry);
          addEntryTimeToWeekTotalHours(entry);
        } else {
          let liveEntry: LiveEntryType = preEntryCheck;
          weekData.liveEntry = liveEntry;
        }
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

// ANCHOR writeWeekData()
function writeWeekData(): void {
  sheet.getRange("A" + rows.summary + ":C100").setValue("");

  currentRow = rows.summary;

  // Sort Week Summary
  let sortedWeekSummaryEntries: EntryType[] = convertEntrySummaryToSortedArray(
    weekData.summary
  );
  // Add Total Hours to Week Summary
  sortedWeekSummaryEntries.unshift({
    name: "Total Hours",
    time: weekData.totalHours,
  });

  // Do the exact same thing, but for the individual days
  let daySummaries: EntryType[][] = [];
  weekData.daysDataArray.forEach((dayData: DayDataType) => {
    let sortedDaySummaryEntries: EntryType[] = convertEntrySummaryToSortedArray(
      dayData.summary
    );
    sortedDaySummaryEntries.unshift({
      name: dayData.day,
      time: dayData.totalHours,
    });
    daySummaries.push(sortedDaySummaryEntries);
  });

  function insertSummaryDataAtCurrentRow(
    i: number,
    entriesArray: EntryType[],
    type: "week" | "day",
    isLive: boolean
  ) {
    let percentageWeighedAgainst;
    if (type == "week" || (type == "day" && i == 0)) {
      percentageWeighedAgainst = weekData.totalHours;
    } else if (type == "day") {
      percentageWeighedAgainst = entriesArray[0].time;
    }
    sheet
      .getRange(currentRow, columns.summaryEntryName)
      .setValue(entriesArray[i].name);
    if (!isLive) {
      sheet
        .getRange(currentRow, columns.summaryEntryTime)
        .setNumberFormat("#0.##")
        .setValue(entriesArray[i].time);
    } else {
      console.log(weekData.liveEntry);
      if (weekData.liveEntry !== undefined) {
        // let localDateString = new Date().toLocaleString("en-US", {
        //   timeZone: "America/Boise",
        // });
        // let localDate = new Date(localDateString);
        // let currentHours =
        //   entriesArray[i].time -
        //   weekData.liveEntry.startTimeAsDecimal +
        //   (localDate.getHours() + localDate.getMinutes() / 60);
        // console.log("SUCCESS");
        // console.log(`currentHours: ${currentHours}`);
        // console.log(`entriesArray[i].time: ${entriesArray[i].time}`);
        // console.log(
        //   `weekData.liveEntry.startTimeAsDecimal: ${weekData.liveEntry.startTimeAsDecimal}`
        // );
        // console.log(
        //   `new Date().getHours() + new Date().getMinutes() / 60: ${
        //     new Date().getHours() + new Date().getMinutes() / 60
        //   }`
        // );

        // let timeObject = decimalToHoursAndMinutesObject(entriesArray[i].time);
        // let time = new Date();
        // time.setHours(timeObject.hours, timeObject.minutes);

        let previousDurationInMinutes = decimalToHHMM(entriesArray[i].time);
        let startTimeInMinutes = decimalToHHMM(
          weekData.liveEntry.startTimeAsDecimal
        );

        sheet
          .getRange(currentRow, columns.summaryEntryTime)
          .setNumberFormat("HH:mm")
          .setFormula(
            `=SUM(MINUS(TIMEVALUE(NOW()),TIMEVALUE("${startTimeInMinutes}")),TIMEVALUE("${previousDurationInMinutes}"))`
          );
      }
    }
    // TODO USE SET FORMULA FOR THIS SHIT
    if (!isLive) {
      sheet
        .getRange(currentRow, columns.summaryEntryPercentage)
        .setNumberFormat("#.##%")
        .setValue(entriesArray[i].time / percentageWeighedAgainst);
    } else {
      sheet
        .getRange(currentRow, columns.summaryEntryPercentage)
        .setValue("LIVE");
    }
  }

  function writeWeekSummary() {
    for (let i = 0; i < sortedWeekSummaryEntries.length; i++) {
      let isLive: boolean = false;
      if (
        weekData.liveEntry !== undefined &&
        sortedWeekSummaryEntries[i].name == weekData.liveEntry.name
      )
        isLive = true;

      insertSummaryDataAtCurrentRow(
        i,
        sortedWeekSummaryEntries,
        "week",
        isLive
      );

      currentRow++;
    }
    daySummaries.forEach((daySummary: EntryType[]) => {
      currentRow++;
      for (let i = 0; i < daySummary.length; i++) {
        insertSummaryDataAtCurrentRow(i, daySummary, "day", false);
        currentRow++;
      }
    });
  }

  function writeJSONAtBottom() {
    sheet.getRange(99, columns.summaryEntryName).setValue("JSON");
    sheet.getRange(99, columns.summaryEntryTime).setValue("⬇");
    sheet.getRange(99, columns.summaryEntryPercentage).setValue("⬇");
    sheet
      .getRange(100, columns.summaryEntryName)
      .setValue(JSON.stringify(weekData));
  }

  writeWeekSummary();
  writeJSONAtBottom();
}
