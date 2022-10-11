// import weekData from "./data/weekData";

// interface WeekSheetType {
//   sheetName: string;
//   data: weekData;

//   getData(): void;
//   writeData(): void;
// }

// export class WeekSheet implements WeekSheetType {
//   sheetName: string;
//   sheet: any;
//   data: weekData;
//   constructor(sheetName: string) {
//     this.sheetName = sheetName;
//     // @ts-ignore
//     this.sheet = SpreadsheetApp.getActive().getSheetByName(this.sheetName);
//     // this.data = data;
//   }

//   getData(): void {
//     let startingColumn = 3;
//     let startingTimeRow = 6;
//     let startingStatsCanvasRow = 6;
//     let startingStatsRow = 7;
//     let stats = {};
//     // Cycle through the days
//     // TODO make this universal without needing a preset array.
//     // NOTE how would it know when to stop? Check t o see if there's any more data.
//     let days = [
//       "Monday",
//       "Tuesday",
//       "Wednesday",
//       "Thursday",
//       "Friday",
//       "Saturday",
//       "Sunday",
//     ];
//     days.forEach((day, index) => {
//       let columnEnd = startingColumn + (index + 1) * 3;
//       stats[day] = {};
//       stats[day].name = day;
//       stats[day].data = this.getDayData(columnEnd);
//     });
//     console.log(stats);
//     // return stats;
//   }

//   getDayData(columnEnd) {
//     let columnStart = columnEnd - 2;
//     let data = sheet.getRange(startingTimeRow, columnStart, 100, 3).getValues();
//     let CategoryTimes = {};
//     let stillData = true;
//     for (let i = 0; i < data.length && stillData; i++) {
//       let row = data[i];
//       if (row[0] == "") !stillData;
//       else {
//         let Category = row[0];
//         let startCell = row[1];
//         let startHours = 0;
//         let startMinutes = 0;
//         if (typeof startCell !== "string") {
//           startHours = startCell.getHours() + 1;
//           startMinutes = startCell.getMinutes();
//         }
//         let endCell = row[2];
//         let endHours = 0;
//         let endMinutes = 0;
//         if (typeof endCell !== "string") {
//           endHours = endCell.getHours() + 1;
//           endMinutes = endCell.getMinutes();
//         }
//         let duration = endHours - startHours + (endMinutes - startMinutes) / 60;
//         if (duration > 0) {
//           if (CategoryTimes[Category]) {
//             CategoryTimes[Category] += duration;
//           } else {
//             CategoryTimes[Category] = duration;
//           }
//         }
//       }
//     }
//     return CategoryTimes;
//   }

//   writeData(): void {}
// }
