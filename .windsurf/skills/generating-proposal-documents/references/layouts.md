# Layout Patterns

## One-Pager Layout (8.5x11 Print)

### Container Structure

```tsx
<div
  className="bg-white"
  style={{ width: "8.5in", height: "11in", padding: "0.35in", overflow: "hidden" }}
>
  <header>{/* Header with logo, title, date */}</header>
  <div className="grid grid-cols-2 gap-2">
    <div className="space-y-2">{/* Left column sections */}</div>
    <div className="space-y-2">{/* Right column sections */}</div>
  </div>
</div>
```

### Header Pattern

```tsx
<header className="flex items-center justify-between border-b-2 border-[#0066FF] pb-2 mb-3">
  <div className="flex items-center gap-3">
    <Image src="/logo.png" alt="Logo" width={80} height={40} />
    <div>
      <h1 className="text-xl font-bold text-gray-900">Document Title</h1>
      <p className="text-sm text-gray-600">Subtitle | Additional Info</p>
    </div>
  </div>
  <div className="text-right">
    <div className="text-xs text-gray-500">Label</div>
    <div className="text-sm font-semibold text-[#0066FF]">Value</div>
  </div>
</header>
```

## Multi-Page Scroll Layout

### Full-Height Sections

```tsx
<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
  <header className="bg-white border-b sticky top-0 z-50">{/* Navigation header */}</header>
  <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
    <section>{/* Section 1 */}</section>
    <section>{/* Section 2 */}</section>
    <section>{/* Section 3 */}</section>
  </main>
</div>
```

### Scroll-Snap Presentation

```tsx
<div className="snap-y snap-mandatory h-screen overflow-y-scroll">
  <section className="snap-start h-screen flex items-center justify-center">Page 1</section>
  <section className="snap-start h-screen flex items-center justify-center">Page 2</section>
</div>
```

## Grid Patterns

### 2-Column Equal

```tsx
<div className="grid grid-cols-2 gap-3">
  <div>{/* Left */}</div>
  <div>{/* Right */}</div>
</div>
```

### 2-Column Wide Left (2:1)

```tsx
<div className="grid grid-cols-[2fr_1fr] gap-3">
  <div>{/* Main content */}</div>
  <div>{/* Sidebar */}</div>
</div>
```

### 3-Column Cards

```tsx
<div className="grid grid-cols-3 gap-3">
  <div className="p-3 rounded-lg border">{/* Card 1 */}</div>
  <div className="p-3 rounded-lg border">{/* Card 2 */}</div>
  <div className="p-3 rounded-lg border">{/* Card 3 */}</div>
</div>
```

### KPI Row (4 items)

```tsx
<div className="grid grid-cols-4 gap-2">
  {kpis.map((kpi) => (
    <div key={kpi.label} className="bg-blue-50 rounded-lg p-2 text-center">
      <div className="text-lg font-bold text-blue-700">{kpi.value}</div>
      <div className="text-[10px] text-gray-600">{kpi.label}</div>
    </div>
  ))}
</div>
```

## Section Types

### Hero Section (Full-Width Gradient)

```tsx
<section className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] rounded-lg p-4 text-white">
  <h2 className="text-lg font-bold mb-2">Hero Title</h2>
  <p className="text-sm text-white/80">Supporting description</p>
  <div className="grid grid-cols-3 gap-3 mt-3">{/* KPI cards with bg-white/10 */}</div>
</section>
```

### Data Section (Border Card)

```tsx
<section className="border border-gray-200 rounded-lg p-3">
  <h2 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
    <IconComponent className="w-4 h-4 text-[#0066FF]" />
    Section Title
  </h2>
  <div>{/* Content */}</div>
</section>
```

### Highlight Section (Accent Background)

```tsx
<section className="bg-gradient-to-br from-[#6366F1]/10 to-[#8B5CF6]/10 rounded-lg p-3 border border-[#6366F1]/20">
  <h2 className="text-sm font-bold text-[#6366F1] mb-2">Highlight Title</h2>
  <div>{/* Content */}</div>
</section>
```

## Print CSS

### Required Print Styles

