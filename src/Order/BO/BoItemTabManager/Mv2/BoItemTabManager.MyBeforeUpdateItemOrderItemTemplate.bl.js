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
 * @function myBeforeUpdateItemOrderItemTemplate
 * @this BoItemTabManager
 * @kind businessobject
 * @namespace CUSTOM
 * @param {Object} orderItem
 */
function myBeforeUpdateItemOrderItemTemplate(orderItem){
    var me = this;
    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code below.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////
    
var loItems = me.getBoOrder().getLoItems();
var orderItem = loItems.getCurrent();
var typeSet = new Set();

var dictProductForAdd = me.getBoOrder().getProductForAddDict();
var currentProduct = dictProductForAdd.get(orderItem.prdMainPKey);

me.backupOrderItem = {
  pKey: orderItem.pKey,
  type: orderItem.type,
  refPKey: orderItem.refPKey,
  prdMainPKey: orderItem.prdMainPKey, // Order_Item__c.Product__c
  sdoMainPKey: orderItem.sdoMainPKey, // Order_Item__c.Order__c
  sdoItemMetaPKey: orderItem.sdoItemMetaPKey, // Order_Item__c.Order_Item_Template__c
  sdoParentItemPKey: orderItem.sdoParentItemPKey, // Order_Item__c.Parent_Order_Item__c
};

loItems.forEach(function (item) {
  if (orderItem.getPrdMainPKey() === item.getPrdMainPKey() && orderItem.promotionPKey === item.promotionPKey) {
    typeSet.add(item.getType());
  }
});

// NOTICE: "NOT IN" is currently not supported by framework
// me.orderItemMetaCond = [{ id: Array.from(typeSet), op: "NOT IN" }];

// delete the types of not orderabled from ui
if (currentProduct.cashSaleOrderable == '0') {
  typeSet.add('Cash Sale');
}
if (currentProduct.prebookOrderable == '0') {
  typeSet.add('Prebook');
}
if (currentProduct.returnable == '0') {
  typeSet.add('Return');
}

// set the match rule for further filter
if (typeSet.size > 0) {
  me.orderItemMetaCond = [
    {
      id: '^(?!(' + Array.from(typeSet).join("|") + ')$)',
      op: "MATCH",
    },
  ];
}

    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code above.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////

    
}