'use strict'
// Normally, sleep code would look like this:
//   const sleep = time => new Promise(resolve => {
//     setTimeout(() => resolve(), time)
//   })
// Then you could use that code like so: sleep(50).then(doStuff)
// However, what if you want to use that sleep function with this module?
// For example, imagine the following:
//   myState.block('r')
//     .then(sleep(50))
//     .then((state) => { /* do something with the state */ })
// Of course, it doesn't make sense to write code like that. Unless you're trying to test this module!
// If you're trying to test this module, then the above code is great for testing parallelism.
// In order for that code to work though, you have to make the sleep function return what it got passed.
// That's why the implementation you see below is so... strange

module.exports = time => {
  return state => {
    return new Promise(resolve => {
      setTimeout(() => resolve(state), time)
    })
  }
}
