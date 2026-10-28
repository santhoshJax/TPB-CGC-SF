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
**Status:** at risk — Root cause confirmed & fix specified; awaiting Build session to implement line 97 API call change

**Done this session**
- Line-by-line comparison of standard vs custom AddProduct files confirmed single cause
- Verified Facade.getObjectAsync skips BeforeLoadAsync preparation (no commitDate injection)
- Confirmed all other LuProduct callers use BoFactory.loadObjectByParamsAsync; custom Distribution copy is unique outlier
- Ruled out all other differences in custom copy as unrelated to the issue

**Open items**
- Implement fix: change line 97 in MyReplaceBoJobManager.AddProduct.bl.js to BoFactory.loadObjectByParamsAsync("LuProduct", jsonQuery)
- Add null check before reading lookup.text1 with clear error naming the product (defensive best practice)
- Post findings to SAL-493 (Jira ticket) as comment or review document
- After Build deploys fix, retest on iPad with STOKERS 31029 and FRE POUCHES products
- After Build deploys fix, retest in Modeler to confirm product names, GTIN, Category fill in correctly
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

**Checked live on 2026-10-28:** nothing — the status above is as recorded, not re-checked
### Last session — 2026-10-28
| | |
|---|---|
| Type | REVIEW |
| Outcome | COMPLETED |
| Branch | `tpb-cgc-orchestrate` |
| Name | CGC-Offline-App-SAL-493-Issue |
| Session | `5a090c4a-9ec9-4eab-8171-ce23094f9673` |
**In its own words (excerpt):**
Yes. I compared the standard file (`BoJobManager.AddProduct.bl.js`) with the custom copy (`MyReplaceBoJobManager.AddProduct.bl.js`) line by line again on the `tpb-cgc-orchestrate` branch. Exactly one difference causes this issue. All the others are unrelated.

## The change that causes the issue

| | Standard copy (line 96) | Custom copy (line 97) |
|---|---|---|
| Product lookup call | `BoFactory.loadObjectByParamsAsync("LuProduct", jsonQuery)` | `Facade.getObjectAsync("LuProduct", jsonQuery)` |
| Runs the lookup's preparation step? | Yes | No |
| Today's date (`commitDate`) added? | Yes, by `LuProduct.BeforeLoadAsync.bl.js` lines 49–55 | No, so the SQL says `Valid_From__c <= Date` |

Both copies send the same query: only the product key. The only thing that differs is which call sends it.

**More evidence:** I checked every other place in the repository that loads `LuProduct`: Contract add product, Truck Load add item, and the two Inventory Document add-product steps. All four use `BoFactory.loadObjectByParamsAsync`. The custom Distribution copy is the only one that uses `Facade.getObjectAsync`. There's also no custom version of the product lookup, its preparation step or its que

_[summary truncated — see the session record for the full text]_
<!-- orchestrate:session-state:end -->
