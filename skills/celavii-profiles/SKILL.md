---
name: celavii-profiles
description: "Get detailed creator intelligence from the Celavii API. Look up full profiles, AI-analyzed affinities, recent posts, network data, followers/following lists, social links, and contact info."
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

## Endpoints (all 0 credits)

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

## Notes

- All profile endpoints cost 0 credits — use freely for research
- Use `celavii-discover` to find creators first, then drill down here
- Network data (followers/following lists) requires prior scrape — check `/network` first
- Contact info requires the `profiles:contact` scope on the API key
