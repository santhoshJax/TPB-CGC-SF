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
 * @function myGetAllForCard
 * @this LoMyCallProductPromotion
 * @kind listobject
 * @async
 * @namespace CUSTOM
 * @param {DomInteger} numberOfListItems
 * @param {String} currentCustomerPKey
 * @param {DomBool} getAll
 * @returns promise
 */
function myGetAllForCard(numberOfListItems, currentCustomerPKey, getAll){
    var me = this;
    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code below.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////
    
var jsonQuery = {};
var jsonParams = [];
var minDate = Utils.convertForDBParam(Utils.addDays2AnsiDate(Utils.createAnsiDateToday(),-30), 'DomDate');
me.removeAllItems();


jsonParams.push({"field" : "customerPKey", "value" : currentCustomerPKey});
jsonParams.push({"field" : "mindate", "value" : minDate});
jsonQuery.params = jsonParams;

var monthToString = ['January','February','March','April','May','June','July','August','September','October','November','December'];

var promise = Facade.getListAsync(LO_MYCALLPRODUCTPROMOTION, jsonQuery).then(
  function (items){
    var numberOfOrders;
    if(!Utils.isDefined(numberOfListItems)){
      numberOfOrders = 5;
      if(Utils.isPhone()){
        numberOfOrders = 3;
      }
    } else{
      numberOfOrders = numberOfListItems;
    }
    // sum as month
    items.forEach(function (item){
      // month
      if(!Utils.isEmptyString(item.monthDate)){
        var date = Utils.createDateByMilliSec(item.monthDate+'000');
        item.monthString = monthToString[date.getMonth()];
      }
      // wholesaler
      if(!Utils.isEmptyString(item.wholesalerName)){
        item.wholesalerName = item.wholesalerName.split('|')[0];
      }
      if((item.uom == "SalesUnit") || (item.uom == "Sales Unit"))
      {
        item.uom = "Carton";
      }
      else if((item.uom == "ConsumerUnit") || (item.uom == "Consumer Unit"))
      {
        item.uom = "Each";
      }
      else if(item.uom == "Layer")
      {
        item.uom = "Case";
      }
      else {
        item.uom = item.uom;
      }
      item.combinKey = item.wholesalerName + item.monthString + item.uom + item.productName;
    });
    var newItems = [];
    var existedcombinKeys = new Set();
    items.forEach(function (item){
      if (existedcombinKeys.has(item.combinKey)) {
        newItems.forEach(function (newItem){
          if(newItem.combinKey === item.combinKey){
            newItem.quantityOrdered += item.quantityOrdered;
          }
        });
      }else{
        existedcombinKeys.add(item.combinKey);
        newItems.push(item);
      }
    });
    newItems.sort(
      function compareType(item,elem){
        var dateItem = Utils.createDateByMilliSec(item.monthDate+'000').getMonth();
        var dateElem = Utils.createDateByMilliSec(elem.monthDate+'000').getMonth();
        if(dateItem>dateElem){
          return 1;
        }else if(dateItem<dateElem){
          return -1;
        }else{
          return item.productName.localeCompare(elem.productName);
        }
      }
    );
    me.cardItemCount = newItems.length;
    if(getAll !== "1" ){
      newItems = newItems.splice(0, numberOfOrders);
    }
    me.addItems(newItems, jsonQuery);
    return me;
  });

    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code above.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////

    return promise;
}