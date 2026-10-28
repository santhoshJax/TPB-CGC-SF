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
 * @function replaceGetSurveys
 * @this BoJobManager
 * @kind businessobject
 * @async
 * @namespace CUSTOM
 * @param {String} posIdParam
 * @param {String} prdMainPKeyParam
 * @param {String} jobProductPKeyParam
 * @returns promise
 */
function replaceGetSurveys(posIdParam, prdMainPKeyParam, jobProductPKeyParam){
    var me = this;
    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code below.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////
    
var promise = when.resolve();
var deferreds = [];
var loCurrentPOS = me.getLoPOS().getItemsByParam({"posId": posIdParam});

if (loCurrentPOS.length > 0) {
  var liCurrentPOS = loCurrentPOS[0];
  var loSurveys = liCurrentPOS.getSurveys();

  if (Utils.isDefined(loSurveys)) {
    if (Utils.isDefined(prdMainPKeyParam) && !Utils.isEmptyString(prdMainPKeyParam)) {
      var loFilteredProducts;
      var loProducts = liCurrentPOS.getSurveyProducts();
      var loCurrentProduct = loProducts.getItemsByParam({"pKey": jobProductPKeyParam});

      if (loCurrentProduct.length > 0) {
        var liSurveyProduct = loCurrentProduct[0];
        var surveysNotInitialized = (liSurveyProduct.getSurveysInitialized() !== "1" || liSurveyProduct.getIsSurveyInitializedByManualPrdAdd() !== "1");

        // SAL-493: create visit jobs for Planned AND In Progress visits, as the standard
        // BoJobManager.GetSurveys does. "Planned" only meant products added after Start
        // got no survey records, so they were not saved and vanished when the visit reopened.
        if (surveysNotInitialized &&
          (me.getClbStatus() === BLConstants.VISIT.STATUS_PLANNED ||
            me.getClbStatus() === BLConstants.VISIT.STATUS_INPROGRESS)
        ) {
          var JDLPKeys = liSurveyProduct.getJDLPKeys().split(",").sort();

          // Build dictionary of previously answered questions...
          var sPosBpaMainPKey = liCurrentPOS.getPosId() === " " ? " " : liCurrentPOS.getBpaMainPKey();
          var existingJobMainSurveys = loSurveys.getItemsByParam({"posId": liCurrentPOS.getPosId(), "prdMainPKey": liSurveyProduct.getPrdMainPKey()});
          var existingJobListJobs = me.getLoExistingJobListJobs().getItemsByParamArray([
            {"posBpaMainPKey": sPosBpaMainPKey}, 
            {"prdMainPKey": liSurveyProduct.getPrdMainPKey()}, 
            {"jobListPKey": " ", "op": "NE"}]);
          var bConsiderTargetValues = me.getConsiderTargetValues();
          var currentJob;
          var dicKey;
          var idxJobMains;
          var dicExistingJobs = {};
          var jobDefAndListPKey;
          var sProductPrefix = Localization.resolve('surveyDetailProductPrefix');
          var sStandardACtivities = Localization.resolve('surveyStandardACtivities');
          var currentPOSColumnSurveys = Utils.createDictionary();
          me.getLoSurveyColumns().getAllItems().forEach(function(item){
            var currentMeasureType = ((posIdParam === " ") ? "Store" : "POS");
            if (item.getMeasureType() == currentMeasureType) {
              currentPOSColumnSurveys.add(item.getJobDefinitionMetaPKey(), item);
            }
          });

          // ... in this call
          for (idxJobMains = 0; idxJobMains < existingJobMainSurveys.length; idxJobMains++) {
            currentJob = existingJobMainSurveys[idxJobMains];
            var isManualProduct = liSurveyProduct.getIsProductAddedManually() == "1";
            var isJobAnswered = currentJob.getDone() == "1";

            if (currentJob.getPosId() === liCurrentPOS.getPosId()) {
              jobDefAndListPKey = currentJob.getJobDefinitionPKey() + currentJob.getJobListPKey();
              if (jobDefAndListPKey === "  ") {
                dicKey = currentJob.getJobDefinitionMetaPKey();
                dicExistingJobs[dicKey] = currentJob;
                if(!isManualProduct) {
                  deferreds.push(currentJob.setJobDefinitionListText(sProductPrefix + currentJob.getJobDefinitionListText(), true));
                }
                deferreds.push(currentJob.setGroupSort(" ", true));
                deferreds.push(currentJob.setHide("0", true));
                if(!isManualProduct || (isManualProduct && !isJobAnswered)) {
                  deferreds.push(currentJob.setObjectStatus(STATE.PERSISTED, true));
                }
              }
              else {
                dicKey = jobDefAndListPKey;
                dicExistingJobs[dicKey] = currentJob;
                deferreds.push(currentJob.setGroupSort(currentJob.getJobListPKey() + currentJob.getJobDefListPKey(), true));
                deferreds.push(currentJob.setHide("1", true));
                //If call job from current call is not a matrix survey and has an inactive Activity or JobDefTemplate then make the call job visible.
                var isJobfromCurrentCall = !Utils.startsWith(currentJob.getPKey(), 'Local___xxx');
                var isMatrixSurvey = currentPOSColumnSurveys.containsKey(currentJob.getJobDefinitionMetaPKey()) ;
                var isJDLActive = JDLPKeys.includes(currentJob.getJobDefListPKey());
                var isJDTActive = currentJob.getIsJDTActive() == "1";
                var isQuestionExcluded = currentJob.getIsQuestionExcluded() == "1";
                if (isJobfromCurrentCall && !isMatrixSurvey && (!isJDLActive || !isJDTActive || isQuestionExcluded)) {
                  deferreds.push(currentJob.setHide("0", true));
                }
                if(!isManualProduct || (isManualProduct && !isJobAnswered)) {
                  if (currentJob.getObjectStatus() == STATE.NEW) {
                    deferreds.push(currentJob.setObjectStatus(STATE.PERSISTED, true));
                  }                  
                }
                // If the call job was deleted, reset its object status and value
                if ((currentJob.getObjectStatus() & STATE.DELETED) == STATE.DELETED) {
                  deferreds.push(currentJob.setObjectStatus(STATE.PERSISTED, true));
                  deferreds.push(currentJob.setValue(liSurveyProduct.getSvyDistributed(), true));
                }
              }
            }
          }

          // ... in previous calls
          for (idxJobMains = 0; idxJobMains < existingJobListJobs.length; idxJobMains++) {
            currentJob = existingJobListJobs[idxJobMains];
            jobDefAndListPKey = currentJob.getJobDefinitionPKey() + currentJob.getJobListPKey();
            dicKey = jobDefAndListPKey;
            dicExistingJobs[dicKey] = " ";
          }

          var idxJDL;
          var sLastJDLPKey;
          var sCurrentJDLPKey;
          var surveylist = [];
          var listed = (liSurveyProduct.getListedPlanned().indexOf("L")) === -1 ? "0" : "1";
          var planned = (liSurveyProduct.getListedPlanned().indexOf("P")) === -1 ? "0" : "1";
          var prdMainPKey = liSurveyProduct.getPrdMainPKey();
          var posId = liCurrentPOS.getPosId();
          var bpaMainPKey = me.getBpaMainPKey();
          var clbMainPKey = me.getClbMainPKey();
          var referenceDate = me.getReferenceDate();
          var timeFrom = me.getTimeFrom();
          var currentPOSPKey = liCurrentPOS.getPosId();
          var posContentPKey = liCurrentPOS.getPosContentPKey();
          var bCreateSurvey;
          var idxJobDef;
          var newLiSurvey;
          var liJobDefinition;
          var jobDefs;

          //Add Matrix Surveys
          var currentPOSColumnSurvey;

          if (Utils.isEmptyString(sProductPrefix)) {
            sProductPrefix = "";
          }

          var addPrefixZeros = function (maxLength, value) {
            var prefixedValue = "" + value;
            while (prefixedValue.length < maxLength) {
              prefixedValue = "0" + prefixedValue;
            }
            return prefixedValue;
          };
          var sortFieldLength = 5;
          for (var key in currentPOSColumnSurveys.data) {
            currentPOSColumnSurvey = currentPOSColumnSurveys.get(key);

            // Check whether the question has already been answered in this call
            dicKey = currentPOSColumnSurvey.getJobDefinitionMetaPKey();
            bCreateSurvey = !(dicKey in dicExistingJobs);

            if (bCreateSurvey) {
              var newLiColumnSurvey = {
                "pKey": PKey.next(),
                "prdMainPKey": prdMainPKey,
                "posId": posIdParam,
                "surveyText": currentPOSColumnSurvey.getJobDefinitionMetaText(),
                "jobDefinitionListText": sStandardACtivities,
                "dataType": currentPOSColumnSurvey.getDataType(),
                "dataLength": currentPOSColumnSurvey.getDataLength(),
                "toggleId": currentPOSColumnSurvey.getToggleId(),
                "useStepper": currentPOSColumnSurvey.getUseStepper(),
                "stepSize": currentPOSColumnSurvey.getStepSize(),
                "considerMinValue": currentPOSColumnSurvey.getConsiderMinValue(),
                "minValue": currentPOSColumnSurvey.getMinValue(),
                "minDatePolicy": currentPOSColumnSurvey.getMinDatePolicy(),
                "considerMaxValue": currentPOSColumnSurvey.getConsiderMaxValue(),
                "maxValue": currentPOSColumnSurvey.getMaxValue(),
                "decimalPlaces": currentPOSColumnSurvey.getDecimalPlaces(),
                "maxDatePolicy": currentPOSColumnSurvey.getMaxDatePolicy(),
                "bpaMainPKey": bpaMainPKey,
                "clbMainPKey": clbMainPKey,
                "done": "1",
                "jobActionSuccess": " ",
                "jobDefinitionMetaPKey": currentPOSColumnSurvey.getJobDefinitionMetaPKey(),
                "jobDefinitionPKey": " ",
                "jobMetaPKey": currentPOSColumnSurvey.getJobMetaPKey(),
                "jobListPKey": " ",
                "jobDefListPKey": " ",
                "mandatory": currentPOSColumnSurvey.getMandatory(),
                "mandatoryImageId": (currentPOSColumnSurvey.getMandatory() == "1") ? "Mandatory" : "EmptyImage",
                "manual": "0",
                "sort": "" + currentPOSColumnSurvey.getDisplayColumnIndex(),
                "visitDate": referenceDate,
                "visitTime": timeFrom,
                "clbPOSCheckPKey": currentPOSPKey,
                "pOS": ((currentPOSColumnSurvey.getMeasureType() === "Store") ? "0" : "1"),
                "listed": listed,
                "planned": planned,
                "prdPOSContentPKey": posContentPKey,
                "targetValueColumn": currentPOSColumnSurvey.getTargetValueColumn(),
                "defaultValue": " ",
                "lastValue": " ",
                "history": " ",
                "targetValue": " ",
                "thresholdViolation": "No",
                "dataWareHouseKey": currentPOSColumnSurvey.getDataWareHouseKey(),
                "groupSort": " " + addPrefixZeros(sortFieldLength, currentPOSColumnSurvey.getDisplayColumnIndex()),
                "hide": "0",
                "value": liSurveyProduct["get" + currentPOSColumnSurvey.getDisplayColumnNameCapitalized()]()
              };
              if (bConsiderTargetValues && currentPOSColumnSurvey.getPresetting() === "TargetValue" && currentPOSColumnSurvey.getTargetValueColumn() != "0") {
                newLiColumnSurvey.targetValue = liSurveyProduct["getPresetting" + currentPOSColumnSurvey.getTargetValueColumn()]();
                if (currentPOSColumnSurvey.getToggleId() == "DomPrdDistributed" && (Utils.isEmptyString(newLiColumnSurvey.value) || newLiColumnSurvey.value == "0")) {
                  newLiColumnSurvey.value = 'Distributed';
                }
              }
              else if (currentPOSColumnSurvey.getToggleId() == "DomPrdDistributed" && newLiColumnSurvey.value == "0") {
                newLiColumnSurvey.value = 'Distributed';
              }

              var isManualMatrixSurvey = !loProducts.isJDLPKeyMatch(currentPOSColumnSurvey.getJobDefListPKeys(), liSurveyProduct.getJDLPKeys());
              if (isManualMatrixSurvey || liSurveyProduct.getIsProductAddedManually() == "1") {
                newLiColumnSurvey.manual = "1";
              }

              if (newLiColumnSurvey.value == "NaN") {
                newLiColumnSurvey.value = "0";
              }

              // A manually added product is auto-Distributed without any user input, so mark its
              // column survey dirty, as the job-definition surveys below already are. Otherwise it
              // stays NEW only, the save skips it, and a product added to a store with no activity
              // is lost when the visit is reopened. Other column surveys keep standard behaviour.
              newLiColumnSurvey.objectStatus = (liSurveyProduct.getIsProductAddedManually() == "1") ?
                (STATE.NEW | STATE.DIRTY) : STATE.NEW;
              surveylist.push(newLiColumnSurvey);
            }
          }

          for (idxJDL = 0; idxJDL < JDLPKeys.length; idxJDL++) {
            sCurrentJDLPKey = JDLPKeys[idxJDL];
            if (sLastJDLPKey !== sCurrentJDLPKey) {
              jobDefs = me.getLoJobDefinitions().getItemsByParam({
                "jobMetaId": "Survey",
                "pOS": liCurrentPOS.getIsPOS(),
                "jobDefListPKey": sCurrentJDLPKey
              });

              for (idxJobDef = 0; idxJobDef < jobDefs.length; idxJobDef++) {
                liJobDefinition = jobDefs[idxJobDef];

                // Check whether the question has already been answered in this call or a in a previous call
                dicKey = liJobDefinition.getJobDefinitionPKey() + liJobDefinition.getJobListPKey();
                bCreateSurvey = !(dicKey in dicExistingJobs);
                var isCurrentCallJob = false;
                if(!Utils.isEmptyString(dicExistingJobs[dicKey])){
                  isCurrentCallJob = dicExistingJobs[dicKey].getClbMainPKey() == me.getClbMainPKey();
                }
                var wasAnsweredInThisCall = dicKey in dicExistingJobs && isCurrentCallJob;

                if (bCreateSurvey || (!wasAnsweredInThisCall && liJobDefinition.presetting !== "LastValue")) {
                  newLiSurvey = {
                    "pKey": PKey.next(),
                    "prdMainPKey": prdMainPKey,
                    "posId": posIdParam,
                    "surveyText": liJobDefinition.getJobDefinitionMetaText(),
                    "jobDefinitionListText": liJobDefinition.getJobDefinitionListText(),
                    "dataType": liJobDefinition.getDataType(),
                    "dataLength": liJobDefinition.getDataLength(),
                    "toggleId": liJobDefinition.getToggleId(),
                    "useStepper": liJobDefinition.getUseStepper(),
                    "stepSize": liJobDefinition.getStepSize(),
                    "considerMinValue": liJobDefinition.getConsiderMinValue(),
                    "minValue": liJobDefinition.getMinValue(),
                    "minDatePolicy": liJobDefinition.getMinDatePolicy(),
                    "considerMaxValue": liJobDefinition.getConsiderMaxValue(),
                    "maxValue": liJobDefinition.getMaxValue(),
                    "decimalPlaces": liJobDefinition.getDecimalPlaces(),
                    "maxDatePolicy": liJobDefinition.getMaxDatePolicy(),
                    "bpaMainPKey": bpaMainPKey,
                    "clbMainPKey": clbMainPKey,
                    "done": "1",
                    "jobActionSuccess": liJobDefinition.getJobActionSuccess(),
                    "jobDefinitionMetaPKey": liJobDefinition.getJobDefinitionMetaPKey(),
                    "jobDefinitionPKey": liJobDefinition.getJobDefinitionPKey(),
                    "jobMetaPKey": liJobDefinition.getJobMetaPKey(),
                    "jobListPKey": liJobDefinition.getJobListPKey(),
                    "jobDefListPKey": liJobDefinition.getJobDefListPKey(),
                    "mandatory": liJobDefinition.getMandatory(),
                    "mandatoryImageId": (liJobDefinition.getMandatory() == "1") ? "Mandatory" : "EmptyImage",
                    "manual": (liSurveyProduct.getIsProductAddedManually() == "1") ? "1" : "0",
                    "sort": liJobDefinition.getSort(),
                    "visitDate": referenceDate,
                    "visitTime": timeFrom,
                    "clbPOSCheckPKey": currentPOSPKey,
                    "pOS": liJobDefinition.getPOS(),
                    "listed": listed,
                    "planned": planned,
                    "prdPOSContentPKey": posContentPKey,
                    "targetValueColumn": liJobDefinition.getTargetValueColumn(),
                    "value" : liSurveyProduct["get" + currentPOSColumnSurvey.getDisplayColumnNameCapitalized()](),
                    "defaultValue" : (!Utils.isEmptyString(liJobDefinition.getDefaultValue()) && liJobDefinition.getDataType() === "Date") ? liJobDefinition.getDefaultValue() : " ",
                    "lastValue": " ",
                    "history": " ",
                    "targetValue": " ",
                    "thresholdViolation": "No",
                    "dataWareHouseKey": liJobDefinition.getDataWareHouseKey(),
                    "groupSort": Utils.isDefined(currentPOSColumnSurvey) ? liJobDefinition.getJobListPKey() + liJobDefinition.getJobDefListPKey() + addPrefixZeros(sortFieldLength, currentPOSColumnSurvey.getDisplayColumnIndex()) : " ",
                    "hide": (liJobDefinition.getIsMatrixSurvey() == "1") ? "1" : "0"
                  };
                  if (bConsiderTargetValues && liJobDefinition.getPresetting() === "TargetValue" && liJobDefinition.getTargetValueColumn() != "0") {
                    newLiSurvey.targetValue = liSurveyProduct["getPresetting" + liJobDefinition.getTargetValueColumn()]();
                    newLiSurvey.value = newLiSurvey.targetValue;
                    if (liJobDefinition.getToggleId() == "PrdDistributed" && (Utils.isEmptyString(newLiSurvey.value) || newLiSurvey.value == "0")) {
                      newLiSurvey.value = 'Distributed';
                    }
                  }
                  else if(liJobDefinition.getToggleId() == "PrdDistributed" && (newLiSurvey.value == "0" || Utils.isEmptyString(newLiSurvey.value))) {
                    newLiSurvey.value = 'Distributed';
                  }
                  if (liJobDefinition.getToggleId() == "PrdDistributed") {
                    newLiSurvey.viaScanner = (liSurveyProduct.getSvyViaScanner() === "1") ? "1" : "0";
                    newLiSurvey.distributionSource = (newLiSurvey.viaScanner === "1") ? "Offline Scanner" : "Offline Manual";
                  }
                  newLiSurvey.objectStatus = STATE.NEW | STATE.DIRTY;
                  surveylist.push(newLiSurvey);
                }
                else {
                  
                  if (dicExistingJobs[dicKey] != " ")
                  {
                    if (liJobDefinition.getIsMatrixSurvey() == "0") {
                      deferreds.push(dicExistingJobs[dicKey].setJobDefinitionListText(liJobDefinition.getJobDefinitionListText()));
                      deferreds.push(dicExistingJobs[dicKey].setHide("0", true));
                      if(liSurveyProduct.getIsProductAddedManually() !== "1" || (liSurveyProduct.getIsProductAddedManually() == "1" && dicExistingJobs[dicKey].getDone() !== "1")) {
                        deferreds.push(dicExistingJobs[dicKey].setObjectStatus(STATE.PERSISTED));
                      }
                    }
                    if (Utils.startsWith(dicExistingJobs[dicKey].getPKey(), 'Local___xxx')) {
                      deferreds.push(dicExistingJobs[dicKey].setClbMainPKey(me.getClbMainPKey()));
                      deferreds.push(dicExistingJobs[dicKey].setPKey(PKey.next()));
                      deferreds.push(dicExistingJobs[dicKey].setObjectStatus(STATE.NEW));
                      deferreds.push(dicExistingJobs[dicKey].setDone("1"));
                      
                      // All manually added products should be Distributed.
                      if (liSurveyProduct.getIsProductAddedManually() == "1") {
                        deferreds.push(dicExistingJobs[dicKey].setValue("Distributed"));
                        deferreds.push(dicExistingJobs[dicKey].setManual("1"));
                        if (liJobDefinition.getToggleId() == "PrdDistributed") {
                          var reViaScanner = (liSurveyProduct.getSvyViaScanner() === "1") ? "1" : "0";
                          deferreds.push(dicExistingJobs[dicKey].setViaScanner(reViaScanner));
                          deferreds.push(dicExistingJobs[dicKey].setDistributionSource((reViaScanner === "1") ? "Offline Scanner" : "Offline Manual"));
                        }
                      }
                    }                  
                  }
                }
              }
            }
            sLastJDLPKey = sCurrentJDLPKey;
          }
          if (surveylist.length > 0) {
            loSurveys.addItems(surveylist);
          }
          deferreds.push(liSurveyProduct.setSurveysInitialized("1", true));
          deferreds.push(liSurveyProduct.setIsSurveyInitializedByManualPrdAdd("1", false));
        }
        else {
          loSurveys.setFilterArray([ {"done" : "0", "op" : "EQ"}, {"objectStatus" : STATE.PERSISTED, "op" : "EQ"} ]);
          var items = loSurveys.getItemObjects();

          for (var i=0; i < items.length; i++) {
            items[i].objectStatus = STATE.NEW;
          }
          loSurveys.resetFilter("done");
          loSurveys.resetFilter("objectStatus");
        }
      }
    }
  }
}
promise = when.all(deferreds);

    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code above.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////

    return promise;
}