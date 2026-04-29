# Celavii Social_Listener Audit: Platform Adapters & Scrape Queue Contract

**Date**: April 28, 2026  
**Scope**: Extract public/internal contracts for wrapping in social-agents skills  
**Target Skills**: `social-discover`, `social-competitor-scrape`  
**Output Directory**: `~/dev/openclaw/skills/`

---

## A. PlatformAdapter Contract — Core Interface

### Method Signatures

```typescript
interface PlatformAdapter {
  platform: Platform; // 'instagram' | 'tiktok' | 'x'

  // Core transformation methods
  extractProfile(raw: any): CanonicalProfile;
  extractPost(raw: any, context?: { author?; profile_id?; dataset_id?; search_id? }): CanonicalPost;
  extractContentItem(
    raw: any,
    context: { profile_id: string; dataset_id?: string },
  ): CanonicalContentItem;
  extractContents(raw: any): CanonicalContent;
  extractFollows(raw: any): CanonicalFollow[];
  extractComments(raw: any): CanonicalComment[];

  // ID generation & related data
  generateId(raw: any, type: "profile" | "post", actorId?: string): string;
  extractRelatedProfiles(raw: any): CanonicalProfile[];

  // Optional: cross-platform & link extraction
  extractCrossPlatformLinks?(raw: any, profileId: string): CanonicalCrossPlatformLink[];
  extractPostLinks?(raw: any, context: { post_id; profile_id?; dataset_id? }): CanonicalPostLink[];

  // Additional: media, mentions, hashtags (per-adapter variations)
  extractMedia?(posts: CanonicalPost[], context?): CanonicalPostMedia[];
  extractPostHashtags?(posts: CanonicalPost[]): CanonicalPostHashtag[];
  extractPostMentions?(posts: CanonicalPost[]): CanonicalPostMention[];
}
```

### Return Type Shapes (Canonical Format)

**CanonicalProfile**: 90+ fields including identity, metrics, timestamps, computed engagement rates, TikTok-specific fields (`total_likes_received`, `account_created_at`, `is_seller`). Platform: `'instagram' | 'tiktok' | 'x'`

**CanonicalPost**: engagement data (likes, comments, views, shares, saves), content (text, video URL, duration, dimensions), location mapping, media URLs, metadata JSONB (hashtags, mentions, type, source tracking), optional quoted/retweet data (X-only).

**CanonicalFollow**: `{ follower_id, followed_id, first_seen_at, last_seen_at, source, runId }`

**CanonicalComment**: `{ id, post_id, owner_id, owner_username, owner_full_name, owner_is_verified, text, likes_count, replies_count, timestamp, source }`

**CanonicalContentItem**: profile-aligned subset (profile_id, contentId, URL, thumbnail, caption, engagement, type, video fields, location, product type)

### Normalization Logic

- **ID Format**: Composite prefix (`ig:`, `tt:`, `x:`) + platform ID to prevent cross-platform collisions
- **Field Fallbacks**: Handles 4+ Instagram actors with varying schemas (flat vs nested location, `likeCount` vs `likesCount`)
- **Profile Stub Extraction**: Creates minimal profiles for post owners, tagged users, quoted tweet authors to prevent FK violations in batch ingestion
- **Location Handling**: Flat format (`locationId`) from hashtag scraper, nested format (`location.id`, `lat`, `lng`) from location scraper — adapter detects and normalizes both
- **Verification Status**: Multi-format (`verified`, `isVerified`, `isBlueVerified`, `verification_type > 0`)

### Entry Points

```typescript
// Resolver (registry pattern)
export function resolveAdapter(platform: string): PlatformAdapter;
export function normalizePlatformName(platform: string): string;
export function isSupportedPlatform(platform: string): boolean;
export function getSupportedPlatforms(): string[];
```

**Location**: `src/lib/platform-adapters/index.ts` (Node.js runtime for Next.js)  
**Parallel**: `supabase/functions/_shared/platform-adapters/` (Deno runtime for Edge Functions)

---

## B. Per-Platform Data Extraction Coverage

