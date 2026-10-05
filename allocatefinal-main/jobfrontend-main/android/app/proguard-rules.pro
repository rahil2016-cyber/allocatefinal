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

# Razorpay SDK
-keep class com.razorpay.** { *; }
-dontwarn com.razorpay.**
-keep class com.google.android.gms.wallet.** { *; }
-dontwarn com.google.android.gms.wallet.**

# Webview Flutter
-keep class com.pichillilorenzo.flutter_inappwebview.** { *; }
-dontwarn com.pichillilorenzo.flutter_inappwebview.**

# Google Play Core split install warnings
-dontwarn com.google.android.play.core.**
