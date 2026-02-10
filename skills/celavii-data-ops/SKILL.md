---
name: celavii-data-ops
description: "Trigger profile enhancements, AI refinement, and data scrapes via the Celavii API. Refresh creator data, refine profiles for affinities/demographics, collect followers/following, scrape locations/hashtags/URLs, check job status, and monitor credit usage."
metadata:
  {
    "openclaw":
      {
        "emoji": "⚡",
        "requires": { "env": ["CELAVII_API_KEY"] },
        "primaryEnv": "CELAVII_API_KEY",
      },
  }
---

# Celavii Data Ops Skill

Trigger data collection and profile enhancement via the Celavii Creator Intelligence Platform API.

**Base URL**: `https://www.celavii.com/api/v1`

## Auth

```
Authorization: Bearer $CELAVII_API_KEY
```

## IMPORTANT: Always dry-run first

Enhancement and scrape operations cost credits + Apify costs. **Always use `dry_run: true` first** to check estimated costs before executing.

## Account & Usage

### Check API key info

```bash
curl -s https://www.celavii.com/api/v1/me \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

**Credits**: 0

### Check credit usage

```bash
curl -s https://www.celavii.com/api/v1/usage \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

**Credits**: 0

## Profile Enhancement

### Trigger enhancement (dry run first!)

```bash
# Step 1: Dry run — check cost
curl -s -X POST https://www.celavii.com/api/v1/enhance/profiles \
  -H "Authorization: Bearer $CELAVII_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "profiles": ["leomessi", "selenagomez"],
    "mode": "basic",
    "dry_run": true
  }'

# Step 2: Execute with auto-confirm (skips manual confirmation step)
curl -s -X POST https://www.celavii.com/api/v1/enhance/profiles \
  -H "Authorization: Bearer $CELAVII_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "profiles": ["leomessi", "selenagomez"],
    "mode": "basic",
    "dry_run": false,
    "auto_confirm": true,
    "authorize_overage": false
  }'
```

| Field               | Type     | Required | Description                                                                                      |
| ------------------- | -------- | -------- | ------------------------------------------------------------------------------------------------ |
| `profiles`          | string[] | yes      | Usernames, @handles, or ig:IDs (max 500)                                                         |
| `mode`              | string   | no       | `basic` (default) or `enhanced`                                                                  |
| `dry_run`           | boolean  | no       | If `true`, returns cost estimate without executing                                               |
| `auto_confirm`      | boolean  | no       | If `true`, immediately confirms the job (skips manual confirmation step)                         |
| `authorize_overage` | boolean  | no       | If `true`, authorize overage charges if credit balance is insufficient (requires `auto_confirm`) |

**Credits**: 1-2 per profile + processing cost. **Requires `enhance:trigger` scope.**

### Bulk enhancement from source (dry run first!)

Enhance profiles in bulk from a source: followers of a profile, following of a profile, both, or a search query.

```bash
# Dry run — check cost and profile count
curl -s -X POST https://www.celavii.com/api/v1/enhance/bulk \
  -H "Authorization: Bearer $CELAVII_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "source": {
      "type": "followers",
      "target": "nike",
      "filters": { "min_followers": 10000, "verified_only": true },
      "limit": 1000
    },
    "mode": "basic",
    "dry_run": true
  }'

# Execute (search source example)
curl -s -X POST https://www.celavii.com/api/v1/enhance/bulk \
  -H "Authorization: Bearer $CELAVII_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "source": {
      "type": "search",
      "filters": { "niche": "golf", "min_followers": 10000, "max_followers": 50000 },
      "limit": 100
    },
    "mode": "basic",
    "skip_already_enhanced": true
  }'
```

| Field                   | Type    | Required | Description                                                                            |
| ----------------------- | ------- | -------- | -------------------------------------------------------------------------------------- |
| `source.type`           | string  | yes      | `followers`, `following`, `both`, or `search`                                          |
| `source.target`         | string  | yes\*    | Username or ig:ID (\*required for network sources)                                     |
| `source.filters`        | object  | no       | Filter criteria (see below)                                                            |
| `source.limit`          | integer | no       | Max profiles (default 500; network cap 50K, search cap 500)                            |
| `mode`                  | string  | no       | `basic` (default) or `enhanced`                                                        |
| `dry_run`               | boolean | no       | If `true`, returns cost estimate without executing                                     |
| `skip_already_enhanced` | boolean | no       | Skip profiles already enhanced (default `false`)                                       |
| `auto_confirm`          | boolean | no       | If `true`, immediately confirms the job (skips manual confirmation)                    |
| `authorize_overage`     | boolean | no       | If `true`, authorize overage charges if credits insufficient (requires `auto_confirm`) |

