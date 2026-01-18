# Research: Navigation Pane Redesign

**Feature**: 002-nav-pane-redesign  
**Date**: 2026-01-17  
**Purpose**: Resolve all NEEDS CLARIFICATION items and document technology decisions

## Research Tasks

### 1. Resizable Panel Implementation

**Question**: What pattern should be used for horizontal pane resizing?

**Research Findings**:
- **shadcn/ui Resizable**: Built on `react-resizable-panels`, provides `ResizablePanelGroup`, `ResizablePanel`, and `ResizableHandle` components
- **Existing pattern in codebase**: `TerminalPanel.tsx` uses mouse events for vertical resize (drag handle approach)
- **react-resizable-panels**: The library shadcn/ui Resizable wraps - handles keyboard accessibility, persistence, and smooth interaction

**Decision**: Use shadcn/ui Resizable component
**Rationale**: 
- Constitution VI mandates shadcn/ui components where suitable - Resizable is the correct fit
- Built-in accessibility (keyboard support, ARIA attributes)
- Handles min/max constraints natively
- Persistence via `onLayout` callback integrates with Zustand store
- Consistent with shadcn/ui patterns used elsewhere

**Implementation Notes**:
- Install: `npx shadcn@latest add resizable`
- Use `ResizablePanelGroup` with `direction="horizontal"` for nav pane + main content
- Set `minSize` and `maxSize` as percentages (convert 180-400px to % based on viewport)
- Store layout in settingsStore via `onLayout` callback
- For collapse: set panel size to collapsed width (48px equivalent %)

---

### 2. Collapsible Icon Rail Pattern

**Question**: How should the collapsed icon rail be implemented?

**Research Findings**:
- VS Code uses ~48px rail with vertically stacked icons
- Tailwind transition utilities support smooth width animations
- Two approaches:
  1. Conditional rendering (different component for collapsed state)
  2. CSS width transition with overflow handling

**Decision**: CSS width transition with conditional content visibility
**Rationale**:
- Simpler implementation with single component
- Smooth animated transition using Tailwind `transition-all`
- Maintains element hierarchy for accessibility

**Implementation Notes**:
- Collapsed width: 48px (fits standard icon buttons)
- Use `overflow-hidden` during transition
- Show only: chevron button, step icons (no labels), avatar icon
- Step icons clickable to navigate (with tooltip for step name)

---

### 3. Spec Selector Component

**Question**: What component should be used for the spec dropdown?

**Research Findings**:
- **Current implementation**: Native `<select>` with custom CSS styling and inline SVG for chevron
- **shadcn/ui Select**: Built on Radix Select primitive, provides consistent styling, keyboard navigation, accessibility
- **Native select limitations**: Styling inconsistent across browsers, limited customization

**Decision**: Use shadcn/ui Select component
**Rationale**:
- Constitution VI mandates shadcn/ui components where suitable
- Consistent styling with other form elements (Input, Button)
- Better keyboard navigation and accessibility
- Supports custom option rendering if needed later

**Implementation Notes**:
- Install: `npx shadcn@latest add select`
- Replace native `<select>` with `<Select>`, `<SelectTrigger>`, `<SelectContent>`, `<SelectItem>`
- Remove custom CSS styling (handled by component)

---

### 4. Describe Step Integration

**Question**: How should the Describe step integrate with existing workflow?

**Research Findings**:
- Workflow steps defined in `src/config/workflowSteps.ts`
- Step IDs are TypeScript union type in `src/types/index.ts`
- WorkflowStore tracks `selectedStep` and `stepContentStatus`
- DetailPane renders content based on selected step

**Decision**: Add 'describe' as new WorkflowStepId, position first in workflowSteps array
**Rationale**:
- Follows existing workflow pattern exactly
- Type system ensures compile-time safety
- DetailPane can switch on 'describe' to render DescribeStep component

**Implementation Notes**:
- Add `'describe'` to WorkflowStepId union type
- Add describe step config with `PenLine` icon from Lucide
- DescribeStep shows text editor (basic textarea initially, can enhance later)
- Description persisted to `description.md` in spec directory

