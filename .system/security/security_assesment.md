# OpenClaw Security Assessment

**Date:** February 4, 2026  
**Repository:** https://github.com/openclaw/openclaw  
**Environment:** Siloed macOS machine with daemon heartbeats

---

## Executive Summary

OpenClaw is a personal AI assistant that runs as a daemon with full system access (shell commands, file read/write, browser control, messaging). This assessment covers security hardening required **before** installation on your siloed environment.

---

## 1. Default Port Configuration (CRITICAL)

### Default Ports Used

| Service         | Default Port | Purpose                        |
| --------------- | ------------ | ------------------------------ |
| Gateway         | **18789**    | Main WebSocket/HTTP gateway    |
| Bridge          | 18790        | Internal bridge communication  |
| Browser Control | 18791        | Browser automation control     |
| Canvas Host     | 18793        | Canvas/UI hosting              |
| Browser CDP     | 18800-18899  | Chrome DevTools Protocol range |

### ⚠️ Recommendation: Change Default Port

The default port `18789` is well-known. Change it to a non-standard port:

```json5
// ~/.openclaw/openclaw.json
{
  gateway: {
    port: 28456, // Custom port (pick your own random high port)
    bind: "loopback", // CRITICAL: Only bind to localhost
  },
}
```

**Environment variable alternative:**

```bash
export OPENCLAW_GATEWAY_PORT=28456
```

---

## 2. Network Exposure (CRITICAL)

### Bind Configuration

| Bind Mode            | Description       | Security Risk            |
| -------------------- | ----------------- | ------------------------ |
| `loopback` (default) | Only localhost    | ✅ Safest                |
| `lan`                | Local network     | ⚠️ Risky                 |
| `tailnet`            | Tailscale network | Moderate (authenticated) |
| `custom`             | Custom binding    | ⚠️ Requires firewall     |

### ✅ Recommended Configuration

```json5
{
  gateway: {
    mode: "local",
    bind: "loopback", // NEVER use "lan" or "0.0.0.0" without firewall
    port: 28456,
    auth: {
      mode: "token",
      token: "${OPENCLAW_GATEWAY_TOKEN}", // Use env var, not hardcoded
    },
  },
}
```

**NEVER do this:**

```json5
// ❌ DANGEROUS - Exposes gateway to all interfaces
{
  gateway: {
    bind: "lan", // or "0.0.0.0"
    auth: { mode: "none" },
  },
}
```

---

## 3. Authentication Hardening

### Gateway Token Authentication

Generate a strong token:

```bash
# Generate a secure 64-character token
openssl rand -base64 48
```

Store in environment (not in config file):

```bash
# Add to ~/.zshrc or ~/.profile
export OPENCLAW_GATEWAY_TOKEN="your-generated-token-here"
```

Reference in config:

```json5
{
  gateway: {
    auth: {
      mode: "token",
      token: "${OPENCLAW_GATEWAY_TOKEN}",
    },
  },
}
```

### Password Mode (Alternative)

```bash
export OPENCLAW_GATEWAY_PASSWORD="your-strong-password"
```

```json5
{
  gateway: {
    auth: {
      mode: "password",
      password: "${OPENCLAW_GATEWAY_PASSWORD}",
    },
  },
}
```

---

## 4. File Permissions (CRITICAL)

### Required Permissions

```bash
# Set correct permissions on OpenClaw state directory
chmod 700 ~/.openclaw
chmod 600 ~/.openclaw/openclaw.json
chmod -R 700 ~/.openclaw/credentials
chmod -R 700 ~/.openclaw/agents
```

### Sensitive Files to Protect

| Path                                            | Contains                   | Required Permission    |
| ----------------------------------------------- | -------------------------- | ---------------------- |
| `~/.openclaw/openclaw.json`                     | Config with tokens         | 600                    |
| `~/.openclaw/credentials/**`                    | Channel credentials, OAuth | 700 (dir), 600 (files) |
| `~/.openclaw/agents/*/agent/auth-profiles.json` | API keys, OAuth tokens     | 600                    |
| `~/.openclaw/agents/*/sessions/**`              | Session transcripts        | 700 (dir)              |

### Verify with Built-in Audit

```bash
openclaw security audit --deep
openclaw doctor  # Checks permissions
```

---

