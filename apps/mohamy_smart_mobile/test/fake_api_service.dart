import 'package:mohamy_smart_mobile/core/services/api_service.dart';

class FakeApiService extends ApiService {
  @override
  Future<Map<String, dynamic>> login(
    String phoneNumber,
    String password,
  ) async {
    return {
      'succeeded': true,
      'data': {'accessToken': 'fake-jwt-token'},
    };
  }

  @override
  Future<void> logout() async {}

  @override
  Future<Map<String, dynamic>> getProfile() async {
    return {
      'succeeded': true,
      'data': {
        'profileId': 'lawyer-1',
        'fullName': 'أستاذ مازن',
        'email': 'lawyer@mohamy-smart.com',
      },
    };
  }

  @override
  Future<Map<String, dynamic>> signUp({
    required String fullName,
    required String phoneNumber,
    required String email,
    required String password,
    String licenseNumber = '',
    String city = '',
  }) async {
    return {
      'succeeded': true,
      'data': {'identifier': phoneNumber, 'requiresOtp': true},
    };
  }

  @override
  Future<Map<String, dynamic>> requestPasswordReset(String identifier) async {
    return {
      'succeeded': true,
      'data': {'identifier': identifier},
    };
  }

  @override
  Future<Map<String, dynamic>> verifyOtp({
    required String identifier,
    required String code,
    String purpose = 'phone-verification',
  }) async {
    return {
      'succeeded': code.isNotEmpty,
      'data': {'identifier': identifier, 'purpose': purpose},
    };
  }

  @override
  Future<Map<String, dynamic>> resendOtp({
    required String identifier,
    String purpose = 'phone-verification',
  }) async {
    return {
      'succeeded': true,
      'data': {'identifier': identifier, 'purpose': purpose},
    };
  }

  @override
  Future<Map<String, dynamic>> fetchCases({
    int pageNumber = 1,
    int pageSize = 50,
  }) async {
    return {
      'succeeded': true,
      'data': {
        'data': [
          {
            'id': 'case-1',
            'number': '١٢٣٤ / ٢٠٢٦',
            'title': 'مطالبة مالية ضد مؤسسة توريد',
            'clientId': 'client-1',
            'clientName': 'أحمد السالم',
            'court': 'المحكمة التجارية بالرياض',
            'caseTypeName': 'تجاري',
            'status': 0,
            'facts':
                'تأخر المدعى عليه في سداد الدفعة الأخيرة.\nيوجد عقد توريد موقع بين الطرفين.\nتم إرسال إنذار رسمي قبل رفع الدعوى.',
          },
          {
            'id': 'case-3',
            'number': '٤٥١ / ٢٠٢٤',
            'title': 'طلب تنفيذ سند لأمر',
            'clientId': 'client-1',
            'clientName': 'أحمد السالم',
            'court': 'محكمة التنفيذ بجدة',
            'caseTypeName': 'تنفيذ',
            'status': 1,
            'facts': 'تم قيد طلب التنفيذ وإشعار المنفذ ضده.',
          },
        ],
      },
    };
  }

