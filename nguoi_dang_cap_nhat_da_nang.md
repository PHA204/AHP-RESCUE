# FE BUILD PLAN — Rescue DSS Dashboard (React + Vite)

## 1) Project summary
Build a responsive web dashboard for a Decision Support System that helps rescue teams prioritize victims from social-media rescue comments.

The frontend must support 3 core jobs:
1. show rescue cases on a live map,
2. explain how AI extraction + AHP ranking produce the priority order,
3. let operators filter candidates and adjust AHP pairwise comparisons safely.

This is **not** a generic admin dashboard. It is an emergency operations UI:
- fast scanning,
- clear severity hierarchy,
- low cognitive load,
- strong audit/explainability.

---

## 2) Product goals
### Primary goals
- Help operators identify **who should be rescued first**.
- Show **where** victims are on the map.
- Make the AHP process **visible and editable**, not a black box.
- Support a **screening → ranking** workflow.

### Non-goals
- Do not design a social-media-like interface.
- Do not bury the map behind many tabs.
- Do not expose raw matrix math before users have candidate selection context.
- Do not optimize for “beautiful but vague” charts.

---

## 3) Domain model the UI must reflect
### AHP structure
The UI must reflect this exact decision hierarchy:
- **Goal**: choose rescue priority order
- **Criteria**: danger level, number of people, vulnerable groups, waiting time, accessibility, etc.
- **Alternatives**: filtered rescue cases / victims

### Important product rule
Because the real system may have many rescue cases, the UI must implement:
1. **Screening / filtering first**
2. **AHP ranking second**

That means the operator first narrows down candidate alternatives, then edits the pairwise comparison matrix for criteria, then sees final ranking results.

---

## 4) UX principles
### 4.1 Map-first operations
The landing experience should feel operational and map-centric.
The map is a primary workspace, not a decoration.

### 4.2 Explainability over magic
Every ranking view should answer:
- why is this case ranked high?
- which criteria contributed most?
- is the consistency ratio acceptable?

### 4.3 Progressive disclosure
Show information in 3 layers:
- **Layer 1:** status + counts + map + top priorities
- **Layer 2:** candidate list + filters + row details
- **Layer 3:** AHP matrix + criteria weights + ranking explanation

### 4.4 Safe editing
AHP editing must prevent invalid input and display reciprocal values automatically.
Example:
- if user enters `5` at `[danger][waiting_time]`
- UI auto-fills `1/5` at `[waiting_time][danger]`

### 4.5 Emergency color system
Use color semantically and sparingly:
- CRITICAL = destructive red
- HIGH = orange
- MEDIUM = amber/yellow
- LOW = blue/neutral
- RESCUED / closed = green/gray

Avoid rainbow overload.

---

## 5) Core user roles
### Rescue operator
- monitors map
- reviews extracted cases
- filters candidates
- adjusts AHP criteria weights
- dispatches / updates status

### Supervisor / lecturer demo role
- wants to see clear theory-to-system mapping
- wants visible AHP logic
- wants exportable screenshots / understandable flow

---

## 6) Information architecture
### Main app shell
- **Top bar**
  - project title
  - monitored source selector / post selector
  - last sync time
  - system status badge
  - theme toggle
- **Left rail / sidebar**
  - Dashboard
  - Cases
  - Map
  - AHP Ranking
  - Dispatch
  - Analytics
  - Settings
- **Main workspace**
  - route-based content
- **Right drawer (contextual)**
  - selected case details / ranking explanation / dispatch quick actions

---

## 7) Recommended routes
### `/dashboard`
Mission control overview.

Sections:
- KPI cards
- live map preview
- top priority queue
- recent incoming cases
- AHP summary card
- websocket / scraping / AI pipeline status

### `/cases`
Operational case management.

Sections:
- advanced filters
- searchable case table
- row expansion for extracted AI fields
- bulk actions
- quick shortlist toggle

### `/map`
Full-screen geospatial workspace.

Sections:
- map canvas
- heatmap toggle
- marker clustering
- severity legend
- selected case detail panel
- candidate shortlist overlay

### `/ahp`
Dedicated theory + configuration + ranking page.

Sections:
- Goal / Criteria / Alternatives summary
- candidate screening panel
- criteria pairwise matrix editor
- criteria weights + CR visualization
- final ranking table
- ranking explanation by case
- preset selector

### `/dispatch`
Team dispatch operations.

Sections:
- available teams
- selected priority cases
- assignment panel
- dispatch history timeline

### `/analytics`
Charts and QA views.

Sections:
- severity distribution
- geocoding success rate
- extraction confidence trends
- ranking movement after AHP changes

### `/settings`
System configuration UI.

Sections:
- criteria catalog
- presets
- map layers
- API health
- data refresh intervals

