'use strict'
module.exports = (time) => {
  return (something) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(something), 50)
    })
  }
}
