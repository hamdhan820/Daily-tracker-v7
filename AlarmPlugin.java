package com.mydaily.tracker;
import android.app.AlarmManager;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import com.getcapacitor.JSArray;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONObject;
import java.util.HashSet;
import java.util.Set;

@CapacitorPlugin(name = "DailyAlarm")
public class AlarmPlugin extends Plugin {
  static PendingIntent pi(Context c, int id, String t, String b, int k) {
    Intent i = new Intent(c, AlarmReceiver.class);
    i.putExtra("id", id); i.putExtra("t", t); i.putExtra("b", b); i.putExtra("k", k);
    return PendingIntent.getBroadcast(c, id, i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
  }
  @PluginMethod
  public void allowExact(PluginCall call) {
    Context c = getContext();
    AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
    if (Build.VERSION.SDK_INT >= 31 && !am.canScheduleExactAlarms()) {
      try {
        Intent i = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:" + c.getPackageName()));
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        c.startActivity(i);
      } catch (Exception e) { }
    }
    call.resolve();
  }
  @PluginMethod
  public void schedule(PluginCall call) {
    try {
      Context c = getContext();
      AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
      if (Build.VERSION.SDK_INT >= 31 && !am.canScheduleExactAlarms()) {
        call.reject("Allow 'Alarms & reminders' for My Daily Tracker in the settings screen, then tap Enable again.");
        return;
      }
      SharedPreferences sp = c.getSharedPreferences("alarms", 0);
      Set<String> old = new HashSet<String>(sp.getStringSet("ids", new HashSet<String>()));
      for (String k : old) am.cancel(pi(c, Integer.parseInt(k), "", "", 0));
      Intent li = c.getPackageManager().getLaunchIntentForPackage(c.getPackageName());
      PendingIntent show = PendingIntent.getActivity(c, 0, li, PendingIntent.FLAG_IMMUTABLE);
      JSArray a = call.getArray("items");
      Set<String> ids = new HashSet<String>();
      for (int i = 0; i < a.length(); i++) {
        JSONObject o = a.getJSONObject(i);
        int id = o.getInt("id");
        am.setAlarmClock(new AlarmManager.AlarmClockInfo(o.getLong("at"), show), pi(c, id, o.optString("t"), o.optString("b"), o.optInt("k", 0)));
        ids.add(String.valueOf(id));
      }
      sp.edit().putStringSet("ids", ids).apply();
      call.resolve();
    } catch (Exception e) { call.reject(e.toString()); }
  }
  @PluginMethod
  public void allowFullScreen(PluginCall call) {
    Context c = getContext();
    if (Build.VERSION.SDK_INT >= 34) {
      NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
      if (!nm.canUseFullScreenIntent()) {
        Intent i = new Intent(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT, Uri.parse("package:" + c.getPackageName()));
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        c.startActivity(i);
      }
    }
    call.resolve();
  }
  @PluginMethod
  public void allowOverlay(PluginCall call) {
    Context c = getContext();
    try {
      if (Build.VERSION.SDK_INT >= 23 && !Settings.canDrawOverlays(c)) {
        Intent i = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + c.getPackageName()));
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        c.startActivity(i);
      }
    } catch (Exception e) { }
    call.resolve();
  }
}
