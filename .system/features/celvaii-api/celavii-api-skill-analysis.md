# Celavii API — Skill Leverage Analysis

> **Date**: 2026-02-09
> **Source**: `.system/features/celvaii-api/celavii-external-api.md`
> **Purpose**: Identify how OpenClaw agents can leverage the Celavii External API v1 to power marketing, CRM, growth, and data-refresh workflows.

---

## API Summary

| Property        | Value                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------- |
| **Base URL**    | `https://www.celavii.com/api/v1`                                                                |
| **Auth**        | Bearer token (`cvii_live_*`)                                                                    |
| **Endpoints**   | 45 authenticated + 2 public                                                                     |
| **Categories**  | Profiles, Campaigns, Lists, Analytics, Content, Manage/CRM, Knowledge Base, Enhancement, Scrape |
| **Rate Limits** | 20–300 req/min depending on tier                                                                |
| **Metering**    | Credit-based for compute-heavy ops                                                              |

---

## Proposed Skills (7)

We can break the API surface into **7 distinct skills**, grouped by workflow domain. Each skill maps cleanly to a set of related endpoints and a clear agent use case.

---

### 1. `celavii-discover` — Creator Discovery & Search

**Who uses it**: Marketing agents, growth agents, any agent doing research.

**Endpoints used**:
| Endpoint | Credits | Purpose |
|----------|---------|---------|
| `GET /profiles/search` | 1 | Keyword/niche/follower-range search |
| `GET /profiles/search/affinities` | 1 | AI-affinity-based search (topics, brands, locations) |
| `GET /analytics/hashtag-creators` | 1 | Find creators by hashtag usage |
| `GET /content/search` | 1 | Full-text search across post captions |

**Scopes required**: `profiles:read`, `analytics:read`

**Agent actions**:

- "Find 20 fitness creators with 50k–500k followers"
- "Find creators with high affinity to Nike in Miami"
- "Who posts the most about #sustainablefashion?"
- "Search posts mentioning 'protein shake' in the last 30 days"

**Why this matters**: This is the most natural entry point for agents. Instead of users manually searching the Celavii dashboard, an agent can do targeted discovery based on conversational criteria and return ranked results.

---

### 2. `celavii-profiles` — Creator Intelligence & Deep Dives

**Who uses it**: All agents needing creator context.

**Endpoints used**:
| Endpoint | Credits | Purpose |
|----------|---------|---------|
| `GET /profiles/:identifier` | 0 | Full profile (bio, stats, metadata) |
| `GET /profiles/:identifier/affinities` | 0 | AI-analyzed brand/topic affinities |
| `GET /profiles/:identifier/posts` | 0 | Recent posts |
| `GET /profiles/:identifier/network` | 0 | Network data availability |
| `GET /profiles/:identifier/followers` | 0 | Paginated followers |
| `GET /profiles/:identifier/following` | 0 | Paginated following |
| `GET /profiles/:identifier/social-links` | 0 | External links |
| `GET /profiles/:identifier/contact` | 0 | Emails, phones, websites |

**Scopes required**: `profiles:read`, `profiles:affinities`, `profiles:posts`, `profiles:network`, `profiles:contact`

**Agent actions**:

- "Give me a full brief on @leomessi"
- "What brands does this creator have affinity with?"
- "Show me their last 10 posts and engagement"
- "Get their contact email"
- "What other platforms are they on?"

**Why this matters**: Zero-credit lookups for most profile data. Agents can build rich creator briefs on-the-fly for decision-making, outreach prep, or campaign planning — all at no credit cost.

---

### 3. `celavii-campaigns` — Campaign Tracking & Performance

**Who uses it**: Marketing agents, campaign managers.

**Endpoints used**:
| Endpoint | Credits | Purpose |
|----------|---------|---------|
| `GET /campaigns` | 0 | List all campaigns |
| `GET /campaigns/:id/metrics` | 0 | Performance metrics |
| `GET /campaigns/:id/creators` | 0 | Assigned creators |
| `GET /campaigns/:id/content` | 1 | Matched content (hashtags, keywords, mentions) |

**Scopes required**: `campaigns:read`

**Agent actions**:

- "What campaigns are active right now?"
- "Show me the performance metrics for Q1 Brand Launch"
- "Which creators are assigned to the summer campaign?"
- "Pull all content matching our campaign hashtags, sorted by engagement"

**Why this matters**: Agents can proactively report on campaign health, surface top-performing content, and flag underperforming creators — shifting from reactive dashboard checks to proactive intelligence.

---

### 4. `celavii-analytics` — Audience & Network Analytics

