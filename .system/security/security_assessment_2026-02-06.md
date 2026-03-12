# OpenClaw Security Assessment — February 6, 2026

**Date:** February 6, 2026
**Repository:** https://github.com/openclaw/openclaw
**Version Analyzed:** `2026.2.3`
**Environment:** Siloed macOS machine (dedicated agent), Node.js v25.6.0

---

## Executive Summary

Multiple independent security firms disclosed critical vulnerabilities and a large-scale malicious campaign targeting the OpenClaw ecosystem in the first week of February 2026. This assessment evaluates our specific exposure and provides actionable remediation steps.

**Overall Risk Level:** MEDIUM — We are not exposed to the ClawHub supply chain attack (all skills are first-party), but our current configuration leaves open vectors for prompt injection and unrestricted command execution.

---

## 1. Active Threats in the OpenClaw Ecosystem

### 1.1 CVE-2026-25253 — One-Click RCE via WebSocket Hijacking (CVSS 8.8)

| Field          | Detail                                                                                          |
| -------------- | ----------------------------------------------------------------------------------------------- |
| **Source**     | [The Hacker News](https://thehackernews.com/2026/02/openclaw-bug-enables-one-click-remote.html) |
| **Advisory**   | GHSA-g8p2-7wf7-98mq                                                                             |
| **Patched in** | `v2026.1.29` (January 30, 2026)                                                                 |
| **Our status** | ✅ PATCHED — v2026.2.3 includes origin validation in `src/gateway/origin-check.ts`              |

**Description:** The Control UI trusted `gatewayUrl` from query strings without validation. A crafted link could steal the gateway token via cross-site WebSocket hijacking, then disable sandbox, escape containers, and execute arbitrary commands on the host.

**Relevant commits in our codebase:**

- `a13ff55bd` — Security: Prevent gateway credential exfiltration via URL override (#9179)
- `66d8117d4` — fix: harden control ui framing + ws origin
- `4434cae56` — Security: harden sandboxed media handling (#9182)

### 1.2 ClawHavoc Campaign — 341 Malicious ClawHub Skills

| Field              | Detail                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------- |
| **Source**         | [Koi Security](https://thehackernews.com/2026/02/researchers-find-341-malicious-clawhub.html) |
| **Campaign name**  | ClawHavoc                                                                                     |
| **Skills audited** | 2,857 total on ClawHub; 341 malicious                                                         |
| **Malware**        | Atomic Stealer (AMOS) — macOS credential stealer ($500-1000/month commodity)                  |
| **Our status**     | ✅ NOT AFFECTED — No ClawHub skills installed                                                 |

**Attack pattern:**

- Fake skills masquerade as crypto tools, YouTube utilities, auto-updaters, Google Workspace integrations
- Typosquats: `clawhub`, `clawhub1`, `clawhubb`, `clawhubcli`
- SKILL.md contains fake "Prerequisites" directing users to run shell commands or download trojanized archives
- macOS: obfuscated shell script → fetches Atomic Stealer from `91.92.242[.]30`
- Windows: trojanized `openclaw-agent.zip` with keylogger

**Why we're not affected:**

- All 53 skills in `skills/` are first-party/built-in
- `~/.openclaw/tools/` contains only `sherpa-onnx-tts` (legitimate)
- No evidence of typosquat patterns in our installation

### 1.3 Snyk: 283 Skills Leaking Credentials (7.1% of ClawHub)

| Field          | Detail                                                                                                                                                                            |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source**     | [Snyk Blog](https://snyk.io/blog/openclaw-skills-credential-leaks-research/) / [The Register](https://www.theregister.com/2026/02/05/openclaw_skills_marketplace_leaky_security/) |
| **Our status** | ⚠️ PARTIALLY RELEVANT                                                                                                                                                             |

**Issue:** Skills instruct agents to pass API keys through the LLM context window, leaking them to model providers and application logs in plaintext. The "buy-anything" skill even had the agent tokenize credit card numbers.

**Our relevance:** While we don't use ClawHub skills, our 6 API keys in `~/.openclaw/.env` are in the agent's operational context. If prompt injection succeeds, these could be exfiltrated.

### 1.4 Zenity: Indirect Prompt Injection Backdoor

| Field          | Detail                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source**     | [Zenity Labs](https://labs.zenity.io/p/openclaw-or-opendoor-indirect-prompt-injection-makes-openclaw-vulnerable-to-backdoors-and-much-more) |
| **Our status** | ⚠️ APPLICABLE                                                                                                                               |

**Attack chain:**

1. Attacker embeds prompt injection in content agent will read (Google Doc, email, web page, chat message)
2. Injection instructs OpenClaw to create a new Telegram bot integration
3. Attacker gains persistent C2 access through the new channel
4. Can then: read files, exfiltrate data, download Sliver C2 beacon, deploy ransomware

**Our exposure:** We have Telegram and WhatsApp active. Web fetch and browser tools process untrusted content.

### 1.5 Palo Alto Networks: "Lethal Trifecta" + Memory Poisoning

| Field          | Detail                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Source**     | [Palo Alto Networks Blog](https://www.paloaltonetworks.com/blog/network-security/why-moltbot-may-signal-ai-crisis/) |
| **Our status** | ⚠️ APPLICABLE                                                                                                       |

**Concept:** OpenClaw exhibits the "lethal trifecta" (coined by Simon Willison):

1. Access to private data
2. Exposure to untrusted content
3. Ability to communicate externally

Combined with persistent memory, this enables **time-shifted prompt injection** — malicious payloads stored in memory that detonate later when conditions align.

### 1.6 Cisco AI Defense: Popular Skill Vulnerabilities

| Field          | Detail                                                                                             |
| -------------- | -------------------------------------------------------------------------------------------------- |
| **Source**     | [Cisco Blog](https://blogs.cisco.com/ai/personal-ai-agents-like-openclaw-are-a-security-nightmare) |
| **Our status** | ℹ️ INFORMATIONAL                                                                                   |

Cisco's Skill Scanner found 9 vulnerabilities (2 critical) in ClawHub's #1 ranked skill ("What Would Elon Do?"), which was functionally malware gamed to the top ranking.

---

## 2. Our Local Setup — Detailed Audit

### 2.1 What's Secure ✅

| Area                        | Status         | Evidence                                                                 |
| --------------------------- | -------------- | ------------------------------------------------------------------------ |
| OpenClaw version            | ✅ `2026.2.3`  | Post-CVE-2026-25253 patch                                                |
| WebSocket origin validation | ✅ Present     | `src/gateway/origin-check.ts` (86 lines, validates loopback + allowlist) |
| Security hardening commits  | ✅ Applied     | #9179, #9182, origin hardening                                           |
| Config file permissions     | ✅ `600`       | `openclaw.json` is `-rw-------`                                          |
| OpenClaw dir permissions    | ✅ `700`       | `~/.openclaw` is `drwx------`                                            |
| Credentials dir permissions | ✅ `700`       | `~/.openclaw/credentials` is `drwx------`                                |
| Skills                      | ✅ First-party | 53 built-in, no ClawHub downloads                                        |
| Extensions                  | ✅ First-party | 31 extensions, all from repo `extensions/`                               |
| Log redaction               | ✅ Enabled     | `redactSensitive: "tools"`                                               |
| Node.js version             | ✅ `v25.6.0`   | Above minimum `22.12.0`                                                  |
| Gateway binding             | ✅ Loopback    | Default loopback binding                                                 |

### 2.2 What Needs Remediation ⚠️

| Area               | Risk      | Current Setting                                                  | Recommended                                                 |
| ------------------ | --------- | ---------------------------------------------------------------- | ----------------------------------------------------------- |
| Sandbox mode       | 🔴 HIGH   | `off`                                                            | `all` with `scope: "session"`                               |
| Chat commands      | 🔴 HIGH   | All enabled (`bash`, `config`, `debug`, `restart`)               | Disable `bash`, `config`, `debug`                           |
| Exec confirmations | 🔴 HIGH   | `ask: "off"`                                                     | `ask: "elevated"` or `ask: "always"`                        |
| API keys in `.env` | 🟡 MEDIUM | 6 keys (Anthropic, OpenAI, Gemini, Brave, Firecrawl, ElevenLabs) | Rotate all as precaution                                    |
| mDNS discovery     | 🟡 MEDIUM | Not explicitly disabled                                          | Set `discovery.mdns.mode: "off"`                            |
| Browser automation | 🟡 MEDIUM | Enabled                                                          | Review necessity; untrusted web content is injection vector |
| DM policy          | 🟡 MEDIUM | `pairing`                                                        | Consider `allowlist` for stricter control                   |
| Persistent memory  | 🟡 MEDIUM | Enabled                                                          | Audit `~/.openclaw/memory/` for poisoned entries            |
| Gateway port       | 🟢 LOW    | Default `18789`                                                  | Consider ephemeral range (49152-65535)                      |

### 2.3 API Keys Inventory

| Key                  | Location           | Action Needed |
| -------------------- | ------------------ | ------------- |
| `ANTHROPIC_API_KEY`  | `~/.openclaw/.env` | Rotate        |
| `OPENAI_API_KEY`     | `~/.openclaw/.env` | Rotate        |
| `GEMINI_API_KEY`     | `~/.openclaw/.env` | Rotate        |
| `BRAVE_API_KEY`      | `~/.openclaw/.env` | Rotate        |
| `FIRECRAWL_API_KEY`  | `~/.openclaw/.env` | Rotate        |
| `ELEVENLABS_API_KEY` | `~/.openclaw/.env` | Rotate        |

---

## 3. Attack Surface Map

```
                    ┌─────────────────────────────┐
                    │    EXTERNAL ATTACK VECTORS   │
                    └──────────────┬──────────────┘
                                   │
            ┌──────────────────────┼──────────────────────┐
            │                      │                      │
    ┌───────▼───────┐    ┌────────▼────────┐    ┌───────▼───────┐
    │  WhatsApp DMs │    │  Web Content    │    │  Telegram     │
    │  & Groups     │    │  (fetch/browse) │    │  Messages     │
    └───────┬───────┘    └────────┬────────┘    └───────┬───────┘
            │                      │                      │
            └──────────────────────┼──────────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │   PROMPT INJECTION LAYER    │
                    │   (untrusted content →      │
                    │    agent instructions)       │
                    └──────────────┬──────────────┘
                                   │
            ┌──────────────────────┼──────────────────────┐
            │                      │                      │
    ┌───────▼───────┐    ┌────────▼────────┐    ┌───────▼───────┐
    │  Shell Exec   │    │  File System    │    │  Memory       │
    │  (no confirm) │    │  (no sandbox)   │    │  (persistent) │
    │  🔴 HIGH      │    │  🔴 HIGH        │    │  🟡 MEDIUM    │
    └───────────────┘    └─────────────────┘    └───────────────┘
```

---

## 4. Remediation Task Tracker

### Priority 1: Critical — Do Immediately

- [ ] **TASK-SEC-001:** Rotate all 6 API keys in `~/.openclaw/.env`
  - Anthropic: https://console.anthropic.com/settings/keys
  - OpenAI: https://platform.openai.com/api-keys
  - Gemini: https://aistudio.google.com/apikey
  - Brave: https://api.search.brave.com/app/keys
  - Firecrawl: https://www.firecrawl.dev/app/api-keys
  - ElevenLabs: https://elevenlabs.io/app/settings/api-keys

- [ ] **TASK-SEC-002:** Run built-in security audit

  ```bash
  openclaw security audit --deep
  openclaw doctor
  ```

- [ ] **TASK-SEC-003:** Verify no ClawHub skills were ever installed (belt-and-suspenders)
  ```bash
  ls -la ~/.openclaw/tools/
  # Expected: only sherpa-onnx-tts
  ```

### Priority 2: High — This Week

- [ ] **TASK-SEC-004:** Disable mDNS discovery

  ```json5
  // Add to ~/.openclaw/openclaw.json
  discovery: { mdns: { mode: "off" } }
  ```

- [ ] **TASK-SEC-005:** Enable sandbox mode

  ```json5
  agents: { defaults: { sandbox: { mode: "all", scope: "session" } } }
  ```

- [ ] **TASK-SEC-006:** Re-enable exec confirmations for elevated commands

  ```json5
  tools: { exec: { ask: "elevated" } }
  ```

- [ ] **TASK-SEC-007:** Disable dangerous chat commands

  ```json5
  commands: { bash: false, config: false, debug: false, restart: true }
  ```

- [ ] **TASK-SEC-008:** Audit persistent memory for suspicious entries
  ```bash
  ls -la ~/.openclaw/memory/
  # Review contents for unexpected patterns
  ```

### Priority 3: Medium — Ongoing

- [ ] **TASK-SEC-009:** Change gateway port from default `18789` to ephemeral range

  ```json5
  gateway: { port: 52847 }  // or any port in 49152-65535
  ```

- [ ] **TASK-SEC-010:** Review WhatsApp group policy — ensure `requireMention: true`

  ```json5
  channels: { whatsapp: { groupPolicy: "allowlist", groups: { "*": { requireMention: true } } } }
  ```

- [ ] **TASK-SEC-011:** Monitor OpenClaw security advisories daily (active disclosure period)
  - GitHub: https://github.com/openclaw/openclaw/security/advisories
  - Hacker News: search "OpenClaw"
  - The Register: search "OpenClaw"

- [ ] **TASK-SEC-012:** Consider switching DM policy from `pairing` to `allowlist` during active threat period

- [ ] **TASK-SEC-013:** Evaluate whether browser automation can be restricted to specific domains

### Priority 4: Long-term Hardening

- [ ] **TASK-SEC-014:** Implement network-level monitoring for outbound connections to known C2 IPs
  - Known malicious: `91.92.242.30` (ClawHavoc C2)

- [ ] **TASK-SEC-015:** Set up automated version update checks

  ```bash
  openclaw update --check
  ```

- [ ] **TASK-SEC-016:** Review and update this assessment monthly or after any new CVE disclosure

---

## 5. References

| Source                             | URL                                                                                                      | Date         |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------ |
| CVE-2026-25253 Advisory            | https://github.com/openclaw/openclaw/security/advisories/GHSA-g8p2-7wf7-98mq                             | Jan 30, 2026 |
| Hacker News: One-Click RCE         | https://thehackernews.com/2026/02/openclaw-bug-enables-one-click-remote.html                             | Feb 2026     |
| Hacker News: 341 Malicious Skills  | https://thehackernews.com/2026/02/researchers-find-341-malicious-clawhub.html                            | Feb 2026     |
| The Register: Skills Leak API Keys | https://www.theregister.com/2026/02/05/openclaw_skills_marketplace_leaky_security/                       | Feb 5, 2026  |
| eSecurity Planet: ClawHavoc        | https://www.esecurityplanet.com/threats/hundreds-of-malicious-skills-found-in-openclaws-clawhub/         | Feb 2026     |
| PointGuard AI: Supply Chain        | https://www.pointguardai.com/ai-security-incidents/openclaw-clawhub-malicious-skills-supply-chain-attack | Feb 2026     |
| Cisco AI Defense                   | https://blogs.cisco.com/ai/personal-ai-agents-like-openclaw-are-a-security-nightmare                     | Feb 2026     |
| Authmind: Supply Chain Analysis    | https://www.authmind.com/post/openclaw-malicious-skills-agentic-ai-supply-chain                          | Feb 2026     |
| JFrog: Supply Chain Risks          | https://jfrog.com/blog/giving-openclaw-the-keys-to-your-kingdom-read-this-first/                         | Feb 2026     |
| OpenClaw Security Docs             | https://docs.openclaw.ai/gateway/security                                                                | Ongoing      |
| Previous Assessment                | `.security/security_assesment.md`                                                                        | Feb 4, 2026  |

---

## 6. Assessment History

| Date            | Version      | Key Findings                                                                                                    |
| --------------- | ------------ | --------------------------------------------------------------------------------------------------------------- |
| Feb 4, 2026     | Pre-install  | Initial hardening assessment, baseline config recommendations                                                   |
| **Feb 6, 2026** | **2026.2.3** | **ClawHavoc campaign, CVE-2026-25253, ecosystem-wide crisis — our exposure is low but config hardening needed** |

---

_Next review due: February 13, 2026 or upon new CVE disclosure, whichever comes first._
