'use strict'
const BorrowState = require('../module.js')

it('prevents mutations after calling unblock, and prevents multiple calls to unblock (unsafe: true)', () => {
  expect.assertions(4)
  let myState = new BorrowState()
  myState.block().then((state) => {
    state.foo = 5
    state.bar = 5
    state.unblock()
  })
  myState.block('r').then((state) => {
    // Neither of these mutations should work, because this op is read-only
    state.foo = 4
    state.unblock()
    state.foo = 3
  })
  myState.block().then((state) => {
    // Mutation should not work because it takes place *after* state.unblock()
    state.unblock()
    state.bar = 3
    expect(state.unblock).toThrow()
    expect(state.unblock).toThrow()
  })

  return myState.block('r').then((state) => {
    expect(state.bar).toBe(5)
    expect(state.foo).toBe(5)
    state.unblock()
  })
})
