let BorrowState = function (opts) {
  this.unsafe = !!opts.unsafe
  let state = {}
  state.borrow = state.block = (r) => {
    if (r === 'r') {
      r = true
    }
  }
  return this
}

module.exports = BorrowState
