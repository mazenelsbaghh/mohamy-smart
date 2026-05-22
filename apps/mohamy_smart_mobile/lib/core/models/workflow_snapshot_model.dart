class WorkflowSnapshot {
  const WorkflowSnapshot({
    required this.id,
    required this.caseId,
    required this.workflowType,
    required this.currentStep,
    required this.label,
    required this.createdAt,
    required this.outputs,
  });

  final String id;
  final String caseId;
  final String workflowType;
  final int currentStep;
  final String? label;
  final DateTime createdAt;
  final Map<int, Map<String, dynamic>> outputs;

  WorkflowSnapshot copyWith({
    String? id,
    String? caseId,
    String? workflowType,
    int? currentStep,
    String? label,
    DateTime? createdAt,
    Map<int, Map<String, dynamic>>? outputs,
  }) {
    return WorkflowSnapshot(
      id: id ?? this.id,
      caseId: caseId ?? this.caseId,
      workflowType: workflowType ?? this.workflowType,
      currentStep: currentStep ?? this.currentStep,
      label: label ?? this.label,
      createdAt: createdAt ?? this.createdAt,
      outputs: outputs ?? this.outputs,
    );
  }
}

class WorkflowDraft {
  const WorkflowDraft({
    required this.caseId,
    required this.workflowType,
    required this.currentStep,
    required this.status,
    required this.outputs,
    this.lastSavedAt,
  });

  final String caseId;
  final String workflowType;
  final int currentStep;
  final String status; // 'NotStarted', 'Draft', 'Completed'
  final Map<int, Map<String, dynamic>> outputs;
  final DateTime? lastSavedAt;

  WorkflowDraft copyWith({
    String? caseId,
    String? workflowType,
    int? currentStep,
    String? status,
    Map<int, Map<String, dynamic>>? outputs,
    DateTime? lastSavedAt,
  }) {
    return WorkflowDraft(
      caseId: caseId ?? this.caseId,
      workflowType: workflowType ?? this.workflowType,
      currentStep: currentStep ?? this.currentStep,
      status: status ?? this.status,
      outputs: outputs ?? this.outputs,
      lastSavedAt: lastSavedAt ?? this.lastSavedAt,
    );
  }
}
