function randomNum(num) {
  let arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  let codeString = "";
  for (let index = 0; index < 6; index++) {
    let num = Math.round(Math.random() * (8 - 0) + 0);
    codeString += num;
  }
  return codeString;
}
module.exports = {
  randomNum,
};
