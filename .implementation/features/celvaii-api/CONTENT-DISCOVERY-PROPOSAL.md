# External API v1 — Content Discovery & Affinity-Post Integration

## Overview

This proposal outlines 9 integrations that extend the External API v1 with content-level discovery capabilities. These connect the existing affinity system, hashtag graph, and post data into queryable API endpoints — enabling campaign content analysis, keyword search, creator-hashtag discovery, and affinity-to-post bridging.

**Date**: February 8, 2026  
**Status**: Proposed  
**Author**: Engineering  
**Branch**: TBD (suggest `feature/api-v1-content-discovery`)

---

## Context

### Current State

The External API v1 provides profile-level data (search, affinities, demographics) and campaign management. However, **post-level data is not exposed** through the API, and there's no way to:

- Find posts matching a campaign's tracked hashtags/keywords
- Search post captions by keyword
- Discover which creators use specific hashtags
- Bridge AI-generated affinities down to specific posts

### Data Available (already in DB)

| Table                | Records   | Description                                                                              |
| -------------------- | --------- | ---------------------------------------------------------------------------------------- |
| `posts`              | 401,850   | All scraped Instagram posts with captions, URLs, engagement                              |
| `post_hashtags`      | 2,619,529 | Post ↔ hashtag links (~6.5 per post)                                                     |
| `hashtags`           | 467,964   | Unique hashtag dictionary                                                                |
| `profile_hashtags`   | 1,122,176 | Aggregated: which profiles use which hashtags (with counts)                              |
| `campaign_content`   | 584       | Campaign ↔ profile_contents links with metrics                                           |
| `profile_contents`   | ~500K+    | Profile-level content (camelCase cols: `"likesCount"`, `"commentsCount"`, `"contentId"`) |
| `post_mentions`      | 0         | Exists but never populated                                                               |
| `affinity_topics`    | ~2K       | AI-generated topic affinities (profile-level only)                                       |
| `affinity_brands`    | ~470      | AI-generated brand affinities (profile-level only)                                       |
| `affinity_locations` | ~36K      | AI-generated location affinities (profile-level only)                                    |

### Key Gap

Affinities are **profile-level only** — there's no link from an affinity keyword to specific posts. The hashtag graph (2.6M links) provides a natural bridge.

---

## Implementation Phases

> **Note**: Phases continue from the existing v1 Implementation Proposal (Phases 0-5). Phase 5 (Polish & Docs) is the last completed phase.

### Phase 6: Infrastructure — Indexes (Quick Wins)

**Effort**: ~35 minutes  
**Dependencies**: None  
**Value**: Unlocks all subsequent phases

#### P1 — Full-Text Search Index on Post Captions

**What**: Add a `tsvector` generated column + GIN index to `posts.content` for instant keyword search across 401K captions.

**Why**: Without this, keyword search requires sequential scan (2-5s). With GIN index: 5-20ms (100-500x faster).

**Migration**:

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_add_posts_content_tsv.sql
ALTER TABLE posts ADD COLUMN content_tsv tsvector
  GENERATED ALWAYS AS (to_tsvector('english', COALESCE(content, ''))) STORED;

CREATE INDEX CONCURRENTLY idx_posts_content_tsv ON posts USING GIN (content_tsv);
```

**Impact**:

- Storage: ~50-100MB for the generated column + index
- Build time: ~1-2 min on 401K rows
- Auto-updates on insert/update (no triggers needed)
- Enables: P5 (content search endpoint)

**Query example**:

```sql
SELECT id, url, author, engagement
FROM posts
WHERE content_tsv @@ to_tsquery('english', 'photography & miami')
ORDER BY engagement DESC
LIMIT 25;
```

#### P2 — Engagement Index on Posts

**What**: Add a btree index on `posts.engagement` for fast sorting/filtering by engagement count.

**Why**: Every content endpoint will want to sort by engagement. Currently no index exists.

**Migration**:

```sql
-- Include in same migration as P1
CREATE INDEX idx_posts_engagement ON posts(engagement DESC NULLS LAST);
```

**Impact**: Minimal storage, instant speedup for `ORDER BY engagement DESC`.

---

### Phase 7: Core Content Endpoints

**Effort**: ~5-7 hours  
**Dependencies**: Phase 6 (P1, P2)  
**Value**: The 3 endpoints users will actually call daily

#### P3 — `GET /campaigns/:id/content`

**Purpose**: Returns posts matched to a campaign's tracked hashtags, keywords, or mentions.

**Use Case**: _"Show me all posts that match my campaign's hashtags"_

**Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `id` | path | Campaign ID |
| `match_type` | query | `hashtag`, `keyword`, `mention`, or `all` (default: `all`) |
| `sort` | query | `engagement`, `date`, `relevance` (default: `engagement`) |
| `limit` | query | Max 100, default 25 |
| `cursor` | query | Pagination cursor |

**RPC Design**: `api.ai_get_campaign_content`

```sql
CREATE OR REPLACE FUNCTION api.ai_get_campaign_content(
  p_campaign_id text,
  p_org_id uuid,
  p_match_type text DEFAULT 'all',
  p_sort text DEFAULT 'engagement',
  p_limit integer DEFAULT 25,
  p_cursor text DEFAULT NULL
)
RETURNS TABLE(
  post_id text,
  post_url text,
  author text,
  profile_id text,
  caption text,
  engagement integer,
  likes_count integer,
  comments_count integer,
  published_at timestamp,      -- NOTE: posts.published_at is timestamp (no tz)
  matched_hashtags text[],
  matched_keywords text[],
  post_type text
)
```

**Join Strategy**:

```
-- Path A: Existing campaign_content (direct links via profile_contents)
campaign_content → profile_contents (via profile_content_id)
  → profile_contents has: url, caption, "likesCount", "commentsCount", profile_id, type
  → Can also join to posts via: posts.id = 'ig:' || profile_contents."contentId"

