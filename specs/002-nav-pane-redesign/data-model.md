# Data Model: Navigation Pane Redesign

**Feature**: 002-nav-pane-redesign  
**Date**: 2026-01-17  
**Purpose**: Define state changes and new entities for navigation pane redesign

## Store State Changes

### 1. settingsStore.ts - New Properties

```typescript
interface SettingsState {
  // ... existing properties ...
  
  // NEW: Navigation pane settings
  navPaneWidth: number;       // Default: 220, Min: 180, Max: 400
  navPaneCollapsed: boolean;  // Default: false
  
  // NEW: Actions
  setNavPaneWidth: (width: number) => void;
  setNavPaneCollapsed: (collapsed: boolean) => void;
  toggleNavPaneCollapsed: () => void;
}
```

**Persistence**: Yes, via existing zustand persist middleware  
**Constraints**: 
- `navPaneWidth` clamped to [180, 400] in setter
- Default width 220px matches current fixed width

---

### 2. descriptionStore.ts - New Store

```typescript
interface DescriptionState {
  // State
  content: string;           // Current description text
  isDirty: boolean;          // Has unsaved changes
  isLoading: boolean;        // Loading from disk
  isSaving: boolean;         // Saving to disk
  lastSaved: Date | null;    // Last successful save timestamp
  error: string | null;      // Last error message
  
  // Actions
  setContent: (content: string) => void;
  markDirty: () => void;
  markClean: () => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setLastSaved: (date: Date) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}
```

**Persistence**: No (transient state, file is source of truth)  
**Rationale**: Content loaded from file on spec change, saved on modification

---

### 3. workflowStore.ts - Modified Type

```typescript
// In stepContentStatus, add 'describe' key
stepContentStatus: Record<WorkflowStepId, boolean>;

// In updateContentStatus, add describe status check
updateContentStatus: (manifest) => {
  // ... existing logic ...
  stepContentStatus: {
    describe: manifest.hasDescription,  // NEW
    specify: manifest.hasSpec,
    // ... rest unchanged
  }
}
```

---

## Type Changes

### types/index.ts - WorkflowStepId

```typescript
// BEFORE
export type WorkflowStepId =
  | 'specify'
  | 'plan'
  | 'tasks'
  | 'implement'
  | 'test'
  | 'push'
  | 'pr'
  | 'bugfix';

// AFTER
export type WorkflowStepId =
  | 'describe'   // NEW - first step
  | 'specify'
  | 'plan'
  | 'tasks'
  | 'implement'
  | 'test'
  | 'push'
  | 'pr'
  | 'bugfix';
```

### types/index.ts - ArtifactManifest

```typescript
// BEFORE
export interface ArtifactManifest {
  hasSpec: boolean;
  // ...
}

// AFTER
export interface ArtifactManifest {
  hasDescription: boolean;  // NEW
  hasSpec: boolean;
  // ... rest unchanged
}
```

---

## Config Changes

### config/workflowSteps.ts - New Step

```typescript
import { PenLine } from 'lucide-react';  // NEW import

export const workflowSteps: WorkflowStep[] = [
  // NEW - Insert at position 0
  {
    id: 'describe',
    label: 'Describe',
    icon: PenLine,
    artifactPatterns: ['description.md'],
    requiresGitHub: false,
    hasContent: false,
  },
  // ... existing steps unchanged
];
```

---

## File System Entities

### description.md (per spec)

**Location**: `specs/{spec-id}/description.md`  
**Format**: Plain markdown text  
**Created**: On first save (auto-created if doesn't exist)  
**Content Structure**:

```markdown
# Feature Description

{user-entered description text}

<!-- Last modified: {ISO timestamp} -->
```

**Validation**: None (freeform text)  
**Size Limit**: None enforced (practical limit ~10KB for reasonable descriptions)

---

## Component Props

### NavPane.tsx

```typescript
interface NavPaneProps {
  // No props - reads from stores
}

// Internal state
const width = useSettingsStore(s => s.navPaneWidth);
const collapsed = useSettingsStore(s => s.navPaneCollapsed);
```

### ProjectHeader.tsx

```typescript
interface ProjectHeaderProps {
  projectName: string;
  onOpenProject: () => void;
}
```

### AvatarMenu.tsx

```typescript
interface AvatarMenuProps {
  isLoggedIn: boolean;
  userName?: string;
  avatarUrl?: string;
  onLogin: () => void;
  onSettings: () => void;
}
```

### DescribeEditor.tsx

```typescript
interface DescribeEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSendToTerminal: () => void;
  isSaving?: boolean;
}
```

---

## State Flow Diagram

```
User Action                  Store Update               Side Effect
─────────────────────────────────────────────────────────────────────
Resize nav pane      →   settingsStore.navPaneWidth   →   CSS width update
Collapse nav pane    →   settingsStore.navPaneCollapsed → CSS width → 48px
Change spec          →   projectStore.activeSpec      →   Load description.md
Type in Describe     →   descriptionStore.content     →   Debounced save
Click Send to Term   →   (none)                       →   writeTerminal()
Click Settings       →   (none)                       →   Open SettingsPanel
Click Open Project   →   projectStore.project         →   Dialog + reload
```

---

## Relationships

```
settingsStore
├── navPaneWidth ←────────── NavPane (reads, writes on resize)
└── navPaneCollapsed ←────── NavPane (reads, writes on toggle)

descriptionStore
├── content ←─────────────── DescribeEditor (reads, writes)
└── isDirty ←─────────────── DescribeEditor (reads), useDescription (writes)

projectStore
└── activeSpec ─────────────→ useDescription (triggers load)

workflowStore
└── selectedStep ←──────────── NavPane steps (clicks)
                  ──────────→ DetailPane (determines content)
```
