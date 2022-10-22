import EntryType from "./stat";

export default interface DayDataType {
  day:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  monthId?: number;
  dayOfMonthId?: number;
  totalHours: number;
  summary: object;
  entries: EntryType[];
}
