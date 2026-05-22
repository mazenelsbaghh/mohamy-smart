import 'dart:convert';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class ApiService {
  ApiService() {
    if (kIsWeb) {
      baseUrl = 'http://localhost:8976';
    } else if (Platform.isAndroid) {
      baseUrl = 'http://10.0.2.2:8976';
    } else {
      baseUrl = 'http://localhost:8976';
    }
  }

  late final String baseUrl;
  String? _token;

  void setToken(String? token) {
    _token = token;
  }

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      };

  /// Authentication
  Future<Map<String, dynamic>> login(String phoneNumber, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/Auth/login'),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: {
        'PhoneNumber': phoneNumber,
        'Password': password,
      },
    );

    final decoded = jsonDecode(response.body) as Map<String, dynamic>;
    if (decoded['succeeded'] == true && decoded['data'] != null) {
      _token = decoded['data']['accessToken'] as String?;
    }
    return decoded;
  }

  Future<void> logout() async {
    try {
      await http.post(
        Uri.parse('$baseUrl/api/v1/Auth/logout'),
        headers: _headers,
      );
    } catch (_) {}
    _token = null;
  }

  Future<Map<String, dynamic>> getProfile() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/v1/Auth/me'),
      headers: _headers,
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  /// Cases
  Future<Map<String, dynamic>> fetchCases({int pageNumber = 1, int pageSize = 50}) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/v1/Case?pageNumber=$pageNumber&pageSize=$pageSize'),
      headers: _headers,
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createCase({
    required String title,
    required String number,
    required String court,
    required String clientName,
    required String caseType,
    String description = '',
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/Case/create'),
      headers: _headers,
      body: jsonEncode({
        'title': title,
        'number': number,
        'caseTypeIds': [1], // Use default case type ID
        'court': court,
        'clientName': clientName,
        'defendingParty': 'client',
        'description': description,
        'facts': '',
        'legalClaims': '',
        'isExistedClient': false,
      }),
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  /// Clients
  Future<Map<String, dynamic>> fetchClients({int pageNumber = 1, int pageSize = 50}) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/v1/Client?pageNumber=$pageNumber&pageSize=$pageSize'),
      headers: _headers,
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createClient({
    required String name,
    required String phone,
    String email = '',
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/Client/create'),
      headers: _headers,
      body: jsonEncode({
        'clientName': name,
        'phoneNumber': phone,
        'email': email,
      }),
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  /// Internal Regulations
  Future<Map<String, dynamic>> fetchRegulations({int pageNumber = 1, int pageSize = 50, bool includeArchived = false}) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/v1/InternalRegulations?pageNumber=$pageNumber&pageSize=$pageSize&includeArchived=$includeArchived'),
      headers: _headers,
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createRegulation({
    required String title,
    required String content,
    String regulationNumber = '',
    String issuingAuthority = '',
    String summary = '',
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/InternalRegulations'),
      headers: _headers,
      body: jsonEncode({
        'title': title,
        'regulationNumber': regulationNumber,
        'issuingAuthority': issuingAuthority,
        'summary': summary,
        'content': content,
      }),
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateRegulation({
    required String id,
    required String title,
    required String content,
    String regulationNumber = '',
    String issuingAuthority = '',
    String summary = '',
  }) async {
    final response = await http.put(
      Uri.parse('$baseUrl/api/v1/InternalRegulations/$id'),
      headers: _headers,
      body: jsonEncode({
        'title': title,
        'regulationNumber': regulationNumber,
        'issuingAuthority': issuingAuthority,
        'summary': summary,
        'content': content,
        'isActive': true,
      }),
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> archiveRegulation(String id) async {
    final response = await http.patch(
      Uri.parse('$baseUrl/api/v1/InternalRegulations/$id/archive'),
      headers: _headers,
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  /// Power Of Attorney (POAs)
  Future<Map<String, dynamic>> fetchPOAs() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/v1/PowerOfAttorney/mine'),
      headers: _headers,
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createPOA({
    required String clientId,
    required String number,
    required String type,
    required String dateLabel,
  }) async {
    DateTime issueDate;
    try {
      issueDate = DateTime.parse(dateLabel);
    } catch (_) {
      issueDate = DateTime.now();
    }

    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/PowerOfAttorney/mine'),
      headers: _headers,
      body: jsonEncode({
        'clientId': clientId,
        'number': number,
        'poAType': type,
        'issueDate': issueDate.toIso8601String(),
        'title': 'توكيل $type',
        'issuingAuthority': 'الشهر العقاري',
      }),
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> cancelPOA(String id, String reason) async {
    final response = await http.put(
      Uri.parse('$baseUrl/api/v1/PowerOfAttorney/$id/cancel'),
      headers: _headers,
      body: jsonEncode({
        'reason': reason,
      }),
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  /// AI Chat Assistant
  Future<Map<String, dynamic>> sendChatMessage({
    required String message,
    String? conversationId,
    String? caseId,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/SmartAnalysis/chat'),
      headers: _headers,
      body: jsonEncode({
        'message': message,
        if (conversationId != null) 'conversationId': conversationId,
        if (caseId != null) 'contextCaseId': caseId,
        'internalRegulationIds': <String>[],
      }),
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  /// AI Job Execution
  Future<Map<String, dynamic>> triggerAiJob({
    required String caseId,
    required String stepType,
    required String workflowType,
    required int stepNumber,
    String? runId,
    String inputJson = '{}',
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/cases/$caseId/ai-jobs'),
      headers: _headers,
      body: jsonEncode({
        'stepType': stepType,
        'inputJson': inputJson,
        'workflowType': workflowType,
        'stepNumber': stepNumber,
        if (runId != null) 'runId': runId,
      }),
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  /// Workflow Snapshots
  Future<Map<String, dynamic>> fetchWorkflowSnapshots(String caseId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/v1/WorkflowSnapshots/case/$caseId'),
      headers: _headers,
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createWorkflowSnapshot({
    required String caseId,
    required String workflowType,
    required String outputsJson,
    required int currentStep,
    String? label,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/WorkflowSnapshots'),
      headers: _headers,
      body: jsonEncode({
        'caseId': caseId,
        'workflowType': workflowType,
        'outputsJson': outputsJson,
        'currentStep': currentStep,
        if (label != null) 'label': label,
      }),
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateWorkflowSnapshotLabel(int id, String label) async {
    final response = await http.patch(
      Uri.parse('$baseUrl/api/v1/WorkflowSnapshots/$id/label'),
      headers: _headers,
      body: jsonEncode({
        'label': label,
      }),
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> deleteWorkflowSnapshot(int id) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/api/v1/WorkflowSnapshots/$id'),
      headers: _headers,
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  /// Documents
  Future<Map<String, dynamic>> fetchDocuments({String? caseId, int pageNumber = 1, int pageSize = 50}) async {
    final uri = Uri.parse('$baseUrl/api/v1/Documents?'
        '${caseId != null ? "caseId=$caseId&" : ""}'
        'pageNumber=$pageNumber&pageSize=$pageSize');
    final response = await http.get(uri, headers: _headers);
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  /// Agenda / Appointments
  Future<Map<String, dynamic>> fetchAgendaItemsByLawyer(String lawyerId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/v1/Agenda/lawyer/$lawyerId'),
      headers: _headers,
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  /// Subscription & AI Points
  Future<Map<String, dynamic>> fetchLawyerPlan() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/v1/Subscription/lawyer'),
      headers: _headers,
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> fetchAiPointBalance() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/v1/Subscription/ai-points/balance'),
      headers: _headers,
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> fetchAiPointHistory() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/v1/Subscription/ai-points/history'),
      headers: _headers,
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> uploadOcrImage(List<int> bytes, String filename) async {
    final request = http.MultipartRequest('POST', Uri.parse('$baseUrl/api/v1/Ocr/ocr'));
    if (_token != null) {
      request.headers['Authorization'] = 'Bearer $_token';
    }
    request.files.add(
      http.MultipartFile.fromBytes(
        'images',
        bytes,
        filename: filename,
      ),
    );
    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> generateCaseFile({
    required String revisedText,
    String? availableCaseTypesJson,
  }) async {
    final request = http.MultipartRequest('POST', Uri.parse('$baseUrl/api/v1/Ocr/generate-case'));
    if (_token != null) {
      request.headers['Authorization'] = 'Bearer $_token';
    }
    request.fields['revisedText'] = revisedText;
    if (availableCaseTypesJson != null) {
      request.fields['availableCaseTypesJson'] = availableCaseTypesJson;
    }
    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    return jsonDecode(response.body) as Map<String, dynamic>;
  }
}
