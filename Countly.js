/**
 * Countly SDK React Native Bridge
 * https://github.com/Countly/countly-sdk-react-native-bridge
 * @Countly
 */

 import {
    Platform,
    NativeModules,
    NativeEventEmitter
} from 'react-native';
import parseErrorStackLib from '../react-native/Libraries/Core/Devtools/parseErrorStack.js';

const CountlyReactNative = NativeModules.CountlyReactNative;
const eventEmitter = new NativeEventEmitter(CountlyReactNative);

const Countly = {};
Countly.serverUrl = "";
Countly.appKey = "";

Countly.messagingMode = {"DEVELOPMENT":"1","PRODUCTION":"0", "ADHOC": "2"};
if (Platform.OS.match("android")) {
    Countly.messagingMode.DEVELOPMENT = "2";
}

// countly initialization
Countly.init = async function(serverUrl, appKey, deviceId){

    if(deviceId == "") {
        deviceId = null;
        Countly.logError("init", "Device Id during init can't be empty string");
    }
    Countly.serverUrl = serverUrl;
    Countly.appKey = appKey;
    var args = [];
    args.push(serverUrl);
    args.push(appKey);
    args.push(deviceId);
    await CountlyReactNative.init(args);
}

Countly.isInitialized = async function(){
    // returns a promise
    return await CountlyReactNative.isInitialized();
}

Countly.hasBeenCalledOnStart = function(){
    // returns a promise
    return CountlyReactNative.hasBeenCalledOnStart();
}

// countly sending various types of events
Countly.sendEvent = function(options){
    var args = [];
    var eventType = "event"; //event, eventWithSum, eventWithSegment, eventWithSumSegment
    var segments = {};

    if(options.eventSum)
        eventType = "eventWithSum";
    if(options.segments)
        eventType = "eventWithSegment";
    if(options.segments && options.eventSum)
        eventType = "eventWithSumSegment";

    args.push(eventType);

    if(options.eventName){
        args.push(options.eventName.toString());
    }else{
        args.push("");
    }
    if(options.eventCount){
        args.push(options.eventCount.toString());
    }
    else{
        args.push("1");
    }

    if(options.eventSum){
        options.eventSum = options.eventSum.toString();
        if(options.eventSum.indexOf(".") == -1){
            options.eventSum = parseFloat(options.eventSum).toFixed(2);
            args.push(options.eventSum);
        }else{
            args.push(options.eventSum);
        }
    }

    if(options.segments)
        segments = options.segments;
    for (var event in segments) {
        args.push(event);
        args.push(segments[event]);
    }
    CountlyReactNative.event(args);
}

/**
 * Enable or disable automatic view tracking
 * 
 * @deprecated in 20.04.6
 * 
 */
Countly.setViewTracking = async function(boolean) {
    if(await CountlyReactNative.isLoggingEnabled()) {
        console.log("[CountlyReactNative] setViewTracking is deprecated.");
    }
}

/**
 * Record custom view to Countly.
 * 
 * @param {string} recordView - name of the view
 * @param {Map} segments - allows to add optional segmentation,
 * Supported data type for segments values are String, int, double and bool
 */
Countly.recordView = async function(recordView, segments){
    var message = await Countly.validateString(recordView, "view name", "recordView");
    if(message) {
        return message;
    }

    var args = [];
    args.push(String(recordView));
    if(!segments){
        segments = {};
    }
    for(var key in segments){
        args.push(key);
        args.push(segments[key]);
    }
    CountlyReactNative.recordView(args);
};

/**
 * Disable push notifications feature, by default it is enabled.
 * Currently implemented for iOS only
 * Should be called before Countly init
 */
Countly.disablePushNotifications = function(){
    if (!Platform.OS.match("ios")) return "disablePushNotifications : To be implemented";
    CountlyReactNative.disablePushNotifications();
}

/**
 * 
 * Set messaging mode for push notifications
 * Should be called before Countly init
 */
Countly.pushTokenType = async function(tokenType, channelName, channelDescription){
    var message = await Countly.validateString(tokenType, "tokenType", "pushTokenType");
    if(message) {
        return message;
    }

    var args = [];
    args.push(tokenType);
    args.push(channelName || "");
    args.push(channelDescription || "");
    CountlyReactNative.pushTokenType(args);
}
Countly.sendPushToken = function(options){
    var args = [];
    args.push(options.token || "");
    CountlyReactNative.sendPushToken(args);
}

