# Quickstart: SpeckitUI Core Application

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)  
**Date**: January 16, 2026

---

## Key Validation Scenarios

These scenarios validate the core functionality and should pass before release.

---

### Scenario 1: First Launch & Project Open

**Goal**: Verify application launches and can open a spec-kit project.

**Steps**:
1. Launch SpeckitUI application
2. Click "Open Project" or use File → Open
3. Select a folder containing `.specify/` and `specs/` directories
4. Observe the navigation pane and spec selector

**Expected Results**:
- [ ] Application window opens without errors
- [ ] "Open Project" action is accessible
- [ ] Project folder picker appears (native OS dialog)
- [ ] After selection, project name appears in header/title
- [ ] Spec instances are listed in the spec selector
- [ ] Navigation pane shows all 8 workflow steps
- [ ] First spec instance is auto-selected (or empty state if none)

---

### Scenario 2: Workflow Navigation

**Goal**: Verify navigation between workflow steps functions correctly.

**Precondition**: Project with at least one spec instance is open.

**Steps**:
1. Click on "Specify" in navigation pane
2. Observe detail pane content
3. Click on "Plan" in navigation pane
4. Observe detail pane content
5. Click through all 8 steps: Specify → Plan → Tasks → Implement → Test → Push → PR → Bug Fix

**Expected Results**:
- [ ] Each step becomes highlighted when clicked
- [ ] Detail pane content changes for each step
- [ ] Steps with artifacts show content indicators (badge/icon)
- [ ] Steps without artifacts show empty state message
- [ ] Navigation responds in <1 second

---

### Scenario 3: Artifact Display with Tabs

**Goal**: Verify multi-artifact display in tabbed interface.

**Precondition**: Spec instance with plan.md, research.md, and data-model.md exists.

**Steps**:
1. Select a spec instance with Plan phase completed
2. Click on "Plan" step
3. Observe the tabbed interface
4. Click through each artifact tab

**Expected Results**:
- [ ] Tabs appear for each available artifact (plan.md, research.md, data-model.md, etc.)
- [ ] First tab is selected by default
- [ ] Clicking a tab shows that artifact's content
- [ ] Markdown renders with proper formatting (headers, lists, code blocks, tables)
- [ ] Tab switching is instant (<100ms)

---

### Scenario 4: Checklist Interaction

**Goal**: Verify checkboxes can be toggled and changes persist.

**Precondition**: Spec instance with tasks.md containing checkbox items.

**Steps**:
1. Select "Tasks" step
2. Locate an unchecked item `- [ ] Some task`
3. Click the checkbox
4. Observe the checkbox state change
5. Close and reopen the application
6. Navigate back to Tasks step

**Expected Results**:
- [ ] Checkbox toggles to checked state visually
- [ ] File is saved within 1 second
- [ ] Progress indicator updates (e.g., "5/20 complete")
- [ ] After reopen, checkbox remains in checked state
- [ ] No duplicate saves or race conditions

---

### Scenario 5: Terminal Panel

**Goal**: Verify terminal can be opened and used.

**Steps**:
1. Locate terminal panel at bottom of screen
2. If collapsed, expand it
3. Click "New Terminal" or "+" button
4. Type a simple command (e.g., `echo hello` or `dir`)
5. Press Enter

**Expected Results**:
- [ ] Terminal panel is visible at bottom
- [ ] Panel can be resized by dragging border
- [ ] Panel can be collapsed/expanded
- [ ] New terminal session opens within 2 seconds
- [ ] Command prompt appears (shell-appropriate)
- [ ] Command executes and output displays
- [ ] Terminal supports multiple tabs/sessions

---

### Scenario 6: Multiple Spec Instances

**Goal**: Verify switching between spec instances updates all views.

**Precondition**: Project with at least 2 spec instances.

**Steps**:
1. Note the current spec instance in selector
2. Select a different spec instance
3. Observe navigation and detail pane
4. Navigate to different workflow steps

**Expected Results**:
- [ ] Spec selector shows all available specs
- [ ] Switching spec updates detail pane content
- [ ] Navigation indicators update for new spec's artifacts
- [ ] Transition completes within 2 seconds
- [ ] Previous spec's terminal sessions remain available

