# OpenRouter Integration

> Part of [System Architecture](README.md)
> Verified: 2026-04-25 against https://openrouter.ai/docs

OpenRouter is OpenClaw's fourth model provider, alongside Anthropic, OpenAI, and Google. It fronts ~300 models from ~60 upstream hosts via a single OpenAI-compatible endpoint. Use it for models we cannot reach directly: Kimi (Moonshot), GLM (Zhipu), DeepSeek, MiniMax, Qwen.

---

## Endpoint & Auth

| Item        | Value                                           |
| ----------- | ----------------------------------------------- |
| Base URL    | `https://openrouter.ai/api/v1`                  |
| Auth header | `Authorization: Bearer $OPENROUTER_API_KEY`     |
| Env var     | `OPENROUTER_API_KEY` (~/.openclaw/.env)         |
| SDK         | OpenAI SDK (Python/TS) with `base_url` override |
| Schema      | OpenAI Chat Completions, fully compatible       |

### Required headers (every call)

```http
Authorization: Bearer sk-or-v1-...
Content-Type: application/json
HTTP-Referer: https://openclaw.local        # leaderboard / app attribution
X-Title: OpenClaw                            # app display name
```

`HTTP-Referer` is the primary key for leaderboard tracking; without it, requests are anonymous. `X-Title` alone (no referer) does not register an app.

---

## Registered Model Aliases

Defined in `~/dev/config/openclaw.json` under `agents.defaults.models`. Switch with `/model <alias>`.

| Alias           | Slug                     | Context | $in/M  | $out/M | Tools      | Thinking | Caching (verified)                                                 |
| --------------- | ------------------------ | ------- | ------ | ------ | ---------- | -------- | ------------------------------------------------------------------ |
| `DeepSeek-V3.2` | `deepseek/deepseek-v3.2` | 131K    | $0.252 | $0.378 | ✅         | none     | ❌ on Novita (no upstream first-party DeepSeek host on OpenRouter) |
| `Kimi-K2.6`     | `moonshotai/kimi-k2.6`   | 256K    | $0.745 | $4.66  | unverified | ✅       | ✅ via Moonshot AI upstream (818 cached on smoke test)             |
| `MiniMax-M2.7`  | `minimax/minimax-m2.7`   | 196K    | $0.30  | $1.20  | unverified | ✅       | ❌ verified empirically (0 cached on warm pinned call)             |

Last empirical verification: 2026-04-25 via `~/dev/workspace/scripts/openrouter-smoke-test.sh`.

---

## Recommended Defaults for Every OpenRouter Call

```json
{
  "model": "moonshotai/kimi-k2.6",
  "messages": [...],
  "max_tokens": 1024,
  "usage": { "include": true },
  "stream_options": { "include_usage": true },
  "provider": {
    "require_parameters": true,
    "data_collection": "deny"
  }
}
```

Plus the two attribution headers above.

`require_parameters: true` forces routing to upstreams that support every parameter in the request (tools, structured output, reasoning). Without it, OpenRouter may silently fall over to a host that drops capabilities.

`stream_options.include_usage: true` is the only way to get `usage` on the final SSE chunk for streamed responses. Without it, streamed calls miss cost accounting entirely.

---

## Provider Routing

The `provider` object on each request controls upstream selection.

```json
"provider": {
  "order": ["moonshotai", "novita"],
  "only": ["moonshotai"],
  "ignore": ["alibaba"],
  "allow_fallbacks": true,
  "require_parameters": true,
  "data_collection": "deny",
  "zdr": false,
  "sort": "price",
  "quantizations": ["fp16", "bf16"],
  "max_price": { "prompt": 0.01, "completion": 0.02 },
  "preferred_min_throughput": { "p90": 50 },
  "preferred_max_latency": { "p90": 3 }
}
```

| Field                      | Purpose                                                               |
| -------------------------- | --------------------------------------------------------------------- |
| `order`                    | Try upstreams in sequence; falls through on error                     |
| `only`                     | Allowlist — restrict to listed upstreams                              |
| `ignore`                   | Denylist — exclude listed upstreams                                   |
| `allow_fallbacks`          | Default `true`; set `false` to error on primary failure               |
| `require_parameters`       | Default `false`; set `true` for tools/reasoning/JSON-schema workflows |
| `data_collection`          | `"deny"` to exclude upstreams that train on user data                 |
| `zdr`                      | `true` to require zero-data-retention upstreams only                  |
| `sort`                     | `"price"` / `"throughput"` / `"latency"`                              |
| `quantizations`            | Filter by quant level — keep `fp16`/`bf16` for quality-critical work  |
| `max_price`                | Hard ceiling per token type (prompt/completion/image/request)         |
| `preferred_min_throughput` | Soft floor; deprioritizes slow upstreams without excluding them       |
| `preferred_max_latency`    | Soft ceiling on p50/p75/p90/p99 latency                               |

