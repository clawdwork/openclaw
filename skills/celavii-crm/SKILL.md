---
name: celavii-crm
description: "Manage creator relationships and pipeline via the Celavii API. View and update managed profiles with CRM data, pipeline summary, org-level stats. Full list CRUD: create/update/delete lists and add/remove members."
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

## Manage / CRM Endpoints (0 credits, manage:read or manage:write scope)

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

### Upsert CRM relationship

Create or update a CRM relationship for a profile. Creates the relationship if none exists; updates only the provided fields if it does.

```bash
curl -s -X PATCH https://www.celavii.com/api/v1/manage/profiles/leomessi \
  -H "Authorization: Bearer $CELAVII_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "outreached",
    "notes": "Reached out via DM on 2/10",
    "tags": ["q1-campaign", "lifestyle"],
    "budget": 2500,
    "custom_email": "manager@example.com",
    "campaign_type": "sponsored_post",
    "last_contacted_at": "2026-02-10T00:00:00Z"
  }'
```

| Field               | Type     | Required | Description                              |
| ------------------- | -------- | -------- | ---------------------------------------- |
| `status`            | string   | no       | Pipeline status (see valid values below) |
| `notes`             | string   | no       | Free-text notes                          |
| `tags`              | string[] | no       | Custom tags                              |
| `assignee_id`       | string   | no       | UUID of assignee                         |
| `budget`            | number   | no       | Budget amount                            |
| `custom_email`      | string   | no       | Contact email override                   |
| `campaign_type`     | string   | no       | Campaign type label                      |
| `last_contacted_at` | string   | no       | ISO 8601 date of last contact            |

**Valid statuses**: `not_started`, `shortlisted`, `outreached`, `needs_follow_up`, `replied`, `negotiating`, `hired`, `product_sent`, `content_received`, `paid`, `on_hold`, `declined`, `ghosted`, `relationship_ended`

**Credits**: 0. **Requires `manage:write` scope.**

### Delete CRM relationship

Remove the CRM record for a profile. Does NOT delete the profile itself.

```bash
curl -s -X DELETE https://www.celavii.com/api/v1/manage/profiles/leomessi \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

**Credits**: 0. **Requires `manage:write` scope.**

## List Endpoints (lists:read or lists:write scope)

### List all profile lists

```bash
curl -s https://www.celavii.com/api/v1/lists \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

### Create a list

```bash
curl -s -X POST https://www.celavii.com/api/v1/lists \
  -H "Authorization: Bearer $CELAVII_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Q1 Fitness Creators", "description": "Shortlist for spring campaign", "color": "#6366f1", "icon": "list" }'
```

| Field         | Type   | Required | Description                |
| ------------- | ------ | -------- | -------------------------- |
| `name`        | string | yes      | List name                  |
| `description` | string | no       | Description                |
| `color`       | string | no       | Hex color (e.g. `#6366f1`) |
| `icon`        | string | no       | Icon name                  |

**Credits**: 1. **Requires `lists:write` scope.**

### Get single list

```bash
curl -s https://www.celavii.com/api/v1/lists/<list_id> \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

Returns list details with member count. **Credits**: 0.

### Update list metadata

```bash
curl -s -X PATCH https://www.celavii.com/api/v1/lists/<list_id> \
  -H "Authorization: Bearer $CELAVII_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Updated Name", "description": "New description" }'
```

At least one field required (`name`, `description`, `color`, `icon`). **Credits**: 0. **Requires `lists:write` scope.**

### Delete list

Deletes the list and all its member associations.

```bash
curl -s -X DELETE https://www.celavii.com/api/v1/lists/<list_id> \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

**Credits**: 0. **Requires `lists:write` scope.**

### Get list members

```bash
curl -s "https://www.celavii.com/api/v1/lists/<list_id>/members?limit=25" \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

| Parameter | Type    | Required | Description                            |
| --------- | ------- | -------- | -------------------------------------- |
| `limit`   | integer | no       | Results per page (default 25, max 100) |
| `cursor`  | string  | no       | Pagination cursor                      |

### Add profiles to list

```bash
curl -s -X POST https://www.celavii.com/api/v1/lists/<list_id>/members \
  -H "Authorization: Bearer $CELAVII_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "profiles": ["leomessi", "@selenagomez", "ig:427553890"] }'
```

| Field      | Type     | Required | Description                              |
| ---------- | -------- | -------- | ---------------------------------------- |
| `profiles` | string[] | yes      | Usernames, @handles, or ig:IDs (max 500) |

Resolves identifiers automatically. **Credits**: 1. **Requires `lists:write` scope.**

### Remove profiles from list

```bash
curl -s -X DELETE https://www.celavii.com/api/v1/lists/<list_id>/members \
  -H "Authorization: Bearer $CELAVII_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "profiles": ["leomessi", "@selenagomez"] }'
```

| Field      | Type     | Required | Description                              |
| ---------- | -------- | -------- | ---------------------------------------- |
| `profiles` | string[] | yes      | Usernames, @handles, or ig:IDs (max 500) |

**Credits**: 0. **Requires `lists:write` scope.**

## Workflow

1. Check pipeline summary for high-level CRM status
2. Get org stats for overall health
3. Browse managed profiles for detailed relationship data
4. Update creator statuses as outreach progresses (`PATCH /manage/profiles/:identifier`)
5. Create lists for campaign shortlists (`POST /lists`)
6. Add/remove creators from lists as pipeline evolves

## Notes

- Read endpoints (manage:read, lists:read) cost 0 credits — use freely for monitoring
- Write endpoints require `manage:write` or `lists:write` scopes
- Creating a list and adding members each cost 1 credit
- CRM relationship upsert is idempotent — safe to call repeatedly with partial updates
- Valid pipeline statuses: not_started → shortlisted → outreached → needs_follow_up → replied → negotiating → hired → product_sent → content_received → paid (or on_hold / declined / ghosted / relationship_ended)
- Use `celavii-profiles` to get detailed creator info for any managed profile
