package com.mydaily.tracker;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

public class AlarmReceiver extends BroadcastReceiver {
  @Override
  public void onReceive(Context c, Intent in) {
    String t = in.getStringExtra("t"), b = in.getStringExtra("b");
    int id = in.getIntExtra("id", 1);
    NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
    if (Build.VERSION.SDK_INT >= 26) {
      nm.createNotificationChannel(new NotificationChannel("alarm", "Alarms", NotificationManager.IMPORTANCE_HIGH));
    }
    int kk = in.getIntExtra("k", 0);
    boolean study = kk == 1, quiet = kk == 2;
    Intent ai = new Intent(c, AlarmActivity.class);
    ai.putExtra("t", t); ai.putExtra("b", b);
    ai.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
    if (study || quiet) {
      Intent li = c.getPackageManager().getLaunchIntentForPackage(c.getPackageName());
      if (li != null) {
        li.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        if (study) { try { c.startActivity(li); } catch (Exception e) { } }
        ai = li;
      }
    }
    PendingIntent p = PendingIntent.getActivity(c, id, ai, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    Notification.Builder nb = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(c, "alarm") : new Notification.Builder(c);
    nb.setSmallIcon(android.R.drawable.ic_lock_idle_alarm).setContentTitle(t).setContentText(b)
      .setCategory(Notification.CATEGORY_ALARM).setPriority(Notification.PRIORITY_MAX)
      .setContentIntent(p).setAutoCancel(true);
    if (!study && !quiet) nb.setFullScreenIntent(p, true);
    nm.notify(id, nb.build());
  }
}
