# Run-ID Derivation (Patch N)

> **Why**: Every `/social_strategy` invocation produces a state file plus dozens of artifacts. Without per-run scoping, a second invocation for the same project (different channel or platform, or a re-run later) silently overwrites the first. Patch N derives a deterministic `run_id` per invocation and scopes every artifact under `research/social/{run_id}/`.

## The rule

```
run_id = "{channel-list}-{platform-list}-{YYYY-MM-DD}[-{retry-suffix}]"
```

Built from `state.intake.channels` (object keys) and the platform set across `state.intake.identities[ch].handles` (the union of platforms named in any channel's identity block).

## Derivation algorithm (canonical)

```python
def derive_run_id(state, today_iso_date):
    channels = sorted(state["intake"]["channels"].keys())
    platforms = sorted({
        platform
        for ch in channels
        for platform in state["intake"]["identities"][ch]["handles"].keys()
    })

    channel_part = format_channel_list(channels)
    platform_part = format_platform_list(platforms)
    base = f"{channel_part}-{platform_part}-{today_iso_date}"

    # Day-2 re-run on the same channel × platform × date gets -r2, -r3, ...
    existing = list_runs_in_index(channel_part, platform_part, today_iso_date)
    if not existing:
        return base
    return f"{base}-r{len(existing) + 1}"


def format_channel_list(channels):
    if len(channels) == 1:
        return channels[0]                          # "celavii"
    if len(channels) == 2:
        return "-".join(channels)                   # "elioth-celavii"
    if len(channels) >= 3:
        return "multichannel"                       # collapse to keep paths sane


def format_platform_list(platforms):
    if len(platforms) == 1:
        return platforms[0]                         # "instagram"
    if len(platforms) >= 2:
        return "multi"                              # any 2+ platforms collapse
```

## Edge cases

| Input                                                                        | run_id                                          |
| ---------------------------------------------------------------------------- | ----------------------------------------------- |
| `celavii × instagram`, 2026-05-06, fresh                                     | `celavii-instagram-2026-05-06`                  |
| `celavii × instagram`, 2026-05-06, re-run after first failed                 | `celavii-instagram-2026-05-06-r2`               |
| `celavii × {instagram, tiktok}`, 2026-05-06                                  | `celavii-multi-2026-05-06`                      |
| `{elioth, celavii} × instagram`, 2026-05-06                                  | `elioth-celavii-instagram-2026-05-06`           |
| `{elioth, celavii, cutmaster} × instagram`, 2026-05-06                       | `multichannel-instagram-2026-05-06`             |
| `{elioth, celavii, cutmaster} × {ig, tt, x}`, 2026-05-06                     | `multichannel-multi-2026-05-06`                 |
| Same as above, 5 hours later (any reason — gateway crash, intentional retry) | adds `-r2` suffix; first run preserved verbatim |

## Test cases

```python
assert derive_run_id({
    "intake": {"channels": {"celavii": {}}, "identities": {"celavii": {"handles": {"instagram": "@celavii_ai"}}}}
}, "2026-05-06") == "celavii-instagram-2026-05-06"

assert derive_run_id({
    "intake": {"channels": {"celavii": {}, "elioth": {}}, "identities": {
        "celavii": {"handles": {"instagram": "@celavii_ai"}},
        "elioth":  {"handles": {"instagram": "@elioth"}},
    }}
}, "2026-05-06") == "elioth-celavii-instagram-2026-05-06"

assert derive_run_id({
    "intake": {"channels": {"celavii": {}}, "identities": {
        "celavii": {"handles": {"instagram": "@celavii_ai", "tiktok": "@celaviihq"}},
    }}
}, "2026-05-06") == "celavii-multi-2026-05-06"
```

## Output layout this implies

```
projects/{project}/research/social/
├── INDEX.md                                         ← per-project run manifest
├── celavii-instagram-2026-05-06/                    ← this run
│   ├── state.json                                   (was social-strategy-state.json)
│   ├── preflight-banners/
│   │   ├── 0-acquire.md ... 6-report.md             (Patch J-3b artifacts)
│   ├── phase-audits/
│   │   ├── 0-acquire.md ... 6-report.md             (Patch J-4 artifacts)
│   ├── aggregate-report.md, aggregate-report.json
│   ├── calendar.md, calendar.json
│   ├── gate-a-report.md, gate-b-report.md
│   ├── briefs/
│   │   ├── celavii-ig-001-brief.md ... celavii-ig-NNN-brief.md
│   │   └── celavii-ig-001-hooks.md ...
│   ├── raw/
│   │   └── celavii-{handle}-instagram-profile-{ts}.json ...
│   └── deliverables/
│       └── social-report.html                       (Phase 6 print-ready)
└── celavii-youtube-2026-06-15/                      ← future run, no collision
    └── state.json ...
```

## Why no separate per-channel subfolders inside a multi-channel run

Multi-channel runs share intake, share Gate A scoring, share the calendar. Splitting state across folders would force cross-folder reads on every phase. The `run_id` already encodes channel set; per-channel artifacts (e.g. briefs) embed channel in filename (`celavii-ig-001-brief.md`).

## Resume detection (replaces old file-glob)

Old behavior (pre-Patch N): orchestrator did `ls projects/*/research/social/social-strategy-state.json` and asked "resume?".

New behavior: orchestrator reads `research/social/INDEX.md` (per [INDEX-template.md](INDEX-template.md)), filters runs whose `status` is `running` or `awaiting_user`, and surfaces them as resume candidates. Multiple in-flight runs may coexist (e.g., celavii-instagram is awaiting Gate B human review while celavii-youtube starts).

## Anti-patterns

- ❌ Skipping the `-r2` suffix on a same-day retry — silently overwrites first attempt's artifacts; no forensic trail for what changed
- ❌ Guessing run_id mid-run instead of recording it at Phase 0 — every artifact path depends on it, late changes cascade
- ❌ Using a slugged version of `intake.goal` in the run_id — goal text changes mid-intake, slug changes, paths break
- ❌ Embedding free text from user (e.g. campaign name) — non-deterministic; another instance of the orchestrator can't reproduce the path

## Migration of existing artifacts (one-time)

Project artifacts that pre-date Patch N (e.g. cutmasterai's 2026-05-05 dry-run) stay at their original paths. New runs of the same project use the Patch N convention. The project's INDEX.md gets a row for the legacy run flagged `status: legacy_pre_patch_n`.
