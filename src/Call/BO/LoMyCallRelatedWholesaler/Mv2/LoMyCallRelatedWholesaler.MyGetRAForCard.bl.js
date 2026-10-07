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
 * @function myGetRAForCard
 * @this LoMyCallRelatedWholesaler
 * @kind listobject
 * @async
 * @namespace CUSTOM
 * @param {DomPKey} CallCustomerPKey
 * @param {DomInteger} numberOfListItems
 * @returns promise
 */
function myGetRAForCard(CallCustomerPKey, numberOfListItems){
    var me = this;
    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code below.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////
    var jsonQuery = {};
var jsonParams = [];

jsonParams.push({"field" : "customerPKey", "value" : CallCustomerPKey});
jsonQuery.params = jsonParams;

var promise = Facade.getListAsync(LO_MYCALLRELATEDWHOLESALER, jsonQuery).then(
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
    var newItemsList =[];
    var primaryItem = items.find(function fun(item) { return item.isPrimary === 1; });
    var secondaryItem = items.find(function fun(item) { return item.isPromotional === 1; });
    var customer ;
    var customerStatus ;
    if(Utils.isDefined(Framework.getProcessContext().customerDetail)){
      customer = Framework.getProcessContext().customerDetail;
      customerStatus = Framework.getProcessContext().customerDetail.getObjectStatus();
    }
    if(Utils.isDefined(primaryItem)){
      newItemsList.push(primaryItem);
      items.filter(
        function(item){
          return (item.isPromotional === 1 && item.wholesalerPKey != primaryItem.wholesalerPKey) || (item.isPromotional === 0 && item.isPrimary === 0);
        }).forEach(
        function(item){
          newItemsList.push(item);
        });
      
    }else{
      items.forEach(function(item){
        newItemsList.push(item);
      });
    }
    if(Utils.isDefined(customer)){
      if(Utils.isDefined(primaryItem)){
        if(customer.primaryWholesaler !== primaryItem.wholesalerPKey){
          Framework.getProcessContext().customerDetail.setPrimaryWholesaler(primaryItem.wholesalerPKey);
          Framework.getProcessContext().customerDetail.setObjectStatus(customerStatus | STATE.DIRTY);
        }
      }else{
        Framework.getProcessContext().customerDetail.setPrimaryWholesaler(' ');
        Framework.getProcessContext().customerDetail.setObjectStatus(customerStatus | STATE.DIRTY);
      }
      if(Utils.isDefined(secondaryItem) && Utils.isDefined(customer)){
        if(customer.promotionalWholesaler !== secondaryItem.wholesalerPKey){
          Framework.getProcessContext().customerDetail.setPromotionalWholesaler(secondaryItem.wholesalerPKey);
          Framework.getProcessContext().customerDetail.setObjectStatus(customerStatus | STATE.DIRTY);
        }
      }else{
        Framework.getProcessContext().customerDetail.setPromotionalWholesaler(' ');
        Framework.getProcessContext().customerDetail.setObjectStatus(customerStatus | STATE.DIRTY);
      }
    }
    
    newItemsList.sort(
      function compareType(item,elem){
        if(item.isPrimary === 1 && elem.isPrimary === 1){
          return item.wholesalerName.localeCompare(elem.wholesalerName);
        }else if(item.isPrimary === 1 ){
          return -1;
        }else if(elem.isPrimary === 1){
          return 1;
        }else if(item.isPromotional === 1 && elem.isPromotional === 1){
          return item.wholesalerName.localeCompare(elem.wholesalerName);
        }else if(item.isPromotional === 1){
          return -1;
        }else if(elem.isPromotional === 1){
          return 1;
        }else{
          return item.wholesalerName.localeCompare(elem.wholesalerName);
        }
      }
    );
    if(newItemsList.filter)
      
    me.cardItemCount = newItemsList.length;
    newItemsList = newItemsList.splice(0, numberOfOrders);
    me.removeAllItems();
    me.addItems(newItemsList, jsonQuery);
    //me.push(items);

    
    return me;
  });
    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code above.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////

    return promise;
}