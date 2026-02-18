---
name: celavii-discover
description: "Search and discover Instagram creators using the Celavii API. Find creators by keyword, niche, follower range, AI-analyzed affinities, hashtag usage, and full-text post content search."
user-invocable: false
metadata:
  {
    "openclaw":
      {
        "emoji": "🔍",
        "requires": { "env": ["CELAVII_API_KEY"] },
        "primaryEnv": "CELAVII_API_KEY",
      },
  }
---

# Celavii Discover Skill

Search and discover Instagram creators via the Celavii Creator Intelligence Platform API.

**Base URL**: `https://www.celavii.com/api/v1`

## Auth

All requests require:

```
Authorization: Bearer $CELAVII_API_KEY
```

## Endpoints

### Search profiles by keyword/niche

```bash
curl -s "https://www.celavii.com/api/v1/profiles/search?query=fitness&min_followers=10000&max_followers=500000&niche=health&limit=25" \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

| Parameter       | Type    | Required | Description                                 |
| --------------- | ------- | -------- | ------------------------------------------- |
| `query`         | string  | no       | Search query (username, name, bio keywords) |
| `niche`         | string  | no       | Filter by niche/category                    |
| `min_followers` | integer | no       | Minimum follower count                      |
| `max_followers` | integer | no       | Maximum follower count                      |
| `limit`         | integer | no       | Results per page (default 25, max 100)      |
| `cursor`        | string  | no       | Pagination cursor                           |

**Credits**: 1

### Search by AI affinities

Find creators by AI-analyzed affinity keywords (topics, brands, locations).

```bash
curl -s "https://www.celavii.com/api/v1/profiles/search/affinities?terms=fitness,yoga&min_confidence=0.9&limit=25" \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

| Parameter        | Type    | Required | Description                                |
| ---------------- | ------- | -------- | ------------------------------------------ |
| `terms`          | string  | yes      | Comma-separated affinity keywords          |
| `min_confidence` | number  | no       | Minimum confidence (0.0–1.0, default 0.85) |
| `limit`          | integer | no       | Results per page (default 25)              |

**Credits**: 1

### Find creators by hashtag usage

```bash
curl -s "https://www.celavii.com/api/v1/analytics/hashtag-creators?hashtags=fitness,photography&min_followers=10000&limit=10" \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

| Parameter        | Type    | Required | Description                                      |
| ---------------- | ------- | -------- | ------------------------------------------------ |
| `hashtags`       | string  | yes      | Comma-separated hashtags (max 10, no `#` prefix) |
| `min_post_count` | integer | no       | Minimum total posts using these hashtags         |
| `min_followers`  | integer | no       | Minimum follower count                           |
| `limit`          | integer | no       | Results per page (default 25, max 100)           |

**Credits**: 1

### Full-text search across post captions

```bash
curl -s "https://www.celavii.com/api/v1/content/search?query=protein+shake+miami&sort=relevance&limit=10" \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

| Parameter        | Type    | Required | Description                                    |
| ---------------- | ------- | -------- | ---------------------------------------------- |
| `query`          | string  | yes      | Search keywords                                |
| `min_engagement` | integer | no       | Minimum engagement count                       |
| `author`         | string  | no       | Filter by author username                      |
| `since`          | string  | no       | Only posts after this date (ISO 8601)          |
| `sort`           | string  | no       | `relevance` (default), `engagement`, or `date` |
| `limit`          | integer | no       | Results per page (default 25, max 100)         |

**Credits**: 1

## Pagination

All list endpoints use cursor-based pagination. Check `pagination.has_more` and pass `pagination.cursor` to the next request:

```bash
curl -s "https://www.celavii.com/api/v1/profiles/search?query=fitness&limit=25&cursor=eyJpZCI6Ijk5OTk..." \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

## Notes

- Each search query costs 1 credit — use specific filters to get targeted results
- Profile identifiers in results use `ig:` prefix (e.g., `ig:427553890`)
- Use the `celavii-profiles` skill to get full details on any discovered creator
- Rate limit: check `X-RateLimit-Remaining` header before batch operations
