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
**Status:** at risk — App version still unknown; 7 blocking errors + store-details bug remain unfixed. Session answered log question only.

**Done this session**
- Confirmed SYNC.log contains no app version or build info
- Identified that Application.log version line may be rotated out; provided 3 methods to retrieve it

**Open items**
- Add null guard for lookup.text1 in BoJobManager.myAddProducts (error #1, ~10 stack traces)
- Add null check for mainAddress.getLatitude in BoCustomer.navigateToCustomer (error #6)
- Review Order::ItemListTab screen config; HeaderTab variable undefined (error #2, 17 occurrences)
- Check customization registrations for replaceGetSurveys, replaceSetEARight, myInitializeItemWholesaler (errors #4–5)
- Verify customerDetail toggle field bindings for reasonNotVisited, prohibitVisit, acceptsMobileCoupons, type (error #3, ~40 occurrences)
- Investigate offline app store creation: how address, license, resale number, FEIN are saved to offline database
- Send filtered Application.log (grep ';ERROR;') to check for sync/HTTP failures not in SYNC.log
- Retrieve app version via grep, device Settings, or tester/admin; redact OAuth token before sharing

**Decisions**
- Root cause of SAL-462: custom code created visit jobs only while Planned; standard creates them while In Progress
- Fix 1: restore In Progress condition in GetSurveys.bl.js
- Fix 2: fill missing Field Valid From/Thru dates for FRE POUCHES 694306 & 694307 if they appear in retest
- SAL-493 treated as finished; closing steps are merge and tag
- Errors #1, #2, #4, #5, #6 are blocking issues; must fix before 264 upgrade
- Store-details-disappearing issue is business-blocking; raise/update defect with 3 Nov 16:41–16:59 UTC timestamps

**Blockers**
- 7 error patterns in SYNC.log prevent safe upgrade to 264 until fixed (null guards, config mismatches, registration issues)
- Offline store creation does not persist address and license fields; causes cascading failures on every screen that reads them
- Application.log contains live OAuth token and device ID; must redact before wider sharing

**Next**
- Retrieve app version using grep filter, device Settings, or tester/admin; share filtered result
- Fix null guards in addProductsLogic (lookup.text1) and navigateToCustomer (mainAddress.getLatitude)
- Review Order::ItemListTab screen config for HeaderTab variable definition
- Audit customization registrations for replaceGetSurveys, replaceSetEARight, myInitializeItemWholesaler
- Debug offline store creation flow: trace address, license, resale, FEIN from UI entry to offline database
- Retest with fixes applied; tester will verify 200 items sync as in stock and out-of-stock test clears distribution

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
I couldn't find an app version in the parts of the logs I can read.

**SYNC.log (all 28 KB read):** it has no version or build information. Each entry has only the timestamp, level, event code, namespace, message and sync ID.

**Application.log (first 30 KB of 23.7 MB read):** there is no app version or build number there either. The lines that look like versions are not the app version:

| Value in the log | What it is |
|---|---|
| `salesforce-toolkit-rest-javascript/v65.0` | The Salesforce REST toolkit version, sent as the `X-User-Agent` header |
| `/services/data/v65.0/composite` | The Salesforce API version, which is Winter '26 |
| `/services/apexrest/cgc_sync/v1/...` | The version of the custom `cgc_sync` sync API |
| `client-app-id: TquilaONE` | The app identifier, not a version |
| `device-id: b397ff8f-0b16-482d-b15a-f05990152bc4` | The test device |
| `sync-id: f367c960-7b33-4657-99df-b5b046231241` | The 2 Nov 21:07 UTC sync |

The log shows the app starting at 2026-11-02 16:54:59 UTC ("App has started"). Even so, that line carries no version.

The other 99.9% of Application.log might still hold one. Apps usually log the version once at launch, in a device or app info bloc

_[summary truncated — see the session record for the full text]_
<!-- orchestrate:session-state:end -->
