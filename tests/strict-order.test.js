'use strict'
const BorrowState = require('../module.js')

const countTo = require('./count-to.js')

it('runs everything in a strict ordering, not allowing anything to happen outside of that order', () => {
  expect.assertions(1)
  const hasHappened = []
  const myState = new BorrowState()
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

  return myState.block().then((state) => {
    hasHappened.push(12)
    expect(hasHappened).toEqual(countTo(12))
    state.unblock()
  })
})
