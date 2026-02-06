# Design System

## Color Palette

### Primary Colors

```css
--primary: #0066ff;
--primary-hover: #0052cc;
--primary-light: #e6f0ff;
--primary-foreground: #ffffff;
```

### Secondary Colors

```css
--secondary: #6366f1;
--secondary-light: #eef2ff;
```

### Semantic Colors

```css
--success: #10b981;
--success-light: #d1fae5;
--warning: #f59e0b;
--warning-light: #fef3c7;
--destructive: #ef4444;
--destructive-light: #fee2e2;
```

### Neutral Colors

```css
--background: #ffffff;
--foreground: #09090b;
--muted: #f4f4f5;
--muted-foreground: #71717a;
--border: #e4e4e7;
```

## Tailwind Mappings

| Token       | Tailwind Class                     |
| ----------- | ---------------------------------- |
| Primary     | `bg-[#0066FF]` or `bg-blue-600`    |
| Secondary   | `bg-[#6366F1]` or `bg-indigo-500`  |
| Success     | `bg-green-500` or `text-green-600` |
| Warning     | `bg-amber-500` or `text-amber-600` |
| Destructive | `bg-red-500` or `text-red-600`     |

## Typography

### Font Sizes (Print-Optimized)

```
Hero Title:     text-xl (20px)
Section Title:  text-sm font-bold (14px)
Body Text:      text-xs (12px)
Small Text:     text-[10px]
Tiny Text:      text-[9px]
```

### Font Weights

```
Bold:    font-bold (700)
Semibold: font-semibold (600)
Medium:  font-medium (500)
Normal:  font-normal (400)
```

## Spacing

### Print Document Spacing

```
Page Padding:   0.35in (padding: '0.35in')
Section Gap:    gap-2 or gap-3
Card Padding:   p-2 or p-3
Inner Gap:      gap-1 or gap-1.5
```

## Border Radius

```
Large:   rounded-lg (0.5rem)
Medium:  rounded (0.25rem)
Small:   rounded-sm (0.125rem)
```

## Shadows

```
Card:    shadow-sm
Elevated: shadow-md
Modal:   shadow-lg
```

## Gradients

### Primary Gradient

```tsx
className = "bg-gradient-to-br from-[#0066FF] to-[#00D4FF]";
```

### Secondary Gradient

```tsx
className = "bg-gradient-to-br from-[#6366F1]/10 to-[#8B5CF6]/10";
```

## Component Styles

### Cards

```tsx
// Standard Card
className = "border border-gray-200 rounded-lg p-3";

// Highlight Card
className = "bg-gradient-to-br from-[#0066FF] to-[#00D4FF] rounded-lg p-3 text-white";

// Accent Card
className = "bg-green-50 rounded-lg p-3 border border-green-200";
```

### Tables

```tsx
// Table Header
className = "border-b border-gray-200 text-left py-1 font-semibold text-gray-600";

// Table Row
className = "border-b border-gray-100 py-1.5";

// Highlight Row
className = "bg-green-50";
```

### KPI Cards

```tsx
// Colored KPI
className="bg-blue-50 rounded-lg p-2 text-center"
// With:
<div className="text-lg font-bold text-blue-700">Value</div>
<div className="text-[10px] text-gray-600">Label</div>
```

## Advanced Typography (Production Patterns)

### Font Weights

```
font-black (900)    - Hero titles, section headers, emphasis
font-bold (700)     - Subheaders, card titles
font-semibold (600) - Labels, button text
font-medium (500)   - Body text, descriptions
```

### Letter Spacing (Tracking)

```
tracking-tighter    - Large headlines (text-4xl+)
tracking-tight      - Section titles
tracking-widest     - Tiny uppercase labels (8px)
tracking-[0.2em]    - Stylized category headers
tracking-[0.3em]    - Ultra-wide accent text
```

### Gradient Text Pattern

```tsx
// Hero gradient (Orange → Pink → Purple)
className =
  "bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent";

// Primary gradient (Blue → Cyan)
className = "bg-gradient-to-r from-[#0066FF] to-[#00D4FF] bg-clip-text text-transparent";
```

### Giant Hero Title (Production)

```tsx
<div className="text-[5.5rem] font-black tracking-tighter leading-[0.85]">
  <div className="text-gray-900">Business Model</div>
  <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
    Launch&nbsp;Plan
  </div>
</div>
```

## Extended Border Radius (Production)

```
rounded-lg        - 0.5rem (basic cards)
rounded-xl        - 0.75rem (standard cards)
rounded-2xl       - 1rem (feature cards)
rounded-[1.5rem]  - Cards, sections
rounded-[2rem]    - Large feature cards, charts
rounded-[3rem]    - Hero sections, feature panels
```

## Static Chart Patterns (Preferred for Print)

**For 8.5x11 print documents, use static HTML/CSS instead of Recharts.** Static visualizations are more reliable, require no client-side mounting, and render consistently across all PDF generators.

### Static Bar Chart

```tsx
<div className="h-48 border border-gray-100 rounded-[2rem] p-6 bg-white">
  <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">
    Revenue by Month
  </h4>
  <div className="flex items-end justify-around h-32 gap-3 px-2">
    {data.map((item) => (
      <div key={item.name} className="flex flex-col items-center gap-1 flex-1">
        <div
          className="w-full max-w-[40px] rounded-t transition-all"
          style={{
            height: `${(item.value / maxValue) * 100}%`,
            backgroundColor: item.color || "#3b82f6",
          }}
        />
        <span className="text-[9px] font-black text-gray-500">{item.name}</span>
        <span className="text-[10px] font-black text-gray-700">${item.value.toLocaleString()}</span>
      </div>
    ))}
  </div>
</div>
```

