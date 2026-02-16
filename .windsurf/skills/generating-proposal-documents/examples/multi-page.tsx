// =============================================================================
// Example Multi-Page Print Document — Production Quality Reference
// =============================================================================
//
// PURPOSE: This is the primary example agents pattern-match against. It must
// demonstrate EVERY principle that makes a proposal look professional:
//
//   1. TIGHT SPACING — gap-2/gap-3, mb-3, p-3/p-4 on content pages
//   2. PRINT-SCALE TYPOGRAPHY — text-[7px]–text-[10px] for content pages
//   3. VISUAL RHYTHM — light/dark/accent section alternation on every page
//   4. DATA DENSITY — 3–4 distinct sections per content page
//   5. PAGE BUDGET — each page fits within 8.5×11 with 0.5in padding
//   6. BRAND ADAPTATION — BRAND constant with clear color mapping
//
// CRITICAL: Do NOT use web-style spacing (gap-4+, p-6+, mb-6+) on content
// pages. That is the #1 reason proposals look bad.
//
// Static HTML/CSS charts only — no Recharts for print documents.
// =============================================================================

"use client";

import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  CheckCircle,
  ArrowRight,
  MapPin,
  Zap,
  BarChart3,
  Shield,
  Store,
  Printer,
  FileText,
  ChevronRight,
  Star,
  Clock,
} from "lucide-react";

// ===== BRAND CONSTANTS =====
// Load from .styles/[company]/brand.json in production.
// When adapting for a different brand:
//   - Swap primary/accent colors below
//   - Keep bg-gray-900 for dark sections (universal)
//   - Keep text-emerald-* for success states (universal)
//   - Only change color tokens, never redesign layout structure

const BRAND = {
  name: "Partner Co.",
  tagline: "Market Expansion Brief",
  colors: {
    primary: "#0066FF", // Maps to: bg-blue-*, text-blue-*, border-blue-*
    secondary: "#6366F1", // Maps to: bg-indigo-*, text-indigo-*
    accent: "#10B981", // Maps to: bg-emerald-*, text-emerald-*
    destructive: "#EF4444",
    orange: "#F97316",
    pink: "#EC4899",
    purple: "#A855F7",
    dark: "#1E293B",
    muted: "#F4F4F5",
  },
};

// ===== VALIDATED DATA =====
// In production, populate from MCP APIs, databases, or user-provided specs.
// Use realistic, domain-specific data — never generic placeholders.

const MARKET_DATA = [
  { name: "Enterprise", lift: "18.2×", pct: 100, color: "bg-blue-500" },
  { name: "Mid-Market", lift: "9.7×", pct: 53, color: "bg-indigo-500" },
  { name: "SMB", lift: "6.4×", pct: 35, color: "bg-orange-500" },
  { name: "Startup", lift: "4.1×", pct: 23, color: "bg-emerald-500" },
  { name: "Agency", lift: "2.8×", pct: 15, color: "bg-pink-500" },
];

const KEY_ACCOUNTS = [
  { name: "Acme Corp", handle: "acme_co", metric: "2.4M", rate: "3.2%", segment: "Enterprise" },
  { name: "NovaTech", handle: "novatech", metric: "1.8M", rate: "4.1%", segment: "Mid-Market" },
  { name: "Pinnacle", handle: "pinnacle_io", metric: "890K", rate: "5.5%", segment: "Enterprise" },
  { name: "Zenith", handle: "zenith_hq", metric: "650K", rate: "2.8%", segment: "SMB" },
  { name: "Apex Digital", handle: "apex_dig", metric: "420K", rate: "6.1%", segment: "Agency" },
  { name: "SkyBridge", handle: "skybridge", metric: "310K", rate: "3.9%", segment: "Startup" },
];

