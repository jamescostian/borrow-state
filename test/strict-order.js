const test = require('tape')
const BorrowState = require('../lib/module.js')

test(`strict-order`, (t) => {
  t.plan(1)
  let hasHappened = []
  let myState = new BorrowState()
  myState.block().then((state) => {
    hasHappened.push(1)
    state.unblock()
  })
  myState.block('r').then((state) => {
    hasHappened.push(2)
    state.unblock()
  })
  myState.block().then((state) => {
    hasHappened.push(3)
    t.equal(hasHappened, [1, 2, 3], 'The operations happened in the right order')
    state.unblock()
  })
})
