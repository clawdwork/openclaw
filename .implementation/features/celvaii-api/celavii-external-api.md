# External API v1

> **Base URL**: `https://celavii.com/api/v1`  
> **Last Updated**: 2026-02-08  
> **Category**: Developer Reference  
> **Live Docs**: `GET /api/v1/docs` (markdown) · `GET /api/v1/openapi.json` (OpenAPI 3.1)

---

## Overview

The Celavii External API v1 provides programmatic access to the Creator Intelligence Platform. It exposes **45 authenticated endpoints** across 10 categories plus 2 public documentation endpoints. All data is scoped to the API key's organization.

**Key characteristics:**

- REST over HTTPS, JSON request/response bodies
- Bearer token authentication (`cvii_live_*` keys)
- Scope-based access control (14 scopes)
- Tiered rate limiting (Starter / Pro / Enterprise)
- Credit-based metering for compute-heavy endpoints
- Cursor-based pagination for list endpoints

---

## Authentication

Every request (except `/docs` and `/openapi.json`) requires a valid API key in the `Authorization` header:

```
Authorization: Bearer cvii_live_<your_key>
```

### Key format

All keys start with `cvii_live_` and are 34 characters total. Keys are hashed with SHA-256 for O(1) database lookups — the plaintext key is never stored.

### Key provisioning

API keys are created in the database table `organization_api_keys` with:

- `provider`: `celavii`
- `purpose`: `external_api`
- `status`: `active`
- `scopes`: JSON array of granted scopes
- `rateLimitTier`: `starter` | `pro` | `enterprise`
- `expiresAt`: optional expiration date

### Auth failure protection

- **15 failed attempts** per IP within a **5-minute window** triggers an IP-level lockout
- Failed attempts are tracked in Redis (`auth:fail:{ip}`)
- Lockout returns `429 RATE_LIMITED` with `Retry-After` header

### Internal implementation

- **Route**: `src/app/api/v1/_lib/auth.ts` → `authenticateApiKey(request, requiredScope?)`
- Returns `ApiContext` on success or `NextResponse` error on failure
- Type guard: `isAuthError(result)` checks if result is an error response

---

## Scopes

API keys are granted scopes that control which endpoints they can access. Scopes are stored as a JSONB array on the key record.

### Available scopes (14)

| Scope                 | Description                                               | Default |
| --------------------- | --------------------------------------------------------- | ------- |
| `profiles:read`       | Search and view profiles                                  | ✅      |
| `profiles:affinities` | View AI-analyzed affinities                               | ✅      |
| `profiles:posts`      | View profile posts                                        | ✅      |
| `profiles:network`    | View follower/following data                              | ✅      |
| `profiles:contact`    | View contact info (emails, phones)                        | ❌      |
| `campaigns:read`      | View campaigns and metrics                                | ✅      |
| `lists:read`          | View lists and members                                    | ✅      |
| `analytics:read`      | View demographics, locations, niches                      | ✅      |
| `manage:read`         | View CRM pipeline and statuses                            | ✅      |
| `knowledge:read`      | View knowledge base folders and entries                   | ✅      |
| `knowledge:write`     | Create, update, delete entries and folders                | ❌      |
| `enhance:trigger`     | Trigger profile enhancements (costs credits)              | ❌      |
| `scrape:trigger`      | Trigger follower/location/tag/URL scrapes (costs credits) | ❌      |

### Scope groups

| Group         | Expands to                                                          |
| ------------- | ------------------------------------------------------------------- |
| `read_all`    | All read scopes (excludes `:trigger`, `:write`, `profiles:contact`) |
| `full_access` | All 14 scopes                                                       |

### Internal implementation

- **File**: `src/app/api/v1/_lib/scopes.ts`
- `hasScope(scopes, required)` — checks if scope array includes the required scope
- `expandScopes(scopes)` — expands scope groups into individual scopes
- `getDefaultScopes()` — returns scopes where `default: true`

---

## Rate Limits

Rate limits are enforced per API key using Redis sliding windows.

| Tier           | Requests/min | Requests/hour | Requests/day |
| -------------- | ------------ | ------------- | ------------ |
| **Starter**    | 20           | 300           | 2,000        |
| **Pro**        | 60           | 1,000         | 10,000       |
| **Enterprise** | 300          | 10,000        | 100,000      |

### Response headers

Every response includes rate limit headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1706745600
```

When rate limited, the response includes a `Retry-After` header with seconds to wait.

---

## Response Format

### Success envelope

```json
{
  "data": { ... },
  "meta": {
    "request_id": "req_mldb8bxv4nkk2qai",
    "timestamp": "2026-02-08T05:36:04.643Z",
    "duration_ms": 228,
    "credits_used": 0
  },
  "pagination": {
    "cursor": "eyJpZCI6Ijk5OTk...",
    "has_more": true,
    "limit": 25,
    "returned": 25,
    "total": 142
  }
}
```

- `pagination` is only present on list endpoints
- `credits_used` reflects the credits consumed by this request

### Error envelope

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "name is required (non-empty string)",
    "status": 400
  },
  "meta": {
    "request_id": "req_abc123",
    "timestamp": "2026-02-08T05:36:04.643Z"
  }
}
```

