// Example Pitch Deck / Educational Presentation Component
// Landscape slides (16:9) with keyboard navigation, designed for screen/projector
//
// NOTE: This example is for SCREEN PRESENTATIONS, not print documents.
// Key differences from print documents:
// - Uses Framer Motion for slide transitions and animations
// - Uses Recharts for interactive charts (tooltips, hover states)
// - Landscape orientation (16:9 or 11x8.5)
// - Keyboard navigation (arrow keys, spacebar, F for fullscreen)
// - Presentation mode with hidden controls
//
// For print documents (8.5x11 PDF), see: one-pager.tsx, multi-page.tsx

"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  CheckCircle,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Zap,
  Lightbulb,
  Rocket,
  BookOpen,
  Code,
  Brain,
  Layers,
  Play,
  Pause,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ===== ANIMATION VARIANTS =====

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
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// ===== SLIDE DATA =====

const slides = [
  { id: "title", type: "title" },
  { id: "problem", type: "content" },
  { id: "solution", type: "content" },
  { id: "how-it-works", type: "diagram" },
  { id: "market", type: "chart" },
  { id: "traction", type: "metrics" },
  { id: "team", type: "team" },
  { id: "ask", type: "cta" },
];

const marketData = [
  { year: "2022", value: 45 },
  { year: "2023", value: 62 },
  { year: "2024", value: 85 },
  { year: "2025", value: 120 },
  { year: "2026", value: 165 },
];

