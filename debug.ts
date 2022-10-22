let debugging = false;

function debug(data) {
  let dataJSON = JSON.stringify(data);
  if (debugging) console.log(dataJSON);
}
