---
description: Generate LLM-optimized wiki documentation for a dashboard page
---

# Documentation Generation Workflow (/document)

## Purpose

Generate comprehensive, user-focused documentation for dashboard pages following the Celavii Wiki standards. This workflow produces LLM-optimized content for the Platform Assistant.

---

## Prerequisites

- Wiki structure exists at `Docs/Wiki/`
- Template available at `Docs/Wiki/_template.md`
- Target page exists in codebase

---

## Workflow Steps

### Step 1: Identify Target Page

Ask user which page to document or identify from context.

- Example pages: discover, manage, email, analyze, track, studio, pay, settings/\*

### Step 2: User Provides Initial Feature List

Request user to list known features and elements:

- Main functionality
- UI components
- Actions/operations
- Filters/options

### Step 3: FastContext Analysis

// turbo
Run FastContext searches on the target page:

1. **Main page component**: `src/app/dashboard/[orgSlug]/[page]/page.tsx`
2. **Related components**: Search for imported components
3. **API routes**: Search `src/app/api/` for related endpoints
4. **Services**: Search `src/lib/services/` for business logic

Focus on:

- UI elements and their purposes
- User actions and flows
- API endpoints used
- State management patterns

### Step 4: Build Feature Inventory

Compile discovered features into a structured inventory:

```
| Feature Category | Features Found |
|------------------|----------------|
| Data Collection  | [list]         |
| Filters          | [list]         |
| Actions          | [list]         |
| UI Elements      | [list]         |
| API Routes       | [list]         |
```

Add any features discovered via FastContext that user didn't mention.

### Step 5: User Confirms Inventory

Present inventory to user for confirmation.

- Wait for approval before proceeding
- Make adjustments if user identifies missing/incorrect items
- **MUST run**: `echo "awaiting confirmation"` after presenting inventory

### Step 6: Generate Documentation

Create wiki page at `Docs/Wiki/pages/[page].md` using template structure:

**Required Sections:**

1. Header (Path, Last Updated, Category)
2. What This Page Does
3. Key Features
4. How To Use (task walkthroughs)
5. UI Elements (tables)
6. Use Case Scenarios & Strategies
7. Tips & Best Practices
8. Common Questions
9. Related Pages
10. Related Concepts
11. Troubleshooting
12. Limits & Quotas

**Content Guidelines:**

- User-focused, not technical implementation
- No internal provider names (Apify, OpenAI, Gemini, etc.)
- Action-oriented language
- Include realistic workflow strategies
- FAQ format for common questions

### Step 7: Update Wiki Index

Add entry to `Docs/Wiki/README.md` if not present.

### Step 8: Verify & Complete

- Confirm file created successfully
- Check all sections populated
- Signal completion with `echo "end"`

---

## Output Rules

- All documentation goes in `Docs/Wiki/pages/`
- Use template structure from `Docs/Wiki/_template.md`
- Never reference internal services/providers in user-facing docs
- Include practical use case scenarios
- Add 24-48 hour refinement notes where applicable
- End with `echo "end"` per /end workflow

---

## Content Standards

### Use Case Scenarios Format

Each strategy should follow this pattern:

```markdown
### Strategy N: [Goal-oriented scenario name]

**Goal**: [What the user wants to achieve]

1. **[Step name]** — [Description of what to do]
2. **[Step name]** — [Description of what to do]
   ...
```

### Tips Format

Organize tips into categories:

- **Workflow Tips**: Process-related advice
- **Search Tips**: Finding content effectively
- **Quality Tips**: Ensuring good results

### UI Elements Table Format

```markdown
| Element | Location | Description | Action   |
| ------- | -------- | ----------- | -------- |
| [Name]  | [Where]  | [What]      | [Result] |
```

---

## Example Usage

**User**: "/document the Manage page"

**Assistant Flow**:

1. Ask for initial feature list
2. Run FastContext on manage page components
3. Build and present feature inventory
4. `echo "awaiting confirmation"`
5. Wait for user confirmation
6. Generate `Docs/Wiki/pages/manage.md`
7. Update README if needed
8. `echo "end"`

---

## Related Workflows

- **/check-work** - Validate completed documentation
- **/implement** - For implementing features, not documenting
- **/end** - Completion signaling pattern

---

**Workflow Version**: 1.0  
**Last Updated**: January 1, 2026  
**Status**: Active
