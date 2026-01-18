# Contract: Description Commands

**Feature**: 002-nav-pane-redesign  
**Date**: 2026-01-17  
**Purpose**: Define Tauri IPC commands for description.md file operations

## Commands

### save_description

Save feature description text to a spec's description.md file.

**Rust Signature**:
```rust
#[tauri::command]
pub async fn save_description(
    spec_path: String,
    content: String
) -> Result<(), String>
```

**TypeScript Wrapper**:
```typescript
export async function saveDescription(
  specPath: string,
  content: string
): Promise<void> {
  return invoke('save_description', { specPath, content });
}
```

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| spec_path | String | Yes | Absolute path to spec directory |
| content | String | Yes | Description text to save |

**Returns**: `Result<(), String>`
- `Ok(())` on successful save
- `Err(message)` on file system error

**Behavior**:
1. Construct path: `{spec_path}/description.md`
2. Create file if doesn't exist
3. Write content with UTF-8 encoding
4. Return success or error message

**Error Cases**:
- `"Invalid spec path: {path}"` - spec_path doesn't exist
- `"Permission denied: {path}"` - cannot write to location
- `"IO error: {details}"` - other file system errors

---

### load_description

Load feature description text from a spec's description.md file.

**Rust Signature**:
```rust
#[tauri::command]
pub async fn load_description(
    spec_path: String
) -> Result<String, String>
```

**TypeScript Wrapper**:
```typescript
export async function loadDescription(
  specPath: string
): Promise<string> {
  return invoke('load_description', { specPath });
}
```

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| spec_path | String | Yes | Absolute path to spec directory |

**Returns**: `Result<String, String>`
- `Ok(content)` - description text (empty string if file doesn't exist)
- `Err(message)` on file system error

**Behavior**:
1. Construct path: `{spec_path}/description.md`
2. If file doesn't exist, return empty string (not an error)
3. Read file with UTF-8 encoding
4. Return content

**Error Cases**:
- `"Invalid spec path: {path}"` - spec_path doesn't exist
- `"Permission denied: {path}"` - cannot read from location
- `"Encoding error: file is not valid UTF-8"` - malformed file
- `"IO error: {details}"` - other file system errors

---

## Command Registration

In `src-tauri/src/lib.rs`:

```rust
mod commands {
    pub mod description;  // NEW
    // ... existing modules
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // ... existing commands
            commands::description::save_description,  // NEW
            commands::description::load_description,  // NEW
        ])
        .run(tauri::generate_context!())
        .expect("error running tauri application");
}
```

---

## Frontend Usage

### In useDescription hook

```typescript
import { saveDescription, loadDescription } from '@/services/tauriCommands';
import { useDescriptionStore } from '@/stores/descriptionStore';
import { useProjectStore } from '@/stores/projectStore';
import { useCallback, useEffect, useRef } from 'react';

export function useDescription() {
  const { activeSpec } = useProjectStore();
  const { 
    content, setContent, setLoading, setSaving, 
    setLastSaved, setError, markClean, reset 
  } = useDescriptionStore();
  
  const saveTimeoutRef = useRef<number | null>(null);

  // Load description when spec changes
  useEffect(() => {
    if (!activeSpec?.path) {
      reset();
      return;
    }
    
    setLoading(true);
    loadDescription(activeSpec.path)
      .then((text) => {
        setContent(text);
        markClean();
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [activeSpec?.path]);

  // Debounced save
  const save = useCallback(async (text: string) => {
    if (!activeSpec?.path) return;
    
    // Clear pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Schedule save after 500ms
    saveTimeoutRef.current = window.setTimeout(async () => {
      setSaving(true);
      try {
        await saveDescription(activeSpec.path, text);
        setLastSaved(new Date());
        markClean();
      } catch (err) {
        setError(String(err));
      } finally {
        setSaving(false);
      }
    }, 500);
  }, [activeSpec?.path]);

  return {
    content,
    updateContent: (text: string) => {
      setContent(text);
      save(text);
    },
  };
}
```

---

## Testing

### Rust Unit Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[tokio::test]
    async fn test_save_and_load_description() {
        let dir = tempdir().unwrap();
        let spec_path = dir.path().to_string_lossy().to_string();
        
        // Save
        let result = save_description(spec_path.clone(), "Test description".to_string()).await;
        assert!(result.is_ok());
        
        // Load
        let content = load_description(spec_path).await.unwrap();
        assert_eq!(content, "Test description");
    }

    #[tokio::test]
    async fn test_load_missing_returns_empty() {
        let dir = tempdir().unwrap();
        let spec_path = dir.path().to_string_lossy().to_string();
        
        let content = load_description(spec_path).await.unwrap();
        assert_eq!(content, "");
    }
}
```