-- Path B: Hashtag matching (discover new posts from campaign hashtags)
campaigns.hashtags[] → hashtags.tag → post_hashtags → posts
  → posts has: url, content, engagement, author, profile_id

-- Path C: Keyword matching (requires P1 GIN index)
campaigns.keywords[] → posts.content_tsv (full-text search)

-- Path D: Mention matching (requires P8 backfill)
campaigns.mentions[] → post_mentions → posts
```

**CRITICAL schema notes**:

- `campaigns.organization_id` is **snake_case** (`uuid` type) — NOT `"organizationId"`
- `profile_contents` uses **camelCase**: `"likesCount"`, `"commentsCount"`, `"viewsCount"`, `"contentId"`
- `posts.published_at` is `timestamp without time zone` (NOT timestamptz)
- `posts.content` is the caption column (NOT `caption`)
- `posts.engagement` is the total engagement count

**Scope**: `campaigns:read`  
**Credits**: 1  
**Estimated Response Time**: 50-200ms (indexed joins)

#### P4 — `GET /analytics/hashtag-creators`

**Purpose**: Given hashtag(s), find which creators use them most frequently.

**Use Case**: _"Who are the top creators using #fitness?"_

**Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `hashtags` | query | Comma-separated hashtags (max 10) |
| `min_post_count` | query | Minimum posts with this hashtag (default: 2) |
| `min_followers` | query | Minimum follower count |
| `limit` | query | Max 100, default 25 |

**RPC Design**: `api.ai_get_hashtag_creators`

```sql
CREATE OR REPLACE FUNCTION api.ai_get_hashtag_creators(
  p_hashtags text[],
  p_min_post_count integer DEFAULT 2,
  p_min_followers integer DEFAULT NULL,
  p_limit integer DEFAULT 25
)
RETURNS TABLE(
  profile_id text,
  username text,
  full_name text,
  avatar text,
  followers_count integer,
  total_hashtag_posts integer,
  hashtags_matched text[],
  last_used_at timestamptz,      -- profile_hashtags.last_used_at IS timestamptz ✅
  engagement_rate double precision -- profiles."medianEngagementRate" (camelCase in DB)
)
```

**Data Source**: `profile_hashtags` (1.1M rows, pre-aggregated with `post_count`, already indexed on `hashtag_id` and `post_count DESC`).

**Schema notes**:

- `profile_hashtags.hashtag_id` → `text` (FK to `hashtags.id`)
- `profile_hashtags.post_count` → `integer`
- `profile_hashtags.last_used_at` → `timestamptz`
- Join to `profiles` for name/avatar: `profiles."fullName"`, `profiles."followersCount"` (camelCase)
- Join to `hashtags` for tag name: `hashtags.tag` (snake_case)

**Scope**: `analytics:read`  
**Credits**: 1  
**Estimated Response Time**: 20-50ms (pre-aggregated data)

#### P5 — `GET /content/search`

**Purpose**: Full-text search across post captions. Find posts mentioning a brand, topic, or any keyword.

**Use Case**: _"Find posts mentioning 'Adidas' or 'three stripes'"_

**Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `query` | query | Search keywords (supports AND/OR operators) |
| `min_engagement` | query | Minimum engagement count |
| `author` | query | Filter by username |
| `since` | query | Posts after this date (ISO 8601) |
| `sort` | query | `relevance`, `engagement`, `date` |
| `limit` | query | Max 100, default 25 |

**RPC Design**: `api.ai_search_post_content`

```sql
CREATE OR REPLACE FUNCTION api.ai_search_post_content(
  p_query text,
  p_min_engagement integer DEFAULT NULL,
  p_author text DEFAULT NULL,
  p_since timestamptz DEFAULT NULL,
  p_sort text DEFAULT 'relevance',
  p_limit integer DEFAULT 25
)
RETURNS TABLE(
  post_id text,
  post_url text,
  author text,
  profile_id text,
  caption text,          -- maps to posts.content (column is called 'content', not 'caption')
  engagement integer,
  published_at timestamp,  -- posts.published_at is timestamp (no tz)
  relevance_score real,
  hashtags text[]
)
```

**Key Query Pattern**:

```sql
SELECT p.*, ts_rank(p.content_tsv, query) as relevance_score
FROM posts p, to_tsquery('english', p_query) query
WHERE p.content_tsv @@ query
  AND (p_min_engagement IS NULL OR p.engagement >= p_min_engagement)
ORDER BY
  CASE WHEN p_sort = 'relevance' THEN ts_rank(p.content_tsv, query) END DESC,
  CASE WHEN p_sort = 'engagement' THEN p.engagement END DESC,
  CASE WHEN p_sort = 'date' THEN p.published_at END DESC
