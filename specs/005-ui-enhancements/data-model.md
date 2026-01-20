# Data Model: SpeckitUI Enhanced Editing and Project Management

**Feature**: 005-ui-enhancements  
**Date**: 2026-01-19

## Entities

### ComposerContent

Rich content for the Describe view composer, persisted to `description.md`.

```typescript
interface ComposerContent {
  // Raw markdown content (primary storage format)
  markdown: string;
  
  // Metadata for tracking
  lastModified: string; // ISO timestamp
  
  // Embedded assets (images converted to base64 or file refs)
  assets: ComposerAsset[];
}

interface ComposerAsset {
  id: string;           // UUID
  type: 'image' | 'file';
  filename: string;
  // For inline images: base64 data URI
  // For files: relative path to assets/
  reference: string;
}
```

### AgentType

Supported AI agent CLI tools.

```typescript
type AgentType = 'copilot' | 'claude' | 'gemini';

interface AgentConfig {
  type: AgentType;
  displayName: string;
  filePath: string;  // Relative to repo root
  markerStart: string;
  markerEnd: string;
}

const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  copilot: {
    type: 'copilot',
    displayName: 'GitHub Copilot CLI',
    filePath: '.github/agents/copilot-instructions.md',
    markerStart: '<!-- SPECKITUI-DESCRIBE-START -->',
    markerEnd: '<!-- SPECKITUI-DESCRIBE-END -->',
  },
  claude: {
    type: 'claude',
    displayName: 'Claude Code CLI',
    filePath: 'CLAUDE.md',
    markerStart: '<!-- SPECKITUI-DESCRIBE-START -->',
    markerEnd: '<!-- SPECKITUI-DESCRIBE-END -->',
  },
  gemini: {
    type: 'gemini',
    displayName: 'Gemini CLI',
    filePath: 'GEMINI.md',
    markerStart: '<!-- SPECKITUI-DESCRIBE-START -->',
    markerEnd: '<!-- SPECKITUI-DESCRIBE-END -->',
  },
};
```

### Artifact

A markdown file associated with a workflow step.

```typescript
interface Artifact {
  id: string;           // e.g., 'spec', 'plan', 'tasks'
  filename: string;     // e.g., 'spec.md'
  path: string;         // Full path to file
  content: string;      // Current file content
  exists: boolean;      // Whether file exists on disk
  isModified: boolean;  // Has unsaved changes in editor
  gitStatus: GitStatus; // Uncommitted changes status
  lastLoaded: string;   // ISO timestamp of last load
}

type GitStatus = 'clean' | 'modified' | 'untracked' | 'staged' | 'conflict';
```

### EditorState

Tracks the editing state for markdown files.

```typescript
interface EditorState {
  // Currently edited artifact
  activeArtifact: string | null;
  
  // Unsaved content by artifact id
  unsavedChanges: Map<string, string>;
  
  // Is in edit mode
  isEditing: boolean;
}
```

### NewSpecInput

Input for creating a new feature spec.

```typescript
interface NewSpecInput {
  shortName: string;    // e.g., 'user-auth' (2-4 words, hyphenated)
  description: string;  // Full feature description
}

interface NewSpecResult {
  branchName: string;   // e.g., '006-user-auth'
  specFile: string;     // Path to created spec.md
  featureNum: string;   // e.g., '006'
}
```

### NewProjectInput

Input for creating a new project.

```typescript
interface NewProjectInput {
  name: string;         // Project folder name
  location: string;     // Parent directory path
}

interface NewProjectResult {
  path: string;         // Full path to created project folder
  initCommand: string;  // Command to run to initialize: 'npx speckit init'
}
```

## State Stores

### editorStore (Zustand)

```typescript
interface EditorStore {
  // State
  activeArtifact: string | null;
  unsavedChanges: Record<string, string>;
  isEditing: boolean;
  
  // Actions
  setActiveArtifact: (id: string | null) => void;
  setEditing: (editing: boolean) => void;
  updateContent: (artifactId: string, content: string) => void;
  clearUnsavedChanges: (artifactId: string) => void;
  hasUnsavedChanges: () => boolean;
}
```

### artifactStore (Zustand)

```typescript
interface ArtifactStore {
  // State
  artifacts: Record<string, Artifact>;
  
  // Actions
  loadArtifact: (id: string, path: string) => Promise<void>;
  updateArtifactContent: (id: string, content: string) => void;
  updateGitStatus: (id: string, status: GitStatus) => void;
  refreshArtifact: (id: string) => Promise<void>;
}
```

## File Structure

### Description Storage

```text
specs/###-feature/
├── description.md      # Composer content (auto-saved)
├── assets/             # Uploaded files and images
│   ├── image-001.png
│   └── document.pdf
└── ...
```

### Agent File Sections

```markdown
# CLAUDE.md (or other agent file)

[Existing spec-kit content...]

<!-- SPECKITUI-DESCRIBE-START -->
## Feature Context: [Feature Name]

[Composer content converted to markdown]

- Text blocks as paragraphs
- Code blocks with language tags
- Images as markdown image syntax
- Links as markdown links
- File references as links to assets/

*Added via SpeckitUI on 2026-01-19*
<!-- SPECKITUI-DESCRIBE-END -->

[Rest of file preserved...]
```

## Validation Rules

### NewSpecInput Validation
- `shortName`: 2-4 words, lowercase, hyphen-separated, alphanumeric only
- `description`: Non-empty, max 500 characters

### ComposerContent Validation
- `markdown`: No size limit (file system constraint)
- Images: Max 5MB per image (base64 encoded)
- Files: Max 10MB per file
