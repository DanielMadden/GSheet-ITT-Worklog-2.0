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
  entries: EntryType[];
}
