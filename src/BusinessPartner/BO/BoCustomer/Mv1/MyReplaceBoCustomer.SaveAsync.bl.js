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
 * @function replaceSaveAsync
 * @this BoCustomer
 * @kind businessobject
 * @async
 * @namespace CUSTOM
 * @returns promise
 */
function replaceSaveAsync(){
    var me = this;
    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code below.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////
    
/***********************************************************************************************
*  2 CGCloud tables / 1 onPrem table                                                              *
*                                                                                              *
*  CGCloud:    -2 objects have to be stored (Account__c / Account_Extension__c)                   *
*  onPrem:  -Only one table for customer                                                       *
************************************************************************************************/
var promise;
var deferreds = [];
var ensureNamePromise = when.resolve();
var skipSaveBecauseBlankName = false;
var isReviewCaptureNameOnlySave = false;
var reviewCaptureDbCustomer;

function _trimmed(value) {
  return (value || "").toString().trim();
}

function _isServerPKey(pKey) {
  return !Utils.isEmptyString(_trimmed(pKey)) && _trimmed(pKey).indexOf("Local_") !== 0;
}

function _isUnpersistedCustomer(boCustomer) {
  if (!Utils.isDefined(boCustomer)) {
    return false;
  }
  if (boCustomer.__isNewlyCreatedCustomer === true) {
    return true;
  }
  if ((boCustomer.getObjectStatus() & STATE.NEW) === STATE.NEW) {
    return true;
  }
  // After the first successful insert, Local_ Ids stay local until sync.
  // Treat those as persisted so list-switch does not insert Account again.
  if (boCustomer.__hasEverSavedCustomer === true) {
    return false;
  }
  return !_isServerPKey(boCustomer.getPKey());
}

function _restoreUnpersistedCreateStatus(boCustomer) {
  function _restoreNode(node) {
    if (!Utils.isDefined(node) || !Utils.isDefined(node.setObjectStatus)) {
      return;
    }
    var nodePKey = "";
    try {
      if (Utils.isDefined(node.getPKey)) {
        nodePKey = _trimmed(node.getPKey());
      }
    } catch (ignore) {
      nodePKey = "";
    }
    if (!Utils.isEmptyString(nodePKey) && _isServerPKey(nodePKey)) {
      return;
    }
    node.setObjectStatus(STATE.NEW | STATE.DIRTY);
  }
  _restoreNode(boCustomer);
  try {
    boCustomer.traverse(function (node) {
      _restoreNode(node);
      if (node.isList) {
        node.getAllItems().forEach(_restoreNode);
      }
    }, function (a, b, c) {});
  } catch (ignoreTraverse) {
    // BoCustomer NEW/DIRTY is already restored.
  }
}

function _getAddressNameFallback(boCustomer) {
  var fallback = "";
  try {
    if (Utils.isDefined(boCustomer) && Utils.isDefined(boCustomer.getLoCustomerAddress())) {
      var mainAddress = boCustomer.getLoCustomerAddress().getMainAddress();
      if (Utils.isDefined(mainAddress)) {
        if (Utils.isDefined(mainAddress.getName)) {
          fallback = _trimmed(mainAddress.getName());
        } else if (Utils.isDefined(mainAddress.name)) {
          fallback = _trimmed(mainAddress.name);
        }
      }
    }
  } catch (ignore) {
    // Best-effort fallback only.
  }
  return fallback;
}

function _getSnapshotNameFallback(boCustomer) {
  var snapshot = "";
  try {
    if (Utils.isDefined(boCustomer) && Utils.isDefined(boCustomer.__lastNonEmptyName)) {
      snapshot = _trimmed(boCustomer.__lastNonEmptyName);
    }
  } catch (ignore) {
    // Best-effort fallback only.
  }
  return snapshot;
}

function _getTypedNameFallback(boCustomer) {
  var typed = "";
  try {
    if (Utils.isDefined(boCustomer) && Utils.isDefined(boCustomer.__lastTypedName)) {
      typed = _trimmed(boCustomer.__lastTypedName);
    }
  } catch (ignore) {
    // Best-effort fallback only.
  }
  return typed;
}

function _hasAddressObjectEdits(boCustomer) {
  try {
    if (!Utils.isDefined(boCustomer) || !Utils.isDefined(boCustomer.getLoCustomerAddress())) {
      return false;
    }
    var loAddress = boCustomer.getLoCustomerAddress();
    var mainAddress = loAddress.getMainAddress();
    if (Utils.isDefined(mainAddress) &&
        (mainAddress.getObjectStatus() & STATE.DIRTY) === STATE.DIRTY) {
      return true;
    }
    var items = loAddress.getAllItems();
    for (var i = 0; i < items.length; i++) {
      var itemStatus = items[i].getObjectStatus();
      if ((itemStatus & STATE.DIRTY) === STATE.DIRTY ||
          (itemStatus & STATE.NEW) === STATE.NEW) {
        return true;
      }
    }
  } catch (ignore) {
    // Best-effort fallback only.
  }
  return false;
}

function _resolveCanonicalCustomerName(boCustomer) {
  var name = _trimmed(boCustomer.getName());
  if (!Utils.isEmptyString(name)) {
    return name;
  }
  name = _trimmed(boCustomer.getName2());
  if (!Utils.isEmptyString(name)) {
    return name;
  }
  name = _getTypedNameFallback(boCustomer);
  if (!Utils.isEmptyString(name)) {
    return name;
  }
  name = _getSnapshotNameFallback(boCustomer);
  if (!Utils.isEmptyString(name)) {
    return name;
  }
  name = _getAddressNameFallback(boCustomer);
  if (!Utils.isEmptyString(name)) {
    return name;
  }
  return _trimmed(boCustomer.__lastPersistedName);
}

function _prepareSfAddressForSave(boCustomer) {
  try {
    if (!Utils.isDefined(boCustomer) || !Utils.isDefined(boCustomer.getLoCustomerAddress())) {
      return;
    }
    var mainAddress = boCustomer.getLoCustomerAddress().getMainAddress();
    if (!Utils.isDefined(mainAddress)) {
      return;
    }
    if (Utils.isSfBackend()) {
      // Salesforce has no House Number column; Street No must be stored in ShippingStreet.
      var houseNumber = _trimmed(mainAddress.getHouseNumber());
      var street = _trimmed(mainAddress.getStreet());
      if (!Utils.isEmptyString(houseNumber) && street.indexOf(houseNumber) === -1) {
        var mergedStreet = (houseNumber + " " + street).replace(/\s+/g, " ").trim();
        mainAddress.setStreet(mergedStreet);
        mainAddress.setObjectStatus(mainAddress.getObjectStatus() | STATE.DIRTY);
      }
    }
    var canonicalName = _resolveCanonicalCustomerName(boCustomer);
    if (!Utils.isEmptyString(canonicalName)) {
      if (Utils.isEmptyString(_trimmed(boCustomer.getName()))) {
        boCustomer.setName(canonicalName);
        boCustomer.setName2(canonicalName);
      }
      if (Utils.isDefined(mainAddress.setName)) {
        mainAddress.setName(canonicalName);
      }
    }
  } catch (ignore) {
    // Best-effort merge only.
  }
}

function _safeAddressText(mainAddress, getterName) {
  try {
    if (Utils.isDefined(mainAddress) && Utils.isDefined(mainAddress[getterName])) {
      return _trimmed(mainAddress[getterName]());
    }
  } catch (ignore) {
    // Best-effort read only.
  }
  return "";
}

function _appendCreateTimeAddressColumns(boCustomer, extraColumns) {
  // Fold typed shipping/billing into the SAME Account insert as Name.
  // A second Account write on create conflicts (N vs U) and blanks Name.
  if (!Utils.isDefined(boCustomer) || !Utils.isDefined(boCustomer.getLoCustomerAddress())) {
    return false;
  }
  _prepareSfAddressForSave(boCustomer);
  var mainAddress = boCustomer.getLoCustomerAddress().getMainAddress();
  if (!Utils.isDefined(mainAddress)) {
    return false;
  }
  var street = _safeAddressText(mainAddress, "getStreet");
  var zipCode = _safeAddressText(mainAddress, "getZipCode");
  var city = _safeAddressText(mainAddress, "getCity");
  var countryState = _safeAddressText(mainAddress, "getCountryState");
  var country = _safeAddressText(mainAddress, "getCountry");
  var bStreet = _safeAddressText(mainAddress, "getBStreet");
  var bZipCode = _safeAddressText(mainAddress, "getBZipCode");
  var bCity = _safeAddressText(mainAddress, "getBCity");
  var bCountryState = _safeAddressText(mainAddress, "getBCountryState");
  var bCountry = _safeAddressText(mainAddress, "getBCountry");
  var hasShipping = !Utils.isEmptyString(street) || !Utils.isEmptyString(zipCode) ||
    !Utils.isEmptyString(city) || !Utils.isEmptyString(countryState) || !Utils.isEmptyString(country);
  var hasBilling = !Utils.isEmptyString(bStreet) || !Utils.isEmptyString(bZipCode) ||
    !Utils.isEmptyString(bCity) || !Utils.isEmptyString(bCountryState) || !Utils.isEmptyString(bCountry);
  if (!hasShipping && !hasBilling) {
    return false;
  }
  if (hasShipping) {
    extraColumns.push({name: "createShippingStreet", dsColumn: "ShippingStreet", value: street});
    extraColumns.push({name: "createShippingPostalCode", dsColumn: "ShippingPostalCode", value: zipCode});
    extraColumns.push({name: "createShippingCity", dsColumn: "ShippingCity", value: city});
    extraColumns.push({name: "createShippingState", dsColumn: "ShippingState", value: countryState});
    extraColumns.push({name: "createShippingCountry", dsColumn: "ShippingCountry", value: country});
  }
  if (hasBilling) {
    extraColumns.push({name: "createBillingStreet", dsColumn: "BillingStreet", value: bStreet});
    extraColumns.push({name: "createBillingPostalCode", dsColumn: "BillingPostalCode", value: bZipCode});
    extraColumns.push({name: "createBillingCity", dsColumn: "BillingCity", value: bCity});
    extraColumns.push({name: "createBillingState", dsColumn: "BillingState", value: bCountryState});
    extraColumns.push({name: "createBillingCountry", dsColumn: "BillingCountry", value: bCountry});
  }
  try {
    var items = boCustomer.getLoCustomerAddress().getAllItems();
    for (var i = 0; i < items.length; i++) {
      items[i].setObjectStatus(STATE.PERSISTED);
    }
    boCustomer.getLoCustomerAddress().setObjectStatus(STATE.PERSISTED);
    if (Utils.isDefined(boCustomer.setIsAddressChange)) {
      boCustomer.setIsAddressChange("0");
    }
  } catch (ignoreStatus) {
    // Values are already copied onto extraColumns.
  }
  return true;
}

function _queueCustomerAddressSave(boCustomer, saveDeferreds) {
  // New customers already insert Account via saveTrackedObject, including
  // create-time shipping. A second Account write in the same transaction
  // conflicts (N vs U) and the blank create-time name wins over the typed name.
  if ((boCustomer.getObjectStatus() & STATE.NEW) === STATE.NEW) {
    return;
  }
  if (!Utils.isDefined(boCustomer.getLoCustomerAddress()) ||
      (boCustomer.getIsAddressChange() !== "1" && !_hasAddressObjectEdits(boCustomer))) {
    return;
  }
  _prepareSfAddressForSave(boCustomer);
  var loAddress = boCustomer.getLoCustomerAddress();
  var mainAddress = loAddress.getMainAddress();
  if (Utils.isSfBackend() && Utils.isDefined(mainAddress)) {
    mainAddress.setPKey(boCustomer.getPKey());
    // Shipping fields only. Never write Name here; BoCustomer owns Account.Name.
    saveDeferreds.push(BoFactory.createObjectAsync("BoSfHelper", {}).then(function (helper) {
      return helper.saveTrackedObjectWithMapping(mainAddress, {
        tableName: "Account",
        idColumn: "Id",
        idProperty: "pKey",
        columnMapping: {
          "street": "ShippingStreet",
          "zipCode": "ShippingPostalCode",
          "city": "ShippingCity",
          "countryState": "ShippingState",
          "country": "ShippingCountry"
        }
      }, []);
    }));
  } else {
    saveDeferreds.push(loAddress.saveAsync());
  }
  boCustomer.setIsAddressChange("0");
}

// Editable Review Capture fields and their Account columns. Only fields the org
// allows to be updated are listed; formula / read-only columns (Ownership__c,
// Last_Completed_Call_Date_Time__c, Account_Number_old__c) are left out on purpose.
// Keep in step with reviewCaptureTrackedFields in BoCustomer.MyIsChanged.bl.js.
var REVIEW_CAPTURE_ACCOUNT_COLUMNS = {
  "accClassOfTrade": "Class_of_Trade__c",
  "accSubClassOfTrade": "Sub_Class_of_Trade__c",
  "acceptsMobileCoupons": "Accepts_Coupons__c",
  "accountNotes": "Account_Notes__c",
  "closureReason": "Closure_Reason__c",
  "county": "County__c",
  "email1": "Account_Email__c",
  "fein": "FEIN__c",
  "jurisdiction": "TPB_Jurisdiction__c",
  "mobileCouponEnrollment": "Mobile_Coupon_Enrollment__c",
  "phone1": "Phone",
  "posAllowed": "POS_Allowed__c",
  "priceTaxAdvantage": "Price_Tax_Advantage__c",
  "prohibitVisit": "Prohibit_Visit__c",
  "promosAllowed": "Promos_Allowed__c",
  "reasonNotVisited": "Reason_Not_Visited__c",
  "smokelessStoreRank": "Smokeless_Store_Rank__c",
  "smokingStoreRank": "Smoking_Store_Rank__c",
  "taxNumber": "State_Tax_Number__c",
  "tobaccoNumber": "State_Tobacco_Number__c",
  "workloadStatus": "Workload_Status__c"
};

function _readProperty(bo, propertyName) {
  var getterName = "get" + propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
  if (Utils.isDefined(bo[getterName])) {
    return bo[getterName]();
  }
  return bo[propertyName];
}

function _normalizedValue(value) {
  // Unlike _trimmed, keeps 0 / false so boolean fields compare correctly.
  return (value === undefined || value === null) ? "" : value.toString().trim();
}

function _hasReviewCaptureFieldEdits(boCustomer) {
  var editedFields = boCustomer.__reviewCaptureEditedFields;
  if (!Utils.isDefined(editedFields) || editedFields === null) {
    return false;
  }
  return Object.keys(editedFields).some(function (propertyName) {
    return editedFields[propertyName] === true;
  });
}

function _buildReviewCaptureChangedColumns(boCustomer, dbCustomer) {
  // Fields the user edited that also differ from the stored record. Comparing with
  // the stored record keeps untouched values (e.g. a now-inactive picklist value)
  // out of the update so they cannot make Salesforce reject it.
  var editedFields = boCustomer.__reviewCaptureEditedFields || {};
  var hasDbCustomer = Utils.isDefined(dbCustomer) && dbCustomer !== null;
  var columns = [];
  Object.keys(REVIEW_CAPTURE_ACCOUNT_COLUMNS).forEach(function (propertyName) {
    if (propertyName === "closureReason" || editedFields[propertyName] !== true) {
      return;
    }
    var value = _readProperty(boCustomer, propertyName);
    if (hasDbCustomer &&
        _normalizedValue(value) === _normalizedValue(_readProperty(dbCustomer, propertyName))) {
      return;
    }
    // Distinct names so the helper does not overwrite the BO's own properties.
    columns.push({
      name: "reviewCapture_" + propertyName,
      dsColumn: REVIEW_CAPTURE_ACCOUNT_COLUMNS[propertyName],
      value: value
    });
  });
  // Org rule Check_Closure_Reason checks the saved record, so Closure Reason must
  // always travel with Status__c (which this save always sends). If the reason is
  // blank only transiently and the user did not edit it, use the stored reason.
  var closureReason = _readProperty(boCustomer, "closureReason");
  if (_normalizedValue(closureReason) === "" && editedFields.closureReason !== true && hasDbCustomer) {
    closureReason = _readProperty(dbCustomer, "closureReason");
  }
  columns.push({
    name: "reviewCapture_closureReason",
    dsColumn: REVIEW_CAPTURE_ACCOUNT_COLUMNS.closureReason,
    value: closureReason
  });
  return columns;
}

function _hasExplicitCustomerEdits(boCustomer) {
  return _hasReviewCaptureFieldEdits(boCustomer) ||
    boCustomer.isNameChanged === 1 ||
    boCustomer.isEmail1Changed === 1 ||
    boCustomer.isStatusChanged === 1 ||
    boCustomer.isClassOfTradeChanged === 1 ||
    boCustomer.isSubclassOfTradeChanged === 1 ||
    boCustomer.isStateChanged === 1 ||
    boCustomer.getIsAddressChange() === "1" ||
    _hasAddressObjectEdits(boCustomer);
}

function _copyIfDefined(value, setterFn, targetObj, propertyName) {
  if (Utils.isDefined(value)) {
    if (Utils.isDefined(setterFn)) {
      setterFn.call(targetObj, value);
    } else if (Utils.isDefined(propertyName)) {
      targetObj[propertyName] = value;
    }
  }
}

//Flag used to decide if  roles must be saved or not
//For records already saved on DB no need to save the roles because roles are read only
var isCustomerPersistedDirty = me.getObjectStatus() === (STATE.PERSISTED | STATE.DIRTY);

// Guard against accidental blank-name persistence on implicit/close saves.
var previousSnapshotName = _getSnapshotNameFallback(me);
var previousPersistedName = _trimmed(me.__lastPersistedName);
var currentName = _trimmed(me.getName());
// Capture real UI edits before ReviewCapture name recovery marks isNameChanged.
// Otherwise DIRTY list-switch would name-only-save every existing account (Issue 2).
var hadUserEditsAtSaveStart = _hasExplicitCustomerEdits(me);
var hasTypedNameChange = !Utils.isEmptyString(currentName) &&
  ((!Utils.isEmptyString(previousPersistedName) && currentName !== previousPersistedName) ||
   (Utils.isEmptyString(previousPersistedName) && currentName !== previousSnapshotName));
console.log("[MyReplaceBoCustomer.SaveAsync] start", {
  pKey: me.getPKey(),
  status: me.getObjectStatus(),
  host: me.__hostProcess,
  currentName: currentName,
  lastTypedName: _trimmed(me.__lastTypedName),
  lastPersistedName: previousPersistedName,
  lastNonEmptyName: previousSnapshotName,
  hasTypedNameChange: hasTypedNameChange
});
if (!Utils.isEmptyString(currentName)) {
  me.__lastNonEmptyName = currentName;
  me.__lastTypedName = currentName;
}

if (!Utils.isEmptyString(currentName) &&
    !Utils.isEmptyString(previousPersistedName) &&
    currentName !== previousPersistedName) {
  me.isNameChanged = 1;
  me.setObjectStatus(me.getObjectStatus() | STATE.DIRTY);
}

// In ReviewCapture, prefer the last explicit user-typed value when available.
// This avoids transient state resets from replacing edited names during close-save.
if (me.__hostProcess === "Customer::ReviewCaptureProcess") {
  var typedNamePreferred = _getTypedNameFallback(me);
  var name2Preferred = _trimmed(me.getName2());
  var currentReviewCaptureName = _trimmed(me.getName());
  var reviewCapturePreferredName = !Utils.isEmptyString(typedNamePreferred) ? typedNamePreferred :
    (!Utils.isEmptyString(currentReviewCaptureName) ? currentReviewCaptureName : name2Preferred);
  if (!Utils.isEmptyString(reviewCapturePreferredName)) {
    if (reviewCapturePreferredName !== currentReviewCaptureName) {
      me.setName(reviewCapturePreferredName);
    }
    if (reviewCapturePreferredName !== name2Preferred) {
      me.setName2(reviewCapturePreferredName);
    }
    me.__lastTypedName = reviewCapturePreferredName;
    me.__lastNonEmptyName = reviewCapturePreferredName;
    if (!Utils.isEmptyString(previousPersistedName) &&
        reviewCapturePreferredName !== previousPersistedName) {
      me.isNameChanged = 1;
      me.setObjectStatus(me.getObjectStatus() | STATE.DIRTY);
    }
  }
}

// In ReviewCapture, skip implicit close/list saves only when there are truly no edits.
// Never treat a Local_/NEW customer as persisted: that turns create into an
// Account update of an Id that was never inserted, so the row disappears.
if (me.__hostProcess === "Customer::ReviewCaptureProcess" &&
    !_isUnpersistedCustomer(me) &&
    (me.getObjectStatus() & STATE.PERSISTED) === STATE.PERSISTED) {
  var effectiveCurrentName = _trimmed(me.getName());
  var effectiveTypedName = _getTypedNameFallback(me);
  var hasEffectiveNameEdit =
    (!Utils.isEmptyString(effectiveCurrentName) && effectiveCurrentName !== previousPersistedName) ||
    (!Utils.isEmptyString(effectiveTypedName) && effectiveTypedName !== previousPersistedName);
  if (!hasEffectiveNameEdit && !hadUserEditsAtSaveStart) {
    return when.resolve(me);
  }
  // Use name-only save in ReviewCapture persisted-record edits to avoid
  // unrelated unstable fields blocking the transaction.
  isReviewCaptureNameOnlySave = true;
}

// New / local customer: always insert Account + Account_Extension__c + roles.
if (_isUnpersistedCustomer(me)) {
  _restoreUnpersistedCreateStatus(me);
  isCustomerPersistedDirty = false;
  var newCurrentName = _trimmed(me.getName());
  var newTypedName = _getTypedNameFallback(me);
  var newName2 = _trimmed(me.getName2());
  var newPreferredName = !Utils.isEmptyString(newCurrentName) ? newCurrentName :
    (!Utils.isEmptyString(newTypedName) ? newTypedName : newName2);
  if (!Utils.isEmptyString(newPreferredName)) {
    me.setName(newPreferredName);
    me.setName2(newPreferredName);
    me.__lastTypedName = newPreferredName;
    me.__lastNonEmptyName = newPreferredName;
    me.isNameChanged = 1;
  }
  isReviewCaptureNameOnlySave = false;
}

// Guard for Issue 1: in ReviewCapture, avoid implicit DETAIL_TO_MASTER/CLOSE saves
// unless there are explicit customer edits. This prevents accidental writes from
// transient UI state when navigating back to the master list.
// Keep saves enabled in ReviewCapture so explicit edits are never skipped by
// transient flag/state timing; blank-name safeguards below prevent regressions.

if (Utils.isEmptyString(_trimmed(me.getName()))) {
  var typedName = _getTypedNameFallback(me);
  if (!Utils.isEmptyString(typedName)) {
    me.setName(typedName);
    console.log("[MyReplaceBoCustomer.SaveAsync] fallback=lastTypedName", { value: typedName });
  }

  // Only fall back to Name 2 when the typed-name step above did not recover a name.
  var name2Fallback = _trimmed(me.getName2());
  if (Utils.isEmptyString(_trimmed(me.getName())) && !Utils.isEmptyString(name2Fallback)) {
    me.setName(name2Fallback);
    console.log("[MyReplaceBoCustomer.SaveAsync] fallback=name2", { value: name2Fallback });
  }

  // Only use the last non-empty snapshot when no newer name was recovered above;
  // without this guard an older name overwrote the user's latest entry.
  var snapshotName = _getSnapshotNameFallback(me);
  if (Utils.isEmptyString(_trimmed(me.getName())) && !Utils.isEmptyString(snapshotName)) {
    me.setName(snapshotName);
    console.log("[MyReplaceBoCustomer.SaveAsync] fallback=lastNonEmptyName", { value: snapshotName });
  }

  var fallbackName = _getAddressNameFallback(me);
  if (Utils.isEmptyString(_trimmed(me.getName())) && !Utils.isEmptyString(fallbackName)) {
    me.setName(fallbackName);
    console.log("[MyReplaceBoCustomer.SaveAsync] fallback=addressName", { value: fallbackName });
  }

  // Existing server-side customer: recover name from DB and avoid blank overwrite if recovery fails.
  if (Utils.isEmptyString(_trimmed(me.getName())) && _isServerPKey(me.getPKey())) {
    ensureNamePromise = BoFactory.loadObjectByParamsAsync(BO_CUSTOMER, me.getQueryBy("pKey", me.getPKey())).then(function (dbCustomer) {
      if (Utils.isDefined(dbCustomer) && !Utils.isEmptyString(_trimmed(dbCustomer.getName()))) {
        me.setName(dbCustomer.getName());
        console.log("[MyReplaceBoCustomer.SaveAsync] fallback=dbName", { value: _trimmed(dbCustomer.getName()) });
      } else {
        skipSaveBecauseBlankName = true;
        console.log("[MyReplaceBoCustomer.SaveAsync] skipSaveBecauseBlankName=dbEmpty");
      }
    }).catch(function () {
      skipSaveBecauseBlankName = true;
      console.log("[MyReplaceBoCustomer.SaveAsync] skipSaveBecauseBlankName=dbError");
    });
  } else if (Utils.isEmptyString(_trimmed(me.getName()))) {
    // New/placeholder customer without a name must never be persisted by implicit saves.
    skipSaveBecauseBlankName = true;
    console.log("[MyReplaceBoCustomer.SaveAsync] skipSaveBecauseBlankName=stillEmptyAfterFallbacks");
  }
}

// In ReviewCapture, unstable toggle fields can transiently become blank/invalid
// during close-save; recover them from persisted record so name updates are not blocked.
if (me.__hostProcess === "Customer::ReviewCaptureProcess" && _isServerPKey(me.getPKey())) {
  ensureNamePromise = ensureNamePromise.then(function () {
    return BoFactory.loadObjectByParamsAsync(BO_CUSTOMER, me.getQueryBy("pKey", me.getPKey())).then(function (dbCustomer) {
      if (Utils.isDefined(dbCustomer)) {
        // Kept so the save below sends only fields that differ from the stored record.
        reviewCaptureDbCustomer = dbCustomer;
        _copyIfDefined(
          Utils.isDefined(dbCustomer.getAcceptsMobileCoupons) ? dbCustomer.getAcceptsMobileCoupons() : dbCustomer.acceptsMobileCoupons,
          me.setAcceptsMobileCoupons,
          me,
          "acceptsMobileCoupons"
        );
        _copyIfDefined(
          Utils.isDefined(dbCustomer.getProhibitVisit) ? dbCustomer.getProhibitVisit() : dbCustomer.prohibitVisit,
          me.setProhibitVisit,
          me,
          "prohibitVisit"
        );
        _copyIfDefined(
          Utils.isDefined(dbCustomer.getReasonNotVisited) ? dbCustomer.getReasonNotVisited() : dbCustomer.reasonNotVisited,
          me.setReasonNotVisited,
          me,
          "reasonNotVisited"
        );
      }
      return me;
    }).catch(function () {
      return me;
    });
  });
}

if (!Utils.isDefined(me.getDateClosure())) {
  me.setDateClosure(Utils.getMinDateTime());
}
// If the backend is SalesForce, then we need to store two objects for the BoCustomer
promise = ensureNamePromise.then(function () {
if (skipSaveBecauseBlankName) {
  console.log("[MyReplaceBoCustomer.SaveAsync] skipSaveBeforeSaveCall");
  return me;
}
console.log("[MyReplaceBoCustomer.SaveAsync] finalNameBeforeSave", { value: _trimmed(me.getName()) });
if (Utils.isSfBackend()) {
  return BoFactory.createObjectAsync("BoSfHelper", {}).then(
    function (helper) {
      if (isReviewCaptureNameOnlySave) {
        var finalOutgoingName = _trimmed(me.getName());
        if (Utils.isEmptyString(finalOutgoingName)) {
          finalOutgoingName = _trimmed(me.getName2());
        }
        if (Utils.isEmptyString(finalOutgoingName)) {
          finalOutgoingName = _getTypedNameFallback(me);
        }
        if (Utils.isEmptyString(finalOutgoingName)) {
          finalOutgoingName = _getSnapshotNameFallback(me);
        }
        if (Utils.isEmptyString(finalOutgoingName)) {
          finalOutgoingName = _getAddressNameFallback(me);
        }
        if (Utils.isEmptyString(finalOutgoingName)) {
          finalOutgoingName = _trimmed(me.__lastPersistedName);
        }
        if (!Utils.isEmptyString(finalOutgoingName)) {
          me.setName(finalOutgoingName);
          me.setName2(finalOutgoingName);
          me.__lastTypedName = finalOutgoingName;
          me.__lastNonEmptyName = finalOutgoingName;
          me.isNameChanged = 1;
          me.setObjectStatus(me.getObjectStatus() | STATE.DIRTY);
        }
        var nameOnlyMapping = {
          "name": "Name",
          "name2": "Name_2__c",
          "recordTypeId": "RecordTypeId",
          "ownerId": "OwnerId",
          "type": "Type",
          "status": "Status__c"
        };
        if (!Utils.isEmptyString(_trimmed(me.getCustomerId()))) {
          nameOnlyMapping.customerId = "Account_Number__c";
        }
        // Also send the edited Review Capture fields and Closure Reason. Before this,
        // only the columns above were sent, so edits such as Closure Reason, Phone or
        // Account Notes never reached Salesforce.
        var reviewCaptureChangedColumns = _buildReviewCaptureChangedColumns(me, reviewCaptureDbCustomer);
        deferreds.push(helper.saveTrackedObjectWithMapping(me, {
          tableName: "Account",
          idColumn: "Id",
          idProperty: "pKey",
          columnMapping: nameOnlyMapping
        }, reviewCaptureChangedColumns));
        return when.all(deferreds);
      }
      // Store Account. Only Review Capture *create* forces Name/Name_2 extra
      // columns so a typed name cannot be dropped on the first insert.
      // Persisted Review Capture stays on the name-only mapping above.
      var accountExtraColumns = [{name: "id", dsColumn: "Account_Number__c", value: me.getCustomerId() }];
      if (_isUnpersistedCustomer(me) || (me.getObjectStatus() & STATE.NEW) === STATE.NEW) {
        var fullSaveName = _resolveCanonicalCustomerName(me);
        if (!Utils.isEmptyString(fullSaveName)) {
          me.setName(fullSaveName);
          me.setName2(fullSaveName);
          me.__lastTypedName = fullSaveName;
          me.__lastNonEmptyName = fullSaveName;
          accountExtraColumns.push({name: "name", dsColumn: "Name", value: fullSaveName});
          accountExtraColumns.push({name: "name2", dsColumn: "Name_2__c", value: fullSaveName});
        }
        _appendCreateTimeAddressColumns(me, accountExtraColumns);
      }
      deferreds.push(helper.saveTrackedObject(me, accountExtraColumns));
      var mapping = {
        "matchcode": "Match_Code__c",
        "priority": "Priority__c",
        "classOfTrade": "Class_Of_Trade__c",
        "companyType": "Company_Type__c",
        "orgLevel": "Org_Level__c",
        "phase": "Phase__c",
        "salesRelevant": "Sales_Relevant__c",
        "state": "State__c",
        "dateClosure": "Date_Closure__c",
        "accountExtensionId": "Id",
        "pKey": "Account__c",
        "accountDi": "Distribution_Issue__c",
        "accountOi": "OOS_Issue__c",
      };
      // Store Account_Extension__c
      deferreds.push(helper.saveTrackedObjectWithMapping(me, {
        tableName: "Account_Extension__c",
        idColumn: "Id",
        idProperty: "accountExtensionId",
        columnMapping: mapping,
      }, []));
      return when.all(deferreds);
    });
}
else {
  return Facade.saveObjectAsync(me);
}
});

promise = promise.then(
  function () {
    if (skipSaveBecauseBlankName) {
      _queueCustomerAddressSave(me, deferreds);
      return when.all(deferreds).then(function () {
        return me;
      });
    }
    if (me.__isNewlyCreatedCustomer === true) {
      me.__isNewlyCreatedCustomer = false;
    }
    me.__hasEverSavedCustomer = true;
    me.__lastPersistedName = _trimmed(me.getName());
    // Edits are now queued for sync; clear them so later implicit saves do not resend.
    me.__reviewCaptureEditedFields = {};
    if (isReviewCaptureNameOnlySave) {
      // Keep Account on name-only mapping so a blank UI name cannot overwrite Name.
      // Address still needs its own list save when the user edited it.
      _queueCustomerAddressSave(me, deferreds);
      return when.all(deferreds).then(function () {
        return me;
      });
    }
    var account_extension_id = "";
    if (Utils.isSfBackend()) {
      account_extension_id = me.getAccountExtensionId();
    }
    // Save BpaSales
    if(Utils.isDefined(me.getBoBpaSales())) {
      if (Utils.isSfBackend()) {
        me.getBoBpaSales().setPKey(account_extension_id);
      }
      deferreds.push(me.getBoBpaSales().saveAsync());
    }  
    //Save LoContactPartner
    if(Utils.isDefined(me.getLoContactPartner())) {
      deferreds.push(me.getLoContactPartner().saveAsync());
    }
/** Account Harmonization: obsolete
    //Save LoCustomerOpeningTimes
    if(Utils.isDefined(me.getLoCustomerOpeningTime())) {
      deferreds.push(me.getLoCustomerOpeningTime().saveAsync());
    }
Account Harmonization: obsolete */
    // Save addresses only when they were actually changed in UI.
    // This prevents implicit customer-switch/back saves from writing
    // partially loaded address payloads.
    _queueCustomerAddressSave(me, deferreds);
    //Save LoCustomerPOSRelation
    if(Utils.isDefined(me.getLoCustomerPOSRelation())) {
      deferreds.push(me.getLoCustomerPOSRelation().saveAsync());
    }
    //Save LoBpaManagement
    if(Utils.isDefined(me.getLoBpaManagement())) {
      deferreds.push(me.getLoBpaManagement().saveAsync());
    }

    //Save LoListingClassification
    if(Utils.isSfBackend() && Utils.isDefined(me.getLoListingClassification())) {
      deferreds.push(me.getLoListingClassification().saveAsync());
    }

    //##################
    //### SAVE ROLES ###
    //##################
    //Save BO_ORDERROLE
    if(Utils.isDefined(me.getBoOrderRole()) && !isCustomerPersistedDirty) {
      // SF/CASDIF: General Dif
      if (Utils.isSfBackend()) {
        me.getBoOrderRole().setPKey(account_extension_id);
        me.getBoOrderRole().setCustomerPKey(me.getPKey());
      }
      deferreds.push(me.getBoOrderRole().saveAsync());
    }
    //Save BO_CUSTOMERROLE
    if(Utils.isDefined(me.getBoCustomerRole()) && !isCustomerPersistedDirty) {
      // SF/CASDIF: General Dif
      if (Utils.isSfBackend()) {
        me.getBoCustomerRole().setPKey(account_extension_id);
        me.getBoCustomerRole().setCustomerPKey(me.getPKey());
      }
      deferreds.push(me.getBoCustomerRole().saveAsync());
    }
    //Save BO_PAYERROLE
    if(Utils.isDefined(me.getBoPayerRole()) && !isCustomerPersistedDirty) {
      // SF/CASDIF: General Dif
      if (Utils.isSfBackend()) {
        me.getBoPayerRole().setPKey(account_extension_id);
        me.getBoPayerRole().setCustomerPKey(me.getPKey());
      }
      deferreds.push(me.getBoPayerRole().saveAsync());
    }
    //Save BO_DELIVERYROLE
    if(Utils.isDefined(me.getBoDeliveryRole()) && !isCustomerPersistedDirty) {
      // SF/CASDIF: General Dif
      if (Utils.isSfBackend()) {
        me.getBoDeliveryRole().setPKey(account_extension_id);
        me.getBoDeliveryRole().setCustomerPKey(me.getPKey());
      }
      deferreds.push(me.getBoDeliveryRole().saveAsync());
    }
    //Save BO_STOREROLE
    if(Utils.isDefined(me.getBoStoreRole()) && !isCustomerPersistedDirty) {
      // SF/CASDIF: General Dif
      if (Utils.isSfBackend()) {
        me.getBoStoreRole().setPKey(account_extension_id);
        me.getBoStoreRole().setCustomerPKey(me.getPKey());
      }
      deferreds.push(me.getBoStoreRole().saveAsync());
    }
    //Save LO_BpaRole
    if(Utils.isDefined(me.getLoBpaRole()) && !isCustomerPersistedDirty) {
      // SF/CASDIF: General Dif
      if (Utils.isSfBackend()) {
        var itemsLoBpaRole = me.getLoBpaRole().getAllItems();
        if (itemsLoBpaRole.length > 0) {
          itemsLoBpaRole[0].setPKey(account_extension_id);
        }
      }
      deferreds.push(me.getLoBpaRole().saveAsync());
    }
    //Reset object status for all to prevent multiple saves
    me.traverse(function(node){
      node.setObjectStatus(STATE.PERSISTED);
      if(node.isList) {
        node.getAllItems().forEach(function(item){
          item.setObjectStatus(STATE.PERSISTED);
        });
      }
    },function (a, b, c){});

    return when.all(deferreds);
  });

    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code above.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////

    return promise;
}