### Error codes

| Code               | HTTP Status | Description                                      |
| ------------------ | ----------- | ------------------------------------------------ |
| `UNAUTHORIZED`     | 401         | Missing, invalid, or expired API key             |
| `FORBIDDEN`        | 403         | API key lacks required scope                     |
| `NOT_FOUND`        | 404         | Resource not found                               |
| `VALIDATION_ERROR` | 400         | Invalid request parameters or body               |
| `RATE_LIMITED`     | 429         | Rate limit exceeded (check `Retry-After` header) |
| `QUOTA_EXCEEDED`   | 402         | Credit quota exhausted                           |
| `INTERNAL_ERROR`   | 500         | Server error                                     |

### Internal implementation

- **File**: `src/app/api/v1/_lib/response.ts`
- `apiResponse(data, opts)` — builds success response with envelope
- `apiError(code, message, opts)` — builds error response

---

## Credits

Some endpoints consume credits. Credit costs are defined per endpoint:

| Endpoint                     | Credits                      |
| ---------------------------- | ---------------------------- |
| `profiles:search`            | 1                            |
| `profiles:search-affinities` | 1                            |
| `analytics:demographics`     | 1                            |
| `analytics:locations`        | 1                            |
| `analytics:niches`           | 1                            |
| `analytics:network-overlap`  | 1                            |
| `analytics:shared-hashtags`  | 1                            |
| `enhance:profiles`           | 1-2 per profile + Apify cost |
| `scrape:followers`           | 2 + Apify cost               |
| `scrape:following`           | 2 + Apify cost               |
| `scrape:locations`           | 1 + Apify cost               |
| `scrape:hashtags`            | 1 + Apify cost               |
| `scrape:urls`                | 1 + Apify cost               |
| `campaigns:content`          | 1                            |
| `analytics:hashtag-creators` | 1                            |
| `content:search`             | 1                            |
| `analytics:affinity-posts`   | 1                            |
| All other endpoints          | 0                            |

---

## Profile Identifiers

All profile-related endpoints accept **three identifier formats**:

| Format      | Example        | Description                            |
| ----------- | -------------- | -------------------------------------- |
| Username    | `leomessi`     | Instagram username (most common)       |
| @handle     | `@leomessi`    | With @ prefix (stripped automatically) |
| Internal ID | `ig:427553890` | Internal `ig:` prefixed numeric ID     |

```
GET /profiles/leomessi          ← username
GET /profiles/@leomessi         ← @handle (@ is stripped)
GET /profiles/ig:427553890      ← internal ID
```

### Resolution logic

1. Input is cleaned: URI-decoded, `@` stripped, trimmed (`cleanProfileRef`)
2. If already `ig:` format → direct Prisma lookup
3. Otherwise → `api.resolve_profile_ref` RPC (exact match, no fuzzy)
4. Endpoints whose RPCs handle resolution internally pass the cleaned ref directly
5. Endpoints requiring `ig:IDs` (e.g., enhancement) use `resolveProfileRefs` helper

**Internal implementation**: `src/app/api/v1/_lib/helpers.ts`

---

## Endpoints Reference (45 total)

### Meta (2 endpoints)

#### `GET /me`

Returns API key info, organization details, and usage summary.

**Scope**: any valid key  
**Credits**: 0

```bash
curl -s https://celavii.com/api/v1/me \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

#### `GET /usage`

Returns credit usage summary and recent endpoint activity.

**Scope**: any valid key  
**Credits**: 0

```bash
curl -s https://celavii.com/api/v1/usage \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

### Profiles (10 endpoints)

#### `GET /profiles/search`

Search profiles by username, name, bio keywords, niche, and follower range.

**Scope**: `profiles:read`  
**Credits**: 1

| Parameter       | Type    | Required | Description                                 |
| --------------- | ------- | -------- | ------------------------------------------- |
| `query`         | string  | no       | Search query (username, name, bio keywords) |
| `niche`         | string  | no       | Filter by niche/category                    |
| `min_followers` | integer | no       | Minimum follower count                      |
| `max_followers` | integer | no       | Maximum follower count                      |
| `limit`         | integer | no       | Results per page (default 25, max 100)      |
| `cursor`        | string  | no       | Pagination cursor                           |