## 5. mDNS/Bonjour Discovery (Information Disclosure)

OpenClaw advertises itself via mDNS which can leak:

- CLI path (reveals username)
- SSH port availability
- Hostname information

### ✅ Disable or Minimize mDNS

```json5
{
  discovery: {
    mdns: { mode: "off" }, // Best for security
    // Or: mode: "minimal" (omits sensitive fields)
  },
}
```

**Environment variable:**

```bash
export OPENCLAW_DISABLE_BONJOUR=1
```

---

## 6. DM and Group Access Control

### DM Policy (Direct Messages)

```json5
{
  channels: {
    whatsapp: {
      dmPolicy: "pairing", // Requires approval for new senders
      // Or: "allowlist" - strict allowlist only
      // NEVER: "open" - allows anyone to message
      allowFrom: ["+15555550123"], // Your phone number
    },
    telegram: {
      dmPolicy: "pairing",
      allowFrom: ["@yourusername"],
    },
  },
}
```

### Group Policy

```json5
{
  channels: {
    whatsapp: {
      groupPolicy: "allowlist",
      groups: {
        "*": { requireMention: true }, // Require @mention in all groups
      },
    },
  },
}
```

---

## 7. Tool/Command Restrictions

### Disable Dangerous Commands

```json5
{
  commands: {
    bash: false, // ❌ Disable ! shell commands from chat
    config: false, // ❌ Disable /config (writes to disk)
    debug: false, // ❌ Disable /debug
    restart: false, // ❌ Disable /restart from chat
  },
}
```

### Tool Allowlists (Sandbox Mode)

```json5
{
  agents: {
    defaults: {
      sandbox: {
        mode: "all",
        scope: "session",
        workspaceAccess: "rw", // Or "ro" for read-only
      },
    },
    list: [
      {
        id: "main",
        tools: {
          deny: ["exec", "process", "browser"], // Restrict dangerous tools
        },
      },
    ],
  },
}
```

---

## 8. Logging and Secret Redaction

### Enable Log Redaction

```json5
{
  logging: {
    level: "info",
    file: "/tmp/openclaw/openclaw.log",
    redactSensitive: "tools", // Redact secrets from tool output
    redactPatterns: [
      "\\bTOKEN\\b\\s*[=:]\\s*([\"']?)([^\\s\"']+)\\1",
      "\\bsk-[A-Za-z0-9_-]{8,}\\b",
      "\\bghp_[A-Za-z0-9]{36}\\b",
      "\\bxoxb-[A-Za-z0-9-]+\\b",
    ],
  },
}
```

---

## 9. Docker Security (If Using Containers)

```bash
# Secure Docker run
docker run --read-only --cap-drop=ALL \
  -v openclaw-data:/app/data \
  openclaw/openclaw:latest
```

### Docker Compose Hardening

```yaml
services:
  openclaw-gateway:
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    read_only: true
    user: "node" # Non-root user
```

---

## 10. Pre-Installation Security Checklist

### Before Running `openclaw onboard`:

- [ ] Create dedicated user account (optional but recommended)
- [ ] Generate gateway token: `openssl rand -base64 48`
- [ ] Set environment variables:
  ```bash
  export OPENCLAW_GATEWAY_TOKEN="..."
  export OPENCLAW_GATEWAY_PORT="28456"
  export OPENCLAW_DISABLE_BONJOUR=1
  ```
- [ ] Prepare config file with hardened settings (see below)
- [ ] Verify Node.js version ≥22.12.0 (security patches)
- [ ] Enable macOS firewall (System Preferences → Security)

---

## 11. Recommended Secure Baseline Configuration

Create `~/.openclaw/openclaw.json`:

```json5
{
  // Gateway hardening
  gateway: {
    mode: "local",
    bind: "loopback",
    port: 28456, // Non-default port
    auth: {
      mode: "token",
      token: "${OPENCLAW_GATEWAY_TOKEN}",
    },
  },

  // Disable mDNS discovery
  discovery: {
    mdns: { mode: "off" },
  },

  // Strict channel access
  channels: {
    whatsapp: {
      dmPolicy: "pairing",
      allowFrom: ["+YOUR_PHONE_NUMBER"],
      groupPolicy: "allowlist",
      groups: { "*": { requireMention: true } },
    },
  },

  // Disable dangerous chat commands
  commands: {
    bash: false,
    config: false,
    debug: false,
    restart: false,
  },

  // Agent defaults with sandboxing
  agents: {
    defaults: {
      workspace: "~/.openclaw/workspace",
      sandbox: {
        mode: "all",
        scope: "session",
      },
    },
  },

  // Log redaction
  logging: {
    redactSensitive: "tools",
  },
}
```

