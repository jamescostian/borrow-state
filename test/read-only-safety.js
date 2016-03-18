const test = require('tape')
const BorrowState = require('borrow-state')

const sleep50ms = (something) => new Promise(function (resolve, reject) {
  setTimeout(function () {
    resolve(something)
  }, 50)
})

test(`read-only-safety`, (t) => {
  t.plan(3)
  t.timeoutAfter(100)
  let myState = new BorrowState()
  myState.block().then((state) => {
    state.foo = Math.PI
    state.unblock()
  })
})