**Who uses it**: Marketing agents, growth strategists.

**Endpoints used**:
| Endpoint | Credits | Purpose |
|----------|---------|---------|
| `GET /analytics/demographics` | 1 | Audience demographics breakdown |
| `GET /analytics/locations` | 1 | Geographic distribution |
| `GET /analytics/niches` | 1 | Top content niches |
| `GET /analytics/network-overlap` | 1 | Follower overlap between creators |
| `GET /analytics/shared-hashtags` | 1 | Shared hashtag usage |
| `GET /analytics/affinity-posts` | 1 | Posts linked to affinity concepts |

**Scopes required**: `analytics:read`

**Agent actions**:

- "What's the demographic breakdown of our tracked audience?"
- "Show audience overlap between @creator1 and @creator2"
- "What are the top niches across our creator roster?"
- "Find posts related to the 'photography' affinity"

**Why this matters**: This is where the **decision-making power** lives. Agents can answer strategic questions about audience composition, identify redundancy in creator portfolios (network overlap), and surface content trends — all programmatically.

---

### 5. `celavii-crm` — CRM Pipeline & Relationship Management

**Who uses it**: Marketing agents, relationship managers.

**Endpoints used**:
| Endpoint | Credits | Purpose |
|----------|---------|---------|
| `GET /manage/profiles` | 0 | Managed profiles with CRM data |
| `GET /manage/summary` | 0 | Pipeline summary |
| `GET /manage/stats` | 0 | Org-level statistics |
| `GET /lists` | 0 | Profile lists |
| `GET /lists/:id/members` | 0 | List members |

**Scopes required**: `manage:read`, `lists:read`

**Agent actions**:

- "How many creators are in our pipeline?"
- "Show me the CRM summary — how many in outreach vs. contracted?"
- "List all members of the 'Summer 2026 Shortlist'"
- "What are our org-level stats?"

**Why this matters**: Zero-credit access to the entire CRM state. Agents can answer pipeline questions instantly, track relationship status, and pull list rosters for campaign planning or outreach workflows.

---

### 6. `celavii-knowledge` — Knowledge Base Management

**Who uses it**: All agents (read), marketing agents (write).

**Endpoints used**:
| Endpoint | Credits | Purpose |
|----------|---------|---------|
| `GET /knowledge/folders` | 0 | Browse folder structure |
| `POST /knowledge/folders` | 0 | Create folders |
| `GET /knowledge/folders/:id/entries` | 0 | Browse entries |
| `POST /knowledge/entries` | 0 | Create entries |
| `GET /knowledge/entries/:id` | 0 | Read entry |
| `PUT /knowledge/entries/:id` | 0 | Update entry |
| `DELETE /knowledge/entries/:id` | 0 | Soft-delete entry |
| `GET /knowledge/context` | 0 | Semantic search |

**Scopes required**: `knowledge:read`, `knowledge:write`

**Agent actions**:

- "Save this creator brief to the Campaign Research folder"
- "Search the knowledge base for partnership terms"
- "Create a new folder for Q2 Research"
- "Update the Messi brief with the latest engagement data"

**Why this matters**: This is the **agent memory layer** for Celavii. Agents can store research findings, creator briefs, competitive intel, and campaign learnings — then retrieve them semantically later. This turns ad-hoc research into persistent organizational knowledge.

---

### 7. `celavii-data-ops` — Enhancement & Scrape Triggers

**Who uses it**: Growth agents, data pipeline agents.

**Endpoints used**:
| Endpoint | Credits | Purpose |
|----------|---------|---------|
| `POST /enhance/profiles` | 1-2/profile | Refresh & enrich profile data |
| `GET /enhance/:jobId/status` | 0 | Enhancement job status |
| `POST /scrape/followers` | 2 | Collect followers |
| `POST /scrape/following` | 2 | Collect following |
| `POST /scrape/locations` | 1 | Scrape location posts |
| `POST /scrape/hashtags` | 1 | Scrape hashtag posts |
| `POST /scrape/urls` | 1 | Scrape specific URLs |
| `GET /scrape/:jobId/status` | 0 | Scrape job status |
| `GET /me` | 0 | API key info & org details |
| `GET /usage` | 0 | Credit usage summary |

**Scopes required**: `enhance:trigger`, `scrape:trigger`

**Agent actions**:

- "Refresh profile data for our top 50 creators"
- "Dry run: how much would it cost to enhance these 200 profiles?"
- "Scrape the latest posts from #fitness and #wellness"
- "Collect followers of @competitor_brand"
- "Check my remaining credits and usage"

