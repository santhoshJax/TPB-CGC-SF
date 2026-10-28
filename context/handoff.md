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
### Engagement state — 2026-10-28
**Status:** at risk — Fix 1 committed & pushed (commit 6b57d2a); Fix 2 needed for FRE POUCHES dates; awaiting PR, merge, build & iPad retest

**Done this session**
- Implemented Fix 1: restored BoFactory.loadObjectByParamsAsync in GetSurveys.bl.js line 72 to create visit jobs while In Progress
- Committed to branch 6b57d2a with updated file
- Pushed to GitHub tpb-cgc-orchestrate branch

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

**Checked live on 2026-10-28:** the repository
### Last session — 2026-10-28
| | |
|---|---|
| Type | BUILD |
| Outcome | COMPLETED |
| Branch | `tpb-cgc-orchestrate` |
| Name | CGC-Offline-App-SAL-493-Issue-Build |
| Session | `00cafbd0-9e51-4773-bb9a-0d2ae03c4097` |
**In its own words (excerpt):**
━━ Build status (auto-checked from tool results — deploy = sf CLI exit, not runtime effect) ━━
• Code committed: yes (branch 6b57d2a)
• Pushed to GitHub: yes
• Validated (sf deploy validate): NOT verified
• Deployed to org: no deploy in this session run — if an earlier run deployed, verify in the target org
Next: open/refresh the PR → review → merge to main → run a Deploy session to ship. This work is NOT live yet.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

I pushed Fix 1 to `tpb-cgc-orchestrate`. On GitHub the branch now points at commit `6b57d2a`, and the file there has the new condition. I didn't open a PR or change any org data.

**What changed:** In `MyReplaceBoJobManager.GetSurveys.bl.js`, line 72 used to create visit jobs only while the visit was **Planned**. It now also creates them while the visit is **In Progress**, which is what the standard file does. Products you add after tapping Start now get visit jobs behind them, so they should be saved and come back when you reopen the visit. I left the custom parts of the file alone: added products are still marked Distributed automatically, and scanner/manual tracking still works.

**Not done yet:** Your team still needs 

_[summary truncated — see the session record for the full text]_
<!-- orchestrate:session-state:end -->