### Model suffix shortcuts (alternative to provider object)

| Suffix      | Effect                                                |
| ----------- | ----------------------------------------------------- |
| `:nitro`    | Equivalent to `sort: "throughput"`                    |
| `:floor`    | Equivalent to `sort: "price"`                         |
| `:thinking` | Reasoning enabled (model-specific)                    |
| `:extended` | Extended context tier                                 |
| `:free`     | Free variant of the model                             |
| `:beta`     | Beta channel                                          |
| `:online`   | **Deprecated** — use `plugins: [{id: "web"}]` instead |

### Pinning convention for our aliases

| Alias           | Pin (`provider.only`)      | Why                                                                                                                                  |
| --------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `Kimi-K2.6`     | `["moonshotai"]`           | Only upstream verified to cache through OpenRouter                                                                                   |
| `MiniMax-M2.7`  | `["minimax"]`              | First-party upstream; no caching either way                                                                                          |
| `DeepSeek-V3.2` | `["novita"]` (provisional) | First-party DeepSeek not available; needs empirical caching test across `chutes`, `deepinfra`, `atlas-cloud`, `parasail`, `friendli` |

Cache only hits when the _same_ upstream is selected on consecutive calls. Without pinning, OpenRouter load-balances and busts the cache.

---

## Reasoning / Thinking Tokens

Full `reasoning` parameter shape:

```json
"reasoning": {
  "effort": "low",          // "minimal" | "low" | "medium" | "high" | "xhigh" | "none"
  "max_tokens": 1024,        // 1024-128000; floor / ceiling enforced
  "enabled": true,           // shortcut: enables reasoning at "medium" effort
  "exclude": false           // true = think internally, omit from response (still billed)
}
```

Effort ratios applied to `max_tokens`:

| Effort    | Reasoning budget |
| --------- | ---------------- |
| `xhigh`   | ~95 % (cap 128K) |
| `high`    | ~80 %            |
| `medium`  | ~50 %            |
| `low`     | ~20 %            |
| `minimal` | ~10 %            |
| `none`    | disabled         |

**Critical**: `max_tokens` on the request must be **strictly greater than** the reasoning budget — otherwise the visible completion truncates to nothing. This was the cause of the `finish_reason: "length"` failure on the first Kimi/MiniMax smoke run.

Reasoning content surfaces in **two locations** in the response:

```json
"choices": [{
  "message": {
    "content": "PONG",
    "reasoning": "The user wants me to reply with...",
    "reasoning_details": [
      { "type": "reasoning.summary", "text": "..." },
      { "type": "reasoning.text",    "text": "..." },
      { "type": "reasoning.encrypted", "data": "..." }
    ]
  }
}],
"usage": {
  "completion_tokens_details": { "reasoning_tokens": 136 }
}
```

Streaming surfaces reasoning via `delta.reasoning_details` per chunk.

Reasoning tokens are billed at the model's full output rate. There is no discount.

---

## Prompt Caching

### Two mechanisms

**Explicit (Anthropic-style breakpoints)** — pass `cache_control` on individual content blocks:

```json
{
  "type": "text",
  "text": "...static reference material...",
  "cache_control": { "type": "ephemeral", "ttl": "1h" }
}
```

- `type: "ephemeral"` is the only valid value
- `ttl`: `"5m"` (default) or `"1h"`
- Up to 4 breakpoints per request

**Implicit (automatic)** — no request changes; provider's KV cache transparent.

### Pricing matrix

| Provider             | Mechanism                        | Write multiplier         | Read multiplier    |
| -------------------- | -------------------------------- | ------------------------ | ------------------ |
| Anthropic Claude     | explicit                         | 1.25x (5m) / **2x (1h)** | 0.1x               |
| OpenAI               | implicit                         | none                     | 0.25x – 0.50x      |
| Gemini 2.5 Pro       | implicit                         | input + storage          | 0.25x (≥2,048 tok) |
| Gemini 2.5 Flash     | implicit                         | input + storage          | 0.25x (≥1,028 tok) |
| DeepSeek (1st-party) | implicit                         | 1x                       | provider-specified |
| Moonshot / Kimi      | implicit                         | none                     | provider-specified |
| Grok / Groq          | implicit                         | none                     | provider-specified |
| MiniMax              | none verified through OpenRouter | n/a                      | n/a                |
| Zhipu GLM            | unverified                       | n/a                      | n/a                |

### Cache accounting in response

```json
"usage": {
  "prompt_tokens": 818,
  "prompt_tokens_details": {
    "cached_tokens": 818,
    "cache_write_tokens": 0
  }
}
```

`cached_tokens > 0` ⇒ cache hit; `cache_write_tokens > 0` ⇒ a new prefix was committed to cache (usually billed at the write multiplier).

