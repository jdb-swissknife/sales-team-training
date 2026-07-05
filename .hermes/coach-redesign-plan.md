# Coach App UI/UX Redesign Plan

## Date: 2026-07-05
## Status: Agreed, ready to build

## Context

The Coach app (jdb-swissknife.github.io/sales-team-training) is a standalone sales training tool embedded via iframe in Route Blitzer. RB is the source of truth for field activity (door knocking, visit outcomes, pipeline). Coach is where reps learn from their field work.

The identity sync bug was fixed (commit 0c9c534) -- Coach now overwrites its internal user when launched from RB with source=route-blitzer and repName in the URL.

## Architecture Decision

- Coach stays as a separate GitHub Pages site
- RB = doing the work (knocking, logging, managing pipeline)
- Coach = learning from the work (debriefing, practicing, studying)
- Managers coach from RB Board. Coach is a self-service training tool for reps only.
- No coach/admin role in the Coach app. Pure rep experience.

## RB Data Available

Currently exposed:
- GET /api/coach/xp-summary?repName=X&days=N
  Returns: xp, level, streakDays, breakdown, stats {totalVisits, conversations, callbacks, books, notHome, notInterested, contactRate, bookRate}, recentEvents[]

Needs to be added:
- GET /api/coach/visits?repName=X&days=30
  Returns: [{ id, address, neighborhood, outcome, notes, contactName, hvacAge, hvacBrand, hvacCondition, hasGas, financingStatus, nextActionDate, occurredAt }]

The home_visits table has all this data. Schema confirmed:
id, neighborhood_id, rep_name, street_address, visited_at, outcome, contact_name, hvac_age, hvac_brand, hvac_condition, has_gas, financing_status, next_action_date, notes, rep_user_id

## Current Pages (14 total)

Rep-visible: Command, Training, Field Logs, Practice Lab, Objections, Progress
Admin/other: CoachReview, Analytics, AdminUsers, CompanyDetail, ContentLibrary, PlatformDashboard, Home, ModuleDetail

## Target Structure (5 sidebar items)

### 1. COMMAND (Dashboard) -- REWORK
Reframe from "activity dashboard" to "training cockpit."
- Lead with momentum: XP, streak, level (already from RB)
- "Your last 5 doors" feed from RB recentEvents (already available)
- Stat tiles become training-oriented: contact rate, booking rate, doors since last booking
- Remove "Log Field Activity" action card (no more manual logging)
- Keep level progress bar, badges
- Fold Progress data in as a section or tab

### 2. VISIT DEBRIEF (new page, replaces Field Logs)
Core new feature. Pulls visit instances from RB via new /api/coach/visits endpoint.
- List of recent visits with outcome, address, neighborhood, notes
- Each visit expandable to show details (HVAC age/condition, contact info, follow-up date)
- Self-reflection prompt (optional): "What went well? What would you change?"
  - Stored in Coach app localStorage (not written back to RB)
  - Gentle nudge on visits that went poorly (not_interested, no answer after conversation)
  - No nudge on not_home (nothing to learn)
- No coach feedback workflow (managers use RB Board for coaching)
- Visits are READ-ONLY from RB perspective. Debrief annotations are local to Coach.

### 3. TRAINING (keep as-is)
HVAC sales curriculum. Modules on door approach, inspection, presentation, close, financing, objections. Already built out with content. No changes needed.

### 4. PRACTICE LAB (keep, minor enhance)
AI roleplay for objection handling. Already works.
- Future enhancement: pull in rep's actual missed objections from RB visits
  ("You marked this visit as 'Not Interested' -- want to practice that scenario?")
- Not in scope for this phase.

### 5. OBJECTIONS (keep as-is)
Reference library. 50+ HVAC objections with rebuttals, categorized by stage and difficulty. No changes needed.

## Pages to REMOVE