const COMPETITORS = [
  { brand: "Our Product", price: "$49/mo", margin: "72%", nps: "68", fit: 5 },
  { brand: "Competitor A", price: "$89/mo", margin: "55%", nps: "42", fit: 2 },
  { brand: "Competitor B", price: "$79/mo", margin: "60%", nps: "51", fit: 3 },
  { brand: "Legacy Tool", price: "$120/mo", margin: "45%", nps: "28", fit: 1 },
];

// ===== REUSABLE COMPONENTS =====
// Note TIGHT spacing: mb-5 headers, pt-3/pb-3 footers, p-3/p-4 cards
// These values are calibrated for 8.5x11 print density.

const PageWrapper = ({
  children,
  pageNumber,
  totalPages = 4,
  hideHeaderFooter = false,
}: {
  children: React.ReactNode;
  pageNumber: number;
  totalPages?: number;
  hideHeaderFooter?: boolean;
}) => (
  <div className="report-page bg-white relative overflow-hidden">
    {/* Subtle background accents */}
    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-20 -mr-32 -mt-32" />
    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-20 -ml-24 -mb-24" />

    <div className="flex flex-col h-full relative z-10">
      {/* Header — TIGHT: mb-5, pb-3, text-[7px] */}
      {!hideHeaderFooter && (
        <div className="mb-5 flex justify-between items-center text-[7px] font-bold text-gray-400 uppercase tracking-[0.15em] border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-[10px] font-black text-white">P</span>
            </div>
            <span className="text-gray-500">{BRAND.name}</span>
            <span className="text-gray-300">|</span>
            <span>{BRAND.tagline}</span>
          </div>
          <div>Confidential — 2026</div>
        </div>
      )}

      {children}

      {/* Footer — TIGHT: pt-4, text-[7px] */}
      {!hideHeaderFooter && (
        <div className="mt-auto pt-4 flex justify-between items-center text-[7px] font-bold text-gray-400 uppercase tracking-[0.15em] border-t border-gray-100">
          <div>© 2026 {BRAND.name}</div>
          <div className="bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            Page {pageNumber} of {totalPages}
          </div>
        </div>
      )}
    </div>
  </div>
);

// SectionHeader — TIGHT: mb-5, text-[17px], icon p-2 w-4
const SectionHeader = ({
  title,
  subtitle,
  icon: Icon,
  color = BRAND.colors.primary,
}: {
  title: string;
  subtitle?: string;
  icon?: any;
  color?: string;
}) => (
  <div className="mb-5">
    <div className="flex items-center gap-3 mb-1">
      {Icon && (
        <div
          className="p-2 rounded-xl shadow-sm"
          style={{ backgroundColor: `${color}15`, boxShadow: `0 4px 12px ${color}20` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      )}
      <h2 className="text-[17px] font-bold tracking-tight text-gray-900">{title}</h2>
    </div>
    {subtitle && <p className="text-[10px] text-gray-500 font-medium ml-[44px]">{subtitle}</p>}
  </div>
);

// FitDots — visual rating indicator for tables
const FitDots = ({ count, max = 5 }: { count: number; max?: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: max }).map((_, i) => (
      <div
        key={i}
        className={`w-[7px] h-[7px] rounded-sm ${i < count ? "bg-blue-500" : "bg-gray-200"}`}
      />
    ))}
  </div>
);

// ===== MAIN COMPONENT =====