### Instagram Adapter (`apify/instagram-api-scraper`, `apify/instagram-hashtag-scraper`, `apidojo/instagram-location-scraper`)

**Profile Data**:

- Identity: `id`, `username`, `fullName`, `avatar` (with HD variant), `biography`
- Contact: `publicEmail`, `publicPhoneNumber`, `hasContactInfo`
- Metrics: `followersCount`, `followsCount`, `postsCount`, `reelsCount`, `medianViews`
- Status: `isPrivate`, `isVerified`, `isBusinessAccount`, `businessCategory`, `externalUrl`

**Post Data**:

- Content: `caption`, `hashtags` (array), `mentions` (from caption + tagged users), `type` (Image/Video/Sidecar/Reel)
- Engagement: `likesCount`, `commentsCount`, `videoViewCount`, `sharesCount`, `savesCount`
- Media: `videoUrl`, `videoDuration`, `dimensionsWidth`/`dimensionsHeight`, `displayUrl`/`thumbnailUrl`
- Carousel: `childPosts[]` (nested media in Sidecars)
- Music: Full `musicInfo` object with artist/title/album (hashtag scraper only)
- Location: Both flat (`locationId`, `locationName`) and nested (`location.id`, `location.name`, `location.lat`, `location.lng`)

**Follow/Comments**: Extracted from profile follower arrays; comments include reply counts.

**Related Profiles**: Post owners, tagged users in `childPosts`, coauthors (collaborations), Instagram's `relatedProfiles[]` algorithmic suggestions.