- Field Logs (redundant with RB)
- MyProgress (folds into Command)
- CoachReview (managers use RB Board)
- Analytics (management belongs in RB)
- AdminUsers (no admin role)
- PlatformDashboard (not relevant)
- ContentLibrary (not relevant)
- CompanyDetail (not relevant)
- Home (unused)
- ModuleDetail (keep as route target from Training, but remove from nav)

## Implementation Steps

### Phase 1: RB API -- Add visit instances endpoint
File: /root/projects/route-blitzer/artifacts/api-server/src/routes/coach.ts
- Add GET /coach/visits?repName=X&days=30
- Query home_visits joined with neighborhoods for name
- Return JSON array scoped to the requesting rep
- Same auth pattern as xp-summary (sessionContext + repName scoping)

### Phase 2: Coach app -- Add Visit Debrief page
File: /root/projects/sales-team-training/src/pages/VisitDebrief.jsx (new)
File: /root/projects/sales-team-training/src/lib/routeBlitzerXp.js (add fetchVisits)
- Fetch visits from RB API
- Display visit cards with expand/collapse
- Self-reflection input (localStorage, keyed by visit ID)
- Nudge badges on poorly-outcomed visits
- Filter/sort by date, outcome

### Phase 3: Coach app -- Rework Dashboard
File: /root/projects/sales-team-training/src/pages/Dashboard.jsx
- Remove "Log Field Activity" action card
- Replace with "Review Your Visits" action card linking to Debrief
- Reframe stat tiles for training context
- Pull Progress metrics in as a section

### Phase 4: Coach app -- Rework sidebar + routing
File: /root/projects/sales-team-training/src/Layout.jsx
File: /root/projects/sales-team-training/src/pages.config.js
- Remove admin/unused nav items
- New nav: Command, Training, Debrief, Practice, Objections
- Remove role-based filtering (everyone is rep)
- Clean up unused page files

### Phase 5: Build + deploy
- npm run build in sales-team-training
- git push to trigger GitHub Actions deploy
- Verify at the live URL with repName=John Smith

## Key Files

### RB Side
- /root/projects/route-blitzer/artifacts/api-server/src/routes/coach.ts (add visits endpoint)
- /root/projects/route-blitzer/artifacts/api-server/src/middlewares/local-auth.ts (session scoping)

### Coach Side
- /root/projects/sales-team-training/src/pages/VisitDebrief.jsx (NEW)
- /root/projects/sales-team-training/src/lib/routeBlitzerXp.js (add fetchVisits)
- /root/projects/sales-team-training/src/pages/Dashboard.jsx (rework)
- /root/projects/sales-team-training/src/Layout.jsx (rework sidebar)
- /root/projects/sales-team-training/src/pages.config.js (update page registry)
- /root/projects/sales-team-training/src/pages/FieldLogs.jsx (DELETE)
- /root/projects/sales-team-training/src/pages/MyProgress.jsx (DELETE)
- /root/projects/sales-team-training/src/pages/CoachReview.jsx (DELETE)
- /root/projects/sales-team-training/src/pages/Analytics.jsx (DELETE)
- /root/projects/sales-team-training/src/pages/AdminUsers.jsx (DELETE)
- /root/projects/sales-team-training/src/pages/PlatformDashboard.jsx (DELETE)
- /root/projects/sales-team-training/src/pages/ContentLibrary.jsx (DELETE)
- /root/projects/sales-team-training/src/pages/CompanyDetail.jsx (DELETE)
- /root/projects/sales-team-training/src/pages/Home.jsx (DELETE)

## Design Conventions
- Dark theme: bg #080a0f, white text, amber/orange accents
- mv-card, mv-shell, mv-grid-bg classes already defined
- Lucide icons throughout
- createPageUrl() for navigation
- dataStore (localStorage) for Coach-local data (reflections, user identity)
- React Query for RB API calls (staleTime: 60s)

## Verification
- Log into RB as John Smith
- Click Coach
- Verify John Smith identity, XP data, visits all show correctly
- Navigate through all 5 sidebar pages
- Confirm Visit Debrief shows John Smith's 2 visits with reflection prompts
