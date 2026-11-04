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
**Status:** at risk — 7 log errors + tester found store-details bug blocking sales; null guards & config fixes needed before 264 upgrade

**Done this session**
- Reviewed offline app testing notes (3 Nov); matched 5 tester-found issues to 7 SYNC.log error patterns
- Confirmed store-details-disappearing and license-validation failures are root cause of sales block
- Linked navigateToCustomer crash to missing mainAddress data in offline store creation

**Open items**
- Add null guard for lookup.text1 in BoJobManager.myAddProducts (error #1, ~10 stack traces)
- Add null check for mainAddress.getLatitude in BoCustomer.navigateToCustomer (error #6, confirmed by tester)
- Review Order::ItemListTab screen config; HeaderTab variable undefined (error #2, 17 occurrences)
- Check customization registrations for replaceGetSurveys, replaceSetEARight, myInitializeItemWholesaler (errors #4–5)
- Verify customerDetail toggle field bindings and data for reasonNotVisited, prohibitVisit, acceptsMobileCoupons, type (error #3, ~40 occurrences)
- Investigate offline app store creation: how address, license, resale number, FEIN are saved to offline database
- Send filtered Application.log (grep ';ERROR;') to check for sync/HTTP failures not in SYNC.log
- Merge SAL-493 branch (tpb-cgc-orchestrate) into main and tag 260 baseline

**Decisions**
- Root cause of SAL-462: custom code created visit jobs only while Planned; standard creates them while In Progress
- Fix 1: restore In Progress condition in GetSurveys.bl.js
- Fix 2: fill missing Field Valid From/Thru dates for FRE POUCHES 694306 & 694307 if they appear in retest
- SAL-493 treated as finished; closing steps are merge and tag
- Errors #1, #2, #4, #5, #6 are blocking issues; must fix before 264 upgrade
- Store-details-disappearing issue is business-blocking (prevents sales); raise/update defect with 3 Nov 16:41–16:59 UTC timestamps

**Blockers**
- 7 error patterns in SYNC.log prevent safe upgrade to 264 until fixed (null guards, config mismatches, registration issues)
- Offline store creation does not persist address and license fields; causes cascading failures on every screen that reads them
- Application.log contains live OAuth token and device ID; must redact before wider sharing

**Next**
- Fix null guards in addProductsLogic (lookup.text1) and navigateToCustomer (mainAddress.getLatitude)
- Review Order::ItemListTab screen config for HeaderTab variable definition
- Audit customization registrations for replaceGetSurveys, replaceSetEARight, myInitializeItemWholesaler
- Debug offline store creation flow: trace address, license, resale, FEIN from UI entry to offline database
- Send filtered Application.log extract (grep ';ERROR;') to confirm no additional sync/HTTP failures
- Retest with fixes applied; tester will verify 200 items sync as in stock and out-of-stock test clears distribution

**Checked live on 2026-11-04:** the Salesforce org, the repository
### Last session — 2026-11-04
| | |
|---|---|
| Type | GENERAL |
| Outcome | COMPLETED |
| Branch | `tpb-cgc-orchestrate` |
| Name | TPB-CGC-Trace-Logs-Review-4-Nov-2026 |
| Session | `ead177c5-3ce5-4384-8ba1-751a676e63f3` |
**In its own words (excerpt):**
# Issues in the Offline App Testing notes (3 Nov 2026)

The document is a transcript of a tester's voice memo (about 18 minutes, starting 11:41 AM). The tester created new test stores and ran visits and orders in the offline app. The tester found one thing that works now and five things that don't.

## What now works
- Creating a new store offline used to fail and now succeeds.
- Adding about 200 items to distribution worked. The tester will check overnight that all 200 sync as "in stock".
- Promotions (for example $5 off and $2 off per roll) calculated correctly in the order preview.
- Creating and completing tasks worked.

## What's broken, in simple words

**1. Store details disappear (the biggest problem).**
- The tester enters the address, tobacco license, resale number and FEIN when creating the store. On the Store Cockpit screen, all of that is blank.
- The same details still show under "My Day".
- In the Customers list, tapping a store makes its name and all its info vanish. Going back and reopening the list brings the names back.
- This happened with several test stores (Birdie, Millie, Kelly, and others).
- In plain terms, the app has the data but the customer screen can'

_[summary truncated — see the session record for the full text]_
<!-- orchestrate:session-state:end -->
