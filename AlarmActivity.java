package com.mydaily.tracker;
import android.app.Activity;
import android.content.Intent;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.Vibrator;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

public class AlarmActivity extends Activity {
  Ringtone r; Vibrator v;
  @Override
  protected void onCreate(Bundle s) {
    super.onCreate(s);
    if (Build.VERSION.SDK_INT >= 27) { setShowWhenLocked(true); setTurnScreenOn(true); }
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
      | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
    LinearLayout l = new LinearLayout(this);
    l.setOrientation(LinearLayout.VERTICAL); l.setGravity(Gravity.CENTER);
    l.setBackgroundColor(0xFF0E7C7B); l.setPadding(48, 48, 48, 48);
    TextView t = new TextView(this);
    t.setText(getIntent().getStringExtra("t")); t.setTextSize(34); t.setTextColor(0xFFFFFFFF); t.setGravity(Gravity.CENTER);
    TextView b = new TextView(this);
    b.setText(getIntent().getStringExtra("b")); b.setTextSize(20); b.setTextColor(0xFFE6F4F4); b.setGravity(Gravity.CENTER); b.setPadding(0, 24, 0, 64);
    Button d = new Button(this); d.setText("Dismiss");
    d.setOnClickListener(new View.OnClickListener() { public void onClick(View x) { stopAll(); finish(); } });
    Button o = new Button(this); o.setText("Open app");
    o.setOnClickListener(new View.OnClickListener() { public void onClick(View x) {
      stopAll(); Intent i = getPackageManager().getLaunchIntentForPackage(getPackageName()); if (i != null) startActivity(i); finish(); } });
    l.addView(t); l.addView(b); l.addView(d); l.addView(o);
    setContentView(l);
    r = RingtoneManager.getRingtone(this, RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM));
    if (r != null) { if (Build.VERSION.SDK_INT >= 28) r.setLooping(true); r.play(); }
    v = (Vibrator) getSystemService(VIBRATOR_SERVICE);
    if (v != null) v.vibrate(new long[]{0, 700, 400}, 0);
    new Handler(Looper.getMainLooper()).postDelayed(new Runnable() { public void run() { stopAll(); finish(); } }, 90000);
  }
  void stopAll() { if (r != null) r.stop(); if (v != null) v.cancel(); }
  @Override
  protected void onDestroy() { stopAll(); super.onDestroy(); }
}
