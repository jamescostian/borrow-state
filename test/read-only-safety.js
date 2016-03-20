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
  myState.block('r').then((state) => {
    t.ok(true)
    state.foo = 5
    state.unblock()
  })
  myState.block().then((state) => {
    t.ok(true)
    t.equal(state.foo, Math.PI)
    state.unblock()
  })
})