---

## 8) Priority screens in build order
### Phase 1 — foundation
1. App shell
2. Dashboard
3. Cases page
4. Map page

### Phase 2 — AHP core
5. AHP page
6. Candidate screening flow
7. Ranking explanation drawer

### Phase 3 — operations polish
8. Dispatch page
9. Analytics page
10. Settings page

---

## 9) Detailed screen requirements

## 9.1 Dashboard
### Purpose
Give a fast operational snapshot in under 10 seconds.

### Required widgets
- **KPI row**
  - total incoming cases
  - waiting cases
  - CRITICAL count
  - geocoded count
  - active monitored posts
- **Priority queue card**
  - top 5 ranked cases
  - score, severity, district, time waiting
- **Map card**
  - mini map with heat layer
- **Incoming stream card**
  - latest rescued / new / failed-geocode events
- **AHP state card**
  - active preset
  - CR value
  - number of screened alternatives in current ranking
- **Pipeline health card**
  - scraper status
  - AI inference status
  - geocoding status
  - websocket status

### UX notes
- prioritize scanability
- keep cards compact
- allow one-click drill-down to full pages

---

## 9.2 Cases page
### Purpose
Review and curate the alternative set before AHP ranking.

### Filters
- danger level multi-select
- rescue status
- district / area
- vulnerable group
- geocode status
- time range
- AI confidence range
- only shortlisted toggle

### Table columns
- case ID
- severity badge
- location description
- normalized address
- people count
- vulnerable groups
- AI confidence
- waiting time
- geocode status
- current rank
- rescue status
- source timestamp

### Row expansion content
- raw comment
- extracted JSON
- geocode result
- AHP contribution preview
- actions:
  - add/remove from shortlist
  - open on map
  - mark reviewed
  - dispatch

### UX notes
- sticky filters
- sticky header
- dense but readable rows
- keyboard-friendly table interactions

---

## 9.3 Map page
### Purpose
Provide the spatial view operators naturally expect.

### Required map features
- Leaflet base map
- markers by severity
- optional heatmap layer
- clustering for dense areas
- popup summary on click
- side detail panel on selection
- fit-to-results button
- legend
- layer toggles
- locate shortlisted alternatives only toggle

### Detail panel content
- severity + score
- location description
- raw comment
- extracted victims summary
- vulnerable groups
- waiting time
- AI confidence
- dispatch actions
- link to AHP explanation

### UX notes
- map should remain visible while interacting
- avoid large modal interruptions
- use drawer/panel instead of page jumps

---

## 9.4 AHP page
### Purpose
Translate theory into an operational, editable, explainable interface.

### Layout
Use a **3-column responsive layout** on desktop:
- **left:** screening / alternatives panel
- **center:** matrix editor + criteria weights
- **right:** ranking results + explanation

On tablet/mobile, stack vertically in this order:
1. screening
2. matrix
3. results

### Section A — Goal / Criteria / Alternatives summary
Show a simple hierarchy card:
- Goal
- Criteria list
- Current alternative count

### Section B — Screening panel
The operator chooses which alternatives enter AHP.

Controls:
- severity filter
- vulnerable-only toggle
- waiting time threshold
- district selector
- geocoded-only toggle
- max candidate count (default 10 / 15 / 20)
- manual include / exclude checkboxes

Output:
- “Current AHP candidate set: N alternatives”

### Section C — Criteria pairwise matrix editor
This is the most important UI in the whole app.

Requirements:
- matrix grid with criteria on both axes
- diagonal fixed to `1`
- upper triangle editable
- lower triangle auto-calculated reciprocal
- support Saaty values:
  - `1, 2, 3, 4, 5, 6, 7, 8, 9`
  - reciprocals shown as `1/2 ... 1/9`
- cell click opens compact choice popover or dropdown
- invalid states blocked
- live recomputation on change

### Section D — Criteria weights + consistency
Show:
- normalized weights as bars
- numeric weights
- CR value
- validity badge:
  - valid if `CR < 0.1`
  - warning if `CR >= 0.1`

Also show guidance:
- which pairwise judgments may be causing inconsistency
- CTA to reset to preset/default

### Section E — Final ranking result
Show ranked alternatives with:
- rank number
- case summary
- final score
- severity
- people count
- vulnerable groups
- waiting time
- district / area

### Section F — “Why this rank?” explainer
When a case is selected, show:
- final score
- contribution by criterion
- criteria weights used
- short narrative explanation

Example:
> Ranked #1 because it has CRITICAL danger level, multiple victims, vulnerable elderly group, and long waiting time under the active preset.

### Section G — Presets
Provide starter presets:
- Default balanced
- Prioritize life-threatening danger
- Prioritize vulnerable groups
- Prioritize largest number of people
- Prioritize long waiting time

