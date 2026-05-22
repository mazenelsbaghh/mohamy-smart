import 'dart:async';
import 'dart:convert';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';

import '../core/data/demo_legal_repository.dart';
import '../core/models/legal_models.dart';
import '../core/models/workflow_snapshot_model.dart';
import '../core/services/api_service.dart';
import '../core/services/signalr_service.dart';

class AppState extends ChangeNotifier {
  AppState({
    DemoLegalRepository? repository,
    ApiService? apiService,
    SignalRService? signalRService,
  }) : repository = repository ?? DemoLegalRepository() {
    _cases = [];
    _clients = [];
    _snapshots = [];
    _internalRegulations = [];
    _powerOfAttorneys = [];

    _apiService = apiService ?? ApiService();
    _signalRService = signalRService ?? SignalRService();
    _initSignalR();
  }

  late final ApiService _apiService;
  ApiService get apiService => _apiService;
  late final SignalRService _signalRService;
  bool _isSignalRConnected = false;
  final Map<String, Map<String, dynamic>> _activeJobs = {};

  bool get isSignalRConnected => _isSignalRConnected;
  SignalRService get signalR => _signalRService;
  Map<String, Map<String, dynamic>> get activeJobs => _activeJobs;

  String get _defaultHubUrl {
    if (kIsWeb) {
      return 'http://localhost:8976/hubs/ai-jobs';
    } else if (Platform.isAndroid) {
      return 'http://10.0.2.2:8976/hubs/ai-jobs';
    } else {
      return 'http://localhost:8976/hubs/ai-jobs';
    }
  }

  void _initSignalR() {
    _signalRService.init(_defaultHubUrl);
    _signalRService.onConnectionStatusChanged.listen((connected) {
      _isSignalRConnected = connected;
      notifyListeners();
    });

    _signalRService.onJobStatusChanged.listen(_handleJobStatusChangedEvent);
    _signalRService.onJobCompleted.listen(_handleJobCompletedEvent);
    _signalRService.onJobFailed.listen(_handleJobFailedEvent);
  }

  void _handleJobStatusChangedEvent(Map<String, dynamic> job) {
    final jobId = job['id']?.toString();
    if (jobId != null) {
      _activeJobs[jobId] = job;
      notifyListeners();
    }
  }

  void _handleJobCompletedEvent(Map<String, dynamic> job) {
    final jobId = job['id']?.toString();
    if (jobId != null) {
      _activeJobs[jobId] = job;
    }

    final caseId = job['caseId']?.toString();
    final workflowType = job['workflowType']?.toString();
    final stepType = job['stepType']?.toString();

    if (caseId != null && workflowType != null && stepType != null) {
      final stepIndex = mapStepTypeToStepIndex(workflowType, stepType);
      if (stepIndex != null) {
        final resultJsonRaw = job['resultJson'];
        Map<String, dynamic> decodedOutput = {};
        if (resultJsonRaw is String) {
          try {
            decodedOutput = jsonDecode(resultJsonRaw) as Map<String, dynamic>;
          } catch (e) {
            if (kDebugMode) {
              print('Error decoding job resultJson: $e');
            }
          }
        } else if (resultJsonRaw is Map) {
          decodedOutput = Map<String, dynamic>.from(resultJsonRaw);
        }

        saveDraftStep(caseId, workflowType, stepIndex, decodedOutput);
      }
    }
    notifyListeners();
  }

  void _handleJobFailedEvent(Map<String, dynamic> job) {
    final jobId = job['id']?.toString();
    if (jobId != null) {
      _activeJobs[jobId] = job;
      notifyListeners();
    }
  }

  Future<void> _connectSignalR() async {
    try {
      await _signalRService.connect();
    } catch (e) {
      if (kDebugMode) {
        print('Error connecting SignalR on login: $e');
      }
    }
  }

  Future<void> _disconnectSignalR() async {
    try {
      await _signalRService.disconnect();
    } catch (e) {
      if (kDebugMode) {
        print('Error disconnecting SignalR on logout: $e');
      }
    }
  }