### Critical caveats

1. **Cache requires sticky upstream**. Without `provider.only`, OpenRouter load-balances and routes consecutive calls to different hosts; cache misses every time.
2. **DeepSeek's automatic caching only exists on the first-party DeepSeek API**. Through OpenRouter (which routes to Novita / AtlasCloud / Chutes / etc.), caching does NOT pass through. Verified empirically 2026-04-25.
3. **Tool definition changes invalidate the cache**. Modifying the `tools` array busts the prefix.
4. **BYOK** caching follows upstream behavior, not OpenRouter's policy.

---

## Tool Calling

Standard OpenAI-compatible schema:

```json
"tools": [
  {
    "type": "function",
    "function": {
      "name": "lookup",
      "description": "Look up a value",
      "parameters": {
        "type": "object",
        "properties": { "key": { "type": "string" } },
        "required": ["key"]
      }
    }
  }
],
"tool_choice": "auto",
"parallel_tool_calls": true
```

`tool_choice` values:

- `"auto"` (default) — model decides
- `"none"` — disable tools
- `{ "type": "function", "function": { "name": "lookup" } }` — force a specific tool

Set `provider.require_parameters: true` for any agent that depends on tool calling. Otherwise OpenRouter may fall through to a host that drops tool semantics silently.

Filter for tool-capable models: https://openrouter.ai/models?supported_parameters=tools

---

## Structured Output

```json
"response_format": {
  "type": "json_schema",
  "json_schema": {
    "name": "weather_response",
    "strict": true,
    "schema": {
      "type": "object",
      "properties": { "temp_c": { "type": "number" } },
      "required": ["temp_c"],
      "additionalProperties": false
    }
  }
}
```

`strict: true` guarantees schema adherence on supported models (GPT-4o+, Gemini, Claude Sonnet 4.5+). For others, falls back to best-effort.

For older clients use `response_format: { type: "json_object" }` — JSON mode without schema validation.

---

## Streaming

Standard SSE (Server-Sent Events) with `data: {JSON}` chunks, terminated by `data: [DONE]`.

```json
"stream": true,
"stream_options": { "include_usage": true }
```

`include_usage: true` is **required** to get `usage` on the final chunk; without it, streamed calls miss cost accounting.

Each chunk shape:

```json
{ "choices": [{ "delta": { "content": "..." } }] }
```

Final chunk includes `finish_reason` and (with `include_usage`) the full `usage` object.

OpenRouter emits comment lines like `: OPENROUTER PROCESSING` to keep the connection alive — clients should ignore them. Mid-stream errors surface as a chunk with `finish_reason: "error"` and an `error` object; the HTTP status remains 200 because headers were already sent.

---

## Plugins

### Web search

```json
"plugins": [{
  "id": "web",
  "engine": "exa",
  "max_results": 5,
  "include_domains": ["github.com"],
  "exclude_domains": ["spam.com"],
  "search_prompt": "..."
}]
```

| Engine      | Cost                                | Notes                                           |
| ----------- | ----------------------------------- | ----------------------------------------------- |
| `native`    | provider-dependent                  | OpenAI / Anthropic / Perplexity / xAI built-ins |
| `exa`       | $4 / 1,000 results (~$0.02 default) | neural + keyword hybrid                         |
| `firecrawl` | BYOK; uses your Firecrawl credits   | 100K free hobby credits                         |
| `parallel`  | $4 / 1,000 results                  | domain filtering support                        |

The legacy `:online` model suffix is deprecated; use the plugin form.

### Context compression

```json
"plugins": [{ "id": "context-compression", "enabled": false }]
```

**Auto-enabled on models with ≤8,192 token context.** It silently drops middle messages when the prompt overflows. Disable explicitly for any agent handling ordered logs, transcripts, or anywhere middle-message removal would corrupt meaning.

---

## Observability

### Per-call tracking

Every response includes the header `X-Generation-Id: <uuid>`. Use it for post-hoc cost / usage lookup.

```bash
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  "https://openrouter.ai/api/v1/generation?id=<UUID>"
```

Returns `tokens_prompt`, `tokens_completion`, `native_tokens_cached`, `total_cost`, `cache_discount`, `provider_name`, `latency`, `generation_time`.

### Account state

```bash
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  https://openrouter.ai/api/v1/credits
# → { "data": { "total_credits": 10.0, "total_usage": 0.014 } }

curl -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  https://openrouter.ai/api/v1/key
# → { limit, limit_remaining, usage, all_time, monthly, weekly, daily, is_free_tier }
```

Both endpoints are good candidates to wire into `arch-verify.sh`.

### Per-model upstream introspection

```bash
curl -s "https://openrouter.ai/api/v1/models/deepseek/deepseek-v3.2/endpoints" | jq
```