Each preset updates matrix values, weights, and ranking.

---

## 9.5 Dispatch page
### Purpose
Turn ranking into action.

### Required modules
- available teams list
- selected high-priority cases list
- quick assignment form
- dispatch history table
- status timeline

### UX notes
- emphasize current availability
- prevent accidental reassignment
- show map snippet for selected team + case

---

## 10) Design system direction
### Visual tone
- emergency operations center
- modern government-tech / humanitarian-tech
- serious, clean, calm
- not gamer-like, not fintech-like

### Component style
- rounded but restrained
- soft shadows only where useful
- high contrast text
- large touch targets
- data-heavy layout with clean grouping

### Typography
- clear hierarchy
- strong numeric emphasis for scores / CR / counts
- monospace only where useful (matrix or IDs)

### Spacing
- dense dashboard, breathable detail views
- use consistent spacing scale

---

## 11) Suggested FE stack
- React
- Vite
- TypeScript
- React Router
- TanStack Query
- Zustand or Redux Toolkit for local workflow state
- Tailwind CSS
- shadcn/ui
- Leaflet + react-leaflet
- Recharts for charts
- react-hook-form + zod
- framer-motion for subtle transitions

### State split
- **server state:** TanStack Query
- **UI workflow state:** Zustand
- **forms:** react-hook-form

---

## 12) Suggested frontend folder structure
```txt
src/
  app/
    router.tsx
    providers.tsx
    store/
  components/
    layout/
    map/
    tables/
    charts/
    ahp/
    cases/
    dispatch/
    common/
  features/
    dashboard/
    cases/
    map/
    ahp/
    dispatch/
    analytics/
    settings/
  hooks/
  lib/
    api/
    utils/
    constants/
    formatters/
  types/
  pages/
  styles/
```

---

## 13) Feature modules Codex should implement

## 13.1 Common layout module
Build:
- responsive sidebar
- topbar
- breadcrumb/title region
- command/search trigger
- global status badges
- theme switch

## 13.2 Dashboard module
Build:
- KPI cards
- mini ranking table
- event feed
- map preview card
- health widgets

## 13.3 Cases module
Build:
- filter toolbar
- data table
- row expansion panel
- shortlist actions
- empty / loading / error states

## 13.4 Map module
Build:
- full map canvas
- layer controls
- marker / heatmap switch
- details drawer
- selected case sync with table state

## 13.5 AHP module
Build:
- hierarchy summary card
- screening panel
- pairwise matrix editor
- CR indicator
- weights bar chart
- ranking list
- rank explanation drawer
- preset manager

## 13.6 Dispatch module
Build:
- team cards
- assignment form
- dispatch timeline

---

## 14) Data contracts to assume initially
Use mock data first, but keep types production-friendly.

### RescueCase
```ts
export type RescueCase = {
  id: string;
  sourcePostId: string;
  rawComment: string;
  commenterName?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_RESCUE';
  locationDescription?: string;
  normalizedAddress?: string;
  lat?: number;
  lng?: number;
  numPeople?: number;
  vulnerableGroups: string[];
  accessibility?: 'EASY' | 'MODERATE' | 'HARD';
  waitingMinutes?: number;
  aiConfidence?: number;
  geocodeStatus: 'pending' | 'success' | 'failed';
  rescueStatus: 'waiting' | 'dispatched' | 'rescued' | 'false_alarm';
  currentScore?: number;
  currentRank?: number;
  createdAt: string;
  updatedAt: string;
};
```

### AHP criteria
```ts
export type CriterionKey =
  | 'danger_level'
  | 'num_people'
  | 'vulnerable_groups'
  | 'waiting_time'
  | 'accessibility';
```

### Pairwise matrix payload
```ts
export type PairwiseMatrixPayload = {
  criteria: CriterionKey[];
  matrix: number[][];
};
```

### AHP result
```ts
export type AHPResult = {
  criteriaWeights: Record<CriterionKey, number>;
  consistencyRatio: number;
  isConsistent: boolean;
  rankedCases: Array<{
    caseId: string;
    finalScore: number;
    rank: number;
    contributionByCriterion: Record<CriterionKey, number>;
  }>;
};
```

---

## 15) Mock data strategy
Codex should first build with a realistic seeded mock dataset:
- 30 rescue cases
- mixed severities
- mixed geocode status
- several districts
- multiple vulnerable groups
- 4–5 presets
- sample dispatch teams

The app should feel demo-ready before backend integration.

---

## 16) Critical interactions to implement well
### AHP matrix interaction
- selecting a value updates reciprocal automatically
- CR updates live
- weights update live
- ranking updates live or via explicit Apply button

