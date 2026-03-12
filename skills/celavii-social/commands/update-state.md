# Update State

Update the social strategy state file after publishing or scheduling.

## Usage

```
mark post [id] as published
update post [id] status to scheduled
record that [post] went live
```

## Workflow

1. **Load state**

   ```bash
   cat ~/agent-workspace/projects/celavii/research/social/social-strategy-state.json
   ```

2. **Find post** by ID in `content_queue` or `phases.execute.schedule`

3. **Update fields**
   - `status`: "draft" → "ready" → "scheduled" → "published"
   - `published_at`: ISO timestamp when published
   - `scheduled_for`: ISO timestamp when scheduled
   - `metrics`: Add initial metrics if available

4. **Update aggregate metrics**
   - Increment `phases.execute.posts_published`
   - Update `metrics.by_platform.[platform].posts`

5. **Save state**

## Status Transitions

```
draft → ready (copy complete)
ready → scheduled (added to scheduler)
scheduled → published (went live)
```

## Example Update

```json
{
  "id": "ig-post-002",
  "status": "published",
  "published_at": "2026-03-10T16:00:00Z",
  "metrics": {
    "likes": 0,
    "comments": 0,
    "saves": 0,
    "shares": 0,
    "reach": 0,
    "impressions": 0
  }
}
```
