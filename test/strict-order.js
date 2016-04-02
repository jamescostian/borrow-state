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
  myState.block().then((state) => {
    hasHappened.push(2)
    return state
  }).then((state) => {
    hasHappened.push(3)
    return state
  }).then((state) => {
    hasHappened.push(4)
    return state
  }).then((state) => {
    hasHappened.push(5)
    return state
  }).then((state) => {
    hasHappened.push(6)
    state.unblock()
  })
  myState.block().then((state) => {
    hasHappened.push(7)
    t.equal(hasHappened, [1, 2, 3, 4, 5, 6, 7], 'The operations happened in the right order')
    state.unblock()
  })
})