  int? mapStepTypeToStepIndex(String workflowType, String stepType) {
    switch (workflowType) {
      case 'defense-memo':
        switch (stepType) {
          case 'FactAnalysis':
            return 1;
          case 'GenerateDefenses':
            return 2;
          case 'FinalRequirements':
            return 3;
          case 'DefenseMemoDraft':
            return 4;
        }
        break;
      case 'preparing-statement-of-claims':
        switch (stepType) {
          case 'LawsuitCaseType':
            return 1;
          case 'LawsuitParties':
            return 2;
          case 'LawsuitSubjects':
            return 3;
          case 'LawsuitFacts':
            return 4;
          case 'LawsuitLegalBasis':
            return 5;
          case 'LawsuitRequests':
            return 6;
          case 'StatementOfClaimsDraft':
            return 7;
        }
        break;
      case 'appeal-brief':
        switch (stepType) {
          case 'AppealBriefJudgmentData':
            return 1;
          case 'AppealBriefReasoningAnalysis':
            return 2;
          case 'AppealBriefGrounds':
            return 3;
          case 'AppealBriefRequests':
            return 4;
          case 'AppealBriefLegalBasis':
            return 5;
          case 'AppealBriefAssembly':
            return 6;
        }
        break;
      case 'admin-complaint':
        switch (stepType) {
          case 'AdminComplaintClassification':
            return 1;
          case 'AdminComplaintFacts':
            return 2;
          case 'AdminComplaintViolation':
            return 3;
          case 'AdminComplaintRequests':
            return 4;
          case 'AdminComplaintAssembly':
            return 5;
        }
        break;
      case 'ruling-analysis':
        switch (stepType) {
          case 'RulingAnalysisOperative':
            return 1;
          case 'RulingAnalysisReasoning':
            return 2;
          case 'RulingAnalysisDefectEvaluation':
            return 3;
          case 'RulingAnalysisFeasibilityReport':
            return 4;
        }
        break;
      case 'legal-warning':
        switch (stepType) {
          case 'LegalWarningClassification':
            return 1;
          case 'LegalWarningBodyDraft':
            return 2;
          case 'LegalWarningAssembly':
            return 3;
        }
        break;
      case 'exec-request':
        switch (stepType) {
          case 'ExecRequestClassification':
            return 1;
          case 'ExecRequestDrafting':
            return 2;
          case 'ExecRequestAssembly':
            return 3;
        }
        break;
    }
    return null;
  }

  @override
  void dispose() {
    _signalRService.dispose();
    super.dispose();
  }

  final DemoLegalRepository repository;

  bool _hasCompletedOnboarding = false;
  bool _isAuthenticated = false;
  bool _isDarkMode = false;
  int _selectedTab = 0;
  String _caseSearchQuery = '';
  late List<LegalCase> _cases;
  late List<Client> _clients;
  late List<InternalRegulation> _internalRegulations;
  late List<PowerOfAttorney> _powerOfAttorneys;

  LawyerProfile? _profile;
  ScreenStateInfo _appLoadState = const ScreenStateInfo(
    status: ScreenLoadStatus.idle,
  );
  DateTime? _lastDataRefreshAt;
  List<NotificationItem> _notifications = [];
  List<String> _apiGaps = [];
  List<AgendaItem> _agendaList = [];
  List<LegalDocument> _documentsList = [];
  SubscriptionPlan? _subscriptionPlan;

  // Track active drafts per case and workflow type
  final Map<String, Map<String, WorkflowDraft>> _activeDrafts = {};
  // Track all snapshots across the application
  late final List<WorkflowSnapshot> _snapshots;

  bool get hasCompletedOnboarding => _hasCompletedOnboarding;
  bool get isAuthenticated => _isAuthenticated;
  bool get isDarkMode => _isDarkMode;
  int get selectedTab => _selectedTab;
  String get caseSearchQuery => _caseSearchQuery;
  ScreenStateInfo get appLoadState => _appLoadState;
  DateTime? get lastDataRefreshAt => _lastDataRefreshAt;
  List<String> get apiGaps => List<String>.unmodifiable(_apiGaps);
  bool get hasApiGaps => _apiGaps.isNotEmpty;
  LawyerProfile get profile =>
      _profile ??
      const LawyerProfile(
        id: '',
        displayName: '',
        licenseNumber: '',
        firmName: '',
        phone: '',
        email: '',
        aiPoints: 0,
      );
  List<Client> get clients => List<Client>.unmodifiable(_clients);
  List<AgendaItem> get agenda => List<AgendaItem>.unmodifiable(_agendaList);
  List<LegalDocument> get documents =>
      List<LegalDocument>.unmodifiable(_documentsList);
  List<NotificationItem> get notifications =>
      List<NotificationItem>.unmodifiable(_notifications);
  int get unreadNotificationCount =>
      _notifications.where((notification) => !notification.isRead).length;
  SubscriptionPlan get subscription =>
      _subscriptionPlan ??
      const SubscriptionPlan(
        name: 'لا توجد باقة',
        renewalDate: '',
        aiPoints: 0,
        usageEntries: [],
      );
  List<LegalCase> get cases => List<LegalCase>.unmodifiable(_cases);
  List<InternalRegulation> get internalRegulations =>
      List<InternalRegulation>.unmodifiable(_internalRegulations);
  List<PowerOfAttorney> get powerOfAttorneys =>
      List<PowerOfAttorney>.unmodifiable(_powerOfAttorneys);

