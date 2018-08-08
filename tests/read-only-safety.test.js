'use strict'
const BorrowState = require('../module.js')

const countTo = require('./count-to.js')

it('prevents mutations from taking place in read-only mode (unsafe: false)', () => {
  expect.assertions(2)
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
  return myState.block().then((state) => {
    hasHappened.push(3)
    expect(state.foo).toBe(4)
    expect(hasHappened).toEqual(countTo(3))
    state.unblock()
  })
})
