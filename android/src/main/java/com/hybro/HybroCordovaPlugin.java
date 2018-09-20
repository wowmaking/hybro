package com.hybro;

import org.json.JSONArray;
import org.json.JSONException;

import org.apache.cordova.*;

import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;


public class HybroCordovaPlugin extends CordovaPlugin {

  private CordovaWebView view;
  private ThemedReactContext context;

  @Override
  public String getServiceName() {
    return "HybroCordovaPlugin";
  }

  public void setEngines(CordovaWebView v, ThemedReactContext c) {
    view = v;
    context = c;
  }

  @Override
  public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
    switch (action){
      case "invoke":
        WritableMap event = Arguments.createMap();
        event.putArray("args", Converter.convertJsonToArray(args));
        event.putString("callbackId", callbackContext.getCallbackId());

        context
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("cordova-invoke", event);

        HybroViewManager.table.put(callbackContext.getCallbackId(), callbackContext);

        return true;
    }
    return false;
  }

  // allow load/bridge from ip/localhost
  @Override
  public Boolean shouldAllowRequest(String url) {
      return true; 
  }
  @Override
  public Boolean shouldAllowNavigation(String url) {
      return true;
  }
}
