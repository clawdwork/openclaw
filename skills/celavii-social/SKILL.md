---
name: celavii-social
description: >
  Orchestrates Celavii social media content lifecycle — from strategy state to published posts.
  Handles content planning, copy generation, media prompt creation, scheduling, and state tracking.
  Use when creating social posts, generating carousel copy, preparing media assets, or managing
  the Celavii social calendar.
user-invocable: true
---

# celavii-social

End-to-end social media content orchestration for Celavii. Combines the social strategy state, brand guidelines, media generation, and publishing workflow into a unified skill.

## Metadata

- **Skill ID**: `celavii-social`
- **Version**: 1.1.0
- **Category**: Social Media & Content
- **Dependencies**: `brand-identity`, `media-content/image-prompting`, `media-content/creative-direction`, `nano-banana-pro`

## Brand Assets

| Asset            | Path                                                                                                    | Description                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **Logo (Local)** | `~/dev/workspace/projects/celavii/assets/brand/celavii-logo.jpg`                                        | Official Celavii logo (Elephant in 'C' gradient) |
| **Logo (CDN)**   | `https://abzkebevxtauyijetrif.supabase.co/storage/v1/object/public/public-assets/hero/celavii-logo.png` | Web-hosted version                               |
| **Brand Guide**  | `~/dev/workspace/projects/celavii/assets/brand/BRAND-GUIDE.md`                                          | Full brand specifications                        |
| **Brand JSON**   | `~/dev/workspace/projects/celavii/assets/brand/brand.json`                                              | Machine-readable brand tokens                    |

## State File

All social strategy state is tracked in:

```
~/agent-workspace/projects/celavii/research/social/social-strategy-state.json
```

**Always read this file first** to understand current status, content queue, and platform configs.

## Core Workflow

```
1. READ STATE    → Load social-strategy-state.json
2. IDENTIFY      → What content is needed? (queue, calendar, user request)
3. GENERATE COPY → Caption, slides, hashtags per platform
4. GENERATE MEDIA PROMPTS → Image/video prompts using media-content skills
5. EXECUTE MEDIA → Run nano-banana-pro or veo3-gen
6. SAVE ASSETS   → To projects/celavii/content/social/ and media/generated/
7. UPDATE STATE  → Mark posts as ready/scheduled/published
```

---

## Command: Generate Social Post

**Triggers:**

- "create an instagram post about [topic]"
- "generate social content for [silo]"
- "prepare the next post in the queue"
- "make a carousel about [concept]"

### Step 1: Load Context

```bash
# Read state file
cat ~/agent-workspace/projects/celavii/research/social/social-strategy-state.json

# Read brand voice
cat ~/agent-workspace/projects/celavii/README.md
```

### Step 2: Identify Content Type

#### Platform Dimensions (Social)

| Platform  | Primary Formats        | Dimensions           |
| --------- | ---------------------- | -------------------- |
| Instagram | Carousel, Reel, Single | 1080x1080, 1080x1920 |
| TikTok    | Video                  | 1080x1920            |
| X/Twitter | Thread, Single, Image  | 1200x675             |
| Threads   | Text + Image           | 1080x1080            |

#### Blog Image Dimensions (MANDATORY — do NOT use social dimensions for blog assets)

| Asset Type              | Dimensions   | Aspect Ratio | Use Case                                                                            |
| ----------------------- | ------------ | ------------ | ----------------------------------------------------------------------------------- |
| Blog hero / cover image | **1200x630** | **1.91:1**   | OpenGraph, Twitter Card, Google Discover. This is the `coverImage` in frontmatter.  |
| Blog inline graphic     | **1200x675** | **16:9**     | In-article images between H2 sections. Optimized for readability on mobile/desktop. |
| Open Graph fallback     | 1200x630     | 1.91:1       | Required for social sharing previews.                                               |

**Rule:** When generating images for blog posts, ALWAYS use blog dimensions (1200x630 for hero, 1200x675 for inline). Never generate 1080x1080 square images for blog use. Square images are for social platforms only.

**Reference:** `skills/blogger/references/visual-media.md`, `research/seo/blog/image-specs-2026.md`

### Step 3: Generate Copy

Use the **Copy Generation Template** below. Save to:

```
~/agent-workspace/projects/celavii/content/social/{platform}-{post-id}-{type}.md
```

### Step 4: Generate Media Prompts

For each visual asset needed, craft prompts using `media-content/image-prompting`:

**Brand Visual Guidelines (from brand-identity):**

- Primary gradient: `#0066FF` → `#00D4FF` (Blue→Cyan)
- Hero gradient: `#F97316` → `#EC4899` → `#A855F7` (Orange→Pink→Purple)
- Background: Dark gradient `#0f172a` → `#1e293b`
- Typography: Inter (bold for headers)
- Style: Clean, data-forward, minimal icons, network graph aesthetics

**Standard Celavii Image Prompt Structure:**

```
[Format: carousel slide / social graphic / blog hero / blog inline], Celavii brand style,
[Subject: concept visualization], dark gradient background (#0f172a to #1e293b),
blue-cyan accent lighting (#0066FF to #00D4FF), clean minimalist design,
Inter typography, [specific elements], editorial tech aesthetic,
high contrast, sharp focus, [DIMENSIONS — see table above]
```

**Dimension selection (MANDATORY):**

- Social post → `1080x1080px`
- Social story/reel → `1080x1920px`
- X/Twitter image → `1200x675px`
- Blog hero/cover → `1200x630px` (1.91:1)
- Blog inline → `1200x675px` (16:9)

### Step 5: Execute Media Generation

#### Standard Image Generation

```bash
# Image generation via nano-banana-pro
uv run ~/.openclaw/skills/nano-banana-pro/scripts/generate_image.py \
  --prompt "your crafted prompt" \
  --filename "./media/generated/social/ig-post-001-slide-1.png" \
  --resolution 1K
```

#### Branded Asset Generation (Logo Required)

**When to use:** CTA slides, brand announcement posts, slides marked `branded: true`, or any visual that requires the Celavii logo.

**Logo Preservation Rules:**

1. **Always pass logo as reference** via `-i` flag
2. **Add preservation clause** to prompt: `incorporate the provided Celavii logo exactly as-is, do not redraw, stylize, or alter the elephant iconography`
3. **Position guidance**: Place logo in lower-right corner or centered footer area
4. **Never apply to**: Hero images, inline blog graphics, abstract visualizations (unless explicitly branded)

```bash
# Branded image generation with logo injection
uv run ~/.openclaw/skills/nano-banana-pro/scripts/generate_image.py \
  --prompt "CTA slide, Celavii brand style, dark gradient background (#0f172a to #1e293b), incorporate the provided Celavii logo exactly as-is without modification, do not redraw or alter the logo, place logo centered in lower third, 'CELAVII.COM' text below logo, Inter bold typography, blue-cyan accent glow, 1080x1080px" \
  --filename "./media/generated/social/ig-post-001-slide-cta.png" \
  -i ~/dev/workspace/projects/celavii/assets/brand/celavii-logo.jpg \
  --resolution 1K
```

**Decision Tree:**

| Asset Type             | Logo Required? | Use `-i` flag? |
| ---------------------- | -------------- | -------------- |
| CTA/Brand Slide        | ✅ Yes         | ✅ Yes         |
| Cover Slide (branded)  | ✅ Yes         | ✅ Yes         |
| Announcement Post      | ✅ Yes         | ✅ Yes         |
| Abstract Network Graph | ❌ No          | ❌ No          |
| Dashboard Mockup       | ❌ No          | ❌ No          |
| Comparison Graphic     | ❌ No          | ❌ No          |
| Blog Hero Image        | ❌ No          | ❌ No          |

### Step 6: Save and Update State

1. Save copy file to `content/social/`
2. Save media to `media/generated/social/`
3. Update `social-strategy-state.json`:
   - Set post `status` to `"ready"`
   - Add `copy_file` path
   - Add `asset_path` for each media file
   - Set `copy_ready_at` timestamp

---

## Copy Generation Templates

### Instagram Carousel