```bash
curl -s "https://celavii.com/api/v1/profiles/search?query=fitness&min_followers=10000&limit=10" \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

#### `GET /profiles/search/affinities`

Search profiles by AI-analyzed affinity keywords (topics, brands, locations).

**Scope**: `profiles:read`  
**Credits**: 1

| Parameter        | Type    | Required | Description                                          |
| ---------------- | ------- | -------- | ---------------------------------------------------- |
| `terms`          | string  | yes      | Comma-separated affinity keywords                    |
| `min_confidence` | number  | no       | Minimum confidence threshold (0.0–1.0, default 0.85) |
| `limit`          | integer | no       | Results per page (default 25)                        |

```bash
curl -s "https://celavii.com/api/v1/profiles/search/affinities?terms=fitness,yoga&min_confidence=0.9" \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

#### `GET /profiles/:identifier`

Get full profile details including bio, stats, and metadata.

**Scope**: `profiles:read`  
**Credits**: 0

```bash
curl -s https://celavii.com/api/v1/profiles/leomessi \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

#### `GET /profiles/:identifier/affinities`

Get AI-analyzed brand and topic affinities for a profile.

**Scope**: `profiles:affinities`  
**Credits**: 0

```bash
curl -s https://celavii.com/api/v1/profiles/leomessi/affinities \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

#### `GET /profiles/:identifier/posts`

Get recent posts for a profile.

**Scope**: `profiles:posts`  
**Credits**: 0

| Parameter | Type    | Required | Description                            |
| --------- | ------- | -------- | -------------------------------------- |
| `limit`   | integer | no       | Results per page (default 25, max 100) |

```bash
curl -s "https://celavii.com/api/v1/profiles/leomessi/posts?limit=10" \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

#### `GET /profiles/:identifier/network`

Check network data availability (follower/following counts and scrape status).

**Scope**: `profiles:network`  
**Credits**: 0

```bash
curl -s https://celavii.com/api/v1/profiles/leomessi/network \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

#### `GET /profiles/:identifier/followers`

Get paginated follower list for a profile.

**Scope**: `profiles:network`  
**Credits**: 0

| Parameter | Type    | Required | Description                            |
| --------- | ------- | -------- | -------------------------------------- |
| `limit`   | integer | no       | Results per page (default 25, max 100) |
| `cursor`  | string  | no       | Pagination cursor                      |

```bash
curl -s "https://celavii.com/api/v1/profiles/leomessi/followers?limit=25" \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

#### `GET /profiles/:identifier/following`

Get paginated following list for a profile.

**Scope**: `profiles:network`  
**Credits**: 0

| Parameter | Type    | Required | Description                            |
| --------- | ------- | -------- | -------------------------------------- |
| `limit`   | integer | no       | Results per page (default 25, max 100) |
| `cursor`  | string  | no       | Pagination cursor                      |

```bash
curl -s "https://celavii.com/api/v1/profiles/leomessi/following?limit=25" \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

#### `GET /profiles/:identifier/social-links`

Get extracted social links and external URLs from the profile.

**Scope**: `profiles:read`  
**Credits**: 0

```bash
curl -s https://celavii.com/api/v1/profiles/leomessi/social-links \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

#### `GET /profiles/:identifier/contact`

Get contact information audit (emails, phones, websites).

**Scope**: `profiles:contact`  
**Credits**: 0

```bash
curl -s https://celavii.com/api/v1/profiles/leomessi/contact \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

### Campaigns (4 endpoints)

#### `GET /campaigns`

List all campaigns in the organization.

**Scope**: `campaigns:read`  
**Credits**: 0

```bash
curl -s https://celavii.com/api/v1/campaigns \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

#### `GET /campaigns/:id/metrics`

Get performance metrics for a specific campaign.

**Scope**: `campaigns:read`  
**Credits**: 0

```bash
curl -s https://celavii.com/api/v1/campaigns/<campaign_id>/metrics \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

#### `GET /campaigns/:id/creators`

Get creators assigned to a campaign.

**Scope**: `campaigns:read`  
**Credits**: 0

```bash
curl -s https://celavii.com/api/v1/campaigns/<campaign_id>/creators \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

#### `GET /campaigns/:id/content`

Get posts matching a campaign's tracked hashtags, keywords, mentions, or direct content links.

**Scope**: `campaigns:read`  
**Credits**: 1  
**RPC**: `api.ai_get_campaign_content`

| Parameter    | Type    | Required | Description                                                |
| ------------ | ------- | -------- | ---------------------------------------------------------- |
| `match_type` | string  | no       | `all` (default), `direct`, `hashtag`, `keyword`, `mention` |
| `sort`       | string  | no       | `engagement` (default) or `date`                           |
| `limit`      | integer | no       | Results per page (default 25, max 100)                     |
| `cursor`     | string  | no       | Pagination cursor (published_at timestamp)                 |

```bash
curl -s "https://celavii.com/api/v1/campaigns/<campaign_id>/content?match_type=hashtag&sort=engagement&limit=10" \
  -H "Authorization: Bearer cvii_live_<key>"
