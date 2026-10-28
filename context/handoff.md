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
**Status:** at risk — Add Product crash root cause confirmed as code design flaw (wrong API call), not customer changes. Awaiting Build session for fix.

**Done this session**
- Confirmed customer page changes (16 files, Oct) did not cause Add Product crash
- Verified error occurred on pre-change app package (SAL-444, built 18 Sep) and post-change packages
- Ruled out customer data as factor; Add Product only reads product lookup, not customer fields
- Identified three likely reasons bug didn't surface in earlier tests (product pre-listed, Order vs Distribution, pre-v260 code)

**Open items**
- Main fix: replace Facade.getObjectAsync with BoFactory.loadObjectByParamsAsync in MyReplaceBoJobManager.AddProduct.bl.js line 97, or pass commitDate in query
- Safety check: add null check before reading lookup.text1; show clear error naming the product
- Optional: make price lookups in DsLuProduct_sf.datasource.xml optional for products with no current price
- Retest on iPad with STOKERS 31029 and FRE POUCHES products after fix deployed
- Post findings to SAL-493 (Jira ticket) as comment or review document

**Decisions**
- Root cause is code design flaw (wrong API call), not missing data or recent build
- Customer changes (Oct 21–27) are not the cause; error predates them
- Data reset will not fix this; code fix required

**Blockers**
- None

**Next**
- Schedule Build session to implement main fix (line 97 API call) and safety check (null check before lookup.text1)
- Post this session's findings to SAL-493
- After Build session deploys fix, retest on iPad with STOKERS 31029 and FRE POUCHES products

**Checked live on 2026-10-28:** the repository, the Salesforce org
### Last session — 2026-10-28
| | |
|---|---|
| Type | REVIEW |
| Outcome | COMPLETED |
| Branch | `tpb-cgc-orchestrate` |
| Name | CGC-Offline-App-SAL-493-Issue |
| Session | `5a090c4a-9ec9-4eab-8171-ce23094f9673` |
**In its own words (excerpt):**
Short answer: the customer page changes didn't break Add Product. The evidence shows the error was already happening on an app package built before any of those changes.

## 1. The changes don't touch Add Product
From `main` through the latest customer commit, 16 files changed. All of them are customer, store (POS), Review Capture or label files. None are product, Distribution, job manager or pricing files.

Add Product also doesn't read any customer data. It only looks up the product by its key, in `DsLuProduct_sf.datasource.xml`.

## 2. The error happened on the old app package
QA keeps a record of which app package each iPad had installed and when. Alice's iPad (iPad16,4):

| When (EDT) | What happened |
|---|---|
| 23 Sep | **SAL-444** package installed (built 18 Sep, before any of the October customer changes) |
| 21 Oct, 1:58 PM onwards | First Add Product errors. 20+ entries that day, **still on SAL-444** |
| 22 Oct, 10:34 AM | Same error again, **still on SAL-444** |
| 22 Oct, 10:38 AM | Only now is the newer package ("Deploy Test SAL-424 & 473") installed |

Your iPad (iPad13,18) got the newest package ("SAL-424 & 473 & Other Customer Fields") at 9:55 PM IST on 27 Oct, and

_[summary truncated — see the session record for the full text]_
<!-- orchestrate:session-state:end -->
