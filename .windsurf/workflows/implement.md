---
description: Implement a specific task from a stage or phase plan
---

# Task Implementation Workflow

Implement a specific task from the stage or phase plan following established patterns.

---

## Steps

### 1. Parallel & Sequential Context Gathering

- CODE_SEARCH ON `Implementation/[feature]/phase-[n]/` - Phase context and task specs
- CODE_SEARCH ON `src/` - Existing code patterns
- CODE_SEARCH ON `supabase/` - Migration files, RPCs, Edge Functions
- CODE_SEARCH ON `prisma/` - Database schema and models
- CODE_SEARCH ON `Implementation/` or `Docs/` - Documentation and previous related work
- CODE_SEARCH ON task-specific directories as needed

### 2. Load Task Specs

- Read the **IMPLEMENTATION-TRACKER.md** for current progress and decisions
- Read the **IMPLEMENTATION-PROPOSAL.md** for phase overview
- Read the specific task or phase file and validation documentation
- Review any provided orchestration plan for task dependencies
- Review context window and conversation history

### 3. Check Dependencies

- Verify prerequisite tasks are completed
- Check if required services/tables exist
- Identify integration points with existing code

### 4. Create Plan

- Use `update_plan` to create implementation steps
- Keep steps small and verifiable
- Include test/verification steps at the end

### 5. Implement

- Create/modify files as specified in task doc
- Follow TypeScript patterns from project rules
- Add imports at top of files (never in middle)
- Include JSDoc comments for public functions
- Install packages with `npm add` if needed
- Create testing modules when applicable

### 6. Verify

// turbo

- Run existing tests: `npm test`
  // turbo
- Verify no TypeScript errors: `npx tsc --noEmit`
  // turbo
- Verify build succeeds: `npm run build`

### 7. Update Task Documentation

- Create or update the task doc file in the phase directory
- Update stage/phase tracker with completion status
- Update stage/phase proposal if scope changed

---

## Patterns to Follow

### File Creation

```typescript
// Imports at top
import { something } from '@/lib/something';

/**
 * JSDoc for public functions
 */
export function myFunction() { ... }
```

### Task Documentation Format

```markdown
## Task: [Task Name]

**Status:** ✅ Complete | 🔄 In Progress | ❌ Blocked

### What Was Done

- [List of changes]

### Files Modified

- `path/to/file.ts`

### Testing

- [How it was verified]
```

---

## Output Rules

- Follow existing code patterns in the codebase
- Report progress in chat
- Do NOT commit automatically - wait for user to say "commit"
- If blocked, clearly state the blocker and ask for guidance
