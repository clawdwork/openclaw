---
name: celavii-profiles
description: "Get detailed creator intelligence from the Celavii API. Look up full profiles, bulk profile lookup, AI-analyzed affinities, recent posts, network data, followers/following lists, social links, and contact info."
metadata:
  {
    "openclaw":
      {
        "emoji": "👤",
        "requires": { "env": ["CELAVII_API_KEY"] },
        "primaryEnv": "CELAVII_API_KEY",
      },
  }
---

# Celavii Profiles Skill

Get detailed creator intelligence via the Celavii Creator Intelligence Platform API.

**Base URL**: `https://www.celavii.com/api/v1`

## Auth

```
Authorization: Bearer $CELAVII_API_KEY
```

## Profile Identifiers

All profile endpoints accept three formats:

| Format      | Example        | Description                            |
| ----------- | -------------- | -------------------------------------- |
| Username    | `leomessi`     | Instagram username (most common)       |
| @handle     | `@leomessi`    | With @ prefix (stripped automatically) |
| Internal ID | `ig:427553890` | Internal `ig:` prefixed numeric ID     |

## Endpoints

### Bulk profile lookup

Fetch up to 100 profiles in a single request with optional field selection.

```bash
curl -s -X POST https://www.celavii.com/api/v1/profiles/bulk \
  -H "Authorization: Bearer $CELAVII_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "profiles": ["leomessi", "@selenagomez", "ig:427553890"],
    "fields": ["basic", "affinities", "contact"]
  }'
```

| Field      | Type     | Required | Description                                                                                       |
| ---------- | -------- | -------- | ------------------------------------------------------------------------------------------------- |
| `profiles` | string[] | yes      | Usernames, @handles, or ig:IDs (max 100)                                                          |
| `fields`   | string[] | no       | Fields to include: `basic` (default), `affinities`, `contact` (requires `profiles:contact` scope) |

**Credits**: 1. **Scope**: `profiles:read`

### Get full profile

```bash
curl -s https://www.celavii.com/api/v1/profiles/leomessi \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

Returns bio, stats, metadata, verification status, engagement rate.

### Get AI-analyzed affinities

```bash
curl -s https://www.celavii.com/api/v1/profiles/leomessi/affinities \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

Returns brand and topic affinities with confidence scores.

### Get recent posts

```bash
curl -s "https://www.celavii.com/api/v1/profiles/leomessi/posts?limit=10" \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

| Parameter | Type    | Required | Description                            |
| --------- | ------- | -------- | -------------------------------------- |
| `limit`   | integer | no       | Results per page (default 25, max 100) |

### Get network data

```bash
curl -s https://www.celavii.com/api/v1/profiles/leomessi/network \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

Returns follower/following counts and scrape status.

### Get followers (paginated)

```bash
curl -s "https://www.celavii.com/api/v1/profiles/leomessi/followers?limit=25" \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

| Parameter | Type    | Required | Description                            |
| --------- | ------- | -------- | -------------------------------------- |
| `limit`   | integer | no       | Results per page (default 25, max 100) |
| `cursor`  | string  | no       | Pagination cursor                      |

### Get following (paginated)

```bash
curl -s "https://www.celavii.com/api/v1/profiles/leomessi/following?limit=25" \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

Same parameters as followers.

### Get social links

```bash
curl -s https://www.celavii.com/api/v1/profiles/leomessi/social-links \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

Returns extracted social links and external URLs.

### Get contact info

```bash
curl -s https://www.celavii.com/api/v1/profiles/leomessi/contact \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

Returns emails, phones, websites. **Requires `profiles:contact` scope.**

## Important: New / Untraced Profiles

Profiles that have **never been tracked** in the Celavii database will return **limited information** (basic public bio only — no affinities, demographics, audience data, or enriched metrics).

To get full data on a new profile:

1. **Trigger an enhancement** via `celavii-data-ops` (`POST /enhance/profiles` with `dry_run: true` first)
2. **Trigger immediate refinement** via `celavii-data-ops` (`POST /refine/profiles`) — for ≤100 profiles this returns affinities, demographics, and insights **synchronously** in the response (no waiting)
3. **Re-query** the profile endpoints to get the full enriched data

If refinement is NOT triggered explicitly, the internal AI pipeline processes profiles asynchronously over **24-48 hours**. Use refinement for immediate results.

Do NOT assume empty affinities or missing demographics means the profile lacks them — it likely just hasn't been enhanced/refined yet.

## Notes

- Most profile endpoints cost 0 credits — use freely for research
- Bulk lookup (`POST /profiles/bulk`) costs 1 credit per request (up to 100 profiles)
- Use `celavii-discover` to find creators first, then drill down here
- Network data (followers/following lists) requires prior scrape — check `/network` first
- Contact info requires the `profiles:contact` scope on the API key