---

## 12. Post-Installation Security Verification

```bash
# Run security audit
openclaw security audit --deep

# Check for issues
openclaw doctor

# Verify binding
ss -ltnp | grep 28456  # Should show only 127.0.0.1

# Check config permissions
ls -la ~/.openclaw/
```

---

## 13. Known CVEs to Address

| CVE            | Description                    | Mitigation                         |
| -------------- | ------------------------------ | ---------------------------------- |
| CVE-2025-59466 | Node.js async_hooks DoS        | Use Node.js ≥22.12.0               |
| CVE-2026-21636 | Permission model bypass        | Use Node.js ≥22.12.0               |
| CVE-2026-25253 | OpenClaw disclosure (Jan 2026) | Update to latest + rotate API keys |

---

## 14. Security Contacts

- Report vulnerabilities: `steipete@gmail.com`
- Security guide: https://docs.openclaw.ai/gateway/security

---

## Summary of Critical Actions

1. **Change default port** from 18789 to custom
2. **Bind to loopback only** - never expose to network
3. **Enable token authentication** with strong token from env var
4. **Set file permissions** (700/600 on sensitive files)
5. **Disable mDNS** discovery
6. **Use pairing mode** for DMs, not open
7. **Disable bash/config/debug commands** from chat
8. **Enable sandbox mode** for agent tools
9. **Run security audit** after installation
10. **Use Node.js ≥22.12.0** for security patches

---

## ADDENDUM: Detailed Q&A for Dedicated Agent Machine

_Updated: February 4, 2026_

This section addresses specific questions for deploying OpenClaw on a **dedicated, siloed macOS machine** with no Apple ID and a siloed email.

---

## A1. Custom Port Configuration (Updated)

### Recommended Port Strategy

For your siloed machine, use a **random high port** in the ephemeral range:

```json5
{
  gateway: {
    port: 49152, // Pick any port between 49152-65535
    // These are "dynamic/private" ports per IANA
  },
}
```

**Port selection tips:**

- Avoid well-known ports (0-1023)
- Avoid registered ports (1024-49151) that services might use
- Use ephemeral range: **49152-65535**

```bash
# Generate a random port in ephemeral range
echo $((49152 + RANDOM % 16383))
```

---

## A2. Loopback vs Localhost vs Tailscale (Deep Dive)

### What is Loopback?

**Loopback** (`127.0.0.1` or `localhost`) is a virtual network interface that:

- **Never leaves your machine** - packets stay internal
- **Cannot be reached from any external network** - not even your LAN
- **Fastest possible network path** - kernel handles it internally

```
┌────────────────────────────────────────┐
│           YOUR MAC (Siloed)            │
│  ┌──────────────────────────────────┐  │
│  │  OpenClaw Gateway (127.0.0.1)    │  │
│  │  ↕ internal only                 │  │
│  │  Browser / CLI / Apps            │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ✗ LAN cannot reach                    │
│  ✗ Internet cannot reach               │
│  ✗ VPN cannot reach                    │
└────────────────────────────────────────┘
```

### Bind Modes Explained

| Mode       | IP Binding               | Who Can Connect             | Use Case               |
| ---------- | ------------------------ | --------------------------- | ---------------------- |
| `loopback` | `127.0.0.1`              | Only this machine           | ✅ **Your setup**      |
| `lan`      | `0.0.0.0`                | Any device on local network | ⚠️ Home/office sharing |
| `tailnet`  | Tailscale IP (100.x.x.x) | Only Tailscale peers        | ✅ **Multi-device**    |
| `custom`   | Specific IP              | Depends on firewall         | Advanced               |

### Tailscale Options (You Have Subscription)

Since you have Tailscale, you have **three secure remote access options**:

#### Option 1: Tailscale Serve (Recommended for Remote Access)

Gateway stays on loopback, Tailscale proxies with HTTPS + identity:

```json5
{
  gateway: {
    bind: "loopback", // Still only 127.0.0.1
    port: 49152,
    tailscale: {
      mode: "serve", // Tailscale Serve proxy
    },
    auth: {
      mode: "token",
      allowTailscale: true, // Allow Tailscale identity auth
    },
  },
}
```

**Benefits:**

- Gateway never directly exposed
- HTTPS encryption via Tailscale
- Identity verification via `tailscale-user-login` header
- Access from any device on your Tailnet: `https://your-mac.tailnet-name.ts.net/`

#### Option 2: Direct Tailnet Bind

Gateway listens only on Tailscale IP:

```json5
{
  gateway: {
    bind: "tailnet", // Listen on 100.x.x.x only
    port: 49152,
    auth: {
      mode: "token",
      token: "${OPENCLAW_GATEWAY_TOKEN}",
    },
  },
}
```

**Benefits:**

- Only Tailscale devices can connect
- No localhost access (tradeoff)
- Simpler than Serve

#### Option 3: Loopback Only (Maximum Isolation)

If this machine should NEVER be accessed remotely:

```json5
{
  gateway: {
    bind: "loopback",
    port: 49152,
    tailscale: { mode: "off" },
  },
}
```

### Tailscale + Proton VPN Interaction

**Important:** Tailscale and Proton VPN can conflict.

```
┌─────────────────────────────────────────────────────────┐
│  Network Stack Priority                                 │
├─────────────────────────────────────────────────────────┤
│  1. Loopback (127.0.0.1) - Always works                │
│  2. Tailscale (100.x.x.x) - WireGuard mesh             │
│  3. Proton VPN - Routes internet traffic               │
└─────────────────────────────────────────────────────────┘
```

**Recommended setup:**

- **Proton VPN**: Route all internet traffic (web browsing, API calls)
- **Tailscale**: Device-to-device mesh (access from phone/other devices)
- **OpenClaw**: Loopback + Tailscale Serve (best of both)

```json5
// Optimal config for Tailscale + Proton VPN
{
  gateway: {
    bind: "loopback",
    tailscale: { mode: "serve" }, // Only when you need remote access
    auth: {
      mode: "token",
      allowTailscale: true,
    },
  },
}
```

**Split tunneling note:** If Proton VPN uses split tunneling, ensure Tailscale traffic (100.64.0.0/10) is excluded from the VPN tunnel.

---

## A3. Gateway Token vs Password Authentication

### What Gateway Auth Protects

The gateway exposes:

- **WebSocket API** - Agent communication, session management
- **Control UI** - Web dashboard for monitoring
- **RPC endpoints** - Configuration, cron, restart

**Without auth:** Anyone with network access can:

- Read all chat transcripts
- Execute commands as your agent
- Modify configuration
- Restart the gateway

### Token Mode (Recommended)

```json5
{
  gateway: {
    auth: {
      mode: "token",
      token: "${OPENCLAW_GATEWAY_TOKEN}",
    },
  },
}
```

**How it works:**

- Client sends `Authorization: Bearer <token>` header
- Gateway validates exact match
- **Best for:** Programmatic access, scripts, integrations

**Generate token:**

```bash
openssl rand -base64 48
# Store in ~/.zshrc:
export OPENCLAW_GATEWAY_TOKEN="your-64-char-token"
```

### Password Mode

```json5
{
  gateway: {
    auth: {
      mode: "password",
      password: "${OPENCLAW_GATEWAY_PASSWORD}",
    },
  },
}
```

**How it works:**

- Control UI shows login form
- User enters password
- Session cookie maintained
- **Best for:** Human users accessing web dashboard

### Which to Use?

| Scenario                | Recommendation                 |
| ----------------------- | ------------------------------ |
| Single-user, local only | Token (simpler)                |
| Multi-user dashboard    | Password (UI friendly)         |
| Tailscale Serve         | Token + allowTailscale         |
| Remote access           | Password (required for Funnel) |

**For your dedicated agent machine:** Use **token mode** since you're the only operator.

---

## A4. File Permissions for Dedicated Agent Machine

### Your Scenario

- **Dedicated machine** - No other users
- **No Apple ID** - No iCloud sync concerns
- **Siloed email** - Isolated identity
- **Full agent access** - Agent needs workspace control

### Simplified Permission Model

