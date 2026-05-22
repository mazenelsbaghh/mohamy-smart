// ignore_for_file: use_null_aware_elements

import 'dart:convert';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';

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
  Future<Map<String, dynamic>> login(
    String phoneNumber,
    String password,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/Auth/login'),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'X-Return-Tokens': 'true',
      },
      body: {'PhoneNumber': phoneNumber, 'Password': password},
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

  Future<Map<String, dynamic>> signUp({
    required String fullName,
    required String phoneNumber,
    required String email,
    required String password,
    String licenseNumber = '',
    String city = '',
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/Auth/register'),
      headers: _headers,
      body: jsonEncode({
        'fullName': fullName,
        'phoneNumber': phoneNumber,
        'email': email,
        'password': password,
        'licenseNumber': licenseNumber,
        'city': city,
      }),
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> requestPasswordReset(String identifier) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/Auth/forgot-password'),
      headers: _headers,
      body: jsonEncode({'identifier': identifier}),
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> verifyOtp({
    required String identifier,
    required String code,
    String purpose = 'phone-verification',
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/Auth/verify-otp'),
      headers: _headers,
      body: jsonEncode({
        'identifier': identifier,
        'code': code,
        'purpose': purpose,
      }),
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> resendOtp({
    required String identifier,
    String purpose = 'phone-verification',
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/Auth/resend-otp'),
      headers: _headers,
      body: jsonEncode({'identifier': identifier, 'purpose': purpose}),
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  /// Cases
  Future<Map<String, dynamic>> fetchCases({
    int pageNumber = 1,
    int pageSize = 50,
  }) async {
    final response = await http.get(
      Uri.parse(
        '$baseUrl/api/v1/Case?pageNumber=$pageNumber&pageSize=$pageSize',
      ),
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
    String facts = '',
    String legalClaims = '',
    String adversary = '',
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
        'facts': facts,
        'legalClaims': legalClaims,
        'apponentName': adversary,
        'isExistedClient': false,
      }),
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> fetchCaseDetails(String caseId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/v1/Case/$caseId'),
      headers: _headers,
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateCaseFacts({
    required String caseId,
    required String facts,
  }) async {
    final response = await http.patch(
      Uri.parse('$baseUrl/api/v1/Case/$caseId/facts'),
      headers: _headers,
      body: jsonEncode({'facts': facts}),
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  /// Clients
  Future<Map<String, dynamic>> fetchClients({
    int pageNumber = 1,
    int pageSize = 50,
  }) async {
    final response = await http.get(
      Uri.parse(
        '$baseUrl/api/v1/Client?pageNumber=$pageNumber&pageSize=$pageSize',
      ),
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
  Future<Map<String, dynamic>> fetchRegulations({
    int pageNumber = 1,
    int pageSize = 50,
    bool includeArchived = false,
  }) async {
    final response = await http.get(
      Uri.parse(
        '$baseUrl/api/v1/InternalRegulations?pageNumber=$pageNumber&pageSize=$pageSize&includeArchived=$includeArchived',
      ),
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
      body: jsonEncode({'reason': reason}),
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

  Future<Map<String, dynamic>> updateWorkflowSnapshotLabel(
    int id,
    String label,
  ) async {
    final response = await http.patch(
      Uri.parse('$baseUrl/api/v1/WorkflowSnapshots/$id/label'),
      headers: _headers,
      body: jsonEncode({'label': label}),
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
  Future<Map<String, dynamic>> fetchDocuments({
    String? caseId,
    int pageNumber = 1,
    int pageSize = 50,
  }) async {
    final uri = Uri.parse(
      '$baseUrl/api/v1/Documents?'
      '${caseId != null ? "caseId=$caseId&" : ""}'
      'pageNumber=$pageNumber&pageSize=$pageSize',
    );
    final response = await http.get(uri, headers: _headers);
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> fetchDocumentStatus(String documentId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/v1/Documents/$documentId/status'),
      headers: _headers,
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> deleteDocument(String documentId) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/api/v1/Documents/$documentId'),
      headers: _headers,
    );
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

  Future<Map<String, dynamic>> createAgendaItem({
    required String caseId,
    required String title,
    required DateTime startsAt,
    String court = '',
    String notes = '',
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/Agenda'),
      headers: _headers,
      body: jsonEncode({
        'caseId': caseId,
        'title': title,
        'startsAt': startsAt.toIso8601String(),
        'court': court,
        'notes': notes,
      }),
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateAgendaItem({
    required String id,
    required String title,
    required DateTime startsAt,
    String status = '',
    String notes = '',
  }) async {
    final response = await http.put(
      Uri.parse('$baseUrl/api/v1/Agenda/$id'),
      headers: _headers,
      body: jsonEncode({
        'title': title,
        'startsAt': startsAt.toIso8601String(),
        if (status.isNotEmpty) 'status': status,
        'notes': notes,
      }),
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

  Future<Map<String, dynamic>> fetchLegalContracts({
    int pageNumber = 1,
    int pageSize = 50,
  }) async {
    final response = await http.get(
      Uri.parse(
        '$baseUrl/api/v1/LegalContracts?pageNumber=$pageNumber&pageSize=$pageSize',
      ),
      headers: _headers,
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> fetchProcessServerPapers({
    int pageNumber = 1,
    int pageSize = 50,
  }) async {
    final response = await http.get(
      Uri.parse(
        '$baseUrl/api/v1/ProcessServerPaper?pageNumber=$pageNumber&pageSize=$pageSize',
      ),
      headers: _headers,
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> fetchNotifications({
    int pageNumber = 1,
    int pageSize = 50,
  }) async {
    final response = await http.get(
      Uri.parse(
        '$baseUrl/api/v1/Notification?pageNumber=$pageNumber&pageSize=$pageSize',
      ),
      headers: _headers,
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> markNotificationRead(String id) async {
    final response = await http.put(
      Uri.parse('$baseUrl/api/v1/Notification/$id/read'),
      headers: _headers,
    );
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> uploadOcrImage(
    List<int> bytes,
    String filename,
  ) async {
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('$baseUrl/api/v1/Ocr/ocr'),
    );
    if (_token != null) {
      request.headers['Authorization'] = 'Bearer $_token';
    }
    request.headers['Accept'] = 'application/json';

    // Determine the correct MIME type from the file extension
    final ext = filename.split('.').last.toLowerCase();
    final mimeType = switch (ext) {
      'jpg' || 'jpeg' => 'image/jpeg',
      'png' => 'image/png',
      'webp' => 'image/webp',
      'pdf' => 'application/pdf',
      _ => 'application/octet-stream',
    };

    request.files.add(
      http.MultipartFile.fromBytes(
        'images',
        bytes,
        filename: filename,
        contentType: _parseMediaType(mimeType),
      ),
    );
    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    return _parseJsonResponse(response);
  }

  Future<Map<String, dynamic>> generateCaseFile({
    required String revisedText,
    String? availableCaseTypesJson,
  }) async {
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('$baseUrl/api/v1/Ocr/generate-case'),
    );
    if (_token != null) {
      request.headers['Authorization'] = 'Bearer $_token';
    }
    request.fields['revisedText'] = revisedText;
    if (availableCaseTypesJson != null) {
      request.fields['availableCaseTypesJson'] = availableCaseTypesJson;
    }
    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    return _parseJsonResponse(response);
  }

  /// Parses a MIME type string into a [MediaType] for multipart uploads.
  static MediaType _parseMediaType(String mimeType) {
    final parts = mimeType.split('/');
    return MediaType(parts[0], parts.length > 1 ? parts[1] : 'octet-stream');
  }

  /// Safely parses a JSON response, wrapping plain-text error bodies
  /// into a standard error map so callers never see a [FormatException].
  static Map<String, dynamic> _parseJsonResponse(http.Response response) {
    final body = response.body.trim();
    if (body.isEmpty) {
      return {
        'succeeded': false,
        'statusCode': response.statusCode,
        'message': 'Empty response from server',
      };
    }
    try {
      final decoded = jsonDecode(body);
      if (decoded is Map<String, dynamic>) {
        return decoded;
      }
      // Server returned a JSON primitive (e.g. a quoted string)
      return {
        'succeeded': response.statusCode >= 200 && response.statusCode < 300,
        'statusCode': response.statusCode,
        'data': decoded,
      };
    } on FormatException {
      // Non-JSON body (e.g. plain Arabic error text from BadRequest("..."))
      return {
        'succeeded': false,
        'statusCode': response.statusCode,
        'message': body,
      };
    }
  }
}
