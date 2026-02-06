---
description: Generate a professional proposal document from a markdown specification using the generating-proposal-documents skill
---

# Generate Proposal Document

Creates print-ready React proposal components from markdown specifications.

## Step 1: Gather Requirements

Ask the user for:

1. **Document Type**: One-pager (8.5x11) or Multi-page scroll?
2. **Content Specification**: Provide as markdown or describe what sections are needed
3. **Target Path**: Where should the component be created? (e.g., `src/app/proposals/[name]/page.tsx`)

If not provided, prompt the user for these details before proceeding.

## Step 2: Load Brand Context (CRITICAL)

**IMPORTANT: Always check for and validate branding BEFORE generating any code.**

### Priority Order (Check in This Sequence)

#### 1. ✅ FIRST: Check for `.styles/[company]/brand.json` (PREFERRED)

**Check if brand JSON exists:**

```bash
ls .styles/*/brand.json 2>/dev/null
```

**If found:**

1. Ask user which company/brand to use (if multiple exist)
2. Read the brand JSON file:
   ```bash
   cat .styles/celavii/brand.json
   ```
3. Load brand data into BRAND constant:

   ```tsx
   import brandData from "@/.styles/celavii/brand.json";

   const BRAND = {
     name: brandData.name,
     tagline: brandData.tagline,
     colors: brandData.colors,
     gradients: brandData.gradients,
     typography: brandData.typography,
     logo: brandData.logo,
   };
   ```

4. **Proceed to Step 3**

#### 2. ✅ SECOND: Offer Firecrawl Brand Extraction (If No .styles/ File)

**If no brand JSON exists, ask user:**

