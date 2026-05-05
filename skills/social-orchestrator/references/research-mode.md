# Research Mode (API-disabled fallback)

> **Surfaced from**: cutmasterai dry-run, 2026-05-04. Phase 0 + Phase 1 ran without Celavii API access; the agent fell back to web search + manual analysis. The fallback worked but was not documented as a first-class mode, so Gate A had no way to know its inputs were qualitative estimates rather than measurements.
>
> **The rule**: when the pipeline can't reach its primary data source (Celavii API, YouTube Data API, etc.), it runs in **research mode** — and every state write tags itself accordingly so downstream consumers (gates, plan, deliver) can adjust expectations.

## Detection

Research mode activates when ANY of:

- `CELAVII_API_KEY` is unset or `state.notes[].celavii_api == "disabled"` is present
- The platform's adapter is gated (e.g., YouTube adapter not yet enabled per Phase H-YT)
- A scrape call returns 401/403/quota_exceeded and no fallback API is configured

The orchestrator detects at phase start, sets `state.run_mode = "research"`, and emits a Telegram banner: "⚠️ Running in research mode — outputs are qualitative estimates, not live measurements."

## What changes per phase

| Phase                | Real-API behavior                                               | Research-mode behavior                                                                                                                                                                                                                                                                                                                                                 |
| -------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1 Resolve          | YouTube Data API `channels.list?forHandle=...`                  | Manual: web search + URL probing. Outputs `handle_available: bool` derived from search results.                                                                                                                                                                                                                                                                        |
| 0.2 Profile baseline | Scrape API → JSON                                               | Skipped (no measurement possible)                                                                                                                                                                                                                                                                                                                                      |
| 0.3 Last-N posts     | Scrape API → JSON                                               | Skipped (no measurement possible)                                                                                                                                                                                                                                                                                                                                      |
| 0.4 Hashtag seeds    | `social-discover hashtag` Tier 0                                | Manual: web search across differentiators; output is a category/hashtag _map_, not scrape data                                                                                                                                                                                                                                                                         |
| 0.5a Comp discovery  | `social-discover competitor-discover` Mode F (4-factor scoring) | Manual: web search × 5 queries; agent applies the 4-factor heuristic by reasoning, not by computing                                                                                                                                                                                                                                                                    |
| 0.5 Comp baselines   | `social-competitor-scrape baseline`                             | Skipped or qualitative-only (visible from public web). Strength/velocity values are estimates, not z-scores.                                                                                                                                                                                                                                                           |
| 1 DISCOVER           | 15-parallel subagents reading scrape JSONs                      | Inline (per Patch E if matrix ≤2). Trend signals from web search; competitive format analysis from research; format best practices from public articles                                                                                                                                                                                                                |
| 2 ANALYZE            | Tag top-25 competitor posts by archetype + 4E (deterministic)   | Tag _exemplar_ posts the agent finds via search; sample is small (3–5 per competitor) and biased toward what's discoverable                                                                                                                                                                                                                                            |
| 3 AGGREGATE          | Deterministic Python script (`aggregate.py`) over scrape data   | `aggregate.py --research-mode` (Patch H, Phase B12.1) — synthesizes pillars from `discover.{competitive_format_analysis, trend_signals_seed, projections}` + `analyze` + `intake.differentiators`. Pillar scoring: differentiator coverage 0.4 + whitespace 0.3 + format fit 0.3. Cannibalization = `"N/A"`. See `commands/social-strategy.md` § Phase 3 Research mode |
| 4 PLAN               | Cadence + topic plan from baselines                             | Cadence + topic plan from projections (per Patch F). No baseline anchor; rely heavily on intake.differentiators                                                                                                                                                                                                                                                        |
| Gate A               | Cite `baselines[]`, `competitors_per_channel[].handles[]`       | Cite `projections[]` + `competitors_per_channel[].handles[]`. Score the consistency of projections vs intake; do NOT score "gap" between baseline and goal (there is no baseline).                                                                                                                                                                                     |
| Gate B               | Cadence check vs measured posting frequency                     | Cadence check vs Article 9 thresholds only (no measured comparison)                                                                                                                                                                                                                                                                                                    |

## State writes

Every state write under research mode adds a metadata block:

```jsonc
state.phases.{name}.research_mode_metadata = {
  mode: "research",
  reason: "celavii_api_disabled" | "youtube_adapter_pending" | "quota_exceeded",
  primitives_used: ["web_search", "web_fetch", "manual_reasoning"],
  confidence: "qualitative",        // never "measured"
  query_count: 5,                   // for cost estimation only
  caveats: [
    "trend strength values (strong/rising/confirmed) are agent estimates, not z-scores",
    "competitor 4E mix is reasoning-derived, not tagged from real posts"
  ]
}
```

Consumers (Gate A, Phase 4 PLAN, Phase 6 REPORT) MUST check `research_mode_metadata.confidence` and adjust:

- `measured` → quantitative claims allowed ("Cutmaster ER is 4.1%")
- `qualitative` → qualitative claims only ("Faceless channels are growing — research-mode estimate, not measured")
- absent → assume measured (legacy data)

## What the report says

Phase 6 REPORT must surface research-mode caveats prominently in the executive summary:

> **Note**: This strategy was generated in research mode. Trend signals, competitor metrics, and engagement projections are qualitative estimates derived from public web research, not live API measurements. Re-running this strategy with `CELAVII_API_KEY` enabled will produce quantitative baselines and improve confidence on cadence + format recommendations.

## Anti-patterns

- ❌ Running research mode silently — banner + metadata are mandatory, otherwise downstream consumers can't tell quantitative from qualitative
- ❌ Citing research-mode estimates as measurements ("Cutmaster has 4.1% ER" — no, the _agent estimates_ the YouTube AI-editing category averages 4.1% ER based on three exemplar channels, none of which are Cutmaster)
- ❌ Skipping Gate A in research mode — the gate is _more_ important here, not less. The constitution still applies; the citations just come from `projections[]` instead of `baselines[]`.
- ❌ Treating research mode as "good enough for production" — it's a dry-run / pre-launch / API-down fallback. The strategy should be re-run against real APIs before steady-state weekly cycles begin.
