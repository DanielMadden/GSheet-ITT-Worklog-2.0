import DayData from "./dayData";
import LiveEntryType from "./liveEntryType";

export default interface WeekDataType {
  monthId: number;
  dateRange: string;
  datesOfMonth?: number[];
  totalHours: number;
  summary: object;
  liveEntry?: LiveEntryType;
  daysDataArray: DayData[];
}
