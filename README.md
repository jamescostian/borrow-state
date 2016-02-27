# borrow-state

[![Build Status](https://img.shields.io/travis/jamescostian/borrow-state.svg?style=flat)](https://travis-ci.org/jamescostian/borrow-state)
[![Coverage Status](https://img.shields.io/coveralls/jamescostian/borrow-state.svg?style=flat)](https://coveralls.io/r/jamescostian/borrow-state?branch=master)
[![Dependency Status](https://img.shields.io/gemnasium/jamescostian/borrow-state.svg?style=flat)](https://gemnasium.com/jamescostian/borrow-state)
[![License](https://img.shields.io/npm/l/borrow-state.svg?style=flat)](https://github.com/jamescostian/borrow-state/blob/master/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/borrow-state.svg?style=flat)](https://www.npmjs.com/package/borrow-state)

Take turns borrowing (shared) state

## Install

```
npm install borrow-state
```

## Usage

```js
const BorrowState = require('borrow-state')
let myState = new BorrowState()
myState.block().then((state) => {
  state = {
    foo: 5,
    bar: 6,
    baz: Math.PI
  }
  return state
})
```

## Contributing

Contributions welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

## License

[ISC](LICENSE)
