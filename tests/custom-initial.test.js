'use strict'
const BorrowState = require('../module.js')

it('allows you to initialize it with any object', () => {
  let myState0 = new BorrowState({ initial: { foo: 5 } })
  let myState1 = new BorrowState({ initial: [6] })
  return Promise.all([myState0.block(), myState1.block()]).then(states => {
    expect(states[0].foo).toEqual(5)
    expect(states[1][0]).toEqual(6)
    states.forEach(state => state.unblock())
  })
})
