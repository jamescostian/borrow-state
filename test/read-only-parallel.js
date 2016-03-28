const test = require('tape')
const BorrowState = require('../lib/module.js')

const sleep50ms = (something) => new Promise(function (resolve, reject) {
  setTimeout(function () {
    resolve(something)
  }, 50)
})

;[true, false].forEach((unsafe) => {
  test(`read-only-parallel (${unsafe ? 'un' : ''}safe)`, (t) => {
    t.plan(3)
    t.timeoutAfter(100)
    let myState = new BorrowState()
    ;[1, 2, 3].forEach(() => {
      myState.block('r')
        .then(sleep50ms)
        .then((state) => {
          t.ok(true)
          state.unblock()
        })
    })
  })
})
