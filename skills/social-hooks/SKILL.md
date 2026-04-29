---
name: social-hooks
description: >
  Hook generation library for social media content. Provides 6 proven hook categories,
  emotion-to-hook matching, and a 7-step writing system for creating scroll-stopping
  first lines and slides. Use when writing captions, carousel covers, video intros,
  or any content that needs attention-grabbing openers.
user-invocable: true
---

# social-hooks

Dedicated hook generation library with formulas, templates, and a systematic writing process. Based on analysis of 200M+ high-performing posts (2025-2026 data).

## Metadata

- **Skill ID**: `social-hooks`
- **Version**: 1.0.0
- **Category**: Social Media & Content
- **Dependencies**: `celavii-social`, `brand-identity`

## Why Hooks Matter

- Carousels with strong hooks get **1.9× higher reach** than single-image posts
- First slide/line determines **70% of engagement** outcome
- Average scroll speed: **3-4 posts per second** — you have 0.3 seconds to stop them
- 2026 reality: **save rate + retention rate** beat like rate as virality predictors. Optimize for the 3-second hold. (Reference: [`docs/frameworks.md § 7`](file:///Users/operator/dev/openclaw/.system/features/social-strategy/docs/frameworks.md))

---

## 5 Canonical Archetypes (Phase B18)

Every "X hooks" listicle on the internet traces back to these 5 root archetypes. The 6 tactical categories below are practical instantiations.

| #   | Archetype             | Mechanism                                   | Maps to category                        |
| --- | --------------------- | ------------------------------------------- | --------------------------------------- |
| 1   | **Curiosity Gap**     | Withhold key info; medium gap (Loewenstein) | Curiosity / Cliffhanger                 |
| 2   | **Contrarian Take**   | Challenge conventional wisdom               | Mistake / Myth                          |
| 3   | **Story Hook**        | Narrative cold-open, in-medias-res          | (often combined with Curiosity)         |
| 4   | **Authority Claim**   | Credibility-first, data-led                 | Statistic                               |
| 5   | **Pattern Interrupt** | Contrasting opposites; format break         | (visual-driven; cuts across categories) |

Question hooks + Promise hooks + Step-by-Step lists are tactical _delivery_ formats — they each carry one of the 5 underlying archetypes in their first frame.

When `social-hooks generate` produces variants, each variant is tagged with an archetype + a tactical category, then scored on the 4-axis rubric below.

---

## The 6 Hook Categories

### 1. Question Hooks

**Psychology:** Questions trigger the brain's instinct for completion. Readers feel compelled to find the answer.

**Formula:** `[Provocative question about assumption or common belief]?`

**Examples:**
| Niche | Hook |
|-------|------|
| Career | "Do you really need a college degree in 2026?" |
| Entrepreneurship | "Why is everyone quitting their 9-5 this year?" |
| Fashion | "Is this outfit more confident-looking?" |
| Health | "Are you brushing your teeth wrong?" |
| Productivity | "What do successful people do first on Sunday night?" |
| Pets | "Is your dog stressed? 9 signs most owners miss" |

**Best for:** Educational content, myth-busting, audience engagement

---

### 2. Shock/Statistic Hooks

**Psychology:** Numbers create instant credibility and pattern interruption. The brain can't ignore concrete data.

**Formula:** `[Surprising statistic] + [implication or promise]`

**Examples:**
| Niche | Hook |
|-------|------|
| Business | "87% of side hustles fail in the first year. Here's the 13% that don't." |
| Creator Economy | "I made $48k in 30 days with this faceless Instagram strategy." |
| Social Media | "Instagram is hiding 70% of your posts from followers in 2026." |
| Marketing | "2.2% — The number every marketer needs to know" |
| SaaS | "We increased demo bookings by 340% with one change" |

**Best for:** Authority-building, credibility, data-driven audiences

---

### 3. Promise Hooks

**Psychology:** Clear value proposition reduces cognitive load. Reader knows exactly what they'll get.

**Formula:** `[Specific outcome] + [timeframe or constraint]`

**Examples:**
| Niche | Hook |
|-------|------|
| Fashion | "Save this post: 30 days of outfit ideas for work (no new clothes needed)" |
| Social Media | "How I grew to 100k followers in 6 months without posting reels" |
| Fitness | "The exact morning routine that helped me lose 22 lbs" |
| Productivity | "Steal my Notion template that runs my entire business" |
| Travel | "How to plan a 7-day Italy trip under $1500" |

**Best for:** Tutorials, how-to content, value-packed carousels

---

### 4. Step-by-Step / List Hooks

**Psychology:** Numbered formats signal digestible, actionable content. People love clear structure.

**Formula:** `[Number] + [specific outcome] + [optional constraint]`

**Examples:**
| Niche | Hook |
|-------|------|
| Travel | "How to plan a 7-day Italy trip under $1500 →" |
| Parenting | "5-minute dinner recipes my kids actually eat (swipe for all 10)" |
| Freelance | "From broke to 6-figure freelancer in 9 slides" |
| E-commerce | "Build your first Shopify store in 8 simple steps" |
| Marketing | "The 5-step framework for viral carousels" |

**Best for:** Tutorials, listicles, educational carousels

---

### 5. Mistake / Myth Hooks

**Psychology:** Fear of loss > desire for gain. People are motivated to avoid mistakes.

**Formula:** `The #1 reason your [thing] [fails/gets zero results] + [year]`

**Examples:**
| Niche | Hook |
|-------|------|
| Social Media | "The #1 reason your reels get zero views in 2026" |
| Beauty | "You've been cleaning your makeup brushes wrong your whole life." |
| Fitness | "Why your 'high-protein' meals are actually making you gain weight" |
| Career | "Stop saying these 5 things in salary negotiations" |
| Marketing | "3 Instagram mistakes killing your reach (and what to do instead)" |

**Best for:** Correction content, expertise demonstration, pattern interruption

---

### 6. Curiosity / Cliffhanger Hooks

**Psychology:** Open loops create tension the brain must resolve. Incomplete information demands attention.

**Formula:** `[Intriguing setup]... [promise of resolution] →`

**Examples:**
| Niche | Hook |
|-------|------|
| Personal | "I got fired last week… here's what happened next →" |
| Photography | "This one slide changed how I edit photos forever." |
| Fashion | "My boyfriend thought this dress was ugly… 2.1M people disagreed" |
| General | "Wait until slide 7. You won't believe it." |
| Business | "The email that landed me a $50k client (screenshot inside)" |

**Best for:** Story-driven content, emotional engagement, high swipe-through

---

## Hook-to-Emotion Mapping

Match your hook type to the primary emotion you want to trigger:

| Emotion        | Best Hook Type | Why It Works                                  |
| -------------- | -------------- | --------------------------------------------- |
| **Fear**       | Mistake/Myth   | Loss aversion is 2× more motivating than gain |
| **Greed**      | Promise        | Clear ROI appeals to self-interest            |
| **Curiosity**  | Cliffhanger    | Open loops demand resolution                  |
| **Validation** | Question       | People want confirmation of beliefs           |
| **FOMO**       | Statistic      | Numbers create urgency                        |
| **Aspiration** | Step-by-Step   | Clear path to desired outcome                 |

---

## The 7-Step Hook Writing System

A repeatable process used by top creators for consistent results:

### Step 1: Identify the Burning Pain or Desire

Check comments, DMs, search bar for what your audience actually wants.

**Ask:** "What keeps my audience up at night?"

### Step 2: Choose ONE Specific, Measurable Outcome

Vague outcomes = vague hooks. Be concrete.

❌ "Grow your Instagram"  
✅ "Get 10k followers in 90 days"

### Step 3: Match Hook Type to Emotion

Use the Hook-to-Emotion table above.

### Step 4: Write 10 Versions in 10 Minutes

No filtering yet. Quantity first, quality second.

### Step 5: Cut Every Unnecessary Word

Read aloud. If you pause, delete. Every word must earn its place.

**Before:** "In this carousel, I'm going to show you the exact steps that I used to grow my account"  
**After:** "How I grew to 100k followers →"

### Step 6: Apply the "Would I Stop?" Test

Ask brutally: "Would I stop mid-scroll and swipe for this?"

If no → rewrite.

### Step 7: Pair with High-Contrast Visual

The hook and image must work together. Use:

- Bold, large typography
- Contrasting colors
- Face (if personal brand)
- Pattern interruption

---

## Hook Optimization Checklist

Before posting, verify:

- [ ] **Specific** — Contains a number, timeframe, or concrete outcome
- [ ] **Emotional** — Triggers fear, greed, curiosity, or aspiration
- [ ] **Concise** — Under 15 words (ideal: 8-12)
- [ ] **First-person or direct** — "I" or "You" (not passive voice)
- [ ] **No filler** — No "In this post" or "Today I want to share"
- [ ] **Platform-appropriate** — Matches audience expectations
- [ ] **Paired with visual** — Image reinforces the hook

---

## Platform-Specific Hook Patterns

### Instagram (Carousel Cover)

- Large, bold text (3-7 words max on image)
- High-contrast colors
- Hook continues in caption first line

### Twitter/X (Thread Opener)

- Full hook in first tweet (under 280 chars)
- Often starts with stat or provocative claim
- "🧵" or "Thread:" signals value

### TikTok/Reels (First 3 Seconds)

- Spoken hook in first 2 seconds
- Text overlay reinforces audio
- Pattern interrupt (movement, face, unusual angle)

### LinkedIn (First Line)

- Professional tone but still provocative
- Often uses "I" statements or contrarian takes
- Hook must work before "see more" truncation

---

## A/B Testing Hooks

**Method:** Test 2 different hooks on the same content.

**What to measure:**

- Instagram: Swipe-through rate, saves
- Twitter: Engagement rate, impressions
- TikTok: Watch time, loop rate

**Typical lift:** Winners get **2-4× higher reach** than losers.

---

## Anti-Patterns (What NOT to Do)

| Anti-Pattern                  | Why It Fails               | Fix                       |
| ----------------------------- | -------------------------- | ------------------------- |
| "In this post, I'll share..." | Filler, no value           | Jump straight to the hook |
| "Happy Monday everyone!"      | Generic, no stopping power | Lead with value           |
| Clickbait with no payoff      | Destroys trust             | Deliver on the promise    |
| Too clever/punny              | Clarity beats cleverness   | Be direct                 |
| No specificity                | Vague = forgettable        | Add numbers, timeframes   |
| Passive voice                 | Weak, impersonal           | Use "I" or "You"          |

---

## Hook Templates by Content Type

### Carousel (Educational)

```
Cover: [Statistic or Question Hook]
Slide 2: "Here's what most people get wrong..."
Slides 3-7: The actual value
CTA: "Save this for later"
```

### Thread (Story)

```
Tweet 1: [Curiosity Hook] + "A thread 🧵"
Tweet 2-7: Story unfolds
Final: CTA + takeaway
```

### Reel/TikTok (Quick Tip)

```
0-2s: [Mistake Hook] "Stop doing X"
3-15s: Why it's wrong
16-25s: What to do instead
26-30s: CTA
```

---

## Integration with celavii-social

When generating content via `celavii-social`, reference this skill for hook selection:

1. Identify the content silo (analytics, platform, ai-agentic, network-intel, industry, competitors)
2. Match silo to primary emotion:
   - Analytics → Trust (use Statistic hooks)
   - Network-intel → Curiosity (use Cliffhanger hooks)
   - Competitors → FOMO (use Promise hooks)
3. Generate 3-5 hook options using the 7-step system
4. A/B test top 2 performers

---

## References

- Resont 2026 Instagram Carousel Analysis (200M+ posts)
- PostNitro Carousel Copywriting Framework (AIDA)
- Buffer Content Repurposing Guide
- Hootsuite Digital Trends 2025
- Later 2025 Social Media Benchmark Report
- [Opus.pro — TikTok Hook Formulas](https://www.opus.pro/blog/tiktok-hook-formulas) — 3-second hold metric
- [Justin Welsh — Anatomy of a Viral LinkedIn Post](https://www.justinwelsh.me/newsletter/the-anatomy-of-a-viral-linkedin-post)
- [Mewse — Curiosity Hooks (Loewenstein information gap)](https://mewse.ai/curiosity-hooks)

---

## Phase B18 — Modes + CLI

### Mode A — Generate variants from a brief

```bash
social-hooks generate --brief content/social/briefs/celavii-tt-001-brief.md \
  --archetypes all --count 5
```

Output (saved alongside brief at `content/social/briefs/celavii-tt-001-hooks.md`):

```markdown
## Hook Variants — celavii-tt-001

### Variant 1 — Curiosity Gap (tactical: Statistic)

> "I scored 5K creator profiles. The #1 fake-follower tell isn't what you think."

- Specificity: 8/10 (concrete number, named action)
- Gap size: medium ✓
- Archetype clarity: 9/10
- 3s-hold prediction: 0.72
- Score: 8.0
```

### Mode B — Score an existing hook

```bash
social-hooks score --text "Most agencies are wrong about creator analytics. Here's why."
```

### Mode C — Extract archetypes from competitor posts

Used by `social-aggregate` Phase 3 — given competitor hooks (extracted by `social-competitor-scrape`), tag with archetype and surface dominant archetypes per competitor.

```bash
social-hooks extract --raw raw/celavii-modaberlin-tiktok-posts-*.json
```

### 4-Axis Scoring Rubric

| Axis                              | Weight | Method                                                              |
| --------------------------------- | ------ | ------------------------------------------------------------------- |
| Specificity                       | 30%    | Real numbers + named entities + concrete examples (≥3 = full score) |
| Gap-size (Curiosity / Contrarian) | 25%    | Medium ideal; too obvious = low, too cryptic = low                  |
| Archetype clarity                 | 20%    | Single dominant archetype, not a muddle                             |
| 3s-hold prediction                | 25%    | Heuristic: first 3 words contain (number, verb, name) → high        |

### Anti-Slop Filter (Constitution Article 5)

Reject any hook containing forbidden phrases or AI-slop tells from `~/dev/workspace/.styles/celavii/voice.json`. Hard-fail on: "delve", "tapestry", "harness the power", "navigate the landscape", "in conclusion", "in today's fast-paced".

### Channel Voice Override

Hooks adopt channel voice (`~/dev/workspace/.styles/celavii/voice.json#channel_overrides`):

- **Elioth**: first-person, candid → favor Story + Authority
- **Celavii**: educational, data-rich → favor Authority + Curiosity Gap
- **CutMaster**: snappy, demo-driven → favor Pattern Interrupt + Contrarian

### Integration

- Called by `social-brief` Mode B (generate hook variants)
- Called by `social-aggregate` Mode E (extract archetypes from competitor data)
- Output consumed by Gate C scoring (`social-quality`)
- Feeds `state.phases.analyze.patterns.{competitor}.common_hooks`

### Status

- [x] Pre-existing 6-category framework (kept as tactical catalog above)
- [x] 5-archetype foundation layer (added Phase B18)
- [x] 4-axis scoring rubric documented
- [ ] `scripts/score_hook.py` — 4-axis scorer (Phase B18.1)
- [ ] `scripts/generate_variants.py` — LLM-driven variant generator (Phase B18.1)
- [ ] Smoke test against 10 sample briefs (Phase B18.2)