LIMIT p_limit;
```

**Scope**: `analytics:read`  
**Credits**: 1  
**Depends On**: P1 (GIN index)  
**Estimated Response Time**: 10-50ms

---

### Phase 8: Affinity ↔ Post Bridge

**Effort**: ~4-5 hours  
**Dependencies**: Phase 6  
**Value**: Connects AI affinity system to post-level data

#### P6 — Hashtag ↔ Affinity Mapping Table

**Purpose**: Create a bridge table that maps hashtags to affinity topics, brands, and locations. This enables querying "posts related to affinity X" through the existing 2.6M `post_hashtags` links.

**Table Design**:

```sql
CREATE TABLE hashtag_affinity_mappings (
  hashtag_id text NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
  affinity_type text NOT NULL CHECK (affinity_type IN ('topic', 'brand', 'location', 'category')),
  affinity_id integer NOT NULL,
  confidence numeric(3,2) DEFAULT 1.00,
  mapping_source text DEFAULT 'auto',  -- 'auto' (name match), 'manual', 'ai'
  created_at timestamptz DEFAULT NOW(),
  PRIMARY KEY (hashtag_id, affinity_type, affinity_id)
);

CREATE INDEX idx_ham_affinity ON hashtag_affinity_mappings(affinity_type, affinity_id);
CREATE INDEX idx_ham_hashtag ON hashtag_affinity_mappings(hashtag_id);
```

**Auto-Population Strategy** (covers ~80% of mappings):

```sql
-- Step 1: Map hashtags to topics by exact name match
INSERT INTO hashtag_affinity_mappings (hashtag_id, affinity_type, affinity_id, confidence, mapping_source)
SELECT h.id, 'topic', at.id, 1.00, 'auto'
FROM hashtags h
JOIN affinity_topics at ON LOWER(h.tag) = LOWER(at.name)
ON CONFLICT DO NOTHING;

-- Step 2: Map hashtags to brands by exact name match
INSERT INTO hashtag_affinity_mappings (hashtag_id, affinity_type, affinity_id, confidence, mapping_source)
SELECT h.id, 'brand', ab.id, 1.00, 'auto'
FROM hashtags h
JOIN affinity_brands ab ON LOWER(h.tag) = LOWER(REPLACE(ab.name, ' ', ''))
ON CONFLICT DO NOTHING;

-- Step 3: Map hashtags to locations by exact name match
INSERT INTO hashtag_affinity_mappings (hashtag_id, affinity_type, affinity_id, confidence, mapping_source)
SELECT h.id, 'location', al.id, 1.00, 'auto'
FROM hashtags h
JOIN affinity_locations al ON LOWER(h.tag) = LOWER(REPLACE(al.name, ' ', ''))
ON CONFLICT DO NOTHING;
```

**Estimated rows**: ~5K-15K auto-mapped (depends on overlap between hashtag names and affinity names).

**Future enrichment**: AI-assisted mapping for fuzzy matches (e.g., `#photolife` → "photography" topic). Can be done via a cron job using OpenAI embeddings.

#### P7 — `GET /analytics/affinity-posts`

**Purpose**: Given an affinity keyword (topic, brand, or location), find matching posts through the hashtag bridge.

**Use Case**: _"Show me posts related to the 'photography' affinity"_

**Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `affinity` | query | Affinity name (e.g., "photography", "Nike", "Miami") |
| `affinity_type` | query | `topic`, `brand`, `location`, or `all` (default: `all`) |
| `min_engagement` | query | Minimum engagement count |
| `sort` | query | `engagement`, `date` |
| `limit` | query | Max 100, default 25 |

**RPC Design**: `api.ai_get_affinity_posts`

```sql
CREATE OR REPLACE FUNCTION api.ai_get_affinity_posts(
  p_affinity text,
  p_affinity_type text DEFAULT 'all',
  p_min_engagement integer DEFAULT NULL,
  p_sort text DEFAULT 'engagement',
  p_limit integer DEFAULT 25
)
RETURNS TABLE(
  post_id text,
  post_url text,
  author text,
  profile_id text,
  caption text,
  engagement integer,
  published_at timestamp,  -- posts.published_at is timestamp (no tz)
  matched_affinity text,
  matched_affinity_type text,
  bridge_hashtag text
)
```

**Join Chain**:

```
affinity_topics/brands/locations (by name ILIKE)
  → hashtag_affinity_mappings
    → post_hashtags (2.6M indexed)
      → posts (with URL, engagement, caption)
```

**Scope**: `analytics:read`  
**Credits**: 1  
**Depends On**: P6 (mapping table)  
**Estimated Response Time**: 30-100ms

---

### Phase 9: Data Enrichment

**Effort**: ~2-3 hours  
**Dependencies**: None  
**Value**: Enables mention-based queries

#### P8 — Populate `post_mentions` Table

**Purpose**: Extract @mentions from post captions and populate the existing (empty) `post_mentions` table. This enables mention-based campaign content matching.

**Extraction Pattern**:

```sql
-- One-time backfill: extract @mentions from all 401K post captions
-- PK is (post_id, mentioned_id) — both text columns
INSERT INTO post_mentions (post_id, username, mentioned_id)
SELECT
  p.id,
  LOWER(mention[1]),
  LOWER(mention[1])  -- mentioned_id = lowercase username (text, not ig: prefixed)
FROM posts p,
  LATERAL regexp_matches(p.content, '@([a-zA-Z0-9_.]{1,30})', 'g') AS mention
WHERE p.content IS NOT NULL AND p.content LIKE '%@%'
ON CONFLICT (post_id, mentioned_id) DO NOTHING;
```

**Estimated output**: ~50K-200K mention records (many posts contain @mentions in captions).

**Ongoing**: Add mention extraction to the post ingestion pipeline so new posts are automatically processed.

**Impact on P3**: Once populated, `GET /campaigns/:id/content` can match posts by campaign `mentions[]` array.

