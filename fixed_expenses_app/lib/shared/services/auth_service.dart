import 'dart:convert';
import 'package:http/http.dart' as http;

class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  static const String _baseUrl = 'http://localhost:3000/api/v1';
  final http.Client _client = http.Client();

  Future<String> login({required String email, required String password}) async {
    final uri = Uri.parse('$_baseUrl/auth/login');
    final response = await _client.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (response.statusCode == 200) {
      final json = jsonDecode(response.body) as Map<String, dynamic>;
      final token = json['data']?['token'] ?? json['token'];
      if (token is String && token.isNotEmpty) {
        return token;
      }
      throw Exception('토큰을 찾을 수 없습니다');
    }

    // 에러 메시지 파싱
    try {
      final json = jsonDecode(response.body) as Map<String, dynamic>;
      final message = json['error']?['message'] ?? json['message'] ?? '로그인 실패';
      throw Exception('HTTP ${response.statusCode}: $message');
    } catch (_) {
      throw Exception('HTTP ${response.statusCode}: ${response.reasonPhrase}');
    }
  }

  Future<void> register({required String name, required String email, required String password}) async {
    final uri = Uri.parse('$_baseUrl/auth/register');
    final response = await _client.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'name': name, 'email': email, 'password': password}),
    );

    if (response.statusCode == 201 || response.statusCode == 200) {
      return;
    }

    try {
      final json = jsonDecode(response.body) as Map<String, dynamic>;
      final message = json['error']?['message'] ?? json['message'] ?? '회원가입 실패';
      throw Exception('HTTP ${response.statusCode}: $message');
    } catch (_) {
      throw Exception('HTTP ${response.statusCode}: ${response.reasonPhrase}');
    }
  }

  Future<void> requestEmailCode({required String email}) async {
    // TODO: 실제 API 엔드포인트에 맞게 구현 (예: POST /auth/email/code)
    await Future.delayed(const Duration(milliseconds: 300));
  }

  Future<bool> verifyEmailCode({required String email, required String code}) async {
    // TODO: 실제 API 엔드포인트에 맞게 구현 (예: POST /auth/email/verify)
    await Future.delayed(const Duration(milliseconds: 300));
    return code.length == 4;
  }
}


