---
name: celavii-knowledge
description: "Manage the Celavii knowledge base via API. Browse folders, create/read/update/delete entries, and perform semantic search for AI agent context retrieval."
user-invocable: false
metadata:
  {
    "openclaw":
      {
        "emoji": "📚",
        "requires": { "env": ["CELAVII_API_KEY"] },
        "primaryEnv": "CELAVII_API_KEY",
      },
  }
---

# Celavii Knowledge Skill

Manage the Celavii knowledge base via the Celavii Creator Intelligence Platform API.

**Base URL**: `https://www.celavii.com/api/v1`

## Auth

```
Authorization: Bearer $CELAVII_API_KEY
```

## Endpoints (all 0 credits)

### List folders

```bash
curl -s https://www.celavii.com/api/v1/knowledge/folders \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

| Parameter          | Type    | Required | Description                            |
| ------------------ | ------- | -------- | -------------------------------------- |
| `parent_folder_id` | string  | no       | Filter to children of a parent folder  |
| `include_children` | boolean | no       | Include nested children (default true) |

### Create a folder

```bash
curl -s -X POST https://www.celavii.com/api/v1/knowledge/folders \
  -H "Authorization: Bearer $CELAVII_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Campaign Research",
    "description": "Research notes for Q1 campaigns",
    "folder_type": "research"
  }'
```

| Field              | Type   | Required | Description                                                       |
| ------------------ | ------ | -------- | ----------------------------------------------------------------- |
| `name`             | string | yes      | Folder name                                                       |
| `description`      | string | no       | Folder description                                                |
| `folder_type`      | string | no       | `general` (default), `brand`, `campaign`, `templates`, `research` |
| `parent_folder_id` | string | no       | UUID of parent folder for nesting                                 |
| `icon_name`        | string | no       | Lucide icon name                                                  |
| `color`            | string | no       | Hex color (e.g., `#8b5cf6`)                                       |

**Requires `knowledge:write` scope.**

### Get folder entries

```bash
curl -s "https://www.celavii.com/api/v1/knowledge/folders/<folder_id>/entries?limit=25" \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

| Parameter | Type    | Required | Description                            |
| --------- | ------- | -------- | -------------------------------------- |
| `limit`   | integer | no       | Results per page (default 25, max 100) |
| `cursor`  | string  | no       | Pagination cursor                      |

### Create an entry

```bash
curl -s -X POST https://www.celavii.com/api/v1/knowledge/entries \
  -H "Authorization: Bearer $CELAVII_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "folder_id": "<folder_uuid>",
    "name": "Creator Brief: @leomessi",
    "content": "## Overview\nKey partnership details...",
    "description": "Partnership brief for Messi collaboration"
  }'
```

| Field         | Type   | Required | Description                               |
| ------------- | ------ | -------- | ----------------------------------------- |
| `folder_id`   | string | yes      | UUID of the target folder                 |
| `name`        | string | yes      | Entry name                                |
| `description` | string | no       | Short description                         |
| `content`     | string | no       | Text content (markdown, JSON, plain text) |
| `source_url`  | string | no       | Source URL reference                      |

**Requires `knowledge:write` scope.**

### Get an entry

```bash
curl -s https://www.celavii.com/api/v1/knowledge/entries/<entry_id> \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

### Update an entry

```bash
curl -s -X PUT https://www.celavii.com/api/v1/knowledge/entries/<entry_id> \
  -H "Authorization: Bearer $CELAVII_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Creator Brief: @leomessi (Updated)",
    "content": "## Updated Overview\nRevised details..."
  }'
```

| Field         | Type   | Required | Description                      |
| ------------- | ------ | -------- | -------------------------------- |
| `name`        | string | no       | Updated name                     |
| `description` | string | no       | Updated description              |
| `content`     | string | no       | Updated content                  |
| `summary`     | string | no       | Updated summary                  |
| `folder_id`   | string | no       | Move entry to a different folder |

At least one field must be provided. **Requires `knowledge:write` scope.**

### Delete an entry

```bash
curl -s -X DELETE https://www.celavii.com/api/v1/knowledge/entries/<entry_id> \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

Soft-deletes the entry (sets `is_active = false`). **Requires `knowledge:write` scope.**

### Semantic search (AI context)

```bash
curl -s "https://www.celavii.com/api/v1/knowledge/context?query=partnership+terms+for+creators&max_results=3" \
  -H "Authorization: Bearer $CELAVII_API_KEY"
```

| Parameter     | Type    | Required | Description                 |
| ------------- | ------- | -------- | --------------------------- |
| `query`       | string  | yes      | Natural language query      |
| `max_results` | integer | no       | Maximum results (default 5) |

## Workflow

1. Browse folders to find the right location
2. Use semantic search to find existing relevant entries
3. Create or update entries with research findings
4. Organize into folders by campaign, brand, or research topic

## Notes

- All knowledge endpoints are 0 credits
- Read operations require `knowledge:read` scope
- Write operations (create, update, delete folders/entries) require `knowledge:write` scope
- Semantic search is ideal for retrieving context before making decisions
- Content supports markdown, JSON, and plain text
