# Quickstart: Navigation Pane Redesign

**Feature**: 002-nav-pane-redesign  
**Date**: 2026-01-17  
**Purpose**: Step-by-step implementation guide

## Prerequisites

- [ ] Feature branch `002-nav-pane-redesign` checked out
- [ ] Development environment running (`npm run dev` in frontend, `cargo tauri dev`)
- [ ] Spec and plan reviewed

## Implementation Order

Follow this order to minimize integration issues and enable incremental testing.

---

## Phase 1: Foundation (Types & Stores)

### Step 1.1: Add 'describe' to WorkflowStepId

**File**: `src/types/index.ts`

```typescript
export type WorkflowStepId =
  | 'describe'   // ADD THIS
  | 'specify'
  // ... rest unchanged
```

**Test**: TypeScript compilation passes

---

### Step 1.2: Add hasDescription to ArtifactManifest

**File**: `src/types/index.ts`

```typescript
export interface ArtifactManifest {
  hasDescription: boolean;  // ADD THIS
  hasSpec: boolean;
  // ... rest unchanged
}
```

**Test**: TypeScript compilation passes

---

### Step 1.3: Add Describe step to workflowSteps

**File**: `src/config/workflowSteps.ts`

```typescript
import { PenLine } from 'lucide-react';  // ADD import

export const workflowSteps: WorkflowStep[] = [
  {
    id: 'describe',
    label: 'Describe',
    icon: PenLine,
    artifactPatterns: ['description.md'],
    requiresGitHub: false,
    hasContent: false,
  },
  // ... existing steps
];
```

**Test**: NavPane shows 9 steps instead of 8

---

### Step 1.4: Add nav pane settings to settingsStore

**File**: `src/stores/settingsStore.ts`

Add to initial state:
```typescript
navPaneWidth: 220,
navPaneCollapsed: false,
```

Add actions:
```typescript
setNavPaneWidth: (width) => set({ 
  navPaneWidth: Math.max(180, Math.min(400, width)) 
}),
setNavPaneCollapsed: (collapsed) => set({ navPaneCollapsed: collapsed }),
toggleNavPaneCollapsed: () => set((s) => ({ 
  navPaneCollapsed: !s.navPaneCollapsed 
})),
```

**Test**: Settings persist after app reload

---

### Step 1.5: Create descriptionStore

**File**: `src/stores/descriptionStore.ts` (NEW)

See data-model.md for full interface. Start with:
```typescript
import { create } from 'zustand';

interface DescriptionState {
  content: string;
  isDirty: boolean;
  setContent: (content: string) => void;
  reset: () => void;
}

export const useDescriptionStore = create<DescriptionState>((set) => ({
  content: '',
  isDirty: false,
  setContent: (content) => set({ content, isDirty: true }),
  reset: () => set({ content: '', isDirty: false }),
}));
```

**Test**: Store can be imported without errors

---

## Phase 2: Tauri Backend

### Step 2.1: Create description commands

**File**: `src-tauri/src/commands/description.rs` (NEW)

```rust
use std::path::Path;
use tokio::fs;

#[tauri::command]
pub async fn save_description(spec_path: String, content: String) -> Result<(), String> {
    let path = Path::new(&spec_path).join("description.md");
    fs::write(&path, content)
        .await
        .map_err(|e| format!("Failed to save description: {}", e))
}

#[tauri::command]
pub async fn load_description(spec_path: String) -> Result<String, String> {
    let path = Path::new(&spec_path).join("description.md");
    if !path.exists() {
        return Ok(String::new());
    }
    fs::read_to_string(&path)
        .await
        .map_err(|e| format!("Failed to load description: {}", e))
}
```

**Test**: `cargo test` passes

---

### Step 2.2: Register commands in lib.rs

**File**: `src-tauri/src/lib.rs`

Add to invoke_handler:
```rust
commands::description::save_description,
commands::description::load_description,
```

**Test**: `cargo build` succeeds

---

### Step 2.3: Add TypeScript wrappers

**File**: `src/services/tauriCommands.ts`

```typescript
export async function saveDescription(specPath: string, content: string): Promise<void> {
  return invoke('save_description', { specPath, content });
}

export async function loadDescription(specPath: string): Promise<string> {
  return invoke('load_description', { specPath });
}
```

**Test**: Can call from browser devtools

---

## Phase 3: Component Implementation

### Step 3.1: Create ProjectHeader component

**File**: `src/components/layout/ProjectHeader.tsx` (NEW)

Simple component showing project name (uppercase) with folder picker button.

**Test**: Renders project name, clicking folder opens dialog

---

### Step 3.2: Create AvatarMenu component

**File**: `src/components/layout/AvatarMenu.tsx` (NEW)

Uses DropdownMenu from shadcn/ui with CircleUser icon.

**Test**: Menu opens with Settings option, clicking opens SettingsPanel

---

### Step 3.3: Create NavPaneResizeHandle component

**File**: `src/components/layout/NavPaneResizeHandle.tsx` (NEW)

Adapt pattern from TerminalPanel for horizontal resize.

**Test**: Dragging changes nav pane width

---

### Step 3.4: Refactor NavPane

**File**: `src/components/layout/NavPane.tsx`

Major changes:
1. Replace fixed width with dynamic from store
2. Add collapsed state with icon rail
3. Add ProjectHeader at top
4. Move SpecSelector into pane
5. Add AvatarMenu at bottom
6. Add resize handle

**Test**: Full NavPane functionality

---

### Step 3.5: Create DescribeStep component

**File**: `src/components/workflow/DescribeStep.tsx` (NEW)

Text editor with "Send to Terminal" button.

**Test**: Text persists, button writes to terminal

---

### Step 3.6: Update AppShell

**File**: `src/components/layout/AppShell.tsx`

Remove settings button from header (moved to AvatarMenu).

**Test**: Settings still accessible via avatar menu

---

### Step 3.7: Update DetailPane

**File**: `src/components/layout/DetailPane.tsx`

Add case for 'describe' step to render DescribeStep component.

**Test**: Clicking Describe shows editor

---

## Phase 4: Integration & Polish

### Step 4.1: Update SpecSelector

Remove "Spec:" label, add new spec button.

### Step 4.2: Add keyboard shortcuts

- `Cmd/Ctrl + B`: Toggle nav pane collapse
- `Cmd/Ctrl + Shift + D`: Focus Describe editor

### Step 4.3: Add tooltips

Step icons in collapsed state show step name on hover.

### Step 4.4: Add animation

Smooth width transition for collapse/expand.

---

## Verification Checklist

- [ ] Project name shows uppercase at top of nav pane
- [ ] Folder picker icon opens project dialog
- [ ] Spec dropdown has no "Spec:" label
- [ ] New spec button creates specs
- [ ] Describe step appears first in workflow
- [ ] Description text saves/loads per spec
- [ ] "Send to Terminal" injects text
- [ ] Avatar menu shows at bottom
- [ ] Settings accessible from avatar menu
- [ ] Nav pane resizes with drag (180-400px)
- [ ] Nav pane collapses to icon rail
- [ ] Icon rail shows step icons and avatar
- [ ] Width/collapsed state persists
