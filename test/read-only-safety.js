'use strict'
const test = require('tape')
const BorrowState = require('../lib/module.js')

const countTo = require('./count-to.js')

test(`read-only-safety`, (t) => {
  t.plan(2)
  let hasHappened = []
  let myState = new BorrowState()
  myState.block().then((state) => {
    hasHappened.push(1)
    state.foo = 4
    state.unblock()
  })
  myState.block('r').then((state) => {
    hasHappened.push(2)
    state.foo = 5
    state.unblock()
  })
  // The following is not set to read-only so that it can occur *after* the previous
  myState.block().then((state) => {
    hasHappened.push(3)
    t.equal(state.foo, 4, 'The state should still be set to pi')
    t.equal(hasHappened, countTo(3), 'The operations happened in the right order')
    state.unblock()
  })
})

test(`read-only-safety, chained`, (t) => {
  t.plan(2)
  let hasHappened = []
  let myState = new BorrowState()
  myState.block().then((state) => {
    hasHappened.push(1)
    state.foo = 4
    state.unblock()
  })
  myState.block('r').then((state) => {
    hasHappened.push(2)
    state.foo = 5
    return state
  }).then((state) => {
    hasHappened.push(3)
    t.equal(state.foo, 4, 'The state should still be set to pi')
    t.equal(hasHappened, countTo(3), 'The operations happened in the right order')
    state.unblock()
  })
})
