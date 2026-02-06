// Example Multi-Page Document Component
// Print-optimized with page-based layout, consistent headers/footers, and sequential numbering
// Based on learnings from Celavii Business Model Launch Plan
//
// NOTE: This example uses STATIC HTML/CSS visualizations instead of Recharts.
// For 8.5x11 print documents meant for PDF distribution, static visualizations are:
// - More reliable across PDF generators
// - Require no client-side mounting
// - Have zero library dependencies
// - Render 100% consistently

"use client";

import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  CheckCircle,
  ArrowRight,
  Calendar,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  Printer,
  FileText,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

// ===== BRAND CONSTANTS (Load from .styles/[company]/brand.json) =====

const BRAND = {
  name: "Acme Corporation",
  tagline: "Strategic Growth Initiative 2025",
  logo: "/logo.png", // Replace with actual logo path or full URL
  heroBg: "/hero-background.webp", // Optional: Background image for cover page
  colors: {
    primary: "#0066FF",
    secondary: "#6366F1",
    accent: "#10B981",
    destructive: "#EF4444",
    orange: "#F97316",
    pink: "#EC4899",
    purple: "#A855F7",
    dark: "#1E293B",
    muted: "#F4F4F5",
  },
  gradients: {
    primary: "linear-gradient(135deg, #0066FF 0%, #00D4FF 100%)",
    hero: "linear-gradient(135deg, #F97316 0%, #EC4899 50%, #A855F7 100%)",
    dark: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
  },
};

// ===== DATA DEFINITIONS =====

const revenueData = [
  { month: "Jan", revenue: 45000, target: 40000 },
  { month: "Feb", revenue: 52000, target: 45000 },
  { month: "Mar", revenue: 61000, target: 50000 },
  { month: "Apr", revenue: 58000, target: 55000 },
  { month: "May", revenue: 72000, target: 60000 },
  { month: "Jun", revenue: 85000, target: 65000 },
];

const marketShareData = [
  { name: "Our Product", value: 35, color: "#3b82f6" },
  { name: "Competitor A", value: 25, color: "#6366f1" },
  { name: "Competitor B", value: 20, color: "#8b5cf6" },
  { name: "Others", value: 20, color: "#d1d5db" },
];

const milestones = [
  {
    quarter: "Q1 2025",
    title: "Launch Phase",
    items: ["Initial rollout", "Team training", "Baseline metrics"],
  },
  {
    quarter: "Q2 2025",
    title: "Growth Phase",
    items: ["Expand coverage", "Optimize processes", "First review"],
  },
  {
    quarter: "Q3 2025",
    title: "Scale Phase",
    items: ["Full deployment", "Advanced features", "ROI assessment"],
  },
  {
    quarter: "Q4 2025",
    title: "Optimization",
    items: ["Continuous improvement", "Year-end review", "Plan Year 2"],
  },
];

