// import SheetNameSplitData from "./models/data/sheetNameSplitData";

function splitWeekName(sheetName): {
  monthID: number;
  dateRange: string;
  dates: number[];
} {
  let sheetNameSplit: string = sheetName.split(" || ");
  let monthId: number = parseInt(sheetNameSplit[0].split(" ")[1]);
  let dateRange: string = sheetNameSplit[1];
  let startDate: number = parseInt(sheetNameSplit[1].split(" - ")[0]);
  let endDate: number = parseInt(sheetNameSplit[1].split(" - ")[1]);
  let dates: number[] = [];
  for (let i: number = startDate; i <= endDate; i++) {
    dates.push(i);
  }

  return {
    monthID: monthId,
    dateRange: dateRange,
    dates: dates,
  };
}
