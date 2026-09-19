# Changelog

## [0.1.0] - Step 1

### Added
- Add, complete, and delete to-do items.
- Display the remaining-items counter.
- Persist to-do items with `localStorage`.

### Changed
- Establish the initial to-do app structure and workflow.

## [0.2.0] - Step 2

### Added
- Add a dark mode toggle with a saved preference in `localStorage`.
- Fall back to the operating system setting with `prefers-color-scheme` when no manual theme preference exists.
- Add `All`, `Active`, and `Completed` filters.

### Changed
- Update the visible to-do items according to the selected filter while keeping the remaining counter based on all items.