  LegalCase _mapJsonToCase(Map<String, dynamic> json) {
    final statusVal = json['status'];
    CaseStatus status;
    if (statusVal == 0 || statusVal == 'Open') {
      status = CaseStatus.active;
    } else if (statusVal == 1 || statusVal == 'Closed') {
      status = CaseStatus.completed;
    } else {
      status = CaseStatus.active;
    }

    final factsRaw = json['facts']?.toString() ?? '';
    final factsList = factsRaw
        .split('\n')
        .map((e) => e.trim())
        .where((e) => e.isNotEmpty)
        .toList();

    return LegalCase(
      id: json['id']?.toString() ?? '',
      caseNumber: json['number']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      clientId: json['clientId']?.toString() ?? '',
      clientName: json['clientName']?.toString() ?? '',
      court: json['court']?.toString() ?? '',
      caseType:
          json['caseTypeName']?.toString() ??
          (json['caseTypeNames'] != null &&
                  (json['caseTypeNames'] as List).isNotEmpty
              ? (json['caseTypeNames'] as List).first.toString()
              : 'جنائية'),
      status: status,
      facts: factsList,
      documentIds: const [],
      readiness: CaseReadiness(
        hasDocuments: false,
        hasFacts: factsList.isNotEmpty,
        hasEnoughPoints: true,
      ),
      adversary: json['apponentName']?.toString() ?? '',
    );
  }

  List<dynamic> _extractResultList(Map<String, dynamic> result) {
    final data = result['data'];
    if (data is List) {
      return data;
    }
    if (data is Map<String, dynamic>) {
      for (final key in const ['data', 'items', 'results', 'notifications']) {
        final value = data[key];
        if (value is List) {
          return value;
        }
      }
    }
    return const [];
  }

  NotificationCategory _mapNotificationCategory(String rawCategory) {
    final normalized = rawCategory.toLowerCase().replaceAll(
      RegExp(r'[\s_-]'),
      '',
    );
    if (normalized.contains('ai') || normalized.contains('job')) {
      return NotificationCategory.aiJob;
    }
    if (normalized.contains('agenda') ||
        normalized.contains('appointment') ||
        normalized.contains('session')) {
      return NotificationCategory.agenda;
    }
    if (normalized.contains('document') || normalized.contains('ocr')) {
      return NotificationCategory.document;
    }
    if (normalized.contains('subscription') || normalized.contains('point')) {
      return NotificationCategory.subscription;
    }
    return NotificationCategory.system;
  }

  NotificationItem _mapJsonToNotification(Map<String, dynamic> json) {
    DateTime createdAt;
    final createdAtRaw =
        json['createdAt']?.toString() ?? json['creationDate']?.toString() ?? '';
    try {
      createdAt = createdAtRaw.isNotEmpty
          ? DateTime.parse(createdAtRaw)
          : DateTime.now();
    } catch (_) {
      createdAt = DateTime.now();
    }

    return NotificationItem(
      id: json['id']?.toString() ?? '',
      category: _mapNotificationCategory(
        json['category']?.toString() ?? json['type']?.toString() ?? '',
      ),
      title: json['title']?.toString() ?? 'تنبيه جديد',
      body: json['body']?.toString() ?? json['message']?.toString() ?? '',
      createdAt: createdAt,
      isRead: json['isRead'] as bool? ?? json['readAt'] != null,
      destinationType:
          json['destinationType']?.toString() ?? json['targetType']?.toString(),
      destinationId:
          json['destinationId']?.toString() ?? json['targetId']?.toString(),
    );
  }

  Client _mapJsonToClient(Map<String, dynamic> json) {
    final casesList = json['cases'] as List?;
    final caseIds =
        casesList
            ?.map((e) => e['id']?.toString() ?? '')
            .where((id) => id.isNotEmpty)
            .toList() ??
        <String>[];
    return Client(
      id: json['id']?.toString() ?? '',
      name: json['clientName']?.toString() ?? '',
      phone: json['phoneNumber']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      caseIds: caseIds,
      lastActivity: json['creationDate']?.toString() ?? '',
    );
  }

  InternalRegulation _mapJsonToRegulation(Map<String, dynamic> json) {
    final content = json['content']?.toString() ?? '';
    final sections = content
        .split('\n')
        .map((e) => e.trim())
        .where((e) => e.isNotEmpty)
        .toList();
    return InternalRegulation(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      sections: sections,
      regulationNumber: json['regulationNumber']?.toString(),
      issuingAuthority: json['issuingAuthority']?.toString(),
      summary: json['summary']?.toString(),
      isActive: json['isActive'] as bool? ?? true,
    );
  }

  PowerOfAttorney _mapJsonToPOA(Map<String, dynamic> json) {
    final isCanceled = json['isCanceled'] as bool? ?? false;
    return PowerOfAttorney(
      id: json['id']?.toString() ?? '',
      number: json['number']?.toString() ?? '',
      clientId: json['clientId']?.toString() ?? '',
      clientName: json['clientName']?.toString() ?? '',
      type: json['poAType']?.toString() ?? 'general',
      dateLabel: json['issueDate']?.toString() ?? '',
      status: isCanceled ? 'ملغي' : 'نشط',
      cancellationReason: json['cancellationReason']?.toString(),
    );
  }