Returns each upstream's: latency p50/p75/p90/p99 (last 30 min), throughput, uptime (5m/30m/1d), supported parameters, **implicit caching support flag**, per-token pricing.

Use this to pick `provider.only` empirically rather than guessing.

---

## BYOK

Configured in dashboard: https://openrouter.ai/settings/integrations (not in request headers).

| Item                         | Behavior                                                        |
| ---------------------------- | --------------------------------------------------------------- |
| Surcharge                    | 5 % of OpenRouter's standard rate, after first 1M req/month     |
| Free tier                    | First 1M BYOK requests/month: no OpenRouter cost                |
| Rate limits                  | Inherited from upstream provider account                        |
| `Always use this key` toggle | Disables fallback to shared credits — fails on rate-limit/error |
| Supported providers          | Anthropic, OpenAI, Azure AI, AWS Bedrock, Google Vertex, others |

---

## Rate Limits

| Tier                       | Free models           | Paid models                   |
| -------------------------- | --------------------- | ----------------------------- |
| No credits purchased       | 20 req/min, 50/day    | blocked                       |
| ≥$10 credits purchased     | 20 req/min, 1,000/day | no platform-level limits      |
| Pay-as-you-go / Enterprise | as above              | upstream-provider limits only |

Cloudflare DDoS protection still applies above "reasonable usage". Negative balance returns `402 Payment Required`.

`X-RateLimit-Limit` / `X-RateLimit-Remaining` / `X-RateLimit-Reset` response headers are mentioned in third-party guides but **not in the official API reference** — treat as unverified until confirmed via probe.

---

## Errors

| Status | Meaning                                                   |
| ------ | --------------------------------------------------------- |
| 400    | bad request / CORS                                        |
| 401    | invalid or expired key                                    |
| 402    | insufficient credits                                      |
| 403    | input flagged by moderation                               |
| 404    | model / route not found, or pinned upstream not available |
| 408    | request timeout                                           |
| 429    | rate limited                                              |
| 502    | upstream invalid response or model unavailable            |
| 503    | no provider satisfies the requested constraints           |

```json
{
  "error": {
    "code": 404,
    "message": "No allowed providers are available for the selected model.",
    "metadata": {
      "available_providers": ["novita", "deepinfra", "atlas-cloud", "..."],
      "requested_providers": ["deepseek"]
    }
  }
}
```

`metadata` is shape-flexible — moderation includes `reasons` + `flagged_input`; provider errors include `provider_name` + `raw` (the original upstream error).

---

## Useful Endpoints (Reference)

| Method | Path                                       | Purpose                                    |
| ------ | ------------------------------------------ | ------------------------------------------ |
| POST   | `/api/v1/chat/completions`                 | Main chat endpoint                         |
| POST   | `/api/v1/completions`                      | Legacy text completion                     |
| GET    | `/api/v1/models`                           | List all models with metadata + pricing    |
| GET    | `/api/v1/models/{author}/{slug}/endpoints` | Per-upstream stats and pricing for a model |
| GET    | `/api/v1/credits`                          | Account balance                            |
| GET    | `/api/v1/key`                              | Current key info, usage, rate limits       |
| GET    | `/api/v1/generation?id=<uuid>`             | Per-call cost and token breakdown          |

OpenAPI specs (machine-readable):

- YAML: https://openrouter.ai/openapi.yaml
- JSON: https://openrouter.ai/openapi.json

---

## Smoke Test

`~/dev/workspace/scripts/openrouter-smoke-test.sh` — runs cold + warm calls against all three registered aliases with pinned upstreams, reports `cached_tokens`, reasoning, content, errors. Run after any provider/key change or model alias addition.

Outputs verified 2026-04-25:

| Model           | Chat | Reasoning surfaced  | Caching empirically                |
| --------------- | ---- | ------------------- | ---------------------------------- |
| `DeepSeek-V3.2` | ✅   | n/a (non-reasoning) | ❌ on Novita upstream              |
| `Kimi-K2.6`     | ✅   | ✅ 135 tokens       | ✅ 818 cached on Moonshot upstream |
| `MiniMax-M2.7`  | ✅   | ✅ 36–42 tokens     | ❌ 0 cached (no caching support)   |

---

## Outstanding Work

1. Empirically test caching on `deepseek/deepseek-v3.2` across `chutes`, `deepinfra`, `atlas-cloud`, `parasail`, `friendli` upstreams to find one that preserves implicit caching.
2. Confirm tool-calling support for Kimi K2.6 and MiniMax M2.7 via a dedicated tool-call smoke test.
3. Add `OPENROUTER_API_KEY` presence + `/credits` balance check to `scripts/arch-verify.sh`.
4. Decide which production agent (if any) gets routed to OpenRouter aliases — candidate: quality-critic with `Kimi-K2.6` as a cost-efficient second opinion alongside GPT-5.2.
