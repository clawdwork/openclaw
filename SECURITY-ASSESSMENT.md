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
