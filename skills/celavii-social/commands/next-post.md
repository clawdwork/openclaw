# Next Post

Identify and prepare the next post from the content queue.

## Usage

```
what's the next post?
prepare the next social post
generate next queued content
what should I post next?
```

## Workflow

1. **Load state**

   ```bash
   cat ~/agent-workspace/projects/celavii/research/social/social-strategy-state.json
   ```

2. **Identify next post**
   - Find first item in `content_queue` with `status: "draft"`
   - Check `week` and `day` against current date
   - Prioritize by `rank`

3. **Display post details**
   - Post ID, platform, silo, content type
   - Hook and body outline
   - Scheduled day

4. **Offer actions**
   - "Generate copy for this post"
   - "Generate media prompts"
   - "Skip to next post"

5. **Execute chosen action**
   - Route to appropriate command (generate-carousel, generate-thread, etc.)

## Queue Status Legend

| Status    | Meaning                       |
| --------- | ----------------------------- |
| draft     | Outlined, not started         |
| ready     | Copy complete, awaiting media |
| scheduled | Queued for publishing         |
| published | Live on platform              |