  WorkflowSnapshot _mapJsonToSnapshot(Map<String, dynamic> json) {
    final String outputsJsonStr = json['outputsJson']?.toString() ?? '{}';
    Map<int, Map<String, dynamic>> parsedOutputs = {};
    try {
      final decodedOutputs = jsonDecode(outputsJsonStr) as Map<String, dynamic>;
      decodedOutputs.forEach((key, value) {
        final parsedKey = int.tryParse(key);
        if (parsedKey != null && value is Map<String, dynamic>) {
          parsedOutputs[parsedKey] = Map<String, dynamic>.from(value);
        }
      });
    } catch (_) {}

    return WorkflowSnapshot(
      id: json['id']?.toString() ?? '',
      caseId: json['caseId']?.toString() ?? '',
      workflowType: json['workflowType']?.toString() ?? '',
      currentStep: json['currentStep'] as int? ?? 0,
      label: json['label']?.toString(),
      createdAt: json['creationDate'] != null
          ? DateTime.parse(json['creationDate'].toString())
          : DateTime.now(),
      outputs: parsedOutputs,
    );
  }

  LawyerProfile _mapJsonToProfile(Map<String, dynamic> json, int aiPoints) {
    return LawyerProfile(
      id: json['profileId']?.toString() ?? '',
      displayName: json['fullName']?.toString() ?? '',
      licenseNumber: '12345', // Default/fallback
      firmName: 'مكتب المحاماة الخاص', // Default/fallback
      phone: '', // Default/fallback
      email: json['email']?.toString() ?? '',
      aiPoints: aiPoints,
    );
  }

  AgendaItem _mapJsonToAgendaItem(Map<String, dynamic> json) {
    final startsAtStr =
        json['date']?.toString() ?? json['startsAt']?.toString() ?? '';
    DateTime startsAt;
    try {
      startsAt = startsAtStr.isNotEmpty
          ? DateTime.parse(startsAtStr)
          : DateTime.now();
    } catch (_) {
      startsAt = DateTime.now();
    }

    final statusRaw = json['status']?.toString() ?? '';
    String status = statusRaw;
    if (statusRaw == 'Pending') {
      status = 'قيد الانتظار';
    } else if (statusRaw == 'Completed') {
      status = 'مكتمل';
    }

    return AgendaItem(
      id: json['id']?.toString() ?? '',
      caseId: json['caseId']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      court:
          json['courtName']?.toString() ??
          json['court']?.toString() ??
          'المحكمة المختصة',
      startsAt: startsAt,
      status: status,
    );
  }

  LegalDocument _mapJsonToDocument(Map<String, dynamic> json) {
    final stateRaw = (json['availabilityState']?.toString() ?? 'Ready')
        .toLowerCase();
    DocumentStatus status;
    bool isAiReady = false;

    if (stateRaw == 'processing' ||
        stateRaw == 'extractingtext' ||
        stateRaw == 'ocrpending' ||
        stateRaw == 'uploaded') {
      status = DocumentStatus.processing;
    } else if (stateRaw == 'failed' || stateRaw == 'error') {
      status = DocumentStatus.failed;
    } else {
      status = DocumentStatus.ready;
      isAiReady = true;
    }

    final createdAtStr = json['createdAt']?.toString() ?? '';
    String dateLabel = '';
    if (createdAtStr.isNotEmpty) {
      try {
        final date = DateTime.parse(createdAtStr);
        dateLabel =
            '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
      } catch (_) {
        dateLabel = createdAtStr;
      }
    }

    return LegalDocument(
      id: json['documentId']?.toString() ?? json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'مستند بدون عنوان',
      type:
          json['fileType']?.toString() ??
          json['sourceType']?.toString() ??
          'pdf',
      dateLabel: dateLabel,
      status: status,
      isAiReady: isAiReady,
      caseId: json['caseId']?.toString(),
    );
  }

  SubscriptionPlan _mapJsonToSubscriptionPlan(
    Map<String, dynamic> planJson,
    int aiPointsBalance,
    List<dynamic> historyList,
  ) {
    final name = planJson['planName']?.toString() ?? 'الباقة المجانية';
    final endDateStr = planJson['endDate']?.toString();
    String renewalDate = '';
    if (endDateStr != null) {
      try {
        final date = DateTime.parse(endDateStr);
        renewalDate =
            '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
      } catch (_) {
        renewalDate = endDateStr;
      }
    }

    final List<UsageEntry> usageEntries = [];
    for (final item in historyList) {
      if (item is Map<String, dynamic>) {
        final dateStr = item['createdAt']?.toString() ?? '';
        String formattedDate = '';
        if (dateStr.isNotEmpty) {
          try {
            final date = DateTime.parse(dateStr);
            formattedDate =
                '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
          } catch (_) {
            formattedDate = dateStr;
          }
        }

        final points = item['points'] as int? ?? 0;
        final txType = item['transactionType']?.toString();
        final displayPoints = txType == 'Charge' || txType == '0'
            ? -points
            : points;

        usageEntries.add(
          UsageEntry(
            title:
                item['messageAr']?.toString() ??
                'استخدام ميزة الذكاء الاصطناعي',
            points: displayPoints,
            dateLabel: formattedDate,
          ),
        );
      }
    }

    return SubscriptionPlan(
      name: name,
      renewalDate: renewalDate,
      aiPoints: aiPointsBalance,
      usageEntries: usageEntries,
    );
  }

