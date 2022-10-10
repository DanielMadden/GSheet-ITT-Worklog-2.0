// // For Testing
// var testing = false;
// // Get Active Sheet
// var sheet = SpreadsheetApp.getActive().getActiveSheet();
// // If Testing, grab specific sheet
// if (testing) sheet = SpreadsheetApp.getActive().getSheetByName("07 || 1 - 5");
// // Get the sheet name
// var sheetName = sheet.getName();

// // TODO Starting Rows and Columns; this needs to be moved up to master, and I'd like to use the per-grid strategry I used in the summary updater.
// let startingColumn = 3;
// let startingTimeRow = 6;
// let startingStatsCanvasRow = 6;
// let startingStatsRow = 7;

// function updateWeekSheet() {
//   // If sheet is not a week sheet, don't include it
//   if (
//     sheetName.includes("Summary") ||
//     sheetName.includes("Template") ||
//     sheetName.includes("Formatting")
//   )
//     return;
//   // Run a GET Stats.
//   // TODO Move this up to master, then pass it into updateWeekSheet
//   let stats = calculateStats();
//   // Segregate this into a "writeData()"
//   let currentRow = startingStatsRow;
//   sheet.getRange("A" + startingStatsCanvasRow + ":C100").setValue("");
//   console.log(sheet.getRange("A" + startingStatsCanvasRow + ":A100"));
//   sheet.getRange("A" + currentRow).setValue("Updating...");
//   for (let day in stats) {
//     if (Object.keys(stats[day].data).length) {
//       for (let stat in stats[day]) {
//         if (stat == "name") {
//           sheet.getRange("A" + currentRow).setValue(stats[day][stat]);
//         }
//         if (stat == "data") {
//           for (let data in stats[day][stat]) {
//             sheet.getRange("A" + currentRow).setValue(data);
//             sheet.getRange("B" + currentRow).setValue(stats[day][stat][data]);
//             currentRow++;
//             let threeRowString = "A" + currentRow + ":" + "C" + currentRow;
//             sheet.getRange(threeRowString).setValue("");
//           }
//         }
//         currentRow++;
//         let threeRowString = "A" + currentRow + ":" + "C" + currentRow;
//         sheet.getRange(threeRowString).setValue("");
//       }
//     }
//   }
// }

// // TODO This needs to move to master; should also be called "getStats"
// function calculateStats() {
//   // Preset days
//   // TODO this needs to be deprecated; the data will generate itself based on the names placed in the sheet, allowing for any order.
//   let days = [
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     "Saturday",
//     "Sunday",
//   ];
//   let stats = {};
//   // Cycle through the days
//   // TODO make this universal without needing a preset array.
//   // NOTE how would it know when to stop? Check t o see if there's any more data.
//   days.forEach((day, index) => {
//     let columnEnd = startingColumn + (index + 1) * 3;
//     stats[day] = {};
//     stats[day].name = day;
//     stats[day].data = getDayData(columnEnd);
//   });
//   console.log(stats);
//   return stats;
// }

// // NOTE function for grabbing a single day. Come back for refactoring.
// function getDayData(columnEnd) {
//   let columnStart = columnEnd - 2;
//   let data = sheet.getRange(startingTimeRow, columnStart, 100, 3).getValues();
//   let CategoryTimes = {};
//   let stillData = true;
//   for (let i = 0; i < data.length && stillData; i++) {
//     let row = data[i];
//     if (row[0] == "") !stillData;
//     else {
//       let Category = row[0];
//       let startCell = row[1];
//       let startHours = 0;
//       let startMinutes = 0;
//       if (typeof startCell !== "string") {
//         startHours = startCell.getHours() + 1;
//         startMinutes = startCell.getMinutes();
//       }
//       let endCell = row[2];
//       let endHours = 0;
//       let endMinutes = 0;
//       if (typeof endCell !== "string") {
//         endHours = endCell.getHours() + 1;
//         endMinutes = endCell.getMinutes();
//       }
//       let duration = endHours - startHours + (endMinutes - startMinutes) / 60;
//       if (duration > 0) {
//         if (CategoryTimes[Category]) {
//           CategoryTimes[Category] += duration;
//         } else {
//           CategoryTimes[Category] = duration;
//         }
//       }
//     }
//   }
//   return CategoryTimes;
// }
