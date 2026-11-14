package com.mydaily.tracker;

import android.accessibilityservice.AccessibilityService;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.SystemClock;
import android.view.accessibility.AccessibilityEvent;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/** User-enabled focus helper. It redirects selected distracting apps to Home while a focus timer runs. */
public class FocusBlockingService extends AccessibilityService {
  private long lastRedirect = 0;
  private static final Set<String> ALWAYS_ALLOWED = new HashSet<>(Arrays.asList(
    "com.android.systemui", "com.android.phone", "com.google.android.dialer",
    "com.android.server.telecom", "com.android.settings", "com.google.android.permissioncontroller",
    "com.android.permissioncontroller", "com.android.emergency", "com.google.android.apps.nexuslauncher",
    "com.miui.home", "com.mi.android.globallauncher", "com.android.launcher3",
    // Study and research apps explicitly allowed during focus. Browser access is app-wide, not site-filtered.
    "com.openai.chatgpt", "com.android.chrome", "com.google.android.googlequicksearchbox",
    "org.mozilla.firefox", "com.brave.browser", "com.microsoft.emmx",
    "com.opera.browser", "com.sec.android.app.sbrowser", "com.mi.globalbrowser", "com.android.browser"
  ));
  @Override public void onAccessibilityEvent(AccessibilityEvent event) {
    if (event == null || event.getEventType() != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return;
    SharedPreferences sp = getSharedPreferences("focus_blocking", MODE_PRIVATE);
    if (!sp.getBoolean("active", false)) return;
    CharSequence pkgSeq = event.getPackageName(); if (pkgSeq == null) return;
    String pkg = pkgSeq.toString();
    if (pkg.equals(getPackageName()) || ALWAYS_ALLOWED.contains(pkg)) return;
    Set<String> configured = sp.getStringSet("blockedPackages", null);
    // Empty configuration means block normal user apps by default; allow essential system apps above.
    if (configured != null && !configured.isEmpty() && !configured.contains(pkg)) return;
    long now = SystemClock.elapsedRealtime();
    if (now - lastRedirect < 1200) return;
    lastRedirect = now;
    performGlobalAction(GLOBAL_ACTION_HOME);
  }
  @Override public void onInterrupt() { }
}
