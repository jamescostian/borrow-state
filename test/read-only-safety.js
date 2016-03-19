const test = require('tape')
const BorrowState = require('borrow-state')

test(`read-only-safety`, (t) => {
  t.plan(4)
  let myState = new BorrowState()
  myState.block().then((state) => {
    t.ok(true)
    state.foo = Math.PI
    state.unblock()
  })
})
