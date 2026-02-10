# Reject Asset

Reject a generated media asset with feedback and move it from drafts to rejected.

## Usage

```
reject this — too warm, lighting is wrong
this doesn't work, reject it — [feedback]
reject [filename] — [reason]
```

## Workflow

1. Identify the asset in `projects/{project}/media/generated/drafts/`
2. Move the file from `drafts/` → `rejected/`
3. Create a `.feedback.md` file alongside in `rejected/`:

   ```markdown
   # Feedback — {filename}

   > Rejected: {date}
   > Reviewer: user

   ## Reason

   {user's feedback verbatim}

   ## Suggested Fix

   {agent's interpretation of what to change next time}
   ```

4. Append to `prompts/prompt-log.md`:
   ```
   | {date} | {image/video} | {prompt summary} | {filename} | ❌ Rejected | {feedback summary} |
   ```
5. **Update `MEDIA-CONFIG.md` § Style Notes** with a lesson learned from the rejection:
   - Extract the actionable insight (e.g., "too warm" → "Avoid overly warm lighting")
   - Append as a new bullet under Style Notes
   - This ensures future generations respect the feedback
6. Confirm to user: "❌ Moved {filename} to rejected/ — noted: {feedback summary}"
7. Offer to regenerate with adjusted parameters

## Style Notes Update Pattern

When updating `MEDIA-CONFIG.md`, add specific, actionable notes:

```
✅ Good: "Avoid overly warm lighting — client prefers cool/neutral tones"
✅ Good: "Use mid-shot minimum — no extreme close-ups"
❌ Bad:  "Lighting was wrong" (too vague to be useful)
❌ Bad:  "Client didn't like it" (not actionable)
```

## Important

- Always preserve the original prompt alongside the rejected asset
- The feedback loop is critical — every rejection teaches the agent
- Read MEDIA-CONFIG.md style notes BEFORE generating new assets
