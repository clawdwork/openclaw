---
name: generating-proposal-documents
description: >
  Generates professional, print-ready proposal documents as React components
  using static HTML/CSS visualizations, Lucide-react icons, and Tailwind CSS.
  Optimized for 8.5x11 PDF distribution. Use when the user mentions proposal,
  one-pager, presentation, document generation, print-ready page, or multi-page report.
---

# Proposal Document Generator

Generate professional, print-ready proposal documents from markdown specifications.

## When to Use

Use this skill when the user:

- Requests a **proposal document** or **business proposal**
- Needs a **one-pager** or **executive summary**
- Wants a **multi-page report** or **investor deck**
- Asks for **print-ready** or **PDF-optimized** documents
- Mentions **8.5x11 layout** or **presentation documents**

## Brand Integration (CRITICAL)

**Before generating any document, check for branding in this priority order:**

### Priority 1: `.styles/[company]/brand.json` (PREFERRED)

Check if brand JSON exists:

```bash
ls .styles/[company-name]/brand.json 2>/dev/null
```

If found, load the brand data:

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

### Priority 2: Create Brand JSON via Firecrawl MCP (If No .styles/ File)

If `.styles/[company]/brand.json` does NOT exist, ask user:

> "I don't see a brand JSON for [company]. Would you like me to:
>
> 1. **Extract branding from a website** (requires Firecrawl MCP)
> 2. **Use default template** (.styles/default/brand.json)
> 3. **Provide branding manually** (I'll create the JSON for you)"

**If user chooses Option 1 (Firecrawl):**

```
1. Ask user for website URL (e.g., "antigravity.google")
2. Use Firecrawl MCP with format=branding:
   mcp9_firecrawl_scrape(url, formats=["branding"])
3. Transform Firecrawl output to .styles/ schema:
   - data.branding.colors → brand.json colors
   - data.branding.typography → brand.json typography
   - data.branding.images.logo → brand.json logo
4. Save to .styles/[company]/brand.json
5. Confirm with user before proceeding
```

### Priority 3: @brand-identity Skill (Fallback)

If no `.styles/` file and user doesn't want Firecrawl, invoke:

```
@brand-identity
```

Read these files for design context:

- `@brand-identity/resources/design-tokens.json` → Colors, typography, UI tokens
- `@brand-identity/resources/tech-stack.md` → Implementation rules
- `@brand-identity/resources/voice-tone.md` → Copywriting guidelines

### Priority 4: Ask User (Last Resort)

If none of the above exist, ask user to provide:

1. Primary color (hex)
2. Secondary color (hex)
3. Company name
4. Tagline
5. Logo path (optional)

Then create `.styles/[company]/brand.json` for future use.

---

**Use brand tokens instead of hardcoded values:**

```tsx
// ✅ Correct: Use brand constants from JSON
const BRAND = brandData; // Loaded from .styles/company/brand.json
className = "bg-blue-600"; // Or use BRAND.colors.primary

// ❌ Wrong: Hardcoded colors
className = "bg-[#0066FF] text-white";
```

## Tech Stack (Mandatory)

- **Framework**: Next.js with React + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: **Static HTML/CSS (preferred for print)** or Recharts (web presentations only)
- **Icons**: Lucide-react
- **Components**: shadcn/ui patterns

> **Note**: Tech stack rules are also defined in `@brand-identity/resources/tech-stack.md` — that file takes precedence if it exists.

---

## Print Document Philosophy (CRITICAL)

### Static HTML/CSS Over Recharts

**For 8.5x11 print documents meant for PDF distribution, always prefer static HTML/CSS visualizations over Recharts.**

| Aspect              | Static HTML/CSS                       | Recharts                         |
| ------------------- | ------------------------------------- | -------------------------------- |
| **Use When**        | Print documents, PDFs, investor decks | Interactive web dashboards       |
| **PDF Reliability** | ✅ 100% predictable                   | ⚠️ SVG can render inconsistently |
| **Bundle Size**     | ✅ Zero added                         | ❌ +500KB                        |
| **Hydration**       | ✅ No client mounting needed          | ❌ Requires `useState` checks    |
| **Maintenance**     | ✅ No library updates                 | ⚠️ Breaking changes possible     |
| **Complexity**      | ✅ Simple CSS                         | ⚠️ ResponsiveContainer, tooltips |

### Why This Matters

1. **PDF generators vary**: Puppeteer, browser print, and PDF services all render SVG differently
2. **Animations are useless**: Print documents are static—chart animations add no value
3. **Simpler is better**: A div with a height and background color is more reliable than SVG paths
4. **Faster development**: No mounting checks, no library quirks, no debugging chart issues

### When to Use Recharts

Only use Recharts when:

- Building an **interactive web presentation** with tooltips and hover states
- The document will **never be exported to PDF**
- Real-time data updates are needed

### Static Chart Patterns

See `references/design-system.md` for static chart implementations:

- Bar charts using divs with calculated heights
- Progress bars with gradient fills
- Pie chart alternatives using stacked bars or legend lists
- KPI cards with visual indicators

## Page Types

### 1. One-Pager (8.5x11 Print)

Fixed dimensions, print-optimized for PDF export.

- Reference: `references/one-pager-layout.md`
- Example: `examples/one-pager.tsx`
- **Charts**: Static HTML/CSS only
- **Output**: PDF

### 2. Multi-Page Print Document

Page-based layout (8.5x11) with sequential numbering and page breaks.

- Reference: `examples/multi-page.tsx`
- Pattern: PageWrapper component with consistent headers/footers
- Use case: Business proposals, research documents, investor decks
- **Charts**: Static HTML/CSS only
- **Output**: PDF

### 3. Pitch Deck / Presentation (Screen-Based)

Landscape slides (16:9 or 11x8.5) for screen presentations.

- Reference: `examples/pitch-deck.tsx`
- Pattern: Scroll-snap slides, keyboard navigation, presentation mode
- Use case: Investor pitches, team presentations, demos, educational content
- **Charts**: Recharts allowed (interactive)
- **Animations**: Framer Motion slide transitions
- **Output**: Web / Screen

### Document Type Decision Tree

| Document Type         | Orientation     | Charts          | Animations       | Output     | Example          |
| --------------------- | --------------- | --------------- | ---------------- | ---------- | ---------------- |
| **One-Pager**         | 8.5x11 portrait | Static HTML/CSS | ❌ None          | PDF        | `one-pager.tsx`  |
| **Multi-Page Report** | 8.5x11 portrait | Static HTML/CSS | ❌ None          | PDF        | `multi-page.tsx` |
| **Pitch Deck**        | 16:9 landscape  | Recharts        | ✅ Framer Motion | Web/Screen | `pitch-deck.tsx` |

### 4. Data-Heavy Page

Chart-focused layouts with KPI cards.

- Reference: `references/chart-patterns.md`

## Instructions

### Step 1: Parse the Specification

Read the user's content specification and identify:

- Document title and metadata
- Number of pages/sections needed
- Content type per section (hero, data, comparison, timeline)
- Data for charts and KPIs

### Step 2: Load Brand Context

**CRITICAL: Always load brand before generating code.**

Follow the priority order from "Brand Integration" section above:

1. Check `.styles/[company]/brand.json`
2. Offer Firecrawl extraction if available
3. Check `@brand-identity` skill
4. Ask user for manual input

### Step 3: Select Layout Pattern

Match content type to layout:

| Content Type      | Layout       | Grid                |
| ----------------- | ------------ | ------------------- |
| Executive summary | Hero + 2-col | `grid-cols-2 gap-4` |
| Financials/Charts | Chart-heavy  | `grid-cols-2 gap-2` |
| Comparison tables | 3-col cards  | `grid-cols-3 gap-3` |
| Timeline/Roadmap  | Full-width   | `col-span-full`     |

For multi-page documents, use PageWrapper pattern:

```tsx
<PageWrapper pageNumber={1} totalPages={5}>
  {/* Page content */}
</PageWrapper>
```

### Step 4: Apply Design System

Use loaded brand data for:

- Color palette (BRAND.colors.primary, secondary, accent)
- Typography (BRAND.typography.fontFamilies)
- Spacing (BRAND.spacing.borderRadius)
- Logo (BRAND.logo)

### Step 5: Generate Component

Create a React component following patterns in `examples/`:

1. Use `'use client'` directive (required for Next.js)
2. Use **static HTML/CSS** for all visualizations (no Recharts for print docs)
3. Apply print CSS for proper page breaks
4. Use fixed dimensions (8.5in × 11in) for print reliability

### Step 6: Add Print Styles

Include print-specific CSS:

```tsx
<style
  dangerouslySetInnerHTML={{
    __html: `
  @media print {
    @page { size: 8.5in 11in; margin: 0; }
    html, body {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
`,
  }}
/>
```

## Component Patterns

### PageWrapper (Multi-Page Documents)

```tsx
const PageWrapper = ({
  children,
  pageNumber,
  totalPages = 16,
  hideHeaderFooter = false,
}: {
  children: React.ReactNode;
  pageNumber: number;
  totalPages?: number;
  hideHeaderFooter?: boolean;
}) => (
  <div className="report-page bg-white relative overflow-hidden">
    {/* Background accents */}
    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-20 -mr-32 -mt-32" />

    <div className="flex flex-col h-full relative z-10">
      {!hideHeaderFooter && (
        <div className="mb-6 flex justify-between items-center text-[8px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <img src={BRAND.logo} className="w-6 h-6" />
            {BRAND.name} | {BRAND.tagline}
          </div>
          <div>Confidential v1.0</div>
        </div>
      )}

      {children}

      {!hideHeaderFooter && (
        <div className="mt-auto pt-6 flex justify-between items-center text-[8px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-100">
          <div>© 2025 {BRAND.name}</div>
          <div className="bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            Page {pageNumber} of {totalPages}
          </div>
        </div>
      )}
    </div>
  </div>
);
```

### SectionHeader (Branded Headers)

```tsx
const SectionHeader = ({
  title,
  icon: Icon,
  color = BRAND.colors.primary,
}: {
  title: string;
  icon?: any;
  color?: string;
}) => (
  <div className="flex items-center gap-3 mb-6">
    {Icon && (
      <div
        className="p-2.5 rounded-2xl shadow-sm"
        style={{ backgroundColor: `${color}15`, boxShadow: `0 4px 12px ${color}20` }}
      >
        <Icon className="w-5 h-5" style={{ color: color }} />
      </div>
    )}
    <h2 className="text-xl font-bold tracking-tight text-gray-900">{title}</h2>
  </div>
);
```

### KPI Card

```tsx
<div className="bg-blue-50 rounded-lg p-3 text-center">
  <div className="text-2xl font-bold text-blue-700">$1.2M</div>
  <div className="text-xs text-gray-600">Annual Revenue</div>
</div>
```

### Hero Section (Gradient)

```tsx
<section className="bg-gradient-to-br from-[#0066FF] to-[#00D4FF] rounded-lg p-4 text-white">
  <h2 className="text-lg font-bold">Section Title</h2>
  <div className="grid grid-cols-3 gap-3">{/* KPI cards */}</div>
</section>
```

### Data Table

```tsx
<table className="w-full text-sm">
  <thead>
    <tr className="border-b border-gray-200">
      <th className="text-left py-2 font-semibold text-gray-600">Column</th>
    </tr>
  </thead>
  <tbody>
    {data.map((row) => (
      <tr key={row.id} className="border-b border-gray-100">
        <td className="py-2">{row.value}</td>
      </tr>
    ))}
  </tbody>
</table>
```

### Static Bar Chart (Preferred for Print)

```tsx
<div className="h-48 border border-gray-100 rounded-[2rem] p-6 bg-white">
  <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">
    Revenue by Month
  </h4>
  <div className="flex items-end justify-around h-32 gap-3 px-2">
    {data.map((item) => {
      const height = (item.value / maxValue) * 100;
      return (
        <div key={item.name} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full max-w-[40px] rounded-t"
            style={{ height: `${height}%`, backgroundColor: item.color || "#3b82f6" }}
          />
          <span className="text-[9px] font-black text-gray-500">{item.name}</span>
          <span className="text-[10px] font-black text-gray-700">
            ${item.value.toLocaleString()}
          </span>
        </div>
      );
    })}
  </div>
</div>
```

> **Note**: For more static chart patterns, see `references/design-system.md`

## Print Dimensions

### One-Pager (8.5x11)

```tsx
<div style={{
  width: '8.5in',
  height: '11in',
  padding: '0.35in',
  overflow: 'hidden'
}}>
```

### Multi-Page (Print-Optimized)

```tsx
<div className="report-container">
  <PageWrapper pageNumber={1} totalPages={5}>
    {/* Page 1 content */}
  </PageWrapper>

  <PageWrapper pageNumber={2} totalPages={5}>
    {/* Page 2 content */}
  </PageWrapper>
</div>;

{
  /* Print CSS */
}
<style
  dangerouslySetInnerHTML={{
    __html: `
  @media print {
    .report-page {
      page-break-after: always;
      page-break-inside: avoid;
      width: 8.5in;
      height: 11in;
      padding: 0.5in;
    }
  }
`,
  }}
/>;
```

## Constraints

- DO NOT use Bootstrap or styled-components
- DO NOT hardcode colors - load from `.styles/[company]/brand.json`
- DO NOT use Recharts for print documents - use static HTML/CSS visualizations
- DO NOT generate documents without checking for brand JSON first
- ALWAYS include print CSS for documents
- ALWAYS use TypeScript
- ALWAYS use static HTML/CSS for charts in print documents
- ALWAYS use Lucide-react for icons (not other icon libraries)
- ALWAYS offer Firecrawl brand extraction if `.styles/` doesn't exist

## Error Handling

### If brand.json doesn't exist:

1. Ask user if they want to extract from website (Firecrawl)
2. Offer to use `.styles/default/brand.json` as fallback
3. Offer to create brand.json from manual input
4. Never proceed without brand configuration

### If chart data is missing:

1. Use placeholder data with clear `[PLACEHOLDER]` labels
2. Add comments indicating where real data should go
3. Inform user which data fields need to be populated

### If layout doesn't fit on page:

1. Reduce font sizes systematically
2. Consolidate sections where possible
3. Split into multiple pages if necessary
4. Never allow content overflow

## Resources

### Brand Configuration (Check First)

- **Brand JSONs**: `.styles/[company]/brand.json` — Primary source for colors, logo, typography
- **Brand README**: `.styles/README.md` — Schema documentation for brand.json
- **Default Template**: `.styles/default/brand.json` — Fallback if no company brand exists

### Reference Templates (Adapt Per Project)

- **Design System**: `references/design-system.md` — Template for typography, colors, static charts. **Copy and customize per project.**
- **Layout Patterns**: `references/layouts.md` — Cover pages, headers, grids, dark sections
- **Chart Patterns**: `references/chart-patterns.md` — Static chart implementations

### Working Examples

- **One-Pager**: `examples/one-pager.tsx` — Complete 8.5x11 single-page document (static charts)
- **Multi-Page**: `examples/multi-page.tsx` — PageWrapper pattern, cover page, multiple sections (static charts)
- **Pitch Deck**: `examples/pitch-deck.tsx` — 16:9 slides, Framer Motion animations, Recharts, keyboard navigation

> **Note**: Reference files are **templates to adapt**, not copy-paste solutions. Customize colors, content, and layout based on brand.json and user requirements.

## Firecrawl Integration

If user wants to extract branding from a website:

1. Ask for website URL
2. Call Firecrawl MCP with `formats=["branding"]`
3. Transform output:
   ```typescript
   const brandJson = {
     name: metadata.ogTitle || metadata.title,
     tagline: metadata.ogDescription,
     website: metadata.url,
     logo: branding.images.logo,
     favicon: branding.images.favicon,
     colors: {
       primary: branding.colors.primary,
       accent: branding.colors.accent,
       background: branding.colors.background,
       foreground: branding.colors.textPrimary,
     },
     typography: branding.typography,
     meta: {
       source: "firecrawl",
       createdAt: new Date().toISOString().split("T")[0],
     },
   };
   ```
4. Save to `.styles/[company]/brand.json`
5. Confirm with user before using

---

## Production Patterns (Advanced)

### Recharts Fallback Pattern (Legacy/Web Only)

> **Note**: For print documents, use static HTML/CSS charts instead (see above). Only use this pattern for **web presentations** or **legacy code** that requires Recharts.

If you must use Recharts, always include static fallback:

```tsx
{
  /* Screen only - Recharts */
}
<div className="h-48 print:hidden">
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
      <XAxis
        dataKey="name"
        axisLine={false}
        tickLine={false}
        tick={{ fontSize: 9, fontWeight: 900, fill: "#94a3b8" }}
      />
      <YAxis
        axisLine={false}
        tickLine={false}
        tick={{ fontSize: 9, fontWeight: 900, fill: "#94a3b8" }}
      />
      <Bar dataKey="value" fill={BRAND.colors.orange} radius={[4, 4, 0, 0]} barSize={30} />
    </BarChart>
  </ResponsiveContainer>
</div>;

{
  /* Print fallback - Static bars */
}
<div className="hidden print:block h-48 border border-gray-100 rounded-[2rem] p-4 bg-white">
  <div className="flex items-end justify-around h-32 gap-4 px-4">
    {data.map((item) => (
      <div key={item.name} className="flex flex-col items-center gap-1">
        <div
          className="w-8 rounded-t"
          style={{ height: `${item.heightPx}px`, backgroundColor: item.color }}
        />
        <span className="text-[9px] font-black text-gray-500">{item.name}</span>
        <span className="text-[10px] font-black text-gray-700">{item.label}</span>
      </div>
    ))}
  </div>
</div>;
```

### PDF Export via API (Recommended over window.print())

For reliable PDF generation, use server-side rendering with Puppeteer:

```tsx
// Component: Download button
<button
  onClick={async () => {
    try {
      const response = await fetch("/api/internal/[...]/pdf");
      if (!response.ok) throw new Error("PDF generation failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Document-Name.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  }}
  className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl"
>
  <Printer className="w-4 h-4" />
  Download PDF Report
</button>
```

```typescript
// API Route: /api/[...]/pdf/route.ts
import puppeteer from "puppeteer";

export async function GET() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(pageUrl, { waitUntil: "networkidle0" });
  const pdf = await page.pdf({
    format: "Letter",
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  await browser.close();
  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Document.pdf"',
    },
  });
}
```

### Extended BRAND Object (Production)

```tsx
const BRAND = {
  name: "Celavii",
  tagline: "Creator Intelligence Platform",
  logo: "https://...supabase.co/.../logo.png", // Full URL, not relative path
  heroBg: "https://...supabase.co/.../hero-background.webp", // Background image for cover
  colors: {
    primary: "#0066FF",
    secondary: "#6366F1",
    accent: "#10B981",
    destructive: "#EF4444",
    dark: "#1E293B",
    muted: "#F4F4F5",
    orange: "#F97316",
    pink: "#EC4899",
    purple: "#A855F7",
  },
  gradients: {
    primary: "linear-gradient(135deg, #0066FF 0%, #00D4FF 100%)",
    hero: "linear-gradient(135deg, #F97316 0%, #EC4899 50%, #A855F7 100%)",
    dark: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
  },
};
```

### Extended Typography Scale (Production)

| Use Case         | Classes                                                         |
| ---------------- | --------------------------------------------------------------- |
| Giant hero title | `text-[5.5rem] font-black tracking-tighter leading-[0.85]`      |
| Section header   | `text-xl font-bold tracking-tight`                              |
| Subsection       | `text-sm font-black uppercase tracking-widest`                  |
| Body text        | `text-xs text-gray-600 font-medium leading-relaxed`             |
| Tiny labels      | `text-[8px] font-black text-gray-400 uppercase tracking-widest` |
| Micro text       | `text-[7px] font-bold`                                          |
| Giant stat       | `text-3xl font-black`                                           |

### Cover Page (hideHeaderFooter=true)

Cover pages should NOT have headers/footers and should use full-bleed design:

```tsx
<PageWrapper pageNumber={1} hideHeaderFooter>
  <div className="h-full flex flex-col justify-center relative -m-[0.75in] p-[0.75in]">
    {/* Background Image Layer */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <img
        src={BRAND.heroBg}
        alt="Background"
        className="absolute w-full h-full object-cover opacity-[0.08] mix-blend-multiply scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white/40 to-white" />
    </div>

    {/* Content with relative z-10 */}
    <div className="space-y-12 relative z-10">{/* Logo, Title, Metadata */}</div>
  </div>
</PageWrapper>
```

### Control Header Pattern (Screen Only)

```tsx
<header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 print:hidden shadow-sm">
  <div className="max-w-[8.5in] mx-auto px-8 py-3 flex items-center justify-between">
    <div className="flex items-center gap-6">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-all hover:-translate-x-1"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-semibold">Dashboard</span>
      </Link>
      <div className="h-4 w-[1px] bg-gray-200" />
      <span className="text-sm font-bold">{BRAND.name} Document</span>
    </div>
    <button onClick={handlePdfDownload}>Download PDF</button>
  </div>
</header>
```

### Interactive Hover States

```tsx
// Group hover with child animation
<div className="group hover:shadow-md hover:border-pink-200 transition-all">
  <div className="transition-transform group-hover:scale-110">
    <Icon />
  </div>
  <span className="group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-pink-500 group-hover:text-white transition-all">
    Label
  </span>
</div>

// Animated status indicator
<div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
```

### ReactMarkdown for Rich Content

```tsx
import ReactMarkdown from "react-markdown";

<div className="prose prose-sm max-w-none text-gray-600 leading-relaxed font-medium">
  <ReactMarkdown>
    The creator economy is growing fast—17% per year, heading to **$70B by 2030**. But the market is
    split: cheap directory tools on one side, expensive enterprise software ($25K+/year) on the
    other. **We fill the gap**.
  </ReactMarkdown>
</div>;
```

### Data Explainer Box (Production)

```tsx
<div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 p-6 rounded-[2rem]">
  <div className="flex items-start gap-5">
    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 flex-shrink-0">
      <Database className="w-5 h-5" />
    </div>
    <div className="flex-1 space-y-3">
      <div>
        <h3 className="text-sm font-black text-gray-900 mb-1">What is Data Refinement?</h3>
        <p className="text-[10px] text-gray-600 leading-relaxed font-medium">
          We transform raw Instagram data into actionable intelligence using AI.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">{/* Step cards with progression */}</div>
    </div>
  </div>
</div>
```

### Main Container Pattern

```tsx
<main className="mx-auto max-w-[8.5in] p-0 md:p-8 space-y-0 md:space-y-8 print:space-y-0">
  <PageWrapper pageNumber={1} hideHeaderFooter>
    {/* Cover */}
  </PageWrapper>

  <PageWrapper pageNumber={2}>{/* Content pages */}</PageWrapper>

  {/* ... more pages ... */}
</main>
```

### Print Styles (Production)

```tsx
<style
  dangerouslySetInnerHTML={{
    __html: `
  @media print {
    @page {
      size: letter;
      margin: 0;
    }
    
    html, body {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    .print\\:hidden {
      display: none !important;
    }
    
    .report-page {
      page-break-after: always;
      page-break-inside: avoid;
      width: 8.5in;
      height: 11in;
      padding: 0.5in;
      margin: 0;
      box-sizing: border-box;
    }
    
    .report-page:last-child {
      page-break-after: auto;
    }
  }
  
  @media screen {
    .report-container {
      max-width: 8.5in;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    
    .report-page {
      width: 8.5in;
      min-height: 11in;
      padding: 0.5in;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border-radius: 0.5rem;
    }
  }
`,
  }}
/>
```