/**
 * This method will ask for permission, enables push notification and send push token to countly server.
 * Should be called after Countly init
 */
Countly.askForNotificationPermission = function(){
    CountlyReactNative.askForNotificationPermission([]);
}

/**
 * 
 * Set callback to receive push notifications
 * @param { callback listner } theListener 
 */
Countly.registerForNotification = function(theListener){
    var event = eventEmitter.addListener('onCountlyPushNotification', theListener);
    CountlyReactNative.registerForNotification([]);
    return event;
};
// countly start for android
Countly.start = function(){
    CountlyReactNative.start();
}

// countly stop for android
Countly.stop = function(){
    CountlyReactNative.stop();
}

/**
 * Enable countly internal debugging logs
 * Should be called before Countly init
 * 
 * @deprecated in 20.04.6
 * 
 * @function Countly.setLoggingEnabled should be used to enable/disable countly internal debugging logs
 */

Countly.enableLogging = function(){
    CountlyReactNative.setLoggingEnabled([true]);
}

/**
 * Disable countly internal debugging logs
 * 
 * @deprecated in 20.04.6
 * 
 * @function Countly.setLoggingEnabled should be used to enable/disable countly internal debugging logs
 */
Countly.disableLogging = function(){
    CountlyReactNative.setLoggingEnabled([false]);
}

/**
 * Set to true if you want to enable countly internal debugging logs
 * Should be called before Countly init
 */
Countly.setLoggingEnabled = function(enabled = true){
    CountlyReactNative.setLoggingEnabled([enabled]);
}

Countly.onSuccess = function(result){
    // alert(result);
}

Countly.onError = function(error){
     // alert("error");
     // alert(error);
}
Countly.demo = function(){

}

/**
 * Set user initial location
 * Should be called before init
 * @param {ISO Country code for the user's country} countryCode 
 * @param {Name of the user's city} city 
 * @param {comma separate lat and lng values. For example, "56.42345,123.45325"} location 
 * @param {IP address of user's} ipAddress 
 * */

Countly.setLocationInit = function(countryCode, city, location, ipAddress){
    var args = [];
    args.push(countryCode || "null");
    args.push(city || "null");
    args.push(location || "null");
    args.push(ipAddress || "null");
    CountlyReactNative.setLocationInit(args);
}

Countly.setLocation = function(countryCode, city, location, ipAddress){
    var args = [];
    args.push(countryCode || "null");
    args.push(city || "null");
    args.push(location || "null");
    args.push(ipAddress || "null");
    CountlyReactNative.setLocation(args);
}
Countly.disableLocation = function(){
    CountlyReactNative.disableLocation();
}
/** 
 * 
 * Get currently used device Id.
 * Should be called after Countly init
 * */
Countly.getCurrentDeviceId = async function(){
    if(!await Countly.isInitialized()) {
        var message = "init must be called before getCurrentDeviceId";
        Countly.logWarning("getCurrentDeviceId", message);
        return message;
      }
      const result = await CountlyReactNative.getCurrentDeviceId();
      return result;
  }

Countly.changeDeviceId = async function(newDeviceID, onServer){
    var message = await Countly.validateString(newDeviceID, "newDeviceID", "changeDeviceId");
    if(message) {
        return message;
    }

    if(onServer === false){
        onServer = "0";
    }else{
        onServer = "1";
    }
    newDeviceID = newDeviceID.toString();
    CountlyReactNative.changeDeviceId([newDeviceID, onServer]);
}

/**
 * 
 * Set to "true" if you want HTTP POST to be used for all requests
 * Should be called before Countly init
 */
Countly.setHttpPostForced = function(boolean = true){
    var args = [];
    args.push(boolean == true ?"1":"0");
    CountlyReactNative.setHttpPostForced(args);
}

Countly.isCrashReportingEnabled = false;
/**
 * Enable crash reporting to report unhandled crashes to Countly
 * Should be called before Countly init
 */
