# Changelog

All notable changes to this project will be documented in this file.

## [1.0.3] - 2025-04-27

### Added

- **Updated Usage - React components with t() function:** Added support for translating React components using the t() function.

## [1.0.2] - 2025-04-27

### Fixed

- **Key Overwriting:** Generating keys no longer overwrites existing ones.
- **Version Display:** The `--version` / `-v` flag now correctly shows the package version.
- **Key Uniqueness:** Resolved conflicts caused by non-unique keys.
- **User-Created Keys:** Properly recognizes and includes manually created keys.
- **JSX Handling Improvements:**
  - Correctly parses complex JSX structures.
  - Fixes issues with JSX event handlers.
  - Properly handles nested and multi-line JSX elements.

### Added

- **Revert Generated Keys:**
  - Introduced a `revert` flag to undo changes while preserving user-defined keys.
  - Implemented a `manifest.json` file to track key generation changes.
  - New CLI command: `npm run lingotags revert`.
- **Enhanced Error Handling & Logging:**
  - Improved logs for better debugging and tracking.
  - More descriptive error messages.
- **i18n Enhancements:**
  - Replaced `key=` attributes with `data-i18n-key=`.
  - Added default language configuration with a prompt for a 2-letter code.
  - Generates `locales/{lang}.json` with initial translations.
  - Fixed key counter initialization to start from `1` consistently.

## [1.0.0 - 1.0.1] - 2025-01-26

### Initial Release

- First stable version of Lingotags.
- Core functionality for key generation, JSX parsing, and i18n support.
