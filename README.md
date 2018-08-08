# Borrow State

[![Build Status](https://img.shields.io/travis/jamescostian/borrow-state.svg?style=flat)](https://travis-ci.org/jamescostian/borrow-state)
[![Coverage Status](https://img.shields.io/coveralls/jamescostian/borrow-state.svg?style=flat)](https://coveralls.io/r/jamescostian/borrow-state?branch=master)
[![License](https://img.shields.io/npm/l/borrow-state.svg?style=flat)](https://github.com/jamescostian/borrow-state/blob/master/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/borrow-state.svg?style=flat)](https://www.npmjs.com/package/borrow-state)

Take turns borrowing (shared) state.

Before using this, make sure you *actually need* to use this. JS usually only runs a single thread at a time (unless you use something like Web Workers) which can help avoid situations where you need this.

## Install

Assuming you have [Node](http://nodejs.org), just run `npm install borrow-state`

## Usage

```js
const BorrowState = require('borrow-state')
let myState = new BorrowState({
  unsafe: true, // defaults to false. More about this later
  initial: { // defaults to {}. The initial state is put here
    foo: 5,
    bar: 6,
    baz: Math.PI
  }
})
// You can write data, ensuring that nothing else can read from the state until you explicitly unblock the state
myState.block().then((state) => {
  // Operation 1:
  state.baz = Math.PI
  return state
}).then((state) => {
  // Operation 2:
  // This operation is guaranteed to occur immediately after Operation 1
  state.foo = 5
  state.bar = 6
  state.baz = Math.PI
  return state
}).then((state) => state.unblock())
  .catch((state) => state.unblock())
// Notice how the promise chain ended with myState.unblock
// Otherwise the state would remain blocked!

// Note the 'r' which denotes read-only.
myState.block('r').then((state) => {
  // Operation 3
  // Read date from state, but pinky-promise not to change it!
  state.unblock()
})

// Again, note the 'r' which denotes read-only
myState.block('r').then((state) => {
  // Operation 4
  // Since there are two read-only operations in a row, they will be executed concurrently!
  state.unblock()
})

// This one does not have an 'r' so it is not necessarily read-only
myState.block().then((state) => {
  // Operation 5
  // This will not run concurrently with Operations 3 and 4 - it will run after them.
  state.unblock()
})
```

While Operations 3 and 4 look like they may run concurrently with Operation 1 or 2, or maybe even between Operation 1 and 2, they will not. Operation 1 will occur first, followed by Operation 2, and that is guaranteed. Next, Operations 3 and 4 will occur concurrently, because they are both read-only operations. Operation 5 will not occur until both Operations 3 and 4 have unblocked (again, this is guaranteed).

The promise-based API allows for you to make a chain of promises which are run together, in sequential order, without any other operations on the state being allowed to run in between (unless it's a situation with read-only operations, which can be run concurrently because they shouldn't conflict). That's why Operation 2 occurs right after Operation 1, and nothing can get between them. There is a caveat due to this design though - you *must* call `.unblock()` when you finish all of the Operations you want to batch together (like Operations 1 and 2 are batched together and end with `.unblock()`).

The state cannot be accessed without using the `.block()` method, so there isn't any way of getting around the blocks (unless you set `unsafe: true`). Whoever calls `.block()` first will get to do things first, until they call `.unblock()` on the state object they receive. So it is not possible for you to `.unblock()` somewhere else, outside of the operation that is currently blocking.

This way everything is safe, but it's also slow because you're purposefully blocking operations. To make things faster, read-only operations can be batched together, which means they will be run concurrently. Of course, you need to make sure these read-only actions are, indeed, read-*only*! In the example, `unsafe` was set to `true` when initializing `myState`, so the state could have been modified by Operations 3 and 4, sacrificing data integrity. The default is for `unsafe` to be `false`, which would have meant Operations 3 and 4 would get brand-new copies of the state, so even if those operations tried to modify their copies, the actual state would remain unchanged. More about unsafe in caveats, bullet 4

In addition, instead of using `.block()` and `.unblock()`, one can use `.borrow()` and `.putBack()`

## Caveats

+ Node v6+ only (tested against v6-v10)
+ For every `.block()`, there must be an `.unblock()` (unless you *want* a [deadlock](https://en.wikipedia.org/wiki/Deadlock))
+ You can't touch your state's `unblock` property or re-assign the state variable (just change it's properties!)
+ If you use `unsafe: true`, things will be faster *but* if a read-only operation is not actually read-only, or if you pass in something (call it X) as the initial state and you use X elsewhere, you sacrifice data integrity (and there is no reason to use this module besides maintaining integrity). You are expected to not directly use any references to the object you provide or any of it's children (or children of children, etc.)
+ `unblock()` is not very strict with `unsafe: true` - one can run `state.unblock()` and then mutate the state (e.g. `state.unblock(); state.foo += 5`), and one can even run `state.unblock()` multiple times. If you use the default (`unsafe: false`), integrity is always maintained and `unblock()` will prevent future unauthorized writes to the state.

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

## License

[ISC](LICENSE)