Since this is a **single-purpose agent machine**, you can use more permissive settings:

```json5
{
  agents: {
    defaults: {
      workspace: "~/agent-workspace", // Dedicated directory
      sandbox: {
        mode: "off", // Full access (trusted machine)
        // Or "all" with workspaceAccess: "rw" for audit trail
      },
    },
  },
}
```

### Recommended Directory Structure

```bash
# Create isolated agent workspace
mkdir -p ~/agent-workspace
mkdir -p ~/.openclaw

# Permissions (still important for credential protection)
chmod 700 ~/.openclaw
chmod 700 ~/.openclaw/credentials
chmod 600 ~/.openclaw/openclaw.json

# Agent workspace can be more open
chmod 755 ~/agent-workspace
```

### What to Protect vs Allow

| Directory                   | Permission | Rationale                     |
| --------------------------- | ---------- | ----------------------------- |
| `~/.openclaw/`              | 700        | Contains secrets, credentials |
| `~/.openclaw/credentials/`  | 700        | OAuth tokens, API keys        |
| `~/.openclaw/openclaw.json` | 600        | Gateway token reference       |
| `~/agent-workspace/`        | 755        | Agent working directory       |
| `~/.ssh/`                   | 700        | Keep protected regardless     |
| `/tmp/openclaw/`            | 755        | Logs and temp files           |

### Full Machine Access Config

```json5
{
  agents: {
    defaults: {
      workspace: "~", // Full home access
      sandbox: { mode: "off" }, // No sandboxing
    },
  },
  tools: {
    profile: "full", // All tools enabled
    elevated: { mode: "allow" }, // Allow elevated commands
  },
  commands: {
    bash: true, // Allow ! shell commands
    config: true, // Allow /config
    restart: true, // Allow /restart
  },
}
```

**⚠️ Warning:** Only use this on a truly dedicated machine you don't use for personal activities.

---

## A5. Maximum Functionality Configuration

### Full-Power Agent (Dedicated Machine)

Since this is a siloed agent machine, here's the **maximum functionality** config:

```json5
{
  // Gateway - local only but authenticated
  gateway: {
    mode: "local",
    bind: "loopback",
    port: 49152,
    auth: {
      mode: "token",
      token: "${OPENCLAW_GATEWAY_TOKEN}",
    },
  },

  // All tools enabled
  tools: {
    profile: "full",
    elevated: { mode: "allow" },
    exec: {
      security: "full", // No command restrictions
      ask: "off", // No confirmation prompts
    },
    web: {
      search: { enabled: true },
      fetch: { enabled: true, maxCharsCap: 100000 },
    },
  },

  // Browser automation enabled
  browser: {
    enabled: true,
    headless: false, // Visible browser for debugging
  },

  // Full agent access
  agents: {
    defaults: {
      workspace: "~/agent-workspace",
      sandbox: { mode: "off" },
      imageModel: "anthropic/claude-sonnet-4-20250514",
    },
  },

  // All chat commands enabled
  commands: {
    bash: true,
    config: true,
    debug: true,
    restart: true,
  },

  // Logging with redaction for safety
  logging: {
    level: "debug",
    file: "/tmp/openclaw/openclaw.log",
    redactSensitive: "tools",
  },

  // mDNS off (no discovery needed)
  discovery: {
    mdns: { mode: "off" },
  },
}
```

### Security vs Functionality Tradeoffs

| Feature           | Full Power | Restricted  | Tradeoff                        |
| ----------------- | ---------- | ----------- | ------------------------------- |
| `sandbox.mode`    | `off`      | `all`       | Agent can access any file       |
| `tools.elevated`  | `allow`    | `deny`      | Agent can run elevated commands |
| `commands.bash`   | `true`     | `false`     | Users can run ! shell via chat  |
| `exec.security`   | `full`     | `allowlist` | No command filtering            |
| `exec.ask`        | `off`      | `always`    | No confirmation prompts         |
| `browser.enabled` | `true`     | `false`     | Agent can browse web            |

### Remaining Security Layers

Even at max functionality, these protections remain:

1. **Network isolation** - Loopback binding
2. **Authentication** - Token required
3. **Log redaction** - Secrets filtered from logs
4. **Proton VPN** - Internet traffic encrypted
5. **No Apple ID** - No cloud sync leaks
6. **Siloed email** - No identity correlation

