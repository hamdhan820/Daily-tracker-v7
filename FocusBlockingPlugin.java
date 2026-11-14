package com.mydaily.tracker;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.provider.Settings;
import android.text.TextUtils;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONArray;
import java.util.HashSet;
import java.util.Set;

@CapacitorPlugin(name = "FocusBlocking")
public class FocusBlockingPlugin extends Plugin {
  private boolean hasService() {
    try {
      getContext().getPackageManager().getServiceInfo(new ComponentName(getContext(), FocusBlockingService.class), 0);
      return true;
    } catch (Exception e) { return false; }
  }
  private boolean isEnabled() {
    if (!hasService()) return false;
    String enabled = Settings.Secure.getString(getContext().getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
    if (TextUtils.isEmpty(enabled)) return false;
    ComponentName cn = new ComponentName(getContext(), FocusBlockingService.class);
    TextUtils.SimpleStringSplitter splitter = new TextUtils.SimpleStringSplitter(':');
    splitter.setString(enabled);
    while (splitter.hasNext()) {
      ComponentName parsed = ComponentName.unflattenFromString(splitter.next());
      if (cn.equals(parsed)) return true;
    }
    return false;
  }
  @PluginMethod public void status(PluginCall call) {
    com.getcapacitor.JSObject out = new com.getcapacitor.JSObject(); out.put("available", hasService()); out.put("enabled", isEnabled()); call.resolve(out);
  }
  @PluginMethod public void openAccessibilitySettings(PluginCall call) {
    if (!hasService()) { call.reject("App blocking is not included in this build"); return; }
    try {
      Intent i = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
      i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      getContext().startActivity(i);
      com.getcapacitor.JSObject out = new com.getcapacitor.JSObject(); out.put("opened", true); call.resolve(out);
    } catch (Exception e) { call.reject("Could not open Android Accessibility settings", e); }
  }
  @PluginMethod public void setFocusActive(PluginCall call) {
    boolean active = call.getBoolean("active", false);
    SharedPreferences sp = getContext().getSharedPreferences("focus_blocking", Context.MODE_PRIVATE);
    sp.edit().putBoolean("active", active).apply();
    JSONArray arr = call.getArray("blockedPackages");
    if (arr != null) {
      Set<String> pkgs = new HashSet<>();
      for (int i=0;i<arr.length();i++) { String p=arr.optString(i, ""); if (!p.isEmpty()) pkgs.add(p); }
      sp.edit().putStringSet("blockedPackages", pkgs).apply();
    }
    com.getcapacitor.JSObject out = new com.getcapacitor.JSObject(); out.put("active", active); out.put("permissionEnabled", isEnabled()); call.resolve(out);
  }
  @PluginMethod public void pinScreen(PluginCall call) {
    getActivity().runOnUiThread(() -> { try { getActivity().startLockTask(); } catch (Exception e) { } });
    call.resolve();
  }
  @PluginMethod public void unpinScreen(PluginCall call) {
    getActivity().runOnUiThread(() -> { try { getActivity().stopLockTask(); } catch (Exception e) { } });
    call.resolve();
  }
}
