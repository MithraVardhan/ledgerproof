# LedgerProof

AI-powered tax review prototype for the GreenGrowth CPAs case study.

**Live demo:** https://mithravardhan.github.io/ledgerproof/

LedgerProof is a static, clickable frontend prototype. It uses hardcoded mock data and simulated AI outputs to demonstrate the interaction model, not production tax logic, OCR, authentication, or backend infrastructure.

## Run

Open `index.html` directly in a browser, or serve the folder locally:

```bash
python3 -m http.server 4173
```

Then visit `http://localhost:4173`.

## Demo Story

The main journey is a CPA reviewing Verdant Fields Cultivation, LLC. The dashboard surfaces a high-priority security wage classification issue. The preparer opens the return, traces the value to a highlighted source invoice, reviews the AI's split allocation, corrects the allocation with a required reason, and sends or resolves a client-visible request.

The prototype also includes a client first-login flow, contextual request threads, a document library with hundreds of generated records, role switching, client/staff status renderers, and multi-role permissions.

## What Is Real vs. Simulated

| Area | Implemented | Simulated |
|---|---|---|
| Frontend UI | Static HTML, CSS, and JavaScript with real local state; focus and caret survive re-renders | No framework build step |
| Navigation | Hash routing with working browser back/forward, deep links, breadcrumbs, ⌘K palette with keyboard navigation | No server-side routing |
| Prioritization | The worklist rank is computed live from due date, blocker ownership, AI findings, tax impact, and reviewer wait; the "why this is first" panel shows the actual score components | Scoring weights are hand-tuned, not learned |
| AI output | A `mockAiResponse()` stub returns a JSON-shaped response (value, confidence, rationale, uncertainty, evidence, proposed action) that powers the evidence panel | No model call behind the stub |
| Source traceability | Return fields link to documents with per-document preview content and highlighted source rows | No OCR or PDF parsing |
| Collaboration | Client-visible vs. internal replies, thread creation from a field, owner and due-date handoffs | No messaging backend |
| Dataset | 200+ mock returns (each with its own generated fields) and 400+ mock documents generated deterministically in JS | No database |
| Permissions | Role scoping is enforced in the UI: clients only see their own returns, documents, and threads; admins cannot edit or approve values; preparers cannot approve their own overrides | No auth |

The demo clock is frozen at Aug 6, 2026 so due dates and "days until" stay consistent with the seeded story.

## Challenge Evidence

| # | Challenge | Where to look | Evidence |
|---|---|---|---|
| 01 | Source Document Traceability | `Return review` | Click a return field; source document and evidence panel update side by side. |
| 02 | Client & CPA Collaboration | `Requests` | Threads are anchored to fields/documents, with internal notes separated from client-visible messages. |
| 03 | Where to Start | Switch role to `Business owner` | First client screen has one primary task and hides unnecessary navigation detail. |
| 04 | Getting Lost in the App | Top context bar and command palette | Breadcrumbs, pinned return context, related anchors, and jump-to-object flow preserve place. |
| 05 | Role-Aware Experiences | `Roles` | Preparer, reviewer, admin, client, and multi-role user show different permissions and navigation. |
| 06 | Return Status & Progress | `Status` | Same return status renders in staff vocabulary and client vocabulary. |
| 07 | An Actionable Dashboard | `Dashboard` | Ranked worklist explains why the top item is first, instead of using KPI tiles. |
| 08 | Clickable vs. Editable | Return fields and evidence panel | Tick marks and value treatments distinguish verified, editable, AI-estimated, overridden, locked, and missing-source states. |
| 09 | Complexity Made Navigable | `Documents` | Search, type filter, state filter, and count handling work against 400+ mock documents. |
| 10 | Trustworthy AI | `AI evidence` panel | Summary/evidence/audit disclosure tiers show what the AI did, why, uncertainty, and how to correct it. |

## Edge Cases Wired

- Low-confidence AI extraction
- Conflicting amended W-2 source
- Missing expected 1099-B
- Stale source after re-upload
- Human override requiring a reason
- Locked field after filing with visible reason
- Confidence propagation to total COGS
- Multi-role employee/personal return context
- Awaiting-client ownership
- AI declined-to-classify state
- Simulated personal K-1 upload that moves ownership back to the firm
- Value corrections on non-allocation fields (dollar override with required reason)
- Empty search/filter results with explicit empty states
- Admin role rendered read-only with visible reasons (matches the permissions table)

## Design Decisions

- **One sheet, not floating cards:** Each multi-region view (return review, documents, requests, status) is a single surface divided by hairline rules, the way desktop tools like mail clients arrange master–detail — not separate boxed panels floating on a canvas. The dashboard leads with a full-width "Next up" block (the top-ranked item and its score reasons together), followed by the worklist as a real table with column headers.
- **Tick-mark gutter:** Every important number has a persistent audit-style symbol (✓ traced, ~ estimated, ? awaiting, △ override, ⊘ locked) so provenance state is visible before the user clicks. This is the one deliberately domain-specific visual element.
- **Restrained color:** Color only carries state. Status renders as a small dot plus colored text, not bordered chips; metadata is quiet gray text. Inside document previews, totals keep the accounting convention of a single rule above and a double rule beneath.
- **Typography:** Fraunces (serif) is reserved for page titles only; IBM Plex Sans carries the UI, and IBM Plex Mono with tabular figures carries every number so amounts align like a typeset workpaper.
- **One status object, two renderers:** Staff can see blocker mechanics; clients see plain-language ownership and next action.
- **Contextual communication:** Threads are attached to tax fields, documents, or tasks so collaboration does not become a generic inbox.

## Engineering Notes

- **No framework, no build step — deliberately.** The prototype is one HTML file, one stylesheet, and one `app.js`, reviewable without tooling. For a greenfield concept demo, the cost of a build pipeline buys nothing the evaluation needs.
- **Rendering model:** The whole app re-renders into a single root from one `appState` object (an intentionally simple unidirectional loop). Focus and caret position are captured before each render and restored after, so typing in search fields and the command palette survives re-renders.
- **Role scoping is enforced centrally** in the data accessors (`getReturn`, `getDocument`, `getThread`, `scopedDocuments`, `visibleThreads`), so a deep link or stale selection cannot leak another client's data into any view.
- **State resets on page refresh by design** — there is no persistence layer, matching the "quick and dirty behind the frontend" brief.
- **The AI boundary is a stub with a real shape:** `mockAiResponse()` returns a JSON-shaped payload (value, confidence, rationale, uncertainty, evidence, proposed action) and the evidence panel consumes only that response, marking exactly where a real model call would slot in.

## Automated Checks

`verify.js` drives the running app in headless Chrome through 35 scenario checks: search and palette typing, keyboard navigation, role-scoping (client cannot reach another client's documents, threads, or returns), override validation and audit-trail correctness, browser back/forward and deep links, empty states, and mobile rendering.

```bash
npm install
npm run verify   # starts a local server if one isn't already running
```
