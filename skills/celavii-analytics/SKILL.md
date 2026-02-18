---
name: celavii-analytics
description: "Analyze audience demographics, geographic distribution, content niches, network overlap, shared hashtags, affinity-linked posts, and cohort-level intelligence (affinities, demographics, filtered drill-downs) via the Celavii API."
user-invocable: false
metadata:
  {
    "openclaw":
      {
        "emoji": "📈",
        "requires": { "env": ["CELAVII_API_KEY"] },
        "primaryEnv": "CELAVII_API_KEY",
      },
  }
---

# Celavii Analytics Skill

Analyze audience and content data via the Celavii Creator Intelligence Platform API.

**Base URL**: `https://www.celavii.com/api/v1`

## Auth

```
Authorization: Bearer $CELAVII_API_KEY
```

## Org-Level Endpoints (1 credit each)

### Audience demographics

```bash
curl -s https://www.celavii.com/api/v1/analytics/demographics \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

Returns age, gender, and audience composition breakdown.

### Geographic distribution

```bash
curl -s https://www.celavii.com/api/v1/analytics/locations \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

Returns geographic distribution of tracked profiles.

### Top content niches

```bash
curl -s https://www.celavii.com/api/v1/analytics/niches \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

Returns top content niches across the organization's profiles.

### Network overlap

Calculate follower/following overlap between 2+ profiles.

```bash
curl -s "https://www.celavii.com/api/v1/analytics/network-overlap?profile_ids=leomessi,selenagomez" \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

| Parameter     | Type   | Required | Description                                 |
| ------------- | ------ | -------- | ------------------------------------------- |
| `profile_ids` | string | yes      | Comma-separated usernames or ig:IDs (min 2) |

### Shared hashtags

```bash
curl -s "https://www.celavii.com/api/v1/analytics/shared-hashtags?usernames=leomessi,selenagomez" \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

| Parameter   | Type   | Required | Description                         |
| ----------- | ------ | -------- | ----------------------------------- |
| `usernames` | string | yes      | Comma-separated usernames or ig:IDs |

### Affinity-linked posts

Find posts linked to an affinity concept (topic, brand, location, category).

```bash
curl -s "https://www.celavii.com/api/v1/analytics/affinity-posts?affinity=photography&affinity_type=topic&sort=engagement&limit=25" \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

| Parameter        | Type    | Required | Description                                                 |
| ---------------- | ------- | -------- | ----------------------------------------------------------- |
| `affinity`       | string  | yes      | Affinity search term (e.g., `photography`, `Nike`, `Miami`) |
| `affinity_type`  | string  | no       | `all` (default), `topic`, `brand`, `location`, `category`   |
| `min_engagement` | integer | no       | Minimum engagement count                                    |
| `sort`           | string  | no       | `engagement` (default) or `date`                            |
| `limit`          | integer | no       | Results per page (default 25, max 100)                      |

## Cohort Analytics (2 credits each, except stats = 1)

### Full cohort intelligence

Aggregate affinities, demographics, hashtags, engagement stats, locations, and account stats for a set of profiles or a seed profile's network.

**Mode A — Explicit profiles:**

```bash
curl -s -X POST https://www.celavii.com/api/v1/analytics/cohort \
  -H "Authorization: Bearer $CELAVII_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "profiles": ["sheetz", "wawa", "@dunkin"],
    "include": ["affinities", "demographics", "hashtags", "account_stats", "engagement_stats", "locations", "niches"]
  }'
```

**Mode B — Network source:**

```bash
curl -s -X POST https://www.celavii.com/api/v1/analytics/cohort \
  -H "Authorization: Bearer $CELAVII_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "source": { "type": "followers", "target": "nike", "limit": 500 },
    "include": ["affinities", "account_stats"]
  }'
```

| Field           | Type     | Required | Description                             |
| --------------- | -------- | -------- | --------------------------------------- |
| `profiles`      | string[] | yes\*    | Usernames, @handles, or ig:IDs (Mode A) |
| `source.type`   | string   | yes\*    | `followers` or `following` (Mode B)     |
| `source.target` | string   | yes\*    | Username of seed profile                |
| `source.limit`  | integer  | no       | Max profiles (default 500, max 10,000)  |
| `include`       | string[] | no       | Fields to return (defaults to all)      |

\*Provide either `profiles` or `source`, not both.

