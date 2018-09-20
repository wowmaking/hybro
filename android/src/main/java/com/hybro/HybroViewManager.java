package com.hybro;

import android.view.View;

import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;

import java.util.ArrayList;
import java.util.Hashtable;


import org.apache.cordova.*;


public class HybroViewManager extends SimpleViewManager<View> {

  private static final String REACT_CLASS = "HybroView";

  public static Hashtable<String, CallbackContext> table = new Hashtable<String, CallbackContext>();

  @Override
  public String getName() {
    return REACT_CLASS;
  }

  @Override
  public View createViewInstance(ThemedReactContext context) {
    ConfigXmlParser parser = new ConfigXmlParser();
    parser.parse(context);
    CordovaPreferences preferences = parser.getPreferences();
    preferences.setPreferencesBundle(context.getCurrentActivity().getIntent().getExtras());
    String launchUrl = parser.getLaunchUrl();
    ArrayList<PluginEntry> pluginEntries = parser.getPluginEntries();

    HybroCordovaPlugin plugin = new HybroCordovaPlugin();
    PluginEntry pluginEntry = new PluginEntry(plugin.getServiceName(), plugin);
    pluginEntries.add(pluginEntry);

    CordovaWebViewEngine engine = CordovaWebViewImpl.createEngine(context, preferences);
    CordovaWebView cordovaView = new CordovaWebViewImpl(engine);
    CordovaInterface cordovaInterface = new CordovaInterfaceImpl(context.getCurrentActivity());
    cordovaView.init(cordovaInterface, pluginEntries, preferences);
    cordovaView.loadUrl(launchUrl);

    plugin.setEngines(cordovaView, context);

    return cordovaView.getView();
  }

}