```

**Response fields**: `post_id`, `post_url`, `author`, `profile_id`, `caption`, `engagement`, `likes_count`, `comments_count`, `published_at`, `matched_hashtags[]`, `matched_keywords[]`, `match_source`, `post_type`

---

### Lists (2 endpoints)

#### `GET /lists`

List all profile lists in the organization.

**Scope**: `lists:read`  
**Credits**: 0

```bash
curl -s https://celavii.com/api/v1/lists \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

#### `GET /lists/:id/members`

Get paginated members of a profile list.

**Scope**: `lists:read`  
**Credits**: 0

| Parameter | Type    | Required | Description                            |
| --------- | ------- | -------- | -------------------------------------- |
| `limit`   | integer | no       | Results per page (default 25, max 100) |
| `cursor`  | string  | no       | Pagination cursor                      |

```bash
curl -s "https://celavii.com/api/v1/lists/<list_id>/members?limit=25" \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

### Analytics (7 endpoints)

#### `GET /analytics/demographics`

Get audience demographics breakdown.

**Scope**: `analytics:read`  
**Credits**: 1

```bash
curl -s https://celavii.com/api/v1/analytics/demographics \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

#### `GET /analytics/locations`

Get geographic distribution of profiles.

**Scope**: `analytics:read`  
**Credits**: 1

```bash
curl -s https://celavii.com/api/v1/analytics/locations \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

#### `GET /analytics/niches`

Get top content niches across the organization's profiles.

**Scope**: `analytics:read`  
**Credits**: 1

```bash
curl -s https://celavii.com/api/v1/analytics/niches \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

#### `GET /analytics/network-overlap`

Calculate follower/following overlap between 2+ profiles.

**Scope**: `analytics:read`  
**Credits**: 1

| Parameter     | Type   | Required | Description                                 |
| ------------- | ------ | -------- | ------------------------------------------- |
| `profile_ids` | string | yes      | Comma-separated usernames or ig:IDs (min 2) |

```bash
curl -s "https://celavii.com/api/v1/analytics/network-overlap?profile_ids=leomessi,selenagomez" \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

#### `GET /analytics/shared-hashtags`

Get shared hashtag usage across profiles.

**Scope**: `analytics:read`  
**Credits**: 1

| Parameter   | Type   | Required | Description                         |
| ----------- | ------ | -------- | ----------------------------------- |
| `usernames` | string | yes      | Comma-separated usernames or ig:IDs |

```bash
curl -s "https://celavii.com/api/v1/analytics/shared-hashtags?usernames=leomessi,selenagomez" \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

#### `GET /analytics/hashtag-creators`

Find creators who use specific hashtags, ranked by total usage count.

**Scope**: `analytics:read`  
**Credits**: 1  
**RPC**: `api.ai_get_hashtag_creators`

| Parameter        | Type    | Required | Description                                           |
| ---------------- | ------- | -------- | ----------------------------------------------------- |
| `hashtags`       | string  | yes      | Comma-separated hashtags (max 10, without `#` prefix) |
| `min_post_count` | integer | no       | Minimum total posts using these hashtags              |
| `min_followers`  | integer | no       | Minimum follower count                                |
| `limit`          | integer | no       | Results per page (default 25, max 100)                |

```bash
curl -s "https://celavii.com/api/v1/analytics/hashtag-creators?hashtags=fitness,photography&min_followers=10000&limit=10" \
  -H "Authorization: Bearer cvii_live_<key>"
```

**Response fields**: `profile_id`, `username`, `full_name`, `avatar`, `followers_count`, `total_hashtag_posts`, `hashtags_matched[]`, `last_used_at`, `engagement_rate`

---

#### `GET /analytics/affinity-posts`

Find posts linked to an affinity concept (topic, brand, location, category) via the hashtag bridge table.

**Scope**: `analytics:read`  
**Credits**: 1  
**RPC**: `api.ai_get_affinity_posts`

| Parameter        | Type    | Required | Description                                                |
| ---------------- | ------- | -------- | ---------------------------------------------------------- |
| `affinity`       | string  | yes      | Affinity search term (e.g. `photography`, `Nike`, `Miami`) |
| `affinity_type`  | string  | no       | `all` (default), `topic`, `brand`, `location`, `category`  |
| `min_engagement` | integer | no       | Minimum engagement count                                   |
| `sort`           | string  | no       | `engagement` (default) or `date`                           |
| `limit`          | integer | no       | Results per page (default 25, max 100)                     |

```bash
curl -s "https://celavii.com/api/v1/analytics/affinity-posts?affinity=photography&affinity_type=topic&limit=10" \
  -H "Authorization: Bearer cvii_live_<key>"
```

**Response fields**: `post_id`, `post_url`, `author`, `profile_id`, `caption`, `engagement`, `published_at`, `matched_affinity`, `matched_affinity_type`, `bridge_hashtag`

