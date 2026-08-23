# Proguard Rules for JobAllocate

# Flutter Wrapper
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.embedding.** { *; }
-keep class io.flutter.plugins.** { *; }

# Firebase SDKs
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# Cashfree PG SDK
-keep class com.cashfree.** { *; }
-dontwarn com.cashfree.**

# Webview Flutter
-keep class com.pichillilorenzo.flutter_inappwebview.** { *; }
-dontwarn com.pichillilorenzo.flutter_inappwebview.**

# Google Play Core split install warnings
-dontwarn com.google.android.play.core.**