```markdown
# Instagram Carousel: [Title]

**Post ID:** ig-post-[NNN]
**Platform:** Instagram (Carousel)
**Silo:** [silo from strategy]
**Status:** Ready for Design
**Created:** [YYYY-MM-DD]

---

## Caption

[Hook line - attention grabber]

[Body - 3-5 lines of value, use line breaks and arrows →]

[CTA - clear action]

.
.
.
[11 hashtags: 2 branded + 5 industry + 3 silo + 1 trending]

---

## Slide Content

### Slide 1 (Cover)

**Visual:** [description]
**Text:**
```

[Cover text - hook]

```

### Slide 2-N
**Visual:** [description]
**Text:**
```

[Slide content]

```

### Slide N (CTA)
**Visual:** [brand elements]
**Text:**
```

[CTA text]
CELAVII
Creator Intelligence Platform

```

---

## Design Notes

- **Color palette:** #0066FF, #00D4FF, dark gradients
- **Font:** Inter (bold headers, regular body)
- **Dimensions:** 1080x1080px per slide
```

### X/Twitter Thread

```markdown
# X Thread: [Title]

**Post ID:** x-post-[NNN]
**Platform:** X/Twitter
**Silo:** [silo]
**Status:** Ready
**Created:** [YYYY-MM-DD]

---

## Thread

### Tweet 1 (Hook)

[Attention-grabbing opener - question, stat, or bold claim]

### Tweet 2-N

[Value tweets - one clear point per tweet]

### Tweet N (CTA)

[Clear call-to-action with link]

Try it free → celavii.com/[path]

---

## Hashtags (reply to thread)

[3-5 hashtags only for Twitter]

---

## Image (Tweet 1)

**Prompt:** [image generation prompt]
**Dimensions:** 1200x675px
```

### TikTok/Reel Script

```markdown
# Video Script: [Title]

**Post ID:** [platform]-post-[NNN]
**Platform:** TikTok / Instagram Reels
**Silo:** [silo]
**Duration:** [X seconds]
**Status:** Draft
**Created:** [YYYY-MM-DD]

---

## Script

### Hook (0-3s)

**Visual:** [what's on screen]
**Audio:** [what's said/heard]
**Text overlay:** [on-screen text]

### Problem (3-10s)

**Visual:** [description]
**Audio:** [narration]
**Text overlay:** [key point]

### Solution (10-25s)

**Visual:** [demo/explanation]
**Audio:** [narration]
**Text overlay:** [key points]

### CTA (25-30s)

**Visual:** [brand + action]
**Audio:** [call to action]
**Text overlay:** Link in bio

---

## Captions (for feed)

[Caption text with hashtags]

---

## Audio Notes

- Music: [suggested track/vibe]
- VO style: [tone - conversational, authoritative, etc.]
```

---

## Content Silos Reference

From `social-strategy-state.json`:

| Silo          | Focus                     | Primary Hashtags                                       |
| ------------- | ------------------------- | ------------------------------------------------------ |
| analytics     | Trust & Verification      | #FakeFollowerChecker #EngagementRate #CreatorAnalytics |
| platform      | Ease of use & Integration | #InfluencerPlatform #MarketingTools #CreatorCRM        |
| ai-agentic    | The Future                | #AgenticMarketing #AIMarketing #FutureOfMarketing      |
| network-intel | Proprietary Methodology   | #ThreeCircles #CreatorNetwork #AudienceOverlap         |
| industry      | Thought Leadership        | #InfluencerMarketing #CreatorEconomy #2026Trends       |
| competitors   | Comparison & Conversion   | #ModashAlternative #PlatformComparison                 |

---

## Hashtag Formula

```
2 Branded      → #Celavii #CreatorIntelligence
5 Industry     → #socialmediamarketing #digitalmarketing #influencermarketing #contentcreator #marketingtips
3 Silo         → [from silo table above]
1 Trending     → [current trend if applicable]
─────────────────────────────────────────────
Total: 11 hashtags (Instagram) / 3-5 (Twitter)
```

---

## Brand Voice Rules

From `social-strategy-state.json` → `meta.brand_voice`:

### Tone

- Authoritative
- Data-forward
- Future-proof
- Anti-gatekeeping

### Positioning

- "Intelligence-Agency-for-Marketers"
- Speed layer: Agent/Chat
- Depth layer: Dashboard/CRM

### Forbidden Phrases