  Future<void> fetchSnapshotsForCase(String caseId) async {
    try {
      final result = await _apiService.fetchWorkflowSnapshots(caseId);
      if (result['succeeded'] == true) {
        final list = (result['data'] as List?) ?? [];
        final backendSnaps = list
            .map((e) => _mapJsonToSnapshot(e as Map<String, dynamic>))
            .toList();

        // Remove existing snapshots for this caseId, then add new ones
        _snapshots.removeWhere((s) => s.caseId == caseId);
        _snapshots.addAll(backendSnaps);
        notifyListeners();
      }
    } catch (e) {
      if (kDebugMode) print('Failed to fetch snapshots for case: $e');
    }
  }

  Future<void> fetchLiveData() async {
    _appLoadState = ScreenStateInfo(
      status: ScreenLoadStatus.loading,
      message: 'جار تحديث بيانات التطبيق',
      lastUpdatedAt: _lastDataRefreshAt,
    );
    _apiGaps = [];
    notifyListeners();

    final failures = <String>[];
    void recordFailure(String label, Object error) {
      failures.add(label);
      if (kDebugMode) {
        print('Failed to fetch $label: $error');
      }
    }

    // 1. Fetch Profile Info
    String? profileId;
    Map<String, dynamic>? profileData;
    try {
      final profileResult = await _apiService.getProfile();
      if (profileResult['succeeded'] == true) {
        profileData = profileResult['data'] as Map<String, dynamic>?;
        profileId = profileData?['profileId']?.toString();
      }
    } catch (e) {
      recordFailure('الملف الشخصي', e);
    }

    // 2. Fetch AI Points Balance & History
    int aiPointsBalance = 0;
    List<dynamic> pointHistory = [];
    try {
      final balanceResult = await _apiService.fetchAiPointBalance();
      if (balanceResult['succeeded'] == true) {
        final data = balanceResult['data'];
        if (data is Map<String, dynamic>) {
          aiPointsBalance = data['available'] as int? ?? 0;
        } else if (data is int) {
          aiPointsBalance = data;
        }
      }
    } catch (e) {
      recordFailure('رصيد نقاط الذكاء الاصطناعي', e);
    }

    try {
      final historyResult = await _apiService.fetchAiPointHistory();
      if (historyResult['succeeded'] == true) {
        pointHistory = (historyResult['data'] as List?) ?? [];
      }
    } catch (e) {
      recordFailure('سجل نقاط الذكاء الاصطناعي', e);
    }

    // 3. Map Profile and Subscription Plan
    if (profileData != null) {
      _profile = _mapJsonToProfile(profileData, aiPointsBalance);
    }

    // 4. Fetch Active Subscription Plan
    try {
      final subPlanResult = await _apiService.fetchLawyerPlan();
      if (subPlanResult['succeeded'] == true) {
        final data = subPlanResult['data'] as Map<String, dynamic>?;
        if (data != null) {
          _subscriptionPlan = _mapJsonToSubscriptionPlan(
            data,
            aiPointsBalance,
            pointHistory,
          );
        }
      }
    } catch (e) {
      recordFailure('الاشتراك', e);
    }

    // 5. Fetch Agenda / Appointments (using resolved profileId)
    if (profileId != null && profileId.isNotEmpty) {
      try {
        final agendaResult = await _apiService.fetchAgendaItemsByLawyer(
          profileId,
        );
        if (agendaResult['succeeded'] == true) {
          final list = (agendaResult['data'] as List?) ?? [];
          _agendaList = list
              .map((e) => _mapJsonToAgendaItem(e as Map<String, dynamic>))
              .toList();
        }
      } catch (e) {
        recordFailure('الأجندة', e);
      }
    }

    // 6. Fetch Documents
    try {
      final docsResult = await _apiService.fetchDocuments();
      if (docsResult['succeeded'] == true) {
        final list = _extractResultList(docsResult);
        _documentsList = list
            .map((e) => _mapJsonToDocument(e as Map<String, dynamic>))
            .toList();
      }
    } catch (e) {
      recordFailure('المستندات', e);
    }

    // 7. Fetch Cases
    try {
      final casesResult = await _apiService.fetchCases();
      if (casesResult['succeeded'] == true) {
        final casesList = _extractResultList(casesResult);
        _cases = casesList
            .map((e) => _mapJsonToCase(e as Map<String, dynamic>))
            .toList();
      }
    } catch (e) {
      recordFailure('القضايا', e);
    }

    // 8. Fetch Clients
    try {
      final clientsResult = await _apiService.fetchClients();
      if (clientsResult['succeeded'] == true) {
        final clientsList = _extractResultList(clientsResult);
        _clients = clientsList
            .map((e) => _mapJsonToClient(e as Map<String, dynamic>))
            .toList();
      }
    } catch (e) {
      recordFailure('العملاء', e);
    }

    // 9. Fetch Regulations
    try {
      final regsResult = await _apiService.fetchRegulations();
      if (regsResult['succeeded'] == true) {
        final regsList = _extractResultList(regsResult);
        _internalRegulations = regsList
            .map((e) => _mapJsonToRegulation(e as Map<String, dynamic>))
            .toList();
      }
    } catch (e) {
      recordFailure('اللوائح الداخلية', e);
    }

    // 10. Fetch POAs
    try {
      final poaResult = await _apiService.fetchPOAs();
      if (poaResult['succeeded'] == true) {
        final poaList = (poaResult['data'] as List?) ?? [];
        _powerOfAttorneys = poaList
            .map((e) => _mapJsonToPOA(e as Map<String, dynamic>))
            .toList();
      }
    } catch (e) {
      recordFailure('التوكيلات', e);
    }

    // 11. Fetch Notifications
    try {
      final notificationsResult = await _apiService.fetchNotifications();
      if (notificationsResult['succeeded'] == true) {
        final notificationsList = _extractResultList(notificationsResult);
        _notifications = notificationsList
            .map((e) => _mapJsonToNotification(e as Map<String, dynamic>))
            .where((notification) => notification.id.isNotEmpty)
            .toList();
      }
    } catch (e) {
      recordFailure('الإشعارات', e);
    }

    _lastDataRefreshAt = DateTime.now();
    _apiGaps = failures;
    _appLoadState = ScreenStateInfo(
      status: failures.isEmpty
          ? ScreenLoadStatus.ready
          : ScreenLoadStatus.partial,
      message: failures.isEmpty
          ? 'تم تحديث بيانات التطبيق'
          : 'تم تحميل البيانات الأساسية، لكن تعذر تحديث: ${failures.join('، ')}',
      lastUpdatedAt: _lastDataRefreshAt,
      retryLabel: failures.isEmpty ? null : 'إعادة المحاولة',
    );
    notifyListeners();
  }

