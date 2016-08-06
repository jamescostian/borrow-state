'use strict'
const copy = require('universal-copy')
const once = (func) => {
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
const takeUntilNotReadOnly = (source) => {
  const taken = []
  while (source.length > 0 && source[0].readOnly) {
    taken.push(source.shift())
  }
  return taken
}

const BorrowState = function (options) {
  // Should read-only operations be unsafe (i.e. be able to write to the state)
  const unsafe = options ? (!!options.unsafe) : false
  let runningOperations = 0 // how many operations are currently running (must be zero to start a new op, can be >1 if they are all read-only)
  let state = {} // current state
  let pendingOperations = [] // queue of operations, each of which is an object with .readOnly (a bool) and .resolve (which resolves a Promise that kicks off the operations)

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
        ops = ops.concat(takeUntilNotReadOnly(pendingOperations))
      }

      runningOperations = ops.length

      // Setup a new function on state that will allow for unblocking
      state.unblock = state.putBack = once(() => {
        runningOperations -= 1
        // Before starting the next operation, make sure that whoever called state.unblock() can't actually mutate state afterwards
        // If unsafe is true, then don't bother, but otherwise, make sure to do this if you haven't already (if it's readOnly, then the Promise was resolved with a copy, so no need to copy again - they never could mutate the real state)
        if (!unsafe && !readOnly) {
          state = copy(state)
        }
        nextOp() // If possible, run the next operation (so you're not idling unnecessarily)
      })
      // Finally, actually run each of the operations
      return Promise.all(ops.map((op) => {
        // To run the operation, resolve the Promise, either with the actual state (if it's an unsafe read-only or not read-only), or a copy of the state (if it's a safe read-only)
        op.resolve(!readOnly || unsafe ? state : copy(state))
      }))
    }
  }

  // This is the only publically accessible part - the function to request running a new operation on the state
  this.borrow = this.block = (r) => {
    // Use an actual Promise, and leak resolve() so that later on, when this operation is supposed to run, one can call resolve(state)
    const myPromise = new Promise((resolve) => {
      pendingOperations.push({
        readOnly: r,
        resolve: once(resolve) // Make sure you can only resolve a promise once, even if someone is using a bad implementation of Promises
      })
    })

    setTimeout(nextOp, 0) // Make sure something is running so that this operation may be run at some point, and there isn't an indefinite idle time

    return myPromise
  }
  return this
}

module.exports = BorrowState