**Returns**: `cohort_size`, `resolved_count`, `affinities` (topics/brands/categories with coverage/lift), `demographics`, `locations` (with lat/lng), `hashtags`, `account_stats`, `engagement_stats`, `execution_time_ms`

**Credits**: 2. **Scope**: `analytics:read`

---

### Cohort stats (lightweight)

Quick metadata-only stats — no AI processing. Returns counts, averages, medians, and a sorted profile list with cursor pagination.

```bash
curl -s "https://www.celavii.com/api/v1/analytics/cohort/stats?profiles=sheetz,wawa&sort_by=followers&limit=10" \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

| Parameter       | Type    | Required    | Description                                               |
| --------------- | ------- | ----------- | --------------------------------------------------------- |
| `profiles`      | string  | conditional | Comma-separated usernames or ig:IDs                       |
| `source_type`   | string  | conditional | `followers` or `following` (use with `source_target`)     |
| `source_target` | string  | conditional | Username of seed profile                                  |
| `source_limit`  | integer | no          | Max profiles from source (default 500, max 10,000)        |
| `sort_by`       | string  | no          | `followers` (default), `engagement_rate`, `last_enhanced` |
| `sort_dir`      | string  | no          | `desc` (default) or `asc`                                 |
| `limit`         | integer | no          | Profiles per page (default 50, max 200)                   |
| `cursor`        | string  | no          | Pagination cursor                                         |

**Returns**: `cohort_size`, `account_stats` (total, public, private, enhanced, unenhanced, refined, unrefined, verified, has_contact, avg/median followers, avg/median engagement_rate), `profiles[]`, `has_more`

**Credits**: 1. **Scope**: `analytics:read`

---

### Filtered cohort drill-down

Multi-filter drill-down with optional aggregation and pagination. All filters use AND logic.

```bash
curl -s -X POST https://www.celavii.com/api/v1/analytics/cohort/filter \
  -H "Authorization: Bearer $CELAVII_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "profiles": ["sheetz", "wawa"],
    "filters": {
      "affinities": ["fitness", "food"],
      "gender": "female",
      "location": "California",
      "min_followers": 1000,
      "max_followers": 50000,
      "min_engagement_rate": 2.0,
      "has_contact": true,
      "is_verified": false,
      "is_enhanced": true,
      "is_refined": true
    },
    "return_mode": "both",
    "limit": 50
  }'
```

| Field                         | Type     | Required | Description                                  |
| ----------------------------- | -------- | -------- | -------------------------------------------- |
| `profiles`                    | string[] | yes\*    | Usernames, @handles, or ig:IDs               |
| `source`                      | object   | yes\*    | Same source spec as cohort endpoint (Mode B) |
| `filters.affinities`          | string[] | no       | Must have ALL listed affinities              |
| `filters.gender`              | string   | no       | `male` or `female`                           |
| `filters.location`            | string   | no       | City, state, or country                      |
| `filters.min_followers`       | integer  | no       | Minimum follower count                       |
| `filters.max_followers`       | integer  | no       | Maximum follower count                       |
| `filters.min_engagement_rate` | float    | no       | Minimum engagement rate                      |
| `filters.has_contact`         | boolean  | no       | Must have email/phone                        |
| `filters.is_verified`         | boolean  | no       | Verified accounts only                       |
| `filters.is_enhanced`         | boolean  | no       | Only enhanced profiles                       |
| `filters.is_refined`          | boolean  | no       | Only refined profiles                        |
| `return_mode`                 | string   | no       | `profiles` (default), `aggregate`, or `both` |
| `limit`                       | integer  | no       | Profiles per page (default 50)               |
| `cursor`                      | string   | no       | Pagination cursor                            |

\*Provide either `profiles` or `source`, not both.

**Returns**: `match_count`, `match_rate`, `cohort_size`, `aggregate` (top_affinities, demographics, engagement), `profiles[]`, `has_more`

**Credits**: 2. **Scope**: `analytics:read`

## Notes

- Org-level analytics endpoints cost 1 credit each
- Cohort endpoints cost 1-2 credits (stats = 1, cohort/filter = 2)
- Network overlap requires prior follower data — check `/profiles/{id}/network` first
- Use shared hashtags to identify content strategy overlap between creators
- Affinity posts bridge AI-analyzed affinities to actual content via hashtags
- Cohort endpoints accept both explicit profile lists and network sources (followers/following of a seed profile)
- Cohort filter uses AND logic — all specified filters must match
- Use `return_mode: "aggregate"` for stats-only (no profile list), `"both"` for stats + profiles
