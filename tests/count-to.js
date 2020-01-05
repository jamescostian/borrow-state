'use strict'
module.exports = (num) => {
  const array = []
  for (let i = 0; i < num; i += 1) {
    array.push(i + 1)
  }
  return array
}
