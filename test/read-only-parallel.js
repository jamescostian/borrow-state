'use strict'
const test = require('tape')
const BorrowState = require('../lib/module.js')

const sleep50ms = require('./sleep.js')
const countTo = require('./count-to.js')

;[true, false].forEach((unsafe) => {
  test(`read-only-parallel (${unsafe ? 'un' : ''}safe)`, (t) => {
    t.plan(6)
    t.timeoutAfter(100)
    let myState = new BorrowState()
    countTo(3).forEach(() => {
      t.ok(true)
      myState.block('r')
        .then(sleep50ms)
        .then((state) => {
          t.ok(true)
          state.unblock()
        })
    })
  })
})
