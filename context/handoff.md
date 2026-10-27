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
### Engagement state — 2026-10-27
**Status:** at risk — Add Product crash in Distribution isolated to missing device data or query design flaw; not caused by recent build

**Done this session**
- Matched video crash to device logs: customized method addProduct fails on lookup.text1 undefined
- Located root cause in MyReplaceBoJobManager.AddProduct.bl.js lines 92–115
- Identified mismatch: product picker query vs product-details query join requirements
- Verified server data complete: products, price UoM, price conditions, system settings all present in QA
- Confirmed earlier Modeller Contracts Build session did not touch this code path

**Open items**
- Verify missing data on Alice's iPad: price condition, unit of measure, or system-setting record
- Test quick fix: full app data re-download/reset on iPad and retry Add Product
- Code fix: add null check before using lookup.text1 in addProduct method
- Code fix: make price-condition join optional in DsLuProduct_sf.datasource.xml (survey/distribution don't need price)
- Post findings to SAL-493 (Jira ticket) and/or write review document

**Decisions**
- Root cause is device-side missing data OR query design flaw, not the recent build
- Quick test (data reset) should be tried before code changes

**Blockers**
- Cannot read iPad device database from review session to confirm which record is missing

**Next**
- Execute quick test: full app data re-download on Alice's iPad, retry Add Product
- If quick test fixes it: document as device sync issue, close SAL-493
- If quick test fails: schedule Build session to implement both code fixes (null check + optional join)
- Post this review to SAL-493 as comment or document per your instruction

**Checked live on 2026-10-27:** Jira, the repository, the Salesforce org
### Last session — 2026-10-27
| | |
|---|---|
| Type | REVIEW |
| Outcome | COMPLETED |
| Branch | `tpb-cgc-orchestrate` |
| Name | CGC-Offline-App-SAL-493-Issue |
| Session | `5a090c4a-9ec9-4eab-8171-ce23094f9673` |
**In its own words (excerpt):**
I watched the video and found the matching error in the app's device logs in QA. The crash is in the Add Product step on the Distribution screen. The earlier Modeller Contracts Build session's commits didn't touch any part of that code.

## What the video shows (Alice Mctest, iPad, 23 Oct, 10:21–10:22 AM EDT)
1. She starts the visit at Retail Test Store Millie, opens **Product Distribution** and taps **Add Product**.
2. She ticks STOKERS 1.2 OZ CAN – LONG CUT WINTERGREEN (31029) and taps **Add**. The app shows **"Error occurred. Please ask your Administrator."**
3. Adding a product to an **order** in the same visit works.
4. She goes back to Distribution and adds several FRE POUCHES products. The same error appears.

## What the device logs say
At exactly those times, the app's log records in QA (Mobile App Log) show:

> `customized method addProduct failed during execution: undefined is not an object (evaluating 'lookup.text1')`
> Call stack: `BoJobManager.myAddProducts → BoJobManager.replaceAddProduct`

There are 19 of these errors in total, all from Alice, on 21 Oct and 23 Oct. No other user has logged this error.

## Root cause
- **Where it breaks:** `src/Call/BO/BoJobManager/M

_[summary truncated — see the session record for the full text]_
<!-- orchestrate:session-state:end -->
