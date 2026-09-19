import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:local_auth/local_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../utils/api_json_decode.dart';
import 'app_session.dart';

class BiometricAuthService {
  BiometricAuthService._();
  static final BiometricAuthService instance = BiometricAuthService._();

  final LocalAuthentication _localAuth = LocalAuthentication();
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();

  static const String _kPrefBiometricEnabled = 'joballocate_biometric_enabled';
  static const String _kPrefBiometricPrompted = 'joballocate_biometric_prompted';

  static const String _kSecToken = 'secure_bearer_token';
  static const String _kSecUserJson = 'secure_user_json';

  /// Check whether device hardware and OS support biometric or device credential authentication.
  Future<bool> isBiometricSupported() async {
    try {
      final bool canCheck = await _localAuth.canCheckBiometrics;
      final bool isSupported = await _localAuth.isDeviceSupported();
      return canCheck || isSupported;
    } on PlatformException catch (e) {
      debugPrint('Biometric check failed: $e');
      return false;
    } catch (_) {
      return false;
    }
  }

  /// Check whether the user has previously enabled biometric login on this device.
  Future<bool> isBiometricEnabled() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final enabled = prefs.getBool(_kPrefBiometricEnabled) ?? false;
      if (!enabled) return false;
      final token = await _secureStorage.read(key: _kSecToken);
      return token != null && token.isNotEmpty;
    } catch (_) {
      return false;
    }
  }

  /// Check whether the first-time setup prompt has been shown/dismissed on this device.
  Future<bool> hasBeenPrompted() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getBool(_kPrefBiometricPrompted) ?? false;
    } catch (_) {
      return false;
    }
  }

  /// Record that the biometric prompt was presented or dismissed.
  Future<void> setPrompted(bool val) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_kPrefBiometricPrompted, val);
    } catch (_) {}
  }

  /// Prompts OS biometric/security, then securely stores token & user payload if successful.
  Future<bool> enableBiometric({
    required String bearerToken,
    required Map<String, dynamic> userPayload,
  }) async {
    try {
      final bool authenticated = await _localAuth.authenticate(
        localizedReason: 'Authenticate to enable biometric login for JobAllocate',
        options: const AuthenticationOptions(
          stickyAuth: true,
          useErrorDialogs: true,
          biometricOnly: false,
        ),
      );

      if (!authenticated) return false;

      await _secureStorage.write(key: _kSecToken, value: bearerToken);
      await _secureStorage.write(key: _kSecUserJson, value: jsonEncode(userPayload));

      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_kPrefBiometricEnabled, true);
      await prefs.setBool(_kPrefBiometricPrompted, true);

      return true;
    } on PlatformException catch (e) {
      debugPrint('Error enabling biometric: $e');
      return false;
    } catch (_) {
      return false;
    }
  }

  /// Disables biometric login and removes credentials from secure storage.
  Future<void> disableBiometric() async {
    try {
      await _secureStorage.delete(key: _kSecToken);
      await _secureStorage.delete(key: _kSecUserJson);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_kPrefBiometricEnabled, false);
    } catch (_) {}
  }

  /// Triggered on explicit logout: clears secure credential so old token cannot bypass logout.
  Future<void> onLogout() async {
    try {
      await _secureStorage.delete(key: _kSecToken);
      await _secureStorage.delete(key: _kSecUserJson);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_kPrefBiometricEnabled, false);
    } catch (_) {}
  }

  /// Performs OS biometric authentication, retrieves stored token, and validates against PHP GET /me endpoint.
  Future<Map<String, dynamic>?> loginWithBiometrics() async {
    try {
      final token = await _secureStorage.read(key: _kSecToken);
      if (token == null || token.isEmpty) {
        await disableBiometric();
        return null;
      }

      final bool authenticated = await _localAuth.authenticate(
        localizedReason: 'Scan Fingerprint or Face ID to log in to JobAllocate',
        options: const AuthenticationOptions(
          stickyAuth: true,
          useErrorDialogs: true,
          biometricOnly: false,
        ),
      );

      if (!authenticated) {
        return null; // OS authentication denied or cancelled by user
      }

      // Validate token with existing PHP backend /me endpoint
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/me'),
        headers: {
          'Authorization': 'Bearer $token',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      );

      final json = decodeApiJsonObject(response);
      if (response.statusCode == 200 && json['success'] == true) {
        final data = json['data'];
        final userPayload = (data is Map) ? Map<String, dynamic>.from(data) : null;
        final rawStoredUser = await _secureStorage.read(key: _kSecUserJson);
        final storedUser = (rawStoredUser != null && rawStoredUser.isNotEmpty)
            ? jsonDecode(rawStoredUser)
            : null;
        final mergedUser = userPayload ?? (storedUser is Map ? Map<String, dynamic>.from(storedUser) : <String, dynamic>{});

        AppSession.setSession(bearerToken: token, userPayload: mergedUser);
        return {
          'token': token,
          'user': mergedUser,
        };
      }

      // If token is expired / 401 unauthorized
      if (response.statusCode == 401) {
        await disableBiometric();
        throw Exception('Your session has expired. Please log in again.');
      }

      // Offline fallback: if network request failed but token is validly formatted, we check cached user payload
      final rawStoredUser = await _secureStorage.read(key: _kSecUserJson);
      if (rawStoredUser != null && rawStoredUser.isNotEmpty) {
        final userMap = Map<String, dynamic>.from(jsonDecode(rawStoredUser));
        AppSession.setSession(bearerToken: token, userPayload: userMap);
        return {'token': token, 'user': userMap};
      }

      return null;
    } on PlatformException catch (e) {
      debugPrint('Biometric authentication failed: $e');
      return null;
    } catch (e) {
      rethrow;
    }
  }
}
