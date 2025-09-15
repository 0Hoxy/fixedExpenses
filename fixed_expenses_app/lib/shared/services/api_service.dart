import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/expense.dart';

class ApiService {
  // 실제 백엔드 URL
  static const String baseUrl = 'http://localhost:3000/api';
  
  // 현재는 모의 API 사용 (JSONPlaceholder)
  static const String mockUrl = 'https://jsonplaceholder.typicode.com/posts';

  // HTTP 클라이언트
  static final http.Client _client = http.Client();

  // 모든 고정비 조회
  static Future<List<Expense>> getAllExpenses() async {
    try {
      final response = await _client.get(Uri.parse('$baseUrl/expenses'));
      
      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        final List<dynamic> expensesData = responseData['data'];
        
        return expensesData.map((json) => Expense.fromJson(json)).toList();
      } else {
        throw Exception('HTTP ${response.statusCode}: ${response.reasonPhrase}');
      }
    } catch (e) {
      throw Exception('고정비를 불러오는데 실패했습니다: $e');
    }
  }

  // 고정비 추가
  static Future<Expense> createExpense({
    required String name,
    required int amount,
    required String category,
  }) async {
    try {
      final response = await _client.post(
        Uri.parse('$baseUrl/expenses'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': name,
          'amount': amount,
          'category_id': category,
        }),
      );
      
      if (response.statusCode == 201) {
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        return Expense.fromJson(responseData['data']);
      } else {
        throw Exception('HTTP ${response.statusCode}: ${response.reasonPhrase}');
      }
    } catch (e) {
      throw Exception('고정비 추가에 실패했습니다: $e');
    }
  }

  // 고정비 수정
  static Future<Expense> updateExpense({
    required String id,
    String? name,
    int? amount,
    String? category,
  }) async {
    try {
      // 실제 백엔드가 있다면:
      // final response = await _client.put(
      //   Uri.parse('$baseUrl/expenses/$id'),
      //   headers: {'Content-Type': 'application/json'},
      //   body: jsonEncode({
      //     'name': name,
      //     'amount': amount,
      //     'category': category,
      //   }),
      // );
      
      await Future.delayed(const Duration(seconds: 1));
      
      // 모의 응답
      final expense = Expense(
        id: id,
        name: name ?? '수정된 고정비',
        amount: amount ?? 0,
        categoryId: category ?? 'other',
        createdAt: DateTime.now().subtract(const Duration(days: 30)),
        updatedAt: DateTime.now(),
      );
      
      return expense;
    } catch (e) {
      throw Exception('고정비 수정에 실패했습니다: $e');
    }
  }

  // 고정비 삭제
  static Future<void> deleteExpense(String id) async {
    try {
      // 실제 백엔드가 있다면:
      // final response = await _client.delete(Uri.parse('$baseUrl/expenses/$id'));
      
      await Future.delayed(const Duration(seconds: 1));
      
      // 모의 응답
      return;
    } catch (e) {
      throw Exception('고정비 삭제에 실패했습니다: $e');
    }
  }

  // 실제 REST API 호출 예시
  static Future<Map<String, dynamic>> fetchFromRealApi() async {
    try {
      final response = await _client.get(Uri.parse(mockUrl));
      
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('HTTP ${response.statusCode}: ${response.reasonPhrase}');
      }
    } catch (e) {
      throw Exception('API 호출 실패: $e');
    }
  }

  // 에러 처리
  static String handleError(dynamic error) {
    if (error.toString().contains('SocketException')) {
      return '네트워크 연결을 확인해주세요.';
    } else if (error.toString().contains('TimeoutException')) {
      return '요청 시간이 초과되었습니다.';
    } else if (error.toString().contains('FormatException')) {
      return '데이터 형식이 올바르지 않습니다.';
    } else {
      return '알 수 없는 오류가 발생했습니다.';
    }
  }
}
