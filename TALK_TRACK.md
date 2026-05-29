# Upstart × ThoughtSpot — Demo Talk Track (Manuel)

**Target length:** 12–15 minutes (app demo only — Angelo follows with the embed-experience portion).
**Audience:** Sergiu, Dave, Angelo, Julia, Jared + Vaidehi (Sr Eng Mgr) + Oliver (PM). Mostly known faces; assume context from the prep session.

**Anchor narrative:** *"First the **what**, then the **why** — the same loop your CS team is doing by hand today, but at the speed of clicking a button."*

---

## Setup before recording / sharing screen

1. **Browser:** Chrome, signed in to `upstart.thoughtspot.cloud` (same session — the embeds use cookie auth).
2. **Vercel URL** (or `localhost:3000`) loaded. Reset state via the partner switcher → **Internal Demo · Executive**.
3. Have these tabs pre-loaded so transitions are instant: `/`, `/dashboard`, `/search`, `/ai-analytics`.
4. Close Slack notifications.
5. Quick mental note on the deduplicated model name: **"Deduplicated Upstart Loans and Applications"** — Sergiu helped me simplify this so the numbers don't look weird from snapshot joins.

---

## 0:00 – 0:45 · Open & framing

**Screen:** Home page (`/`).

> "Quick context before I show anything. What you're about to see is *not* a Vercel page that I want you to put in front of customers tomorrow — Angelo is going to talk about the real embedded experience inside the Upstart app right after me. This is **art of the possible**. A clean React shell on Vercel, with ThoughtSpot doing all the analytics work behind it. The point is to show you the full surface area — drill-down, change analysis, keyword search, AI chat, and the security story — in a single 10-minute flow."

**Optional add:** *"The whole shell is in a public repo at `github.com/mmarco-ts/upstart-portal`. Total build time, one engineer, a few afternoons."*

---

## 0:45 – 2:30 · Lending Performance — the "what"

**Screen:** Click **Lending Performance** in the sidebar.

> "This is the deduplicated model Sergiu and I aligned on yesterday — `Deduplicated Upstart Loans and Applications`. One model, latest snapshot, no point-in-time joins for this POC. KPI strip across the top: Loans Originated MTD versus prior month, Application Count, Approval Rate, Conversion, Avg APR, 90+ delinquency by vintage, and the funnel."

**Point at the Loans Originated KPI:**

> "Same numbers your UPA users see today — *Loans Originated MTD vs prior month* is a real measure in the TML, with a defined formula. Hover the KPI, you see a sparkline. Click it…"

**Click into the KPI / open underlying.**

> "…and you're already drilling into the row-level data behind it. Same trip your CS team is doing today by hand — except it took one click, not opening a ticket. Filter, sort, export to CSV if you need to."

---

## 2:30 – 4:30 · Change analysis — the "why"

**Screen:** Back to the liveboard. Pick a KPI or trend line that shows a meaningful delta (Approval Rate trend is a good one).

> "Here's the beat I really want to hit. Pick a number that moved — Approval Rate's down two points month-over-month. Today, somebody at Upstart has to go figure out *why*. Was it a state? A product? A risk grade? A channel?"

**Click the change-analysis button on the viz** (right-click → analyze change, or click the AI Highlights / Analyze button).

> "ThoughtSpot scans every dimension in the semantic layer automatically — credit band, state, product type, acquisition channel, risk grade — and gives you the top contributors. So the answer comes back: *'Approval rate dropped 2.1 points; the 2024-Q3 personal-loan vintage in the referral channel accounts for 73% of the drop.'*
>
> That loop — *what changed* and *why* — is the one Sergiu and Dave have been calling out as the gap versus Looker. This works on every viz on the board, no extra config."

**Optional follow-up:** drill from the change-analysis result back into the row-level data to close the loop.

---

## 4:30 – 6:30 · Search — keyword tokens (Angelo's ask)

**Screen:** Click **Search** in the sidebar.

> "Angelo asked me yesterday to also show the keyword search — this is the surface you and Vaidehi's admins would use for ad-hoc analysis, before pinning anything to a dashboard. Same model, same semantic layer, different chrome."

**Click a starter prompt (e.g. "approval rate by state")**.

> "Click a starter on the right and it seeds the search bar with tokens. You can see how it auto-completes from the column synonyms in the TML — Sergiu wrote those, and they're paying off here. Add `over the last 6 months` — viz updates in place. Add `for personal loans only` — updates again."

> "When an admin builds something they like, they hit **Pin** and it lands on a Liveboard. This is the path for your power users to extend coverage without engineering."

---

## 6:30 – 9:00 · Insights AI — the natural-language version

**Screen:** Click **Insights AI** in the sidebar.

> "Same model again — third surface. Plain-English chat. Same semantic layer underneath, so the answers stay consistent with whatever a power user would have built in Search."

> "Dave said yesterday this is more of an internal tool for now, not customer-facing this quarter. So I'm going to be quick — but I want to show one round trip so you see the *what + why* beat works here too."

