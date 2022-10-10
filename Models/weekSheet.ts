import weekData from "./data/weekData";

interface WeekSheetType {
  sheetName: string;
  data: weekData;

  getData(): weekData;
  writeData(): void;
}
class WeekSheet implements WeekSheetType {
  sheetName: string;
  data: weekData;
  constructor(sheetName: string, data: weekData) {
    this.sheetName = sheetName;
    this.sheet = SpreadsheetApp.getActive().getSheetByName(this.sheetName);
    this.data = data;
  }

  getData(): weekData {}

  writeData(): void {}
}