Countly.enableCrashReporting = async function(){
    CountlyReactNative.enableCrashReporting();
    if (ErrorUtils && !Countly.isCrashReportingEnabled) {
        if(await CountlyReactNative.isLoggingEnabled()) {
            console.log("[CountlyReactNative] Adding Countly JS error handler.");
        }
        var previousHandler = ErrorUtils.getGlobalHandler();
        ErrorUtils.setGlobalHandler(function (error, isFatal) {
            let jsStackTrace = Countly.getStackTrace(error);
            let errorTitle;
            let stackArr;
            if(jsStackTrace == null) {
                errorTitle = error.name;
                stackArr = error.stack;
            }
            else {
                var fname = jsStackTrace[0].file;
                if (fname.startsWith("http")) {
                    var chunks = fname.split("/");
                    fname = chunks[chunks.length-1].split("?")[0];
                }
                errorTitle = `${error.name} (${jsStackTrace[0].methodName}@${fname})`;
                const regExp = "(.*)(@?)http(s?).*/(.*)\\?(.*):(.*):(.*)";
                stackArr = error.stack.split("\n").map(row => {
                    row = row.trim();
                    if (!row.includes("http")) return row;
                    else {
                        const matches = row.match(regExp);
                        return matches && matches.length == 8 ? `${matches[1]}${matches[2]}${matches[4]}(${matches[6]}:${matches[7]})` : row;
                    }
                })
                stackArr = stackArr.join("\n");
            }
            
            CountlyReactNative.logJSException(errorTitle, error.message.trim(), stackArr);
            
            if (previousHandler) {
                previousHandler(error, isFatal);
            }
        });
    }
    Countly.isCrashReportingEnabled = true;
}

Countly.getStackTrace = (e) => {
    let jsStackTrace = null;
    try {
        if (Platform.hasOwnProperty("constants")) {
            // RN version >= 0.63
            if (Platform.constants.reactNativeVersion.minor >= 64)
              // RN version >= 0.64
              jsStackTrace = parseErrorStackLib(e.stack);
            // RN version == 0.63
            else jsStackTrace = parseErrorStackLib(e);
          }
          // RN version < 0.63
          else jsStackTrace = parseErrorStackLib(e);
    }
    catch (e) {
       // console.log(e.message);
     }
    return jsStackTrace;
  };

Countly.addCrashLog = function(crashLog){
    CountlyReactNative.addCrashLog([crashLog]);
}

Countly.logException = function(exception, nonfatal, segments){
    var exceptionArray = exception.split('\n');
    var exceptionString = "";
    for(var i=0,il=exceptionArray.length;i<il;i++){
        exceptionString += "" +exceptionArray[i] +"\n";
    }
    var args = [];
    args.push(exceptionString || "");
    args.push(nonfatal || false);
    for(var key in segments){
        args.push(key);
        args.push(segments[key].toString());
    }
    CountlyReactNative.logException(args);
}
Countly.setCustomCrashSegments = function(segments){
    var args = [];
    for(var key in segments){
        args.push(key.toString());
        args.push(segments[key].toString());
    }
    CountlyReactNative.setCustomCrashSegments(args);
}
Countly.startSession = function(){
    CountlyReactNative.startSession();
}
Countly.endSession = function(){
    CountlyReactNative.endSession();
}

/**
 * 
 * Set the optional salt to be used for calculating the checksum of requested data which will be sent with each request, using the &checksum field
 * Should be called before Countly init
 */
Countly.enableParameterTamperingProtection = async function(salt){
    var message = await Countly.validateString(salt, "salt", "enableParameterTamperingProtection");
    if(message) {
        return message;
    }

    CountlyReactNative.enableParameterTamperingProtection([salt.toString()]);
}

/**
 * 
 * It will ensure that connection is made with one of the public keys specified
 * Should be called before Countly init
 */
Countly.pinnedCertificates = async function(certificateName){
    var message = await Countly.validateString(certificateName, "certificateName", "pinnedCertificates");
    if(message) {
        return message;
    }
        
    CountlyReactNative.pinnedCertificates([certificateName]);
}
Countly.startEvent = async function(eventName){
    var message = await Countly.validateString(eventName, "eventName", "startEvent");
    if(message) {
        return message;
    }

    CountlyReactNative.startEvent([eventName.toString()]);
}
Countly.cancelEvent = async function(eventName){
    var message = await Countly.validateString(eventName, "eventName", "cancelEvent");
    if(message) {
        return message;
    }

    CountlyReactNative.cancelEvent([eventName.toString()]);
}
Countly.endEvent = function(options){
    if(typeof options === "string") {
        options = {eventName: options};
    }
    var args = [];
    var eventType = "event"; //event, eventWithSum, eventWithSegment, eventWithSumSegment
    var segments = {};

    if(options.eventSum)
        eventType = "eventWithSum";
    if(options.segments)
        eventType = "eventWithSegment";
    if(options.segments && options.eventSum)
        eventType = "eventWithSumSegment";

    args.push(eventType);

    if(!options.eventName)
        options.eventName = "";
    args.push(options.eventName.toString());

    if(!options.eventCount)
        options.eventCount = "1";
    args.push(options.eventCount.toString());

    if(options.eventSum){
        var eventSumTemp = options.eventSum.toString();
        if(eventSumTemp.indexOf(".") == -1){
            eventSumTemp = parseFloat(eventSumTemp).toFixed(2);
            args.push(eventSumTemp);
        }else{
            args.push(eventSumTemp);
        }
    }else{
        args.push('0.0');
    }

    if(options.segments)
        segments = options.segments;
    for (var event in segments) {
        args.push(event);
        args.push(segments[event]);
    }
    CountlyReactNative.endEvent(args);
};

