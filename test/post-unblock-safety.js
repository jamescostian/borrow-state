'use strict'
const test = require('tape')
const BorrowState = require('../lib/module.js')

test('post-unblock-safety', (t) => {
  t.plan(4)
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
    t.throws(state.unblock, 'state.unblock() doesn\'t work the second time you call it')
    t.throws(state.unblock, 'state.unblock() doesn\'t work the third time you call it')
  })

  myState.block('r').then((state) => {
    t.equal(state.bar, 5, 'Write operations do not permit mutations after state.block()')
    t.equal(state.foo, 5, 'Read-only operations do not permit mutations before/after state.block()')
    state.unblock()
  })
})
