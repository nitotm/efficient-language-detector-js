# Changelog

Notable changes to this project are documented in this file.

## [2.1.0]

### Fixed

- Security: fixed a ReDoS vulnerability in the domain-matching regex used by 
  `enableTextCleanup(true)`.

### Added

- `eld.newInstance()`: creates a new, fully independent eld instance (its own database, subset,
  and text-cleanup setting.

### Changed

- `detect()` now logs a `console.warn` when given a non-string argument, then returns the same
  empty result it always did.
- Now each entry point (dynamic and each static size) is a different instance, but still global.  

## [2.0.0]

### Added

- Static imports with a specific database size:
  `import { eld } from 'eld/large';`
- TypeScript type definitions.

### Changed

- Dynamic import now requires explicitly loading a database before use:
  `import { eld } from 'eld';`
  `await eld.load('large')`
- ELD is ~1.5x faster, and more accurate.
- **npm** install size reduced by 70%.
- More descriptive function names (old names still available, but deprecated):
  - `dynamicLangSubset()` is now called `setLanguageSubset()`
  - `cleanText()` is now called `enableTextCleanup()`
  - `loadNgrams()` is now called `load()`