// countly sending user data
Countly.setUserData = async function(userData){
    var message = null;
    if(!userData) {
        message = "User profile data should not be null or undefined";
        Countly.logError("setUserData", message);
        return message;
    }
    if(typeof userData !== 'object'){
        message = "unsupported data type of user data '" + (typeof userData) + "'";
        Countly.logWarning("setUserData", message);
        return message;
    }
    var args = [];
    for(var key in userData){
        if (typeof userData[key] != "string" && key.toString() != "byear") 
        {
            message = "skipping value for key '" + key.toString() + "', due to unsupported data type '" + (typeof userData[key]) + "', its data type should be 'string'";
            Countly.logWarning("setUserData", message);
        }
        
    }

    if(userData.org && !userData.organization) {
        userData.organization = userData.org;
        delete userData.org;
    }

    if(userData.byear) {
        Countly.validateParseInt(userData.byear, "key byear", "setUserData");
        userData.byear = userData.byear.toString();
    }
    args.push(userData);

    CountlyReactNative.setUserData(args);
};

Countly.userData = {};
Countly.userData.setProperty = async function(keyName, keyValue){
    var message = await Countly.validateString(keyName, "key", "setProperty");
    if(message) {
        return message;
    }

    message = await Countly.validateValidUserData(keyValue, "value", "setProperty");
    if(message) {
        return message;
    }
    keyName = keyName.toString();
    keyValue = keyValue.toString();
    if(keyName && (keyValue || keyValue == "")) {
        CountlyReactNative.userData_setProperty([keyName, keyValue]);
    }
};
Countly.userData.increment = async function(keyName){
    var message = await Countly.validateString(keyName, "key", "setProperty");
    if(message) {
        return message;
    }
    keyName = keyName.toString();
    if(keyName) {
        CountlyReactNative.userData_increment([keyName]);
    }
};
Countly.userData.incrementBy = async function(keyName, keyValue){
    var message = await Countly.validateString(keyName, "key", "incrementBy");
    if(message) {
        return message;
    }
    message = await Countly.validateUserDataValue(keyValue, "value", "incrementBy");
    if(message) {
        return message;
    }
    var intValue = parseInt(keyValue).toString();
    CountlyReactNative.userData_incrementBy([keyName, intValue]);
};
Countly.userData.multiply = async function(keyName, keyValue){
    var message = await Countly.validateString(keyName, "key", "multiply");
    if(message) {
        return message;
    }
    message = await Countly.validateUserDataValue(keyValue, "value", "multiply");
    if(message) {
        return message;
    }
    var intValue = parseInt(keyValue).toString();
    CountlyReactNative.userData_multiply([keyName, intValue]);
};
Countly.userData.saveMax = async function(keyName, keyValue){
    var message = await Countly.validateString(keyName, "key", "saveMax");
    if(message) {
        return message;
    }
    message = await Countly.validateUserDataValue(keyValue, "value", "saveMax");
    if(message) {
        return message;
    }
    var intValue = parseInt(keyValue).toString();
    CountlyReactNative.userData_saveMax([keyName, intValue]);
};
Countly.userData.saveMin = async function(keyName, keyValue){
    var message = await Countly.validateString(keyName, "key", "saveMin");
    if(message) {
        return message;
    }
    message = await Countly.validateUserDataValue(keyValue, "value", "saveMin");
    if(message) {
        return message;
    }
    var intValue = parseInt(keyValue).toString();
    CountlyReactNative.userData_saveMin([keyName, intValue]);
};
Countly.userData.setOnce = async function(keyName, keyValue){
    var message = await Countly.validateString(keyName, "key", "setOnce");
    if(message) {
        return message;
    }
    message = await Countly.validateValidUserData(keyValue, "value", "setOnce");
    if(message) {
        return message;
    }
    keyValue = keyValue.toString();
    if(keyValue || keyValue == "") {
        CountlyReactNative.userData_setOnce([keyName, keyValue]);
    }
};
Countly.userData.pushUniqueValue = async function(keyName, keyValue){
    var message = await Countly.validateString(keyName, "key", "pushUniqueValue");
    if(message) {
        return message;
    }
    message = await Countly.validateValidUserData(keyValue, "value", "pushUniqueValue");
    if(message) {
        return message;
    }
    keyValue = keyValue.toString();
    if(keyValue || keyValue == "") {
        CountlyReactNative.userData_pushUniqueValue([keyName, keyValue]);
    }
};
Countly.userData.pushValue = async function(keyName, keyValue){
    var message = await Countly.validateString(keyName, "key", "pushValue");
    if(message) {
        return message;
    }
    message = await Countly.validateValidUserData(keyValue, "value", "pushValue");
    if(message) {
        return message;
    }
    keyValue = keyValue.toString();
    if(keyValue || keyValue == "") {
        CountlyReactNative.userData_pushValue([keyName, keyValue]);
    }
};
Countly.userData.pullValue = async function(keyName, keyValue){
    var message = await Countly.validateString(keyName, "key", "pullValue");
    if(message) {
        return message;
    }
    message = await Countly.validateValidUserData(keyValue, "value", "pullValue");
    if(message) {
        return message;
    }
    keyValue = keyValue.toString();
    if(keyValue || keyValue == "") {
        CountlyReactNative.userData_pullValue([keyName, keyValue]);
    }
};


