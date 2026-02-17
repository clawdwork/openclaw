# Cohort Analytics API — Proposal

**Status**: Draft — Pending Dev Review  
**Author**: Product / AI Pair  
**Date**: 2026-02-10  
**Related**: `external-api.md`, Content Discovery Proposal, `/analytics/*` endpoints

---

## Problem Statement

The current Celavii API provides **individual** profile intelligence (`/profiles/:id/affinities`) and **org-level** analytics (`/analytics/demographics`, `/analytics/niches`). There is no **middle layer** — cohort-level intelligence scoped to an arbitrary set of profiles or a seed profile's network.

To answer a question like _"What are the affinities of Nike's followers who have 10K+ followers?"_, a consumer must currently:

1. Scrape followers (`POST /scrape/followers`)
2. Bulk enhance (`POST /enhance/bulk`)
3. Refine (`POST /refine/profiles`)
4. Query each profile's affinities individually (`GET /profiles/:id/affinities`)
5. Aggregate manually

That's 4–5 API calls + client-side aggregation. A cohort endpoint collapses this to **one call**.

---

## Proposed Endpoints

### 1. `POST /analytics/cohort` — Full Cohort Intelligence

The primary endpoint. Seed with a profiles array OR a source (followers/following of a profile), apply filters, get aggregated insights.

```json
POST /analytics/cohort
{
  // Mode A: explicit profile list
  "profiles": ["creator1", "creator2", "creator3"],

  // Mode B: source-based (reuses enhance/bulk source schema)
  "source": {
    "type": "followers",
    "target": "nike",
    "filters": { "min_followers": 10000 },
    "limit": 500
  },

  // What to return
  "include": [
    "affinities",
    "demographics",
    "locations",
    "niches",
    "engagement_stats",
    "hashtags",
    "account_stats"
  ]
}
```

**Response**:

```json
{
  "cohort_size": 487,
  "account_stats": {
    "total": 487,
    "public": 412,
    "private": 75,
    "enhanced": 350,
    "unenhanced": 137,
    "refined": 280,
    "unrefined": 207,
    "avg_followers": 24500,
    "median_engagement_rate": 2.3
  },
  "affinities": [
    { "name": "sustainability", "strength": 0.89, "count": 312 },
    { "name": "fitness", "strength": 0.76, "count": 267 }
  ],
  "demographics": {
    "gender": { "male": 245, "female": 218, "unknown": 24 },
    "age_ranges": { "18-24": 87, "25-34": 198, "35-44": 132, "45+": 70 }
  },
  "locations": [
    { "location": "Los Angeles, CA", "count": 52 },
    { "location": "New York, NY", "count": 48 }
  ],
  "niches": [
    { "niche": "fitness", "count": 198 },
    { "niche": "lifestyle", "count": 167 }
  ],
  "engagement_stats": {
    "avg_rate": 3.1,
    "median_rate": 2.4,
    "p90_rate": 6.8
  },
  "hashtags": [
    { "hashtag": "fitness", "count": 245 },
    { "hashtag": "sustainability", "count": 189 }
  ]
}
```

**Credits**: 2–5 (depending on cohort size and `include` fields)  
**Scope**: `analytics:read` (extend existing) or new `analytics:cohort`

---

### 2. `GET /analytics/cohort/stats` — Lightweight Network Stats

Quick metadata-only stats without AI processing. For deciding whether to invest in a full enhancement/refinement cycle.

```
GET /analytics/cohort/stats?source_type=followers&target=nike&sort=last_enhanced&filter=public
```

**Query Parameters**:

| Param         | Type    | Description                                                           |
| ------------- | ------- | --------------------------------------------------------------------- |
| `source_type` | string  | `followers`, `following`, `both`                                      |
| `target`      | string  | Username or ig:ID                                                     |
| `sort`        | string  | `last_enhanced`, `followers`, `engagement_rate`, `created`            |
| `filter`      | string  | `public`, `private`, `enhanced`, `unenhanced`, `refined`, `unrefined` |
| `limit`       | integer | Max profiles to scan (default 1000)                                   |

**Response**: Counts, distribution, sort-ordered profile list (metadata only — no AI fields).

**Credits**: 1  
**Scope**: `analytics:read`

---

### 3. `POST /analytics/cohort/filter` — Filtered Cohort Drill-Down

Seed a profile (or multiple), then filter their network by affinities, demographics, keywords, etc. Supports two return modes.

#### Single-Seed Example

> _"Show me Nike followers interested in sustainability who are male and live in Minnesota"_

