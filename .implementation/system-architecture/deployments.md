# Git & Deployment Integration

> Part of [System Architecture](README.md)

---

## GitHub Account

| Setting            | Value                                                                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Account**        | `clawdwork` (personal, not org)                                                                                                                                             |
| **Type**           | Personal — allows Vercel Hobby plan git connections                                                                                                                         |
| **Existing repos** | `intel-hub`, `client-celavii-seo-proposal`, `client-maxkick-seo-proposal`, `client-kick-sheetz-presentation`, `client-maxkick-war-room`, `openclaw-workspace` (all private) |
| **PAT**            | `org-agent-deploy` (fine-grained, Contents+Admin rw, expires 2026-12-31)                                                                                                    |

---

## Repository Naming Convention

```
{agent-id}-{project}-{type}-{YYYYMMDD}
```

| Scope               | Pattern                              | Examples                                           | Visibility |
| ------------------- | ------------------------------------ | -------------------------------------------------- | ---------- |
| **Org infra**       | `org-{purpose}`                      | `org-deploy-templates`, `org-daily-ingest`         | Private    |
| **Client work**     | `client-{client}-{type}`             | `client-celavii-webapp`, `client-maxkick-proposal` | Private    |
| **Agent-generated** | `{agent-id}-{project}-{type}-{date}` | `member-001-celavii-q1-proposal-20260207`          | Private    |
| **Internal tools**  | `internal-{name}`                    | `internal-intel-hub`, `internal-agent-dashboard`   | Private    |
| **Experiments**     | `sandbox-{name}`                     | `sandbox-voice-chat`, `sandbox-ai-widget`          | Private    |

---

## Deployment Platforms

| Platform    | Plan        | Projects     | Bandwidth | Use For                                  | Commercial?            |
| ----------- | ----------- | ------------ | --------- | ---------------------------------------- | ---------------------- |
| **Netlify** | Legacy Free | 500 sites    | 100 GB/mo | Static proposals, client deliverables    | ✅ Yes                 |
| **Vercel**  | Hobby       | 200 projects | 100 GB/mo | SSR/API/cron, internal tools, dashboards | ❌ Non-commercial only |

**Routing rule**: **Vercel for everything** (no build minute cap, ~30s deploys). All Netlify sites have been migrated to Vercel.

| CLI       | Installed | Version         |
| --------- | --------- | --------------- |
| `netlify` | ✅        | Latest (legacy) |
| `vercel`  | ✅        | 50.13.2         |

---

## Active Deployments (Vercel)

| Site                         | Vercel URL                        | GitHub Repo                                 | Type        |
| ---------------------------- | --------------------------------- | ------------------------------------------- | ----------- |
| **Intel Hub**                | `intel-hub.vercel.app`            | `clawdwork/intel-hub`                       | Static HTML |
| **Celavii SEO Proposal**     | `seo-proposal.vercel.app`         | `clawdwork/client-celavii-seo-proposal`     | React/Vite  |
| **MaxKick SEO Proposal**     | `maxkick-seo-proposal.vercel.app` | `clawdwork/client-maxkick-seo-proposal`     | React/Vite  |
| **Kick Sheetz Presentation** | `presentations-weld.vercel.app`   | `clawdwork/client-kick-sheetz-presentation` | Static HTML |
| **MaxKick War Room**         | `deliverables-three.vercel.app`   | `clawdwork/client-maxkick-war-room`         | Static HTML |

### Legacy Netlify Deployments (Superseded — do not redeploy)

| Former Netlify Site                     | Migrated To                       |
| --------------------------------------- | --------------------------------- |
| `celavii-seo-proposal.netlify.app`      | `seo-proposal.vercel.app`         |
| `max-kick-proposal.netlify.app`         | `maxkick-seo-proposal.vercel.app` |
| `kick-sheetz-presentation.netlify.app`  | `presentations-weld.vercel.app`   |
| `war-room-engineering-2026.netlify.app` | `deliverables-three.vercel.app`   |

---

## GitHub PAT Details

| Property                | Value                                     |
| ----------------------- | ----------------------------------------- |
| **Name**                | `org-agent-deploy`                        |
| **Type**                | Fine-grained                              |
| **Expiry**              | 2026-12-31                                |
| **Repository access**   | All repositories                          |
| **Contents**            | Read and write                            |
| **Administration**      | Read and write                            |
| **Metadata**            | Read-only (auto)                          |
| **Account permissions** | None                                      |
| **Stored at**           | `~/org/config/env/shared.env` (chmod 600) |
| **Env vars**            | `GH_TOKEN`, `GITHUB_TOKEN`                |

