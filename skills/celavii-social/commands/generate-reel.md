# Generate Reel/TikTok

Generate a video script for Instagram Reels or TikTok.

## Usage

```
create a reel about [topic]
generate tiktok script for [concept]
write a video script for [silo]
prepare reel from queue post [id]
```

## Workflow

1. **Load context**
   - Read `social-strategy-state.json`
   - Identify silo and content hooks

2. **Generate script**
   - Hook (0-3s): Attention grabber
   - Problem (3-10s): Pain point
   - Solution (10-25s): Value/demo
   - CTA (25-30s): Clear action

3. **Generate image prompt** (for first frame if using image-to-video)
   - 1080x1920px (vertical)
   - Use `media-content/image-prompting` patterns

4. **Generate video prompt** (if full video gen)
   - Use `media-content/video-prompting` patterns
   - Include audio direction

5. **Save files**
   ```
   content/social/[platform]-post-[NNN]-[slug]-reel.md
   ```

## Video Duration Guide

| Duration | Content Type           |
| -------- | ---------------------- |
| 15-30s   | Quick tip, stat reveal |
| 30-60s   | Tutorial, demo         |
| 60-90s   | Story, deep dive       |

## Audio Notes

- Trending sounds boost reach
- Original audio for educational content
- VO style: conversational, energetic