```tsx
<style
  dangerouslySetInnerHTML={{
    __html: `
  @media print {
    @page {
      size: 8.5in 11in;
      margin: 0;
    }
    html, body {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    .print-page {
      width: 8.5in !important;
      height: 11in !important;
      overflow: hidden !important;
      page-break-after: avoid !important;
    }
    .no-print {
      display: none !important;
    }
  }
`,
  }}
/>
```

### Page Break Classes

```css
.page-break-after {
  page-break-after: always;
}
.page-break-before {
  page-break-before: always;
}
.page-break-inside-avoid {
  page-break-inside: avoid;
}
```

## Page Composition Planning (CRITICAL)

Before writing any page, plan its visual composition. This is what separates professional proposals from amateur ones.

### Content Page Template (3–4 sections per page)

Every content page should follow this structure:

```
[Header — mb-5, pb-3, text-[7px]]
[SectionHeader — mb-5, text-[17px]]

[Section 1: Light or Accent]     ~35–40% of available height
  - 2-col grid (gap-3), cards with p-3/p-4

[Section 2: Dark (bg-gray-900)]  ~25–30% of available height
  - Featured data, timeline, or highlight grid

[Section 3: Light]               ~25–30% of available height
  - Table, matrix, or comparison data

[Footer — mt-auto, pt-4, text-[7px]]
```

### Section Type Reference

| Type               | Background                                                   | When to Use                          |
| ------------------ | ------------------------------------------------------------ | ------------------------------------ |
| **Light**          | `bg-white rounded-2xl border border-gray-200 p-4 shadow-sm`  | Data grids, tables, stat cards       |
| **Dark**           | `bg-gray-900 rounded-2xl p-4`                                | Featured data, timelines, hero stats |
| **Accent (Green)** | `bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100` | Benefits, value props                |
| **Accent (Blue)**  | `bg-blue-50/60 rounded-2xl p-4 border border-blue-100`       | Commitments, deliverables            |

### Spacing Between Sections

```
mb-3  — between all sections on content pages (NEVER mb-6+)
gap-3 — between grid columns
gap-2 — between grid items within a section
```

### Anti-Pattern: The Spreadsheet Page

```
❌ BAD: All white cards, same padding, no dark sections
   [White card] mb-6
   [White card] mb-6
   [White card] mb-6
   → Looks like a spreadsheet, wastes space, no hierarchy

✅ GOOD: Alternating light/dark with tight spacing
   [Light 2-col grid] mb-3
   [Dark featured section] mb-3
   [Light table] mb-3
   → Creates rhythm, maximizes density, guides the eye
```

---

## Cover Page Pattern (Production)

Cover pages should use `hideHeaderFooter={true}` and feature full-bleed design:

```tsx
<PageWrapper pageNumber={1} hideHeaderFooter>
  <div className="h-full flex flex-col justify-center relative -m-[0.75in] p-[0.75in]">
    {/* Background Image Layer */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <img
        src={BRAND.heroBg}
        alt="Background"
        className="absolute w-full h-full object-cover object-[center_70%] opacity-[0.08] mix-blend-multiply scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white/40 to-white" />
    </div>

    <div className="space-y-12 relative z-10">
      {/* Logo + Company Name */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-[1.5rem] bg-white border border-gray-100 shadow-2xl shadow-blue-600/10 flex items-center justify-center p-3">
          <img src={BRAND.logo} alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <div className="text-2xl font-black tracking-tighter text-gray-900 uppercase">
            {BRAND.name}
          </div>
          <div className="text-xs font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent uppercase tracking-widest">
            {BRAND.tagline}
          </div>
        </div>
      </div>

      {/* Gradient Divider */}
      <div className="h-[3px] w-24 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.3)]" />

      {/* Giant Title */}
      <div className="space-y-4">
        <div className="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">
          Proposal & Research
        </div>
        <div className="text-[5.5rem] font-black tracking-tighter leading-[0.85]">
          <div className="text-gray-900">Business Model</div>
          <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            Launch&nbsp;Plan
          </div>
        </div>
        <p className="text-xl text-gray-500 font-medium max-w-lg leading-relaxed pt-6">
          A multi-tier metered strategy built for the next generation of creator intelligence.
        </p>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-12 pt-16">
        <div className="space-y-3">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Strategic Context
          </div>
          <div className="text-lg font-bold text-gray-900 leading-tight">
            Internal Research
            <br />
            Document
          </div>
          <div className="text-sm text-gray-500 font-medium tracking-tight">
            Deployment: Q1 2026
          </div>
        </div>
        <div className="space-y-3">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Document Status
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <div className="text-lg font-bold text-gray-900 uppercase tracking-tighter">
              Approved for Launch
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Footer with Hash ID */}
    <div className="mt-auto flex justify-between items-end border-t border-gray-100 pt-12 relative z-10">
      <div className="space-y-1">
        <div className="text-[8px] font-black text-gray-300 uppercase tracking-widest">
          Internal Hash Identification
        </div>
        <div className="text-[10px] font-mono text-gray-400">CX-{randomHash}-2026</div>
      </div>
      <div className="text-right">
        <div className="text-sm font-black text-gray-900 uppercase tracking-tight italic">
          Jan 25, 2026
        </div>
        <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">
          Strategic Operations Unit
        </div>
      </div>
    </div>
  </div>
</PageWrapper>
```

## Control Header (Screen Only)

Sticky header with navigation and PDF download button:

```tsx
<header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 print:hidden shadow-sm">
  <div className="max-w-[8.5in] mx-auto px-8 py-3 flex items-center justify-between">
    <div className="flex items-center gap-6">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-all hover:-translate-x-1"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-semibold tracking-tight">Dashboard</span>
      </Link>
      <div className="h-4 w-[1px] bg-gray-200" />
      <div className="flex items-center gap-2">
        <img src={BRAND.logo} alt="Logo" className="w-5 h-5 object-contain" />
        <span className="text-sm font-bold tracking-tight">{BRAND.name} Business Model Plan</span>
      </div>
    </div>
    <button
      onClick={handlePdfDownload}
      className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-900/20 active:scale-95"
    >
      <Printer className="w-4 h-4" />
      Download PDF Report
    </button>
  </div>
</header>
```

## PDF Download Handler (API Route)

```tsx
const handlePdfDownload = async () => {
  try {
    const response = await fetch("/api/internal/[path]/pdf");
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
};
```

## Persona Cards Grid (Production)

```tsx
<div className="grid grid-cols-2 gap-3">
  {personas.map((persona) => (
    <div
      key={persona.name}
      className="p-4 border border-gray-100 bg-white rounded-[1.5rem] shadow-sm space-y-3 hover:border-pink-200 transition-all group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110"
            style={{ backgroundColor: persona.color }}
          >
            <persona.icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black text-gray-900 text-sm tracking-tight">{persona.name}</h4>
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              {persona.profile}
            </div>
          </div>
        </div>
        <span className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-[8px] font-black text-gray-500 uppercase tracking-widest group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-pink-500 group-hover:text-white group-hover:border-transparent transition-all">
          {persona.plan}
        </span>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-start gap-2">
          <div className="text-[8px] font-black text-gray-300 uppercase w-16 pt-1">Core Need</div>
          <div className="text-[11px] text-gray-600 font-semibold leading-tight">
            {persona.need}
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="text-[8px] font-black text-gray-300 uppercase w-16 pt-1">Journey</div>
          <div className="text-[11px] font-black leading-tight bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            {persona.journey}
          </div>
        </div>
      </div>
    </div>
  ))}
</div>
```

## Dark Funnel Section (Production)

```tsx
<div className="relative p-6 bg-gray-900 rounded-[2rem] overflow-hidden">
  <div className="absolute inset-0 bg-orange-500 opacity-[0.03] pattern-grid" />
  <div className="relative z-10">
    <h3 className="text-xs font-black text-orange-400 uppercase tracking-[0.2em] mb-6 text-center">
      Lifecycle Funnel Architecture
    </h3>
    <div className="grid grid-cols-5 gap-4">
      {steps.map((step, idx) => (
        <div key={step.title} className="space-y-3 text-center group">
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-500 group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-pink-500 group-hover:text-white group-hover:scale-110 transition-all border border-gray-700">
              <step.icon className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[7px] font-black text-orange-400 uppercase tracking-widest truncate">
              {step.label}
            </div>
            <div className="h-0.5 bg-gray-800 rounded-full overflow-hidden w-full max-w-[60px] mx-auto">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]"
                style={{ width: `${(idx + 1) * 20}%` }}
              />
            </div>
            <p className="text-[8px] font-bold text-gray-400 leading-tight uppercase tracking-tighter pt-1">
              {step.text}
            </p>
            <div className="pt-2 space-y-0.5">
              <div className="text-[7px] font-black text-white">{step.metric}</div>
              <div className="text-[6px] text-emerald-400 font-bold">{step.conversion}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
```

## Metrics Breakdown Cards

```tsx
<div className="grid grid-cols-2 gap-4">
  {metrics.map((metric) => (
    <div key={metric.label} className="space-y-2">
      <div
        className="flex items-center justify-between p-3 rounded-xl border"
        style={{ backgroundColor: `${metric.color}10`, borderColor: `${metric.color}30` }}
      >
        <div>
          <div className="text-[8px] font-black text-gray-400 uppercase">{metric.label}</div>
          <div className="text-base font-black" style={{ color: metric.color }}>
            {metric.value}
          </div>
        </div>
        <div className="text-[8px] text-gray-500">{metric.timeframe}</div>
      </div>
      <div className="text-[8px] text-gray-600 leading-relaxed pl-2">
        <strong>Trigger:</strong> {metric.trigger}
      </div>
    </div>
  ))}
</div>
```

## Feature Highlight Boxes

```tsx
<div className="grid grid-cols-3 gap-4">
  {features.map((item) => (
    <div key={item.title} className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm">
      <div className="w-6 h-1 rounded-full mb-3" style={{ backgroundColor: item.color }} />
      <div className="text-[9px] font-black text-gray-900 uppercase tracking-widest">
        {item.title}
      </div>
      <p className="text-[9px] text-gray-500 mt-1 leading-relaxed font-medium">
        {item.description}
      </p>
    </div>
  ))}
</div>
```

---

## Pitch Deck / Presentation Patterns (Screen-Based)

> **Note**: These patterns are for screen presentations with animations. For print documents, see patterns above.

### Slide Container (16:9 Landscape)

```tsx
<div
  className="relative bg-white rounded-2xl shadow-2xl overflow-hidden"
  style={{
    width: "1280px",
    height: "720px",
    maxWidth: "100%",
    aspectRatio: "16/9",
  }}
>
  {/* Slide content */}
</div>
```

### Framer Motion Slide Transitions

```tsx
import { motion, AnimatePresence } from 'framer-motion'

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
}

// Usage
<AnimatePresence mode="wait" custom={direction}>
  <motion.div
    key={currentSlide}
    custom={direction}
    variants={slideVariants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
  >
    {/* Slide content */}
  </motion.div>
</AnimatePresence>
```

### Keyboard Navigation Hook

```tsx
const handleKeyDown = useCallback((e: KeyboardEvent) => {
  if (e.key === "ArrowRight" || e.key === " ") {
    e.preventDefault();
    setDirection(1);
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    setDirection(-1);
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  } else if (e.key === "f" || e.key === "F") {
    toggleFullscreen();
  } else if (e.key === "Escape") {
    setIsPresenting(false);
  }
}, []);

useEffect(() => {
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [handleKeyDown]);
```

### Fullscreen Toggle

```tsx
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    setIsPresenting(true);
  } else {
    document.exitFullscreen();
    setIsPresenting(false);
  }
};
```

### Presentation Controls Header

```tsx
{
  !isPresenting && (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-white font-semibold">Presentation Title</h1>
        <span className="text-gray-400 text-sm">
          Slide {currentSlide + 1} of {slides.length}
        </span>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === currentSlide ? "bg-blue-500 scale-125" : "bg-gray-600 hover:bg-gray-500"
            }`}
          />
        ))}
      </div>

      <button
        onClick={toggleFullscreen}
        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
      >
        Present (F)
      </button>
    </header>
  );
}
```

### Slide Navigation Arrows

```tsx
<button
  onClick={prevSlide}
  disabled={currentSlide === 0}
  className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/10 hover:bg-black/20 transition-all ${
    currentSlide === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-70 hover:opacity-100'
  }`}
>
  <ArrowLeft className="w-6 h-6 text-gray-700" />
</button>

<button
  onClick={nextSlide}
  disabled={currentSlide === slides.length - 1}
  className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/10 hover:bg-black/20 transition-all ${
    currentSlide === slides.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-70 hover:opacity-100'
  }`}
