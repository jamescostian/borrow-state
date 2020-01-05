'use strict'
const copy = require('universal-copy')

// once(func) returns a function that can only be called once (if you call it again, it throws)
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

// This auxiliary function takes an array of operations and removes the first readOnly operations from that array and returns them in a new array
const takeUntilNotReadOnly = (source) => {
  const taken = []
  while (source.length > 0 && source[0].readOnly) {
    taken.push(source.shift())
  }
  return taken
}

// Here's the prototype
const BorrowState = function (options) {
  // Should read-only operations be unsafe (i.e. be able to write to the state)?
  const unsafe = options ? (!!options.unsafe) : false

  let runningOperations = 0 // how many operations are currently running (must be zero to start a new op, can be >1 if they are all read-only)
  let state = options && options.initial ? options.initial : {} // current state
  const pendingOperations = [] // queue of operations, each of which is an object with .readOnly and .resolve (which kicks off the operations)

  // This (private) function will execute the first operation in pendingOperations
  // (unless an operation is already running or there aren't any pending operations)
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
      const readOnly = ops[0].readOnly
      if (readOnly) {
        // The first operation is read-only, so take all of the read-only operations that come after it, until the first non-read-only operation
        ops = ops.concat(takeUntilNotReadOnly(pendingOperations))
      }

      runningOperations = ops.length

      // Finally, actually run each of the operations
      ops.forEach(op => {
        // To run the operation, resolve the Promise
        let stateToBePassed
        if (unsafe || !readOnly) {
          // For writes or anything unsafe, give a direct reference to the real object
          stateToBePassed = state
        } else {
          // For reads with unsafe == false, give a copy of the state (so that the original state cannot be modified)
          stateToBePassed = copy(state)
        }
        // Setup a new function on state that will allow for unblocking
        stateToBePassed.unblock = stateToBePassed.putBack = () => {
          runningOperations -= 1
          // Before starting the next operation, make sure that whoever called state.unblock() can't actually mutate state afterwards
          // This isn't necessary if unsafe == true - the user chose to give up safety.
          // Also, if the operation was readOnly, then the Promise was resolved with a copy, so the original could never have been modified
          if (!unsafe && !readOnly) {
            state = copy(state)
          }
          nextOp() // If possible, run the next operation (so you're not idling unnecessarily)
        }
        // Unless we're explicitly in unsafe mode, make sure that you can only unblock/putBack one time
        if (!unsafe) {
          stateToBePassed.unblock = stateToBePassed.putBack = once(stateToBePassed.unblock)
        }
        // Actually run this operation
        op.resolve(stateToBePassed)
      })
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
