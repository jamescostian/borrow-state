# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [v2.0.1][2.0.1] - 2018-08-08
### Added
- Test against Node v8-v10 (in addition to already testing v6 and v7)

### Changed
- Updated dependencies
- Minor documentation improvements

## [v2.0.0][2.0.0] - 2017-01-02
### Added
- Support for Node v6 and beyond
- Support for setting an initial state

### Changed
- Use Jest instead of tape + NYC

### Removed
- Support for versions of Node before 6

## [v1.0.3][1.0.3] - 2016-12-11
### Added
- More tests

### Changed
- Use actual Promises instead of PromiseChains
- Make it more clear that unsafe mode allows for multiple calls of unblock() from (at least allegedly) read-only operations
- Switch code coverage tool from Istanbul to NYC

## [v1.0.2][1.0.2] - 2016-07-22
### Fixed
- Prevent mutations on `state` after `state.unblock()` is called from having effects

## [v1.0.1][1.0.1] - 2016-07-02
### Changed
- Add support for browsers, fix minor things

## 1.0.0 - 2016-05-11
### Added
- Basic functionality, tests, etc.

[2.0.1]: https://github.com/jamescostian/borrow-state/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/jamescostian/borrow-state/compare/v1.0.3...v2.0.0
[1.0.3]: https://github.com/jamescostian/borrow-state/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/jamescostian/borrow-state/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/jamescostian/borrow-state/compare/v1.0.0...v1.0.1