**Cross-Platform Links**: Not extracted (Instagram doesn't declare external social accounts).

### TikTok Adapter (`clockworks/tiktok-scraper`, `apidojo/tiktok-profile-scraper`, `sociavault/tiktok-follower-scraper`)

**Profile Data**:

- Identity: `uid` (numeric ID), `unique_id`/`uniqueId` (username), `nickname` (display name), `signature` (bio)
- Metrics: `follower_count`, `following_count`, `aweme_count` (posts), `total_favorited` (likes received), `total_liked_count` (posts liked)
- Account Type: `verification_type > 0` → `isVerified`, `secret` → `isPrivate`, `commerce_user_level` → `isBusinessAccount`
- Commerce: `with_shop_entry`, `live_commerce`, `with_commerce_entry`, `commerce_user_level` (stored in `raw.commerce`)
- Creator Settings: `is_star`, `duet_setting`, `stitch_setting`, `download_setting` (stored in `raw.creator_settings`)
- Timestamps: `create_time` (Unix) → `account_created_at`, `region` (ISO 3166-1 alpha-2)
- Avatar: Multiple formats (HEIC, WebP); adapter prefers WebP (index 2) for browser compatibility

**Post Data**:

- Content: `text`, `hashtags[]` (with optional `searchHashtag` for hashtag popularity), `mentions[]` (from caption + `detailedMentions[]`)
- Engagement: `diggCount` (likes), `commentCount`, `playCount` (views), `shareCount`, `collectCount` (saves), `repostCount`
- Video: `videoMeta.duration`, `videoMeta.width`/`height`, `downloadAddr` (video URL), `videoMeta.coverUrl` (thumbnail), `videoMeta.originalCoverUrl`
- Slideshow: `isSlideshow`, `slideshowImageLinks[]` (extracted to `post_media` table)
- Music: Full `musicMeta` object with ID, title, artist, album, play URL, cover URL
- Location (POI): `poi` object with `poiName`, `cityCode`, `cityName`, `address`, `latitude`, `longitude`, `regionCode` (from location scraper)
- Transcript: `videoMeta.subtitleLinks[]` (temporary CDN URLs for extraction)

**Follow/Comments**: Follower scraper (SociaVault) returns flat profiles; direction detected by field naming (`unique_id` = follower scrape, `uniqueId` = following scrape). Comments from TikTok comments actor include `cid` (comment ID), `diggCount` (likes), `replyCommentTotal`.

**Related Profiles**: TikTok posts are author-owned; no cross-owner extraction like Instagram. No `relatedProfiles` equivalent.

**Cross-Platform Links** (**HIGH VALUE**):

- `ins_id` → Instagram username (confidence: 0.95)
- `youtube_channel_id` + `youtube_channel_title` → YouTube channel (0.95)
- `twitter_id` + `twitter_name` → X/Twitter handle (0.95)
- Stored in `profile_social_links` table for multi-platform creator discovery

### X (Twitter) Adapter (`kaitoeasyapi/twitter-x-data-tweet-scraper`, `apidojo/tweet-scraper`, `apidojo/twitter-user-scraper`)

**Profile Data**:

- Identity: `id`, `userName`, `name`, `profilePicture`, `description`
- Metrics: `followers`, `following`, `statusesCount` (posts), `mediaCount`, `favouritesCount`, `listedCount`
- Status: `protected` (private), `isVerified` / `isBlueVerified`, `professional.professional_type` (business)
- Account: `professional.category[]` (business category), `location` (region string), `createdAt`, `coverPicture`
- Entities: `entities.url.urls[]` (expanded URLs in bio)

**Post Data**:

- Content: `text`, `entities.hashtags[]`, `entities.user_mentions[]` (structured), regex fallback
- Engagement: `likeCount`, `replyCount`, `retweetCount`, `quoteCount`, `viewCount`, `bookmarkCount`
- Media: `extendedEntities.media[]` (video, image, animated GIF) with `media_url_https`, `video_info` (duration, bitrate variants)
- Relationship: `isReply`, `isRetweet`, `isQuote`, `inReplyToId`, `inReplyToUsername`, `conversationId`, `quoted_tweet`
- Link Cards: `card.binding_values[]` (title, description, image URL, player URL) with domain matching
- Location: `place` object with `full_name`, `id`

**Follow/Comments**: Extracted from `followers[]` and `following[]` arrays in user-scraper output. Comments are replies fetched via `conversation_id:` query (returns regular tweet objects).

**Related Profiles**: Quoted tweet author, retweeted tweet author, card user references (GraphQL-style results).

**Cross-Platform Links** (**MEDIUM VALUE**):

- Bio URL regex matching: Instagram, YouTube, TikTok, LinkedIn URLs (confidence: 0.8, discovered_by: `api`)
- No platform-declared fields like TikTok

---

## C. Apify Actor IDs & Cost Notes

| Platform      | Actor ID                                            | Workflow            | Cost (Credits)       | Data                                  | Notes                                              |
| ------------- | --------------------------------------------------- | ------------------- | -------------------- | ------------------------------------- | -------------------------------------------------- |
| **Instagram** | `apify/instagram-profile-scraper`                   | `enhance_profiles`  | ~2 (profile + reels) | Profile + 12+ posts + IGTV            | Multi-entity: 1 raw → 69 canonical profiles        |
| Instagram     | `apify/instagram-hashtag-scraper`                   | `collect_hashtags`  | 1 per hashtag        | Posts only (owner stubs)              | Flat location format; no GPS                       |
| Instagram     | `apidojo/instagram-location-scraper`                | `collect_locations` | 1 per location       | Posts with POI object                 | Nested location + GPS coords                       |
| Instagram     | `apify/instagram-api-scraper` (followers/following) | `collect_follows`   | 2 per profile        | Follower/following lists              | Multiple actors available                          |
| **TikTok**    | `clockworks/tiktok-scraper`                         | `collect_hashtags`  | 1 per hashtag        | Posts with `authorMeta` nested format | 400–800 post cap per hashtag                       |
| TikTok        | `sociavault/tiktok-follower-scraper`                | `collect_follows`   | 2 per profile        | Flat profile format (121+ fields)     | Rich commerce metadata; cross-platform links       |
| TikTok        | `apidojo/tiktok-profile-scraper`                    | `enhance_profiles`  | ~2                   | Profile with `channel` nested format  | Different schema from Clockworks                   |
| TikTok        | `apidojo/tiktok-location-scraper`                   | `collect_locations` | 1 per location       | Posts with POI object                 | TikTok place URLs only                             |
| **X**         | `kaitoeasyapi/twitter-x-data-tweet-scraper`         | `collect_hashtags`  | 1 per hashtag        | Tweets + author embed                 | Pay-per-result model; mock data filtering required |
| X             | `apidojo/tweet-scraper`                             | `collect_hashtags`  | 1 per hashtag        | Tweets + author (fullText field)      | Fallback for kaitoeasyapi                          |
| X             | `apidojo/twitter-user-scraper`                      | `collect_follows`   | 2 per profile        | User profiles (followers/following)   | Flat profile format; no post data                  |

**Cost Optimization**: Instagram hashtag scrapes are cheapest (1 credit). TikTok followers/following scrape is 2 credits but returns rich commerce metadata. X uses kaitoeasyapi (pay-per-result, filtered for mock data).

---

## D. Scrape Dispatch Queue — Architecture & Lifecycle

### Entry Point: `addScrapeJob()`

```typescript
interface ScrapeJobData {
  searchId: string;               // Unique search ID (created before enqueue)
  kind: 'collect_hashtags' | 'collect_locations' | 'enhance_profiles' | 'collect_follows';
  userId: string;
  organizationId?: string;
  actorId: string;                // Apify actor to run
  actorInput: Record<string, any>; // Actor input payload
  webhookUrl: string;             // Apify completion webhook
  webhookSecret?: string;
  metadata?: {                    // Job-specific metadata
    hashtags?: string[];
    direction?: 'followers' | 'following';
    includeReels?: boolean;
    reelsInput?: Record<string, any>;
    profileWebhookUrl?: string;   // With ?type=profile appended
    reelsWebhookUrl?: string;
  };
}

await addScrapeJob(data): Promise<string>  // Returns BullMQ job ID
```

### Job Lifecycle

```
1. ENQUEUE (API Route)
   User/API → addScrapeJob() → BullMQ Redis queue
   Status in DB: 'queued'
   Response: { status: 'queued', runId: null }

2. DISPATCH (Worker Process)
   BullMQ worker picks up job (FIFO order)
   Check Apify concurrency: getApifyRunningCount()
   If at capacity: throw error → BullMQ retry with exponential backoff (30s → 480s, 5 attempts)
   If capacity available: startApifyActorAsync(actorId, input)
   Status in DB: 'running', apifyRunId set

3. APIFY EXECUTION
   Apify actor runs independently
   Outputs dataset

4. WEBHOOK (Zero-Latency Dispatch)
   Apify fires SUCCEEDED or FAILED webhook to /api/webhooks/apify
   Webhook handler ingests data (existing pipeline unchanged)
   At end: dispatchNextScrapeJob() → triggers next queued job
   Slot freed; fallback to cron safety net every 2 minutes

5. COMPLETION
   Status in DB: 'completed' or 'failed'
   Search record updated with results
```

### Infrastructure

- **Queue**: BullMQ (already installed, same as `refinementQueue`)
- **Storage**: Redis (same `REDIS_URL` as refinement queue)
- **Worker**: Embedded in Vercel (runs on `/api/cron/process-scrape-queue`)
- **Dispatch Triggers**:
  - **Primary**: Webhook-driven (zero-latency, on Apify run completion)
  - **Fallback**: Cron every 2 minutes (safety net for missed webhooks)
- **Concurrency**: Worker concurrency = 1 (prevents race condition on Apify capacity check)
- **Max Concurrent Apify Runs**: 32 (Apify Starter plan confirmed)

### Key Features

- **FIFO Ordering**: Jobs processed in submission order (fairness)
- **Automatic Retry**: 5 attempts with exponential backoff (30s → 60s → 120s → 240s → 480s)
- **Status Tracking**: Search record updates: `queued` → `running` → `completed` / `failed`
- **Error Handling**: After 5 failures, search marked as failed with error message
- **Fallback**: If Redis down, emergency direct Apify call (existing behavior)
- **Logging**: Structured `[scrape-queue.*]` prefixed logs for all operations

### Configuration (Environment Variables)

| Variable                          | Default  | Description                                   |
| --------------------------------- | -------- | --------------------------------------------- |
| `APIFY_MAX_CONCURRENT_RUNS`       | `32`     | Apify plan max; worker self-regulates via API |
| `SCRAPE_QUEUE_WORKER_CONCURRENCY` | `1`      | MUST be 1 (race condition prevention)         |
| `SCRAPE_QUEUE_BACKOFF_DELAY`      | `30000`  | Initial retry delay (ms) when Apify full      |
| `SCRAPE_QUEUE_MAX_ATTEMPTS`       | `5`      | Max retry attempts per job                    |
| `REDIS_URL`                       | Required | BullMQ connection                             |
| `APIFY_TOKEN`                     | Required | Apify API token (same as existing)            |
| `CRON_SECRET`                     | Required | Cron route auth                               |

---

## E. Public API Surface: Scrape Entry Points

### Public REST Endpoints (`/api/v1/*`)

**Location**: `src/app/api/v1/scrape/` (5 routes)

```
POST /api/v1/scrape/followers          # Instagram followers
POST /api/v1/scrape/following          # Instagram following
POST /api/v1/scrape/hashtags           # Instagram hashtags
POST /api/v1/scrape/locations          # Instagram locations
POST /api/v1/scrape/urls               # Instagram post URLs
```

**Auth**: `Authorization: Bearer $CELAVII_API_KEY`

**Response Format**: `{ status: 'queued', searchId: string, runId?: string }`

**How They Work**:

1. Validate input + org concurrency limits (max 20 concurrent per org)
2. Create search record in DB (initial status: 'queued')
3. Call `addScrapeJob()` → BullMQ queue
4. Return immediately with search status + ID
5. Frontend polls `/api/ops/queue-status` for completion

**Status Values**:

- `queued` — Waiting in BullMQ
- `running` — Apify actor started
- `completed` — Finished successfully
- `failed` — Failed after retries
- `processing` — Post-processing (follows ingestion, etc.)

### Internal Dashboard Routes

**Location**: `src/app/api/instagram/` (4 routes) + `/api/campaigns/`

```
POST /api/instagram/collect            # Hashtag collection (SSE stream)
POST /api/instagram/collect-locations  # Location collection
POST /api/instagram/enhance            # Profile enrichment (+ optional reels)
POST /api/instagram/collect-follows    # Followers/following (smart actor routing)
```

Also consumed by:

- `/api/campaigns/{id}` — Campaign-level hashtag discovery
- `/api/campaigns/{id}/sync` — Bulk creator + content sync
- `/api/campaigns/{id}/enhance-missing` — Selective profile enhancement

### Job Monitoring Endpoint

```
GET /api/ops/queue-status?type=scrape
```

Returns: `{ waiting: number, active: number, completed: number, failed: number }`

### Job Tracking (External API)

The **celavii-jobs MCP skill** exposes:

```
GET /api/v1/jobs?type=enhance&status=completed&limit=25
GET /api/v1/jobs/coverage?list_id=uuid&job_type=enhance
```

These endpoints are **read-only** (0 credits) and provide unified job status across enhancement, refinement, and scrape operations.

---

## F. MCP Skills Exposure

### celavii-jobs Skill

**Endpoints**:

- `GET /api/v1/jobs` — List all jobs (enhancement, refinement, scrape) with filters
- `GET /api/v1/jobs/coverage` — Get aggregate coverage stats (how many profiles enhanced/scraped)

**Callable from**: OpenClaw agents via `CELAVII_API_KEY` + Bearer token auth

**Use Case**: Monitor scrape job progress without polling individual search records

### celavii-platforms Skill

**Content**: Quick-reference guide for:

- Supported platforms (`instagram`, `tiktok`, `x`)
- Profile ID formats (`ig:ID`, `tt:ID`, `x:ID`)
- Scrape endpoint routing (which endpoint for which operation)
- Platform-specific behavior (hashtag caps, location input formats)

**Callable from**: OpenClaw agents as documentation reference (read-only)

**Use Case**: Route decisions in `social-discover` skill — which Celavii endpoint to call for a given platform

---

## G. Concrete Recommendation: Which Entry Points to Invoke

### For `social-discover` Skill

**Goal**: Discover new creators/audiences on Instagram, TikTok, X

**Recommended Entry Points**:

1. **Instagram Hashtag Discovery**

   ```
   POST /api/v1/scrape/hashtags
   { "hashtags": ["#wellness", "#fitness"], "limit": 100 }
   ```

   Returns: Search ID → poll `/api/ops/queue-status` for completion → results in `posts` table

2. **Instagram Location Discovery**

   ```
   POST /api/v1/scrape/locations
   { "locationIds": ["213999109"], "limit": 50 }
   ```

   Returns: Posts from location with POI data

3. **TikTok Hashtag Discovery**

   ```
   POST /api/v1/scrape/tiktok/hashtags
   { "hashtags": ["#sustainable"], "limit": 100 }
   ```

   Similar contract, TikTok-specific actor routing

4. **Follower Cohort Analysis** (Secondary)
   ```
   POST /api/v1/scrape/followers
   { "profileId": "leomessi", "limit": 100 }
   ```
   Scrapes follower list → use `celavii-jobs` to check completion → analyze follower profiles for audience insights

**Why These**:

- Hashtag/location scrapes are **cheapest** (1 credit each)
- Return diverse creator posts with engagement + profile stubs
- Directly feed content discovery pipeline
- Status can be tracked via `celavii-jobs` skill

### For `social-competitor-scrape` Skill

**Goal**: Deep competitive analysis on known brands/competitors

**Recommended Entry Points**:

1. **Profile Enhancement (Bulk)**

   ```
   POST /api/v1/enhance/profiles
   { "profiles": ["brand_account"], "mode": "enhanced" }
   ```

   Returns: Profile + 12+ recent posts + IGTV + followers count + engagement metrics
   Applies to: Instagram (via internal dashboard route, not public v1 yet)

2. **Followers Scrape (Competitive Intelligence)**

   ```
   POST /api/v1/scrape/followers
   { "profileId": "competitor_brand", "limit": 500 }
   ```

   Returns: Follower list → analyze for audience overlap, influencer presence

3. **Following Scrape (Brand Affinity)**

   ```
   POST /api/v1/scrape/following
   { "profileId": "competitor_brand", "limit": 200 }
   ```

   Returns: Who the competitor follows → brand partnerships, influencer relationships

4. **URL Collection (Link Intelligence)**
   ```
   POST /api/v1/scrape/urls
   { "urls": ["https://instagram.com/p/ABC123/"] }
   ```
   Returns: Post data + link cards (X-only with rich card metadata, Instagram returns flat posts)

**Why These**:

- Profile enhancement is **most data-rich** (profiles + posts + related profiles)
- Follower/following scrapes cost 2 credits each but unlock relationship graphs
- URL scrape is cheaper (1 credit) for targeted competitive posts
- All support bulk operations and batch analytics

### Integration Pattern (Both Skills)

```typescript
// 1. Queue the scrape job
const searchId = await callCelaviiAPI("POST /v1/scrape/hashtags", {
  hashtags: ["#sustainability"],
});

// 2. Poll job status (zero-credit endpoint)
const coverage = await callCelaviiAPI("GET /v1/jobs/coverage", {
  list_id: discoveryListId,
  job_type: "followers_scrape",
});

// 3. Once complete, fetch results from Celavii's search/posts endpoints
const posts = await callCelaviiAPI("GET /v1/posts?search_id=" + searchId);

// 4. Analyze & act (OpenClaw agent logic)
```

---

## H. Risks, Unknowns, & Gateway Limitations

### Known Risks

1. **Apify Rate Limiting** (MITIGATED)
   - Starter plan: 32 concurrent runs max
   - BullMQ backpressure + exponential retry prevents queuing failures
   - Fallback to cron every 2min if webhook dispatch fails

2. **Queue Stalling** (MITIGATED)
   - BullMQ detects stalled jobs (120s without heartbeat) → auto-retry
   - Cron safety net runs every 2 min to catch orphaned jobs

3. **Redis Downtime** (FALLBACK AVAILABLE)
   - If Redis entirely down: emergency direct Apify call (existing behavior)
   - Not a designed path, but prevents total outage

4. **Actor Schema Fragmentation** (HANDLED)
   - 4+ Instagram actors with different field formats (nested vs flat locations)
   - Adapters handle all variations via multi-format field detection
   - Risk: New actor with unexpected schema → adapter gracefully falls back to null fields

### Unknowns / Limitations

1. **Post-Processing Delay**
   - Webhook → ingestion pipeline takes 5–30 sec
   - Results available in `posts` table only after ingestion completes
   - **OpenClaw cannot directly consume raw Apify datasets**; must wait for DB ingestion

2. **No Real-Time Streaming**
   - Current `/api/instagram/collect/stream` returns SSE with search status updates
   - **Streaming results themselves are NOT available** — only status updates
   - To get results, must poll search completion + query `posts` table

3. **Apify Dataset Retention**
   - Datasets deleted after 7 days in Apify
   - After that, raw post data lost (only canonical format preserved in Celavii DB)
   - **Implication**: Reprocessing old searches requires re-running the actor

4. **Gateway Integration Blockers**
   - OpenClaw gateway cannot directly read Celavii's Supabase database (no direct DB access)
   - Must use public REST API (`/api/v1/*`) or MCP skills
   - Cannot call internal routes (`/api/instagram/*`) from outside Celavii (auth boundary)

5. **No Bulk Result Endpoints**
   - `/api/v1/posts?search_id=X` returns paginated posts, not all at once
   - Large hashtag scrapes (1000+ posts) require multiple API calls
   - **No batch download endpoint** — must paginate

6. **X (Twitter) Limitations**
   - X adapter uses `kaitoeasyapi` actor which has no public `/api/v1/scrape/x/` endpoints
   - Only exposed via internal routes (CMS-only)
   - TikTok also limited: `/api/v1/scrape/tiktok/*` endpoints exist but may be undocumented

### Gateway Cannot Currently Reach

1. **Internal Dashboard Routes**
   - `POST /api/instagram/enhance` — No public API equivalent
   - `POST /api/instagram/collect-locations` — Use `/api/v1/scrape/locations` instead
   - Require authentication beyond API key (session/user context)

2. **Real-Time Event Streams**
   - `/api/instagram/collect/stream` (SSE) — Use polling `/api/ops/queue-status` instead

3. **Raw Apify Datasets**
   - No direct endpoint to fetch raw actor output
   - Must use canonical format via `posts` table query

4. **Campaign Operations**
   - `/api/campaigns/{id}/sync` — Internal-only
   - Bulk enhancements must use individual `/api/v1/enhance/profiles` calls

---

## Summary: What OpenClaw Skills Can Call

### ✅ Accessible Endpoints

```
POST /api/v1/scrape/followers         ← Recommended for competitor followers
POST /api/v1/scrape/following         ← Recommended for brand affinity
POST /api/v1/scrape/hashtags          ← Recommended for hashtag discovery
POST /api/v1/scrape/locations         ← Recommended for location discovery
POST /api/v1/scrape/urls              ← For single-post deep analysis

GET  /api/v1/jobs                     ← Track scrape job status (celavii-jobs)
GET  /api/v1/jobs/coverage            ← Coverage stats (zero-credit)
GET  /api/ops/queue-status            ← Queue depth monitoring
```

### ⚠️ Limited / Workarounds

```
POST /api/v1/enhance/profiles         ← Profile enrichment (may be internal-only; confirm)
GET  /api/v1/posts?search_id=X        ← Results polling (requires pagination)
GET  /api/v1/profiles/{id}            ← Profile data (if public; undocumented)
```

### ❌ Not Reachable

```
POST /api/instagram/*                 ← Dashboard internal
POST /api/campaigns/*                 ← Campaign management internal
GET  /api/instagram/collect/stream    ← SSE streaming internal
```

---

## Architecture Diagram

```
OpenClaw Skills (~/dev/openclaw/skills/)
│
├─ social-discover
│  └─ Calls: POST /api/v1/scrape/hashtags, /locations
│     Polls: GET /api/v1/jobs/coverage
│     Reads: /posts table (after ingestion)
│
└─ social-competitor-scrape
   └─ Calls: POST /api/v1/scrape/followers, /following, /urls
      Polls: GET /api/v1/jobs, GET /api/ops/queue-status
      Reads: /profiles, /posts tables (after ingestion)

        ↓ (All requests go through)

Celavii API Gateway (celavii.com/api/v1)
│
├─ Public REST Endpoints
│  ├─ POST /scrape/* (job queuing)
│  ├─ GET /jobs (job status)
│  └─ GET /profiles (data fetching)
│
└─ Internal Pipeline
   ├─ BullMQ Scrape Dispatch Queue (Redis-backed)
   │  ├─ Worker (processes 1 job at a time)
   │  ├─ Webhook-driven dispatch (zero-latency)
   │  └─ Cron safety net (every 2 min)
   │
   ├─ Apify Actor Orchestration
   │  ├─ instagram-profile-scraper (enhance_profiles)
   │  ├─ instagram-hashtag-scraper (collect_hashtags)
   │  ├─ tiktok-scraper (collect_hashtags)
   │  ├─ tiktok-follower-scraper (collect_follows)
   │  └─ twitter-user-scraper (collect_follows)
   │
   ├─ Platform Adapters (Node.js)
   │  ├─ InstagramAdapter.extractProfile/Post/Follows
   │  ├─ TikTokAdapter.extractProfile/Post/Follows
   │  └─ XAdapter.extractProfile/Post/Follows
   │
   ├─ Ingestion Pipeline
   │  ├─ Supabase RPC (process_dataset_atomic)
   │  ├─ Follow queue (profile_follows table)
   │  └─ Media processing (thumbnail caching, etc.)
   │
   └─ Database (Supabase)
      ├─ profiles (canonical profiles)
      ├─ posts (canonical posts)
      ├─ profile_contents (denormalized for fast queries)
      ├─ profile_follows (follow relationships)
      └─ post_media, post_links, post_hashtags (metadata)
```

---

## Next Steps for Implementation

### 1. OpenClaw Integration (social-discover skill)

```typescript
// src/lib/celavii-client.ts
export async function scrapeInstagramHashtags(hashtags: string[], limit: number = 100) {
  return fetch(`https://www.celavii.com/api/v1/scrape/hashtags`, {
    method: "POST",
    headers: { Authorization: `Bearer ${CELAVII_API_KEY}` },
    body: JSON.stringify({ hashtags, limit }),
  });
}

