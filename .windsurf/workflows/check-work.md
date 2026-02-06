---
description: Validate completed implementation work against specs, patterns, and documentation
auto_execution_mode: 1
---

# Implementation Validation Workflow

Validates any completed implementation task against its specifications, source patterns, and integration requirements.

## 1. Identify Scope

Determine validation scope:

- **Single task**: User-specified task ID (e.g., "1.2")
- **Recent work**: Check `git status` for uncommitted files
- **Full stage**: Validate all completed tasks in a stage/phase
- **Custom**: User provides list of files/directories

## 2. Create Plan

- Use `update_plan` to create validation steps
- Keep steps small and verifiable
- Include test/verification steps at the end

## 3. Load Context Documents

Read key documentation:

- **Task docs**: `find_by_name` for `*X.Y*.md` patterns
- **Stage tracker**: `read_file` on `**/IMPLEMENTATION-TRACKER.md`
- **Proposal/spec**: `read_file` on `**/*PROPOSAL.md`

## 4. Implementation Analysis (Parallel FastContext)

Run simultaneously:

- FastContext #1: `{created_files_dir}` → "Analyze implementation structure and patterns"
- FastContext #2: `{related_services_dir}` → "Find integration points: API routes, services"
- FastContext #3: `{types_dir}` → "Check type definitions and exports"

## 5. Pattern Discovery (Parallel FastContext)

Find reference patterns:

- FastContext #1: "Find {pattern_name} implementation patterns"
- FastContext #2: "Find {pattern_name} source code examples"

## 6. Pattern Alignment Check

Use FastContext + grep_search to verify:

- [ ] Class/function naming conventions
- [ ] Expected method signatures
- [ ] Interface implementations
- [ ] Error handling patterns

## 7. Integration Verification

Search across codebase:

- `import.*{module}` → Who imports this?
- `{TypeName}` → Types exported correctly?
- `eventBus.emit` → Events emitted?
- `{serviceName}` → Service integration?

Verify with read_file:

- Type index exports new types
- Service/route imported where expected

## 8. Documentation Consistency

Cross-reference:

- Files listed in docs → `find_by_name` to verify exist
- API examples → `grep_search` to verify signatures match
- README/comments → Accurate to implementation

## 9. Gap Analysis

Comprehensive checks:

- FastContext: "Find missing error handling, logging, JSDoc comments"
- FastContext: "Find tests for {module_name}"

// turbo
Run TypeScript verification:

```bash
npx tsc --noEmit
```

## 10. Output Validation Report

### Validation Report: {scope}

**Status:** ✅ Pass | ⚠️ Gaps Found | ❌ Issues

#### Files Validated

| File      | Status | Notes            |
| --------- | ------ | ---------------- |
| `{file1}` | ✅     | Patterns aligned |
| `{file2}` | ⚠️     | Missing JSDoc    |

#### Pattern Alignment

- ✅/❌ {pattern1}: {finding}
- ✅/❌ {pattern2}: {finding}

#### Integration

- Exported from index: {result}
- Used by other modules: {result}
- Events emitted: {result}

#### Documentation

- Task docs exist and accurate: ✅/❌
- Tracker status updated: ✅/❌
- API examples match code: ✅/❌

#### Gaps Identified

1. **[Category]**: {description}
   - Found via: {tool}
   - Suggested fix: {action}

#### Recommended Actions

- [ ] {action1}
- [ ] {action2}

---

## Tool Usage Summary

| Step              | Tools Used               |
| ----------------- | ------------------------ |
| 1. Scope          | git status, user input   |
| 2. Plan           | update_plan              |
| 3. Load Docs      | find_by_name, read_file  |
| 4. Implementation | code_search (parallel)   |
| 5. Patterns       | code_search (parallel)   |
| 6. Alignment      | code_search, grep_search |
| 7. Integration    | grep_search, read_file   |
| 8. Documentation  | find_by_name, read_file  |
| 9. Gaps           | code_search              |
| 10. Report        | Output summary           |

---

## Usage Examples

### Example 1: Validate a specific phase

```
/check-work Phase 3 of profile-cohort-analysis
```

Validates all Phase 3 tasks against the IMPLEMENTATION-TRACKER.md and IMPLEMENTATION-PROPOSAL.md.

### Example 2: Validate recent uncommitted work

```
/check-work recent
```

Runs `git status`, identifies modified files, and validates against relevant specs.

### Example 3: Validate specific files

```
/check-work src/app/api/instagram/analyze/topics/route.ts
```

Validates the file against its endpoint pattern, checks integration, and verifies documentation.

### Example 4: Full stage validation before commit

```
/check-work Phase 3 --pre-commit
```

Comprehensive validation suitable for pre-commit review, including all integration and documentation checks.

### Example 5: Validate a task by ID

```
/check-work task 3.2
```

Finds task 3.2 documentation, validates implementation files, and cross-references the tracker.
