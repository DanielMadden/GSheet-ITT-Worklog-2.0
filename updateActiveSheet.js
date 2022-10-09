var testing = false;

var sheet = SpreadsheetApp.getActive().getActiveSheet();
if (testing) sheet = SpreadsheetApp.getActive().getSheetByName("07 || 1 - 5");
var sheetName = sheet.getName();

let startingColumn = 3;
let startingTimeRow = 6;
let startingStatsCanvasRow = 6;
let startingStatsRow = 7;

function updateActiveSheet() {
  if (sheetName.includes("Summary") || sheetName == "Template") return;
  let stats = calculateStats();
  let currentRow = startingStatsRow;
  sheet.getRange("A" + startingStatsCanvasRow + ":C100").setValue("");
  console.log(sheet.getRange("A" + startingStatsCanvasRow + ":A100"));
  // sheet.getRange(('A' + (startingStatsCanvasRow + 1))).setValue('Updating...')
  sheet.getRange("A" + currentRow).setValue("Updating...");
  for (let day in stats) {
    if (Object.keys(stats[day].data).length) {
      for (let stat in stats[day]) {
        if (stat == "name") {
          sheet.getRange("A" + currentRow).setValue(stats[day][stat]);
        }
        if (stat == "data") {
          for (let data in stats[day][stat]) {
            sheet.getRange("A" + currentRow).setValue(data);
            sheet.getRange("B" + currentRow).setValue(stats[day][stat][data]);
            currentRow++;
            let threeRowString = "A" + currentRow + ":" + "C" + currentRow;
            sheet.getRange(threeRowString).setValue("");
          }
        }
        currentRow++;
        let threeRowString = "A" + currentRow + ":" + "C" + currentRow;
        sheet.getRange(threeRowString).setValue("");
      }
    }
  }
  // sheet.getRange('A' + currentRow).setValue('Stats Updated.')
}
function calculateStats() {
  let days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  let stats = {
    // Monday : {
    //   name: "Monday",
    //   total: 0,
    //   data: []
    // }
  };
  days.forEach((day, index) => {
    let columnEnd = startingColumn + (index + 1) * 3;
    stats[day] = {};
    stats[day].name = day;
    stats[day].data = getDayData(columnEnd);
  });
  return stats;
}
function getDayData(columnEnd) {
  let columnStart = columnEnd - 2;
  let data = sheet.getRange(startingTimeRow, columnStart, 100, 3).getValues();
  let CategoryTimes = {};
  let stillData = true;
  for (let i = 0; i < data.length && stillData; i++) {
    let row = data[i];
    if (row[0] == "") !stillData;
    else {
      let Category = row[0];
      let startCell = row[1];
      let startHours = 0;
      let startMinutes = 0;
      // console.log(typeof(startCell))
      if (typeof startCell !== "string") {
        startHours = startCell.getHours() + 1;
        startMinutes = startCell.getMinutes();
      }
      let endCell = row[2];
      let endHours = 0;
      let endMinutes = 0;
      if (typeof endCell !== "string") {
        endHours = endCell.getHours() + 1;
        endMinutes = endCell.getMinutes();
      }
      let duration = endHours - startHours + (endMinutes - startMinutes) / 60;
      if (duration > 0) {
        if (CategoryTimes[Category]) {
          CategoryTimes[Category] += duration;
        } else {
          CategoryTimes[Category] = duration;
        }
      }
    }
  }
  return CategoryTimes;
}