### Case-to-map sync
- selecting a table row highlights map marker
- selecting marker opens same case in shared detail drawer

### Screening-to-ranking sync
- changing filters updates candidate count
- ranking disabled if candidate set is empty
- warning shown if candidate set is too large for clean comparison

### Preset flow
- choose preset
- matrix animates to new values
- CR and ranking refresh

---

## 17) Accessibility requirements
- keyboard navigable controls
- visible focus states
- color not the only meaning channel
- severity badges include text labels
- matrix cells usable without hover-only interaction
- charts also show numeric labels where important

---

## 18) Responsive behavior
### Desktop
- multi-panel workspace
- map + list side-by-side
- AHP page 3-column layout

### Tablet
- 2-column or stacked sections
- collapsible filters
- persistent bottom action bar for Apply / Reset

### Mobile
- simplified operational viewer only
- avoid forcing full matrix editing on tiny screens
- matrix editing can remain available but in stepwise panels

---

## 19) Empty, loading, and error states
Design these intentionally.

### Empty states
- no cases found after filtering
- no geocoded cases for map
- no shortlisted alternatives for AHP

### Loading states
- skeleton cards
- table row skeletons
- map placeholder
- ranking recalculation spinner

### Error states
- failed to load cases
- websocket disconnected
- AHP matrix inconsistent
- geocoding unavailable

---

## 20) Charts to include
Keep charts few but meaningful:
- severity distribution
- rescue status distribution
- geocoding success vs failure
- ranking score distribution
- criterion weight bars
- ranking changes between presets

Avoid dashboard junk charts.

---

## 21) Metrics and labels that must always be visible
- active preset
- CR value
- candidate count
- last sync time
- critical waiting count
- current ranking basis

---

## 22) UX copy tone
Use concise Vietnamese operational language.

Examples:
- “Ứng viên đưa vào AHP”
- “Ma trận so sánh cặp tiêu chí”
- “Tỷ số nhất quán (CR)”
- “Xếp hạng ưu tiên cứu hộ”
- “Giải thích điểm ưu tiên”
- “Chưa đủ dữ liệu định vị”

Avoid robotic English-heavy labels unless technical context requires it.

---

## 23) Build constraints for Codex
### Must do
- use TypeScript everywhere
- use reusable components
- use mock API layer
- keep domain-specific naming
- prioritize maintainable structure over flashy visuals

### Must not do
- no giant single-file page components
- no fake lorem ipsum rescue data
- no unstructured CSS
- no modal-only workflow for core operations
- no overuse of charts where table/map is clearer

---

## 24) Definition of done for UI phase 1
The UI is considered phase-1 complete when:
- app shell is production-like
- dashboard works with mock data
- cases page supports filtering and selection
- map page syncs with selected case
- AHP page supports:
  - candidate screening
  - pairwise criteria matrix editing
  - CR visualization
  - ranking result display
  - preset switching
- all pages have loading / empty / error states
- layout is responsive

---

## 25) Recommended execution order for Codex
1. scaffold app shell and routing
2. define types and mock data generators
3. build dashboard widgets
4. build cases table + filters
5. build shared detail drawer
6. build map module
7. build AHP matrix editor
8. build criteria weights + CR widgets
9. build ranking table + explanation drawer
10. polish states, responsiveness, and visual consistency

---

## 26) Prompt Codex should follow
```md
Build a React + Vite + TypeScript frontend for a rescue decision support system.

Requirements:
- Use React Router, Tailwind, shadcn/ui, TanStack Query, Zustand, Leaflet, and Recharts.
- Create routes: /dashboard, /cases, /map, /ahp, /dispatch, /analytics, /settings.
- The UI is map-first, operational, and emergency-focused.
- The AHP flow must be: screening/filtering alternatives first, then editing the pairwise criteria matrix, then showing criteria weights, consistency ratio (CR), and final ranking.
- Implement an editable pairwise matrix where the diagonal is fixed at 1, the upper triangle is editable, and the lower triangle auto-updates as reciprocals.
- Add realistic mock rescue-case data and mock ranking results.
- Build reusable components and keep feature folders clean.
- Prioritize scanability, explainability, and strong empty/loading/error states.
- All main labels should support Vietnamese operational terminology.
```

---

## 27) Optional stretch goals
- replay timeline for incoming rescue cases
- compare two AHP presets side by side
- export ranking snapshot to PDF
- map animation for newly arrived critical cases
- explainability chart per selected case

---

## 28) Final design intent
The finished UI should make an examiner immediately understand:
1. AI extracts structured rescue information from comments,
2. the system maps victims spatially,
3. AHP is used transparently to rank rescue priorities,
4. operators can adjust criteria weights and instantly see the ranking change.
