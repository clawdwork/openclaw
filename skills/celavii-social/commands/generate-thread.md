# Generate Thread

Generate an X/Twitter thread with copy and optional image prompt.

## Usage

```
create a thread about [topic]
generate twitter thread for [silo]
write a thread on [concept]
prepare thread from queue post [id]
```

## Workflow

1. **Load context**
   - Read `social-strategy-state.json`
   - Identify silo and content hooks

2. **Generate copy**
   - Tweet 1: Hook (attention-grabbing opener)
   - Tweets 2-N: Value (one point per tweet, 280 char max each)
   - Final tweet: CTA with link
   - Hashtags: 3-5 only (in reply, not main thread)

3. **Generate image prompt** (for Tweet 1)
   - 1200x675px dimensions
   - Celavii brand style

4. **Save files**

   ```
   content/social/x-post-[NNN]-[slug]-thread.md
   ```

5. **Update state**

## Thread Best Practices

- 5-8 tweets optimal
- Each tweet is self-contained value
- Use line breaks within tweets for readability
- Numbers and stats grab attention
- End with clear CTA + link
