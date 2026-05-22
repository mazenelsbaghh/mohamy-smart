import 'package:flutter/foundation.dart';

import '../core/data/demo_legal_repository.dart';
import '../core/models/legal_models.dart';

class AppState extends ChangeNotifier {
  AppState({DemoLegalRepository? repository})
    : repository = repository ?? DemoLegalRepository() {
    _cases = List<LegalCase>.from(this.repository.cases);
  }

  final DemoLegalRepository repository;

  bool _hasCompletedOnboarding = false;
  bool _isAuthenticated = false;
  bool _isDarkMode = false;
  int _selectedTab = 0;
  String _caseSearchQuery = '';
  late List<LegalCase> _cases;

  bool get hasCompletedOnboarding => _hasCompletedOnboarding;
  bool get isAuthenticated => _isAuthenticated;
  bool get isDarkMode => _isDarkMode;
  int get selectedTab => _selectedTab;
  String get caseSearchQuery => _caseSearchQuery;
  LawyerProfile get profile => repository.profile;
  List<Client> get clients => repository.clients;
  List<AgendaItem> get agenda => repository.agenda;
  List<LegalDocument> get documents => repository.documents;
  SubscriptionPlan get subscription => repository.subscription;
  List<LegalCase> get cases => List<LegalCase>.unmodifiable(_cases);

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

  bool login(String identifier, String password) {
    final accepted = identifier.trim().isNotEmpty && password.trim().isNotEmpty;
    if (accepted) {
      _hasCompletedOnboarding = true;
      _isAuthenticated = true;
      notifyListeners();
    }
    return accepted;
  }

  void logout() {
    _isAuthenticated = false;
    _selectedTab = 0;
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

  void addCase(AddCaseInput input) {
    final id = 'case-${_cases.length + 1}';
    _cases = <LegalCase>[
      LegalCase(
        id: id,
        caseNumber: input.caseNumber,
        title: 'قضية ${input.caseType}',
        clientId: 'client-new',
        clientName: input.clientName,
        court: input.court,
        caseType: input.caseType,
        status: CaseStatus.active,
        facts: const <String>[],
        documentIds: const <String>[],
        readiness: const CaseReadiness(
          hasDocuments: false,
          hasFacts: false,
          hasEnoughPoints: true,
        ),
      ),
      ..._cases,
    ];
    _caseSearchQuery = '';
    notifyListeners();
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
