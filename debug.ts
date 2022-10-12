let debugging = true;

function debug(data) {
  let dataJSON = JSON.stringify(data);
  if (debugging) console.log(dataJSON);
}
