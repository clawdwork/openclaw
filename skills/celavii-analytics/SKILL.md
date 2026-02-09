---
name: celavii-analytics
description: "Analyze audience demographics, geographic distribution, content niches, network overlap, shared hashtags, and affinity-linked posts via the Celavii API."
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

## Endpoints (all 1 credit each)

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

## Notes

- All analytics endpoints cost 1 credit per query
- Network overlap requires prior follower data — check `/profiles/{id}/network` first
- Use shared hashtags to identify content strategy overlap between creators
- Affinity posts bridge AI-analyzed affinities to actual content via hashtags