export default function MultiPageProposal() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-gray-50">
      {/* ===== CONTROL BAR (Screen Only) ===== */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 print:hidden shadow-sm">
        <div className="max-w-[8.5in] mx-auto px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-500">
              <FileText className="w-4 h-4" />
              <span className="text-sm font-semibold tracking-tight">Documents</span>
            </div>
            <div className="h-4 w-[1px] bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">P</span>
              </div>
              <span className="text-sm font-bold tracking-tight">Partnership Proposal</span>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-900/20 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </header>

      {/* ===== PAGES ===== */}
      <main className="report-container">
        {/* ==================== PAGE 1: COVER ==================== */}
        {/* Cover uses generous spacing — it's the ONLY page that should */}
        <PageWrapper pageNumber={1} totalPages={4} hideHeaderFooter>
          <div className="h-full flex flex-col relative -m-[0.5in] p-[0.5in]">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-30 -mr-48 -mt-48" />
            </div>

            <div className="space-y-10 relative z-10">
              {/* Logo + Recipient */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-600/20">
                    <span className="text-white font-black text-2xl">P</span>
                  </div>
                  <div>
                    <div className="text-xl font-black tracking-tighter text-gray-900 uppercase">
                      {BRAND.name}
                    </div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                      {BRAND.tagline}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] font-black text-gray-300 uppercase tracking-widest">
                    Prepared For
                  </div>
                  <div className="text-lg font-black text-gray-900 mt-0.5">Client Name</div>
                  <div className="text-xs text-gray-500 font-medium">Decision Team</div>
                </div>
              </div>

              {/* Gradient Divider */}
              <div
                className="h-[3px] w-28 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${BRAND.colors.primary}, ${BRAND.colors.dark})`,
                }}
              />

              {/* Giant Title — text-[3.5rem] minimum for covers */}
              <div className="space-y-2">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                  Market Intelligence Brief
                </div>
                <div className="text-[3.5rem] font-black tracking-tighter leading-[0.88]">
                  <div className="text-gray-900">Market</div>
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                    Expansion
                  </div>
                  <div className="text-gray-300">Strategy</div>
                </div>
                <p className="text-sm text-gray-500 font-medium max-w-md leading-relaxed pt-3">
                  Data-validated intelligence, competitive positioning, and a turnkey activation
                  plan — backed by AI-profiled analysis across 200+ accounts.
                </p>
              </div>

              {/* 4-col stat grid — cover can use p-4 */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  {
                    label: "Year-1 Value",
                    value: "$2.4M",
                    bg: "bg-blue-50",
                    border: "border-blue-100",
                    text: "text-blue-700",
                  },
                  {
                    label: "ROI",
                    value: "433%",
                    bg: "bg-gray-50",
                    border: "border-gray-200",
                    text: "text-gray-900",
                  },
                  {
                    label: "Accounts",
                    value: "200+",
                    bg: "bg-emerald-50",
                    border: "border-emerald-100",
                    text: "text-emerald-700",
                  },
                  {
                    label: "Pilot Sites",
                    value: "25",
                    bg: "bg-indigo-50",
                    border: "border-indigo-100",
                    text: "text-indigo-700",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`${stat.bg} rounded-2xl p-4 border ${stat.border}`}
                  >
                    <div className={`text-2xl font-black ${stat.text} tracking-tight`}>
                      {stat.value}
                    </div>
                    <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Dark hero bar */}
              <div className="bg-gray-900 rounded-2xl p-5">
                <div className="text-[10px] font-medium text-gray-400 mb-1">
                  Why This Deal Is Different
                </div>
                <div className="text-[15px] font-black text-white tracking-tight">
                  We absorb 100% of activation costs, sampling, and materials.
                </div>
                <div className="text-xs font-semibold text-blue-400 mt-1">
                  Zero risk to you. Pure value delivery.
                </div>
              </div>
            </div>

            {/* Cover Footer */}
            <div className="mt-auto flex justify-between items-end border-t border-gray-100 pt-6 relative z-10">
              <div className="space-y-0.5">
                <div className="text-[7px] font-black text-gray-300 uppercase tracking-widest">
                  Data Source
                </div>
                <div className="text-xs font-bold text-gray-600">AI Intelligence Platform</div>
                <div className="text-[8px] text-gray-400">
                  200+ profiles · 97% coverage · Live 2026
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-gray-900 uppercase tracking-tight">
                  February 2026
                </div>
                <div className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                  Confidential
                </div>
              </div>
            </div>
          </div>
        </PageWrapper>

        {/* ==================== PAGE 2: MARKET INTELLIGENCE ==================== */}
        {/* COMPOSITION: [Light] 2-col → [Dark] featured → [Light] table = 3 sections */}
        <PageWrapper pageNumber={2} totalPages={4}>
          <SectionHeader
            title="Market Intelligence Snapshot"
            subtitle="AI-validated data — real accounts, real metrics, real alignment."
            icon={BarChart3}
            color={BRAND.colors.primary}
          />

          {/* [LIGHT] Two-column grid — gap-3, p-4 */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Left: Market Index (static horizontal bars) */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <h3 className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-3">
                Market Segment Index
              </h3>
              <div className="space-y-2">
                {MARKET_DATA.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-16 text-[9px] font-bold text-gray-600">{item.name}</div>
                    <div className="flex-1 h-3.5 bg-gray-100 rounded overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded flex items-center justify-end pr-1`}
                        style={{ width: `${item.pct}%` }}
                      >
                        <span className="text-[6px] font-black text-white">{item.lift}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[7px] text-gray-400 italic mt-2">
                Enterprise at 18.2× = strongest segment signal
              </p>
            </div>

            {/* Right: Network stats grid */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <h3 className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-3">
                Network Composition
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Total Accounts", value: "200+", Icon: Users },
                  { label: "Local Presence", value: "51", Icon: MapPin },
                  { label: "AI Profiled", value: "97%", Icon: Zap },
                  { label: "Top Tier", value: "12", Icon: Star },
                  { label: "Strike Team", value: "22", Icon: Target },
                  { label: "Pipeline", value: "175", Icon: TrendingUp },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 border border-gray-100"
                  >
                    <s.Icon className="w-3 h-3 text-blue-500 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-black text-gray-900 leading-none">{s.value}</div>
                      <div className="text-[7px] font-medium text-gray-500">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* [DARK] Featured accounts — 3-col grid on dark bg */}
          <div className="bg-gray-900 rounded-2xl p-4 mb-3">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                Featured Accounts — Verified Data
              </h3>
              <span className="text-[7px] font-bold text-blue-400">✓ All in CRM pipeline</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {KEY_ACCOUNTS.map((c) => (
                <div
                  key={c.handle}
                  className="bg-white/[0.06] rounded-xl p-3 border border-white/[0.08]"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="text-[10px] font-black text-white">{c.name}</div>
                      <div className="text-[8px] font-semibold text-blue-400">@{c.handle}</div>
                    </div>
                    <div className="text-xs font-black text-white">{c.metric}</div>
                  </div>
                  <div className="text-[7px] text-gray-400">{c.segment}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[7px] font-bold text-emerald-400">Rate: {c.rate}</span>
                    <span className="text-[6px] font-bold text-blue-300 bg-blue-400/10 px-1.5 py-0.5 rounded">
                      TOP TIER
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* [LIGHT] Competitive table */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <h3 className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-3">
              Competitive Landscape
            </h3>
            <table className="w-full text-[9px]">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  {["Brand", "Price", "Margin", "NPS", "Fit Score"].map((h) => (
                    <th
                      key={h}
                      className="text-left py-1.5 px-2 text-[7px] font-black text-gray-400 uppercase tracking-widest"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPETITORS.map((row, i) => (
                  <tr
                    key={row.brand}
                    className={`border-b border-gray-100 ${i === 0 ? "bg-blue-50/50" : ""}`}
                  >
                    <td
                      className={`py-1.5 px-2 font-bold ${i === 0 ? "text-blue-600" : "text-gray-700"}`}
                    >
                      {row.brand}
                    </td>
                    <td
                      className={`py-1.5 px-2 font-bold ${i === 0 ? "text-gray-900" : "text-gray-600"}`}
                    >
                      {row.price}
                    </td>
                    <td
                      className={`py-1.5 px-2 font-bold ${i === 0 ? "text-emerald-600" : "text-gray-600"}`}
                    >
                      {row.margin}
                    </td>
                    <td className="py-1.5 px-2 font-semibold text-gray-600">{row.nps}</td>
                    <td className="py-1.5 px-2">
                      <FitDots count={row.fit} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PageWrapper>

        {/* ==================== PAGE 3: ACTIVATION PLAN ==================== */}
        {/* COMPOSITION: [Light] 2-col → [Dark] timeline → [Light] matrix = 3 sections */}
        <PageWrapper pageNumber={3} totalPages={4}>
          <SectionHeader
            title="Activation Plan"
            subtitle="25 pilot sites × 51 local accounts × data-driven execution."
            icon={MapPin}
            color={BRAND.colors.accent}
          />

          {/* [LIGHT] Two-column: Distribution + Tiers */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <h3 className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-3">
                Pilot Distribution (25 Locations)
              </h3>
              <div className="space-y-2.5">
                {[
                  { zone: "Metro East", sites: 12, accounts: 28, pct: 100, color: "bg-blue-500" },
                  { zone: "Metro West", sites: 8, accounts: 14, pct: 67, color: "bg-indigo-500" },
                  { zone: "Suburban", sites: 5, accounts: 9, pct: 42, color: "bg-emerald-500" },
                ].map((z) => (
                  <div key={z.zone}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-gray-700">{z.zone}</span>
                      <div className="flex gap-3">
                        <span className="text-[9px] font-bold text-gray-900">{z.sites} sites</span>
                        <span className="text-[9px] font-medium text-gray-400">
                          {z.accounts} accounts
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${z.color} rounded-full`}
                        style={{ width: `${z.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <h3 className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-3">
                Account Tiers
              </h3>
              <div className="space-y-2">
                {[
                  {
                    tier: "Enterprise",
                    range: "1M+",
                    count: 12,
                    rate: "$5K/mo",
                    color: "border-l-blue-500",
                  },
                  {
                    tier: "Mid-Market",
                    range: "500K+",
                    count: 9,
                    rate: "$2K/mo",
                    color: "border-l-indigo-500",
                  },
                  {
                    tier: "Growth",
                    range: "100K–500K",
                    count: 21,
                    rate: "$500/mo",
                    color: "border-l-orange-500",
                  },
                  {
                    tier: "Emerging",
                    range: "10K–100K",
                    count: 87,
                    rate: "Organic",
                    color: "border-l-emerald-500",
                  },
                ].map((t) => (
                  <div
                    key={t.tier}
                    className={`bg-gray-50 rounded-lg p-2.5 border border-gray-100 border-l-[3px] ${t.color}`}
                  >
                    <div className="flex justify-between items-center mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-gray-900">{t.tier}</span>
                        <span className="text-[7px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          {t.range}
                        </span>
                      </div>
                      <span className="text-[10px] font-black text-blue-600">{t.count}</span>
                    </div>
                    <div className="text-[7px] font-semibold text-gray-400">Rate: {t.rate}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* [DARK] Timeline — 3-phase with colored top borders */}
          <div className="bg-gray-900 rounded-2xl p-4 mb-3">
            <h3 className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-3">
              90-Day Pilot → Scale Roadmap
            </h3>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  phase: "Phase 1: Pilot",
                  period: "Months 1–3",
                  target: "25 sites",
                  items: [
                    "Staff training",
                    "Materials deploy",
                    "Content launch",
                    "Sampling events",
                  ],
                  color: "border-t-blue-500 text-blue-400",
                },
                {
                  phase: "Phase 2: Scale",
                  period: "Months 4–8",
                  target: "50–100 sites",
                  items: [
                    "Regional expansion",
                    "Quarterly events",
                    "Weekly content",
                    "Campaign optimization",
                  ],
                  color: "border-t-emerald-500 text-emerald-400",
                },
                {
                  phase: "Phase 3: National",
                  period: "Year 2+",
                  target: "200+ sites",
                  items: [
                    "Full footprint",
                    "Tour partnerships",
                    "Festival activations",
                    "National awareness",
                  ],
                  color: "border-t-orange-500 text-orange-400",
                },
              ].map((p) => (
                <div
                  key={p.phase}
                  className={`bg-white/[0.04] rounded-xl p-3 border border-white/[0.06] border-t-2 ${p.color.split(" ")[0]}`}
                >
                  <div
                    className={`text-[7px] font-black uppercase tracking-widest mb-1 ${p.color.split(" ")[1]}`}
                  >
                    {p.phase}
                  </div>
                  <div className="text-[10px] font-bold text-white mb-0.5">{p.period}</div>
                  <div className="text-[8px] font-medium text-gray-400 mb-2">{p.target}</div>
                  <div className="space-y-1">
                    {p.items.map((item) => (
                      <div key={item} className="flex items-center gap-1.5">
                        <ChevronRight className={`w-2 h-2 ${p.color.split(" ")[1]}`} />
                        <span className="text-[7px] text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* [LIGHT] 4-col activation matrix */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <h3 className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-3">
              Segment → Activation Matrix
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                {
                  segment: "Enterprise",
                  activation: "Executive sponsorship",
                  Icon: Users,
                  color: "text-blue-500",
                },
                {
                  segment: "Mid-Market",
                  activation: "Partner events",
                  Icon: Store,
                  color: "text-indigo-500",
                },
                {
                  segment: "Growth",
                  activation: "Content co-creation",
                  Icon: TrendingUp,
                  color: "text-orange-500",
                },
                {
                  segment: "Emerging",
                  activation: "Community building",
                  Icon: Star,
                  color: "text-pink-500",
                },
              ].map((a) => (
                <div
                  key={a.segment}
                  className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center"
                >
                  <a.Icon className={`w-4 h-4 mx-auto mb-1.5 ${a.color}`} />
                  <div className="text-[9px] font-black text-gray-900">{a.segment}</div>
                  <div className="text-[7px] text-gray-500 mt-0.5">{a.activation}</div>
                </div>
              ))}
            </div>
          </div>
        </PageWrapper>

        {/* ==================== PAGE 4: THE DEAL ==================== */}
        {/* COMPOSITION: [Accent] 2-col → [Light] KPIs → [Light] terms → [Dark] CTA = 4 sections */}
        <PageWrapper pageNumber={4} totalPages={4}>
          <SectionHeader
            title="The Partnership"
            subtitle="Structured so you win regardless. We carry the risk — you get the value."
            icon={DollarSign}
            color={BRAND.colors.dark}
          />

          {/* [ACCENT] Two-column: Benefits + Commitments */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100">
              <h3 className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-3">
                What You Get (Free)
              </h3>
              <div className="space-y-1.5">
                {[
                  { text: "Premium pricing — 45% below market", bold: true },
                  { text: "72% gross margin on every unit", bold: true },
                  { text: "200+ accounts driving demand — $0 cost to you", bold: false },
                  { text: "Full materials, training kits, sampling", bold: false },
                  { text: "Zero markdown risk — we cover obsolescence", bold: false },
                  { text: "This brief — yours to keep regardless", bold: false },
                ].map((b, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <CheckCircle className="w-2.5 h-2.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span
                      className={`text-[8px] ${b.bold ? "font-bold text-gray-900" : "font-medium text-gray-600"}`}
                    >
                      {b.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100">
              <h3 className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-3">
                What We Commit
              </h3>
              <div className="space-y-1.5">
                {[
                  { text: "$650K–750K activation budget (Year 1) — fully funded", bold: true },
                  { text: "$100K marketing budget for launch market", bold: true },
                  { text: "12 months pricing commitment", bold: false },
                  { text: "Weekly supply with 2-week buffer", bold: false },
                  { text: "Demand surge response protocol", bold: false },
                  { text: "Compliance, vetting, content moderation", bold: false },
                ].map((c, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <ArrowRight className="w-2.5 h-2.5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span
                      className={`text-[8px] ${c.bold ? "font-bold text-gray-900" : "font-medium text-gray-600"}`}
                    >
                      {c.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* [LIGHT] 5-col KPI benchmarks */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm mb-3">
            <h3 className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-3">
              Pilot Success Metrics
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {[
                {
                  metric: "Attach Rate",
                  target: ">18%",
                  context: "vs. 12% avg",
                  color: "text-blue-600",
                },
                {
                  metric: "Turns",
                  target: ">1.5×/wk",
                  context: "vs. 0.8× typical",
                  color: "text-emerald-600",
                },
                {
                  metric: "Stockouts",
                  target: "Zero",
                  context: "we expedite",
                  color: "text-indigo-600",
                },
                {
                  metric: "Markdowns",
                  target: "Zero",
                  context: "we cover cost",
                  color: "text-orange-600",
                },
                {
                  metric: "NPS",
                  target: ">65",
                  context: "vs. 42 category",
                  color: "text-pink-600",
                },
              ].map((kpi) => (
                <div
                  key={kpi.metric}
                  className="bg-gray-50 rounded-xl p-2.5 border border-gray-100 text-center"
                >
                  <div className={`text-base font-black ${kpi.color}`}>{kpi.target}</div>
                  <div className="text-[8px] font-bold text-gray-900 mt-0.5">{kpi.metric}</div>
                  <div className="text-[7px] text-gray-400 mt-0.5">{kpi.context}</div>
                </div>
              ))}
            </div>
          </div>

          {/* [LIGHT] Two-column: Compliance + Terms */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-2">
                <Shield className="w-3 h-3 text-gray-500" />
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                  Compliance
                </span>
              </div>
              <div className="space-y-1">
                {[
                  "Industry-standard certifications",
                  "Full audit trail and reporting",
                  "Background checks on all partners",
                  "48-hour approval SLA",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
                    <span className="text-[7px] text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-2">
                <Clock className="w-3 h-3 text-gray-500" />
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                  Deal Terms
                </span>
              </div>
              <div className="space-y-1">
                {[
                  "3-year commitment with Year 1 locked pricing",
                  "Net-30 invoicing, no upfront fees",
                  "Volume discounts at scale thresholds",
                  "If pilot misses targets — both walk, no hard feelings",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
                    <span className="text-[7px] text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* [DARK] CTA */}
          <div className="bg-gray-900 rounded-2xl p-5 text-center">
            <div className="text-lg font-black text-white tracking-tight mb-1.5">
              Let&apos;s Talk
            </div>
            <p className="text-[10px] text-gray-400 max-w-md mx-auto mb-4">
              This brief is yours — use it whether or not we partner. The data speaks for itself.
            </p>
            <div className="flex justify-center gap-8 items-center">
              <div>
                <div className="text-[7px] font-black text-gray-500 uppercase tracking-widest">
                  Contact
                </div>
                <div className="text-xs font-bold text-white mt-0.5">partnerships@example.com</div>
              </div>
              <div className="w-px h-7 bg-white/10" />
              <div>
                <div className="text-[7px] font-black text-gray-500 uppercase tracking-widest">
                  Website
                </div>
                <div className="text-xs font-bold text-blue-400 mt-0.5">example.com</div>
              </div>
            </div>
          </div>
        </PageWrapper>
      </main>

      {/* ===== PRINT STYLES ===== */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page { size: letter; margin: 0; }
          html, body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .print\\:hidden { display: none !important; }
          .report-page {
            page-break-after: always;
            page-break-inside: avoid;
            width: 8.5in;
            height: 11in;
            padding: 0.5in;
            margin: 0;
            box-sizing: border-box;
          }
          .report-page:last-child { page-break-after: auto; }
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
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border-radius: 0.5rem;
          }
        }
      `,
        }}
      />
    </div>
  );
}