- ❌ "best in class"
- ❌ "all-in-one dashboard"
- ❌ "toggle tax" (except deep-form content)

### Preferred Terms

- dashboard → "unified platform"
- all-in-one → "fluid workflow"
- AI-powered → "agentic"

---

## Media Prompt Patterns

> **Note:** All patterns below use `[DIMENSIONS]` as a placeholder. Replace with the correct dimensions for your target:
>
> - Social (IG/Threads): `1080x1080px`
> - Social (X/Twitter): `1200x675px`
> - Blog hero: `1200x630px`
> - Blog inline: `1200x675px`

### Network Graph (Three Circles)

```
Abstract network visualization, Celavii brand style,
interconnected nodes representing creator relationships,
three overlapping circles in blue (#0066FF), cyan (#00D4FF), and purple (#A855F7),
glowing connection lines, dark gradient background (#0f172a to #1e293b),
data visualization aesthetic, clean minimalist design,
subtle particle effects, high contrast, editorial tech style,
[DIMENSIONS], sharp focus
```

### Dashboard/Platform UI

```
Modern SaaS dashboard mockup, Celavii brand style,
dark mode interface, creator analytics display,
engagement metrics visualization, blue accent highlights (#0066FF),
clean card layouts, Inter typography, glass morphism effects,
professional tech aesthetic, [DIMENSIONS]
```

### Comparison Graphic

```
Split comparison graphic, Celavii brand style,
left side: red X marks and legacy dashboard chaos,
right side: green checkmarks and clean Celavii interface,
dark gradient background, blue-cyan accent lighting,
minimalist iconography, Inter bold typography,
high contrast, editorial tech aesthetic, [DIMENSIONS]
```

### AI/Agentic Visual

```
Abstract AI agent visualization, Celavii brand style,
glowing neural pathways connecting to chat interface,
autonomous workflow representation, blue-cyan energy flows,
dark gradient background (#0f172a), futuristic tech aesthetic,
clean lines, particle effects, editorial style,
[DIMENSIONS], high contrast
```

---

## Weekly Calendar Integration

From `social-strategy-state.json` → `phases.plan.publication_calendar`:

| Day       | Focus            | Silo        |
| --------- | ---------------- | ----------- |
| Monday    | Utility Hook     | analytics   |
| Wednesday | Future Shift     | ai-agentic  |
| Friday    | Competitive Edge | competitors |

---

## State Update Pattern

After generating content, update `social-strategy-state.json`:

```json
{
  "id": "ig-post-003",
  "status": "ready",
  "copy_ready_at": "2026-03-10T10:50:00Z",
  "copy_file": "content/social/ig-post-003-engagement-rate-carousel.md",
  "asset_paths": [
    "media/generated/social/ig-post-003-slide-1.png",
    "media/generated/social/ig-post-003-slide-2.png"
  ],
  "scheduled_for": null,
  "published_at": null
}
```

---

## Cross-References

| Need                            | Skill                                          |
| ------------------------------- | ---------------------------------------------- |
| Image generation prompts        | `media-content/image-prompting`                |
| Video generation prompts        | `media-content/video-prompting`                |
| Creative direction/alternatives | `media-content/creative-direction`             |
| Execute image generation        | `nano-banana-pro`                              |
| Execute video generation        | `veo3-gen`, `sora2-gen`                        |
| Brand colors/fonts              | `brand-identity`                               |
| Audience insights for content   | `celavii-analytics`                            |
| Hashtag research                | `celavii-discover` (hashtag creators endpoint) |

---

## Output Locations

| Asset Type       | Path                                                                            |
| ---------------- | ------------------------------------------------------------------------------- |
| Copy files       | `~/agent-workspace/projects/celavii/content/social/`                            |
| Generated images | `~/agent-workspace/projects/celavii/media/generated/social/`                    |
| Strategy state   | `~/agent-workspace/projects/celavii/research/social/social-strategy-state.json` |

---

## Notes

- **Always read state first** — the content queue drives what to create
- **Follow brand voice strictly** — forbidden phrases will damage positioning
- **Update state after every action** — keeps the pipeline in sync
- **Generate multiple options** — offer 2-3 creative directions for visuals
- **Use the 11-hashtag formula** — consistency builds discoverability
