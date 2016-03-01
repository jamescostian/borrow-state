# borrow-state

[![Build Status](https://img.shields.io/travis/jamescostian/borrow-state.svg?style=flat)](https://travis-ci.org/jamescostian/borrow-state)
[![Coverage Status](https://img.shields.io/coveralls/jamescostian/borrow-state.svg?style=flat)](https://coveralls.io/r/jamescostian/borrow-state?branch=master)
[![Dependency Status](https://img.shields.io/gemnasium/jamescostian/borrow-state.svg?style=flat)](https://gemnasium.com/jamescostian/borrow-state)
[![License](https://img.shields.io/npm/l/borrow-state.svg?style=flat)](https://github.com/jamescostian/borrow-state/blob/master/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/borrow-state.svg?style=flat)](https://www.npmjs.com/package/borrow-state)

Take turns borrowing (shared) state

## Install

Assuming you have [Node](http://nodejs.org) and [NPM](https://npmjs.org) (which is bundled with Node), you can download the code like so:

```bash
npm install borrow-state
```

## Usage

```js
const BorrowState = require('borrow-state')
let myState = new BorrowState()
// You can write data, ensuring that no other data
myState.block().then((state) => {
  // Operation 1:
  state = {
    foo: 5,
    bar: 6,
    baz: Math.PI
  }
  return state
}).then((state) => {
  // Operation 2:
  // This operation is garunteed to occur immediately after Operation 2
  state = {
    foo: 5,
    bar: 6,
    baz: Math.PI
  }
  return state
}).then((state) => state.unblock())
// Notice how the promise chain ended with myState.unblock
// Otherwise the state would remain blocked!
// I am ignoring error handling in this example, but may want to unblock if an error is caught

myState.block().then((state) => {
  // Operation 3
}).then((state) => state.unblock())
```

While Operation 3 looks like it may run concurrently with Operation 1 or 2, or maybe even between Operation 1 and 2, it will not. The state cannot be accessed without using the `.block()` method, so there isn't any way of getting around the blocks. Whoever calls `.block()` first will get to do things first, until they call `.unblock()` on the state object they receive.

This way everything is safe, but it's also slow because you're purposefully blocking operations.

## Contributing

Contributions welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

## License

[ISC](LICENSE)