  @override
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
    return {
      'succeeded': true,
      'data': {
        'id': 'case-new',
        'number': number,
        'title': title,
        'clientId': 'client-1',
        'clientName': clientName,
        'court': court,
        'caseTypeName': caseType,
        'status': 0,
        'facts': facts,
        'apponentName': adversary,
      },
    };
  }

  @override
  Future<Map<String, dynamic>> fetchCaseDetails(String caseId) async {
    return {
      'succeeded': true,
      'data': {
        'id': caseId,
        'number': '١٢٣٤ / ٢٠٢٦',
        'title': 'مطالبة مالية ضد مؤسسة توريد',
        'clientId': 'client-1',
        'clientName': 'أحمد السالم',
        'court': 'المحكمة التجارية بالرياض',
        'caseTypeName': 'تجاري',
        'status': 0,
        'facts': 'يوجد عقد توريد موقع بين الطرفين.',
      },
    };
  }

  @override
  Future<Map<String, dynamic>> updateCaseFacts({
    required String caseId,
    required String facts,
  }) async {
    return {
      'succeeded': true,
      'data': {'id': caseId, 'facts': facts},
    };
  }

  @override
  Future<Map<String, dynamic>> fetchClients({
    int pageNumber = 1,
    int pageSize = 50,
  }) async {
    return {
      'succeeded': true,
      'data': {
        'items': [
          {
            'id': 'client-1',
            'clientName': 'أحمد السالم',
            'phoneNumber': '+966501112233',
            'email': 'ahmad@example.com',
            'creationDate': '2026-05-21T00:00:00Z',
            'cases': [
              {'id': 'case-1'},
              {'id': 'case-3'},
            ],
          },
        ],
      },
    };
  }

  @override
  Future<Map<String, dynamic>> createClient({
    required String name,
    required String phone,
    String email = '',
  }) async {
    return {
      'succeeded': true,
      'data': {
        'id': 'client-new',
        'clientName': name,
        'phoneNumber': phone,
        'email': email,
        'creationDate': '2026-05-22T00:00:00Z',
        'cases': [],
      },
    };
  }

  @override
  Future<Map<String, dynamic>> fetchRegulations({
    int pageNumber = 1,
    int pageSize = 50,
    bool includeArchived = false,
  }) async {
    return {
      'succeeded': true,
      'data': {
        'data': [
          {
            'id': 'reg-1',
            'title': 'ميثاق السلوك المهني والسرية',
            'regulationNumber': 'REG-2026-001',
            'issuingAuthority': 'مجلس إدارة الشركة',
            'summary':
                'يحدد التزامات المحامين والموظفين تجاه الموكلين وحفظ سرية المعلومات والوقائع والقضايا.',
            'content':
                'يجب المحافظة التامة على سرية بيانات الموكلين وقضاياهم.\nيحظر مشاركة أي مستندات قضائية خارج النطاق الإداري للمكتب.\nالالتزام بالاحترام المتبادل وقيم العدالة والأمانة المهنية.',
            'isActive': true,
          },
        ],
      },
    };
  }

  @override
  Future<Map<String, dynamic>> createRegulation({
    required String title,
    required String content,
    String regulationNumber = '',
    String issuingAuthority = '',
    String summary = '',
  }) async {
    return {
      'succeeded': true,
      'data': {
        'id': 'reg-new',
        'title': title,
        'content': content,
        'regulationNumber': regulationNumber,
        'issuingAuthority': issuingAuthority,
        'summary': summary,
        'isActive': true,
      },
    };
  }

  @override
  Future<Map<String, dynamic>> updateRegulation({
    required String id,
    required String title,
    required String content,
    String regulationNumber = '',
    String issuingAuthority = '',
    String summary = '',
  }) async {
    return {
      'succeeded': true,
      'data': {
        'id': id,
        'title': title,
        'content': content,
        'regulationNumber': regulationNumber,
        'issuingAuthority': issuingAuthority,
        'summary': summary,
        'isActive': true,
      },
    };
  }

  @override
  Future<Map<String, dynamic>> archiveRegulation(String id) async {
    return {'succeeded': true};
  }

  @override
  Future<Map<String, dynamic>> fetchPOAs() async {
    return {
      'succeeded': true,
      'data': [
        {
          'id': 'poa-1',
          'number': '241526435',
          'clientId': 'client-1',
          'clientName': 'أحمد السالم',
          'issueDate': '2025-02-12T00:00:00Z',
          'poAType': 'توكيل رسمي عام قضايا',
          'isCanceled': false,
        },
      ],
    };
  }

  @override
  Future<Map<String, dynamic>> createPOA({
    required String clientId,
    required String number,
    required String type,
    required String dateLabel,
  }) async {
    return {
      'succeeded': true,
      'data': {
        'id': 'poa-new',
        'number': number,
        'clientId': clientId,
        'clientName': 'أحمد السالم',
        'issueDate': dateLabel,
        'poAType': type,
        'isCanceled': false,
      },
    };
  }

  @override
  Future<Map<String, dynamic>> cancelPOA(String id, String reason) async {
    return {'succeeded': true};
  }

  @override
  Future<Map<String, dynamic>> fetchWorkflowSnapshots(String caseId) async {
    return {'succeeded': true, 'data': []};
  }

  @override
  Future<Map<String, dynamic>> fetchDocuments({
    String? caseId,
    int pageNumber = 1,
    int pageSize = 50,
  }) async {
    return {
      'succeeded': true,
      'data': {
        'data': [
          {
            'documentId': 'doc-1',
            'title': 'عقد التوريد الموقع',
            'fileType': 'عقد',
            'createdAt': '2026-05-20T00:00:00Z',
            'availabilityState': 'Ready',
            'caseId': 'case-1',
          },
        ],
      },
    };
  }

  @override
  Future<Map<String, dynamic>> fetchDocumentStatus(String documentId) async {
    return {
      'succeeded': true,
      'data': {'id': documentId, 'availabilityState': 'Ready'},
    };
  }

  @override
  Future<Map<String, dynamic>> deleteDocument(String documentId) async {
    return {'succeeded': true};
  }

  @override
  Future<Map<String, dynamic>> fetchAgendaItemsByLawyer(String lawyerId) async {
    return {
      'succeeded': true,
      'data': [
        {
          'id': 'agenda-1',
          'caseId': 'case-1',
          'title': 'جلسة مرافعة',
          'courtName': 'المحكمة التجارية بالرياض',
          'date': '2026-05-22T11:30:00Z',
          'status': 'Pending',
        },
      ],
    };
  }

  @override
  Future<Map<String, dynamic>> createAgendaItem({
    required String caseId,
    required String title,
    required DateTime startsAt,
    String court = '',
    String notes = '',
  }) async {
    return {
      'succeeded': true,
      'data': {
        'id': 'agenda-new',
        'caseId': caseId,
        'title': title,
        'courtName': court,
        'date': startsAt.toIso8601String(),
        'status': 'Pending',
      },
    };
  }

  @override
  Future<Map<String, dynamic>> updateAgendaItem({
    required String id,
    required String title,
    required DateTime startsAt,
    String status = '',
    String notes = '',
  }) async {
    return {
      'succeeded': true,
      'data': {
        'id': id,
        'title': title,
        'date': startsAt.toIso8601String(),
        'status': status.isEmpty ? 'Pending' : status,
      },
    };
  }

  @override
  Future<Map<String, dynamic>> fetchLawyerPlan() async {
    return {
      'succeeded': true,
      'data': {
        'planName': 'الخطة الاحترافية',
        'endDate': '2026-06-30T00:00:00Z',
      },
    };
  }

  @override
  Future<Map<String, dynamic>> fetchAiPointBalance() async {
    return {'succeeded': true, 'data': 1280};
  }

  @override
  Future<Map<String, dynamic>> fetchAiPointHistory() async {
    return {'succeeded': true, 'data': []};
  }

  @override
  Future<Map<String, dynamic>> fetchLegalContracts({
    int pageNumber = 1,
    int pageSize = 50,
  }) async {
    return {
      'succeeded': true,
      'data': {'data': []},
    };
  }

  @override
  Future<Map<String, dynamic>> fetchProcessServerPapers({
    int pageNumber = 1,
    int pageSize = 50,
  }) async {
    return {
      'succeeded': true,
      'data': {'data': []},
    };
  }

  @override
  Future<Map<String, dynamic>> fetchNotifications({
    int pageNumber = 1,
    int pageSize = 50,
  }) async {
    return {
      'succeeded': true,
      'data': {
        'data': [
          {
            'id': 'notif-1',
            'category': 'aiJob',
            'title': 'اكتمل تحليل مذكرة الدفاع',
            'body': 'يمكنك مراجعة المخرجات من ملف القضية.',
            'createdAt': '2026-05-22T08:00:00Z',
            'isRead': false,
            'destinationType': 'case',
            'destinationId': 'case-1',
          },
        ],
      },
    };
  }

  @override
  Future<Map<String, dynamic>> markNotificationRead(String id) async {
    return {'succeeded': true};
  }

  @override
  Future<Map<String, dynamic>> uploadOcrImage(
    List<int> bytes,
    String filename,
  ) async {
    return {
      'succeeded': bytes.isNotEmpty,
      'data': [
        'عقد توريد مؤرخ في ٢٠ مايو ٢٠٢٦ بين شركة النور ومؤسسة العمار، وينص على توريد كابلات كهربائية بقيمة ١٥٠,٠٠٠ ريال. المحكمة المختصة هي المحكمة التجارية بالرياض.',
      ],
    };
  }

  @override
  Future<Map<String, dynamic>> generateCaseFile({
    required String revisedText,
    String? availableCaseTypesJson,
  }) async {
    return {
      'succeeded': revisedText.isNotEmpty,
      'data': {
        'number': '٩٨٧ / ٢٠٢٦',
        'clientName': 'شركة النور للتجارة',
        'court': 'المحكمة التجارية بالرياض',
        'type': 'تجاري',
        'adversary': 'مؤسسة العمار للمقاولات',
        'legalClaims':
            'إلزام الخصم بسداد قيمة التوريد والتعويض عن التأخير والمصاريف.',
      },
    };
  }
}
