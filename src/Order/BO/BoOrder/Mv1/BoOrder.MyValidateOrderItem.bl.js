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
 * @function myValidateOrderItem
 * @this BoOrder
 * @kind businessobject
 * @async
 * @namespace CUSTOM
 * @returns promise
 */
function myValidateOrderItem(){
    var me = this;
    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code below.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////
    
var promise;
var messageCollector = new MessageCollector(); // blocks qty>0 && specialPrice=0 && basePrice=0
var messageCollector2 = new MessageCollector(); // blocks prebook && hasNoPromotion
var messageCollector3 = new MessageCollector(); // blocks negative price
var messageCollector4 = new MessageCollector(); // blocks no license order
var messageCollector5 = new MessageCollector(); // blocks no cash sales

var orderer = me.getLuOrderer();
var itemMetaDict = me.getBoOrderMeta().getItemMetaJsonDictionary();
var mainItems = me.getLoItems().getAllItems();
var getPromotion = function (slogan) {
  var promotionItems = me.getLoSelectablePromotion().getItems();
  return promotionItems.find(function (item) {
    return item.promotionSlogan === slogan;
  });
};
var isPromotionOf = function (slogan, promotionPKey) {
  var promotion = getPromotion(slogan);
  return Utils.isDefined(promotion) && promotionPKey === promotion.pKey;
};

var isCashSaleRestricted = ['FSO Chain', 'NAM Chain'].includes(orderer.ownership) && orderer.isCashSalesAvailable == '0';

var isLicenseMissing =
  Utils.isEmptyString(orderer.stateTobaccoNumber) ||
  Utils.isEmptyString(orderer.stateTaxNumber);

var getUoMName = (logisticUnit) => {
  switch (logisticUnit) {
    case "SalesUnit":
    case "Sales Unit":
      return "Carton";
    case "ConsumerUnit":
    case "Consumer Unit":
      return "Each";
    case "Layer":
      return "Case";
    default:
      return logisticUnit;
  }
};

var hasCashSaleOrReturnOrTPRPromo = false;

for (var j = 0; j < mainItems.length; j++) {
  var item = mainItems[j];
  var sdoItemMetaPKey = item.getSdoItemMetaPKey();
  var itemMeta = itemMetaDict.get(sdoItemMetaPKey);
  var quantity = item.getQuantity();

  var hasPromotion = !Utils.isEmptyString(item.promotionPKey);
  var hasNoPromotion = !hasPromotion;

  var isPromoOfPaperPickUp = isPromotionOf(
    "Paper Pick Up",
    item.getPromotionPKey()
  );
  var isPromoOfCompetitiveProductPurchase = isPromotionOf(
    "Competitive Product Purchase",
    item.getPromotionPKey()
  );
  var isPromoOfTPR = isPromotionOf("TPR", item.getPromotionPKey());

  if (
    quantity > 0 &&
    (itemMeta.text === "Cash Sale" ||
      itemMeta.text === "Return" ||
      isPromoOfTPR)
  ) {
    hasCashSaleOrReturnOrTPRPromo = true;
  }

  if (
    (itemMeta.text === "Cash Sale" || itemMeta.text === "Return") &&
    quantity > 0 &&
    hasNoPromotion &&
    item.basePrice == 0 &&
    item.specialPrice == 0
  ) {
    var newError = {
      level: "error",
      objectClass: "BoOrder",
      messageID: "CasSdoMainProductMessageInfo",
      messageParams: {
        productName: item.getText1(),
        uoM: getUoMName(item.getQuantityLogisticUnit()),
        itemType: itemMeta.text,
      },
    };
    messageCollector.add(newError);
  }

  if (
    itemMeta.text === "Prebook" &&
    quantity > 0 &&
    Utils.isEmptyString(item.wsName) &&
    messageCollector2.getCount() == 0
  ) {
    var newError = {
      level: "error",
      objectClass: "BoOrder",
      messageID: "CasSdoMainAddPrebookDidNotSetWholesaler",
      messageParams: {
        productName: item.getText1(),
        uoM: getUoMName(item.getQuantityLogisticUnit()),
        itemType: itemMeta.text,
      },
    };
    messageCollector2.add(newError);
  }

  if (itemMeta.text === "Cash Sale" && quantity > 0 && item.value <= 0) {
    if (isPromoOfPaperPickUp || isPromoOfCompetitiveProductPurchase) {
      // get rid of the condition's promotions
      // do nothing since the values of them are 0
    } else {
      var newError = {
        level: "error",
        objectClass: "BoOrder",
        messageID: "CasSdoMainProductMessageInfo",
        messageParams: {
          productName: item.getText1(),
          uoM: getUoMName(item.getQuantityLogisticUnit()),
          itemType: itemMeta.text,
        },
      };
      messageCollector3.add(newError);
    }
  }

  if (isCashSaleRestricted) {
    if (itemMeta.text === "Cash Sale" && quantity > 0) {
      var newError = {
        level: "error",
        objectClass: "BoOrder",
        messageID: "CasSdoMainCashSaleRestricted",
      };

      messageCollector5.add(newError);
    }
  }
}

if (hasCashSaleOrReturnOrTPRPromo && isLicenseMissing) {
  var newError = {
    level: "error",
    objectClass: "BoOrder",
    messageID: "CasSdoMainStoreLicenseIsMissing",
    messageParams: {},
  };
  messageCollector4.add(newError);
}

// Modal Summary
let messages = "";

if (messageCollector4.getCount() > 0) {
  messages += messageCollector4.getMessages().join("<br>") + "<br>";
}

if (messageCollector2.getCount() > 0) {
  messages += messageCollector2.getMessages().join("<br>") + "<br>";
}

if (messageCollector.getCount() > 0) {
  messages +=
    Localization.resolve(
      "BoOrder_CasSdoMainAddCashSaleWithoutSpecialPriceNorBasePriceIsLimitedSummary"
    ) +
    "<br>" +
    messageCollector.getMessages().join("<br>") +
    "<br>";
}

if (messageCollector3.getCount() > 0) {
  messages +=
    Localization.resolve(
      "BoOrder_CasSdoMainAddCashSaleWithPromotionHasInvalidPriceSummary"
    ) +
    "<br>" +
    messageCollector3.getMessages().join("<br>") +
    "<br>";
}

if (messageCollector5.getCount() > 0) {
  messages += messageCollector5.getMessages()[0] + "<br>";
}

if (messages.trim().length > 0) {
  //show always first of collected messages
  var buttonValues = {};
  buttonValues[Localization.resolve("Back")] = "back";
  promise = MessageBox.displayMessage(
    Localization.resolve("MessageBox_Title_Error"),
    messages,
    buttonValues
  ).then(function (result) {
    messageCollector.destroy();
    messageCollector2.destroy();
    messageCollector3.destroy();
    messageCollector4.destroy();
    messageCollector5.destroy();
    return result;
  });
} else {
  messageCollector.destroy();
  messageCollector2.destroy();
  messageCollector3.destroy();
  messageCollector4.destroy();
  messageCollector5.destroy();
  promise = when.resolve("valid");
}

    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code above.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////

    return promise;
}