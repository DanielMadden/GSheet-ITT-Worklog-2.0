import DayData from "./dayData";

export default interface WeekDataType {
  monthId: number;
  dayRange: string;
  daysOfMonth?: number[];
  totalHours: number;
  daysDataArray: DayData[];
}
