# SpeckitUI Constitution

## Core Principles

### I. Simplicity First
Start with the simplest solution that works. Avoid premature abstraction and over-engineering. YAGNI (You Aren't Gonna Need It) applies strictly—only implement features with clear, immediate requirements.

### II. Local-First Architecture
SpeckitUI operates primarily on local file system data. No remote databases, no cloud dependencies for core functionality. GitHub integration is optional and degrades gracefully when offline.

### III. Tauri Standard Patterns
Follow Tauri 2.x conventions and best practices. Rust backend handles file I/O, terminal PTY, and system integration. React frontend handles UI rendering and state. IPC commands are the bridge—keep them minimal and well-documented.

### IV. Test-First Development
Tests MUST be written before implementation for all backend commands and core frontend logic. Frontend components may use snapshot testing. E2E tests validate critical user journeys.

### V. Spec-Kit Compatibility
Respect spec-kit directory structure (`.specify/`, `specs/`). Parse and render markdown artifacts faithfully. Checkbox modifications must be atomic and preserve file formatting.

### VI. Performance Budgets
- Navigation between steps: <1 second
- Project open and scan: <3 seconds
- Terminal spawn: <2 seconds
- Markdown render: <500ms for typical files

## Technology Constraints

- **Desktop Only**: Tauri-based desktop app. No web deployment, no mobile.
- **Single User**: No collaboration features, no multi-user state.
- **Single Project**: One project open at a time. No workspace/multi-root.
- **Read-Heavy**: Optimize for reading artifacts, not editing (except checkboxes).

## Quality Gates

1. **Pre-Implementation Gate**: Spec.md, plan.md, and tasks.md must exist before coding.
2. **Test Gate**: All Rust commands must have unit tests. All user stories must have E2E coverage.
3. **Contract Gate**: IPC API contracts must be documented before implementation.

## Governance

This constitution governs all development decisions for SpeckitUI. Deviations require explicit justification in the relevant spec or plan document. Constitution amendments require a dedicated PR with rationale.

**Version**: 1.0.0 | **Ratified**: January 16, 2026 | **Last Amended**: January 16, 2026
