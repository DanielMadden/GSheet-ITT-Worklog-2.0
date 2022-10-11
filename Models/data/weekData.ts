import DayData from "./dayData";

export default interface WeekDataType {
  monthId: number;
  dayRange: string;
  daysOfMonth?: number[];
  totalHours: number;
  summary: object;
  daysDataArray: DayData[];
}