---

### Phase 10: Future — Post-Level AI Affinities (DEFERRED)

**Effort**: Days (new pipeline + significant AI cost)  
**Dependencies**: None  
**Value**: Most granular affinity data, but expensive  
**Status**: DEFERRED — only implement if Phase 8 (hashtag bridge) proves insufficient

#### P9 — Post-Level AI Classification (deferred)

**Purpose**: Run AI classification on individual posts to generate per-post affinities, instead of only profile-level.

**New Tables**:

```sql
CREATE TABLE post_affinity_topics (
  post_id text REFERENCES posts(id),
  topic_id integer REFERENCES affinity_topics(id),
  confidence numeric(3,2),
  PRIMARY KEY (post_id, topic_id)
);

CREATE TABLE post_affinity_brands (
  post_id text REFERENCES posts(id),
  brand_id integer REFERENCES affinity_brands(id),
  confidence numeric(3,2),
  PRIMARY KEY (post_id, brand_id)
);
-- Similar for locations, categories
```

**Cost Estimate**:

- 401K posts × ~$0.001/post (GPT-4o-mini) = ~$400 one-time
- Ongoing: per-post classification during ingestion
- Storage: ~2-5M rows across 4 tables

**When to implement**: Only if Phase 8 (hashtag bridge) proves insufficient for use cases. The hashtag bridge covers most scenarios at zero AI cost.

---

## API Endpoints Summary

| #   | Method | Endpoint                      | Scope            | Credits | Phase | RPC                           |
| --- | ------ | ----------------------------- | ---------------- | ------- | ----- | ----------------------------- |
| P3  | GET    | `/campaigns/:id/content`      | `campaigns:read` | 1       | 7     | `api.ai_get_campaign_content` |
| P4  | GET    | `/analytics/hashtag-creators` | `analytics:read` | 1       | 7     | `api.ai_get_hashtag_creators` |
| P5  | GET    | `/content/search`             | `analytics:read` | 1       | 7     | `api.ai_search_post_content`  |
| P7  | GET    | `/analytics/affinity-posts`   | `analytics:read` | 1       | 8     | `api.ai_get_affinity_posts`   |

---

## New Scopes

No new scopes needed. All endpoints use existing `campaigns:read` and `analytics:read` scopes.

---

## Migration Plan

### Migration 1: Infrastructure (P1 + P2)

```
supabase/migrations/YYYYMMDDHHMMSS_add_posts_content_search.sql
- ALTER TABLE posts ADD COLUMN content_tsv (generated tsvector)
- CREATE INDEX idx_posts_content_tsv (GIN)
- CREATE INDEX idx_posts_engagement (btree DESC)
```

### Migration 2: Hashtag-Affinity Bridge (P6)

```
supabase/migrations/YYYYMMDDHHMMSS_create_hashtag_affinity_mappings.sql
- CREATE TABLE hashtag_affinity_mappings
- CREATE INDEXES
- INSERT auto-mapped rows (topics, brands, locations by name match)
```

### Migration 3: Core RPCs (P3, P4, P5)

```
supabase/migrations/YYYYMMDDHHMMSS_content_discovery_rpcs.sql
- CREATE FUNCTION api.ai_get_campaign_content
- CREATE FUNCTION api.ai_get_hashtag_creators
- CREATE FUNCTION api.ai_search_post_content
- GRANT EXECUTE permissions
```

### Migration 4: Affinity Posts RPC (P7)

```
supabase/migrations/YYYYMMDDHHMMSS_affinity_posts_rpc.sql
- CREATE FUNCTION api.ai_get_affinity_posts
- GRANT EXECUTE permissions
```

### Migration 5: Populate Mentions (P8)

```
supabase/migrations/YYYYMMDDHHMMSS_populate_post_mentions.sql
- Backfill post_mentions from post captions
- Add extraction to ingestion pipeline
```

---

## API Route Integration Steps

Each RPC must be wired to a Next.js API route handler following the established v1 patterns. Below is the step-by-step workflow for each endpoint.

### Standard Route Handler Pattern

Every route follows this structure (reference: `src/app/api/v1/analytics/locations/route.ts`):

```typescript
// 1. Auth + scope check
const auth = await authenticateApiKey(request, '<scope>')
if (isAuthError(auth)) return auth

// 2. Parse & validate query params
const param = request.nextUrl.searchParams.get('param')

// 3. Call RPC via Supabase admin client
const supabase = createAdminClient()
const { data, error } = await supabase.schema('api').rpc('<rpc_name>', { ... })

// 4. Map RPC result to API response format
const mapped = (data || []).map(row => ({ ... }))

// 5. Track usage (fire-and-forget)
trackApiUsage({ ctx: auth, endpoint: '<name>', method: 'GET', ... }).catch(() => {})

// 6. Return standard response with credits + pagination
return apiResponse(mapped, { ctx: auth, startTime, creditsUsed, pagination: { ... } })
```

---

### Phase 7 Route Integration (P3, P4, P5)

#### Step 7.1 — Register credit costs

**File**: `src/app/api/v1/_lib/types.ts`

Add to `ENDPOINT_CREDITS`:

```typescript
'campaigns:content': 1,
'analytics:hashtag-creators': 1,
'content:search': 1,
```

#### Step 7.2 — Create `GET /campaigns/:id/content` route

**File**: `src/app/api/v1/campaigns/[id]/content/route.ts`

