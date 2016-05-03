'use strict'
const copy = require('universal-copy')
const BorrowState = function (options) {
  this.unsafe = options ? !!options.unsafe : false
  let blocks = 0
  let state = {}
  let pendingOperations = []
  const nextOp = () => {
    if (blocks > 0) {
      return false
    } else if (pendingOperations.length === 0) {
      return false
    } else {
      let ops = [pendingOperations.shift()]
      let readOnly = ops[0].readOnly
      if (readOnly) {
        ops = ops.concat(takeUntilNotReadOnly(pendingOperations))
      }
      blocks = ops.length
      state.unblock = callableOnce(() => {
        blocks -= 1
        nextOp()
      })
      return Promise.all(ops.map((op) => {
        op.promiseChain.cut(!readOnly || this.unsafe ? state : copy(state))
      }))
    }
  }
  this.borrow = this.block = (r) => {
    if (r === 'r') {
      r = true
    }
    let promiseChain = new PromiseChain()
    pendingOperations.push({
      readOnly: r,
      promiseChain: promiseChain
    })
    setImmediate(nextOp)
    return promiseChain.start()
  }
  return this
}

const takeUntilNotReadOnly = (source) => {
  let taken = []
  while (source.length > 0 && source[0].readOnly) {
    taken.push(source.shift())
  }
  return taken
}

let callableOnce = (func) => {
  let called = false
  return (...args) => {
    if (called) {
      throw new Error('This function can only be called once!')
    } else {
      called = true
      func(...args)
    }
  }
}

const PromiseChain = function () {
  this.chainOfEvents = []
  this.stopped = false
  return this
}
PromiseChain.prototype.start = function () {
  let chain = {
    then: (func) => {
      if (this.stopped) {
        throw new Error('This promise chain was already cut off, so it cannot be changed.')
      } else {
        this.chainOfEvents.push(['then', func])
        return chain
      }
    },
    catch: (func) => {
      if (this.stopped) {
        throw new Error('This promise chain was already cut off, so it cannot be changed.')
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
    actualPromise[event[0]](event[1])
  })
  return actualPromise
}

module.exports = BorrowState