**Why this matters**: This is the **data freshness engine**. Agents can trigger data refreshes on demand (e.g., before a campaign report) or on a schedule. The `dry_run` capability is critical — agents should always cost-check before executing.

---

## Implementation Approach

### Skill Architecture

Each skill follows the existing OpenClaw skill pattern (SKILL.md with frontmatter):

```yaml
metadata:
  openclaw:
    emoji: "🔍"
    requires:
      env: ["CELAVII_API_KEY"]
```

All skills use `curl` against the REST API with the bearer token from `$CELAVII_API_KEY`.

### Shared Patterns

All 7 skills share common patterns that can be standardized:

1. **Auth header**: `Authorization: Bearer $CELAVII_API_KEY`
2. **Pagination**: cursor-based (`cursor` param, check `pagination.has_more`)
3. **Rate limit awareness**: check `X-RateLimit-Remaining` header
4. **Error handling**: check for `error.code` in response
5. **Dry runs**: always dry-run before enhance/scrape triggers
6. **Profile identifiers**: accept usernames directly (no ID lookups needed)

### Rollout Strategy

| Phase       | Skills                                                  | Rationale                                  |
| ----------- | ------------------------------------------------------- | ------------------------------------------ |
| **Phase 1** | `celavii-discover`, `celavii-profiles`                  | Highest value, read-only, low credit cost  |
| **Phase 2** | `celavii-campaigns`, `celavii-crm`, `celavii-analytics` | Read-only operational intelligence         |
| **Phase 3** | `celavii-knowledge`                                     | Read+write, agent memory layer             |
| **Phase 4** | `celavii-data-ops`                                      | Write/trigger operations, credit-consuming |

### Agent Assignment

| Agent Type          | Skills                                   |
| ------------------- | ---------------------------------------- |
| **Marketing Agent** | All 7                                    |
| **Growth Agent**    | discover, profiles, analytics, data-ops  |
| **CRM Agent**       | profiles, crm, knowledge                 |
| **Research Agent**  | discover, profiles, analytics, knowledge |
| **Campaign Agent**  | campaigns, profiles, analytics, content  |
| **General Agent**   | discover, profiles (read-only baseline)  |

---

## Credit Budget Considerations

| Operation Type    | Credit Cost         | Frequency               |
| ----------------- | ------------------- | ----------------------- |
| Profile lookups   | 0                   | High (many per session) |
| Searches          | 1 per query         | Medium                  |
| Analytics queries | 1 per query         | Medium                  |
| CRM/list reads    | 0                   | High                    |
| Knowledge ops     | 0                   | High                    |
| Enhancements      | 1-2/profile + Apify | Low (batched)           |
| Scrapes           | 1-2 + Apify         | Low (scheduled)         |

**Key insight**: The majority of useful agent operations (profile lookups, CRM reads, knowledge base, campaign data) are **zero-credit**. The credit-consuming operations (search, analytics, enhance, scrape) should be gated by agent confirmation or dry-run checks.

---

## API Key Configuration

The Celavii API key (`CELAVII_API_KEY`) is shared across all agents/members. Configure it via the OpenClaw env system (precedence order):

### Option A: Config `env` block (recommended)

In `~/.openclaw/openclaw.json`:

```json5
{
  env: {
    CELAVII_API_KEY: "cvii_live_your_key_here",
  },
}
```

### Option B: Global `.env`

In `~/.openclaw/.env`:

```
CELAVII_API_KEY=cvii_live_your_key_here
```

### Option C: Process environment

```bash
export CELAVII_API_KEY="cvii_live_your_key_here"
```

### Skill frontmatter declaration

Each Celavii skill declares the env requirement so the gateway knows to check for it:

```yaml
metadata:
  openclaw:
    requires:
      env: ["CELAVII_API_KEY"]
    primaryEnv: "CELAVII_API_KEY"
```

### Scope recommendations

- **Most agents**: `read_all` scope (excludes `:trigger`, `:write`, `profiles:contact`)
- **CRM agents**: add `profiles:contact`
- **Data ops agents**: add `enhance:trigger`, `scrape:trigger` (with confirmation gates)
- **Knowledge write agents**: add `knowledge:write`

---

## Next Steps

1. **Decide scope**: All 7 skills, or start with Phase 1 (discover + profiles)?
2. **API key provisioning**: Need a `cvii_live_*` key with appropriate scopes
3. **Build Phase 1 skills**: Create `skills/celavii-discover/SKILL.md` and `skills/celavii-profiles/SKILL.md`
4. **Test with live API**: Validate endpoints return expected data
5. **Iterate**: Add Phase 2–4 skills based on agent usage patterns