const traction = [
  { label: "Active Users", value: "50K+", icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
  {
    label: "Revenue",
    value: "$2.4M",
    icon: DollarSign,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    label: "Growth Rate",
    value: "340%",
    icon: TrendingUp,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  { label: "NPS Score", value: "72", icon: Target, color: "text-orange-600", bg: "bg-orange-100" },
];

const team = [
  { name: "Jane Doe", role: "CEO & Co-founder", bg: "bg-blue-500" },
  { name: "John Smith", role: "CTO & Co-founder", bg: "bg-indigo-500" },
  { name: "Sarah Johnson", role: "VP of Product", bg: "bg-purple-500" },
  { name: "Mike Chen", role: "VP of Engineering", bg: "bg-pink-500" },
];

// ===== COMPONENT =====

export default function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0); // For slide animation direction
  const [mounted, setMounted] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === " ") {
      e.preventDefault();
      setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsPresenting(true);
    } else {
      document.exitFullscreen();
      setIsPresenting(false);
    }
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };
  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  };
  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className={`min-h-screen bg-gray-900 flex flex-col ${isPresenting ? "cursor-none" : ""}`}>
      {/* ===== CONTROLS BAR (hidden in presentation mode) ===== */}
      {!isPresenting && (
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-white font-semibold">Pitch Deck Presentation</h1>
            <span className="text-gray-400 text-sm">
              Slide {currentSlide + 1} of {slides.length}
            </span>
          </div>

          {/* Slide Navigation Dots */}
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

          <div className="flex items-center gap-3">
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              Present (F)
            </button>
          </div>
        </header>
      )}

      {/* ===== SLIDE CONTAINER ===== */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div
          className="relative bg-white rounded-2xl shadow-2xl overflow-hidden"
          style={{
            width: "1280px",
            height: "720px",
            maxWidth: "100%",
            aspectRatio: "16/9",
          }}
        >
          {/* Slide Content with Animation */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute inset-0"
            >
              {currentSlide === 0 && <TitleSlide />}
              {currentSlide === 1 && <ProblemSlide />}
              {currentSlide === 2 && <SolutionSlide />}
              {currentSlide === 3 && <HowItWorksSlide />}
              {currentSlide === 4 && <MarketSlide mounted={mounted} />}
              {currentSlide === 5 && <TractionSlide />}
              {currentSlide === 6 && <TeamSlide />}
              {currentSlide === 7 && <AskSlide />}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/10 hover:bg-black/20 transition-all ${
              currentSlide === 0 ? "opacity-30 cursor-not-allowed" : "opacity-70 hover:opacity-100"
            }`}
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/10 hover:bg-black/20 transition-all ${
              currentSlide === slides.length - 1
                ? "opacity-30 cursor-not-allowed"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            <ArrowRight className="w-6 h-6 text-gray-700" />
          </button>

          {/* Slide Number */}
          <div className="absolute bottom-4 right-6 text-sm text-gray-400">
            {currentSlide + 1} / {slides.length}
          </div>
        </div>
      </main>

      {/* ===== KEYBOARD HINTS ===== */}
      {!isPresenting && (
        <footer className="bg-gray-800 border-t border-gray-700 px-6 py-2 text-center text-gray-500 text-xs">
          <span className="mr-4">← → Navigate</span>
          <span className="mr-4">Space Next</span>
          <span className="mr-4">F Fullscreen</span>
          <span>ESC Exit</span>
        </footer>
      )}
    </div>
  );
}

// ===== INDIVIDUAL SLIDES =====

function TitleSlide() {
  return (
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
  );
}

function ProblemSlide() {
  return (
    <div className="h-full p-12 flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
          <Target className="w-5 h-5 text-red-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">The Problem</h2>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-6">
        {[
          {
            title: "Pain Point 1",
            desc: "Description of the first major pain point your customers face",
            stat: "73%",
            statLabel: "affected",
          },
          {
            title: "Pain Point 2",
            desc: "Description of the second major pain point that needs solving",
            stat: "$4.2B",
            statLabel: "lost annually",
          },
          {
            title: "Pain Point 3",
            desc: "Description of the third pain point that drives urgency",
            stat: "8hrs",
            statLabel: "wasted weekly",
          },
        ].map((item, i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <div className="text-4xl font-bold text-red-600 mb-1">{item.stat}</div>
            <div className="text-sm text-gray-500 mb-4">{item.statLabel}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-gray-600 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SolutionSlide() {
  return (
    <div className="h-full p-12 flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Our Solution</h2>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-8 items-center">
        <div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            We solve this with [Product Name]
          </h3>
          <ul className="space-y-4">
            {[
              "Key benefit or feature that addresses pain point 1",
              "Key benefit or feature that addresses pain point 2",
              "Key benefit or feature that addresses pain point 3",
              "Unique differentiator that sets you apart",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Product Screenshot Placeholder */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl h-80 flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center text-gray-500">
            <Code className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Product Screenshot</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HowItWorksSlide() {
  return (
    <div className="h-full p-12 flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Layers className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
      </div>

      <div className="flex-1 flex items-center">
        <div className="w-full grid grid-cols-4 gap-4">
          {[
            {
              step: "1",
              title: "Connect",
              desc: "Integrate with your existing tools in minutes",
              icon: Zap,
            },
            {
              step: "2",
              title: "Configure",
              desc: "Set up your preferences and workflows",
              icon: Brain,
            },
            {
              step: "3",
              title: "Analyze",
              desc: "Our AI processes and learns from your data",
              icon: BookOpen,
            },
            {
              step: "4",
              title: "Optimize",
              desc: "Get actionable insights and recommendations",
              icon: Rocket,
            },
          ].map((item, i) => (
            <div key={i} className="relative">
              {/* Connector Arrow */}
              {i < 3 && (
                <div className="hidden md:block absolute top-12 -right-2 w-4 text-gray-300">
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}

              <div className="bg-white border-2 border-gray-100 rounded-xl p-5 text-center hover:border-blue-200 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs text-blue-600 font-semibold mb-1">STEP {item.step}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MarketSlide({ mounted }: { mounted: boolean }) {
  return (
    <div className="h-full p-12 flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Market Opportunity</h2>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-8">
        {/* Chart */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Market Size ($ Billions)</h3>
          <div className="h-64">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marketData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}B`} />
                  <Tooltip formatter={(value) => [`$${value}B`, "Market Size"]} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Loading...
              </div>
            )}
          </div>
        </div>

        {/* Market Stats */}
        <div className="flex flex-col justify-center space-y-6">
          {[
            { label: "Total Addressable Market (TAM)", value: "$165B", desc: "by 2026" },
            {
              label: "Serviceable Addressable Market (SAM)",
              value: "$42B",
              desc: "our target segment",
            },
            { label: "Serviceable Obtainable Market (SOM)", value: "$850M", desc: "5-year goal" },
          ].map((item) => (
            <div key={item.label} className="border-l-4 border-purple-500 pl-4">
              <div className="text-sm text-gray-500">{item.label}</div>
              <div className="text-3xl font-bold text-gray-900">{item.value}</div>
              <div className="text-sm text-purple-600">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TractionSlide() {
  return (
    <div className="h-full p-12 flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Traction & Metrics</h2>
      </div>

      <div className="flex-1 grid grid-cols-4 gap-6">
        {traction.map((item) => (
          <div
            key={item.label}
            className={`${item.bg} rounded-xl p-6 flex flex-col items-center justify-center text-center`}
          >
            <item.icon className={`w-8 h-8 ${item.color} mb-3`} />
            <div className={`text-4xl font-bold ${item.color} mb-1`}>{item.value}</div>
            <div className="text-gray-600 text-sm">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Key Milestones</h3>
        <div className="flex items-center gap-8">
          {[
            { date: "Q1 2024", event: "Product Launch" },
            { date: "Q2 2024", event: "10K Users" },
            { date: "Q3 2024", event: "$1M ARR" },
            { date: "Q4 2024", event: "Series A" },
          ].map((milestone, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <div>
                <div className="text-xs text-gray-500">{milestone.date}</div>
                <div className="font-medium text-gray-900">{milestone.event}</div>
              </div>
              {i < 3 && <ChevronRight className="w-4 h-4 text-gray-300 ml-4" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeamSlide() {
  return (
    <div className="h-full p-12 flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">The Team</h2>
      </div>

      <div className="flex-1 grid grid-cols-4 gap-6">
        {team.map((member) => (
          <div key={member.name} className="text-center">
            <div
              className={`w-28 h-28 ${member.bg} rounded-full mx-auto mb-4 flex items-center justify-center`}
            >
              <span className="text-4xl font-bold text-white">
                {member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
            <p className="text-gray-600 text-sm">{member.role}</p>
            <p className="text-gray-400 text-xs mt-2">Ex-Google, Ex-Stripe</p>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center text-gray-500 text-sm">
        Combined 50+ years of experience in SaaS, AI, and enterprise software
      </div>
    </div>
  );
}

function AskSlide() {
  return (
    <div className="h-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex flex-col items-center justify-center text-white p-12">
      <h2 className="text-5xl font-bold mb-6 text-center">The Ask</h2>

      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 text-center">
        <div className="text-6xl font-bold mb-2">$3M</div>
        <div className="text-xl text-blue-200">Seed Round</div>
      </div>

      <div className="grid grid-cols-3 gap-8 mb-8 text-center">
        {[
          { label: "Use of Funds", items: ["Engineering (50%)", "Sales (30%)", "Marketing (20%)"] },
          { label: "Runway", items: ["18 months", "to Series A"] },
          { label: "Targets", items: ["$5M ARR", "100K users"] },
        ].map((col) => (
          <div key={col.label}>
            <div className="text-blue-200 text-sm mb-2">{col.label}</div>
            {col.items.map((item, i) => (
              <div key={i} className="text-white font-medium">
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-blue-200">Contact:</div>
        <div className="font-semibold">founder@company.com</div>
      </div>
    </div>
  );
}
