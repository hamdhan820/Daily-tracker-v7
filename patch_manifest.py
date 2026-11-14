import os
WITH_BLOCKING = True  # Included in this edition; user must enable it manually in Android Accessibility settings.
f = 'android/app/src/main/AndroidManifest.xml'
s = open(f).read()

def must_replace(s, old, new, count=1):
    if old not in s:
        raise SystemExit('PATCH FAILED, not found in manifest: ' + old)
    return s.replace(old, new, count)

perms = ''.join('<uses-permission android:name="android.permission.%s" />\n' % p for p in
  ['SCHEDULE_EXACT_ALARM', 'USE_EXACT_ALARM', 'POST_NOTIFICATIONS', 'USE_FULL_SCREEN_INTENT', 'WAKE_LOCK', 'VIBRATE', 'RECEIVE_BOOT_COMPLETED', 'SYSTEM_ALERT_WINDOW', 'ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'])
s = must_replace(s, '<application', perms + '<application')

# Security hardening: no backups of app data, no plain-HTTP traffic
s = must_replace(s, 'android:allowBackup="true"', 'android:allowBackup="false"')
if 'usesCleartextTraffic' not in s:
    s = must_replace(s, '<application', '<application android:usesCleartextTraffic="false"')

# Never ship a debuggable build
if 'android:debuggable' in s:
    raise SystemExit('PATCH FAILED: manifest must not set android:debuggable')

extra = '<activity android:name=".AlarmActivity" android:exported="false" android:showWhenLocked="true" android:turnScreenOn="true" android:excludeFromRecents="true" android:launchMode="singleTask" />\n<receiver android:name=".AlarmReceiver" android:exported="false" />\n'
if WITH_BLOCKING:
    extra += '<service android:name=".FocusBlockingService" android:label="Daily Routine Tracker Focus Blocking" android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE" android:exported="true">\n<intent-filter><action android:name="android.accessibilityservice.AccessibilityService" /></intent-filter>\n<meta-data android:name="android.accessibilityservice" android:resource="@xml/focus_blocking_accessibility_service" />\n</service>\n'
    print('Focus-blocking accessibility service INCLUDED')
else:
    print('Focus-blocking accessibility service NOT included (Play Protect friendly)')
s = must_replace(s, '</application>', extra + '</application>')
open(f, 'w').write(s)
print('manifest patched')

# Set a consistent Android version for this release.
import re
gradle_file = 'android/app/build.gradle'
try:
    gradle_text = open(gradle_file, encoding='utf-8').read()
    gradle_text = re.sub(r'versionCode\s+\d+', 'versionCode 3', gradle_text, count=1)
    gradle_text = re.sub(r'versionName\s+"[^"]+"', 'versionName "3.0.0"', gradle_text, count=1)
    open(gradle_file, 'w', encoding='utf-8').write(gradle_text)
    print('Android version set to 3.0.0 (versionCode 3)')
except FileNotFoundError:
    raise SystemExit('Android Gradle file missing; run npx cap add android before this patch.')

# Keep the modular files available to the webview/service worker as well as the inlined index.
from pathlib import Path
import shutil
web_dir = Path('www')
web_dir.mkdir(exist_ok=True)
for asset in ['styles.css', 'app.js', 'prayer.js', 'enhancements.js', 'intro.mp4']:
    source = Path(asset)
    if source.is_file():
        shutil.copy2(source, web_dir / asset)
print('Web assets copied into Capacitor www directory')
