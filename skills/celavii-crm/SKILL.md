---
name: celavii-crm
description: "Manage creator relationships and pipeline via the Celavii API. View managed profiles with CRM data, pipeline summary, org-level stats, profile lists, and list members."
metadata:
  {
    "openclaw":
      {
        "emoji": "🤝",
        "requires": { "env": ["CELAVII_API_KEY"] },
        "primaryEnv": "CELAVII_API_KEY",
      },
  }
---

# Celavii CRM Skill

Manage creator relationships and pipeline via the Celavii Creator Intelligence Platform API.

**Base URL**: `https://www.celavii.com/api/v1`

## Auth

```
Authorization: Bearer $CELAVII_API_KEY
```

## Endpoints (all 0 credits)

### Get managed profiles

```bash
curl -s "https://www.celavii.com/api/v1/manage/profiles?limit=25" \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

| Parameter | Type    | Required | Description                            |
| --------- | ------- | -------- | -------------------------------------- |
| `limit`   | integer | no       | Results per page (default 25, max 100) |
| `cursor`  | string  | no       | Pagination cursor                      |

Returns profiles with CRM relationship data (status, pipeline stage).

### Get pipeline summary

```bash
curl -s https://www.celavii.com/api/v1/manage/summary \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

Returns CRM pipeline breakdown (how many in outreach, contracted, etc.).

### Get org-level stats

```bash
curl -s https://www.celavii.com/api/v1/manage/stats \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

Returns organization-level statistics.

### List all profile lists

```bash
curl -s https://www.celavii.com/api/v1/lists \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

### Get list members

```bash
curl -s "https://www.celavii.com/api/v1/lists/<list_id>/members?limit=25" \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

| Parameter | Type    | Required | Description                            |
| --------- | ------- | -------- | -------------------------------------- |
| `limit`   | integer | no       | Results per page (default 25, max 100) |
| `cursor`  | string  | no       | Pagination cursor                      |

## Workflow

1. Check pipeline summary for high-level CRM status
2. Get org stats for overall health
3. Browse managed profiles for detailed relationship data
4. Pull list members for specific campaign shortlists

## Notes

- All CRM endpoints are 0 credits — use freely for pipeline monitoring
- Use `celavii-profiles` to get detailed creator info for any managed profile
- Lists are useful for organizing creators by campaign, tier, or status
