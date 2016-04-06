const test = require('tape')
const BorrowState = require('../lib/module.js')

const countTo = require('./count-to.js')

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
    return state
  }).then((state) => {
    hasHappened.push(8)
    return state
  }).then((state) => {
    hasHappened.push(9)
    return state
  }).then((state) => {
    hasHappened.push(10)
    return state
  }).then((state) => {
    hasHappened.push(11)
    state.unblock()
  })

  myState.block().then((state) => {
    hasHappened.push(12)
    t.equal(hasHappened, countTo(12), 'The operations happened in the right order')
    state.unblock()
  })
})
