# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-09-06

### Fixed

- The global `mod+C` "copy raw §-coded string" shortcut no longer hijacks the
  browser's native copy behavior when the user has an active text selection
  inside the Line 1 / Line 2 textareas. Previously, selecting part of the MOTD
  text and pressing <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>C</kbd> to copy just that
  selection would silently copy the entire raw two-line string instead. The
  app-wide shortcut now only fires when there is no active selection in the
  focused field, so normal text-selection copying works as expected.