/**
 * 
 * Set that consent should be required for features to work.
 * Should be called before Countly init
 */
Countly.setRequiresConsent = function(flag){
    CountlyReactNative.setRequiresConsent([flag]);
}

Countly.giveConsent = function(args){
    var features = [];
    if (typeof args == "string") {
        features.push(args);
    }
    else {
        features = args;
    }
    CountlyReactNative.giveConsent(features);
}

/**
 * 
 * Give consent for specific features before init.
 * Should be called after Countly init
 */
Countly.giveConsentInit = async function(args){
    var features = [];
    if (typeof args == "string") {
        features.push(args);
    }
    else if(Array.isArray(args)) {
        features = args;
    }
    else {
        var message = "unsupported data type '" + (typeof args) + "'";
        Countly.logWarning("giveConsentInit", message);
    }
    CountlyReactNative.giveConsentInit(features);
}

Countly.removeConsent = function(args){
    var features = [];
    if (typeof args == "string") {
        features.push(args);
    }
    else {
        features = args;
    }
    CountlyReactNative.removeConsent(features);
}

/**
 * 
 * Give consent for all features
 * Should be called after Countly init
 */
Countly.giveAllConsent = function(){
    CountlyReactNative.giveAllConsent();
}

Countly.removeAllConsent = function(){
    CountlyReactNative.removeAllConsent();
}

Countly.remoteConfigUpdate = function(callback){
    CountlyReactNative.remoteConfigUpdate([], (stringItem) => {
        callback(stringItem);
    });
}


Countly.updateRemoteConfigForKeysOnly = function(keyNames, callback){
    var args = [];
    if(keyNames.length){
        for(var i=0,il=keyNames.length;i<il;i++){
            args.push(keyNames[i])
        }
        CountlyReactNative.updateRemoteConfigForKeysOnly(args, (stringItem) => {
            callback(stringItem);
        });
    }
}

Countly.updateRemoteConfigExceptKeys = function(keyNames, callback){
    var args = [];
    if(keyNames.length){
        for(var i=0,il=keyNames.length;i<il;i++){
            args.push(keyNames[i])
        }
        CountlyReactNative.updateRemoteConfigExceptKeys(args, (stringItem) => {
            callback(stringItem);
        });
    }
}

Countly.getRemoteConfigValueForKey = function(keyName, callback){
    CountlyReactNative.getRemoteConfigValueForKey([keyName.toString() || ""], (value) => {
        if (Platform.OS == "android" ) {
            try {
                value = JSON.parse(value);
            }
            catch (e) {
               // console.log(e.message);
               // noop. value will remain string if not JSON parsable and returned as string
             }
        }
        callback(value);
    });
}

Countly.getRemoteConfigValueForKeyP = function(keyName){
        if (Platform.OS != "android" ) return "To be implemented";
        const promise = CountlyReactNative.getRemoteConfigValueForKeyP(keyName);
        return promise.then(value => {
            if (Platform.OS == "android" ) {
                try {
                    value = JSON.parse(value);
                }
                catch (e) {
                   // console.log(e.message);
                   // noop. value will remain string if not JSON parsable and returned as string
                 }
            }
            return value;
        })
}