---

## A6. Communication Channels Inventory

### Built-in Channels (Core)

| Channel         | Status      | Setup Complexity    | Features                      |
| --------------- | ----------- | ------------------- | ----------------------------- |
| **WhatsApp**    | ✅ Built-in | Medium (QR pairing) | Text, media, reactions, polls |
| **Telegram**    | ✅ Built-in | Easy (bot token)    | Text, media, groups, commands |
| **Discord**     | ✅ Built-in | Easy (bot token)    | Text, media, servers, threads |
| **Slack**       | ✅ Built-in | Medium (app setup)  | Text, media, workspaces       |
| **Signal**      | ✅ Built-in | Medium (signal-cli) | Text, media, privacy-focused  |
| **iMessage**    | ✅ Built-in | Easy (macOS only)   | Text, media, reactions        |
| **BlueBubbles** | ✅ Built-in | Medium (server)     | Full iMessage features        |

### Plugin Channels (Extensions)

| Channel             | Install                                   | Notes            |
| ------------------- | ----------------------------------------- | ---------------- |
| **Microsoft Teams** | `openclaw plugins install msteams`        | Enterprise       |
| **Google Chat**     | Built-in                                  | Webhook-based    |
| **Matrix**          | `openclaw plugins install matrix`         | Self-hosted      |
| **Mattermost**      | `openclaw plugins install mattermost`     | Self-hosted      |
| **LINE**            | `openclaw plugins install line`           | Asia-popular     |
| **Feishu/Lark**     | `openclaw plugins install feishu`         | China/Asia       |
| **Nextcloud Talk**  | `openclaw plugins install nextcloud-talk` | Self-hosted      |
| **Nostr**           | `openclaw plugins install nostr`          | Decentralized    |
| **Twitch**          | `openclaw plugins install twitch`         | Streaming        |
| **Zalo**            | `openclaw plugins install zalo`           | Vietnam          |
| **Tlon**            | `openclaw plugins install tlon`           | Urbit-based      |
| **WebChat**         | Built-in                                  | Browser-based UI |

### Recommended for Your Setup

For a **dedicated agent machine** with privacy focus:

1. **WhatsApp** (primary) - Most ubiquitous, E2E encrypted
2. **Signal** (backup) - Maximum privacy
3. **Telegram** (optional) - Easy bot setup, groups
4. **WebChat** (local) - Direct browser access

### Channel Configuration Example

```json5
{
  channels: {
    whatsapp: {
      enabled: true,
      dmPolicy: "pairing", // Approve new contacts
      allowFrom: ["+1XXXXXXXXXX"], // Your phone number
      groupPolicy: "allowlist",
    },
    signal: {
      enabled: true,
      dmPolicy: "pairing",
    },
    telegram: {
      enabled: true,
      dmPolicy: "pairing",
    },
  },
}
```

### Proton Mail Integration

OpenClaw doesn't have native Proton Mail support, but you can:

1. **Use Proton Bridge** + IMAP trigger (manual setup)
2. **Forward to Gmail** with Pub/Sub automation (see `docs/automation/gmail-pubsub.md`)
3. **Use Proton API** via custom skill/extension

---

## A7. Tools Inventory

### Core Tools (Always Available)

| Tool               | Purpose                   | Risk Level |
| ------------------ | ------------------------- | ---------- |
| `session_status`   | Current session info      | 🟢 Low     |
| `sessions_list`    | List active sessions      | 🟢 Low     |
| `sessions_history` | Read chat transcripts     | 🟢 Low     |
| `sessions_send`    | Send to other sessions    | 🟡 Medium  |
| `sessions_spawn`   | Start sub-agent tasks     | 🟡 Medium  |
| `agents_list`      | List available agents     | 🟢 Low     |
| `message`          | Send messages to channels | 🟡 Medium  |

### File System Tools

| Tool          | Purpose             | Risk Level |
| ------------- | ------------------- | ---------- |
| `read`        | Read files          | 🟢 Low     |
| `write`       | Write files         | 🟡 Medium  |
| `edit`        | Edit files in-place | 🟡 Medium  |
| `apply_patch` | Multi-file patches  | 🟡 Medium  |

### Runtime Tools