---

### Content (1 endpoint)

#### `GET /content/search`

Full-text search across post captions using GIN index. Returns relevance-ranked results with hashtags.

**Scope**: `analytics:read`  
**Credits**: 1  
**RPC**: `api.ai_search_post_content`

| Parameter        | Type    | Required | Description                                    |
| ---------------- | ------- | -------- | ---------------------------------------------- |
| `query`          | string  | yes      | Search keywords (e.g. `fitness miami`)         |
| `min_engagement` | integer | no       | Minimum engagement count                       |
| `author`         | string  | no       | Filter by author username                      |
| `since`          | string  | no       | Only posts after this date (ISO 8601)          |
| `sort`           | string  | no       | `relevance` (default), `engagement`, or `date` |
| `limit`          | integer | no       | Results per page (default 25, max 100)         |

```bash
curl -s "https://celavii.com/api/v1/content/search?query=fitness+miami&sort=relevance&limit=10" \
  -H "Authorization: Bearer cvii_live_<key>"
```

**Response fields**: `post_id`, `post_url`, `author`, `profile_id`, `caption`, `engagement`, `published_at`, `relevance_score`, `hashtags[]`

---

### Manage / CRM (3 endpoints)

#### `GET /manage/profiles`

Get managed profiles with CRM relationship data.

**Scope**: `manage:read`  
**Credits**: 0

| Parameter | Type    | Required | Description                            |
| --------- | ------- | -------- | -------------------------------------- |
| `limit`   | integer | no       | Results per page (default 25, max 100) |
| `cursor`  | string  | no       | Pagination cursor                      |

```bash
curl -s "https://celavii.com/api/v1/manage/profiles?limit=25" \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

#### `GET /manage/summary`

Get CRM pipeline summary.

**Scope**: `manage:read`  
**Credits**: 0

```bash
curl -s https://celavii.com/api/v1/manage/summary \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

#### `GET /manage/stats`

Get organization-level statistics.

**Scope**: `manage:read`  
**Credits**: 0

```bash
curl -s https://celavii.com/api/v1/manage/stats \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

### Knowledge Base (8 endpoints)

#### `GET /knowledge/folders`

List knowledge base folders.

**Scope**: `knowledge:read`  
**Credits**: 0

| Parameter          | Type    | Required | Description                            |
| ------------------ | ------- | -------- | -------------------------------------- |
| `parent_folder_id` | string  | no       | Filter to children of a parent folder  |
| `include_children` | boolean | no       | Include nested children (default true) |

```bash
curl -s https://celavii.com/api/v1/knowledge/folders \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

#### `POST /knowledge/folders`

Create a new knowledge folder.

**Scope**: `knowledge:write`  
**Credits**: 0

| Field              | Type   | Required | Description                                                       |
| ------------------ | ------ | -------- | ----------------------------------------------------------------- |
| `name`             | string | yes      | Folder name                                                       |
| `description`      | string | no       | Folder description                                                |
| `folder_type`      | string | no       | `general` (default), `brand`, `campaign`, `templates`, `research` |
| `parent_folder_id` | string | no       | UUID of parent folder for nesting                                 |
| `icon_name`        | string | no       | Lucide icon name                                                  |
| `color`            | string | no       | Hex color (e.g. `#8b5cf6`)                                        |

```bash
curl -s -X POST https://celavii.com/api/v1/knowledge/folders \
  -H "Authorization: Bearer cvii_live_<key>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Campaign Research",
    "description": "Research notes for Q1 campaigns",
    "folder_type": "research"
  }'
```

---

#### `GET /knowledge/folders/:id/entries`

Get paginated entries within a folder.

**Scope**: `knowledge:read`  
**Credits**: 0

| Parameter | Type    | Required | Description                            |
| --------- | ------- | -------- | -------------------------------------- |
| `limit`   | integer | no       | Results per page (default 25, max 100) |
| `cursor`  | string  | no       | Pagination cursor                      |

```bash
curl -s "https://celavii.com/api/v1/knowledge/folders/<folder_id>/entries?limit=10" \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

#### `POST /knowledge/entries`

Create a new text knowledge entry (no file uploads via API).

**Scope**: `knowledge:write`  
**Credits**: 0

| Field         | Type   | Required | Description                               |
| ------------- | ------ | -------- | ----------------------------------------- |
| `folder_id`   | string | yes      | UUID of the target folder                 |
| `name`        | string | yes      | Entry name                                |
| `description` | string | no       | Short description                         |
| `content`     | string | no       | Text content (markdown, JSON, plain text) |
| `source_url`  | string | no       | Source URL reference                      |

```bash
curl -s -X POST https://celavii.com/api/v1/knowledge/entries \
  -H "Authorization: Bearer cvii_live_<key>" \
  -H "Content-Type: application/json" \
  -d '{
    "folder_id": "<folder_uuid>",
    "name": "Creator Brief: @leomessi",
    "content": "## Overview\nKey partnership details...",
    "description": "Partnership brief for Messi collaboration"
  }'