| Aspect               | Detail                                                                                                                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scope**            | `campaigns:read`                                                                                                                                                                 |
| **Params**           | `id` (path), `match_type`, `sort`, `limit`, `cursor`                                                                                                                             |
| **RPC**              | `api.ai_get_campaign_content(p_campaign_id, p_org_id, p_match_type, p_sort, p_limit, p_cursor)`                                                                                  |
| **Response mapping** | `post_id`, `post_url`, `author`, `profile_id`, `caption`, `engagement`, `likes_count`, `comments_count`, `published_at`, `matched_hashtags[]`, `matched_keywords[]`, `post_type` |
| **Pagination**       | Cursor-based on `published_at`                                                                                                                                                   |
| **Validation**       | Campaign must belong to org (RPC checks `campaigns.organization_id` — snake_case, uuid)                                                                                          |

**Implementation steps**:

1. Create directory: `src/app/api/v1/campaigns/[id]/content/`
2. Create `route.ts` with GET handler
3. Auth with `campaigns:read` scope
4. Extract `id` from route params, parse query params
5. Call `api.ai_get_campaign_content` RPC
6. Map RPC output → API response format
7. Track usage, return with pagination

#### Step 7.3 — Create `GET /analytics/hashtag-creators` route

**File**: `src/app/api/v1/analytics/hashtag-creators/route.ts`

| Aspect               | Detail                                                                                                                                             |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scope**            | `analytics:read`                                                                                                                                   |
| **Params**           | `hashtags` (comma-separated, required), `min_post_count`, `min_followers`, `limit`                                                                 |
| **RPC**              | `api.ai_get_hashtag_creators(p_hashtags, p_min_post_count, p_min_followers, p_limit)`                                                              |
| **Response mapping** | `profile_id`, `username`, `full_name`, `avatar`, `followers_count`, `total_hashtag_posts`, `hashtags_matched[]`, `last_used_at`, `engagement_rate` |
| **Validation**       | `hashtags` required, max 10                                                                                                                        |

**Implementation steps**:

1. Create `route.ts` with GET handler
2. Auth with `analytics:read` scope
3. Parse `hashtags` param → split by comma, clean, validate max 10
4. Call `api.ai_get_hashtag_creators` RPC with `text[]` array
5. Map output, track usage, return

#### Step 7.4 — Create `GET /content/search` route

**File**: `src/app/api/v1/content/search/route.ts`

| Aspect               | Detail                                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Scope**            | `analytics:read`                                                                                                        |
| **Params**           | `query` (required), `min_engagement`, `author`, `since`, `sort`, `limit`                                                |
| **RPC**              | `api.ai_search_post_content(p_query, p_min_engagement, p_author, p_since, p_sort, p_limit)`                             |
| **Response mapping** | `post_id`, `post_url`, `author`, `profile_id`, `caption`, `engagement`, `published_at`, `relevance_score`, `hashtags[]` |
| **Validation**       | `query` required, sanitize for tsquery injection                                                                        |

**Implementation steps**:

1. Create directory: `src/app/api/v1/content/search/`
2. Create `route.ts` with GET handler
3. Auth with `analytics:read` scope
4. Parse and sanitize `query` param (convert spaces to `&` for AND logic in tsquery)
5. Call `api.ai_search_post_content` RPC
6. Map output including `relevance_score`, track usage, return

#### Step 7.5 — Update OpenAPI spec

**File**: `src/app/api/v1/openapi.json/route.ts`

Add path entries for all 3 endpoints with full parameter schemas and response descriptions.

#### Step 7.6 — Update docs

**Files**:

- `src/app/api/v1/docs/route.ts` — inline API docs
- `Docs/Wiki/pages/external-api.md` — team documentation

Add endpoint descriptions, parameters, examples.

#### Step 7.7 — Deploy & test

1. `git commit` + `git push origin main`
2. Wait for Vercel deployment
3. Test each endpoint via `curl` with test API key
4. Verify: response structure, pagination, credits, performance
5. Save test results to `.data/celavii/api-v1-content-tests.json`

---

### Phase 8 Route Integration (P7)

#### Step 8.1 — Register credit cost

**File**: `src/app/api/v1/_lib/types.ts`

```typescript
'analytics:affinity-posts': 1,
```

#### Step 8.2 — Create `GET /analytics/affinity-posts` route

**File**: `src/app/api/v1/analytics/affinity-posts/route.ts`

| Aspect               | Detail                                                                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scope**            | `analytics:read`                                                                                                                                      |
| **Params**           | `affinity` (required), `affinity_type`, `min_engagement`, `sort`, `limit`                                                                             |
| **RPC**              | `api.ai_get_affinity_posts(p_affinity, p_affinity_type, p_min_engagement, p_sort, p_limit)`                                                           |
| **Response mapping** | `post_id`, `post_url`, `author`, `profile_id`, `caption`, `engagement`, `published_at`, `matched_affinity`, `matched_affinity_type`, `bridge_hashtag` |
| **Validation**       | `affinity` required, `affinity_type` enum check                                                                                                       |

**Implementation steps**:

1. Create `route.ts` with GET handler
2. Auth with `analytics:read` scope
3. Parse params, validate `affinity_type` ∈ {topic, brand, location, all}
4. Call `api.ai_get_affinity_posts` RPC
5. Map output, track usage, return

#### Step 8.3 — Update OpenAPI spec & docs

Same pattern as Phase 7 steps 7.5 and 7.6.

#### Step 8.4 — Deploy & test

Test with known affinities: `photography`, `Nike`, `Miami`.

---

