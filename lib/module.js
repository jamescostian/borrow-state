'use strict'
const copy = require('universal-copy')
const once = require('once')
const takeWhile = require('lodash.takewhile')
const PromiseChain = require('./promise-chain.js')

const BorrowState = function (options) {
  // Should read-only operations be unsafe (i.e. be able to write to the state)
  const unsafe = options ? (!!options.unsafe) : false
  let runningOperations = 0 // how many operations are currently running (must be zero to start a new op, can be >1 if they are all read-only)
  let state = {} // current state
  let pendingOperations = [] // queue of operations, each of which is an object with .readOnly (a bool) and .promiseChain (a PromiseChain of operations)

  // This (hidden from the outside) function will execute the first operation in pendingOperations, as long as there are no operations currently running and there are operations that are pending
  const nextOp = () => {
    if (runningOperations > 0) {
      return false // Can't execute the first operation because there is 1+ operation running atm
    } else if (pendingOperations.length === 0) {
      return false // Can't execute the first operation because there aren't any pending operations lol
    } else {
      // Ok there is 1+ thing to execute, and the state is not blocked atm
      // Make a list of operations that will be done concurrently, starting with only the first one
      let ops = [pendingOperations.shift()]
      // Is that first operation read-only?
      let readOnly = ops[0].readOnly
      if (readOnly) {
        // The first operation is read-only, so take all of the read-only operations that come after it, until the first non-read-only operation
        ops = ops.concat(takeWhile(pendingOperations, (op) => op.readOnly))
      }

      runningOperations = ops.length

      // Setup a new function on state that will allow for unblocking
      state.unblock = state.putBack = once(() => {
        runningOperations -= 1
        nextOp() // If possible, run the next operation (so you're not idling unnecessarily)
      })
      // Finally, actually run each of the operations
      return Promise.all(ops.map((op) => {
        // To run the operation, cut its promise chain, either with the actual state (if it's an unsafe read-only or not read-only), or a copy of the state (if it's a safe read-only)
        op.promiseChain.cut(!readOnly || unsafe ? state : copy(state))
      }))
    }
  }

  // This is the only publically accessible part - the function to request running a new operation on the state
  this.borrow = this.block = (r) => {
    // Allow r to be set to 'r' or true to mean that this is a read-only operation - otherwise, it's not read-only.
    if (r === 'r') {
      r = true
    }
    // Setup a promise chain for this block, put it in the list of pending operations, and at the end of the function, return the start of the chain so that things can be added to the chain
    let promiseChain = new PromiseChain()
    pendingOperations.push({
      readOnly: r,
      promiseChain: promiseChain
    })

    setImmediate(nextOp) // make sure something is running so that this operation may be run at some point, and there isn't an indefinite idle time

    return promiseChain.start()
  }
  return this
}

module.exports = BorrowState