---

### Scenario 7: Implement Step File Tree

**Goal**: Verify file tree and source viewer in Implement step.

**Precondition**: Spec with source files created (or any project with src/ files).

**Steps**:
1. Navigate to "Implement" step
2. Observe file tree on left side of detail pane
3. Expand folders in tree
4. Click on a source file (e.g., .ts, .rs, .py)

**Expected Results**:
- [ ] File tree shows project source structure
- [ ] Folders can be expanded/collapsed
- [ ] Selecting a file shows content in viewer pane
- [ ] Source code has syntax highlighting
- [ ] Viewer is read-only (no editing)

---

### Scenario 8: GitHub PR Step (Online)

**Goal**: Verify GitHub integration displays PR information.

**Precondition**: 
- GitHub authentication configured
- Project has a GitHub remote
- Current branch has an open PR

**Steps**:
1. Navigate to "PR" step
2. Observe PR information display

**Expected Results**:
- [ ] PR title and number displayed
- [ ] PR state (open/closed/merged) visible
- [ ] Review comments listed with author and content
- [ ] Status checks displayed with pass/fail state
- [ ] Data loads within 5 seconds

---

### Scenario 9: Offline Mode

**Goal**: Verify graceful degradation when offline.

**Steps**:
1. Disconnect from network (disable WiFi/ethernet)
2. Navigate to "PR" step
3. Observe the display
4. Navigate to "Bug Fix" step
5. Navigate to local steps (Specify, Plan, Tasks)

**Expected Results**:
- [ ] PR step shows "No connection" message
- [ ] Bug Fix step shows "No connection" message
- [ ] Local steps (Specify, Plan, Tasks, Implement) work normally
- [ ] Terminal sessions continue to function
- [ ] Application does not crash or hang

---

### Scenario 10: Settings and Constitution

**Goal**: Verify settings access and constitution display.

**Steps**:
1. Open settings/preferences (gear icon or menu)
2. Locate constitution section
3. View constitution content

**Expected Results**:
- [ ] Settings accessible via clear UI affordance
- [ ] Constitution.md content displays
- [ ] Markdown formatting preserved
- [ ] Settings can be closed to return to main view

---

## Smoke Test Checklist

Quick validation for build verification:

- [ ] App launches without crash
- [ ] Can open a project folder
- [ ] Navigation clicks respond
- [ ] At least one artifact displays
- [ ] Terminal opens
- [ ] App closes cleanly

---

## Performance Benchmarks

| Metric | Target | How to Measure |
|--------|--------|----------------|
| App launch → ready | <3s | Stopwatch from click to usable UI |
| Project open → display | <3s | Timer from folder select to content shown |
| Navigation click → render | <1s | Visual observation |
| Checkbox toggle → save | <1s | Watch file modification time |
| Terminal spawn | <2s | Timer from click to prompt |
| GitHub data load | <5s | Timer on PR step selection |

---

## Test Data Setup

### Create Test Project

```bash
# Create a test project structure
mkdir test-speckitui-project
cd test-speckitui-project

# Initialize spec-kit structure
mkdir -p .specify/memory
mkdir -p specs/001-test-feature/checklists
mkdir -p specs/001-test-feature/contracts
mkdir -p specs/002-another-feature
mkdir -p src

# Create constitution
echo "# Test Constitution" > .specify/memory/constitution.md

# Create spec.md
cat > specs/001-test-feature/spec.md << 'EOF'
# Feature Specification: Test Feature

## User Stories
- US-001: As a user, I want to test the app

## Requirements
- FR-001: System MUST display content
EOF

# Create plan.md
echo "# Implementation Plan: Test Feature" > specs/001-test-feature/plan.md

# Create tasks.md with checkboxes
cat > specs/001-test-feature/tasks.md << 'EOF'
# Tasks

## Phase 1
- [ ] Task 1: Create models
- [ ] Task 2: Create services
- [x] Task 3: Already done

## Phase 2
- [ ] Task 4: Implement feature
- [ ] Task 5: Write tests
EOF

# Create sample source file
echo "console.log('hello');" > src/index.js
```

This creates a minimal but complete test project for validation.
