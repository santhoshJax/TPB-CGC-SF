# Handoff — current state

> **Rewritten at the end of every session.** This file is *now*; [`gotchas.md`](gotchas.md) is *forever*.
> If this file and [`../CONTEXT.md`](../CONTEXT.md) disagree, this one is newer.

**Last updated:** 2026-10-27 · **By:** <session or person>

---

## Where things stand

> **Not yet filled in.** — Where is the work right now, in two or three sentences? Someone picking
> this up cold reads this first.

## In progress

| What | State | Where it lives | Blocked on |
|---|---|---|---|
| | | | |

## Next steps

<!-- Ordered. The top item should be the one to do next, not the most interesting one. -->

1.

## Waiting on someone else

| What | Who | Since | Chased? |
|---|---|---|---|
| | | | |

## Things the next session should know

<!-- Anything true right now that is not obvious from the code: a half-finished refactor, a
     deliberately disabled test, a workaround that needs removing, a deploy that is half-applied.
     If you leave something in a strange state, this is where you say so. -->

-

<!-- orchestrate:session-state:start -->
<!-- Written by Orchestrate at the end of each session. Edits inside this block are
     replaced next session; anything OUTSIDE it is yours and is never touched. -->
### Engagement state — 2026-11-02
**Status:** on track — Ready to upgrade QA to CG Cloud 264.2 + Mobile Sync 264.x + app 264.0005.00; SAL-493 UAT complete, awaiting closure

**Done this session**
- Confirmed CG Cloud 264.2 install ID (04tg8000000Gb6rAAC) is valid in QA
- Verified app version 264.0005.00 on App Store (14 Oct)
- Confirmed cgcloud and cgc_sync must stay on same major version
- Checked related packages: Salesforce Maps 264.1, Mobile Apps 1.26, Field Service 1.60

**Open items**
- Merge SAL-493 branch (tpb-cgc-orchestrate) into main and tag 260 baseline
- Move SAL-493 ticket from UAT to Done in Jira
- Install CG Cloud 264.2 in QA (link 04tg8000000Gb6rAAC)
- Install Mobile Sync matching 264 version in QA (version/ID not yet confirmed)
- Rebuild Modeler contracts for 264 and update package.xml (SAL-464)
- Move iPad devices to mobile app 264.0005.00
- Retest on iPad: start visit, add STOKERS 31029, verify product persists
- Verify SAL-417 field-service workaround before upgrading

**Decisions**
- Root cause of SAL-462: custom code created visit jobs only while Planned; standard creates them while In Progress
- Fix 1: restore In Progress condition in GetSurveys.bl.js
- Fix 2: fill missing Field Valid From/Thru dates for FRE POUCHES 694306 & 694307 if they appear in retest
- Fix 3 (optional): block products with missing dates at add time with error message
- SAL-493 treated as finished; closing steps are merge and tag

**Blockers**
- Mobile Sync 264 version and install ID not confirmed (Salesforce page wouldn't load)

**Next**
- Confirm Mobile Sync 264 version and ID from Salesforce Mobile Sync install page
- Check CG Cloud 264.2 against Salesforce compatibility table before installing
- Merge SAL-493 branch into main and tag 260 baseline
- Install 264.2 in QA (cgcloud, then cgc_sync in same window)
- Rebuild Modeler contracts for 264 (SAL-464)
- Move devices to app 264.0005.00 and retest with STOKERS 31029

**Checked live on 2026-11-02:** Jira, the web, the Salesforce org
### Last session — 2026-11-02
| | |
|---|---|
| Type | REVIEW |
| Outcome | COMPLETED |
| Branch | `tpb-cgc-orchestrate` |
| Name | SAL-462 |
| Session | `8b8a2119-ba2d-4b40-ae5b-983c27b60f3d` |
**In its own words (excerpt):**
**Short answer:** in QA, install **Consumer Goods Cloud `cgcloud` 264.2**, which is exactly what the SAL-491 link installs. Upgrade **Mobile Sync `cgc_sync` to its matching 264 version** at the same time, and move devices to **mobile app 264.x** (264.0005.00 is the current App Store build). Then rebuild the Modeler contracts for 264.

**About SAL-493:** Jira still shows it as **UAT** (last updated 31 Oct), not Done. If it has passed UAT, the ticket just needs moving to Done. I haven't changed it because this session is read-only. I'll treat it as finished from here on, so step 1 of the earlier plan is just the closing steps: merge the branch into `main` and tag the 260 baseline.

### What to install

| Component | QA today | Install | Status of the target |
|---|---|---|---|
| **Consumer Goods Cloud** (`cgcloud`) | Ver 260.2 (`04tKj000000Sba3IAC`) | **Ver 264.2**, link `04tg8000000Gb6rAAC` | **Confirmed:** I looked up that ID in QA. It is the Consumer Goods Cloud package, "Ver 264.2", Released, not beta. |
| **Mobile Sync** (`cgc_sync`) | Ver 260.2 (`04tKb000000tB8VIAU`) | **The matching 264 version** from Salesforce's Mobile Sync install page ([sf-industries.my.salesforce-sites.co

_[summary truncated — see the session record for the full text]_
<!-- orchestrate:session-state:end -->
