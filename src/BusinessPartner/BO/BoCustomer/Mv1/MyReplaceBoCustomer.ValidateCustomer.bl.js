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
 * @function replaceValidateCustomer
 * @this BoCustomer
 * @kind businessobject
 * @namespace CUSTOM
 * @param {messageCollector} messageCollector
 */
function replaceValidateCustomer(messageCollector){
    var me = this;
    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code below.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////
    
/*
UC: NGM Customer - Main
The system saves and validates the customer data.
The customer Name must not be empty.
The Id must be unique within the sales organization.
*/

var pageLocation = me.__hostProcess;
if(!Utils.isEmptyString(me.pKey)){
  if (pageLocation === "Customer::ReviewCaptureProcess") {
    var isOpenPlaceholder = me.__isNewlyCreatedCustomer === true &&
      Utils.isEmptyString((me.getName() || "").toString().trim()) &&
      Utils.isEmptyString((me.__lastTypedName || "").toString().trim());
    if (!isOpenPlaceholder && Utils.isEmptyString(me.getName().trim())) {
      messageCollector.add({
        "level": "error",
        "objectClass": "BoCustomer",
        "messageID": "CasBpaMainCustomerNameMustNotBeEmpty",
        "messageParams": {},
      });
    }
  } else if (me.isNameChanged === 1) {
    if (Utils.isEmptyString(me.getName().trim())) {
      messageCollector.add({
        "level": "error",
        "objectClass": "BoCustomer",
        "messageID": "CasBpaMainCustomerNameMustNotBeEmpty",
        "messageParams": {},
      });
    }
  }

  var email1 = me.getEmail1();
  if (pageLocation === "Customer::ReviewCaptureProcess") {
    if (
      me.getEmailEditable() == "1" &&
      !Utils.isEmptyString(email1) &&
      !SalesforceTools.isValidEmail(email1)
    ) {
      messageCollector.add({
        "level": "error",
        "objectClass": "BoCustomer",
        "messageID": "CasBpaMainCustomerEmailInvalid",
        "messageParams": {},
      });
    }
  } else if (me.isEmail1Changed === 1) {
    if (
      me.getEmailEditable() == "1" &&
      !Utils.isEmptyString(email1) &&
      !SalesforceTools.isValidEmail(email1)
    ) {
      messageCollector.add({
        "level": "error",
        "objectClass": "BoCustomer",
        "messageID": "CasBpaMainCustomerEmailInvalid",
        "messageParams": {},
      });
    }
  }

  var status = me.getStatus();
  if (pageLocation === "Customer::ReviewCaptureProcess") {
    if (Utils.isEmptyString(status)) {
      messageCollector.add({
        "level": "error",
        "objectClass": "BoCustomer",
        "messageID": "CasBpaMainCustomerStatusMustNotBeEmpty",
        "messageParams": {},
      });
    }
  } else if (me.isStatusChanged === 1) {
    if (Utils.isEmptyString(status)) {
      messageCollector.add({
        "level": "error",
        "objectClass": "BoCustomer",
        "messageID": "CasBpaMainCustomerStatusMustNotBeEmpty",
        "messageParams": {},
      });
    }
  }

  // Mirrors org validation rule Check_Closure_Reason (part 2): a chain retailer can only be
  // closed by the owner of its parent account. Block it here and roll the status back so no
  // Account update is queued for sync.
  var isParentOwner = ["1", "true", 1, true].includes(me.getParentOwner());
  if (me.isStatusChanged === 1 &&
      ["Closed Permanently", "Closed Temporarily"].includes(status) &&
      me.getRecordTypeName() === "Retailer" &&
      !Utils.isEmptyString(me.getHeadquarterId()) &&
      me.getOwnership() !== "Independent" &&
      !isParentOwner) {
    messageCollector.add({
      "level": "error",
      "objectClass": "BoCustomer",
      "messageID": "CasBpaMainCustomerNotParentOwnerClose",
    });
    me.setStatus(me.__statusBeforeEdit);
    me.setWorkloadStatus(me.__workloadStatusBeforeEdit);
    me.setClosureReason(me.__closureReasonBeforeEdit);
    me.isStatusChanged = 0;
    status = me.getStatus();
  }

  var closureReason = me.getClosureReason();
  var closureReasonDependency = {
                                 "Closed Permanently":["Closed Permanently - Out of Business","Closed Permanently - Does Not Sell Tobacco","Closed Permanently - Duplicate of Another Store","Closed Permanently - Not a Retail Location","Closed Permanently - Other"],
                                 "Closed Temporarily":["Closed Temporarily - Building Damage (Fire, Hurricane, etc)","Closed Temporarily - Remodel Underway","Closed Temporarily - Seasonal","Closed Temporarily - Other"]
                                };
  if (["Closed Permanently", "Closed Temporarily"].includes(status) && Utils.isEmptyString(closureReason)) {
    messageCollector.add({
      "level": "error",
      "objectClass": "BoCustomer",
      "messageID": "CasBpaMainCustomerClosureReasonMustNotBeEmpty",
    });
  }else if(["Open"].includes(status) && !Utils.isEmptyString(closureReason)) {
    messageCollector.add({
      "level": "error",
      "objectClass": "BoCustomer",
      "messageID": "CasBpaMainCustomerClosureReasonMustBeCorrect",
    });
  }else if(["Closed Permanently", "Closed Temporarily"].includes(status)){
    var hasVar = !!closureReasonDependency[status].includes(closureReason);
        if(!hasVar){
        var optionsListString ="";
        var optionAvailable = closureReasonDependency[status].forEach(function(item){optionsListString = optionsListString + item +"\n";});
        messageCollector.add({
          "level": "error",
          "objectClass": "BoCustomer",
          "messageID": "CasBpaClosureReasonDependencyMsg",
          "messageParams": {"statusName":status,"closureReasonName":optionsListString,"newLine":"\n"},
        });
      }
  }



  var city = me.loCustomerAddress.current.getCity();
  var zipCode = me.loCustomerAddress.current.getZipCode();
  var countryState = me.loCustomerAddress.current.getCountryState();
  var street = me.loCustomerAddress.current.getStreet();
  var customerId = me.pKey;
  var pKeyText = "";
  try {
    pKeyText = (me.getPKey() || "").toString();
  } catch (ignorePKey) {
    pKeyText = "";
  }
  var isUnpersistedCustomer = me.__isNewlyCreatedCustomer === true ||
    (me.getObjectStatus() & STATE.NEW) === STATE.NEW ||
    pKeyText.indexOf("Local_") === 0;
  var isUnpersistedReviewCapture = (pageLocation === "Customer::ReviewCaptureProcess" ||
    me.__isNewlyCreatedCustomer === true) && isUnpersistedCustomer;
  var hasAnyAddressInput = !Utils.isEmptyString((city || "").toString().trim()) ||
    !Utils.isEmptyString((zipCode || "").toString().trim()) ||
    !Utils.isEmptyString((countryState || "").toString().trim()) ||
    !Utils.isEmptyString((street || "").toString().trim());
  // OOTB Review Capture saves a named create on list-switch even with empty
  // street/zip. Blocking here discards the new Account (Issue 7). If the user
  // started an address, keep the completeness checks so Issue 6 is not skipped.
  // Also skip the module-open placeholder (empty name, street/zip = ' ').
  var skipEmptyCreateAddressValidation = isUnpersistedReviewCapture && !hasAnyAddressInput;

  if (
    !skipEmptyCreateAddressValidation &&
    (Utils.isEmptyString(city) ||
     Utils.isEmptyString(countryState) ||
     Utils.isEmptyString(street))
  ) {
    messageCollector.add({
      "level": "error",
      "objectClass": "BoCustomer",
      "messageID": "CasBpaMainCustomerAddressMustNotBeEmpty",
      "messageParams": {},
    });
  }

  var user = ApplicationContext.get("user");
  var loOrgUnit = Framework.getProcessContext().orgUnitMapList.getAllItems();
  if (pageLocation === "Customer::ReviewCaptureProcess") {
    if (!skipEmptyCreateAddressValidation &&
        (!/^[0-9]{5}$/.test(zipCode) || Utils.isEmptyString(zipCode))) {
      messageCollector.add({
        "level": "error",
        "objectClass": "BoCustomer",
        "messageID": "CasBpaMainCustomerZipCodeMustNotBeEmpty",
        "messageParams": {},
      });
    } else if (!skipEmptyCreateAddressValidation && user.profileName == "CG Cloud Mobile - TSM") {
      var isExist = loOrgUnit.find(function (item) {
        return item.zipCode == zipCode && item.name == zipCode;
      });
      if (!Utils.isDefined(isExist)) {
        messageCollector.add({
          "level": "error",
          "objectClass": "BoCustomer",
          "messageID": "CasConfirmErrorZipCodeMsg",
          "messageParams": {},
        });
      }
    }
  } else if (me.isAddressChange === "1") {
    if (!/^[0-9]{5}$/.test(zipCode) || Utils.isEmptyString(zipCode)) {
      messageCollector.add({
        "level": "error",
        "objectClass": "BoCustomer",
        "messageID": "CasBpaMainCustomerZipCodeMustNotBeEmpty",
        "messageParams": {},
      });
    } else if (user.profileName == "CG Cloud Mobile - TSM") {
      var isExist = loOrgUnit.find(function (item) {
        return item.zipCode == zipCode && item.name == zipCode;
      });
      if (!Utils.isDefined(isExist)) {
        messageCollector.add({
          "level": "error",
          "objectClass": "BoCustomer",
          "messageID": "CasConfirmErrorZipCodeMsg",
          "messageParams": {},
        });
      }
    }
  }
  var classOfTradeMap = new Map([
      ["Cigarette Out","CIGARETTE OUTLET"],
      ["Convenience Store","CONVENIENCE STORE"],
      ["Extended Master","EXTENDED MASTER"],
      ["Grocery","GROCERY"],
      ["Liquor","LIQUOR"],
      ["MASS MERCH","MASS MERCHANDISER"],
      ["Other","OTHER"],
      ["Wholesale Club","WHOLESALE CLUB"],
      ["DRUG","DRUG"],
  ]);
  var subclassOfTradeMap = new Map([
      ["Conventional","CONVENTIONAL"],
      ["Superette","SUPERETTE"],
      ["Cigar/Pipe/Tob","CIGAR/PIPE/TOBACCO"],
      ["Gas Station/Kiosk","GAS STATION/KIOSK"],
      ["Vapor Shop","VAPE STORE"],
      ["Lifestyle Shop","LIFESTYLE SHOP"],
      ["Military","MILITARY"],
      ["RX ONLY/SMALL INDEPENDENTS","RX ONLY/SMALL INDEPENDENTS"],
      ["Limited Assort","LIMITED ASSORTMENT"],
      ["Gourmet Foods","NATURAL/GOURMET FOODS"],
      ["Supercenter","SUPERCENTER"],
      ["Supermarket","SUPERMARKET"],
      ["Warehouse","WAREHOUSE"],
      ["Beer Specialty","BEER SPECIALTY"],
      ["Super Store","SUPER STORE"],
      ["Wine Specialty","WINE SPECIALTY"],
      ["Dollar Store","DOLLAR STORE"],
      ["General Merch","GENERAL MERCHANDISE"],
      ["Military Exchan","MILITARY EXCHANGE"],
      ["Bodega","BODEGA"],
      ["Dispensary","DISPENSARY"],
      ["Other","OTHER"],
      ["Distributor/Sub-Jobber","DISTRIBUTOR/SUB-JOBBER"],
  ]);
  var classOfTradeDependency = {"CIGARETTE OUTLET":["CONVENTIONAL","VAPE STORE"],
                                "CONVENIENCE STORE":["CONVENTIONAL","GAS STATION/KIOSK","MILITARY"],
                                "EXTENDED MASTER":["CIGAR/PIPE/TOBACCO"],
                                "GROCERY":["SUPERETTE","LIMITED ASSORTMENT","NATURAL/GOURMET FOODS","SUPERCENTER","SUPERMARKET","WAREHOUSE"],
                                "LIQUOR":["CONVENTIONAL","MILITARY","BEER SPECIALTY","SUPER STORE","WINE SPECIALTY"],
                                "MASS MERCHANDISER":["CONVENTIONAL","DOLLAR STORE","GENERAL MERCHANDISE","MILITARY EXCHANGE"],
                                "OTHER":["LIFESTYLE SHOP","BODEGA","DISPENSARY","OTHER"],
                                "WHOLESALE CLUB":["CONVENTIONAL"],
                                "DRUG":["CONVENTIONAL","RX ONLY/SMALL INDEPENDENTS"]};
  var classOfTrade = classOfTradeMap.get(me.getAccClassOfTrade());
  var subClassOfTrade = subclassOfTradeMap.get(me.getAccSubClassOfTrade());
  var classOfTradeCheck =  Utils.isEmptyString(classOfTrade) && ((me.getObjectStatus() & STATE.DIRTY) === STATE.DIRTY || (me.getObjectStatus() & STATE.NEW) === STATE.NEW);

  if (pageLocation === "Customer::ReviewCaptureProcess") {
    if (classOfTradeCheck) {
      messageCollector.add({
        "level": "error",
        "objectClass": "BoCustomer",
        "messageID": "CasConfirmClassOfTradeMsg",
      });
    }
  } else if (me.isClassOfTradeChanged === 1) {
    if (classOfTradeCheck) {
      messageCollector.add({
        "level": "error",
        "objectClass": "BoCustomer",
        "messageID": "CasConfirmClassOfTradeMsg",
      });
    }
  }

  var subClassOfTradeCheck = Utils.isEmptyString(subClassOfTrade) && ((me.getObjectStatus() & STATE.DIRTY) === STATE.DIRTY || (me.getObjectStatus() & STATE.NEW) === STATE.NEW);

  if (pageLocation === "Customer::ReviewCaptureProcess") {
    if (subClassOfTradeCheck) {
      messageCollector.add({
        "level": "error",
        "objectClass": "BoCustomer",
        "messageID": "CasConfirmSubClassOfTradeMsg",
      });
    }
  } else if (me.isSubclassOfTradeChanged === 1) {
    if (subClassOfTradeCheck) {
      messageCollector.add({
        "level": "error",
        "objectClass": "BoCustomer",
        "messageID": "CasConfirmSubClassOfTradeMsg",
      });
    }
  }
  if (pageLocation === "Customer::ReviewCaptureProcess"){
    if(!classOfTradeCheck){
      var hasVar = !!classOfTradeDependency[classOfTrade].includes(subClassOfTrade);
      if(!hasVar){
        var optionsListString ="";
        var optionAvailable = classOfTradeDependency[classOfTrade].forEach(function(item){optionsListString = optionsListString + item +"\n";});
        messageCollector.add({
          "level": "error",
          "objectClass": "BoCustomer",
          "messageID": "CasBpaClassOfTradeDependencyMsg",
          "messageParams": {"className":classOfTrade,"subClassName":optionsListString,"newLine":"\n"},
        });
      }
    }
  }else if(me.isClassOfTradeChanged == "1" || me.isSubclassOfTradeChanged == "1"){
    if(!classOfTradeCheck){
      var hasVar = !!classOfTradeDependency[classOfTrade].includes(subClassOfTrade);
      if(!hasVar){
        var optionsListString ="";
        var optionAvailable = classOfTradeDependency[classOfTrade].forEach(function(item){optionsListString = optionsListString + item +"\n";});
        messageCollector.add({
          "level": "error",
          "objectClass": "BoCustomer",
          "messageID": "CasBpaClassOfTradeDependencyMsg",
          "messageParams": {"className":classOfTrade,"subClassName":optionsListString,"newLine":"\n"},
        });
      }
    }
  }
}

    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code above.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////

    
}