  Future<void> addInternalRegulation(InternalRegulation reg) async {
    final response = await _apiService.createRegulation(
      title: reg.title,
      content: reg.sections.join('\n'),
      regulationNumber: reg.regulationNumber ?? '',
      issuingAuthority: reg.issuingAuthority ?? '',
      summary: reg.summary ?? '',
    );
    if (response['succeeded'] == true) {
      await fetchLiveData();
    } else {
      throw Exception(
        response['message'] ?? 'Failed to add internal regulation',
      );
    }
  }

  Future<void> updateInternalRegulation(InternalRegulation reg) async {
    final response = await _apiService.updateRegulation(
      id: reg.id,
      title: reg.title,
      content: reg.sections.join('\n'),
      regulationNumber: reg.regulationNumber ?? '',
      issuingAuthority: reg.issuingAuthority ?? '',
      summary: reg.summary ?? '',
    );
    if (response['succeeded'] == true) {
      await fetchLiveData();
    } else {
      throw Exception(
        response['message'] ?? 'Failed to update internal regulation',
      );
    }
  }

  Future<void> archiveInternalRegulation(String id) async {
    final response = await _apiService.archiveRegulation(id);
    if (response['succeeded'] == true) {
      await fetchLiveData();
    } else {
      throw Exception(response['message'] ?? 'Failed to archive regulation');
    }
  }

  void deleteInternalRegulation(String id) {
    _internalRegulations.removeWhere((r) => r.id == id);
    notifyListeners();
  }

  Future<void> addPowerOfAttorney(PowerOfAttorney poa) async {
    final response = await _apiService.createPOA(
      clientId: poa.clientId,
      number: poa.number,
      type: poa.type,
      dateLabel: poa.dateLabel,
    );
    if (response['succeeded'] == true) {
      await fetchLiveData();
    } else {
      throw Exception(response['message'] ?? 'Failed to create POA');
    }
  }

  Future<void> cancelPowerOfAttorney(String id, String reason) async {
    final response = await _apiService.cancelPOA(id, reason);
    if (response['succeeded'] == true) {
      await fetchLiveData();
    } else {
      throw Exception(response['message'] ?? 'Failed to cancel POA');
    }
  }

  // Workflow Snapshots Getters
  List<WorkflowSnapshot> get snapshots =>
      List<WorkflowSnapshot>.unmodifiable(_snapshots);

  List<WorkflowSnapshot> snapshotsForCaseAndWorkflow(
    String caseId,
    String workflowType,
  ) {
    return _snapshots
        .where((s) => s.caseId == caseId && s.workflowType == workflowType)
        .toList();
  }

