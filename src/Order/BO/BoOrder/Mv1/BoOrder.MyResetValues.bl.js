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
 * @function myResetValues
 * @this BoOrder
 * @kind businessobject
 * @namespace CUSTOM
 */
function myResetValues(){
    var me = this;
    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code below.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////
    
var roundToNumber = 10;
var precision = Math.pow(10, roundToNumber);

me.merchandiseValueReceipt = me.merchandiseValue;

if (me.getPhase() != 'Released') {
  
  if (me.merchandiseValueReceipt && Number.isFinite(me.merchandiseValueReceipt) && !Number.isInteger(me.merchandiseValueReceipt)) {
    if (me.merchandiseValueReceipt.toString().split('.')[1] && me.merchandiseValueReceipt.toString().split('.')[1].length > roundToNumber) {
      me.merchandiseValueReceipt = Math.round(me.merchandiseValueReceipt * precision) / precision;
    }
  }

  if (me.merchandiseValue && Number.isFinite(me.merchandiseValue) && !Number.isInteger(me.merchandiseValue)) {
    if (me.merchandiseValue.toString().split('.')[1] && me.merchandiseValue.toString().split('.')[1].length > roundToNumber) {
      me.merchandiseValue = Math.round(me.merchandiseValue * precision) / precision;
    }
  }
  
  if (me.grossTotalValue && Number.isFinite(me.grossTotalValue) && !Number.isInteger(me.grossTotalValue)) {
    if (me.grossTotalValue.toString().split('.')[1] && me.grossTotalValue.toString().split('.')[1].length > roundToNumber) {
      me.grossTotalValue = Math.round(me.grossTotalValue * precision) / precision;
    }
  }

  if (me.grossTotalValueReceipt && Number.isFinite(me.grossTotalValueReceipt) && !Number.isInteger(me.grossTotalValueReceipt)) {
    if (me.grossTotalValueReceipt.toString().split('.')[1] && me.grossTotalValueReceipt.toString().split('.')[1].length > roundToNumber) {
      me.grossTotalValueReceipt = Math.round(me.grossTotalValueReceipt * precision) / precision;
    }
  }

  if (me.paidAmount && Number.isFinite(me.paidAmount) && !Number.isInteger(me.paidAmount)) {
    if (me.paidAmount.toString().split('.')[1] && me.paidAmount.toString().split('.')[1].length > roundToNumber) {
      me.paidAmount = Math.round(me.paidAmount * precision) / precision;
    }
  }

  if (me.paidAmountReceipt && Number.isFinite(me.paidAmountReceipt) && !Number.isInteger(me.paidAmountReceipt)) {
    if (me.paidAmountReceipt.toString().split('.')[1] && me.paidAmountReceipt.toString().split('.')[1].length > roundToNumber) {
      me.paidAmountReceipt = Math.round(me.paidAmountReceipt * precision) / precision;
    }
  }
}

    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code above.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////

    
}