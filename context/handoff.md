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
**Status:** at risk — Root cause confirmed: custom code uses Facade.getObjectAsync (skips commitDate). Fix: restore BoFactory.loadObjectByParamsAsync on line 97.

**Done this session**
- Confirmed standard code adds commitDate via BeforeLoadAsync preparation step
- Identified exact change in custom copy: line 97 Facade.getObjectAsync instead of BoFactory.loadObjectByParamsAsync
- Verified one-word fix restores standard behaviour without manual date passing
- Ruled out need for optional price-join change; safety check still recommended

**Open items**
- Main fix: change line 97 in MyReplaceBoJobManager.AddProduct.bl.js to BoFactory.loadObjectByParamsAsync("LuProduct", jsonQuery)
- Safety check: add null check before reading lookup.text1; show clear error naming the product
- Retest on iPad with STOKERS 31029 and FRE POUCHES products after fix deployed
- Retest in Modeler to confirm product names, GTIN, Category fill in correctly
- Post findings to SAL-493 (Jira ticket) as comment or review document
- Discard Santhosh Test2 visit with blank product rows from yesterday's test
- Ask team why custom copy switched to Facade.getObjectAsync (may inform whether to keep fallback)

**Decisions**
- Root cause is code design flaw: custom copy replaced standard API call with one that skips commitDate injection
- Customer changes (Oct 21–27) are not the cause; error predates them
- Data reset will not fix this; code fix required
- Fix is one-word change: restore BoFactory.loadObjectByParamsAsync; no manual date passing needed
- Standard code does not have null check either, but adding one is defensive best practice

**Blockers**
- None

**Next**
- Schedule Build session to implement line 97 API call change and safety check (null before lookup.text1)
- Post this session's findings to SAL-493
- After Build deploys fix, retest on iPad with STOKERS 31029 and FRE POUCHES products
- After Build deploys fix, retest in Modeler to confirm product details populate

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
You're right: the standard code does work, and it already passes today's date. You don't need to add anything new. The custom copy dropped the line that gets the date passed, and the fix is to put the standard way back.

## How the standard code does it

When you pick a product on Distribution, two pieces of code are involved.

1. **The standard add-product step**, `BoJobManager.AddProduct.bl.js` (`@namespace CORE`), line 96:
   ```js
   promise = BoFactory.loadObjectByParamsAsync("LuProduct", jsonQuery)
   ```
   It sends only the product key, the same as the custom copy.

2. **The standard product lookup's preparation step**, `LuProduct.BeforeLoadAsync.bl.js` (`@namespace CORE`), lines 49–55:
   ```js
   // If commitDate parameter is not present, add it.
   if (jsonParams && jsonParams.length === 1) {
     jsonParams.push({ field: "commitDate", operator: "EQ",
                       value: Utils.createAnsiDateToday() });
   }
   ```
   `BoFactory.loadObjectByParamsAsync` runs this step before the query, so today's date is added automatically. The product query (`DsLuProduct_sf.datasource.xml`, lines 42–43 and 76) then gets the date it needs to find the current price record.

So i

_[summary truncated — see the session record for the full text]_
<!-- orchestrate:session-state:end -->
