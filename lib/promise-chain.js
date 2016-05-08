'use strict'
const PromiseChain = function () {
  this.chainOfEvents = []
  this.stopped = false
  return this
}
PromiseChain.prototype.start = function () {
  const stoppedError = new Error('This promise chain was already cut off, so it cannot be changed.')
  const chain = {
    'then': (func) => {
      if (this.stopped) {
        throw stoppedError
      } else {
        this.chainOfEvents.push(['then', func])
        return chain
      }
    },
    'catch': (func) => {
      if (this.stopped) {
        throw stoppedError
      } else {
        this.chainOfEvents.push(['catch', func])
        return chain
      }
    }
  }
  return chain
}
PromiseChain.prototype.cut = function (init) {
  this.stopped = true
  let actualPromise = Promise.resolve(init)
  this.chainOfEvents.forEach((event) => {
    actualPromise = actualPromise[event[0]](event[1])
  })
  return actualPromise
}

module.exports = PromiseChain
