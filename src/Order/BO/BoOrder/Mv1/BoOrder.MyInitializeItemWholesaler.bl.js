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
 * @function myInitializeItemWholesaler
 * @this BoOrder
 * @kind businessobject
 * @async
 * @namespace CUSTOM
 * @returns promise
 */
function myInitializeItemWholesaler(){
    var me = this;
    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code below.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////
    
var orderItems = me.loItems.getAllItems();
var customerPKey = me.getOrdererPKey();

function prepareWholesalerInfoForItem(extras) {
  return;
}

//var addCond = "RA.Type__c = 'Primary'";
var jsonQuery = {
  params: [],
};
jsonQuery.params.push({ field: "queryType", value: "ALL_PRIMARY" });
jsonQuery.params.push({ field: "onlyRelated", value: "1" });
jsonQuery.params.push({ field: "customerPKey", value: customerPKey });

var promise = Facade.getListAsync(LO_MYORDERITEMEXTRA, jsonQuery).then(
  function prepareWholesalerInfoForItems(extras) {
    if (Utils.isDefined(extras)) {
      var prdWsMap = {}; // map prdId => [wsRecord]
      var defaultPriWsId = '';
      var defaultPriWsName = '';
      var defaultPriWsSupplierId = '';

      for (var i=0; i<extras.length; i++) {
        var it = extras[i];
        if (!Utils.isDefined(prdWsMap[it.prdPKey])) {
          prdWsMap[it.prdPKey] = [it];
        } else {
          prdWsMap[it.prdPKey].push(it);
        }
        if (Utils.isEmptyString(defaultPriWsId) && it.wholesaler) {
          defaultPriWsId = it.wholesalerPKey;
          defaultPriWsName = it.wholesaler;
          defaultPriWsSupplierId = it.supplierId;
        }
      }

      orderItems
        .filter(function (item) {
          return item.type === "Prebook";
        })
        .forEach(function (orderItem) {
          var ws = prdWsMap[orderItem.prdMainPKey];

          if (Utils.isEmptyString(orderItem.getWsName())) {
            // first matched wholesaler is filtered as Primary, so just use it if exists
            if (Array.isArray(ws) && Utils.isDefined(ws[0])) {
              me.loItems.mySetWholesalerInfo(orderItem, ws[0].APpKey || '', ws[0].wholesalerPKey, ws[0].wholesaler, ws[0].sku || '', ws[0].supplierId);
            } else {
              me.loItems.mySetWholesalerInfo(orderItem, '', defaultPriWsId, defaultPriWsName, '', defaultPriWsSupplierId);
            }
          }
          else {
            // there is no field value for wsNameDisplay since it's a derived field from nothing in Ds
            orderItem.setWsNameDisplay(orderItem.getWsName().split('|')[0]);
          }
        });
    }
  }
);

    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code above.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////

    return promise;
}