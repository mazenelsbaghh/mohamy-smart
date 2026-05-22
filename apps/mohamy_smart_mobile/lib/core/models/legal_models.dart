enum CaseStatus {
  active('نشطة'),
  pending('قيد الانتظار'),
  completed('منتهية');

  const CaseStatus(this.label);
  final String label;
}

enum DocumentStatus {
  uploading('جار الرفع'),
  processing('جار استخراج النص'),
  ready('جاهز للتحليل'),
  failed('فشل الرفع');

  const DocumentStatus(this.label);
  final String label;
}

enum AiWorkflowStatus {
  available('متاح'),
  blocked('غير متاح'),
  running('جار التشغيل'),
  paused('متوقف مؤقتا'),
  failed('فشل'),
  completed('مكتمل');

  const AiWorkflowStatus(this.label);
  final String label;
}

class LawyerProfile {
  const LawyerProfile({
    required this.id,
    required this.displayName,
    required this.licenseNumber,
    required this.firmName,
    required this.phone,
    required this.email,
    required this.aiPoints,
  });

  final String id;
  final String displayName;
  final String licenseNumber;
  final String firmName;
  final String phone;
  final String email;
  final int aiPoints;
}

class CaseReadiness {
  const CaseReadiness({
    required this.hasDocuments,
    required this.hasFacts,
    required this.hasEnoughPoints,
  });

  final bool hasDocuments;
  final bool hasFacts;
  final bool hasEnoughPoints;
}

class LegalCase {
  const LegalCase({
    required this.id,
    required this.caseNumber,
    required this.title,
    required this.clientId,
    required this.clientName,
    required this.court,
    required this.caseType,
    required this.status,
    required this.facts,
    required this.documentIds,
    required this.readiness,
    this.nextSessionAt,
    this.adversary = '',
  });

  final String id;
  final String caseNumber;
  final String title;
  final String clientId;
  final String clientName;
  final String court;
  final String caseType;
  final CaseStatus status;
  final DateTime? nextSessionAt;
  final List<String> facts;
  final List<String> documentIds;
  final CaseReadiness readiness;
  final String adversary;
}

class Client {
  const Client({
    required this.id,
    required this.name,
    required this.phone,
    required this.email,
    required this.caseIds,
    required this.lastActivity,
  });

  final String id;
  final String name;
  final String phone;
  final String email;
  final List<String> caseIds;
  final String lastActivity;
}

class AgendaItem {
  const AgendaItem({
    required this.id,
    required this.caseId,
    required this.title,
    required this.court,
    required this.startsAt,
    required this.status,
  });

  final String id;
  final String caseId;
  final String title;
  final String court;
  final DateTime startsAt;
  final String status;
}

class LegalDocument {
  const LegalDocument({
    required this.id,
    required this.title,
    required this.type,
    required this.dateLabel,
    required this.status,
    required this.isAiReady,
    this.caseId,
    this.clientId,
  });

  final String id;
  final String title;
  final String type;
  final String dateLabel;
  final DocumentStatus status;
  final bool isAiReady;
  final String? caseId;
  final String? clientId;
}

class AiWorkflow {
  const AiWorkflow({
    required this.id,
    required this.caseId,
    required this.title,
    required this.description,
    required this.pointCost,
    required this.status,
    required this.progress,
    this.outputPreview,
    this.stepCount = 3,
    this.iconName = 'bolt',
  });

  final String id;
  final String caseId;
  final String title;
  final String description;
  final int pointCost;
  final AiWorkflowStatus status;
  final int progress;
  final String? outputPreview;
  final int stepCount;
  final String iconName;
}

class UsageEntry {
  const UsageEntry({
    required this.title,
    required this.points,
    required this.dateLabel,
  });

  final String title;
  final int points;
  final String dateLabel;
}

class SubscriptionPlan {
  const SubscriptionPlan({
    required this.name,
    required this.renewalDate,
    required this.aiPoints,
    required this.usageEntries,
  });

  final String name;
  final String renewalDate;
  final int aiPoints;
  final List<UsageEntry> usageEntries;
}

class AddCaseInput {
  const AddCaseInput({
    required this.caseNumber,
    required this.clientName,
    required this.court,
    required this.caseType,
  });

  final String caseNumber;
  final String clientName;
  final String court;
  final String caseType;
}

class InternalRegulation {
  const InternalRegulation({
    required this.id,
    required this.title,
    required this.sections,
    this.regulationNumber,
    this.issuingAuthority,
    this.summary,
    this.isActive = true,
  });

  final String id;
  final String title;
  final List<String> sections;
  final String? regulationNumber;
  final String? issuingAuthority;
  final String? summary;
  final bool isActive;

  InternalRegulation copyWith({
    String? id,
    String? title,
    List<String>? sections,
    String? regulationNumber,
    String? issuingAuthority,
    String? summary,
    bool? isActive,
  }) {
    return InternalRegulation(
      id: id ?? this.id,
      title: title ?? this.title,
      sections: sections ?? this.sections,
      regulationNumber: regulationNumber ?? this.regulationNumber,
      issuingAuthority: issuingAuthority ?? this.issuingAuthority,
      summary: summary ?? this.summary,
      isActive: isActive ?? this.isActive,
    );
  }
}

class PowerOfAttorney {
  const PowerOfAttorney({
    required this.id,
    required this.number,
    required this.clientId,
    required this.clientName,
    required this.type,
    required this.dateLabel,
    required this.status, // e.g. "نشط", "منتهي", "ملغي"
    this.cancellationReason, // death, revocation, expired, other (وفاة الموكل، إلغاء من الموكل، انتهاء المدة، سبب آخر)
  });

  final String id;
  final String number;
  final String clientId;
  final String clientName;
  final String type;
  final String dateLabel;
  final String status;
  final String? cancellationReason;

  PowerOfAttorney copyWith({
    String? id,
    String? number,
    String? clientId,
    String? clientName,
    String? type,
    String? dateLabel,
    String? status,
    String? cancellationReason,
  }) {
    return PowerOfAttorney(
      id: id ?? this.id,
      number: number ?? this.number,
      clientId: clientId ?? this.clientId,
      clientName: clientName ?? this.clientName,
      type: type ?? this.type,
      dateLabel: dateLabel ?? this.dateLabel,
      status: status ?? this.status,
      cancellationReason: cancellationReason ?? this.cancellationReason,
    );
  }
}

