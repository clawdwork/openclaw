---
description: Task completion signaling pattern - echo "end" when work is complete
---

# Task Completion Workflow (/end)

## Purpose

This workflow establishes a critical pattern for signaling task completion through Cascade terminal commands. This ensures clear boundaries between work completion and readiness for next instructions.

---

## Core Rules (CRITICAL - MUST FOLLOW)

### 1. Completion Signal Pattern

When the user requests changes, updates, or any work:

**YOU MUST:**

1. ✅ Complete ALL requested work
2. ✅ Perform ALL file edits, searches, and operations
3. ✅ Provide comprehensive summary of what was done
4. ✅ Share any relevant findings or next steps
5. ✅ **AS THE ABSOLUTE FINAL ACTION**: Run Cascade terminal command `echo "end"`
6. ❌ **DO NOT write ANY text after the echo command**

**Command Pattern:**
// turbo

```bash
echo "end"
```

### 2. No Text After Completion

- The completion signal MUST be the last thing you output
- Do not add summaries, explanations, or follow-up text after signaling completion
- All communication must happen BEFORE the completion signal

### 3. User-Directed Commands

If the user provides a specific command or instruction:

- **Treat it as your next task/instruction**
- Execute that task fully
- Follow the same pattern: work → summary → signal completion

**Example:**

```
User: "implement dark theme"

You must:
1. Implement dark theme changes
2. Provide summary of changes
3. Signal completion
```

---

## Workflow Steps

### Step 1: Receive User Request

User provides a request for changes, updates, or implementation.

### Step 2: Execute Work

- Read necessary files
- Make required edits
- Run commands as needed
- Search for context
- Implement features
- Fix bugs
- Update documentation

### Step 3: Provide Summary (BEFORE echo)

Share comprehensive information:

- What was done
- Files modified
- Changes made
- Any issues encountered
- Next steps or recommendations
- Testing suggestions

### Step 4: Signal Completion (FINAL ACTION)

// turbo

```bash
echo "end"
```

**STOP HERE - No additional output**

---

## Examples

### Example 1: Feature Implementation

**User Request:** "Add dark theme to onboarding page"

**Your Response Flow:**

```
1. [Read onboarding files]
2. [Apply dark theme changes]
3. [Update 5 files with new styles]

Summary:
✅ Applied dark theme to OnboardingWizard.tsx
✅ Updated Step1-4 components with dark glass cards
✅ Changed background from light gradient to dark navy
✅ Updated input styles and CTA buttons

Files modified:
- src/components/onboarding/OnboardingWizard.tsx
- src/components/onboarding/steps/Step1Welcome.tsx
- src/components/onboarding/steps/Step2Email.tsx
... (etc)

[RUN COMMAND]
```

```bash
echo "end"
```

[NO TEXT AFTER THIS]

---

### Example 2: User-Directed Task

**User provides:** "add unit tests"

**Your Response Flow:**

```
Executing task: "add unit tests"

1. [Create test files]
2. [Write test cases]
3. [Configure test runner]

Summary:
✅ Created 12 unit test files
✅ Added tests for all onboarding steps
✅ Configured Jest for component testing
✅ All tests passing (24/24)

[RUN COMMAND]
```

```bash
echo "end"
```

[NO TEXT AFTER THIS]

---

## Anti-Patterns (DO NOT DO THIS)

### ❌ Wrong: Text after completion

```
Summary: All changes complete.
Files modified: 5 files

Great! I've completed the dark theme implementation. Let me know if you need anything else!
```

### ❌ Wrong: No summary

```
Done.
```

### ❌ Wrong: Summary in middle of response

```
Summary: All changes complete.

Oh wait, I also need to mention that you should test on mobile...
```

### ✅ Correct: Summary then echo

```
Summary: All changes complete.
Files modified: 5 files
Next steps: Test on mobile devices

[RUN COMMAND]
```

```bash
echo "end"
```

---

## Special Cases

### If Work Cannot Be Completed

If you encounter a blocker and cannot complete the work:

1. Explain the issue clearly
2. Provide what you've done so far
3. Suggest solutions or ask for clarification
4. **Still signal completion** (user will provide next steps)

### If User Provides No Clear Instruction

- Wait for user's next instruction
- Do not execute work
- Do not output summary

### If Multiple Tasks in One Request

```
User: "Add dark theme AND create tests AND update docs"

You:
1. Complete ALL three tasks
2. Provide comprehensive summary of all work
3. End with single `echo "end"`
```

---

## Why This Pattern?

1. **Clear Boundaries**: Signals unambiguous task completion
2. **Automation-Friendly**: Can be parsed by scripts/tools
3. **User Control**: User can chain commands by modifying echo value
4. **No Ambiguity**: No confusion about whether work is complete
5. **Clean Output**: Summary is complete before signal

---

## Checklist for Every Response

Before outputting `echo "end"`, verify:

- [ ] All requested work is complete
- [ ] All files are edited/created as needed
- [ ] Summary is comprehensive and clear
- [ ] Any errors or issues are explained
- [ ] Next steps are provided (if applicable)
- [ ] No pending questions for yourself (if blockers, ask user)

Then and only then:

```bash
echo "end"
```

---

## Priority Level: CRITICAL

This workflow overrides normal response patterns. The completion signal is **mandatory** for all work requests.

**Remember:**

- Work first
- Summarize second
- `echo "end"` last
- Nothing after echo

---

**Workflow Version**: 1.0  
**Last Updated**: January 1, 2026  
**Status**: Active
