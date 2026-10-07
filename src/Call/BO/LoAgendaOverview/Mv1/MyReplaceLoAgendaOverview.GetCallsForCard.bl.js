"use strict";

///////////////////////////////////////////////////////////////////////////////////////////////
//                 IMPORTANT - DO NOT MODIFY AUTO-GENERATED CODE OR COMMENTS                 //
//Parts of this file are auto-generated and modifications to those sections will be          //
//overwritten. You are allowed to modify:                                                    //
// - the tags in the jsDoc as described in the corresponding section                         //
// - the function name and its parameters                                                    //
// - the function body between the insertion ranges                                          //
//         "Add your customizing javaScript code below / above"                              //
//                                                                                           //
// NOTE:                                                                                     //
// - If you have created PRE and POST functions, they will be executed in the same order     //
//   as before.                                                                              //
// - If you have created a REPLACE to override core function, only the REPLACE function will //
//   be executed. PRE and POST functions will be executed in the same order as before.       //
//                                                                                           //
// - For new customizations, you can directly modify this file. There is no need to use the  //
//   PRE, POST, and REPLACE functions.                                                       //
//                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Use the following jsDoc tags to describe the BL function. Setting these tags will
 * change the runtime behavior in the mobile app. The values specified in the tags determine
 * the name of the contract file. The filename format is “@this . @function .bl.js”.
 * For example, LoVisit.BeforeLoadAsync.bl.js
 * -> function: Name of the businessLogic function.
 * -> this: The LO, BO, or LU object that this function belongs to (and it is part of the filename).
 * -> kind: Type of object this function belongs to. Most common value is "businessobject".
 * -> async: If declared as async then the function should return a promise.
 * -> param: List of parameters the function accepts. Make sure the parameters match the function signature.
 * -> namespace: Use CORE or CUSTOM. If you are a Salesforce client or an implementation partner, always use CUSTOM to enable a seamless release upgrade.
 * -> maxRuntime: Maximum time this function is allowed to run, takes integer value in ms. If the max time is exceeded, error is logged.
 * -> returns: Type and variable name in which the return value is stored.
 * @function replaceGetCallsForCard
 * @this LoAgendaOverview
 * @kind listobject
 * @namespace CUSTOM
 * @param {String} setDateFunction
 * @param {String} filterCalls
 * @param {Date} currentDate
 * @param {String} currentResponsiblePKey
 * @param {DomInteger} numberOfListItems
 * @param {DomBool} Visits_DataLoaded
 * @param {DomBool} CardVisits_refreshRelatedData
 * @param {String} includeDailyReport
 * @returns promise
 */
function replaceGetCallsForCard(setDateFunction, filterCalls, currentDate, currentResponsiblePKey, numberOfListItems, Visits_DataLoaded, CardVisits_refreshRelatedData, includeDailyReport){
    var me = this;
    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code below.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////
    var promise = when.resolve();

if(!Utils.isDefined(currentDate)){
  currentDate = Utils.createAnsiDateTimeToday();
}
var numberVisibleCalls;
if(!Utils.isDefined(numberOfListItems)){
  numberVisibleCalls = 5;
  if(Utils.isPhone()){
    numberVisibleCalls = 3;
  }
} else{
  numberVisibleCalls = numberOfListItems;
}

var filterDate;
if (Utils.isSfBackend()) {
  filterDate = currentDate;
} else {
  filterDate = Utils.createAnsiDateTimeNow(currentDate);
}

me.setFilter("dateFrom", filterDate, "EQ");
var items = me.getItemObjects();
promise = me.getCallsByDate(setDateFunction, filterCalls,  currentDate, currentDate, currentResponsiblePKey, numberVisibleCalls, undefined, includeDailyReport).then(
  function (calls) {
    // Keep visit title stable when account-derived name is temporarily unavailable.
    var items = me.getItemObjects();
    if (Utils.isDefined(items) && items.length > 0) {
      items.forEach(function(item) {
        if (Utils.isDefined(item) && Utils.isEmptyString(item.name) && !Utils.isEmptyString(item.subject)) {
          item.name = item.subject;
        }
      });
    }
    me.resetFilter("dateFrom");
  });

    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code above.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////

    return promise;
}