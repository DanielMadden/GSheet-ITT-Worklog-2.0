function updateSummary() {
  console.log('it worked mofo')
  var SummarySheet = SpreadsheetApp.getActive().getSheetByName("📈 Summary");

  var sheets = SpreadsheetApp.getActive().getSheets();

  let monthStats = {};

  let months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  function getData() {
    sheets.forEach((sheet) => {
      if (sheet.getName().includes("Summary")) return;

      // Get month number and week range as strings
      let sheetName = sheet.getName();
      let sheetNameSplit = sheetName.split(" || ");
      let monthNumber = sheetNameSplit[0].split(" ")[1];
      let dayRange = sheetNameSplit[1];

      let totalHours = 0;
      let stats = {};

      let rangeNumbers = sheet.getRange("B6:B100");
      let rangeCategories = sheet.getRange("A6:A100");

      // Get hours and category names
      let valuesNumbers = rangeNumbers.getValues();
      let valuesCategories = rangeCategories.getValues();

      valuesNumbers.forEach((value, index) => {
        if (value[0]) {
          let hours = value[0];
          let category = valuesCategories[index][0];

          if (!stats[category])
            stats[category] = {
              hours: 0,
              percentage: 0,
            };
          stats[category].hours = stats[category].hours + hours;
          totalHours = totalHours + hours;

          // Check for monthStat properties
          if (!monthStats[monthNumber]) monthStats[monthNumber] = {};
          if (!monthStats[monthNumber].totalHours)
            monthStats[monthNumber].totalHours = 0;
          if (!monthStats[monthNumber].totalCategories)
            monthStats[monthNumber].totalCategories = {};
          if (!monthStats[monthNumber].totalCategories[category])
            monthStats[monthNumber].totalCategories[category] = 0;

          // Set monthStats totals
          monthStats[monthNumber].totalHours =
            monthStats[monthNumber].totalHours + hours;
          monthStats[monthNumber].totalCategories[category] =
            monthStats[monthNumber].totalCategories[category] + hours;
        }
      });
      for (stat in stats) {
        stats[stat].percentage = (stats[stat].hours / totalHours) * 100;
      }

      if (!monthStats[monthNumber]) monthStats[monthNumber] = {};
      monthStats[monthNumber][dayRange] = {};
      monthStats[monthNumber][dayRange].totalHours = totalHours;
      monthStats[monthNumber][dayRange].categories = stats;
    });
    // monthStats[monthNumber].totalCategories
  }

  function writeData() {
    var sheet = SummarySheet;

    // Clear sheet
    sheet.getRange(1, 4, 100, 26 * 4 + 4).clearContent();

    // Sort months by most recent
    let sortedMonths = [];
    for (var month in monthStats) {
      sortedMonths.push(month);
    }
    sortedMonths.sort((a, b) => {
      if (parseInt(a) > parseInt(b)) return -1;
    });

    // Cycle through each month
    let activeColumn = 4;
    for (let i = 0; i < sortedMonths.length; i++) {
      let columnStart = activeColumn;
      let monthNum = sortedMonths[i];
      let data = monthStats[monthNum];
      let totalHours = data.totalHours;
      let totalCategories = data.totalCategories;

      let currentRow = 2;
      // Display Month Name
      sheet
        .getRange(currentRow, columnStart, 1, 3)
        .mergeAcross()
        .setHorizontalAlignment("center");
      sheet.getRange(currentRow, columnStart).setValue(months[monthNum - 1]);

      currentRow++;

      // Display Total Hours
      sheet
        .getRange(currentRow, columnStart, 1, 3)
        .mergeAcross()
        .setHorizontalAlignment("center");
      sheet
        .getRange(currentRow, columnStart)
        .setValue(Math.round(totalHours) + " Hrs");

      // Calculate project split
      let projects = {
        total: 0,
      };
      let projectNames = ["SKD", "SE", "DaaS"];
      projectNames.forEach((name) => {
        projects[name] = totalCategories[name];
        projects.total = projects.total + projects[name];
      });

      currentRow += 2;

      // Display project split
      sheet.getRange(currentRow, columnStart).setValue("Project Splits");
      currentRow++;
      projectNames.forEach((name) => {
        sheet.getRange(currentRow, columnStart).setValue(name);
        sheet
          .getRange(currentRow, columnStart + 1)
          .setValue(projects[name] / projects.total)
          .setNumberFormat("#.##%")
          .setHorizontalAlignment("left");
        currentRow++;
      });

      currentRow++;

      // Display 3-Column Headers
      sheet.getRange(currentRow, columnStart).setValue("Category");
      sheet.getRange(currentRow, columnStart + 1).setValue("Hours");
      sheet.getRange(currentRow, columnStart + 2).setValue("Percentage");

      // Make Array of Category Names
      let categories = [];
      for (let category in totalCategories) {
        categories.push(category);
      }

      // Sort the stats out by most hours
      let sortedStats = [];
      for (let i = 0; i < categories.length; i++) {
        let categoryName = categories[i];
        let hours = totalCategories[categoryName];
        let percentage = hours / totalHours;
        sortedStats.push({
          category: categoryName,
          hours: hours,
          percentage: percentage,
        });
      }
      sortedStats.sort((a, b) => {
        return b.hours - a.hours;
      });

      currentRow++;

      // Format all rows below
      // sheet.getRange(currentRow, columnStart).setValue(stat.category);
      sheet
        .getRange(currentRow, columnStart + 1, 100, 1)
        .setNumberFormat("#.##")
        .setHorizontalAlignment("left");
      sheet
        .getRange(currentRow, columnStart + 2, 100, 1)
        .setNumberFormat("#.##%")
        .setHorizontalAlignment("left");

      // Cycle through stats and display
      for (let i = 0; i < sortedStats.length; i++) {
        stat = sortedStats[i];
        sheet.getRange(currentRow, columnStart).setValue(stat.category);
        sheet.getRange(currentRow, columnStart + 1).setValue(stat.hours);
        sheet.getRange(currentRow, columnStart + 2).setValue(stat.percentage);
        currentRow++;
      }

      // for (let i = 0; i <)
      // We need to get the total categories and create an array, then sort the array by highest hours

      // sheet.getRange("A" + currentRow).setValue(stats[day][stat]);

      activeColumn = activeColumn + 3;
    }

    // Display the month number in the second row
    // Display the total time below it
    // Display category, hours, and percentage below this
    // Iterate to the next month and repeat the same process, starting 3 columns away from origin point
  }

  getData();
  writeData();
  // console.log(JSON.stringify(monthStats))
  // console.log(monthStats["09"]);
}