>
  <ArrowRight className="w-6 h-6 text-gray-700" />
</button>
```

### Title Slide (Gradient Background)

```tsx
<div className="h-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex flex-col items-center justify-center text-white p-12">
  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
    <Rocket className="w-10 h-10" />
  </div>
  <h1 className="text-6xl font-bold mb-4 text-center">Company Name</h1>
  <p className="text-2xl text-blue-100 mb-8 text-center max-w-2xl">
    The one-liner that explains what you do
  </p>
  <div className="flex items-center gap-2 text-blue-200">
    <span>Seed Round</span>
    <ChevronRight className="w-4 h-4" />
    <span>$3M Target</span>
  </div>
</div>
```

### Content Slide Layout

```tsx
<div className="h-full p-12 flex flex-col">
  {/* Header with Icon */}
  <div className="flex items-center gap-3 mb-8">
    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
      <Icon className="w-5 h-5 text-blue-600" />
    </div>
    <h2 className="text-3xl font-bold text-gray-900">Slide Title</h2>
  </div>

  {/* Content Area - flex-1 to fill remaining space */}
  <div className="flex-1 grid grid-cols-2 gap-8">
    {/* Left column */}
    {/* Right column */}
  </div>
</div>
```

### Keyboard Hints Footer

```tsx
{
  !isPresenting && (
    <footer className="bg-gray-800 border-t border-gray-700 px-6 py-2 text-center text-gray-500 text-xs">
      <span className="mr-4">← → Navigate</span>
      <span className="mr-4">Space Next</span>
      <span className="mr-4">F Fullscreen</span>
      <span>ESC Exit</span>
    </footer>
  );
}
```
