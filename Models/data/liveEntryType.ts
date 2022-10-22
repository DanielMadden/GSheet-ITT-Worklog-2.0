export default interface LiveEntryType {
  day:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  name: string;
  startTime: Date;
  startTimeAsDecimal: number;
}