### Phase 9 Route Integration (P8)

No new API routes in Phase 9. The `post_mentions` backfill enriches existing endpoints:

- `GET /campaigns/:id/content` (P3) gains mention matching via `match_type=mention`
- No separate mentions endpoint needed initially

**Post-backfill verification**:

1. Query `SELECT COUNT(*) FROM post_mentions` to confirm population
2. Re-test `GET /campaigns/:id/content?match_type=mention` with a campaign that has `mentions[]` set

---

### Integration Checklist Per Endpoint

For every new endpoint, verify all of these before marking complete:

- [ ] Route file created at correct path under `src/app/api/v1/`
- [ ] Auth scope check matches documented scope
- [ ] Query params parsed and validated (with error messages)
- [ ] RPC called via `createAdminClient().schema('api').rpc()`
- [ ] Response mapped to snake_case API format
- [ ] Credit cost registered in `ENDPOINT_CREDITS`
- [ ] `trackApiUsage()` called (fire-and-forget)
- [ ] Pagination included where applicable
- [ ] OpenAPI spec path entry added with all parameters
- [ ] Inline docs route updated
- [ ] Team docs (external-api.md) updated
- [ ] Deployed to Vercel and tested with live API key
- [ ] Test results saved to `.data/celavii/`
- [ ] Performance within benchmark targets

---

## Timeline Estimate

| Phase        | Items                                       | Effort  | Cumulative   |
| ------------ | ------------------------------------------- | ------- | ------------ |
| **Phase 6**  | P1, P2 (indexes on existing `posts` table)  | 35 min  | 35 min       |
| **Phase 7**  | P3, P4, P5 (RPCs + API routes + docs)       | 5-7 hrs | ~8 hrs       |
| **Phase 8**  | P6, P7 (new bridge table + RPC + API route) | 4-5 hrs | ~13 hrs      |
| **Phase 9**  | P8 (backfill post_mentions)                 | 2-3 hrs | ~16 hrs      |
| **Phase 10** | P9 (post-level AI affinities)               | Days    | **DEFERRED** |

**Total (Phase 6-9)**: ~16 hours across 4 phases

### What's created per phase

| Phase  | New Tables                      | New Indexes                | New RPCs | New API Routes  | Docs Updates          |
| ------ | ------------------------------- | -------------------------- | -------- | --------------- | --------------------- |
| **6**  | 0                               | 2 (GIN + btree on `posts`) | 0        | 0               | 0                     |
| **7**  | 0                               | 0                          | 3        | 3 routes        | OpenAPI + docs + wiki |
| **8**  | 1 (`hashtag_affinity_mappings`) | 2                          | 1        | 1 route         | OpenAPI + docs + wiki |
| **9**  | 0 (backfill existing)           | 0                          | 0        | 0 (enriches P3) | 0                     |
| **10** | 4 (post*affinity*\*)            | 4                          | TBD      | TBD             | TBD                   |

---

## Testing Strategy

### Per-Endpoint Testing

1. Create RPC, test via Supabase MCP (`mcp3_execute_sql`)
2. Create API route, deploy to Vercel
3. Test via API using test key (`cvii_live_...`)
4. Verify response structure, pagination, credits
5. Save results to `.data/celavii/` for review

### Integration Testing

- Campaign content: use real campaign ID (e.g., `cmfyvtnhr0001lqsl34t59uu0` with 51 creators, hashtag `countrymusic`)
- Hashtag creators: test with `fitness`, `photography`, `countrymusic`
- Content search: test with brand names, trending topics
- Affinity posts: test with known affinities (photography, Nike, Miami)

### Performance Benchmarks

| Endpoint         | Target | Max Acceptable |
| ---------------- | ------ | -------------- |
| Campaign content | <200ms | <500ms         |
| Hashtag creators | <50ms  | <200ms         |
| Content search   | <50ms  | <200ms         |
| Affinity posts   | <100ms | <300ms         |

---

## Risks & Mitigations

| Risk                                           | Impact                                          | Mitigation                                       |
| ---------------------------------------------- | ----------------------------------------------- | ------------------------------------------------ |
| GIN index build time on 401K rows              | 1-2 min downtime for index creation             | Use `CREATE INDEX CONCURRENTLY` (non-blocking)   |
| tsvector column adds storage                   | ~50-100MB                                       | Acceptable for 100-500x query speedup            |
| Hashtag-affinity auto-mapping has gaps         | ~20% of affinities may not have hashtag matches | Add manual mapping UI or AI fuzzy matching later |
| post_mentions backfill on 401K posts           | ~2-5 min execution                              | Run during low-traffic period                    |
| Campaign keyword matching requires clean input | Campaign `keywords[]` may have messy data       | Normalize keywords in RPC before tsquery         |

---

## Success Criteria

- [ ] All 4 new endpoints return correct data with proper pagination
- [ ] Response times within performance benchmarks
- [ ] No Apify COGS exposed in any response
- [ ] OpenAPI spec and docs updated for all new endpoints
- [ ] Test results saved to `.data/celavii/` and reviewed
- [ ] Hashtag-affinity mapping covers >80% of top 1000 affinities
- [ ] Credit tracking works for all new endpoints

---

## Files to Create/Modify

### New Files

