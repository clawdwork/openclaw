# Universal Validation Workflow

Validate and analyze any proposal, implementation, architecture, or system component across the entire codebase and documentation.

---

## Description

Flexible validation workflow for analyzing proposals, implementations, architecture, documentation, or any system component. Works with chat-based discussions, markdown files, implementation proposals, or ad-hoc validation requests.

---

## Steps

### 1. Identify Validation Target

**Determine what needs validation:**

- Implementation proposals (files or chat discussions)
- Existing system architecture
- Documentation accuracy and completeness
- Feature requirements vs current state
- Code patterns and best practices
- Database schema alignment
- API endpoint coverage
- Integration points and dependencies

### 2. Multi-Source Research & Analysis

Combine internal codebase analysis with external knowledge gathering:

#### Internal Code Search (using `code_search`)

**Core Application Areas:**

- `src/` - Application codebase (components, services, APIs, hooks, utilities)
- `prisma/` - Database schema, models, and migrations
- `supabase/` - Migrations, RPCs, Edge Functions, and SQL utilities

**Documentation & Implementation:**

- `Docs/` - Architecture docs, wiki, features, implementation guides
- `Implementation/` - Current workload, previous implementations, audits
- `.windsurf/workflows/` - Related workflow patterns

**Configuration & Infrastructure:**

- Root level - package.json, config files, environment setup
- `scripts/` - Utility scripts and automation
- `e2e/` - End-to-end tests and integration patterns

#### External Knowledge Search (using `search_web`)

**Industry Patterns & Best Practices:**

- Architecture patterns and design principles
- Security best practices and common vulnerabilities
- Performance optimization techniques
- Testing strategies and frameworks
- API design standards (REST, GraphQL)
- Database design patterns and anti-patterns
- UI/UX best practices for similar features
- DevOps and deployment strategies

**Technology-Specific Research:**

- React/Next.js patterns and hooks best practices
- TypeScript advanced patterns and type safety
- PostgreSQL optimization and schema design
- Redis caching strategies and patterns
- Supabase Edge Functions best practices
- Prisma ORM patterns and performance tips

### 3. Run Comprehensive Analysis

**Technical Validation:**

- Compare proposed vs existing architecture
- Check database schema alignment and migration paths
- Verify API endpoint coverage and data flow
- Review component patterns and reusability
- Assess integration points and dependencies
- Check environment variables and configuration

**Documentation Validation:**

- Verify accuracy against current codebase
- Check for outdated references or patterns
- Identify missing documentation areas
- Validate code examples and snippets

**Implementation Readiness:**

- Identify existing components that can be leveraged
- Note required new development work
- Check for potential conflicts or breaking changes
- Assess testing coverage and requirements

### 4. Report Findings

**Structure findings by category:**

- ✅ **Existing & Working** - What's already implemented and functional
- ⚠️ **Needs Updates** - What exists but needs modification
- 🔴 **Missing/Required** - What needs to be built from scratch
- 📋 **Recommendations** - Optimization opportunities and best practices
- 🔗 **Dependencies** - External services, packages, or prerequisites

**Report in chat unless user specifically requests documentation files**

### 5. Action Planning

- Prioritize validation findings by impact and effort
- Suggest implementation approach and sequencing
- Identify potential risks or blockers
- Recommend testing strategies
- Note follow-up research areas

---

## Usage Examples

### Chat-Based Proposal Validation

```
User: "I want to add real-time notifications using WebSockets"
Validate: Search for existing notification systems, WebSocket usage, real-time patterns
```

### Implementation File Validation

```
User: "Validate Implementation/features/billing-integration/PROPOSAL.md"
Validate: Check proposal against current billing code, payment flows, database schema
```

### Documentation Accuracy Check

```
User: "Validate the API documentation in Docs/wiki/"
Validate: Compare documented endpoints with actual API routes, verify examples
```

### Architecture Review

```
User: "Validate our authentication flow"
Validate: Review auth components, middleware, database tables, session management
```

---

## Validation Types & Focus Areas

### 🎯 **Feature Validation**

- Component reusability and patterns
- API endpoint alignment
- Database schema requirements
- Integration touchpoints
- Testing coverage gaps

### 🏗️ **Architecture Validation**

- System design consistency
- Data flow and state management
- Performance implications
- Security considerations
- Scalability patterns

### 📚 **Documentation Validation**

- Code example accuracy
- API reference completeness
- Architecture diagram alignment
- Setup instruction verification
- Troubleshooting guide effectiveness

### 🔧 **Implementation Validation**

- Development readiness assessment
- Dependency analysis and conflicts
- Migration path planning
- Rollback strategy evaluation
- Monitoring and observability setup

---

## Advanced Search Strategies

### Internal Code Search Strategy

Use targeted search terms based on validation focus:

```
- Architecture: "auth", "middleware", "service", "provider"
- Database: "schema", "migration", "model", "rpc"
- API: "route", "endpoint", "handler", "middleware"
- UI: "component", "hook", "context", "state"
- Integration: "webhook", "queue", "job", "event"
```

### External Knowledge Research Strategy

Use `search_web` to research industry standards and best practices:

**Search Query Patterns:**

```
- "[Technology] best practices [Year]" (e.g., "React hooks best practices 2024")
- "[Feature type] architecture patterns" (e.g., "real-time notification architecture patterns")
- "[Technology] security vulnerabilities common" (e.g., "NextJS security vulnerabilities common")
- "[Database] schema design patterns" (e.g., "PostgreSQL schema design patterns")
- "[API] design best practices REST" (e.g., "API design best practices REST")
- "[Framework] performance optimization" (e.g., "Supabase performance optimization")
```

**Research Focus Areas:**

- **Security**: OWASP top 10, authentication patterns, data protection
- **Performance**: Caching strategies, database optimization, CDN patterns
- **Scalability**: Load balancing, horizontal scaling, microservices patterns
- **Testing**: Unit testing, integration testing, E2E testing strategies
- **DevOps**: CI/CD pipelines, deployment strategies, monitoring
- **UX/UI**: Accessibility guidelines, responsive design, user experience patterns

### Cross-Reference Validation & Benchmarking

- Search implementation files AND related code
- Check database migrations AND Prisma schema
- Verify API routes AND their usage in frontend
- Compare documentation AND actual implementation
- **NEW**: Benchmark current approach against industry standards
- **NEW**: Identify potential security vulnerabilities from web research
- **NEW**: Compare performance patterns with best practices found online

---

## Output Rules & Reporting

### Chat-First Approach

- **Primary output: Structured chat response** with clear findings
- Use emojis and formatting for easy scanning
- Provide actionable next steps
- Link to relevant files using @filepath citations

### Documentation Creation (Only When Requested)

- Follow existing patterns in `Implementation/features/[feature]/phase-0/`
- Use consistent naming and structure
- Include validation date and context
- Reference source materials and search queries used

### Enhanced Findings Format (with External Research)

```
## Validation Results for [Target]

✅ **Existing & Functional**
- Component X already handles Y (follows React best practices from 2024)
- API endpoint /api/z exists and working (REST conventions compliant)
- Database table `users` has required fields (PostgreSQL indexing optimized)

⚠️ **Needs Modification**
- Authentication middleware needs JWT refresh pattern (industry standard: 15min access, 7day refresh)
- Database migration required for JSONB column (PostgreSQL best practice for flexible data)
- Component styling needs responsive breakpoints (follow Material Design 2024 guidelines)

🔴 **Missing & Required**
- WebSocket connection manager not implemented (recommend Socket.IO over native WebSocket)
- User notification preferences table missing (follow notification permission patterns)
- Real-time event broadcasting service needed (Redis pub/sub recommended by Supabase docs)

📋 **Industry Best Practices & Recommendations**
- **Security**: Implement OWASP authentication guidelines (found in external research)
- **Performance**: Add Redis caching layer (industry standard for 100ms response times)
- **Scalability**: Use horizontal pod autoscaling patterns (Kubernetes best practices)
- **Testing**: Add integration tests for real-time features (cypress recommended patterns)

🌐 **External Research Insights**
- Socket.IO v4.x shows 40% better performance than native WebSocket
- PostgreSQL JSONB indexes recommended for notification metadata queries
- Industry standard: notification batching every 30s to reduce spam

🔗 **Dependencies & Standards**
- WebSocket library: Socket.IO 4.x (industry leader, better fallback support)
- Redis for pub/sub: Required for horizontal scaling (Supabase compatible)
- Database migration: Follow PostgreSQL JSONB indexing best practices
- Security: Implement rate limiting (100 req/min standard for notifications)
```

---

## Related Patterns & Workflows

### Workflow Integration

- Use `/validate` before `/implement` workflows
- Combine with `/document` for comprehensive analysis
- Follow up with `/check-work` after implementation

### File Structure Patterns

```
Implementation/
└── features/
    └── [feature-name]/
        ├── IMPLEMENTATION-PROPOSAL.md   # Goals and approach
        ├── IMPLEMENTATION-TRACKER.md    # Task tracking
        └── phase-0/ (optional, when requested)
            ├── VALIDATION-REPORT.md     # Comprehensive findings
            ├── CURRENT-ARCHITECTURE.md  # Existing state analysis
            └── SCHEMA-ANALYSIS.md       # Database/API schema review
```

### Search Result Organization

Keep validation findings organized by:

1. **Scope** (component, service, system-wide)
2. **Priority** (critical, important, nice-to-have)
3. **Effort** (quick fix, moderate work, major development)
4. **Risk** (breaking changes, backward compatibility, performance impact)
