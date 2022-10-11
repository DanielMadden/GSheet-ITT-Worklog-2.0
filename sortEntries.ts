// import EntryType from "./models/data/stat";

function convertEntrySummaryToSortedArray(entriesObject: {}) {
  function convertEntrySummaryToArray(): {
    name: string;
    time: number;
  }[] {
    let entriesArray: { name: string; time: number }[] = [];
    for (let entryName in entriesObject) {
      entriesArray.push({
        name: entryName,
        time: entriesObject[entryName],
      });
    }
    return entriesArray;
  }
  function sortEntryArray(
    entriesArray: { name: string; time: number }[]
  ): { name: string; time: number }[] {
    entriesArray.sort((a, b) => {
      return b.time - a.time;
    });
    return entriesArray;
  }
  return sortEntryArray(convertEntrySummaryToArray());
}
