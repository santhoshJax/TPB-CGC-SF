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
**Status:** at risk — Root cause confirmed: missing commitDate in Add Product query. Code fix needed before retest.

**Done this session**
- Confirmed root cause: Facade.getObjectAsync on line 97 skips BeforeLoadAsync, missing commitDate parameter
- Identified why error manifests differently in Modeler (blank rows) vs iPad (crash on lookup.text1)
- Verified fix approach: use BoFactory.loadObjectByParamsAsync or add commitDate to query

**Open items**
- Main fix: replace Facade.getObjectAsync with BoFactory.loadObjectByParamsAsync in MyReplaceBoJobManager.AddProduct.bl.js line 97
- Safety check: add null check before reading lookup.text1; show clear error naming the product
- Optional: make price lookups in DsLuProduct_sf.datasource.xml optional for products with no current price
- Retest on iPad with STOKERS 31029 and FRE POUCHES products after fix deployed
- Retest in Modeler to confirm product names, GTIN, Category fill in correctly
- Post findings to SAL-493 (Jira ticket) as comment or review document
- Discard Santhosh Test2 visit with blank product rows from yesterday's test

**Decisions**
- Root cause is code design flaw (wrong API call missing commitDate), not customer changes or data
- Customer changes (Oct 21–27) are not the cause; error predates them
- Data reset will not fix this; code fix required
- Latest contracts turned crash into silent blank rows, which is worse UX

**Blockers**
- None

**Next**
- Schedule Build session to implement main fix (line 97 API call) and safety check (null check before lookup.text1)
- Post this session's findings to SAL-493
- After Build session deploys fix, retest on iPad with STOKERS 31029 and FRE POUCHES products
- After Build session deploys fix, retest in Modeler to confirm product details populate

**Checked live on 2026-10-28:** the repository
### Last session — 2026-10-28
| | |
|---|---|
| Type | REVIEW |
| Outcome | COMPLETED |
| Branch | `tpb-cgc-orchestrate` |
| Name | CGC-Offline-App-SAL-493-Issue |
| Session | `5a090c4a-9ec9-4eab-8171-ce23094f9673` |
**In its own words (excerpt):**
This is the same bug as on the iPad. The Offline Modeler's newer contracts just show it differently, and your log line tells us exactly where it fails.

## What the error means
The product-details query in `src/Product/DS/DsLuProduct_sf.datasource.xml` looks up the product's current price with:

```
#compareAsDate('Product_Condition__c.Valid_From__c', 'Date', '<=', #commitDate#, 'Date')#
#compareAsDate('Product_Condition__c.Valid_Thru__c', 'Date', '>=', #commitDate#, 'Date')#
```

It needs a `commitDate` value (today's date). The custom add-product step (`MyReplaceBoJobManager.AddProduct.bl.js`, line 97) calls `Facade.getObjectAsync("LuProduct", …)` and passes only `pKey`. That call skips `LuProduct.BeforeLoadAsync.bl.js`, which is the code that adds `commitDate` when it's missing (line 49).

Without that value the date comparison is built wrongly. The SQL that reaches SQLite ends up treating the word `Date` as a column name, so you get **"no such column: Date"**. This is the same missing date I found last time. Your log now shows it directly.

## Why the screenshot looks different from the iPad
- **iPad:** the failed query comes back empty, the code then reads `lookup.text1`, and 

_[summary truncated — see the session record for the full text]_
<!-- orchestrate:session-state:end -->
