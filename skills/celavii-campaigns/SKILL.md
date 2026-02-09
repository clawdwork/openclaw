---
name: celavii-campaigns
description: "Track and analyze influencer marketing campaigns via the Celavii API. List campaigns, view performance metrics, assigned creators, and matched content (hashtags, keywords, mentions)."
metadata:
  {
    "openclaw":
      {
        "emoji": "📊",
        "requires": { "env": ["CELAVII_API_KEY"] },
        "primaryEnv": "CELAVII_API_KEY",
      },
  }
---

# Celavii Campaigns Skill

Track and analyze influencer marketing campaigns via the Celavii Creator Intelligence Platform API.

**Base URL**: `https://www.celavii.com/api/v1`

## Auth

```
Authorization: Bearer $CELAVII_API_KEY
```

## Endpoints

### List all campaigns

```bash
curl -s https://www.celavii.com/api/v1/campaigns \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

**Credits**: 0

### Get campaign metrics

```bash
curl -s https://www.celavii.com/api/v1/campaigns/<campaign_id>/metrics \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

**Credits**: 0

### Get campaign creators

```bash
curl -s https://www.celavii.com/api/v1/campaigns/<campaign_id>/creators \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

**Credits**: 0

### Get campaign content

Find posts matching a campaign's tracked hashtags, keywords, mentions, or direct content links.

```bash
curl -s "https://www.celavii.com/api/v1/campaigns/<campaign_id>/content?match_type=hashtag&sort=engagement&limit=25" \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

| Parameter    | Type    | Required | Description                                                |
| ------------ | ------- | -------- | ---------------------------------------------------------- |
| `match_type` | string  | no       | `all` (default), `direct`, `hashtag`, `keyword`, `mention` |
| `sort`       | string  | no       | `engagement` (default), `date`, or `relevance`             |
| `limit`      | integer | no       | Results per page (default 25, max 100)                     |
| `cursor`     | string  | no       | Pagination cursor                                          |

**Credits**: 1

## Workflow

1. List campaigns to find the campaign ID
2. Pull metrics for performance overview
3. Check assigned creators
4. Search matched content to find top-performing posts

## Notes

- Campaign list, metrics, and creators are all 0 credits — use freely
- Content search costs 1 credit per query
- Use `match_type` to narrow content to specific tracking methods
- Sort by `engagement` to surface top-performing content first
