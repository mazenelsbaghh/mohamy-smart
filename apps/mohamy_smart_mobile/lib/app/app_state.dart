import 'package:flutter/foundation.dart';

import '../core/data/demo_legal_repository.dart';
import '../core/models/legal_models.dart';
import '../core/models/workflow_snapshot_model.dart';

class AppState extends ChangeNotifier {
  AppState({DemoLegalRepository? repository})
    : repository = repository ?? DemoLegalRepository() {
    _cases = List<LegalCase>.from(this.repository.cases);
    _snapshots = List<WorkflowSnapshot>.from(this.repository.mockSnapshots);
  }

  final DemoLegalRepository repository;

  bool _hasCompletedOnboarding = false;
  bool _isAuthenticated = false;
  bool _isDarkMode = false;
  int _selectedTab = 0;
  String _caseSearchQuery = '';
  late List<LegalCase> _cases;

  // Track active drafts per case and workflow type
  final Map<String, Map<String, WorkflowDraft>> _activeDrafts = {};
  // Track all snapshots across the application
  late final List<WorkflowSnapshot> _snapshots;

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

  // Workflow Snapshots Getters
  List<WorkflowSnapshot> get snapshots => List<WorkflowSnapshot>.unmodifiable(_snapshots);

  List<WorkflowSnapshot> snapshotsForCaseAndWorkflow(String caseId, String workflowType) {
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

  void saveDraftStep(String caseId, String workflowType, int step, Map<String, dynamic> stepOutput) {
    final draftsForCase = _activeDrafts.putIfAbsent(caseId, () => {});
    final existingDraft = draftsForCase[workflowType];

    final updatedOutputs = Map<int, Map<String, dynamic>>.from(existingDraft?.outputs ?? {});
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
      final label = 'مسودة مؤرشفة تلقائياً - ${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
      
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

  void saveDraftAsSnapshot(String caseId, String workflowType, String label) {
    final draft = _activeDrafts[caseId]?[workflowType];
    if (draft != null) {
      final now = DateTime.now();
      final name = label.trim().isEmpty ? 'نسخة حفظ - ${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}' : label;
      final newSnapshot = WorkflowSnapshot(
        id: 'snap-${now.millisecondsSinceEpoch}',
        caseId: caseId,
        workflowType: workflowType,
        currentStep: draft.currentStep,
        label: name,
        createdAt: now,
        outputs: Map<int, Map<String, dynamic>>.from(draft.outputs),
      );
      _snapshots.insert(0, newSnapshot);
      notifyListeners();
    }
  }

  void restoreSnapshot(String snapshotId) {
    final snapshotIndex = _snapshots.indexWhere((s) => s.id == snapshotId);
    if (snapshotIndex != -1) {
      final snapshot = _snapshots[snapshotIndex];
      final draftsForCase = _activeDrafts.putIfAbsent(snapshot.caseId, () => {});
      
      final stepsList = DemoLegalRepository.workflowSteps[snapshot.workflowType] ?? [];
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

  void renameSnapshot(String snapshotId, String newLabel) {
    final index = _snapshots.indexWhere((s) => s.id == snapshotId);
    if (index != -1) {
      _snapshots[index] = _snapshots[index].copyWith(label: newLabel);
      notifyListeners();
    }
  }

  void deleteSnapshot(String snapshotId) {
    _snapshots.removeWhere((s) => s.id == snapshotId);
    notifyListeners();
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