```

---

#### `GET /knowledge/entries/:id`

Get a single knowledge entry with full content.

**Scope**: `knowledge:read`  
**Credits**: 0

```bash
curl -s https://celavii.com/api/v1/knowledge/entries/<entry_id> \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

#### `PUT /knowledge/entries/:id`

Update a knowledge entry. Only provided fields are updated.

**Scope**: `knowledge:write`  
**Credits**: 0

| Field         | Type   | Required | Description                      |
| ------------- | ------ | -------- | -------------------------------- |
| `name`        | string | no       | Updated name                     |
| `description` | string | no       | Updated description              |
| `content`     | string | no       | Updated content                  |
| `summary`     | string | no       | Updated summary                  |
| `folder_id`   | string | no       | Move entry to a different folder |

At least one field must be provided.

```bash
curl -s -X PUT https://celavii.com/api/v1/knowledge/entries/<entry_id> \
  -H "Authorization: Bearer cvii_live_<key>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Creator Brief: @leomessi (Updated)",
    "content": "## Updated Overview\nRevised partnership details..."
  }'
```

---

#### `DELETE /knowledge/entries/:id`

Soft-delete a knowledge entry (sets `is_active = false`).

**Scope**: `knowledge:write`  
**Credits**: 0

```bash
curl -s -X DELETE https://celavii.com/api/v1/knowledge/entries/<entry_id> \
  -H "Authorization: Bearer cvii_live_<key>"
```

**Response:**

```json
{
  "data": { "deleted": true, "id": "<entry_id>" },
  "meta": { ... }
}
```

---

#### `GET /knowledge/context`

Semantic search across knowledge base entries (for AI agent context).

**Scope**: `knowledge:read`  
**Credits**: 0

| Parameter     | Type    | Required | Description                 |
| ------------- | ------- | -------- | --------------------------- |
| `query`       | string  | yes      | Natural language query      |
| `max_results` | integer | no       | Maximum results (default 5) |

```bash
curl -s "https://celavii.com/api/v1/knowledge/context?query=partnership+terms+for+creators&max_results=3" \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

### Enhancement (2 endpoints)

#### `POST /enhance/profiles`

Trigger profile enhancement to refresh and enrich profile data via Apify scraping.

**Scope**: `enhance:trigger`  
**Credits**: 1-2 per profile + Apify cost

| Field      | Type     | Required | Description                                        |
| ---------- | -------- | -------- | -------------------------------------------------- |
| `profiles` | string[] | yes      | Usernames, @handles, or ig:IDs (max 500)           |
| `mode`     | string   | no       | `basic` (default) or `enhanced`                    |
| `dry_run`  | boolean  | no       | If `true`, returns cost estimate without executing |

```bash
# Dry run — check cost first
curl -s -X POST https://celavii.com/api/v1/enhance/profiles \
  -H "Authorization: Bearer cvii_live_<key>" \
  -H "Content-Type: application/json" \
  -d '{
    "profiles": ["leomessi", "selenagomez"],
    "mode": "basic",
    "dry_run": true
  }'

# Execute
curl -s -X POST https://celavii.com/api/v1/enhance/profiles \
  -H "Authorization: Bearer cvii_live_<key>" \
  -H "Content-Type: application/json" \
  -d '{
    "profiles": ["leomessi", "selenagomez"],
    "mode": "basic",
    "dry_run": false
  }'
```

---

#### `GET /enhance/:jobId/status`

Check the progress of an enhancement job.

**Scope**: `enhance:trigger`  
**Credits**: 0

```bash
curl -s https://celavii.com/api/v1/enhance/<job_id>/status \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

### Scrape / Data Collection (6 endpoints)

#### `POST /scrape/followers`

Trigger a follower collection scrape for a profile.

**Scope**: `scrape:trigger`  
**Credits**: 2 + Apify cost

| Field         | Type    | Required | Description                              |
| ------------- | ------- | -------- | ---------------------------------------- |
| `username`    | string  | yes\*    | Instagram username                       |
| `profile_id`  | string  | yes\*    | Or provide ig:ID instead                 |
| `max_results` | integer | no       | Max followers to collect (default 10000) |
| `dry_run`     | boolean | no       | Cost estimate only                       |

\*Provide either `username` or `profile_id`.

```bash
curl -s -X POST https://celavii.com/api/v1/scrape/followers \
  -H "Authorization: Bearer cvii_live_<key>" \
  -H "Content-Type: application/json" \
  -d '{"username": "leomessi", "max_results": 5000, "dry_run": true}'
```

---

#### `POST /scrape/following`

Trigger a following collection scrape for a profile.

