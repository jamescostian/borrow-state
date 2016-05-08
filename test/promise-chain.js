'use strict'
const test = require('tape')
const PromiseChain = require('../lib/promise-chain.js')

test('promise-chain', (t) => {
  t.plan(6)
  t.doesNotThrow(() => {
    let chain = new PromiseChain()
    let x = 5
    let y = 5
    let z = 5
    chain.start().then((a) => {
      x = a
      return a
    }).then((a) => {
      y = a
      return Promise.reject(a + 1)
    }).catch((aPlus1) => {
      z = aPlus1
      return Promise.reject()
    })
    chain.cut(3).then(() => {
      t.ok(false, 'This promise chain should have had a .catch not a .then()')
    }).catch(() => {
      t.equal(x, 3, 'first chain event was run')
      t.equal(y, 3, 'second chain event was run')
      t.equal(z, 4, 'third chain event (catch) was run')
    })
  })
  t.throws(() => {
    let chain = new PromiseChain()
    let start = chain.start()
    chain.cut()
    start.then(() => {})
  }, 'throws if a new thing is added with .then after chain is cut')
  t.throws(() => {
    let chain = new PromiseChain()
    let start = chain.start()
    chain.cut()
    start.catch(() => {})
  }, 'throws if a new thing is added with .catch after chain is cut')
})