| File                                                                      | Description                  |
| ------------------------------------------------------------------------- | ---------------------------- |
| `src/app/api/v1/campaigns/[id]/content/route.ts`                          | Campaign content endpoint    |
| `src/app/api/v1/analytics/hashtag-creators/route.ts`                      | Hashtag creators endpoint    |
| `src/app/api/v1/content/search/route.ts`                                  | Content search endpoint      |
| `src/app/api/v1/analytics/affinity-posts/route.ts`                        | Affinity posts endpoint      |
| `supabase/migrations/YYYYMMDDHHMMSS_add_posts_content_search.sql`         | GIN index + engagement index |
| `supabase/migrations/YYYYMMDDHHMMSS_create_hashtag_affinity_mappings.sql` | Bridge table + auto-populate |
| `supabase/migrations/YYYYMMDDHHMMSS_content_discovery_rpcs.sql`           | Core RPCs                    |
| `supabase/migrations/YYYYMMDDHHMMSS_affinity_posts_rpc.sql`               | Affinity posts RPC           |
| `supabase/migrations/YYYYMMDDHHMMSS_populate_post_mentions.sql`           | Mentions backfill            |

### Modified Files

| File                                   | Changes                            |
| -------------------------------------- | ---------------------------------- |
| `src/app/api/v1/_lib/types.ts`         | Add credit costs for new endpoints |
| `src/app/api/v1/openapi.json/route.ts` | Add new endpoint specs             |
| `src/app/api/v1/docs/route.ts`         | Update inline documentation        |
| `Docs/Wiki/pages/external-api.md`      | Update team documentation          |

---

## Appendix: Existing Index Coverage

All join paths for the proposed endpoints are already indexed:

| Join                                 | Index                                     | Status |
| ------------------------------------ | ----------------------------------------- | ------ |
| `hashtags.tag` lookup                | `hashtags_tag_key` (unique)               | ✅     |
| `post_hashtags.hashtag_id`           | `post_hashtags_hashtag_id_idx`            | ✅     |
| `post_hashtags(post_id, hashtag_id)` | PK composite                              | ✅     |
| `posts.profile_id`                   | `idx_posts_profile_id`                    | ✅     |
| `posts.published_at`                 | `posts_published_at_idx`                  | ✅     |
| `profile_hashtags.hashtag_id`        | `idx_profile_hashtags_hashtag_id`         | ✅     |
| `profile_hashtags.post_count`        | `idx_profile_hashtags_post_count` (DESC)  | ✅     |
| `campaign_content(campaign_id)`      | `campaign_content_campaign_id_status_idx` | ✅     |
| `post_mentions.username`             | `idx_post_mentions_username`              | ✅     |

**Missing** (added by this proposal):
| Join | Index | Phase |
|------|-------|-------|
| `posts.content` full-text | `idx_posts_content_tsv` (GIN) | P1 |
| `posts.engagement` sort | `idx_posts_engagement` (DESC) | P2 |
| `hashtag_affinity_mappings` lookup | `idx_ham_affinity` + `idx_ham_hashtag` | P6 |

---

## Appendix: Schema Validation (Verified via Supabase MCP)

> All table names, column names, data types, and naming conventions below were verified against
> the production database (`abzkebevxtauyijetrif`) on February 8, 2026.

### Verified Table Schemas

#### `posts` (401,850 rows)

| Column         | Type                  | Nullable | Notes                                   |
| -------------- | --------------------- | -------- | --------------------------------------- |
| `id`           | text                  | NO       | PK, format: `ig:<shortcode>`            |
| `content`      | text                  | NO       | Caption text — **NOT called `caption`** |
| `url`          | text                  | NO       | Full Instagram URL                      |
| `author`       | text                  | YES      | Username of post author                 |
| `profile_id`   | text                  | YES      | FK to `profiles.id`                     |
| `engagement`   | integer               | NO       | Total engagement count                  |
| `published_at` | **timestamp** (no tz) | NO       | **NOT timestamptz**                     |
| `platform`     | text                  | NO       | Always `instagram`                      |
| `search_id`    | text                  | YES      | Source search                           |
| `dataset_id`   | text                  | YES      | Source dataset                          |

#### `campaigns`

| Column            | Type      | Nullable | Notes                                   |
| ----------------- | --------- | -------- | --------------------------------------- |
| `id`              | text      | NO       | PK (CUID format)                        |
| `organization_id` | **uuid**  | YES      | **snake_case** — NOT `"organizationId"` |
| `hashtags`        | text[]    | YES      | Array of tracked hashtags               |
| `keywords`        | text[]    | YES      | Array of tracked keywords               |
| `mentions`        | text[]    | YES      | Array of tracked mentions               |
| `status`          | text      | NO       | active, paused, completed               |
| `start_date`      | timestamp | NO       |                                         |
| `end_date`        | timestamp | YES      |                                         |

#### `campaign_content` (584 rows)

| Column               | Type    | Notes                                            |
| -------------------- | ------- | ------------------------------------------------ |
| `id`                 | text    | PK                                               |
| `campaign_id`        | text    | FK to `campaigns.id`                             |
| `profile_content_id` | text    | FK to **`profile_contents.id`** (NOT `posts.id`) |
| `creator_id`         | text    | FK to `profiles.id`                              |
| `likes_count`        | integer | Snapshot at time of tracking                     |
| `comments_count`     | integer |                                                  |
| `views_count`        | integer |                                                  |
| `status`             | text    | pending, approved, flagged                       |

#### `profile_contents` (~500K+ rows)

