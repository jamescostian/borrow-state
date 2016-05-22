# Borrow State

[![Build Status](https://img.shields.io/travis/jamescostian/borrow-state.svg?style=flat)](https://travis-ci.org/jamescostian/borrow-state)
[![Coverage Status](https://img.shields.io/coveralls/jamescostian/borrow-state.svg?style=flat)](https://coveralls.io/r/jamescostian/borrow-state?branch=master)
[![Dependency Status](https://img.shields.io/gemnasium/jamescostian/borrow-state.svg?style=flat)](https://gemnasium.com/jamescostian/borrow-state)
[![License](https://img.shields.io/npm/l/borrow-state.svg?style=flat)](https://github.com/jamescostian/borrow-state/blob/master/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/borrow-state.svg?style=flat)](https://www.npmjs.com/package/borrow-state)

Take turns borrowing (shared) state.

## Install

Assuming you have [Node](http://nodejs.org) and [NPM](https://npmjs.org) (which is bundled with Node), you can download the code like so:

```bash
npm install borrow-state
```

## Usage

```js
const BorrowState = require('borrow-state')
let myState = new BorrowState({
  unsafe: true // defaults to false. More about this later
})
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
  state.foo = 5
  state.bar = 6
  state.baz = Math.PI
  return state
}).then((state) => state.unblock())
// Notice how the promise chain ended with myState.unblock
// Otherwise the state would remain blocked!
// I am ignoring error handling in this example,
// but may want to unblock if an error is caught

// Note the 'r' which denotes read-only
myState.block('r').then((state) => {
  // Operation 3
  // Read date from state, but pinky-promise not to change it!
  state.unblock()
})

// Again, note the 'r' which denotes read-only
myState.block('r').then((state) => {
  // Operation 4
  // Read date from state, but pinky-promise not to change it!
  state.unblock()
})

// This one does not have an 'r' so it is not necessarily read-only
myState.block().then((state) => {
  // Operation 5
  // Do anything
  state.unblock()
})
```

While Operation 3 and 4 look like they may run concurrently with Operation 1 or 2, or maybe even between Operation 1 and 2, they will not. Operation 1 will occur first, followed by Operation 2, and that is garunteed. Next, Operations 3 and 4 will occur concurrently, because they are both read-only operations. Operation 5 will not occur until both Operations 3 and 4 have unblocked (again, this is garunteed).

The promise-based API allows for you to make a chain of promises which are run together, in sequential order, without anything else running in parallel or in between (unless it's a situation with read-only operations, because those can't conflict). That's why Operation 2 occurs right after Operation 1, and nothing can get between them. There is a caveat due to this design though - you *must* call `.unblock()` when you finish all of the Operations you want to batch together (like Operations 1 and 2 are batched together and end with `.unblock()`).

The state cannot be accessed without using the `.block()` method, so there isn't any way of getting around the blocks. Whoever calls `.block()` first will get to do things first, until they call `.unblock()` on the state object they receive. So it is not possible for you to `.unblock()` somewhere else, outside of the operation that is currently blocking.

This way everything is safe, but it's also slow because you're purposefully blocking operations. To make things faster, read-only operations can be batched together, which means they will be run in parallel. Of course, you need to make sure these read-only actions are, indeed, read-*only*! In the example, `unsafe` was set to `true` when initializing `myState`, so the state could have been modified by Operations 3 and 4, sacrificing data integrity. The default is for `unsafe` to be `false`, which would have meant Operations 3 and 4 would get brand-new copies of the state, so even if those operations tried to modify their copies, the actual state would remain unchanged.

In addition, instead of using `.block()` and `.unblock()`, one can use `.borrow()` and `.putBack()`

## Caveats

+ You can't touch your state's `unblock` property
+ You can't create a brand new object for your state - you must manipulate the existing object that was passed in when asking for the state
+ For every `.block()`, there must be an `.unblock()`. If there is one more `.block()` than there are `.unblock()`s, the system will remained blocked until there is a new `.unblock()`
+ If you use `unsafe: true`, things will be faster *but* if a read-only operation is not actually read-only, your state loses all integrity (and there is no reason to use this module besides maintaining integrity). Conversely, if you use the default (`unsafe: false`), integrity is always maintained *but* you can't have two read-only operations happening simultaneously through the API.
+ You need to be able to run ES2015 or transpile this code

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

## License

[ISC](LICENSE)
