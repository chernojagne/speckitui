# IPC API: More Themes

**Feature**: 006-more-themes  
**Date**: 2026-01-21  
**Status**: N/A

## Overview

This feature requires **no changes to the Tauri backend IPC API**.

All theming functionality is implemented purely in the frontend:

| Component | Implementation |
|-----------|----------------|
| App Theme | CSS custom properties on `:root` via JavaScript |
| Terminal Theme | xterm.js `ITheme` applied via existing terminal service |
| Editor Theme | Shiki highlighter theme selection |
| Markdown Theme | Shiki highlighter theme selection |
| Persistence | Zustand persist middleware (localStorage) |

## Rationale

- Themes are visual configurations, not data that requires filesystem access
- Settings persistence uses existing Zustand localStorage pattern
- No server-side or Rust-side logic required for theme application

## Related Existing Commands

The following existing commands may be used but require no modifications:

- None required for this feature

## Future Considerations

If custom user themes with import/export are added in the future, the following commands might be needed:
- `read_theme_file` - Read user theme JSON from filesystem
- `write_theme_file` - Save custom theme to filesystem

These are **out of scope** for the current feature.