| Column            | Type    | Notes                               |
| ----------------- | ------- | ----------------------------------- |
| `id`              | text    | PK (UUID format)                    |
| `profile_id`      | text    | FK to `profiles.id`                 |
| `"contentId"`     | text    | **camelCase** — Instagram shortcode |
| `url`             | text    | Full Instagram URL                  |
| `caption`         | text    | Post caption                        |
| `"likesCount"`    | integer | **camelCase**                       |
| `"commentsCount"` | integer | **camelCase**                       |
| `"viewsCount"`    | integer | **camelCase**                       |
| `type`            | text    | post, reel, carousel                |

**Join to `posts`**: `posts.id = 'ig:' || profile_contents."contentId"` (verified with sample data)

#### `hashtags` (467,964 rows)

| Column | Type | Notes           |
| ------ | ---- | --------------- |
| `id`   | text | PK              |
| `tag`  | text | Unique, indexed |

#### `post_hashtags` (2,619,529 rows)

| Column       | Type | Notes                          |
| ------------ | ---- | ------------------------------ |
| `post_id`    | text | PK part 1, FK to `posts.id`    |
| `hashtag_id` | text | PK part 2, FK to `hashtags.id` |

#### `post_mentions` (0 rows — empty)

| Column         | Type | Notes               |
| -------------- | ---- | ------------------- |
| `post_id`      | text | PK part 1           |
| `mentioned_id` | text | PK part 2           |
| `username`     | text | Non-PK, for display |

#### `profile_hashtags` (1,122,176 rows)

| Column          | Type            | Notes                |
| --------------- | --------------- | -------------------- |
| `profile_id`    | text            | PK part 1            |
| `hashtag_id`    | text            | PK part 2            |
| `post_count`    | integer         | Pre-aggregated count |
| `last_used_at`  | **timestamptz** | With timezone ✅     |
| `first_used_at` | timestamptz     |                      |

#### `profiles` (legacy camelCase)

| Column                   | Type             | Notes                               |
| ------------------------ | ---------------- | ----------------------------------- |
| `id`                     | text             | PK, format: `ig:<numeric_id>`       |
| `username`               | text             | snake_case ✅                       |
| `"fullName"`             | text             | **camelCase** — needs quotes in SQL |
| `avatar`                 | text             | snake_case ✅                       |
| `"followersCount"`       | integer          | **camelCase**                       |
| `"isVerified"`           | boolean          | **camelCase**                       |
| `"medianEngagementRate"` | double precision | **camelCase**                       |
| `"publicEmail"`          | text             | **camelCase**                       |
| `"publicPhoneNumber"`    | text             | **camelCase**                       |
| `gender`                 | text             | snake_case ✅ (newer column)        |

#### Affinity Tables (all snake_case, `id` = integer)

| Table                         | PK Type | Name Column   |
| ----------------------------- | ------- | ------------- |
| `affinity_topics`             | integer | `name` (text) |
| `affinity_brands`             | integer | `name` (text) |
| `affinity_locations`          | integer | `name` (text) |
| `affinity_content_categories` | integer | `name` (text) |

### Naming Convention Summary

| Layer                                              | Convention                | Examples                                                   |
| -------------------------------------------------- | ------------------------- | ---------------------------------------------------------- |
| **Newer tables** (campaigns, posts, post_hashtags) | snake_case                | `organization_id`, `published_at`, `post_count`            |
| **Legacy tables** (profiles, profile_contents)     | camelCase                 | `"followersCount"`, `"likesCount"`, `"contentId"`          |
| **Affinity tables**                                | snake_case                | `topic_id`, `profile_count`                                |
| **API RPCs** (api schema)                          | `ai_` prefix + snake_case | `ai_get_campaign_content`, `ai_search_profiles`            |
| **API routes**                                     | kebab-case directories    | `hashtag-creators/`, `affinity-posts/`, `network-overlap/` |

### RPC Naming Convention (verified from `api` schema)

All external API RPCs use the `ai_` prefix:

```
ai_search_profiles, ai_get_campaigns, ai_get_campaign_metrics,
ai_get_locations, ai_get_top_niches, ai_get_demographics_summary,
ai_get_profile_details, ai_get_profile_posts, ai_add_to_campaign,
ai_get_manage_profiles, ai_get_manage_summary, ai_get_org_stats, ...
```

New RPCs MUST follow: `api.ai_<verb>_<noun>` pattern.

### Corrections Applied During Validation

| Issue                 | Original (wrong)             | Corrected                                  | Severity      |
| --------------------- | ---------------------------- | ------------------------------------------ | ------------- |
| Campaign org column   | `campaigns."organizationId"` | `campaigns.organization_id` (uuid)         | **CRITICAL**  |
| RPC naming            | `api.get_campaign_content`   | `api.ai_get_campaign_content`              | **CRITICAL**  |
| RPC naming            | `api.get_hashtag_creators`   | `api.ai_get_hashtag_creators`              | **CRITICAL**  |
| RPC naming            | `api.search_post_content`    | `api.ai_search_post_content`               | **CRITICAL**  |
| RPC naming            | `api.get_affinity_posts`     | `api.ai_get_affinity_posts`                | **CRITICAL**  |
| campaign_content join | Direct to `posts`            | Via `profile_contents` → `posts`           | **IMPORTANT** |
| Missing table         | —                            | Added `profile_contents` to data inventory | **IMPORTANT** |
| Timestamp type        | `published_at timestamptz`   | `published_at timestamp` (no tz)           | **MINOR**     |
| Backfill mentioned_id | `'ig:' \|\| mention[1]`      | `LOWER(mention[1])`                        | **MINOR**     |
| Posts caption column  | `caption`                    | `content` (actual column name)             | **MINOR**     |