**Click "Loans originated MTD vs prior month" from the side panel.**

> "Notice the panel on the right — those starter prompts are tuned to whichever view I'm in. I'm in Executive, so I see strategic prompts. Operations sees funnel and channel prompts. You don't have to teach users what to ask."

**While Spotter is answering:**

> "And look at the thinking panel — it shows you the column tokens it picked, the formula it resolved to, the filter it applied. That's the auditability story for compliance and fair-lending: every answer is traceable back to a defined measure in the TML."

**Once it answers, ask a follow-up like "why did approvals drop in March":**

> "Same change-analysis logic as on the dashboard, just conversational."

---

## 9:00 – 11:30 · Security beat — flip the persona live

**Screen:** Back to **Lending Performance**.

> "Last piece, and this is the one Sergiu specifically asked me to wire after yesterday. Permissions live."

**Click the partner pill top-right → switch View from Executive → Operations.**

> "Watch the toolbar.
> - **Edit, Save, Pin, Make a Copy** — gone. External users can't author dashboards.
> - **Ask AI** on the viz cards — gone. They're not getting Spotter access this quarter.
> - **Drill Down** — also gone. We said yesterday: external users either can't drill at all, or only inside their own creditor scope. For this demo I have it fully off for Operations.
>
> None of that is hardcoded in the liveboard. It's all in the SDK init call — `hiddenActions` driven by a per-view flag. When Julia finishes the auth piece next week and we bind these flags to your user variables, the same toggle becomes per-user automatically."

**Now switch the partner: Internal Demo → Apollo Fund I.**

> "Now the row-level side. Apollo Fund I — runtime filter at the iframe boundary on `Current Creditor Name = Apollo`, plus a product-type subset (personal + auto refi), plus a vintage cutoff at June 2025. Subtitle in the header shows the active filters so the audience can see them land. Numbers visibly change — APR shifts, product mix narrows."

**One more switch: Apollo → Marlette Funding.**

> "Marlette filters by *Originating Lender* instead of Creditor — different column, same pattern. So you can model both creditor-side and originator-side partners with the same building block."

> "Ron and I are going to close the loop on the full row + column security mapping next week — Sergiu, I know that's high on your list."

---

## 11:30 – 12:30 · Wrap & handoff to Angelo

**Screen:** Back to Home.

> "Quick recap:
> - Dashboard with drill-down and AI change analysis — the *what + why* loop
> - Keyword search for admins building new content
> - Conversational AI grounded in the same TML
> - Per-view permissions (edit, drill, AI access, PII) and per-partner row-level isolation, both driven by the SDK
>
> Everything you saw is in `github.com/mmarco-ts/upstart-portal`, deployed to Vercel.
>
> Angelo's going to take it from here and show what he's been building directly inside the Upstart app — that's the part where you'll really feel how easy or hard the embed integration is, which is the bit Dave called out yesterday as more interesting to actually *see* than to hear about. Angelo, over to you."

---

## Spare-time / Q&A material

If somebody asks **about performance / scale** (Dave's question):

> "Two pieces. ClickHouse is the data layer — your team is closer to that than I am, and we can pull the live query monitoring you have. What ThoughtSpot adds on top is iframe rendering plus the semantic-layer resolution — both client-side. Customer-experience comparables that come to mind on ClickHouse-like environments: iFood, Chick-fil-A — thousands of concurrent users on a single cluster, no perceptible latency overhead beyond the underlying warehouse. I'll bring a couple of those reference numbers to Monday's office hours."

If somebody asks **about column-level security**:

> "Wired in two ways. Static: column visibility set on the model in TS — the user simply doesn't see the column when their role doesn't grant it. Dynamic: tab-level hiding via `hiddenTabs` in the embed config — the way I've shown today with Operations. Ron and I are mapping your full framework to TS primitives next week."

If somebody asks **why we didn't show the original liveboard model with snapshots**:

> "We did — that's where Sergiu and I saw the weird 100% approval rate from the as-of-date join. So I simplified to the deduplicated model for this demo. In production we'd run multiple smaller models per use case — conversion, repayments, ownership — for speed and clarity, exactly as Sergiu suggested yesterday."

If somebody asks **about staging / dev environments**:

> "Multi-org pattern — one TS org per environment, each pointing at the right ClickHouse connection. That's what I see most embedded customers do."

---

## Notes / reminders

- **Don't apologize** for the demo data being a deduplicated model — Sergiu explicitly agreed this is the right call for POC.
- **Acknowledge Angelo's parallel build** — say "art of the possible" early so nobody thinks you're sidelining his work.
- **End on Angelo's name** — clean baton-pass.
- **Watch the clock.** If you're going long on change-analysis, skip the Spotter follow-up question and just leave it on the first answer.
- **Slide 10** (data description) is owned by Sergiu — he'll cover the model intro for one minute before you start the demo.
