function decimalToHHMM(minutes: number) {
  var sign = minutes < 0 ? "-" : "";
  var min = Math.floor(Math.abs(minutes));
  var sec = Math.floor((Math.abs(minutes) * 60) % 60);
  return sign + (min < 10 ? "0" : "") + min + ":" + (sec < 10 ? "0" : "") + sec;
}

function decimalToHoursAndMinutesObject(decimal: number) {
  var decimalAsString = decimal.toString();
  var split = decimalAsString.split(".");
  let hours = parseInt(split[0]);
  let minutes = 0;
  if (split.length > 1) {
    minutes = (parseInt(split[1][0] + split[1][1]) * 60) / 100;
  }
  return {
    hours: hours,
    minutes: minutes,
  };
}