  WorkflowDraft getOrCreateDraft(String caseId, String workflowType) {
    final draftsForCase = _activeDrafts.putIfAbsent(caseId, () => {});
    return draftsForCase.putIfAbsent(workflowType, () {
      return WorkflowDraft(
        caseId: caseId,
        workflowType: workflowType,
        currentStep: 0,
        status: 'NotStarted',
        outputs: const {},
        lastSavedAt: null,
      );
    });
  }

  void saveDraftStep(
    String caseId,
    String workflowType,
    int step,
    Map<String, dynamic> stepOutput,
  ) {
    final draftsForCase = _activeDrafts.putIfAbsent(caseId, () => {});
    final existingDraft = draftsForCase[workflowType];

    final updatedOutputs = Map<int, Map<String, dynamic>>.from(
      existingDraft?.outputs ?? {},
    );
    updatedOutputs[step] = Map<String, dynamic>.from(stepOutput);

    final stepsList = DemoLegalRepository.workflowSteps[workflowType] ?? [];
    final maxStep = stepsList.length;
    final status = (step >= maxStep) ? 'Completed' : 'Draft';

    draftsForCase[workflowType] = WorkflowDraft(
      caseId: caseId,
      workflowType: workflowType,
      currentStep: step,
      status: status,
      outputs: updatedOutputs,
      lastSavedAt: DateTime.now(),
    );
    notifyListeners();
  }

  void startNewWorkflowRun(String caseId, String workflowType) {
    final draftsForCase = _activeDrafts.putIfAbsent(caseId, () => {});
    final existingDraft = draftsForCase[workflowType];

    // Archive current draft as snapshot if there was any progress beyond step 0
    if (existingDraft != null && existingDraft.currentStep > 0) {
      final now = DateTime.now();
      final label =
          'مسودة مؤرشفة تلقائياً - ${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';

      final archivedSnapshot = WorkflowSnapshot(
        id: 'snap-${now.millisecondsSinceEpoch}',
        caseId: caseId,
        workflowType: workflowType,
        currentStep: existingDraft.currentStep,
        label: label,
        createdAt: now,
        outputs: Map<int, Map<String, dynamic>>.from(existingDraft.outputs),
      );
      _snapshots.insert(0, archivedSnapshot);
    }

    // Reset to step 0 with empty outputs
    draftsForCase[workflowType] = WorkflowDraft(
      caseId: caseId,
      workflowType: workflowType,
      currentStep: 0,
      status: 'NotStarted',
      outputs: const {},
      lastSavedAt: DateTime.now(),
    );
    notifyListeners();
  }

  Future<void> saveDraftAsSnapshot(
    String caseId,
    String workflowType,
    String label,
  ) async {
    final draft = _activeDrafts[caseId]?[workflowType];
    if (draft != null) {
      final Map<String, Map<String, dynamic>> stringifiedOutputs = {};
      draft.outputs.forEach((key, value) {
        stringifiedOutputs[key.toString()] = value;
      });
      final outputsJson = jsonEncode(stringifiedOutputs);

      final response = await _apiService.createWorkflowSnapshot(
        caseId: caseId,
        workflowType: workflowType,
        outputsJson: outputsJson,
        currentStep: draft.currentStep,
        label: label,
      );
      if (response['succeeded'] == true) {
        final newSnapshot = _mapJsonToSnapshot(
          response['data'] as Map<String, dynamic>,
        );
        _snapshots.insert(0, newSnapshot);
        notifyListeners();
      } else {
        throw Exception(response['message'] ?? 'Failed to save snapshot');
      }
    }
  }

  void restoreSnapshot(String snapshotId) {
    final snapshotIndex = _snapshots.indexWhere((s) => s.id == snapshotId);
    if (snapshotIndex != -1) {
      final snapshot = _snapshots[snapshotIndex];
      final draftsForCase = _activeDrafts.putIfAbsent(
        snapshot.caseId,
        () => {},
      );

      final stepsList =
          DemoLegalRepository.workflowSteps[snapshot.workflowType] ?? [];
      final maxStep = stepsList.length;
      final status = (snapshot.currentStep >= maxStep) ? 'Completed' : 'Draft';

      draftsForCase[snapshot.workflowType] = WorkflowDraft(
        caseId: snapshot.caseId,
        workflowType: snapshot.workflowType,
        currentStep: snapshot.currentStep,
        status: status,
        outputs: Map<int, Map<String, dynamic>>.from(snapshot.outputs),
        lastSavedAt: DateTime.now(),
      );
      notifyListeners();
    }
  }