| Tool      | Purpose                     | Risk Level |
| --------- | --------------------------- | ---------- |
| `exec`    | Run shell commands          | 🔴 High    |
| `process` | Manage background processes | 🔴 High    |
| `bash`    | Direct shell access         | 🔴 High    |

### Web Tools

| Tool         | Purpose           | Risk Level |
| ------------ | ----------------- | ---------- |
| `web_search` | Brave Search API  | 🟢 Low     |
| `web_fetch`  | Fetch URL content | 🟡 Medium  |

### Browser Tools

| Tool      | Purpose            | Risk Level |
| --------- | ------------------ | ---------- |
| `browser` | Control Chromium   | 🔴 High    |
| `canvas`  | Render UI surfaces | 🟡 Medium  |

### Automation Tools

| Tool      | Purpose                         | Risk Level |
| --------- | ------------------------------- | ---------- |
| `cron`    | Scheduled tasks                 | 🟡 Medium  |
| `gateway` | Gateway control/restart         | 🔴 High    |
| `nodes`   | Node management, camera, screen | 🔴 High    |

### Media Tools

| Tool    | Purpose        | Risk Level |
| ------- | -------------- | ---------- |
| `image` | Image analysis | 🟢 Low     |
| `tts`   | Text-to-speech | 🟢 Low     |

### Memory Tools

| Tool            | Purpose             | Risk Level |
| --------------- | ------------------- | ---------- |
| `memory_search` | Search agent memory | 🟢 Low     |
| `memory_get`    | Retrieve memory     | 🟢 Low     |

### Tool Groups (Shortcuts)

```json5
{
  tools: {
    // Use groups for bulk allow/deny
    allow: [
      "group:fs", // read, write, edit, apply_patch
      "group:runtime", // exec, bash, process
      "group:sessions", // sessions_list, sessions_history, etc.
      "group:memory", // memory_search, memory_get
      "group:web", // web_search, web_fetch
      "group:ui", // browser, canvas
      "group:automation", // cron, gateway
      "group:messaging", // message
      "group:nodes", // nodes
    ],
  },
}
```

### Recommended Tool Profiles

| Profile     | Tools Included                   | Use Case                   |
| ----------- | -------------------------------- | -------------------------- |
| `minimal`   | session_status only              | Safety-first               |
| `messaging` | Sessions + message               | Chat assistant             |
| `coding`    | FS + runtime + sessions + memory | Developer agent            |
| `full`      | Everything                       | **Your dedicated machine** |

### Full Tool Config for Your Setup

```json5
{
  tools: {
    profile: "full",
    elevated: { mode: "allow" },
    exec: {
      security: "full",
      ask: "off",
      applyPatch: { enabled: true },
    },
    web: {
      search: { enabled: true },
      fetch: { enabled: true },
    },
  },
  browser: {
    enabled: true,
  },
}
```

---

## Summary: Your Recommended Configuration

For a **dedicated, siloed macOS agent machine** with Tailscale + Proton VPN:

```json5
// ~/.openclaw/openclaw.json
{
  gateway: {
    mode: "local",
    bind: "loopback",
    port: 49152,
    auth: {
      mode: "token",
      token: "${OPENCLAW_GATEWAY_TOKEN}",
      allowTailscale: true,
    },
    tailscale: { mode: "serve" }, // Enable for remote access
  },

  discovery: {
    mdns: { mode: "off" },
  },

  tools: {
    profile: "full",
    elevated: { mode: "allow" },
    exec: { security: "full", ask: "off" },
    web: { search: { enabled: true }, fetch: { enabled: true } },
  },

  browser: { enabled: true },

  agents: {
    defaults: {
      workspace: "~/agent-workspace",
      sandbox: { mode: "off" },
    },
  },

  commands: {
    bash: true,
    config: true,
    debug: true,
    restart: true,
  },

  channels: {
    whatsapp: {
      enabled: true,
      dmPolicy: "pairing",
      allowFrom: ["+YOUR_PHONE"],
    },
    signal: { enabled: true, dmPolicy: "pairing" },
  },

  logging: {
    level: "info",
    redactSensitive: "tools",
  },
}
```

**Environment variables (`~/.zshrc`):**

```bash
export OPENCLAW_GATEWAY_TOKEN="$(openssl rand -base64 48)"
export BRAVE_API_KEY="your-brave-api-key"  # For web search
```
