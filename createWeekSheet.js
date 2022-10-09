// function createWeekSheet() {
//   var ui = SpreadsheetApp.getUi();
//   var result = ui.prompt("Enter name of sheet");
//   let sheet = SpreadsheetApp.getActive().insertSheet(result.getResponseText(), 1, {
//     template:"Template"
//   })
//   let Colors = {
//     blue: "#3c787e",
//     orange: "#e68c3f",
//     green: "#60993e",
//     brown: "#613a3a"
//   }
//   let categories = [["SE", Colors.blue],["DaaS", Colors.blue],["SKD", Colors.orange],["Team", Colors.orange],["DT", Colors.orange],["Learn", Colors.green],["Other", Colors.brown]]

//   var rules = sheet.getConditionalFormatRules();
//   categories.forEach((category) => {
//     let categoryName = category[0]
//     let categoryColor = category[1]
//     // let rule = SpreadsheetApp.newConditionalFormatRule()
//     // .whenFormulaSatisfied('=$D6=' + categoryName)
//     // .setBackground(categoryColor)
//     // .setFontColor('white')
//     // .setRange('D6:F100')
//     // .build();
//     var rule = SpreadsheetApp.newConditionalFormatRule()
//     .whenNumberBetween(1, 10)
//     .setBackground("#FF0000")
//     .setRanges(['D6:F100'])
//     .build();

// rules.push(rule);
//   })
// sheet.setConditionalFormatRules(rules);
// }