Countly.remoteConfigClearValues = async function(){
    const result = await CountlyReactNative.remoteConfigClearValues();
    return result;
}
/**
 * Set's the text's for the different fields in the star rating dialog. Set value null if for some field you want to keep the old value
 * 
 * @param {String} starRatingTextTitle - dialog's title text (Only for Android)
 * @param {String} starRatingTextMessage - dialog's message text 
 * @param {String} starRatingTextDismiss - dialog's dismiss buttons text (Only for Android)
 */
Countly.setStarRatingDialogTexts = function(starRatingTextTitle, starRatingTextMessage, starRatingTextDismiss){
    var args = [];
    args.push(starRatingTextTitle);
    args.push(starRatingTextMessage);
    args.push(starRatingTextDismiss);
    CountlyReactNative.setStarRatingDialogTexts(args);
}

Countly.showStarRating = function(callback){
    if(!callback){callback = function(){}};
    CountlyReactNative.showStarRating([], callback);
}

Countly.showFeedbackPopup = function(widgetId, closeButtonText){
    CountlyReactNative.showFeedbackPopup([widgetId.toString() || "", closeButtonText.toString() || "Done"]);
}

/**
 * Get a list of available feedback widgets as array of object to handle multiple widgets of same type.
 */
Countly.getFeedbackWidgets = async function(){
     const result = await CountlyReactNative.getFeedbackWidgets();
      return result;
  }

/**
 * Get a list of available feedback widgets for this device ID
 * @deprecated in 20.11.1 : use 'getFeedbackWidgets' intead of 'getAvailableFeedbackWidgets'.
 * Using the old function it will not be possible to see all the available feedback widgets. 
 * In case there are multiple ones for the same type, only the last one will be returned due to their id being overwritten in the type field.
 * The newer function allow also to see the widgets 'name' field which can be further used to filter and identify specific widgets.
 */
Countly.getAvailableFeedbackWidgets = async function(){
    const result = await CountlyReactNative.getAvailableFeedbackWidgets();
     return result;
 }

/**
 * Present a chosen feedback widget
 * 
 * @param {Object} feedbackWidget - feeback Widget with id, type and name
 * @param {String} closeButtonText - text for cancel/close button
 */  
Countly.presentFeedbackWidgetObject = async function(feedbackWidget, closeButtonText){
    var message = null;
    if(!feedbackWidget) {
        message = "feedbackWidget should not be null or undefined";
        Countly.logError("presentFeedbackWidgetObject", message);
        return message;
    }
    if(!feedbackWidget.id) {
        message = "FeedbackWidget id should not be null or empty";
        Countly.logError("presentFeedbackWidgetObject", message);
        return message;
    }
    if(!feedbackWidget.type) {
        message = "FeedbackWidget type should not be null or empty";
        Countly.logError("presentFeedbackWidgetObject", message);
        return message;
    }
    if (typeof closeButtonText != "string") { 
            closeButtonText = "";
            Countly.logWarning("presentFeedbackWidgetObject", "unsupported data type of closeButtonText : '" + (typeof args) + "'");
    }
    feedbackWidget.name = feedbackWidget.name || "";
    closeButtonText = closeButtonText || "";
    CountlyReactNative.presentFeedbackWidget([feedbackWidget.id, feedbackWidget.type, feedbackWidget.name, closeButtonText]);
}

/**
* Present a chosen feedback widget
* 
* @param {String} widgetType - type of widget : "nps" or "survey"
* @param {String} widgetId - id of widget to present
* @param {String} closeButtonText - text for cancel/close button
* @deprecated in 20.11.1 : use 'presentFeedbackWidgetObject' intead of 'presentFeedbackWidget'.
*/  
Countly.presentFeedbackWidget = function(widgetType, widgetId, closeButtonText){
    var feedbackWidget = {
        "id": widgetId,
        "type": widgetType
      };
    Countly.presentFeedbackWidgetObject(feedbackWidget, closeButtonText)
}

/**
 * 
 * Events get grouped together and are sent either every minute or after the unsent event count reaches a threshold. By default it is 10
 * Should be called before Countly init
 */
Countly.setEventSendThreshold = function(size){
    CountlyReactNative.setEventSendThreshold([size.toString() || ""]);
}