**Scope**: `scrape:trigger`  
**Credits**: 2 + Apify cost

Same parameters as `/scrape/followers`.

```bash
curl -s -X POST https://celavii.com/api/v1/scrape/following \
  -H "Authorization: Bearer cvii_live_<key>" \
  -H "Content-Type: application/json" \
  -d '{"username": "leomessi", "max_results": 5000, "dry_run": true}'
```

---

#### `POST /scrape/locations`

Collect posts from specific Instagram locations.

**Scope**: `scrape:trigger`  
**Credits**: 1 + Apify cost

| Field          | Type     | Required | Description                       |
| -------------- | -------- | -------- | --------------------------------- |
| `location_ids` | string[] | yes\*    | Instagram location IDs            |
| `start_urls`   | string[] | yes\*    | Or provide location URLs          |
| `max_items`    | integer  | no       | Max posts to collect (default 50) |
| `until`        | string   | no       | ISO date cutoff                   |
| `dry_run`      | boolean  | no       | Cost estimate only                |

```bash
curl -s -X POST https://celavii.com/api/v1/scrape/locations \
  -H "Authorization: Bearer cvii_live_<key>" \
  -H "Content-Type: application/json" \
  -d '{"location_ids": ["123456"], "max_items": 50, "dry_run": true}'
```

---

#### `POST /scrape/hashtags`

Collect posts from specific hashtags.

**Scope**: `scrape:trigger`  
**Credits**: 1 + Apify cost

