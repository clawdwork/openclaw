// Example One-Pager Component - Based on Sheetz Partnership Proposal
// This serves as a template for generating similar print-ready documents
//
// NOTE: This example uses STATIC HTML/CSS visualizations instead of Recharts.
// For 8.5x11 print documents meant for PDF distribution, static visualizations are:
// - More reliable across PDF generators
// - Require no client-side mounting
// - Have zero library dependencies
// - Render 100% consistently

"use client";

import { DollarSign, TrendingUp, Target, Award, BarChart3 } from "lucide-react";
import Image from "next/image";

// Example data structure - replace with actual data
const chartData = [
  { name: "250K", value: 335000, label: "Conservative" },
  { name: "500K", value: 670000, label: "Target" },
  { name: "750K", value: 1005000, label: "Optimistic" },
];

const tableData = [
  { period: "Year 1", value: "$1.65", comparison: "45% below" },
  { period: "Year 2", value: "$2.06", comparison: "31% below" },
  { period: "Year 3", value: "$2.58", comparison: "14% below" },
];

export default function OnePagerExample() {
  // No useState/useEffect needed for static visualizations
  // This makes the component simpler and more reliable for print

  return (
    <div className="one-pager-page bg-white print:min-h-0">
      {/* Print-optimized container - 8.5x11 inches */}
      <div
        className="one-pager-container mx-auto bg-white"
        style={{ width: "8.5in", height: "11in", padding: "0.35in", overflow: "hidden" }}
      >
        {/* ===== HEADER ===== */}
        <header className="flex items-center justify-between border-b-2 border-[#0066FF] pb-2 mb-3">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Company Logo"
              width={80}
              height={40}
              className="object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Document Title</h1>
              <p className="text-sm text-gray-600">Subtitle | Additional Context</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Key Date</div>
            <div className="text-sm font-semibold text-[#0066FF]">May 2025</div>
          </div>
        </header>

        {/* ===== MAIN CONTENT - 2 COLUMN GRID ===== */}
        <div className="grid grid-cols-2 gap-2">
          {/* ===== LEFT COLUMN ===== */}
          <div className="space-y-2">
            {/* Hero Section - Gradient Background */}
            <section className="bg-gradient-to-br from-[#0066FF] to-[#00D4FF] rounded-lg p-3 text-white">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  Key Value Proposition
                </h2>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded">Target: 500K</span>
              </div>

              {/* KPI Cards Row */}
              <div className="grid grid-cols-3 gap-2 text-[10px] mb-2">
                <div className="bg-white/10 rounded p-1.5 text-center">
                  <div className="text-white/70">Metric 1</div>
                  <div className="text-base font-bold">$670,000</div>
                </div>
                <div className="bg-white/10 rounded p-1.5 text-center">
                  <div className="text-white/70">Metric 2</div>
                  <div className="text-base font-bold">$100,000</div>
                </div>
                <div className="bg-white/10 rounded p-1.5 text-center">
                  <div className="text-white/70">Metric 3</div>
                  <div className="text-base font-bold">$95,680</div>
                </div>
              </div>

              {/* Total Highlight */}
              <div className="bg-white/20 rounded p-2 text-center">
                <div className="text-[10px] text-white/80">Total Value</div>
                <div className="text-2xl font-bold">$865,680</div>
                <div className="text-[9px] text-white/70 mt-0.5">Supporting detail</div>
              </div>
            </section>

            {/* Standard Section - Border Card */}
            <section className="border border-gray-200 rounded-lg p-3">
              <h2 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1">
                <Target className="w-4 h-4 text-[#0066FF]" />
                Section Title
              </h2>
              <ul className="space-y-1 text-[10px] text-gray-700">
                <li className="flex items-start gap-2">
                  <DollarSign className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Key point 1</strong> with supporting detail
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Key point 2</strong> with supporting detail
                  </span>
                </li>
              </ul>
            </section>

            {/* Table Section */}
            <section className="border border-gray-200 rounded-lg p-3">
              <h2 className="text-sm font-bold text-gray-800 mb-2">Data Table</h2>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-1 font-semibold text-gray-600">Period</th>
                    <th className="text-right py-1 font-semibold text-gray-600">Value</th>
                    <th className="text-right py-1 font-semibold text-gray-600">Comparison</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, i) => (
                    <tr key={row.period} className={i === 0 ? "bg-green-50" : ""}>
                      <td className="py-1.5 font-medium text-gray-900">{row.period}</td>
                      <td className="py-1.5 text-right font-bold text-[#0066FF]">{row.value}</td>
                      <td className="py-1.5 text-right text-green-600 font-medium">
                        {row.comparison}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Chart Section - Static Bar Chart */}
            <section className="border border-gray-200 rounded-lg p-3">
              <h2 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-1">
                <BarChart3 className="w-4 h-4 text-[#0066FF]" />
                Chart Title
              </h2>
              <p className="text-[10px] text-gray-600 mb-2">Chart subtitle with context</p>

              {/* Static Bar Chart - No Recharts needed */}
              <div className="h-24 flex items-end justify-around gap-2 border-b border-gray-100">
                {chartData.map((item, index) => {
                  const maxValue = 1100000;
                  const height = (item.value / maxValue) * 100;
                  const colors = ["#22c55e", "#3b82f6", "#8b5cf6"];
                  return (
                    <div key={item.name} className="flex flex-col items-center gap-1 flex-1">
                      <div
                        className="w-full max-w-[30px] rounded-t"
                        style={{ height: `${height}%`, backgroundColor: colors[index] }}
                      />
                      <span className="text-[8px] font-bold text-gray-500">{item.name}</span>
                    </div>
                  );
                })}
              </div>

              {/* Static Legend */}
              <div className="flex justify-center gap-3 mt-2 text-[8px]">
                {chartData.map((item, index) => {
                  const colors = ["#22c55e", "#3b82f6", "#8b5cf6"];
                  return (
                    <div key={item.label} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded" style={{ backgroundColor: colors[index] }} />
                      <span className="text-gray-600">
                        {item.label}: ${(item.value / 1000).toFixed(0)}K
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <div className="space-y-2">
            {/* Colored KPI Grid */}
            <section className="border border-gray-200 rounded-lg p-3">
              <h2 className="text-sm font-bold text-gray-800 mb-2">Key Metrics</h2>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-blue-700">20</div>
                  <div className="text-[10px] text-gray-600">Metric A</div>
                </div>
                <div className="bg-green-50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-green-700">20</div>
                  <div className="text-[10px] text-gray-600">Metric B</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-purple-700">6mg</div>
                  <div className="text-[10px] text-gray-600">Metric C</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-orange-700">12mg</div>
                  <div className="text-[10px] text-gray-600">Metric D</div>
                </div>
              </div>
            </section>

            {/* Highlight Card */}
            <section className="bg-green-50 rounded-lg p-3 border border-green-200">
              <h2 className="text-sm font-bold text-green-800 mb-1">Highlight Section</h2>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-700">8 Units</div>
                  <div className="text-[10px] text-gray-600">Per Location</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-700">6,400 Total</div>
                  <div className="text-xs text-gray-500">$95,680 value</div>
                </div>
              </div>
            </section>

            {/* Terms Table */}
            <section className="border-2 border-[#0066FF] rounded-lg p-3 bg-gradient-to-br from-blue-50/50 to-white">
              <h2 className="text-sm font-bold text-[#0066FF] mb-2 text-center">
                Partnership Terms
              </h2>
              <table className="w-full text-[10px] border-collapse">
                <thead>
                  <tr>
                    <th className="bg-[#0066FF] text-white py-1.5 px-2 rounded-tl font-semibold">
                      We Commit
                    </th>
                    <th className="bg-green-600 text-white py-1.5 px-2 rounded-tr font-semibold">
                      You Approve
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b border-gray-200">
                    <td className="py-1 px-2 bg-blue-50/50">Commitment 1</td>
                    <td className="py-1 px-2 bg-green-50/50">Approval 1</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-1 px-2 bg-blue-50/50">Commitment 2</td>
                    <td className="py-1 px-2 bg-green-50/50">Approval 2</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2 bg-blue-50/50 rounded-bl">Commitment 3</td>
                    <td className="py-1 px-2 bg-green-50/50 rounded-br">Approval 3</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>
        </div>
      </div>

      {/* ===== PRINT STYLES ===== */}
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
          .one-pager-page {
            width: 8.5in !important;
            height: 11in !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .one-pager-container {
            box-shadow: none !important;
            overflow: hidden !important;
          }
        }
        @media screen {
          .one-pager-container {
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            margin: 20px auto;
          }
        }
      `,
        }}
      />
    </div>
  );
}
