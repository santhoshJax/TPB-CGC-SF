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
 * @function myGenerateMassPrebookItems
 * @this LoOrderItems
 * @kind listobject
 * @async
 * @namespace CUSTOM
 * @returns promise
 */
function myGenerateMassPrebookItems(){
    var me = this;
    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code below.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////
    
var promise = when.resolve();

// inputs for this module
var mainBO = Framework.getProcessContext().mainBO;

// Only when order is editable then generate the new ones
if (mainBO.getPhase() === "Initial") {
  // states and processes for this modules
  // var ChangeItemType__MainItem;
  var AddProduct_ButtonPressed = "buttonPressed";
  var CloneProductButtonProcess;
  var CloneProductItemMetaPKey;
  var ProductAddUoMList;
  var itemMeta;
  var productsToAdd;

  promise
    .then(function () {
      // get item template
      itemMeta = mainBO.boOrderMeta.loOrderItemMetas
        .getItems()
        .find((item) => item.id == "Prebook");

      CloneProductItemMetaPKey = itemMeta.pKey;
      CloneProductButtonProcess = true;
    })
    .then(function () {
      // get add product info

      var visitedRefPKeys = new Set();
      productsToAdd = mainBO.loItems
        .getAllItems()
        .filter(function (item) {
          return item.type == "Cash Sale" && item.tpbPromoted == 1;
        })
        .filter(function (item) {
          // remove duplicates expects the first
          if (visitedRefPKeys.has(item.refPKey)) return false;
          visitedRefPKeys.add(item.refPKey);
          return true;
        });
      // TODO: more filters for example removing the ones in order items

      visitedRefPKeys = null;
    })
    .then(function () {
      // get waves
      var waveSql = "";
      waveSql += " SELECT ";
      waveSql += "   productWave.Id AS id, ";
      waveSql += "   productWave.TPB_Product__c AS productId, ";
      waveSql += "   productWave.TPB_Promotion_Waves__c AS waveId, ";
      waveSql += "   promotionWaves.Name AS waveName, ";
      waveSql +=
        "   promotionWaves.TPB_Wave_Period_Date_From__c AS waveDateFrom, ";
      waveSql +=
        "   promotionWaves.TPB_Wave_Period_Date_Thru__c AS waveDateThru ";
      waveSql += " FROM ";
      waveSql += "   TPB_Promotion_Allocation_Item__c AS productWave ";
      waveSql += "   INNER JOIN TPB_Promotion_Waves__c AS promotionWaves ";
      waveSql +=
        "   ON productWave.TPB_Promotion_Waves__c = promotionWaves.Id ";
      waveSql += "   AND ( ";
      waveSql += "     date ('now', 'start of month') <= date ( ";
      waveSql += "       promotionWaves.TPB_Wave_Period_Date_From__c, ";
      waveSql += "       'unixepoch' ";
      waveSql += "     ) ";
      waveSql += "     OR date ('now', '+1 day') <= date ( ";
      waveSql += "       promotionWaves.TPB_Wave_Period_Date_Thru__c, ";
      waveSql += "       'unixepoch' ";
      waveSql += "     ) ";
      waveSql += "   ) ";
      waveSql += " WHERE ";
      waveSql += "   productWave.TPB_Account__c = '#ordererPKey#' ";

      var waveSqlFinal = Utils.replaceMacros(waveSql, {
        ordererPKey: mainBO.ordererPKey,
      });

      // query for waves
      return Facade.executeQueries([waveSqlFinal]).then(function ([waves]) {
        return waves;
      });
    })
    .then(function (waves) {
      return when.all(
        productsToAdd.map(function (product) {
          // process Product one by one
          return when
            .resolve()
            .then(function () {
              // clear filters
              mainBO.boOrderMeta.loOrderItemMetas.resetFilter("active");
              mainBO.boOrderMeta.loOrderItemMetas.resetFilter("id");

              mainBO.myGetItemMetaForCloneProduct(itemMeta.pKey);
              mainBO.boItemTabManager.setCloneProduct_ItemMeta(itemMeta);

              return mainBO.boItemTabManager
                .getAvailableUoMForProduct(
                  product.prdMainPKey,
                  mainBO.boItemTabManager.cloneProduct_ItemMeta
                )
                .then(function (res) {
                  ProductAddUoMList = res;
                });
            })
            .then(function () {})
            .then(function () {
              var currentProductWaves = waves.filter(function (wave) {
                return wave.productId == product.prdMainPKey;
              });

              // 无效记录返回
              if (currentProductWaves.length == 0) {
                throw new Error("No waves found");
              }

              return currentProductWaves;
            })
            .then(function (currentProductWaves) {
              var AddProduct_UoM =
                mainBO.boItemTabManager.getDefaultUoMForProduct(
                  ProductAddUoMList,
                  mainBO.boItemTabManager.cloneProduct_ItemMeta
                );

              var AddProduct_PiecesPerSmallestUnit =
                ProductAddUoMList.getPiecesPerSmallestUnitByUnit(
                  AddProduct_UoM
                );

              mainBO.resetCurrentItemFilter();

              return when.all(
                currentProductWaves.map(function (waveForAdd) {
                  // TODO: filter if waveForAdd is available (Eg. skip add if waveForAdd is existed in cart)
                  // process Wave one by one during a Product processing
                  return mainBO.loItems
                    .addItemFromObject(
                      mainBO.loProductForAdd,
                      product.prdMainPKey,
                      mainBO.pKey,
                      mainBO.ordererPKey,
                      mainBO.selectedPromotionPKey,
                      mainBO.boOrderMeta.considerSelectablePromotion,
                      mainBO.commitDate,
                      mainBO.boItemTabManager.cloneProduct_ItemMeta,
                      mainBO.clbMainPKey,
                      mainBO.boItemTabManager.addProduct_CriterionAttribute,
                      mainBO.boOrderMeta.barcodeScanBehavior,
                      mainBO.boItemTabManager.addProduct_ScanIncrementQuantity,
                      "massPrebook", // CloneProductButtonProcess,
                      AddProduct_UoM,
                      AddProduct_PiecesPerSmallestUnit,
                      mainBO.boOrderMeta,
                      mainBO.loSuggestedQuantity,
                      waveForAdd
                    )
                    .then(function (addResult) {
                      mainBO.boItemTabManager.addProductResult = addResult;
                    });
                })
              );
            })
            .catch(function (error) {
              console.log("No break for error", error);
            });
        })
      );
    })
    .then(function addProductsFinally() {
      // mainBO.myRemoveCartItem(
      //   ChangeItemType__MainItem,
      //   mainBO.boItemTabManager.addProductResult.unitOfMeasureItem
      // );

      var CurrentItemFilterId = mainBO.loItems.setItemFilter({
        filterId: mainBO.boItemTabManager.currentItemFilterId,
        categoryId: mainBO.boItemTabManager.currentFilterId,
        promotionPKey: mainBO.selectedPromotionPKey,
      });

      // ...

      mainBO.updateItemFilterCountAfterAdd(
        mainBO.boItemTabManager.addProductResult
      );

      return mainBO.setEARight();
    })
    .then(function () {
      mainBO.boItemTabManager.addProductResult =
        mainBO.boItemTabManager.selectItemAfterAdd(
          mainBO.boItemTabManager.addProductResult,
          mainBO.boOrderMeta.barcodeScanBehavior,
          AddProduct_ButtonPressed
        );

      // this is InitializeItemWholesalerAfterAddProduct
      return mainBO.myInitializeItemWholesaler();
    });
}

    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code above.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////

    return promise;
}