Countly.startTrace = function(traceKey){
    var args = [];
    args.push(traceKey);
    CountlyReactNative.startTrace(args);
}

Countly.cancelTrace = function(traceKey){
    var args = [];
    args.push(traceKey);
    CountlyReactNative.cancelTrace(args);
}

Countly.clearAllTraces = function(){
    var args = [];
    CountlyReactNative.clearAllTraces(args);
}

Countly.endTrace = function(traceKey, customMetric){
    var args = [];
    args.push(traceKey);
    customMetric = customMetric || {};
    for(var key in customMetric){
        args.push(key.toString());
        args.push(customMetric[key].toString());
    }
    CountlyReactNative.endTrace(args);
}


Countly.recordNetworkTrace = function(networkTraceKey, responseCode, requestPayloadSize, responsePayloadSize, startTime, endTime){
    var args = [];
    args.push(networkTraceKey);
    args.push(responseCode.toString());
    args.push(requestPayloadSize.toString());
    args.push(responsePayloadSize.toString());
    args.push(startTime.toString());
    args.push(endTime.toString());
    CountlyReactNative.recordNetworkTrace(args);
}

/**
 * 
 * Enable APM features, which includes the recording of app start time.
 * Should be called before Countly init
 */
Countly.enableApm = function(){
    var args = [];
    CountlyReactNative.enableApm(args);
}

/**
 * 
 * Enable campaign attribution reporting to Countly.
 * For iOS use "recordAttributionID" instead of "enableAttribution"
 * Should be called before Countly init
 */
Countly.enableAttribution = async function(attributionID = "") {
    if (Platform.OS.match("ios")) {
        if(attributionID == "") {
            var message = "attribution Id for iOS can't be empty string";
            Countly.logError("enableAttribution", message);
            return message;
        }
        Countly.recordAttributionID(attributionID);
    }
    else {
        CountlyReactNative.enableAttribution();
    }
}

/**
 * 
 * set attribution Id for campaign attribution reporting.
 * Currently implemented for iOS only
 * For Android just call the enableAttribution to enable campaign attribution.
 */
Countly.recordAttributionID = function(attributionID){
    if (!Platform.OS.match("ios")) return "recordAttributionID : To be implemented";
    var args = [];
    args.push(attributionID);
    CountlyReactNative.recordAttributionID(args);
}
/**
 * Replaces all requests with a different app key with the current app key.
 * In request queue, if there are any request whose app key is different than the current app key,
 * these requests' app key will be replaced with the current app key.
 */
Countly.replaceAllAppKeysInQueueWithCurrentAppKey = function(){
    CountlyReactNative.replaceAllAppKeysInQueueWithCurrentAppKey();
}
/**
 * Removes all requests with a different app key in request queue.
 * In request queue, if there are any request whose app key is different than the current app key,
 * these requests will be removed from request queue.
 */
Countly.removeDifferentAppKeysFromQueue = function(){
  CountlyReactNative.removeDifferentAppKeysFromQueue()
}


/**
 * Call this function when app is loaded, so that the app launch duration can be recorded.
 * Should be called after init.
 */
Countly.appLoadingFinished = async function(){
    if(!await Countly.isInitialized()) {
        var message = "init must be called before appLoadingFinished";
        Countly.logWarning("appLoadingFinished", message);
        return message;
      }
    CountlyReactNative.appLoadingFinished()
  }

  /**
   * Set the metrics you want to override
   * Should be called before Countly init
   * @param {Object} customMetric - metric with key/value pair
   * Supported data type for customMetric values is String
   */
  Countly.setCustomMetrics = async function(customMetric){
    var message = null;
    if(!customMetric) {
        message = "customMetric should not be null or undefined";
        Countly.logError("setCustomMetrics", message);
        return message;
    }
    if(typeof customMetric !== 'object'){
        message = "unsupported data type of customMetric '" + (typeof customMetric) + "'";
        Countly.logWarning("setCustomMetrics", message)
        return message;
    }
    var args = [];
    for(var key in customMetric){
        if (typeof customMetric[key] == "string") {
            args.push(key.toString());
            args.push(customMetric[key].toString());
        }
        else {
            Countly.logWarning("setCustomMetrics", "skipping value for key '" + key.toString() + "', due to unsupported data type '" + (typeof customMetric[key]) + "'");
        }
    }
    if(args.length != 0) {
        CountlyReactNative.setCustomMetrics(args);
    }
}
/**
 * Validate user data value, it should be 'number' or 'string' that is parseable to 'number'
 * and it should not be null or undefined
 * It will return message if any issue found related to data validation else return null.
 * @param {String} stringValue : value of data to validate
 * @param {String} stringName : name of that value string
 * @param {String} functionName : name of function from where value is validating.
 * @returns 
 */