```json
POST /analytics/cohort/filter
{
  "source": { "type": "followers", "target": "nike" },
  "filter_by": {
    "affinities": ["sustainability"],
    "gender": "male",
    "location": "Minnesota",
    "min_engagement_rate": 2.0,
    "has_contact": true
  },
  "return": "profiles",
  "limit": 50,
  "cursor": null
}
```

#### Multi-Seed Example (Network Intersection)

> _"How many profiles interested in nicotine follow both Sheetz and Wawa?"_

```json
POST /analytics/cohort/filter
{
  "sources": [
    { "type": "followers", "target": "sheetz" },
    { "type": "followers", "target": "wawa" }
  ],
  "mode": "intersection",
  "filter_by": {
    "affinities": ["nicotine", "tobacco"]
  },
  "return": "both"
}
```

#### Multi-Seed Modes

| Mode           | Meaning                              | Use Case                                       |
| -------------- | ------------------------------------ | ---------------------------------------------- |
| `intersection` | Must follow **ALL** seed profiles    | "People who follow both Sheetz AND Wawa"       |
| `union`        | Follows **ANY** of the seed profiles | "People who follow Sheetz OR Wawa"             |
| `overlap`      | Returns overlap stats between seeds  | "What % of Sheetz followers also follow Wawa?" |

#### Return Modes

| Return        | Description                                                 |
| ------------- | ----------------------------------------------------------- |
| `"profiles"`  | Paginated list of matching profiles with individual data    |
| `"aggregate"` | Stats only: counts, affinities, demographics, engagement    |
| `"both"`      | Aggregate summary + top N matching profiles in one response |

#### Response (`"return": "both"`):

```json
{
  "aggregate": {
    "source_sizes": {
      "sheetz": 142000,
      "wawa": 198000
    },
    "intersection_size": 23400,
    "match_count": 1847,
    "match_rate": "7.9%",
    "top_affinities": [
      { "name": "nicotine", "strength": 0.88, "count": 1847 },
      { "name": "convenience retail", "strength": 0.82, "count": 1623 },
      { "name": "vaping", "strength": 0.71, "count": 1104 }
    ],
    "demographics": {
      "gender": { "male": 1241, "female": 584, "unknown": 22 },
      "top_locations": [
        { "location": "Pennsylvania", "count": 487 },
        { "location": "Virginia", "count": 312 },
        { "location": "New Jersey", "count": 289 }
      ]
    },
    "engagement": {
      "avg_rate": 3.1,
      "median_followers": 18400
    }
  },
  "profiles": [
    {
      "username": "creator1",
      "followers": 24500,
      "engagement_rate": 3.8,
      "affinities": ["nicotine", "convenience retail", "vaping"],
      "location": "Philadelphia, PA"
    }
  ],
  "pagination": { "has_more": true, "cursor": "abc123" }
}
```

**Filter Fields** (AND logic — all conditions must match):

| Filter                | Type     | Description                          |
| --------------------- | -------- | ------------------------------------ |
| `affinities`          | string[] | Must have ALL listed affinities      |
| `keywords`            | string[] | Full-text search across bio/captions |
| `gender`              | string   | `male`, `female`                     |
| `location`            | string   | City, state, or country              |
| `min_followers`       | integer  | Minimum follower count               |
| `max_followers`       | integer  | Maximum follower count               |
| `min_engagement_rate` | float    | Minimum engagement rate              |
| `has_contact`         | boolean  | Must have email/phone                |
| `is_verified`         | boolean  | Verified accounts only               |
| `is_enhanced`         | boolean  | Only enhanced profiles               |
| `is_refined`          | boolean  | Only refined profiles                |

**Credits**: 2–5 (depending on cohort size and return mode)  
**Scope**: `analytics:read` or `analytics:cohort`

---

## Architecture Considerations

### Reuse Existing Schemas

- **Source schema**: Reuse from `/enhance/bulk` and `/refine/profiles` — `type`, `target`, `filters`, `limit`
- **Profile filters**: Reuse from existing search RPC — no new filter grammar needed
- **Pagination**: Same cursor-based pattern as all other list endpoints

### Existing Foundation

- `/analytics/network-overlap` already does simpler network intersection queries — the RPC and data model for cross-network queries is in place
- Profile affinities, demographics, and location data are already indexed from the refinement pipeline
- The `resolve_profile_source()` helper in `_lib/profile-source-resolver.ts` already handles source resolution for enhance/refine

### Processing Strategy

