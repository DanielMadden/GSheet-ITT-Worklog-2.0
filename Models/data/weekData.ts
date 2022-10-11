import DayData from "./dayData";

export default interface WeekDataType {
  monthId: number;
  dateRange: string;
  datesOfMonth?: number[];
  totalHours: number;
  summary: object;
  daysDataArray: DayData[];
}
