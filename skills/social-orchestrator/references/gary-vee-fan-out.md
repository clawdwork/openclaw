# Gary Vee Reverse Pyramid (D21)

Per [docs/frameworks.md § 4](file:///Users/operator/dev/openclaw/.system/features/social-strategy/docs/frameworks.md). One long-form pillar → 12–15 atomic outputs, each format-native to its destination channel. Phase 4 PLAN enforces minimum fan-out; Gate B rejects calendars that violate.

## The rule

> Every long-form pillar must spawn **≥8 atomic outputs** with explicit per-channel formatting.

A "pillar" = a long-form blog post, podcast episode, YouTube long-form, or research deck. An "atomic output" = a single calendar entry (per format-as-channel rule, D20).

## Default fan-out targets

For a Celavii 1500-word blog pillar:

| Atomic output                            | Format              | Channel   | Platform  |
| ---------------------------------------- | ------------------- | --------- | --------- |
| Hero stat as standalone hook             | reel                | celavii   | instagram |
| Three sub-points as carousel             | carousel            | celavii   | instagram |
| Counter-intuitive insight as opener      | tiktok-video        | celavii   | tiktok    |
| Methodology breakdown                    | thread (5–7 tweets) | celavii   | x         |
| Demo of the concrete tool/output         | yt-short            | celavii   | youtube   |
| Founder POV ("why I think this matters") | reel                | elioth    | instagram |
| Founder rant version                     | tiktok-video        | elioth    | tiktok    |
| Behind-the-scenes how-it-was-built       | yt-short            | cutmaster | youtube   |

= 8 atomic outputs minimum. A fully-realized pillar typically generates 12–15 (multiple sub-claims each spawn their own variant).

## Pillar registration

Each pillar gets a `pillar_id` written to `state.phases.plan.pillars[]`:

```jsonc
{
  "pillar_id": "p-001-agentic-marketing",
  "source": "blog/agentic-shift-final.mdx",
  "source_type": "blog",
  "atomic_count_target": 12,
  "atomic_count_planned": 12,
  "atomic_count_published": 0,
  "spawned_post_ids": ["celavii-ig-carousel-001", "celavii-ig-reel-001", ...]
}
```

If a pillar has `atomic_count_planned < 8` → Gate B fails the calendar with reason "Pillar p-001 underutilized — only N atomic outputs spawned, ≥8 required".

## Sequencing

Atomic outputs from the same pillar must NOT all ship in the same week (audience fatigue). Default sequencing:

- Week 1: 3 atomic outputs (cold open + main thesis + counter-intuitive)
- Week 2: 4 atomic outputs (methodology + demo + founder versions)
- Week 3: 3 atomic outputs (BTS + closing arguments + community ask)
- Week 4+: re-spawns from comments/questions surfaced during weeks 1–3

This creates a 4-week pillar cycle that aligns with `social-curate week=YYYY-Wnn` weekly runs.

## What counts as a "pillar"

| Eligible                     | Not eligible        |
| ---------------------------- | ------------------- |
| Long-form blog (≥1500 words) | Single-tweet musing |
| Podcast episode (≥20 min)    | Comment thread      |
| YouTube long-form (≥8 min)   | One-off TikTok      |
| Research deck / whitepaper   | Newsletter blast    |
| Conference talk transcript   | Standalone meme     |

A non-pillar atomic post can still ship — it just doesn't trigger the fan-out rule.

## Cross-pillar pollination

If two pillars have cosine ≥0.70 in `social-aggregate.cannibalization_clusters`, they're warned at PLAN time as overlapping. User can:

1. Merge them into one pillar with combined fan-out (≥12 atomic outputs)
2. Differentiate via explicit angle splits (one pillar = "what", other = "how")
3. Schedule one for next quarter (skip current cycle)

## Repurposing-loop validity (Gate B check)

Gate B's "repurposing-loop validity" check verifies:

1. Every `pillar_id` in `state.phases.plan.pillars[]` has ≥8 entries in `publication_calendar` referencing it
2. Every `publication_calendar` entry has a `pillar_id` that exists in `state.phases.plan.pillars[]` (no orphans)
3. No pillar's atomic outputs are all on the same platform (must span ≥3 platforms for cross-pollination credit)

Violations fail Gate B with the specific pillar_id and the missing-axis named.
