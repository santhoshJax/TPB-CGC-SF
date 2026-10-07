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
 * @function myUpdateItemOrderItemTemplate
 * @this BoItemTabManager
 * @kind businessobject
 * @async
 * @namespace CUSTOM
 * @param {Object} CurrentOrderItemMeta
 * @returns promise
 */
function myUpdateItemOrderItemTemplate(CurrentOrderItemMeta){
    var me = this;
    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code below.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////
    
var itemTemplate = CurrentOrderItemMeta;
var orderItems = me.boOrder.loItems.getAllItems();

// Reset fields for new meta type only
if (
  Utils.isDefined(itemTemplate) &&
  me.backupOrderItem.type !== itemTemplate.getText()
) {
  var newRefPKey = me.backupOrderItem.refPKey.replace(
    me.backupOrderItem.sdoItemMetaPKey,
    itemTemplate.getPKey()
  );

  var targetItem = orderItems.find(function (item) {
    return item.refPKey === newRefPKey;
  });

  if (Utils.isDefined(targetItem)) {
    // redirect to the existed one
    me.boOrder.loItems.setCurrent(targetItem);
  } else {
    // change current to the target
    me.boOrder.loItems.suspendListRefresh();

    orderItems.forEach(function (item) {
      var oldQuantity = item.getQuantity();

      if (me.backupOrderItem.refPKey === item.refPKey) {
        // Set Order Item with Order Item Template configurations.
        item.priceEffect = itemTemplate.getPriceEffect();
        item.sdoItemMetaPKey = itemTemplate.getPKey();
        item.shortType = itemTemplate.getShortText();
        item.type = itemTemplate.getText();
        item.saveZeroQuantity = itemTemplate.getSaveZeroQuantity();
        item.calculationGroup = itemTemplate.getCalculationGroup();
        item.refPKey = newRefPKey;
        item.quantity = 0;
        item.setQuantity(parseInt(oldQuantity, 10));
        item.movementDirection = itemTemplate.getMovementDirection();
        // Update the inventory information based on the selected type
        me.boOrder.setInventoryBalanceOfItem(item.getPKey());
        
        // Reset fields for Type=Prebook
        if (me.backupOrderItem.type === "Prebook") {
          item.wholesalerProduct = "";
          item.tpbSku = "";
          item.wsName = "";
          item.supplierId = "";
          item.wsNameDisplay = "";
          item.wholesalerProductSKU = "";
          item.wholesalerId = "";
          item.wholesalerName = "";
        }

        // Reset fields for Tyep=Return
        if (me.backupOrderItem.type === "Return") {
          item.resale = "0";
        }

        // in case of current type has any uom is deleted from Order Items
        item.setObjectStatus(STATE.DIRTY | STATE.PERSISTED);
      }
    });

    me.boOrder.loItems.resumeListRefreshAsync(false, true);
  }

  me.boOrder.setEARight();
}

    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code above.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////

    return promise;
}