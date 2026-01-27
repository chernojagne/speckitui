# Feature Specification: More Themes

**Feature Branch**: `006-more-themes`  
**Created**: 2026-01-21  
**Status**: Draft  
**Input**: User description: "more-themes"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Customize App Theme from Popular Palettes (Priority: P1)

As a developer using SpeckitUI, I want to select from popular shadcn-compatible theme palettes (Catppuccin, Nord, Gruvbox, Amber, etc.) so that the entire application UI matches my preferred aesthetic.

**Why this priority**: The app theme affects the largest visual surface area; providing popular palettes immediately makes the app feel personalized and familiar.

**Independent Test**: Can be fully tested by opening Settings, selecting a new app theme palette, and verifying all UI components (sidebar, cards, buttons, headers) update to the new color scheme.

**Acceptance Scenarios**:

1. **Given** I am in the Settings panel, **When** I access the App Theme section, **Then** I see at least 8 theme palette options including: Caffeine (default), Catppuccin, Nord, Gruvbox, Amber, Blue, Emerald, and Fuchsia
2. **Given** I select a new app theme palette, **When** applied, **Then** all UI components reflect the new color palette immediately
3. **Given** I am using a custom theme, **When** I toggle between light and dark mode, **Then** the theme palette is preserved and adapts to the light/dark variant

---

### User Story 2 - Customize Terminal Theme Independently (Priority: P1)

As a developer, I want to select a terminal color theme independently from the app theme so that my terminal can use a different aesthetic (e.g., Dracula terminal with Nord app theme).

**Why this priority**: Terminal is a heavily-used component; developers often have strong preferences for terminal colors that differ from their UI preferences.

**Independent Test**: Can be tested by selecting different themes for app and terminal, verifying they apply independently.

**Acceptance Scenarios**:

1. **Given** I am in the Settings panel, **When** I access the Terminal Theme section, **Then** I see at least 15 theme options including: Auto (matches app), Catppuccin Mocha/Latte, Nord, Gruvbox Dark/Light, Solarized Dark/Light, Dracula, Monokai, One Dark, Tokyo Night
2. **Given** I select "Auto" for terminal theme, **When** I change the app theme, **Then** the terminal theme updates to match the app palette
3. **Given** I select a specific terminal theme (not Auto), **When** I change the app theme, **Then** the terminal theme remains unchanged

---

### User Story 3 - Customize Code/Editor Theme Independently (Priority: P2)

As a developer editing markdown or viewing code snippets, I want to select a syntax highlighting theme for the code editor that can differ from my app and terminal themes.

**Why this priority**: Code editing is a core activity; syntax highlighting themes affect readability and developer comfort during extended use.

**Independent Test**: Can be tested by opening a markdown file in edit mode and verifying the editor uses the selected syntax theme colors.

**Acceptance Scenarios**:

1. **Given** I am in the Settings panel, **When** I access the Editor Theme section, **Then** I see at least 12 syntax highlighting theme options including popular ones from Shiki's theme library
2. **Given** I select a new editor theme, **When** I open a markdown file in edit mode, **Then** syntax highlighting uses the selected theme's colors
3. **Given** I have different app and editor themes, **When** editing code, **Then** the editor theme is applied without affecting the surrounding app UI

---

### User Story 4 - Customize Rendered Markdown Theme (Priority: P2)

As a user viewing rendered markdown documentation, I want code blocks and syntax-highlighted content to use a theme that can be customized independently, providing consistency with my reading preferences.

**Why this priority**: Rendered markdown is the primary content consumption mode; readable code blocks enhance documentation usability.

**Independent Test**: Can be tested by viewing a rendered markdown file with code blocks and verifying Shiki applies the selected theme.

**Acceptance Scenarios**:

1. **Given** I am in the Settings panel, **When** I access the Rendered Markdown Theme section, **Then** I see theme options for code blocks in rendered markdown
2. **Given** I select a specific markdown theme, **When** I view rendered markdown with code blocks, **Then** Shiki applies the selected theme to syntax highlighting
3. **Given** rendered markdown theme differs from editor theme, **When** switching between edit and view mode, **Then** each mode uses its respective theme

---

### User Story 5 - Theme Preset Profiles (Priority: P3)

As a user who wants quick setup, I want to apply a unified theme preset that sets all four components (app, terminal, editor, rendered markdown) to matching themes in one click.

**Why this priority**: Convenience feature for users who prefer consistency without manually configuring each component.

**Independent Test**: Can be tested by selecting a preset and verifying all four theme settings update simultaneously.

**Acceptance Scenarios**:

1. **Given** I am in the Settings panel, **When** I select a theme preset (e.g., "Full Nord"), **Then** app, terminal, editor, and markdown themes all update to Nord variants
2. **Given** I apply a preset, **When** I later change one component individually, **Then** only that component changes (preset doesn't lock settings)

---

### Edge Cases

- What happens when a saved theme preference references a theme that has been removed? The app should fall back to the default theme (Caffeine) gracefully.
- How does "Auto" terminal theme behave when the app palette has no corresponding terminal theme? It should map to the closest matching theme variant.
- What happens when Shiki doesn't have the exact theme selected? It should fall back to a similar theme or the default.
- How does the system handle system theme change (light ↔ dark) for each component? Each component should switch to its light/dark variant while preserving the palette.

## Requirements *(mandatory)*

### Functional Requirements

#### Theme Infrastructure
- **FR-001**: System MUST support 4 independently configurable theme contexts: App UI, Terminal, Code Editor, and Rendered Markdown
- **FR-002**: Each theme context MUST support both light and dark mode variants
- **FR-003**: System MUST persist all theme preferences across app restarts
- **FR-004**: System MUST gracefully handle missing or invalid theme preferences by falling back to defaults

#### App Theme
- **FR-005**: System MUST provide at least 8 app theme palettes sourced from zippystarter.com/themes including: Caffeine (default), Catppuccin, Nord, Gruvbox, Amber, Blue, Emerald, Fuchsia
- **FR-006**: App theme changes MUST apply immediately to all UI components without page reload
- **FR-007**: App themes MUST define all required shadcn/ui CSS custom properties (background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, sidebar variants)

#### Terminal Theme
- **FR-008**: System MUST provide at least 15 terminal themes including: Catppuccin Mocha/Latte, Nord, Gruvbox Dark/Light, Solarized Dark/Light, Dracula, Monokai, One Dark, Tokyo Night, plus existing themes (6 existing + 9 new = 15 total)
- **FR-009**: Terminal theme MUST support "Auto" mode that derives theme from current app palette and mode
- **FR-010**: Terminal theme changes MUST apply immediately to all open terminal instances

#### Code Editor Theme
- **FR-011**: System MUST provide at least 12 code editor themes from Shiki's theme library for markdown edit mode
- **FR-012**: Editor theme MUST apply to syntax highlighting in the markdown editor component
- **FR-013**: Editor theme changes MUST apply immediately without requiring file reload
- **FR-013a**: Editor theme selection is fully independent—no "Auto" mode linking to app theme

#### Rendered Markdown Theme
- **FR-014**: System MUST use Shiki for syntax highlighting in rendered markdown code blocks
- **FR-015**: System MUST provide at least 12 themes for rendered markdown code blocks
- **FR-016**: Rendered markdown theme MUST be independently selectable from editor theme
- **FR-016a**: Markdown theme selection is fully independent—no "Auto" mode linking to app theme

#### Theme Presets
- **FR-017**: System MUST provide at least 4 theme presets that configure all components with matching themes (e.g., "Full Catppuccin", "Full Nord", "Full Gruvbox", "Full Solarized")
- **FR-018**: Applying a preset MUST update all 4 theme contexts simultaneously
- **FR-018a**: Presets are fire-and-forget—no tracking of "active preset" state; individual changes do not trigger warnings

### Key Entities

- **AppThemePalette**: A set of CSS custom properties defining complete UI colors (background, foreground, card, primary, secondary, accent, etc.) with light and dark variants
- **TerminalTheme**: An xterm.js ITheme configuration with 16 ANSI colors plus foreground, background, cursor, and selection colors
- **EditorTheme**: A Shiki-compatible theme identifier for syntax highlighting in the code editor
- **MarkdownTheme**: A Shiki-compatible theme identifier for code blocks in rendered markdown
- **ThemePreset**: A named bundle of app palette, terminal theme, editor theme, and markdown theme that can be applied together
- **ThemePreference**: User's saved selections for all 4 theme contexts plus mode (light/dark/system)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can independently configure 4 distinct theme contexts (app, terminal, editor, rendered markdown)
- **SC-002**: Users can select from at least 8 app theme palettes
- **SC-003**: Users can select from at least 15 terminal themes
- **SC-004**: Users can select from at least 12 code editor/markdown themes
- **SC-005**: Theme changes apply within 100ms of selection (perceived as instant)
- **SC-006**: Theme preferences persist correctly across app sessions (100% reliability)
- **SC-007**: No visual glitches, flashing, or color inconsistencies when switching themes
- **SC-008**: Users can apply a unified preset to configure all components in one action

## Assumptions

- Theme colors from zippystarter.com/themes are freely available for use (MIT-style licensing for shadcn themes)
- Shiki provides sufficient theme variety for editor and markdown syntax highlighting
- The existing theme infrastructure (CSS variables, Zustand store, xterm.js ITheme) provides sufficient flexibility for expansion
- Performance impact of theme switching is negligible
- No custom theme editor or user-defined themes are in scope for this feature

## Clarifications

### Session 2026-01-21

- Q: Should editor and markdown themes have an "Auto" sync option like Terminal? → A: No, editor and markdown themes are fully independent (no Auto mode)
- Q: Should presets show active indicator or warn when user breaks a preset? → A: No, presets are fire-and-forget; no tracking after application
