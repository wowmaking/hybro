package com.hybro;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import org.apache.cordova.CallbackContext;
import org.json.JSONObject;


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
  public void success(String callbackId, ReadableMap response) {
    CallbackContext callbackContext = HybroViewManager.table.remove(callbackId);
    if (callbackContext != null) {
      try {
        JSONObject res = Converter.convertMapToJson(response);
        callbackContext.success(res);
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