| Scenario                        | Strategy                                                          |
| ------------------------------- | ----------------------------------------------------------------- |
| All profiles enhanced + refined | DB aggregation — fast (< 2s)                                      |
| Partial enhancement coverage    | Return results for enhanced subset + `enhancement_coverage` stats |
| Large cohorts (> 10K)           | Async job with polling (reuse job status pattern)                 |
| Multi-seed intersection         | Pre-compute overlap set, then filter — 2-pass query               |

### Suggested File Structure

```
src/app/api/v1/analytics/
├── cohort/
│   ├── route.ts              # POST /analytics/cohort (full intelligence)
│   ├── stats/route.ts        # GET /analytics/cohort/stats (lightweight)
│   └── filter/route.ts       # POST /analytics/cohort/filter (drill-down)
```

### New RPC Functions (Supabase)

| RPC                                                           | Purpose                                                   |
| ------------------------------------------------------------- | --------------------------------------------------------- |
| `get_cohort_affinities(profile_ids[], limit)`                 | Aggregate affinities across profile set                   |
| `get_cohort_demographics(profile_ids[])`                      | Aggregate demographics across profile set                 |
| `get_cohort_stats(source_type, target, filters)`              | Quick metadata counts                                     |
| `filter_cohort_profiles(source_config, filters, return_mode)` | Filtered drill-down with multi-seed support               |
| `intersect_networks(targets[], mode)`                         | Network intersection/union (extends existing overlap RPC) |

### Credit Model

| Endpoint                                       | Credits |
| ---------------------------------------------- | ------- |
| `GET /analytics/cohort/stats`                  | 1       |
| `POST /analytics/cohort` (< 1K profiles)       | 2       |
| `POST /analytics/cohort` (1K–10K profiles)     | 5       |
| `POST /analytics/cohort/filter` (< 1K)         | 2       |
| `POST /analytics/cohort/filter` (1K–10K)       | 5       |
| `POST /analytics/cohort/filter` (> 10K, async) | 10      |

### Scope

Extend existing `analytics:read` scope to cover cohort endpoints. No new scope needed unless we want granular gating.

---

## Use Cases

| Question                                         | Endpoint                        | Mode                                |
| ------------------------------------------------ | ------------------------------- | ----------------------------------- |
| "What do Nike's followers care about?"           | `POST /analytics/cohort`        | source: followers of nike           |
| "How many of their followers are enhanced?"      | `GET /analytics/cohort/stats`   | filter=enhanced                     |
| "Find Nike followers into sustainability in MN"  | `POST /analytics/cohort/filter` | filter_by affinities + location     |
| "Compare Sheetz vs Wawa nicotine audience"       | `POST /analytics/cohort/filter` | multi-seed intersection             |
| "Seed 5 creators, get combined audience profile" | `POST /analytics/cohort`        | profiles array                      |
| "Sort network by last enhanced date"             | `GET /analytics/cohort/stats`   | sort=last_enhanced                  |
| "Which of their followers have contact info?"    | `POST /analytics/cohort/filter` | has_contact: true, return: profiles |

---

## Implementation Priority

1. **`POST /analytics/cohort`** — Highest ROI. Turns 5 sequential operations into 1. Powers the "Analyze" page via API.
2. **`POST /analytics/cohort/filter`** — Enables the drill-down workflow that brands/agencies need most.
3. **`GET /analytics/cohort/stats`** — Lightweight complement. Useful for quick checks before committing to full analysis.

---

## Open Questions for Dev Review

1. **Async threshold**: At what cohort size should we switch to async job processing? Proposed: > 10K profiles.
2. **Cache strategy**: Should cohort results be cached? If so, for how long? Affinities are relatively stable.
3. **Enhancement requirement**: Should the endpoint auto-filter to only enhanced/refined profiles, or include un-enhanced with a coverage warning?
4. **Multi-seed limits**: Max number of seed profiles for intersection queries? Proposed: 10.
5. **Rate limiting**: Should cohort endpoints have a separate, lower rate limit given their compute cost?
6. **Scope**: Extend `analytics:read` or create a new `analytics:cohort` scope?

---

## Dependencies

- Existing `/analytics/network-overlap` RPC for network intersection
- `resolve_profile_source()` from `_lib/profile-source-resolver.ts`
- Affinity and demographic data from refinement pipeline
- Job queue infrastructure (for async large cohorts) — reuse from enhance/refine

---

_Proposal created for dev review. Please evaluate feasibility, suggest schema changes, and flag any performance concerns before implementation._
