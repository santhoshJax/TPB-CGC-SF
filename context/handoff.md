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
### Engagement state — 2026-11-04
**Status:** at risk — 7 error patterns found in SYNC.log (27 Oct–3 Nov); null guards and config mismatches need fixes before 264 upgrade

**Done this session**
- Reviewed SYNC.log (23.7 MB, 27 Oct–3 Nov); identified 7 error patterns with root causes
- Confirmed 2 errors also appear in Application.log sample; sync health looks normal on 2 Nov 21:07

**Open items**
- Add null guard for lookup.text1 in BoJobManager.myAddProducts (error #1, ~10 stack traces)
- Add null check for mainAddress.getLatitude in BoCustomer.navigateToCustomer (error #6)
- Review Order::ItemListTab screen config; HeaderTab variable undefined (error #2, 17 occurrences)
- Check customization registrations for replaceGetSurveys, replaceSetEARight, myInitializeItemWholesaler (errors #4–5)
- Verify customerDetail toggle field bindings and data for reasonNotVisited, prohibitVisit, acceptsMobileCoupons, type (error #3, ~40 occurrences)
- Check product picklist/lookup data for missing values causing addProductsLogic failures
- Send filtered Application.log (grep ';ERROR;') to check for sync/HTTP failures not in SYNC.log
- Merge SAL-493 branch (tpb-cgc-orchestrate) into main and tag 260 baseline

**Decisions**
- Root cause of SAL-462: custom code created visit jobs only while Planned; standard creates them while In Progress
- Fix 1: restore In Progress condition in GetSurveys.bl.js
- Fix 2: fill missing Field Valid From/Thru dates for FRE POUCHES 694306 & 694307 if they appear in retest
- SAL-493 treated as finished; closing steps are merge and tag
- Errors #1, #2, #4, #5, #6 are blocking issues; must fix before 264 upgrade

**Blockers**
- 7 error patterns in SYNC.log prevent safe upgrade to 264 until fixed (null guards, config mismatches, registration issues)
- Application.log contains live OAuth token and device ID; must redact before wider sharing

**Next**
- Fix null guards in addProductsLogic (lookup.text1) and navigateToCustomer (mainAddress.getLatitude)
- Review Order::ItemListTab screen config for HeaderTab variable definition
- Audit customization registrations for replaceGetSurveys, replaceSetEARight, myInitializeItemWholesaler
- Verify customerDetail toggle bindings and customer record data
- Send filtered Application.log extract to confirm no additional sync/HTTP failures
- Retest on current version with fixes applied before proceeding to 264 upgrade

**Checked live on 2026-11-04:** nothing — the status above is as recorded, not re-checked
### Last session — 2026-11-04
| | |
|---|---|
| Type | GENERAL |
| Outcome | COMPLETED |
| Branch | `tpb-cgc-orchestrate` |
| Name | TPB-CGC-Trace-Logs-Review-4-Nov-2026 |
| Session | `ead177c5-3ce5-4384-8ba1-751a676e63f3` |
**In its own words (excerpt):**
I could review the SYNC.log in full, but only the first 20 KB (about 0.1%) of the 23.7 MB Application.log. There is no local copy of that file, so reading all of it through the file tool would take around 24 paged reads of about 250k tokens each. If you can send a filtered extract, I can cover the rest. For example, `grep ";ERROR;" Application.log` should cut it to a small file.

## SYNC.log: errors found (all `Error` level, 27 Oct – 3 Nov 2026)

| # | Error | Code | Count | When (UTC) | Likely cause |
|---|---|---|---|---|---|
| 1 | `action addProductsLogic failed … undefined is not an object (evaluating 'lookup.text1')` in `BoJobManager.myAddProducts` → `replaceAddProduct` (recursive), followed by `customized method addProduct failed` | 00000351 / 00000003 | about 10 stack traces plus 7 follow-on entries | 27 Oct, 19:07–19:10 and 20:39–20:43. The repeat suppression kicked in at 19:08 and again 30 Oct 17:33. | A product lookup returned no record when the add-products customization read `.text1` from it. This is probably a picklist or lookup value missing from the synced data or the mobile app picklist repo. The code needs a null guard. |
| 2 | `Can't find variable: HeaderTab … in 

_[summary truncated — see the session record for the full text]_
<!-- orchestrate:session-state:end -->
