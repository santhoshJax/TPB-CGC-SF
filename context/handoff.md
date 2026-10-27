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
**Status:** at risk — Add Product crash root cause confirmed: custom code path skips date lookup, returns empty product details. Needs Build session for fix.

**Done this session**
- Retest on second device (iPad13,18) and second user (Santhosh CGC) reproduced same error
- Identified root cause: MyReplaceBoJobManager.AddProduct.bl.js line 97 uses Facade.getObjectAsync instead of BoFactory.loadObjectByParamsAsync, skipping beforeLoadAsync date step
- Confirmed product-details query requires commitDate to match price records; without it, query returns empty result
- Verified this code path unchanged since first commit; Modeller Contracts Build did not cause it
- Ruled out device-specific or user-specific data issue; affects all products on all devices

**Open items**
- Main fix: replace Facade.getObjectAsync with BoFactory.loadObjectByParamsAsync in line 97, or pass commitDate in query
- Safety check: add null check before reading lookup.text1; show clear error naming the product
- Optional: make price lookups in DsLuProduct_sf.datasource.xml optional for products with no current price
- Retest on iPad with STOKERS 31029 and FRE POUCHES products after fix deployed
- Post findings to SAL-493 (Jira ticket) as comment or review document

**Decisions**
- Root cause is code design flaw (wrong API call), not missing data or recent build
- Data reset will not fix this; code fix required
- Quick test confirmed bug is reproducible and affects multiple devices/users

**Blockers**
- None

**Next**
- Schedule Build session to implement main fix (line 97 API call) and safety check (null check before lookup.text1)
- Post this session's findings to SAL-493
- After Build session deploys fix, retest on iPad with STOKERS 31029 and FRE POUCHES products

**Checked live on 2026-10-27:** the Salesforce org, the repository
### Last session — 2026-10-27
| | |
|---|---|
| Type | REVIEW |
| Outcome | COMPLETED |
| Branch | `tpb-cgc-orchestrate` |
| Name | CGC-Offline-App-SAL-493-Issue |
| Session | `5a090c4a-9ec9-4eab-8171-ce23094f9673` |
**In its own words (excerpt):**
Your retest helped, and it shows my earlier guess was wrong. The problem isn't missing data on Alice's iPad. It's a bug in the add-product code, so a data reset won't fix it.

## What your test showed
Your test tonight (about 9:57–10:00 PM IST) logged the same error three times in QA: `undefined is not an object (evaluating 'lookup.text1')`. It was logged on a different iPad (iPad13,18), under the user **Santhosh CGC**, not Alice. Either way, it's now two devices and two users with the same error, so it isn't a problem with one device.

## The real cause
The add-product step on the Distribution screen is in `src/Call/BO/BoJobManager/Mv1/MyReplaceBoJobManager.AddProduct.bl.js`. It's a custom copy of the standard step, and at line 97 it loads the product's details in a different way from the standard one:

| | How it loads the product details | Does it add today's date? |
|---|---|---|
| Standard step (`BoJobManager.AddProduct.bl.js`, line 96) | `BoFactory.loadObjectByParamsAsync("LuProduct", …)` | **Yes.** This call runs the lookup's `beforeLoadAsync` step, which adds today's date as `commitDate`. |
| Custom copy (line 97) | `Facade.getObjectAsync("LuProduct", …)` | **No.** This cal

_[summary truncated — see the session record for the full text]_
<!-- orchestrate:session-state:end -->
