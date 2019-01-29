'use strict'
const BorrowState = require('../module.js')

const sleepFactory = require('./sleep.js')
const sleep50ms = sleepFactory(50)
const sleep100ms = sleepFactory(100)
const countTo = require('./count-to.js')

describe('read-only blocking operations', () => {
  ;
  [true, false].forEach((unsafe) => {
    it(`happens concurrently (unsafe: ${unsafe ? 'true' : 'false'})`, () => {
      expect.assertions(3)
      let myState = new BorrowState({ unsafe: unsafe })
      countTo(3).forEach((i) => {
        myState.block('r')
          .then(sleep50ms)
          .then((state) => {
            expect(true).toBeTruthy()
            state.unblock()
          })
      })

      // Now, this test only has 100ms to complete, which means that the three sleep50s functions must be run in parallel, or else this test will certainly fail
      return sleep100ms()
    })
  })
})