**Network filters** (`followers`/`following`/`both`): `min_followers`, `max_followers`, `verified_only`
**Search filters** (`search`): `query`, `niche`, `location`, `gender`, `has_contact`, `min_followers`, `max_followers`

**Processing**: Async — jobs are queued and processed in batches of 300 profiles (~5 min/batch). Response includes `estimated_processing_time` and `status_url` to poll progress.

**Credits**: 1-2 per profile + processing cost. **Requires `enhance:trigger` scope.**

### Confirm a pending enhancement job

Only needed if `auto_confirm` was NOT set when creating the job.

```bash
curl -s -X POST https://www.celavii.com/api/v1/enhance/<job_id>/confirm \
  -H "Authorization: Bearer $CELAVII_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "authorize_overage": false }'
```

**Credits**: 0. **Requires `enhance:trigger` scope.**

### Check enhancement job status

```bash
curl -s https://www.celavii.com/api/v1/enhance/<job_id>/status \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

**Credits**: 0

## Profile Refinement

Refinement runs AI analysis (via Gemini) on **already-enhanced profiles** to generate affinities, demographics, audience insights, and brand alignment scores. Profiles MUST have 5+ posts with captions from a prior enhancement before refinement will work.

### Trigger refinement (dry run first!)

Two modes are available:

**Mode A — Direct profiles list:**

```bash
# Dry run — eligibility check + cost estimate
curl -s -X POST https://www.celavii.com/api/v1/refine/profiles \
  -H "Authorization: Bearer $CELAVII_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "profiles": ["leomessi", "selenagomez"],
    "dry_run": true,
    "skip_already_refined": false
  }'

# Execute
curl -s -X POST https://www.celavii.com/api/v1/refine/profiles \
  -H "Authorization: Bearer $CELAVII_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "profiles": ["leomessi", "selenagomez"],
    "dry_run": false,
    "skip_already_refined": true
  }'
```

**Mode B — Source-based (followers, following, search):**

```bash
curl -s -X POST https://www.celavii.com/api/v1/refine/profiles \
  -H "Authorization: Bearer $CELAVII_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "source": {
      "type": "followers",
      "target": "nike",
      "filters": { "min_followers": 10000 },
      "limit": 500
    },
    "dry_run": true,
    "skip_already_refined": true
  }'
```

| Field                  | Type     | Required | Description                                                     |
| ---------------------- | -------- | -------- | --------------------------------------------------------------- |
| `profiles`             | string[] | yes\*    | Usernames, @handles, or ig:IDs (Mode A)                         |
| `source.type`          | string   | yes\*    | `followers`, `following`, `both`, or `search` (Mode B)          |
| `source.target`        | string   | yes\*    | Username or ig:ID (\*required for network sources)              |
| `source.filters`       | object   | no       | Same filters as bulk enhance                                    |
| `source.limit`         | integer  | no       | Max profiles (default 500)                                      |
| `dry_run`              | boolean  | no       | If `true`, returns eligibility check + cost estimate            |
| `skip_already_refined` | boolean  | no       | Skip profiles that already have affinity data (default `false`) |

\*Provide either `profiles` (Mode A) or `source` (Mode B), not both.

**Pre-flight validation**: Checks each profile has 5+ posts, captions, and has been enhanced. Ineligible profiles are reported in the dry-run response.

**Processing**:

- **≤100 eligible profiles**: Processed **immediately via Gemini AI** — affinities, demographics, and insights returned inline in the response
- **>100 eligible profiles**: Creates an async job — returns `job_id` + `status_url` for polling

**Credits**: 1 per profile. **Requires `refine:trigger` scope.**

### Check refinement job status

```bash
curl -s https://www.celavii.com/api/v1/refine/<job_id>/status \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

Returns: status, completed/failed counts, progress percentage, estimated remaining time.

**Credits**: 0

## Scrape Operations

### Scrape followers

```bash
curl -s -X POST https://www.celavii.com/api/v1/scrape/followers \
  -H "Authorization: Bearer $CELAVII_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"username": "leomessi", "max_results": 5000, "dry_run": true}'
```

| Field         | Type    | Required | Description                              |
| ------------- | ------- | -------- | ---------------------------------------- |
| `username`    | string  | yes\*    | Instagram username                       |
| `profile_id`  | string  | yes\*    | Or provide ig:ID instead                 |
| `max_results` | integer | no       | Max followers to collect (default 10000) |
| `dry_run`     | boolean | no       | Cost estimate only                       |