  Future<void> renameSnapshot(String snapshotId, String newLabel) async {
    final parsedId = int.tryParse(snapshotId);
    if (parsedId != null) {
      final response = await _apiService.updateWorkflowSnapshotLabel(
        parsedId,
        newLabel,
      );
      if (response['succeeded'] == true) {
        final index = _snapshots.indexWhere((s) => s.id == snapshotId);
        if (index != -1) {
          _snapshots[index] = _snapshots[index].copyWith(label: newLabel);
          notifyListeners();
        }
      } else {
        throw Exception(response['message'] ?? 'Failed to rename snapshot');
      }
    } else {
      throw Exception('Invalid snapshot ID');
    }
  }

  Future<void> deleteSnapshot(String snapshotId) async {
    final parsedId = int.tryParse(snapshotId);
    if (parsedId != null) {
      final response = await _apiService.deleteWorkflowSnapshot(parsedId);
      if (response['succeeded'] == true) {
        _snapshots.removeWhere((s) => s.id == snapshotId);
        notifyListeners();
      } else {
        throw Exception(response['message'] ?? 'Failed to delete snapshot');
      }
    } else {
      throw Exception('Invalid snapshot ID');
    }
  }

  List<LegalCase> get filteredCases {
    final query = _caseSearchQuery.trim().toLowerCase();
    if (query.isEmpty) {
      return cases;
    }

    return _cases
        .where((legalCase) {
          final haystack = <String>[
            legalCase.caseNumber,
            legalCase.title,
            legalCase.clientName,
            legalCase.court,
            legalCase.caseType,
          ].join(' ').toLowerCase();
          return haystack.contains(query);
        })
        .toList(growable: false);
  }

  void completeOnboarding() {
    _hasCompletedOnboarding = true;
    notifyListeners();
  }

  Future<bool> login(String identifier, String password) async {
    try {
      final result = await _apiService.login(identifier, password);
      if (result['succeeded'] == true) {
        final token = result['data']?['accessToken']?.toString();
        if (token != null) {
          _apiService.setToken(token);
          _signalRService.init(_defaultHubUrl, accessToken: token);
        }
        _hasCompletedOnboarding = true;
        _isAuthenticated = true;
        await _connectSignalR();
        await fetchLiveData();
        notifyListeners();
        return true;
      }
    } catch (e) {
      if (kDebugMode) {
        print('API Login failed: $e');
      }
    }
    return false;
  }

  void logout() {
    _isAuthenticated = false;
    _selectedTab = 0;
    _notifications = [];
    _apiGaps = [];
    _appLoadState = const ScreenStateInfo(status: ScreenLoadStatus.idle);
    _apiService.logout();
    _disconnectSignalR();
    notifyListeners();
  }

  void setSelectedTab(int index) {
    _selectedTab = index;
    notifyListeners();
  }

  void setDarkMode(bool value) {
    _isDarkMode = value;
    notifyListeners();
  }

  void setCaseSearchQuery(String value) {
    _caseSearchQuery = value;
    notifyListeners();
  }

  Future<void> markNotificationRead(String id) async {
    final index = _notifications.indexWhere(
      (notification) => notification.id == id,
    );
    if (index == -1 || _notifications[index].isRead) {
      return;
    }

    final previous = _notifications[index];
    _notifications[index] = previous.copyWith(isRead: true);
    notifyListeners();

    try {
      final response = await _apiService.markNotificationRead(id);
      if (response['succeeded'] != true) {
        throw Exception(
          response['message'] ?? 'Failed to mark notification as read',
        );
      }
    } catch (_) {
      _notifications[index] = previous;
      notifyListeners();
      rethrow;
    }
  }

  Future<void> addCase(AddCaseInput input) async {
    final response = await _apiService.createCase(
      title: 'قضية ${input.caseType}',
      number: input.caseNumber,
      court: input.court,
      clientName: input.clientName,
      caseType: input.caseType,
      facts: input.facts,
      legalClaims: input.legalClaims,
      adversary: input.adversary,
    );
    if (response['succeeded'] == true) {
      await fetchLiveData();
    } else {
      throw Exception(response['message'] ?? 'Failed to create case');
    }
  }

  Future<void> addClient(String name, String phone, String email) async {
    final response = await _apiService.createClient(
      name: name,
      phone: phone,
      email: email,
    );
    if (response['succeeded'] == true) {
      await fetchLiveData();
    } else {
      throw Exception(response['message'] ?? 'Failed to create client');
    }
  }

  LegalCase caseById(String id) => _cases.firstWhere(
    (legalCase) => legalCase.id == id,
    orElse: () => _cases.first,
  );

  Client clientById(String id) => clients.firstWhere(
    (client) => client.id == id,
    orElse: () => clients.first,
  );

  List<LegalDocument> documentsForCase(String caseId) => documents
      .where((document) => document.caseId == caseId)
      .toList(growable: false);

  List<AgendaItem> agendaForCase(String caseId) => agenda
      .where((agendaItem) => agendaItem.caseId == caseId)
      .toList(growable: false);

  List<AiWorkflow> workflowsForCase(String caseId) =>
      repository.workflowsForCase(caseId);
}
