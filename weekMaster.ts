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

        // console.log(`startHours: ${startHours}`);

        // Check if endTime is a date
        if (rawEntryData.endTime instanceof Date) {
          endHours = rawEntryData.endTime.getHours() + 1;
          if (endHours == 24) endHours = 0; // LITERALLY just for the zero time.
          endMinutes = rawEntryData.endTime.getMinutes();

          // console.log(`endHours: ${endHours}`);

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
      if (entriesArray[i].time !== 0) {
        sheet
          .getRange(currentRow, columns.summaryEntryTime)
          .setNumberFormat("#0.##")
          .setValue(entriesArray[i].time);
      }
    } else {
      console.log(weekData.liveEntry);
      if (weekData.liveEntry !== undefined) {
        let previousDurationInMinutes = decimalToHHMM(entriesArray[i].time);
        let startTimeInMinutes = decimalToHHMM(
          weekData.liveEntry.startTimeAsDecimal
        );

        sheet
          .getRange(currentRow, columns.summaryEntryTime)
          // .setNumberFormat("HH:mm")
          .setNumberFormat("#0.##")
          .setFormula(
            `=MULTIPLY(SUM(MINUS(TIMEVALUE(NOW()),TIMEVALUE("${startTimeInMinutes}")),TIMEVALUE("${previousDurationInMinutes}"))),24)`
          );
      }
    }
    if (!isLive) {
      if (percentageWeighedAgainst !== 0) {
        sheet
          .getRange(currentRow, columns.summaryEntryPercentage)
          .setNumberFormat("#.##%")
          .setValue(entriesArray[i].time / percentageWeighedAgainst);
      }
    } else {
      sheet
        .getRange(currentRow, columns.summaryEntryPercentage)
        .setValue("LIVE");
    }
  }

  function insertLiveEntryAtCurrentRow() {
    let startTimeInMinutes = "";
    if (weekData.liveEntry !== undefined) {
      startTimeInMinutes = decimalToHHMM(weekData.liveEntry.startTimeAsDecimal);
      sheet
        .getRange(currentRow, columns.summaryEntryName)
        .setValue(weekData.liveEntry.name);
      sheet
        .getRange(currentRow, columns.summaryEntryTime)
        // .setNumberFormat("HH:mm")
        .setNumberFormat("#0.##")
        .setFormula(
          `=MULTIPLY(MINUS(TIMEVALUE(NOW()),TIMEVALUE("${startTimeInMinutes}")),24)`
        );
      sheet
        .getRange(currentRow, columns.summaryEntryPercentage)
        .setValue("LIVE");
    }
  }

  function findLiveEntryNameInSummaryArray(entry: EntryType) {
    return entry.name == weekData.liveEntry?.name;
  }

  function writeWeekSummary() {
    for (let i = 0; i < sortedWeekSummaryEntries.length; i++) {
      let isLive: boolean = false;
      if (
        weekData.liveEntry !== undefined &&
        sortedWeekSummaryEntries[i].name == weekData.liveEntry.name
      ) {
        isLive = true;
      }

      insertSummaryDataAtCurrentRow(
        i,
        sortedWeekSummaryEntries,
        "week",
        isLive
      );

      currentRow++;
    }
    if (
      weekData.liveEntry !== undefined &&
      sortedWeekSummaryEntries.find(findLiveEntryNameInSummaryArray) ==
        undefined
    ) {
      insertLiveEntryAtCurrentRow();
      currentRow++;
    }

    daySummaries.forEach((daySummary: EntryType[]) => {
      currentRow++;
      let isLive: boolean = false;
      if (
        daySummary.length > 1 ||
        (weekData.liveEntry !== undefined &&
          weekData.liveEntry.day == daySummary[0].name)
      ) {
        for (let i = 0; i < daySummary.length; i++) {
          if (
            weekData.liveEntry !== undefined &&
            weekData.liveEntry.day == daySummary[0].name &&
            weekData.liveEntry.name == daySummary[i].name
          ) {
            isLive = true;
          }
          insertSummaryDataAtCurrentRow(i, daySummary, "day", isLive);
          isLive = false;
          currentRow++;
        }
      }
      if (
        weekData.liveEntry !== undefined &&
        weekData.liveEntry.day == daySummary[0].name &&
        daySummary.find(findLiveEntryNameInSummaryArray) == undefined
      ) {
        insertLiveEntryAtCurrentRow();
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
