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
**Status:** on track — QA's CG Cloud is on **260.2**, the repo's offline contracts are built for **260.0**, and the next upgrade target is **264.2** (from subtask…

**Done this session**
- QA's CG Cloud is on **260.2**, the repo's offline contracts are built for **260.0**, and the next upgrade target is **264.2** (from subtask SAL-491, still To Do). This was a read-only review: I changed nothing in the org, Jira or the repo.…

**Open items**
- Open pull request from tpb-cgc-orchestrate to main
- Review and merge PR to main
- Build and publish offline app to QA
- Retest on iPad: start visit, add STOKERS 31029, go Store Cockpit → User Cockpit → back to Distribution to confirm product persists
- Decide on Fix 2: fill FRE POUCHES (694306, 694307) Field Valid From/Thru dates in QA if needed for retest
- Decide on Fix 3: optional—block products with missing dates at add time with error message
- Discard Santhosh Test2 visit with blank product rows from yesterday

**Decisions**
- Root cause: custom code created visit jobs only while Planned; standard creates them while In Progress too
- Fix 1: restore In Progress condition in GetSurveys.bl.js to match standard behavior
- Fix 2 (separate): fill missing Field Valid From/Thru dates for FRE POUCHES 694306 & 694307 in QA if they appear in retest
- Fix 3 (optional): block products with missing dates at add time with error message

**Blockers**
- None

**Next**
- Open pull request from tpb-cgc-orchestrate to main
- Review and merge PR
- Run Deploy session to build and publish offline app to QA
- Retest on iPad with STOKERS 31029; decide whether to include FRE POUCHES and apply Fix 2 if needed
- Verify in Modeler that added products persist after reopen

**Checked live on 2026-11-02:** Jira, the Salesforce org, the repository, the web
### Last session — 2026-11-02
| | |
|---|---|
| Type | REVIEW |
| Outcome | COMPLETED |
| Branch | `tpb-cgc-orchestrate` |
| Name | SAL-462 |
| Session | `8b8a2119-ba2d-4b40-ae5b-983c27b60f3d` |
**In its own words (excerpt):**
QA's CG Cloud is on **260.2**, the repo's offline contracts are built for **260.0**, and the next upgrade target is **264.2** (from subtask SAL-491, still To Do). This was a read-only review: I changed nothing in the org, Jira or the repo.

| | Status |
|---|---|
| QA `cgcloud` (Consumer Goods Cloud) | Ver 260.2 |
| QA `cgc_sync` (Mobile Sync) | Ver 260.2 |
| Modeler contracts (`src/package.xml`) | Built for 260.0 (both the mobile app and the managed package) |
| Target (SAL-491) | v264.2, installer link `04tg8000000Gb6rAAC` |
| Production | The ticket says v248.3. Only QA is connected, so I couldn't check this |
| SAL-461 (Apex compile blocker) | Done |
| SAL-493 (Distribution defect) | In UAT; the fixes are on `tpb-cgc-orchestrate` but not merged into `main` |
| SAL-462 subtasks (463–468, 491) | All To Do |

**What stands out**
1. **SAL-462 is out of date.** Its Labor Day window (5–7 Sep) has passed, it still lists the current version as v248.3, and the target is still marked [confirm].
2. **Production may need a big jump.** If production really is on 248.3, going to 264.2 means checking whether Salesforce requires upgrading in steps. You'd also need to work through the post-inst

_[summary truncated — see the session record for the full text]_
<!-- orchestrate:session-state:end -->
