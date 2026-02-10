# Approve Asset

Approve a generated media asset and move it from drafts to approved.

## Usage

```
approve this image
this is great, approve it
approve [filename]
```

## Workflow

1. Identify the asset in `projects/{project}/media/generated/drafts/`
2. Move the file from `drafts/` → `approved/`
3. If a `.prompt.md` file exists alongside, move it too
4. If no `.prompt.md` exists, create one with the prompt that generated the asset
5. Append to `prompts/prompt-log.md`:
   ```
   | {date} | {image/video} | {prompt summary} | {filename} | ✅ Approved | — |
   ```
6. Confirm to user: "✅ Moved {filename} to approved/"

## File Naming Convention

```
{YYYY-MM-DD}-{descriptive-name}.png
{YYYY-MM-DD}-{descriptive-name}.prompt.md
```

## Prompt File Format (.prompt.md)

```markdown
# Prompt — {filename}

> Generated: {date}
> Model: {model used}
> Status: ✅ Approved

## Prompt

{full prompt text used to generate this asset}

## Settings

- Resolution: {if applicable}
- Aspect ratio: {if applicable}
- Seed: {if known}
```
