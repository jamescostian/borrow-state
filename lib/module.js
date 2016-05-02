'use strict'
let BorrowState = function (options) {
  this.unsafe = options ? !!options.unsafe : false
  let state = {}
  state.borrow = state.block = (r) => {
    if (r === 'r') {
      r = true
    }
  }
  return this
}

module.exports = BorrowState