> "I don't see a brand JSON for [company]. Would you like me to:
>
> 1. **Extract branding from a website** (requires Firecrawl MCP)
> 2. **Check for @brand-identity skill** (if available)
> 3. **Use default template** (.styles/default/brand.json)
> 4. **Provide branding manually** (I'll create the JSON for you)"

**If user chooses Option 1 (Firecrawl):**

1. Ask for website URL:

   > "Which website should I extract branding from? (e.g., antigravity.google, celavii.com)"

2. Use Firecrawl MCP to scrape branding:

   ```bash
   # Note: This is conceptual - actual tool call varies
   mcp_firecrawl_scrape(url="antigravity.google", formats=["branding"])
   ```

3. Transform Firecrawl output to `.styles/` schema:

   ```typescript
   const brandJson = {
     name: data.metadata.ogTitle || data.metadata.title,
     tagline: data.metadata.ogDescription || "Your Tagline Here",
     website: data.metadata.url,
     logo: data.branding.images.logo,
     favicon: data.branding.images.favicon,
     colors: {
       primary: data.branding.colors.primary || "#0066FF",
       secondary: data.branding.colors.accent || "#6366F1",
       accent: data.branding.colors.accent || "#10B981",
       background: data.branding.colors.background || "#FFFFFF",
       foreground: data.branding.colors.textPrimary || "#09090B",
     },
     typography: {
       fontFamilies: {
         primary: data.branding.typography.fontFamilies.primary,
         heading: data.branding.typography.fontFamilies.heading,
       },
       fontStacks: data.branding.typography.fontStacks,
       fontSizes: data.branding.typography.fontSizes || {},
     },
     spacing: data.branding.spacing || { baseUnit: 4, borderRadius: {} },
     meta: {
       source: "firecrawl",
       sourceUrl: data.metadata.url,
       createdAt: new Date().toISOString().split("T")[0],
       version: "1.0.0",
     },
   };
   ```

4. Save to `.styles/[company]/brand.json`:

   ```bash
   # Create company directory and save JSON
   mkdir -p .styles/antigravity
   # Write brandJson to .styles/antigravity/brand.json
   ```

5. **Confirm with user:**

   > "I've extracted branding from [url] and saved to `.styles/[company]/brand.json`.
   >
   > **Colors:** Primary: [color], Secondary: [color]
   > **Fonts:** [font family]
   > **Logo:** [logo URL]
   >
   > Does this look correct? (I can adjust if needed)"

6. **Wait for user confirmation before proceeding**

#### 3. ✅ THIRD: Check for @brand-identity Skill (Fallback)

**If user doesn't want Firecrawl, check for brand-identity skill:**

```bash
ls .windsurf/skills/brand-identity/SKILL.md 2>/dev/null
```

**If found**, invoke the brand-identity skill:

```
@brand-identity
```

Then read design tokens:

```bash
cat .windsurf/skills/brand-identity/resources/design-tokens.json
```

This provides:

- Colors (`colors.primary`, `colors.secondary`, etc.)
- Typography (`typography.font_family_headings`, etc.)
- UI tokens (`ui.border_radius_lg`, etc.)
- Chart palette (`charts.palette`)

#### 4. ✅ FOURTH: Ask User for Manual Input (Last Resort)

**If none of the above exist, ask user:**

> "I couldn't find branding information. Please provide:
>
> 1. **Company name** (e.g., Acme Corporation)
> 2. **Tagline** (optional)
> 3. **Primary color** (hex code, e.g., #0066FF)
> 4. **Secondary color** (optional, hex code)
> 5. **Logo path** (URL or local path, optional)
> 6. **Font family** (e.g., Inter, optional)"

**Then create `.styles/[company]/brand.json`:**

1. Use user-provided values
2. Fill in defaults from `.styles/default/brand.json` for missing fields
3. Save to `.styles/[company]/brand.json`
4. Confirm with user

### Brand Validation Checklist

Before proceeding to Step 3, verify:

- [ ] Brand JSON file exists OR will be created
- [ ] User has confirmed branding (if extracted via Firecrawl)
- [ ] BRAND constant is defined with all required fields
- [ ] Colors are valid hex codes
- [ ] Logo path is accessible (if provided)

## Step 3: Parse the Content Specification

Analyze the user's content and identify:

- Document title and subtitle
- Number of sections needed
- Content type per section:
  - **Hero**: Key value proposition with KPIs
  - **Data**: Charts, tables, metrics
  - **Comparison**: Side-by-side tables
  - **Timeline**: Roadmap or phases
  - **Terms**: Partnership terms, pricing
- Data for charts and KPIs (extract numbers, percentages, labels)

## Step 4: Invoke Proposal Generator Skill

Invoke the proposal document generator skill:
@generating-proposal-documents

Apply the design system from `references/design-system.md` and layout patterns from `references/layouts.md`.

## Step 5: Generate the Component

Using the skill's patterns, create the React component:

1. **File Structure**:

   ```
   src/app/[path]/page.tsx
   ```

2. **Required Imports**:

   ```tsx
   'use client'
   import { useState, useEffect } from 'react'
   import { [Charts] } from 'recharts'
   import { [Icons] } from 'lucide-react'
   ```

3. **Data Arrays**: Extract data into typed arrays at the top of the file

4. **Component Structure**: Follow the one-pager or multi-page template from `examples/`

5. **Print Styles**: Include the print CSS at the bottom

## Step 6: Verify Brand Usage and Preview

**Before showing to user, verify:**

1. BRAND constant is loaded from correct source
2. No hardcoded colors (all use BRAND.colors.\*)
3. Logo uses BRAND.logo path
4. Typography uses BRAND.typography values

**Then check for TypeScript errors:**

After generating the component:

1. Check for TypeScript errors:

   ```bash
   npx tsc --noEmit src/app/[path]/page.tsx
   ```

2. Suggest the user preview it:
   > "The proposal has been generated at `[path]`. You can preview it by:
   >
   > 1. Running `npm run dev`
   > 2. Opening http://localhost:3000/[route]
   > 3. To print/save as PDF: Cmd+P (Mac) or Ctrl+P (Windows)"

## Step 7: Iterate if Needed

If the user wants changes:

- **Layout changes**: Adjust grid columns, spacing
- **Color changes**: Update Tailwind classes or CSS variables
- **Data changes**: Modify the data arrays
- **Add sections**: Use patterns from the skill's references

## Example Usage

User provides:

```markdown
# Partnership Proposal: Acme Corp

## Hero Section

- Total value: $500,000
- Annual savings: 25%
- Implementation time: 3 months

## Pricing Table

| Year | Price | Discount |
| ---- | ----- | -------- |
| Y1   | $1.50 | 40% off  |
| Y2   | $1.75 | 30% off  |

## Key Benefits

- Benefit 1
- Benefit 2
```

Workflow generates:

- `/src/app/proposals/acme/page.tsx`
- With hero section, pricing table, and benefits list
- Print-ready at 8.5x11 inches

## Notes

- Always use `'use client'` directive for interactive charts
- Always include the mounted state check for Recharts
- Keep text sizes small for print (text-xs, text-[10px])
- Test print preview before finalizing