---

## Member Self-Service Deploy Architecture

### The Flow

```
Member (WhatsApp/Telegram):
  "Create a proposal for celavii with our Q1 metrics"
        │
        ▼
Member Agent (sandboxed):
  1. Reads ~/shared/projects/celavii/ (bind-mounted, only data they have access to)
  2. Generates code from template (React + Tailwind from ~/shared/templates/)
  3. Creates private repo: member-001-celavii-q1-proposal-20260207
     → git init, git remote add, git push (uses injected GH_TOKEN)
  4. Deploys via vercel --prod (CLI deploy, no git connection needed)
     → Uses injected VERCEL_TOKEN
  5. Returns live URL to member via WhatsApp
        │
        ▼
Member clicks URL → sees their proposal/dashboard/presentation
```

### Data Isolation — Bind-Mount Enforcement

The member agent can **only generate content from data it can see**:

```json
{
  "id": "member-001",
  "sandbox": {
    "docker": {
      "binds": [
        "~/org/shared/projects/celavii:/shared/projects/celavii:ro",
        "~/org/shared/templates:/shared/templates:ro",
        "~/org/shared/knowledge:/shared/knowledge:ro"
      ]
    }
  }
}
```

- `member-001` sees celavii data → generates celavii proposals
- `member-001` does NOT see max-kick data → cannot generate max-kick content
- Templates are read-only — agents can copy but not modify originals

---

## Deploy Templates (Token-Saving Strategy)

Instead of generating full apps from scratch, agents clone templates and inject content:

```
~/org/shared/templates/
├── proposal-template/              ← React + Tailwind proposal skeleton
│   ├── src/pages/index.tsx         ← Content injection point
│   ├── package.json
│   └── vercel.json
├── dashboard-template/             ← Next.js dashboard with charts
├── presentation-template/          ← Slide-based presentation
└── landing-page-template/          ← Marketing landing page
```

Agent workflow: copy template → inject content → `vercel --prod` → return URL.

### Template Tech Stack (No Local Install)

Templates contain `package.json` as a **tech stack declaration** only — no `node_modules/`. Vercel handles `npm install` + build during remote deployment.

| Template                 | Direct Deps     | Size                | Status               |
| ------------------------ | --------------- | ------------------- | -------------------- |
| `proposal-template/`     | 37 deps + 6 dev | ~2 MB (source only) | ✅ Ready             |
| `dashboard-template/`    | —               | Placeholder         | Scaffold when needed |
| `presentation-template/` | —               | Placeholder         | Scaffold when needed |
| `landing-page-template/` | —               | Placeholder         | Scaffold when needed |

Full package inventory: `~/org/config/PACKAGE-INVENTORY.md`

**Agent deploy workflow** (Vercel builds remotely):

```
1. cp -r /shared/templates/proposal-template/ /tmp/build/  ← source files only (~2MB)
2. Inject content into src/app/page.tsx
3. vercel --prod                                            ← Vercel runs npm install + build
4. Return live URL
```

---

## Wizard Automation (Token Provisioning)

During `workspace-wizard` provisioning, the admin agent:

1. **Reads shared PAT** from `~/org/config/env/shared.env`
2. **Creates Vercel token** via REST API:
   ```bash
   curl -X POST "https://api.vercel.com/v3/user/tokens" \
     -H "Authorization: Bearer $VERCEL_ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name": "member-002-deploy"}'
   ```
3. **Saves tokens** to `~/org/config/env/member-002.env`
4. **Generates agent config** with `docker.env` referencing these tokens

Only manual step: GitHub PAT creation (done once, already created).

---

## Repo Cleanup Strategy

Agent-generated repos accumulate over time. Cleanup via `service-001` cron or admin:

```bash
# List agent-generated repos older than 90 days
gh repo list --json name,createdAt --jq \
  '.[] | select(.name | startswith("member-")) | select(.createdAt < "2026-01-01")'

# Archive old Vercel deployments (auto-handled by Vercel after 30 days)
```

---

## Future: GitHub App (Phase 3)

For fully automated, per-repo scoped tokens without a shared PAT:

1. Create GitHub App (`clawdwork-deploy-bot`)
2. Grant: Contents rw, Administration rw
3. Install on personal account
4. Wizard generates **installation tokens** per provisioning request
5. Tokens are time-limited (1 hour) and repo-scoped

This eliminates the shared PAT entirely. Defer until agent count exceeds 5-10 and token rotation becomes a concern.