Countly.validateUserDataValue = async (stringValue, stringName, functionName) => {
    // validating that value should not be null or undefined
    var message = await Countly.validateValidUserData(stringValue, stringName, functionName);
    if(message) {
        return message;
    }
    
    // validating that value should be 'number' or 'string'
    message = await Countly.validateUserDataType(stringValue, stringName, functionName);
    if(message) {
        return message;
    }

    // validating that value should be parceable to int.
    message = await Countly.validateParseInt(stringValue, stringName, functionName);
    return message;
}

/**
 * Validate user data value, it should be 'number' or 'string' that is parseable to 'number'
 * It will return message if any issue found related to data validation else return null.
 * @param {String} stringValue : value of data to validate
 * @param {String} stringName : name of that value string
 * @param {String} functionName : name of function from where value is validating.
 * @returns 
 */
Countly.validateUserDataType = async (stringValue, stringName, functionName) => {
    var message = null;
    if (typeof stringValue == "number") {
        return null;
    }
    if (typeof stringValue == "string") {
        message = "unsupported data type '" + (typeof stringValue) + "', its data type should be 'number'";
        Countly.logWarning(functionName, message);
        return null;
    }

    message = "skipping value for '" + stringName.toString() + "', due to unsupported data type '" + (typeof stringValue) + "', its data type should be 'number'";
    Countly.logError(functionName, message);
    return message;
};

/**
 * Validate user data value, it should not be null or undefined
 * It will return message if any issue found related to data validation else return null.
 * @param {String} stringValue : value of data to validate
 * @param {String} stringName : name of that value string
 * @param {String} functionName : name of function from where value is validating.
 * @returns 
 */
Countly.validateValidUserData = async (stringValue, stringName, functionName) => {
    if (stringValue || stringValue == "") {
        return null;
    }

    var message = stringName +" should not be null or undefined";
    Countly.logError(functionName, message);
    return message;
};

/**
 * Validate user data value, it should be parseable to 'number'
 * It will return message if any issue found related to data validation else return null.
 * @param {String} stringValue : value of data to validate
 * @param {String} stringName : name of that value string
 * @param {String} functionName : name of function from where value is validating.
 * @returns 
 */
Countly.validateParseInt = async (stringValue, stringName, functionName) => {
    var intValue = parseInt(stringValue);
    if (!isNaN(intValue)) {
        return null;
    }

    var message = "skipping value for '" + stringName.toString() + "', due to unsupported data type '" + (typeof stringValue) + "', its data type should be 'number' or parseable to 'integer'";
    Countly.logError(functionName, message);
    return message;
};

/**
 * Validate string, it should not be empty, null or undefined
 * It will return message if any issue found related to string validation else return null.
 * @param {String} stringValue : value of string to validate
 * @param {String} stringName : name of that value string
 * @param {String} functionName : name of function from where value is validating.
 * @returns 
 */
Countly.validateString = async (stringValue, stringName, functionName) => {
    var message = null;
    if(!stringValue) {
        message = stringName +" should not be null, undefined or empty";
    }
    else if (typeof stringValue !== "string") {
        message = "skipping value for '" + stringName.toString() + "', due to unsupported data type '" + (typeof stringValue) + "', its data type should be 'string'";
    
    }
    if(message) {
        Countly.logError(functionName, message);
    }
    return message;
};

/**
 * Print error if logging is enabled
 * @param {String} functionName : name of function from where value is validating.
 * @param {String} error : error message
 */
Countly.logError = async (functionName, error) => {
    if(await CountlyReactNative.isLoggingEnabled()) {
        console.error("[CountlyReactNative] " + functionName + ", " + error);
    }
};
/**
 * Print warning if logging is enabled
 * @param {String} functionName : name of function from where value is validating.
 * @param {String} error : error message
 */
Countly.logWarning = async(functionName, warning) => {
    if(await CountlyReactNative.isLoggingEnabled()) {
        console.warn("[CountlyReactNative] " + functionName + ", " + warning);
    }
};

/*
Countly.initNative = function(){
    CountlyReactNative.initNative();
}

Countly.testCrash = function(){
    CountlyReactNative.testCrash();
}
*/


export default Countly;