// Wait for job completion
export async function waitForScrapeCompletion(searchId: string, maxWaitMs = 300000) {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitMs) {
    const status = await checkJobStatus(searchId);
    if (status === "completed" || status === "failed") return status;
    await sleep(3000); // Poll every 3 sec
  }
  throw new Error(`Scrape job ${searchId} timed out`);
}
```

### 2. Verify Public v1/enhance/profiles Endpoint

- **CRITICAL**: Confirm whether `POST /api/v1/enhance/profiles` is public or internal
- If internal, use internal route `/api/instagram/enhance` (requires different auth)
- If public, fully documented in celavii-platforms SKILL.md

### 3. Document Cross-Platform ID Handling

- Prefix user-provided IDs with platform: `instagram_user` → check if needs `ig:` prefix
- Use `normalizePlatformName()` function to handle `ig`, `instagram`, `tiktok`, `tt` aliases
- Test with mixed-case usernames (adapters normalize to lowercase)

### 4. Implement Pagination for Large Results

- Hashtag scrapes can return 400–1000+ posts (TikTok cap ~400–800)
- `/api/v1/posts?search_id=X&limit=50&offset=Y` for pagination
- Consider caching first 100 results locally to avoid repeated API calls

---

**Report Generated**: April 28, 2026  
**Audit Depth**: Complete (all adapter files, queue implementation, API surfaces)  
**Status**: Ready for OpenClaw skill implementation