---

### 5. Description Text Editor Component

**Question**: What component should be used for the feature description text editor?

**Research Findings**:
- **shadcn/ui Textarea**: Styled textarea component, consistent with Input component
- **Basic HTML textarea**: Works but lacks consistent styling
- **Rich text editors**: Overkill for plain markdown description

**Decision**: Use shadcn/ui Textarea component
**Rationale**:
- Constitution VI compliance
- Consistent styling with Input and other form elements
- Simple and appropriate for plain text/markdown description

**Implementation Notes**:
- Install: `npx shadcn@latest add textarea`
- Use in DescribeEditor with auto-resize or fixed height
- Add "Send to Terminal" button in toolbar above/below

---

### 6. Terminal Context Injection

**Question**: How should "Send to Terminal" inject text into terminal?

**Research Findings**:
- `writeTerminal(sessionId, data)` exists in tauriCommands.ts
- Terminal expects input as raw text with newlines
- Two injection patterns:
  1. Direct write (immediate execution)
  2. Paste to input line (user can review before executing)

**Decision**: Use clipboard-paste pattern - copy to clipboard and simulate paste
**Rationale**:
- User maintains control (can review before Enter)
- More predictable than direct injection
- Works regardless of terminal state

**Alternative Decision**: Direct write with `\\n` suffix
**Rationale (if chosen)**:
- Simpler implementation
- Context injection typically used for predefined commands

**Final Decision**: Implement as direct write with formatted prefix
- Format: `# Feature Description\\n{description text}\\n`
- User sees it as context in terminal history
- Not auto-executed, just visible context

---

### 7. Avatar Menu Component

**Question**: Which shadcn/ui component for avatar dropdown menu?

**Research Findings**:
- **shadcn/ui Avatar**: Provides Avatar, AvatarImage, AvatarFallback - perfect for user representation
- **shadcn/ui DropdownMenu**: Already installed, provides trigger, content, items, separators
- **Current approach**: CircleUser icon only

**Decision**: Use shadcn/ui Avatar + DropdownMenu
**Rationale**:
- Avatar component handles image loading with fallback gracefully
- Shows CircleUser-style fallback when not logged in
- Displays GitHub avatar when logged in (future)
- DropdownMenu already in project (Constitution VI compliance)

**Implementation Notes**:
- Install: `npx shadcn@latest add avatar`
- Use Avatar as DropdownMenuTrigger
- AvatarFallback: Show user initials or icon when not logged in
- AvatarImage: Load GitHub avatar URL when logged in
- Menu items: "Log in to GitHub", separator, "Settings"

---

### 8. Description File Persistence

**Question**: What Tauri commands are needed for description persistence?

**Research Findings**:
- Existing pattern: `readArtifact`/`saveArtifact` in tauriCommands.ts
- Description is just another artifact file
- Could reuse existing artifact commands or create specific ones

**Decision**: Create dedicated `save_description` / `load_description` commands
**Rationale**:
- Clearer API semantics
- Description has different behavior (auto-save, single file)
- Simpler error handling for specific use case

**Implementation Notes**:
- `save_description(spec_path: string, content: string)` → writes `description.md`
- `load_description(spec_path: string)` → returns `string` or empty
- Auto-create file if doesn't exist
- Use debounced save (500ms) for auto-save during typing

---

## Alternatives Considered

| Decision | Alternative | Why Rejected |
|----------|-------------|--------------|
| shadcn/ui Resizable | Custom mouse event handling | Constitution VI mandates shadcn/ui; Resizable provides accessibility |
| shadcn/ui Select | Native HTML select | Constitution VI; consistent styling across browsers |
| shadcn/ui Textarea | Plain HTML textarea | Constitution VI; consistent with other form elements |
| shadcn/ui Avatar | CircleUser icon only | Avatar handles future GitHub image with fallback |
| CSS width transition | Conditional render | More complex state management |
| Dedicated description commands | Reuse artifact commands | Different auto-save semantics |

## Open Questions (None)

All NEEDS CLARIFICATION items resolved. Ready for Phase 1 design.