const kpiCards = [
  {
    label: "Revenue Growth",
    value: "+45%",
    icon: TrendingUp,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  { label: "New Customers", value: "1,250", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  {
    label: "Cost Savings",
    value: "$2.4M",
    icon: DollarSign,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    label: "Target Hit Rate",
    value: "94%",
    icon: Target,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
];

// ===== REUSABLE COMPONENTS =====

const PageWrapper = ({
  children,
  pageNumber,
  totalPages = 5,
  hideHeaderFooter = false,
}: {
  children: React.ReactNode;
  pageNumber: number;
  totalPages?: number;
  hideHeaderFooter?: boolean;
}) => (
  <div className="report-page bg-white relative overflow-hidden">
    {/* Page background accents */}
    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-20 -mr-32 -mt-32" />
    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-20 -ml-32 -mb-32" />

    <div className="flex flex-col h-full relative z-10">
      {!hideHeaderFooter && (
        <div className="mb-6 flex justify-between items-center text-[8px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center overflow-hidden bg-white border border-gray-100 shadow-sm">
              <span className="text-xs font-bold text-blue-600">A</span>
            </div>
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              {BRAND.name}
            </span>{" "}
            | {BRAND.tagline}
          </div>
          <div>Confidential Proposal v1.0</div>
        </div>
      )}

      {children}

      {!hideHeaderFooter && (
        <div className="mt-auto pt-6 flex justify-between items-center text-[8px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-100 print:border-gray-200">
          <div>© 2025 {BRAND.name}</div>
          <div className="bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            Page {pageNumber} of {totalPages}
          </div>
        </div>
      )}
    </div>
  </div>
);

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

// ===== MAIN COMPONENT =====

export default function MultiPageProposal() {
  // No useState/useEffect needed for static visualizations
  // This makes the component simpler and more reliable for print

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* ===== CONTROL BAR (Screen Only) - Production Pattern ===== */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 print:hidden shadow-sm">
        <div className="max-w-[8.5in] mx-auto px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-all cursor-pointer hover:-translate-x-1">
              <FileText className="w-4 h-4" />
              <span className="text-sm font-semibold tracking-tight">Documents</span>
            </div>
            <div className="h-4 w-[1px] bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">A</span>
              </div>
              <span className="text-sm font-bold tracking-tight">Multi-Page Proposal</span>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-900/20 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            Download PDF Report
          </button>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="report-container">
        {/* ===== PAGE 1: COVER PAGE (Production Pattern) ===== */}
        <PageWrapper pageNumber={1} totalPages={5} hideHeaderFooter={true}>
          <div className="h-full flex flex-col justify-center relative -m-[0.5in] p-[0.5in]">
            {/* Background Image Layer (Optional) */}
            {BRAND.heroBg && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white via-white/40 to-white" />
              </div>
            )}

            <div className="space-y-12 relative z-10">
              {/* Logo + Company Name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-600/20">
                  <span className="text-white font-black text-3xl">A</span>
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
                  Proposal & Strategy
                </div>
                <div className="text-[4rem] font-black tracking-tighter leading-[0.9]">
                  <div className="text-gray-900">Partnership</div>
                  <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                    Proposal
                  </div>
                </div>
                <p className="text-lg text-gray-500 font-medium max-w-lg leading-relaxed pt-4">
                  A comprehensive partnership proposal designed to accelerate growth and deliver
                  measurable ROI.
                </p>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 gap-6 pt-8">
                <div className="bg-blue-50 rounded-[1.5rem] p-5 border border-blue-100">
                  <div className="text-3xl font-black text-blue-700 mb-1">$2.4M</div>
                  <div className="text-sm text-gray-600">Projected Year 1 Value</div>
                </div>
                <div className="bg-purple-50 rounded-[1.5rem] p-5 border border-purple-100">
                  <div className="text-3xl font-black text-purple-700 mb-1">433%</div>
                  <div className="text-sm text-gray-600">Return on Investment</div>
                </div>
              </div>
            </div>

            {/* Footer with Metadata */}
            <div className="mt-auto flex justify-between items-end border-t border-gray-100 pt-8 relative z-10">
              <div className="space-y-1">
                <div className="text-[8px] font-black text-gray-300 uppercase tracking-widest">
                  Prepared For
                </div>
                <div className="text-sm font-bold text-gray-900">{BRAND.name}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-gray-900 uppercase tracking-tight">
                  {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </div>
                <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  Strategic Partnership
                </div>
              </div>
            </div>
          </div>
        </PageWrapper>

        {/* ===== PAGE 2: EXECUTIVE OVERVIEW ===== */}
        <PageWrapper pageNumber={2} totalPages={5}>
          <SectionHeader title="Executive Overview" icon={Target} color={BRAND.colors.primary} />

          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {kpiCards.map((kpi) => (
              <div key={kpi.label} className={`${kpi.bg} rounded-xl p-4 border border-gray-100`}>
                <div className="flex items-center gap-2 mb-2">
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                  <span className="text-sm text-gray-600">{kpi.label}</span>
                </div>
                <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
              </div>
            ))}
          </div>

          {/* Value Proposition */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white">
            <div className="grid grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-xl font-black mb-4 tracking-tight">Why This Partnership?</h3>
                <ul className="space-y-2.5">
                  {[
                    "Proven track record with 50+ enterprise clients",
                    "Flexible pricing model aligned with your growth",
                    "Dedicated support team and 99.9% uptime SLA",
                    "Seamless integration with existing systems",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-300 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-blue-100">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
                <div className="text-center">
                  <div className="text-xs text-blue-200 mb-1 uppercase tracking-wider">
                    Projected Year 1 Value
                  </div>
                  <div className="text-4xl font-black mb-2">$2.4M</div>
                  <div className="text-xs text-blue-200">in cost savings and revenue growth</div>
                </div>
              </div>
            </div>
          </div>
        </PageWrapper>

        {/* ===== PAGE 3: MARKET OPPORTUNITY ===== */}
        <PageWrapper pageNumber={3} totalPages={5}>
          <SectionHeader
            title="Market Opportunity"
            icon={PieChartIcon}
            color={BRAND.colors.purple}
          />

          <div className="grid grid-cols-2 gap-6">
            {/* Market Share - Static Visualization */}
            <div className="bg-white rounded-[1.5rem] border border-gray-200 p-6 shadow-sm">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">
                Current Market Position
              </h3>

              {/* Static Donut Alternative - Stacked Bar */}
              <div className="space-y-4">
                <div className="h-6 flex rounded-full overflow-hidden">
                  {marketShareData.map((item) => (
                    <div
                      key={item.name}
                      style={{ width: `${item.value}%`, backgroundColor: item.color }}
                      className="first:rounded-l-full last:rounded-r-full"
                    />
                  ))}
                </div>

                {/* Legend List */}
                <div className="space-y-2 pt-2">
                  {marketShareData.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                      <div className="flex-1 text-sm font-medium text-gray-700">{item.name}</div>
                      <div className="text-sm font-black text-gray-900">{item.value}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Opportunity Details */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">
                Growth Potential
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Total Addressable Market", value: "$50B", growth: "+12% YoY" },
                  { label: "Target Segment Size", value: "$8B", growth: "+18% YoY" },
                  { label: "Achievable Market Share", value: "15%", growth: "within 3 years" },
                  { label: "Revenue Opportunity", value: "$1.2B", growth: "cumulative" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-gray-600">{item.label}</span>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{item.value}</div>
                      <div className="text-xs text-green-600">{item.growth}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PageWrapper>

        {/* ===== PAGE 4: FINANCIAL PROJECTIONS ===== */}
        <PageWrapper pageNumber={4} totalPages={5}>
          <SectionHeader
            title="Financial Projections"
            icon={TrendingUp}
            color={BRAND.colors.accent}
          />

          {/* Static Grouped Bar Chart - Revenue vs Target */}
          <div className="bg-white rounded-[1.5rem] border border-gray-200 p-6 mb-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Revenue vs Target (6-Month Projection)
            </h3>

            {/* Static Bar Chart - No Recharts needed */}
            <div className="h-56 flex items-end justify-around gap-2 px-4 pt-4 border-b border-gray-100">
              {revenueData.map((item) => {
                const maxValue = 100000;
                const revenueHeight = (item.revenue / maxValue) * 100;
                const targetHeight = (item.target / maxValue) * 100;
                return (
                  <div key={item.month} className="flex flex-col items-center gap-1 flex-1">
                    <div className="flex gap-1 items-end h-40">
                      <div
                        className="w-6 bg-blue-500 rounded-t"
                        style={{ height: `${revenueHeight}%` }}
                      />
                      <div
                        className="w-6 bg-gray-300 rounded-t"
                        style={{ height: `${targetHeight}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-gray-500">{item.month}</span>
                    <span className="text-[9px] font-medium text-gray-400">
                      ${(item.revenue / 1000).toFixed(0)}K
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded" />
                <span className="text-xs text-gray-600">Actual Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded" />
                <span className="text-xs text-gray-600">Target</span>
              </div>
            </div>
          </div>

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                title: "Year 1 Investment",
                value: "$450,000",
                subtitle: "Implementation + Training",
              },
              { title: "Year 1 Returns", value: "$2,400,000", subtitle: "Savings + New Revenue" },
              { title: "ROI", value: "433%", subtitle: "Payback in 2.3 months" },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5"
              >
                <div className="text-sm text-gray-500 mb-1">{card.title}</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{card.value}</div>
                <div className="text-xs text-gray-500">{card.subtitle}</div>
              </div>
            ))}
          </div>
        </PageWrapper>

        {/* ===== PAGE 5: IMPLEMENTATION & TERMS ===== */}
        <PageWrapper pageNumber={5} totalPages={5}>
          <SectionHeader
            title="Implementation Timeline"
            icon={Calendar}
            color={BRAND.colors.orange}
          />

          <div className="grid grid-cols-4 gap-4 mb-10">
            {milestones.map((milestone, index) => (
              <div key={milestone.quarter} className="relative">
                {/* Connector line */}
                {index < milestones.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-blue-200 z-0" />
                )}

                <div className="bg-white rounded-xl border border-gray-200 p-5 relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">{milestone.quarter}</div>
                      <div className="font-semibold text-gray-900">{milestone.title}</div>
                    </div>
                  </div>
                  <ul className="space-y-1.5">
                    {milestone.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <ArrowRight className="w-3 h-3 text-blue-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          {/* Partnership Terms */}
          <SectionHeader title="Partnership Terms" icon={Zap} color={BRAND.colors.primary} />

          <div className="bg-white rounded-xl border-2 border-blue-200 overflow-hidden">
            <div className="grid md:grid-cols-2">
              {/* Our Commitments */}
              <div className="p-6 bg-blue-50/50">
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Our Commitments
                </h3>
                <ul className="space-y-3">
                  {[
                    "Dedicated account manager",
                    "24/7 technical support",
                    "Quarterly business reviews",
                    "Custom integration support",
                    "99.9% uptime SLA",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-700">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Your Benefits */}
              <div className="p-6 bg-green-50/50">
                <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Your Benefits
                </h3>
                <ul className="space-y-3">
                  {[
                    "No upfront costs",
                    "Performance-based pricing",
                    "Cancel anytime after Year 1",
                    "Data ownership guaranteed",
                    "Priority feature requests",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-700">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
              <p className="text-blue-100 mb-2">Ready to get started?</p>
              <p className="text-xl font-bold text-white">
                Contact us to schedule a detailed discussion
              </p>
            </div>
          </div>
        </PageWrapper>
      </main>

      {/* ===== PRINT STYLES ===== */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* Print Styles - Letter Size (8.5" x 11") */
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
        
        /* Screen Styles */
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
