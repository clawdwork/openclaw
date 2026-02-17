# Channels & Routing

> Part of [System Architecture](README.md)

---

## Channel Routing per Agent

```
admin-001  ← Telegram: @maxious_bot (existing) + WhatsApp DM from owner
member-001 ← Telegram: @team1_bot (separate bot) + WhatsApp DM from team member
guest-001  ← WhatsApp DM-split by sender E.164
```

---

## Frontend / WebChat Channel

OpenClaw includes a built-in **WebChat** channel (`ws://127.0.0.1:49152`). Each agent can be accessed via WebChat by selecting the agent. For a custom webapp or iOS app, hit the gateway HTTP API directly — the gateway IS the backend. No additional server required.

| Channel    | Protocol           | Per-Agent?                      | Notes                             |
| ---------- | ------------------ | ------------------------------- | --------------------------------- |
| Telegram   | Bot API            | ✅ Separate bot per agent       | Cleanest isolation                |
| WhatsApp   | Web/API            | ✅ DM-split or separate numbers | One number, N agents via bindings |
| WebChat    | WebSocket          | ✅ Agent selector in UI         | Built-in, no extra setup          |
| Custom App | HTTP → Gateway API | ✅ Route by agent ID            | Build your own frontend           |

---

## Per-Sender Session Isolation (WhatsApp)

Each WhatsApp DM creates a **separate, private session** keyed by sender phone number:

```
Your messages:     agent:admin-001:whatsapp:dm:+15555555555    ← YOUR private session
Team member:       agent:member-001:whatsapp:dm:+1THEIR_NUMBER ← THEIR private session
```

- No cross-talk — senders never see each other's replies
- Bot replies **in the same DM thread** it received the message from
- All on **one WhatsApp number** — bindings determine which agent handles which sender

---

## Bindings Configuration

Bindings route incoming messages to specific agents based on channel + sender:

```json
{
  "bindings": [
    {
      "agentId": "admin-001",
      "match": { "channel": "telegram" }
    },
    {
      "agentId": "admin-001",
      "match": { "channel": "whatsapp", "peer": { "kind": "dm", "id": "+15555555555" } }
    },
    {
      "agentId": "member-001",
      "match": { "channel": "telegram", "accountId": "team1" }
    },
    {
      "agentId": "member-001",
      "match": { "channel": "whatsapp", "peer": { "kind": "dm", "id": "+1TEAMEMBER" } }
    },
    {
      "agentId": "guest-001",
      "match": { "channel": "whatsapp", "peer": { "kind": "dm", "id": "+1GUESTNUMBER" } }
    }
  ]
}
```

### Binding Patterns Reference

| Pattern                                                              | Matches                                  | Use Case           |
| -------------------------------------------------------------------- | ---------------------------------------- | ------------------ |
| `{ "channel": "telegram" }`                                          | All Telegram messages (default bot)      | Admin catch-all    |
| `{ "channel": "telegram", "accountId": "team1" }`                    | Specific Telegram bot                    | Per-agent bot      |
| `{ "channel": "whatsapp", "peer": { "kind": "dm", "id": "+1..." } }` | Specific WhatsApp sender                 | Per-person routing |
| `{ "channel": "whatsapp" }`                                          | All WhatsApp messages (no binding match) | Default agent      |
| `{ "channel": "webchat" }`                                           | WebChat connections                      | Default agent      |

---

## WhatsApp DM Policy + Bindings Flow

```
Incoming WhatsApp DM from +1SENDER
        │
        ├── Is sender in allowFrom or paired? ──── No ──→ Pairing gate (send code)
        │                                          Yes
        ▼
        ├── Does a binding match sender? ──── Yes ──→ Route to matched agent
        │                                     No
        ▼
        └── Route to default agent
```

---

## Current WhatsApp Status

| Setting                | Value                                                   |
| ---------------------- | ------------------------------------------------------- |
| **Dedicated number**   | ✅ Linked and running                                   |
| **DM policy**          | `pairing` (unknown senders get a code)                  |
| **Paired senders**     | `+15555555555` (admin)                                  |
| **LaunchAgent**        | ✅ Installed (`ai.openclaw.gateway`) — survives reboots |
| **Gateway management** | `openclaw gateway restart/stop/start/status`            |

### Next Steps to Configure Bindings

1. Add `bindings` array to `~/.openclaw/openclaw.json`
2. Add `allowFrom` for known team member phone numbers
3. Restart gateway: `openclaw gateway restart`
4. Verify: `openclaw channels status`
