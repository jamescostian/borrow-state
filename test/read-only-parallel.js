'use strict'
const test = require('tape')
const BorrowState = require('../lib/module.js')

const sleep50ms = require('./sleep.js')(50)
const countTo = require('./count-to.js')

;[true, false].forEach((unsafe) => {
  test(`read-only-parallel (${unsafe ? 'un' : ''}safe)`, (t) => {
    t.plan(3)
    t.timeoutAfter(100)
    let myState = new BorrowState({unsafe: unsafe})
    countTo(3).forEach((i) => {
      myState.block('r')
        .then(sleep50ms)
        .then((state) => {
          t.ok(true, 'Unblocked for request #' + i)
          state.unblock()
        })
    })
  })
})
