package com.hybro;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.PluginResult;

import org.json.JSONObject;
import java.util.Hashtable;


public class HybroModule extends ReactContextBaseJavaModule {

  public static final String REACT_CLASS = "Hybro";

  @Override
  public String getName() {
    return REACT_CLASS;
  }

  public HybroModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @ReactMethod
  public void success(String callbackId, ReadableMap response, boolean keepCallback) {
    Hashtable<String, CallbackContext> table = HybroViewManager.table;
    
    CallbackContext callbackContext = keepCallback 
      ? table.get(callbackId)
      : table.remove(callbackId);

    if (callbackContext != null) {
      try {
        JSONObject resp = Converter.convertMapToJson(response);
        PluginResult result = new PluginResult(PluginResult.Status.OK, resp);

        if (keepCallback) {
          result.setKeepCallback(true);
        }

        callbackContext.sendPluginResult(result);
      }
      catch(Exception ex) {
        callbackContext.error(ex.getMessage());
      }
    }
  }

  @ReactMethod
  public void error(String callbackId, String error) {
    CallbackContext callbackContext = HybroViewManager.table.remove(callbackId);
    if (callbackContext != null) {
      callbackContext.error(error);
    }
  }
  
}
