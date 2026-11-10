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
 * @function myDiscardCustomerEdits
 * @this BoCustomer
 * @kind businessobject
 * @namespace CUSTOM
 * @returns promise
 */
function myDiscardCustomerEdits(){
    var me = this;
    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code below.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////

// Discard only reset the status flags, so the discarded FEIN and address stayed on screen.
// Put them back to the stored values here; the flow resets the status right after this.
var promise = when.resolve();
var editedFields = me.__reviewCaptureEditedFields;
if (Utils.isDefined(editedFields) && editedFields !== null && editedFields.fein === true) {
  var valuesBeforeEdit = me.__reviewCaptureValuesBeforeEdit || {};
  me.setFein(Utils.isDefined(valuesBeforeEdit.fein) ? valuesBeforeEdit.fein : "");
  // setFein marks the field edited again; clear it so a later save does not resend it.
  delete editedFields.fein;
}

// A customer that is not on the server yet has no stored address to go back to.
var pKey = (me.getPKey() || "").toString();
var isUnpersisted = me.__isNewlyCreatedCustomer === true ||
  (me.getObjectStatus() & STATE.NEW) === STATE.NEW ||
  pKey.indexOf("Local_") === 0;
if (!isUnpersisted && me.getIsAddressChange() === "1") {
  promise = BoFactory.loadObjectByParamsAsync(BO_CUSTOMER, me.getQueryBy("pKey", me.getPKey())).then(function (dbCustomer) {
    var storedAddress = dbCustomer.getLoCustomerAddress().getMainAddress();
    var mainAddress = me.getLoCustomerAddress().getMainAddress();
    if (Utils.isDefined(storedAddress) && Utils.isDefined(mainAddress)) {
      mainAddress.setStreet(storedAddress.getStreet());
      mainAddress.setZipCode(storedAddress.getZipCode());
      mainAddress.setCity(storedAddress.getCity());
      mainAddress.setCountryState(storedAddress.getCountryState());
      // The setters flag the address as changed again; clear it so it is not resent.
      me.setIsAddressChange("0");
    }
  }).catch(function (error) {
    // The flag stays set, so the check in SaveAsync still stops an invalid address.
    console.log("[BoCustomer.myDiscardCustomerEdits] stored address not restored", error);
  });
}

    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code above.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////

    return promise;
}
