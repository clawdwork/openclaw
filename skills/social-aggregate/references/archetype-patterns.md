# Hook Archetype Patterns (C8)

Source: 5-archetype foundation per [`social-orchestrator/SKILL.md`](file:///Users/operator/dev/openclaw/skills/social-orchestrator/SKILL.md) and [`social-hooks/SKILL.md`](file:///Users/operator/dev/openclaw/skills/social-hooks/SKILL.md).

Regex bank lives in `scripts/aggregate.py` (`ARCHETYPE_PATTERNS`). One hook can match multiple archetypes; the tagger sorts by hit-count and returns all matches (primary first).

## Curiosity Gap

- "Here's why \_\_\_"
- "The reason \_\_\_"
- "Nobody talks about **_" / "Nobody is talking about _**"
- "The truth about \_\_\_" / "What they don't tell you"
- Trailing "?" punctuation (interrogative gap)

## Contrarian

- "Stop using \_\_\_"
- "Don't \_\_\_"
- "You're wrong"
- "Hot take" / "Unpopular opinion"
- "Myth" / "Misconception" / "Overrated" / "Outdated"

## Story

- "I (was|tried|spent|built|lost|made) \_\_\_"
- "When I \_\_\_" / "Years ago"
- "Last (week|month|year)" / "My (first|biggest)"
- "Story time" / "True story" / "Here's what happened"

## Authority

- "I (analyzed|scored|reviewed|studied) \_\_\_"
- "After N (posts|videos|tests|years)"
- "5K creators / 1000 brands / 200 hours"
- "Data shows" / "Study" / "Research" / "The numbers say"

## Pattern Interrupt

- Sentence starts with: "Wait", "Hold on", "Stop", "Listen", "Ok so"
- "Plot twist" / "But here's the thing" / "Hear me out"
- Leading siren/warning emoji (🚨 ⚠️ 🛑)

## False positives the tagger accepts

Some hooks legitimately blend archetypes (Authority + Curiosity Gap is the most common high-performer). The tagger returns multiple, ranked by hit count. Aggregator's `hook_archetype_distribution` per channel uses the **primary** (highest hit count, first in list).

Channel affinity rules (used by `social-sxo` Mode B, not by this aggregator):

| Channel   | Preferred archetypes           |
| --------- | ------------------------------ |
| Elioth    | Story + Authority              |
| Celavii   | Authority + Curiosity Gap      |
| CutMaster | Pattern Interrupt + Contrarian |

Aggregator surfaces the actual mix; SXO compares actual vs preferred and warns on drift.