| Field       | Type     | Required | Description                            |
| ----------- | -------- | -------- | -------------------------------------- |
| `hashtags`  | string[] | yes      | Hashtags to scrape (max 10, without #) |
| `max_items` | integer  | no       | Max posts per hashtag (default 100)    |
| `dry_run`   | boolean  | no       | Cost estimate only                     |

```bash
curl -s -X POST https://celavii.com/api/v1/scrape/hashtags \
  -H "Authorization: Bearer cvii_live_<key>" \
  -H "Content-Type: application/json" \
  -d '{"hashtags": ["fitness", "yoga"], "max_items": 100, "dry_run": true}'
```

---

#### `POST /scrape/urls`

Collect data from specific Instagram URLs.

**Scope**: `scrape:trigger`  
**Credits**: 1 + Apify cost

| Field       | Type     | Required | Description                    |
| ----------- | -------- | -------- | ------------------------------ |
| `urls`      | string[] | yes      | Instagram URLs (max 20)        |
| `max_items` | integer  | no       | Max items per URL (default 50) |
| `dry_run`   | boolean  | no       | Cost estimate only             |

```bash
curl -s -X POST https://celavii.com/api/v1/scrape/urls \
  -H "Authorization: Bearer cvii_live_<key>" \
  -H "Content-Type: application/json" \
  -d '{"urls": ["https://instagram.com/p/..."], "max_items": 50, "dry_run": true}'
```

---

#### `GET /scrape/:jobId/status`

Check the progress of a scrape job.

**Scope**: `scrape:trigger`  
**Credits**: 0

```bash
curl -s https://celavii.com/api/v1/scrape/<job_id>/status \
  -H "Authorization: Bearer cvii_live_<key>"
```

---

## Data Isolation

All data is scoped to the API key's organization:

- **Profile details**: Available for any profile in the database, but org-specific fields (e.g., `relationship_status`, CRM data) are only populated for profiles associated with the API key's organization
- **Campaigns, lists, knowledge**: Only returns data belonging to the organization
- **Analytics**: Computed from the organization's tracked profiles only
- **Scrape/enhance jobs**: Only the organization's own jobs are visible

---

## Best Practices

1. **Use usernames** — All profile endpoints accept Instagram usernames directly (e.g., `leomessi`). No need to look up internal IDs.
2. **Always check costs first** — Use `dry_run: true` before enhancement and scrape triggers to see estimated costs.
3. **Poll status** — Enhancement and scrape jobs are asynchronous. Poll the `/:jobId/status` endpoint until completion.
4. **Paginate** — Use cursor-based pagination for large result sets. Check `pagination.has_more` and pass `pagination.cursor` to the next request.
5. **Check rate limits** — Read the `X-RateLimit-Remaining` header before batch operations.
6. **Handle errors gracefully** — Always check for `error.code` in responses. Implement exponential backoff for `RATE_LIMITED`.

---

## Architecture (Dev Team Reference)

### File structure

```
src/app/api/v1/
├── _lib/
│   ├── auth.ts          # authenticateApiKey(), isAuthError()
│   ├── helpers.ts        # cleanProfileRef(), resolveProfileRefs(), resolveOrgUserId()
│   ├── rate-limiter.ts   # Redis-based rate limiting
│   ├── response.ts       # apiResponse(), apiError()
│   ├── scopes.ts         # API_SCOPES, hasScope(), expandScopes()
│   └── types.ts          # ApiContext, RateLimitTier, ENDPOINT_CREDITS
├── docs/route.ts         # GET /docs (public, markdown)
├── openapi.json/route.ts # GET /openapi.json (public, OpenAPI 3.1)
├── me/route.ts
├── usage/route.ts
├── profiles/
│   ├── search/route.ts
│   ├── search/affinities/route.ts
│   ├── [identifier]/route.ts
│   ├── [identifier]/affinities/route.ts
│   ├── [identifier]/posts/route.ts
│   ├── [identifier]/network/route.ts
│   ├── [identifier]/followers/route.ts
│   ├── [identifier]/following/route.ts
│   ├── [identifier]/social-links/route.ts
│   └── [identifier]/contact/route.ts
├── campaigns/route.ts
├── campaigns/[id]/metrics/route.ts
├── campaigns/[id]/creators/route.ts
├── lists/route.ts
├── lists/[id]/members/route.ts
├── analytics/
│   ├── demographics/route.ts
│   ├── locations/route.ts
│   ├── niches/route.ts
│   ├── network-overlap/route.ts
│   └── shared-hashtags/route.ts
├── manage/
│   ├── profiles/route.ts
│   ├── summary/route.ts
│   └── stats/route.ts
├── knowledge/
│   ├── folders/route.ts          # GET + POST
│   ├── folders/[id]/entries/route.ts
│   ├── entries/route.ts          # POST
│   ├── entries/[id]/route.ts     # GET + PUT + DELETE
│   └── context/route.ts
├── enhance/
│   ├── profiles/route.ts
│   └── [jobId]/status/route.ts
└── scrape/
    ├── followers/route.ts
    ├── following/route.ts
    ├── locations/route.ts
    ├── hashtags/route.ts
    ├── urls/route.ts
    └── [jobId]/status/route.ts
```

### Request lifecycle

```
Request → Bearer token extraction → SHA-256 hash → DB lookup →
  Scope check → Rate limit check (Redis) → Route handler →
    RPC call (Supabase) → Response envelope → Rate limit headers
```

### Key constants

| Constant                 | Value                                  | Location      |
| ------------------------ | -------------------------------------- | ------------- |
| `EXTERNAL_API_CALLER_ID` | `00000000-0000-4000-a000-000000000001` | `types.ts`    |
| Key prefix               | `cvii_live_`                           | `auth.ts`     |
| Failed auth limit        | 15 per 5 min per IP                    | `auth.ts`     |
| API version header       | `X-API-Version: v1`                    | `response.ts` |

### Adding a new endpoint

1. Create route file in the appropriate directory under `src/app/api/v1/`
2. Call `authenticateApiKey(request, 'scope:name')` at the top
3. Use `apiResponse()` and `apiError()` for responses
4. Add credit cost to `ENDPOINT_CREDITS` in `types.ts`
5. If new scope needed, add to `API_SCOPES` in `scopes.ts`
6. Track usage with `trackApiUsage()` (fire-and-forget)
7. Update `/docs` route and `/openapi.json` route
8. Test with the test API key

---

## Admin Guide

### Provisioning API keys

API keys are stored in the `organization_api_keys` table. To create a key:

1. Generate a random key with `cvii_live_` prefix (34 chars total)
2. Compute SHA-256 hash of the key
3. Insert into `organization_api_keys`:
   - `organization_id`: the org's UUID
   - `provider`: `celavii`
   - `purpose`: `external_api`
   - `status`: `active`
   - `apiKeyHash`: SHA-256 hex hash
   - `apiKeyEncrypted`: encrypted key (for recovery)
   - `scopes`: JSON array of scopes
   - `rateLimitTier`: `starter`, `pro`, or `enterprise`
   - `expiresAt`: optional expiration timestamp

### Revoking access

Set `status` to `revoked` on the key record. The key will immediately stop working.

### Changing scopes

Update the `scopes` JSONB array on the key record. Changes take effect on the next request (no cache).

### Changing rate limit tier

Update `rateLimitTier` on the key record. Changes take effect on the next request.

### Monitoring usage

- Check `lastUsedAt` on the key record for last activity
- Query `api_usage_logs` table for detailed endpoint-level usage
- Use `GET /usage` endpoint to see credit consumption

---

## Related Pages

- **[Settings](./settings/)** — Organization settings and API key management UI
- **[Discover](./discover.md)** — Profile search (mirrors `/profiles/search`)
- **[Manage](./manage.md)** — CRM pipeline (mirrors `/manage/*`)
- **[Track](./track.md)** — Campaign tracking (mirrors `/campaigns/*`)

---

## Related Concepts

- **[Credits](../concepts/credits.md)** — Credit system and billing
- **[Organizations](../concepts/organizations.md)** — Multi-org architecture

---

_This page is part of the Celavii Knowledge Base for the Platform Assistant._