### Static Grouped Bar Chart

```tsx
<div className="h-56 border border-gray-100 rounded-[2rem] p-6 bg-white">
  <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">
    Revenue vs Target
  </h4>
  <div className="flex items-end justify-around h-36 gap-2 px-2">
    {data.map((item) => (
      <div key={item.month} className="flex flex-col items-center gap-1 flex-1">
        <div className="flex gap-1 items-end h-28">
          <div
            className="w-5 bg-blue-500 rounded-t"
            style={{ height: `${(item.revenue / 100000) * 100}%` }}
          />
          <div
            className="w-5 bg-gray-300 rounded-t"
            style={{ height: `${(item.target / 100000) * 100}%` }}
          />
        </div>
        <span className="text-[9px] font-black text-gray-500">{item.month}</span>
      </div>
    ))}
  </div>
  <div className="flex justify-center gap-6 mt-4">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-blue-500 rounded" />
      <span className="text-[9px] text-gray-600">Actual</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-gray-300 rounded" />
      <span className="text-[9px] text-gray-600">Target</span>
    </div>
  </div>
</div>
```

### Static Horizontal Bar Chart

```tsx
<div className="space-y-3">
  {data.map((item) => (
    <div key={item.name} className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="font-bold text-gray-700">{item.name}</span>
        <span className="font-black text-gray-900">{item.value}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${item.value}%`, backgroundColor: item.color || "#3b82f6" }}
        />
      </div>
    </div>
  ))}
</div>
```

### Static Pie Chart Alternative (Legend List)

```tsx
<div className="space-y-3">
  <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Market Share</h4>
  {data.map((item) => (
    <div key={item.name} className="flex items-center gap-3">
      <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
      <div className="flex-1 text-sm font-medium text-gray-700">{item.name}</div>
      <div className="text-sm font-black text-gray-900">{item.value}%</div>
    </div>
  ))}
</div>
```

### Static Donut Chart Alternative (Stacked Bar)

```tsx
<div className="space-y-3">
  <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Distribution</h4>
  <div className="h-6 flex rounded-full overflow-hidden">
    {data.map((item) => (
      <div
        key={item.name}
        style={{ width: `${item.value}%`, backgroundColor: item.color }}
        className="first:rounded-l-full last:rounded-r-full"
      />
    ))}
  </div>
  <div className="flex flex-wrap gap-4 mt-2">
    {data.map((item) => (
      <div key={item.name} className="flex items-center gap-2">
        <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
        <span className="text-[9px] text-gray-600">
          {item.name} ({item.value}%)
        </span>
      </div>
    ))}
  </div>
</div>
```

### Static Progress/Gauge

```tsx
<div className="space-y-2">
  <div className="flex justify-between text-[10px]">
    <span className="font-bold text-gray-600">Progress</span>
    <span className="font-black text-blue-600">75%</span>
  </div>
  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
    <div
      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
      style={{ width: "75%" }}
    />
  </div>
</div>
```

### Static Comparison Cards (Instead of Charts)

```tsx
<div className="grid grid-cols-3 gap-4">
  {[
    { label: "Q1", value: "$45K", change: "+12%", color: "text-emerald-600" },
    { label: "Q2", value: "$52K", change: "+15%", color: "text-emerald-600" },
    { label: "Q3", value: "$48K", change: "-8%", color: "text-red-600" },
  ].map((item) => (
    <div key={item.label} className="bg-gray-50 rounded-xl p-4 text-center">
      <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
        {item.label}
      </div>
      <div className="text-2xl font-black text-gray-900 mt-1">{item.value}</div>
      <div className={`text-[10px] font-bold ${item.color}`}>{item.change}</div>
    </div>
  ))}
</div>
```

### When to Use Recharts (Fallback Pattern)

Only use Recharts for **interactive web presentations**. If you must use Recharts, always include print fallback:

```tsx
{
  /* Screen only - Recharts */
}
<div className="print:hidden">
  <ResponsiveContainer>{/* Chart */}</ResponsiveContainer>
</div>;

{
  /* Print fallback - Static */
}
<div className="hidden print:block">{/* Static HTML/CSS version */}</div>;
```

## Interactive Hover Patterns

### Group Hover (Card with Child Animation)

```tsx
<div className="p-4 border border-gray-100 bg-white rounded-[1.5rem] group hover:shadow-md hover:border-pink-200 transition-all">
  <div
    className="w-8 h-8 rounded-lg transition-transform group-hover:scale-110"
    style={{ backgroundColor: color }}
  >
    <Icon className="w-5 h-5" />
  </div>
  <span className="group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-pink-500 group-hover:text-white transition-all">
    {label}
  </span>
</div>
```

### Animated Status Indicator

```tsx
<div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
```

### Hover Translation

```tsx
className = "hover:-translate-x-1 transition-all";
```

## Dark Section Pattern

```tsx
<div className="relative p-6 bg-gray-900 rounded-[2rem] overflow-hidden">
  {/* Subtle color overlay */}
  <div className="absolute inset-0 bg-orange-500 opacity-[0.03]" />

  <div className="relative z-10">
    <h3 className="text-xs font-black text-orange-400 uppercase tracking-[0.2em] mb-6 text-center">
      Section Title
    </h3>
    {/* Dark-themed content with gray-500/600/700 text colors */}
  </div>
</div>
```

## Gradient Dividers

```tsx
// Thin accent line
<div className="h-[3px] w-24 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.3)]" />

// Vertical accent bar
<div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-pink-500 rounded-full" />
```