**Credits**: 2 + Apify cost

### Scrape following

Same parameters as followers.

```bash
curl -s -X POST https://www.celavii.com/api/v1/scrape/following \
  -H "Authorization: Bearer $CELAVII_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"username": "leomessi", "max_results": 5000, "dry_run": true}'
```

**Credits**: 2 + Apify cost

### Scrape locations

```bash
curl -s -X POST https://www.celavii.com/api/v1/scrape/locations \
  -H "Authorization: Bearer $CELAVII_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"location_ids": ["123456"], "max_items": 50, "dry_run": true}'
```

| Field          | Type     | Required | Description                       |
| -------------- | -------- | -------- | --------------------------------- |
| `location_ids` | string[] | yes\*    | Instagram location IDs            |
| `start_urls`   | string[] | yes\*    | Or provide location URLs          |
| `max_items`    | integer  | no       | Max posts to collect (default 50) |
| `until`        | string   | no       | ISO date cutoff                   |
| `dry_run`      | boolean  | no       | Cost estimate only                |

**Credits**: 1 + Apify cost

### Scrape hashtags

```bash
curl -s -X POST https://www.celavii.com/api/v1/scrape/hashtags \
  -H "Authorization: Bearer $CELAVII_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"hashtags": ["fitness", "yoga"], "max_items": 100, "dry_run": true}'
```

| Field       | Type     | Required | Description                            |
| ----------- | -------- | -------- | -------------------------------------- |
| `hashtags`  | string[] | yes      | Hashtags to scrape (max 10, without #) |
| `max_items` | integer  | no       | Max posts per hashtag (default 100)    |
| `dry_run`   | boolean  | no       | Cost estimate only                     |

**Credits**: 1 + Apify cost

### Scrape URLs

```bash
curl -s -X POST https://www.celavii.com/api/v1/scrape/urls \
  -H "Authorization: Bearer $CELAVII_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"urls": ["https://instagram.com/p/..."], "max_items": 50, "dry_run": true}'
```

| Field       | Type     | Required | Description                    |
| ----------- | -------- | -------- | ------------------------------ |
| `urls`      | string[] | yes      | Instagram URLs (max 20)        |
| `max_items` | integer  | no       | Max items per URL (default 50) |
| `dry_run`   | boolean  | no       | Cost estimate only             |

**Credits**: 1 + Apify cost

### Check scrape job status

```bash
curl -s https://www.celavii.com/api/v1/scrape/<job_id>/status \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

**Credits**: 0

## Workflow

1. **Check usage** — verify remaining credits before any operation
2. **Dry run** — always estimate cost before executing
3. **Execute** — trigger the operation with `dry_run: false`
4. **Poll status** — check job status until completion
5. **Refine** (if needed) — after enhancement completes, trigger refinement to generate AI insights
6. **Wait 24-48 hours** — AI-processed data (affinities, demographics) becomes available asynchronously
7. **Verify** — use `celavii-profiles` to confirm enriched data

### Typical pipeline for new profiles

```
enhance/profiles (or enhance/bulk) → poll status → refine/profiles → poll status → wait 24-48h → query celavii-profiles
```

## Important: Processing Time for New Profiles

When enhancing profiles that have **never been tracked** in the Celavii database:

- The enhancement job itself may complete quickly (minutes), but **AI-processed data takes 24-48 hours** to become available
- This includes: **affinities, demographics, audience analysis, brand alignment scores, and enriched metrics**
- After triggering enhancement, inform the user that full data will be available in 24-48 hours
- Use `celavii-profiles` endpoints to verify when enriched data is ready (affinities endpoint returns results)

## Notes

- All scrape/enhance operations are async — poll the status endpoint
- Enhancement and scrape require `enhance:trigger` and `scrape:trigger` scopes
- Refinement requires `refine:trigger` scope
- **Refinement requires enhanced profiles** — only profiles with 5+ posts and captions can be refined. Run enhancement first.
- Use `skip_already_refined: true` to avoid re-processing profiles that already have affinity data
- Always dry-run first to avoid unexpected credit consumption
- Batch enhancements are more efficient than individual ones (max 500 profiles)
- Bulk enhance jobs are queued with fair scheduling (max 5 concurrent batches per org, 15 globally)
- Rate limit: Pro tier = 60 req/min — check `X-RateLimit-Remaining` header
