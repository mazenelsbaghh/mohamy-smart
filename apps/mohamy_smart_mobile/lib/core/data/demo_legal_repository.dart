import '../models/legal_models.dart';
import '../models/workflow_snapshot_model.dart';

class WorkflowStepDef {
  const WorkflowStepDef({
    required this.index,
    required this.title,
    required this.description,
  });
  final int index;
  final String title;
  final String description;
}

class DemoLegalRepository {
  DemoLegalRepository() {
    _initMockSnapshots();
  }

  final LawyerProfile profile = const LawyerProfile(
    id: 'lawyer-1',
    displayName: 'أستاذ مازن',
    licenseNumber: 'LIC-24591',
    firmName: 'مكتب المحامي الذكي',
    phone: '+966500000000',
    email: 'lawyer@mohamy-smart.com',
    aiPoints: 1280,
  );

  late final List<Client> clients = <Client>[
    const Client(
      id: 'client-1',
      name: 'أحمد السالم',
      phone: '+966501112233',
      email: 'ahmad@example.com',
      caseIds: <String>['case-1', 'case-3'],
      lastActivity: 'تمت مراجعة المستندات أمس',
    ),
    const Client(
      id: 'client-2',
      name: 'شركة النخبة التجارية',
      phone: '+966509998877',
      email: 'legal@nokhba.example',
      caseIds: <String>['case-2'],
      lastActivity: 'جلسة قادمة خلال يومين',
    ),
    const Client(
      id: 'client-3',
      name: 'سارة القحطاني',
      phone: '+966507776655',
      email: 'sarah@example.com',
      caseIds: <String>[],
      lastActivity: 'عميل جديد',
    ),
    const Client(
      id: 'client-4',
      name: 'شركة النور للتجارة',
      phone: '+966509995544',
      email: 'contact@alnoor.example',
      caseIds: <String>['case-4'],
      lastActivity: 'تم استلام تقرير الطب الشرعي',
    ),
  ];

  late final List<InternalRegulation> internalRegulations = <InternalRegulation>[
    const InternalRegulation(
      id: 'reg-1',
      title: 'ميثاق السلوك المهني والسرية',
      regulationNumber: 'REG-2026-001',
      issuingAuthority: 'مجلس إدارة الشركة',
      summary: 'يحدد التزامات المحامين والموظفين تجاه الموكلين وحفظ سرية المعلومات والوقائع والقضايا.',
      sections: [
        'يجب المحافظة التامة على سرية بيانات الموكلين وقضاياهم.',
        'يحظر مشاركة أي مستندات قضائية خارج النطاق الإداري للمكتب.',
        'الالتزام بالاحترام المتبادل وقيم العدالة والأمانة المهنية.'
      ],
      isActive: true,
    ),
    const InternalRegulation(
      id: 'reg-2',
      title: 'قواعد صياغة مذكرات الدفاع والعقود',
      regulationNumber: 'REG-2026-002',
      issuingAuthority: 'اللجنة القانونية الفنية',
      summary: 'مبادئ توجيهية لصياغة المذكرات وتأسيس العقود القانونية وتنسيق الدفوع والطلبات.',
      sections: [
        'الاعتماد على صيغة قانونية متينة وخالية من الركاكة اللغوية.',
        'ترتيب الوقائع تسلسلياً ثم تقديم الدفوع وعناوين القانون.',
        'إجراء مراجعة وتدقيق ذكي ومطابقة مع لوائح أحكام المحاكم.'
      ],
      isActive: true,
    ),
    const InternalRegulation(
      id: 'reg-3',
      title: 'سياسة النقاط والذكاء الاصطناعي',
      regulationNumber: 'REG-2026-003',
      issuingAuthority: 'إدارة الدعم التقني',
      summary: 'شروط خصم نقاط الذكاء الاصطناعي وتجديد الباقات والمستندات المدعومة.',
      sections: [
        'خصم النقاط يتم فقط عند تشغيل مهام التحليل أو توليد الدفاع بنجاح.',
        'رصيد النقاط يتجدد شهرياً تلقائياً أو عند الشراء الإضافي.',
        'الطلبات الفاشلة لا تحسب ولا يتم خصم أي نقاط مقابلها.'
      ],
      isActive: true,
    ),
  ];

  late final List<PowerOfAttorney> powerOfAttorneys = <PowerOfAttorney>[
    const PowerOfAttorney(
      id: 'poa-1',
      number: '241526435',
      clientId: 'client-1',
      clientName: 'أحمد السالم',
      dateLabel: '2025-02-12',
      type: 'توكيل رسمي عام قضايا',
      status: 'نشط',
    ),
    const PowerOfAttorney(
      id: 'poa-2',
      number: '984534121',
      clientId: 'client-2',
      clientName: 'شركة النخبة التجارية',
      dateLabel: '2024-11-05',
      type: 'توكيل خاص بالدمج وتأسيس الشركات',
      status: 'نشط',
    ),
    const PowerOfAttorney(
      id: 'poa-3',
      number: '473625142',
      clientId: 'client-3',
      clientName: 'سارة القحطاني',
      dateLabel: '2023-05-10',
      type: 'توكيل رسمي خاص بالبيع والتصرف',
      status: 'منتهي',
    ),
  ];

  late final List<LegalCase> cases = <LegalCase>[
    LegalCase(
      id: 'case-1',
      caseNumber: '١٢٣٤ / ٢٠٢٦',
      title: 'مطالبة مالية ضد مؤسسة توريد',
      clientId: 'client-1',
      clientName: 'أحمد السالم',
      court: 'المحكمة التجارية بالرياض',
      caseType: 'تجاري',
      status: CaseStatus.active,
      nextSessionAt: DateTime(2026, 5, 22, 11, 30),
      facts: const <String>[
        'تأخر المدعى عليه في سداد الدفعة الأخيرة.',
        'يوجد عقد توريد موقع بين الطرفين.',
        'تم إرسال إنذار رسمي قبل رفع الدعوى.',
      ],
      documentIds: const <String>['doc-1', 'doc-2'],
      readiness: const CaseReadiness(
        hasDocuments: true,
        hasFacts: true,
        hasEnoughPoints: true,
      ),
    ),
    LegalCase(
      id: 'case-2',
      caseNumber: '٨٨٢ / ٢٠٢٥',
      title: 'نزاع عقد وكالة تجارية',
      clientId: 'client-2',
      clientName: 'شركة النخبة التجارية',
      court: 'محكمة الاستئناف',
      caseType: 'استئناف',
      status: CaseStatus.pending,
      nextSessionAt: DateTime(2026, 5, 24, 9),
      facts: const <String>[
        'صدر حكم ابتدائي بإلزام جزئي.',
        'يوجد اعتراض على تفسير بند التعويض.',
      ],
      documentIds: const <String>['doc-3'],
      readiness: const CaseReadiness(
        hasDocuments: true,
        hasFacts: true,
        hasEnoughPoints: true,
      ),
    ),
    LegalCase(
      id: 'case-3',
      caseNumber: '٤٥١ / ٢٠٢٤',
      title: 'طلب تنفيذ سند لأمر',
      clientId: 'client-1',
      clientName: 'أحمد السالم',
      court: 'محكمة التنفيذ بجدة',
      caseType: 'تنفيذ',
      status: CaseStatus.completed,
      facts: const <String>['تم قيد طلب التنفيذ وإشعار المنفذ ضده.'],
      documentIds: const <String>[],
      readiness: const CaseReadiness(
        hasDocuments: false,
        hasFacts: true,
        hasEnoughPoints: true,
      ),
    ),
    LegalCase(
      id: 'case-4',
      caseNumber: '١٢٣٤٥ / ٢٠٢٤',
      title: 'دعوى التزوير في محررات رسمية - شركة النور',
      clientId: 'client-4',
      clientName: 'شركة النور للتجارة',
      court: 'محكمة استئناف القاهرة',
      caseType: 'جنايات - تزوير',
      status: CaseStatus.active,
      adversary: 'شركة النور للتوريدات العمومية',
      facts: const <String>[
        'تتلخص وقائع الدعوى في قيام المدعى عليهم بمحاولة الاستيلاء على قطعة أرض مملوكة لشركة "النور" بموجب عقد مسجل مزور. حيث تبين من التحقيقات الأولية وجود تلاعب في أختام الشهر العقاري وتواقيع الموظفين المختصين.',
        'وقد تقدم مكتبنا بطلب لندب خبير من مصلحة الطب الشرعي (قسم أبحاث التزييف والتزوير) لمضاهاة التواقيع والأختام الواردة بالعقد محل النزاع مع الأختام الأصلية، وورد التقرير الفني مؤيداً لوجهة نظرنا، مما يعزز الموقف القانوني للشركة في استرداد كامل حقوقها المغتصبة.',
      ],
      documentIds: const <String>['doc-4'],
      readiness: const CaseReadiness(
        hasDocuments: true,
        hasFacts: true,
        hasEnoughPoints: true,
      ),
    ),
  ];

  late final List<AgendaItem> agenda = <AgendaItem>[
    AgendaItem(
      id: 'agenda-1',
      caseId: 'case-1',
      title: 'جلسة مرافعة',
      court: 'المحكمة التجارية بالرياض',
      startsAt: DateTime(2026, 5, 22, 11, 30),
      status: 'قادمة',
    ),
    AgendaItem(
      id: 'agenda-2',
      caseId: 'case-2',
      title: 'تقديم مذكرة اعتراض',
      court: 'محكمة الاستئناف',
      startsAt: DateTime(2026, 5, 24, 9),
      status: 'مطلوب متابعة',
    ),
  ];

  late final List<LegalDocument> documents = <LegalDocument>[
    const LegalDocument(
      id: 'doc-1',
      caseId: 'case-1',
      clientId: 'client-1',
      title: 'عقد التوريد الموقع',
      type: 'عقد',
      dateLabel: '٢٠ مايو ٢٠٢٦',
      status: DocumentStatus.ready,
      isAiReady: true,
    ),
    const LegalDocument(
      id: 'doc-2',
      caseId: 'case-1',
      clientId: 'client-1',
      title: 'الإنذار القانوني',
      type: 'إنذار',
      dateLabel: '٢١ مايو ٢٠٢٦',
      status: DocumentStatus.processing,
      isAiReady: false,
    ),
    const LegalDocument(
      id: 'doc-3',
      caseId: 'case-2',
      clientId: 'client-2',
      title: 'الحكم الابتدائي',
      type: 'حكم',
      dateLabel: '١٨ مايو ٢٠٢٦',
      status: DocumentStatus.ready,
      isAiReady: true,
    ),
    const LegalDocument(
      id: 'doc-4',
      caseId: 'case-4',
      clientId: 'client-4',
      title: 'تقرير الطب الشرعي الفني المعتمد',
      type: 'تقرير',
      dateLabel: '١٥ يناير ٢٠٢٤',
      status: DocumentStatus.ready,
      isAiReady: true,
    ),
  ];

  late final SubscriptionPlan subscription = const SubscriptionPlan(
    name: 'الخطة الاحترافية',
    renewalDate: '٣٠ يونيو ٢٠٢٦',
    aiPoints: 1280,
    usageEntries: <UsageEntry>[
      UsageEntry(title: 'مذكرة دفاع', points: -120, dateLabel: 'اليوم'),
      UsageEntry(title: 'تحليل حكم', points: -80, dateLabel: 'أمس'),
      UsageEntry(
        title: 'شراء باقة نقاط',
        points: 500,
        dateLabel: '١٩ مايو ٢٠٢٦',
      ),
    ],
  );

  List<AiWorkflow> workflowsForCase(String caseId) => <AiWorkflow>[
    AiWorkflow(
      id: 'workflow-defense-$caseId',
      caseId: caseId,
      title: 'إعداد مذكرة دفاع',
      description: 'إنشاء مذكرة دفاع شاملة بناءً على وقائع القضية المذكورة',
      pointCost: 120,
      status: AiWorkflowStatus.available,
      progress: 0,
      stepCount: 5,
      iconName: 'bolt',
    ),
    AiWorkflow(
      id: 'workflow-claim-$caseId',
      caseId: caseId,
      title: 'إعداد صحيفة دعوى',
      description: 'إنشاء صحيفة دعوى كاملة مع كافة الأسانيد القانونية',
      pointCost: 150,
      status: AiWorkflowStatus.available,
      progress: 0,
      stepCount: 8,
      iconName: 'description',
    ),
    AiWorkflow(
      id: 'workflow-appeal-$caseId',
      caseId: caseId,
      title: 'صحيفة طعن بالنقض',
      description: 'إعداد صحيفة طعن بالنقض طبقاً لآخر الأحكام القضائية',
      pointCost: 180,
      status: AiWorkflowStatus.available,
      progress: 0,
      stepCount: 7,
      iconName: 'gavel',
    ),
    AiWorkflow(
      id: 'workflow-complaint-$caseId',
      caseId: caseId,
      title: 'شكوى رسمية',
      description: 'إعداد شكوى رسمية موجهة للجهات المختصة',
      pointCost: 100,
      status: AiWorkflowStatus.available,
      progress: 0,
      stepCount: 6,
      iconName: 'warning',
    ),
    AiWorkflow(
      id: 'workflow-ruling-$caseId',
      caseId: caseId,
      title: 'تحليل حكم',
      description: 'تحليل الحكم وتقييم العيوب القانونية لفرص الاستئناف',
      pointCost: 80,
      status: AiWorkflowStatus.available,
      progress: 0,
      stepCount: 5,
      iconName: 'analytics',
    ),
    AiWorkflow(
      id: 'workflow-warning-$caseId',
      caseId: caseId,
      title: 'إنذار رسمي',
      description: 'إعداد إنذار بالصيغة القانونية الصحيحة عبر المحضرين',
      pointCost: 50,
      status: AiWorkflowStatus.available,
      progress: 0,
      stepCount: 4,
      iconName: 'fact_check',
    ),
    AiWorkflow(
      id: 'workflow-execution-$caseId',
      caseId: caseId,
      title: 'طلب تنفيذي',
      description: 'إعداد عريضة طلب تنفيذي لمسودة الحكم الصادر',
      pointCost: 60,
      status: AiWorkflowStatus.available,
      progress: 0,
      stepCount: 4,
      iconName: 'task',
    ),
  ];

  // Steps definition dictionary
  static final Map<String, List<WorkflowStepDef>> workflowSteps = {
    'defense-memo': const [
      WorkflowStepDef(index: 1, title: 'التحليل القانوني', description: 'استخلاص الوقائع ومطابقتها قانونياً'),
      WorkflowStepDef(index: 2, title: 'الدفوع', description: 'استخراج الدفوع الإجرائية والموضوعية والمستندية'),
      WorkflowStepDef(index: 3, title: 'الطلبات', description: 'صياغة الطلبات النهائية الموجهة للمحكمة'),
      WorkflowStepDef(index: 4, title: 'المذكرة النهائية', description: 'تجميع المذكرة وصياغتها بالكامل'),
    ],
    'preparing-statement-of-claims': const [
      WorkflowStepDef(index: 1, title: 'نوع الدعوى', description: 'تحديد التصنيف الدقيق للدعوى القضائية'),
      WorkflowStepDef(index: 2, title: 'الأطراف', description: 'بيانات المدعي والمدعى عليه في الخصومة'),
      WorkflowStepDef(index: 3, title: 'الموضوع', description: 'تحديد عنوان ومحور النزاع الرئيسي'),
      WorkflowStepDef(index: 4, title: 'الوقائع', description: 'الصياغة الواقعية المنظمة للأحداث'),
      WorkflowStepDef(index: 5, title: 'الأساس القانوني', description: 'الأسانيد والمواد القانونية المنظمة للنزاع'),
      WorkflowStepDef(index: 6, title: 'الطلبات', description: 'تحديد الطلبات الرئيسية والفرعية المدعى بها'),
      WorkflowStepDef(index: 7, title: 'الصحيفة', description: 'تجميع صحيفة الدعوى متكاملة ومعدّة للطباعة'),
    ],
    'appeal-brief': const [
      WorkflowStepDef(index: 1, title: 'بيانات الحكم', description: 'إدخال معلومات المحكمة ومنطوق الحكم الصادر'),
      WorkflowStepDef(index: 2, title: 'تحليل الأسباب', description: 'استخراج عيوب التدليل والقصور في الحكم'),
      WorkflowStepDef(index: 3, title: 'أوجه الطعن', description: 'صياغة أسباب الطعن بالاستئناف بالنقاط'),
      WorkflowStepDef(index: 4, title: 'الطلبات', description: 'تحديد الطلبات الختامية في الاستئناف'),
      WorkflowStepDef(index: 5, title: 'السند القانوني', description: 'الأسانيد والمواد القانونية التي تدعم الطعن'),
      WorkflowStepDef(index: 6, title: 'صحيفة الاستئناف', description: 'تجميع صحيفة الاستئناف متكاملة ومعدّة للطباعة'),
    ],
    'admin-complaint': const [
      WorkflowStepDef(index: 1, title: 'بيانات الجهة والأساس', description: 'تحديد الجهة الإدارية والأساس القانوني'),
      WorkflowStepDef(index: 2, title: 'سرد الوقائع', description: 'تفصيل وقائع الشكوى بالتسلسل الزمني'),
      WorkflowStepDef(index: 3, title: 'تحليل المخالفات', description: 'تحديد المخالفات الإدارية المرتكبة'),
      WorkflowStepDef(index: 4, title: 'صياغة الطلبات', description: 'تحديد طلبات المتظلم الإدارية والمالية'),
      WorkflowStepDef(index: 5, title: 'الشكوى النهائية', description: 'تجميع الشكوى النهائية متكاملة ومعدّة للطباعة'),
    ],
    'ruling-analysis': const [
      WorkflowStepDef(index: 1, title: 'منطوق الحكم', description: 'تحليل منطوق الحكم والقرارات الصادرة'),
      WorkflowStepDef(index: 2, title: 'أسباب الحكم', description: 'دراسة تسبيب الحيثيات والحجج القانونية'),
      WorkflowStepDef(index: 3, title: 'تقييم العيوب', description: 'تقييم الثغرات والعيوب المؤثرة في الحكم'),
      WorkflowStepDef(index: 4, title: 'خلاصة الطعن', description: 'تقييم فرص قبول الطعن والتوصيات النهائية'),
    ],
    'legal-warning': const [
      WorkflowStepDef(index: 1, title: 'تصنيف الإنذار', description: 'تحديد نوع ومضمون الإنذار ومحله'),
      WorkflowStepDef(index: 2, title: 'صياغة المتن', description: 'صياغة تفاصيل الإنذار والمهلة الممنوحة للوفاء'),
      WorkflowStepDef(index: 3, title: 'الإنذار النهائي', description: 'تجميع الإنذار بصيغته النهائية المعدة للمحضرين'),
    ],
    'exec-request': const [
      WorkflowStepDef(index: 1, title: 'تصنيف الطلب', description: 'تحديد تصنيف الطلب والمستند التنفيذي والجهة'),
      WorkflowStepDef(index: 2, title: 'صياغة المبررات', description: 'كتابة أسباب ومبررات طلب التنفيذ العاجل'),
      WorkflowStepDef(index: 3, title: 'الطلب النهائي', description: 'تجميع طلب التنفيذ بصيغته النهائية وطلبات الحجز'),
    ],
  };
  late final List<WorkflowSnapshot> mockSnapshots = <WorkflowSnapshot>[];

  void _initMockSnapshots() {
    mockSnapshots.addAll([
      WorkflowSnapshot(
        id: 'snap-1',
        caseId: 'case-1',
        workflowType: 'defense-memo',
        currentStep: 2,
        label: 'لقطة دفاع - جلسة الاستجواب الأولى',
        createdAt: DateTime.now().subtract(const Duration(days: 2)),
        outputs: const {
          1: {
            'legalFactsSummary': [
              'انتفاء الركن المادي للجريمة المنسوبة في الأوراق.',
              'تناقض أقوال شهود الإثبات وتضارب رواياتهم حول الواقعة.'
            ],
            'caseType': 'مذكرة دفاع جنائي'
          },
          2: {
            'defensesFormal': ['الدفع بعدم اختصاص المحكمة محلياً.'],
            'defensesSubstantive': ['الدفع بانتفاء القصد الجنائي لدى المتهم.']
          }
        },
      ),
      WorkflowSnapshot(
        id: 'snap-2',
        caseId: 'case-1',
        workflowType: 'preparing-statement-of-claims',
        currentStep: 1,
        label: 'مسودة صحيفة - مطالبة مالية عقود',
        createdAt: DateTime.now().subtract(const Duration(days: 5)),
        outputs: const {
          1: {
            'caseMainType': 'دعوى مدنية / تجارية عقارية',
            'caseSubType': 'فسخ عقد وطلب تعويض عن الأضرار'
          }
        },
      ),
      WorkflowSnapshot(
        id: 'snap-3',
        caseId: 'case-2',
        workflowType: 'ruling-analysis',
        currentStep: 1,
        label: 'تحليل حكم ابتدائي - استئناف النخبة',
        createdAt: DateTime.now().subtract(const Duration(hours: 4)),
        outputs: const {
          1: {
            'verdictPoints': ['إلزام المدعى عليه بدفع مبلغ ١٠٠ ألف ريال سعودي للمدعي.'],
            'verdictSummary': 'قضت المحكمة الابتدائية بإلزام موكلنا جزئياً بالمبلغ المالي المدعى به.'
          }
        },
      ),
    ]);
  }

  static Map<String, Map<int, Map<String, dynamic>>> getMockOutputs(String caseTitle, String caseNumber, String court) {
    return {
      'defense-memo': {
        1: {
          'caseType': 'مذكرة دفاع جنائي',
          'caseNumber': caseNumber,
          'courtName': court,
          'legalFactsSummary': [
            'انتفاء الركن المادي للجريمة المنسوبة في الأوراق.',
            'تناقض أقوال شهود الإثبات وتضارب رواياتهم حول الواقعة.',
            'خلو تقرير الخبير الفني المرفق من ثمة دليل ينسب للمتهم.'
          ],
          'defendantsPositions': [
            {
              'defendantName': caseTitle.split(' ').last,
              'relationshipToClient': 'موكلنا (المتهم الرئيسي)',
              'positionSummary': 'الإنكار التام لكافة الاتهامات المنسوبة والتمسك بانتفاء الصلة بالواقعة.'
            }
          ],
          'evidenceMap': [
            {
              'source': 'تقرير الطب الشرعي الفني المعتمد',
              'proves': 'عدم وجود أي تزوير أو تلاعب منسوب لخط يد المتهم.',
              'doesNotProve': 'أي إدانة أو اشتراك للمتهم في تزوير أختام الشهر العقاري.',
              'limitations': 'التقرير استند لعينات الخطوط المتاحة فقط.'
            }
          ],
          'legalAndTechnicalReviewPoints': [
            'عدم كفاية الأدلة الفنية لنسبة الأفعال للمتهم.',
            'بطلان الاعتراف لكونه وليد إكراه مادي ومعنوي.'
          ],
          'potentialLegalCharacterization': {
            'chargeDescription': 'التزوير في محررات رسمية واستعمالها مع العلم بتزويرها.',
            'elementsReliedUpon': ['صفة المحرر الرسمي', 'تغيير الحقيقة'],
            'elementsLackingProof': ['الركن المادي (القيام بالتزوير)', 'الركن المعنوي (القصد الجنائي)']
          }
        },
        2: {
          'defensesFormal': [
            'الدفع بعدم اختصاص المحكمة محلياً بنظر الدعوى طبقاً للمادة ٢٧ مرافعات.',
            'الدفع ببطلان صحيفة الدعوى للجهالة طبقاً للمادة ٨٦ مرافعات.'
          ],
          'defensesSubstantive': [
            'الدفع بانتفاء القصد الجنائي لدى المتهم.',
            'الدفع بانقطاع رابطة السببية بين الفعل والنتيجة.'
          ],
          'defensesEvidentiary': [
            'الدفع ببطلان تقرير الفحص الفني المبدئي لعدم أهلية القائم عليه.'
          ]
        },
        3: {
          'finalPrayers': [
            {
              'id': 'p-1',
              'requestLevel': 'أصلي',
              'requestText': 'أولاً وقبل كل شيء: القضاء ببراءة المتهم من كافة الاتهامات المنسوبة إليه.'
            },
            {
              'id': 'p-2',
              'requestLevel': 'احتياطي',
              'requestText': 'ثانياً وبصفة احتياطية: رفض الدعوى المدنية وإلزام رافعيها بالمصروفات.'
            }
          ]
        },
        4: {
          'introduction': 'السيد رئيس المحكمة الموقرة والسادة الأعضاء الاجلاء، نقدم لعدالتكم مذكرة بدفاع المتهم في القضية رقم $caseNumber المقيدة أمام محكمتكم الموقرة $court.',
          'factualBasis': 'تتلخص وقائع القضية في اتهام موكلنا بالتزوير بناءً على محضر محرر من جهة الإدارة.',
          'legalTextsFull': [
            {
              'lawName': 'قانون العقوبات',
              'articleNumber': '٢١١',
              'fullText': 'كل صاحب وظيفة عمومية ارتكب في أثناء تأدية وظيفته تزويراً في أحكام صادرة...'
            }
          ],
          'legalTextsUnavailableReason': '',
          'linkingTextsToFacts': 'حيث أن موكلنا لم يقم بأي تغيير للحقيقة ولم يثبت تقرير الطب الشرعي وجود أي كتابة بخطه.',
          'cassationPrecedentsFull': [
            {
              'appealNumber': '١٢٣٤٥',
              'judicialYear': '٧٤',
              'sessionDate': '١٢-١٢-٢٠٠٥',
              'fullText': 'من المقرر أن التزوير لا يقوم إلا إذا ثبت تغيير الحقيقة بفعل المتهم بالذات أو باشتراكه.'
            }
          ],
          'cassationPrecedentsUnavailableReason': '',
          'counterArgumentsAndResponse': 'رداً على مزاعم النيابة العامة، فإن الدليل الفني قد أثبت براءة موكلنا.',
          'legalEffectOfAcceptance': 'يترتب على قبول الدفوع الحكم ببراءة المتهم وسقوط التهمة الجنائية.',
          'strengthsAndRisks': 'نقاط القوة: تقرير الطب الشرعي قاطع. نقاط المخاطرة: احتمال طلب النيابة إعادة استجواب شهود الإثبات.',
          'documentText': 'بموجب وكالتنا عن المتهم، نتشرف بتقديم مذكرة دفاعنا هذه:\nأولاً: الدفوع الشكلية:\n١. نتمسك بالدفع بعدم الاختصاص المحلي للمحكمة طبقاً لنص المادة ٢٧ مرافعات.\nثانياً: الدفوع الموضوعية:\n١. انتفاء الركن المادي والمعنوي لجريمة التزوير وخلو الأوراق من دليل قاطع.\nلذا نلتمس الحكم ببراءة المتهم ورفض الدعوى المدنية.'
        }
      },
      'preparing-statement-of-claims': {
        1: {
          'caseId': 'case-claim-$caseNumber',
          'caseMainType': 'دعوى مدنية / تجارية عقارية',
          'caseSubType': 'فسخ عقد وطلب تعويض عن الأضرار',
          'courtType': 'المحكمة التجارية بالرياض',
          'proceduralNature': 'عادية',
          'isUrgentOrSummary': 'لا',
          'justificationSummary': 'مطالبة عادية بالتعويض لعدم تسليم المجمع العقاري.'
        },
        2: {
          'caseId': 'case-claim-$caseNumber',
          'parties': [
            {
              'id': 'party-1',
              'name': 'شركة النور للتجارة والتوريدات',
              'role': 'المدعي',
              'type': 'شركة مساهمة',
              'legalCapacity': 'أصيل ممثل بمديرها',
              'address': 'الرياض - حي الملز',
              'nationalId': '١٠١٠٢٠٣٠٤٠'
            },
            {
              'id': 'party-2',
              'name': 'شركة النخبة للإنشاءات والمقاولات',
              'role': 'المدعى عليه',
              'type': 'شركة ذات مسؤولية محدودة',
              'legalCapacity': 'أصيل ممثل بالمدير التنفيذي',
              'address': 'الرياض - حي العليا',
              'nationalId': '١٠١٠٥٠٦٠٧٠'
            }
          ]
        },
        3: {
          'caseId': 'case-claim-$caseNumber',
          'subjectTitle': 'المطالبة بفسخ عقد المقاولة المؤرخ في ٢٠٢٤ والتعويض عن التأخير',
          'subjectFullText': 'تفاصيل ومضمون المطالبة القضائية بفسخ العقد المبرم والتعويض عن الأضرار الناشئة عن التأخير لعدم تسليم الوحدات في المواعيد المقررة.'
        },
        4: {
          'factsNarrative': 'تتلخص الوقائع في قيام موكلنا بإبرام عقد مقاولة مع الشركة المدعى عليها لتشييد مجمع سكني، إلا أن الأخيرة تأخرت في تسليم مراحل البناء لأكثر من عام دون مبرر قانوني، مما كبد موكلنا خسائر فادحة.'
        },
        5: {
          'caseId': 'case-claim-$caseNumber',
          'legalTexts': [
            {
              'id': 'lt-1',
              'lawName': 'نظام المعاملات المدنية',
              'articleNumber': '١٠٧',
              'articleText': 'إذا لم يوفِ المدين بالتزامه بعد إعذاره جاز للدائن أن يطلب فسخ العقد.',
              'applicationNotes': 'المدعي قام بإعذار المدعى عليه رسمياً بموجب خطاب مسجل.'
            },
            {
              'id': 'lt-2',
              'lawName': 'نظام المعاملات المدنية',
              'articleNumber': '٢٢٣',
              'articleText': 'التعويض عن الضرر يشمل ما لحق الدائن من خسارة وما فاته من كسب.',
              'applicationNotes': 'الأضرار المادية الناتجة عن تعطل تشغيل المجمع العقاري.'
            }
          ],
          'cassationRulings': [
            {
              'id': 'cr-1',
              'court': 'المحكمة العليا بالرياض',
              'appealNumber': '٨٧٦٥/١',
              'judicialYear': '١٤٤٥',
              'sessionDate': '١٥-٠٥-١٤٤٥',
              'rulingText': 'التأخير في تسليم العين محل عقد المقاولة دون عذر يبرر الفسخ مع التعويض.',
              'applicationNotes': 'يدعم أحقية موكلنا في فسخ العقد دون الإخلال بحقه بالتعويض.'
            }
          ]
        },
        6: {
          'caseId': 'case-claim-$caseNumber',
          'principalRequests': [
            {
              'id': 'pr-1',
              'requestNumber': 1,
              'requestText': 'القضاء بفسخ عقد المقاولة المؤرخ في ٢٠٢٤ وإخلاء موقع العمل.',
              'legalReference': 'المادة ١٠٧ من نظام المعاملات المدنية'
            },
            {
              'id': 'pr-2',
              'requestNumber': 2,
              'requestText': 'إلزام المدعى عليها بدفع تعويض قدره نصف مليون جنيه عن الأضرار اللاحقة.',
              'legalReference': 'المادة ٢٢٣ من نظام المعاملات المدنية'
            }
          ],
          'subsidiaryRequests': [],
          'proceduralRequests': []
        },
        7: {
          'documentText': 'صحيفة افتتاح دعوى:\nأودعت هذه الصحيفة قلم كتاب محكمة $court\nمن الطالب: شركة النور للتجارة\nضد: شركة النخبة للإنشاءات\nالموضوع: فسخ عقد وتعويض.\nالوقائع:\n١. تعاقد الطالب مع المعلن إليه بموجب عقد المقاولة لتنفيذ أعمال البناء.\n٢. تقاعس المعلن إليه عن التنفيذ وامتنع عن إكمال البناء.\nلذلك نلتمس الحكم بفسخ العقد وإلزام المعلن إليه بالتعويض والمصاريف.'
        }
      },
      'appeal-brief': {
        1: {
          'judgmentData': {
            'courtName': 'محكمة استئناف القاهرة التجارية',
            'caseNumber': '٧٧٢ / قضائية ٩٩',
            'pronouncementExact': 'إلزام المدعى عليه بالتعويض والمصروفات',
            'parties': 'شركة النور ضد شركة النخبة'
          },
          'courtInformation': 'حكم صادر بجلسة الاستماع المنعقدة بتاريخ ١٥ يناير ٢٠٢٥ في الاستئناف رقم ٧٧٢.',
          'parties': 'شركة النور ضد شركة النخبة',
          'verdict': 'إلزام المدعى عليه بدفع تعويض وقدره ١٠٠ ألف جنيه.'
        },
        2: {
          'analysis': 'شاب الحكم المستأنف القصور البالغ في التسبيب، حيث أغفل الرد على الدفع الجوهري المبدى بسقوط الحق بالتقادم الحولي التجاري، ومخالفته الثابت بالمستندات رقم ٣.',
          'legalFlaws': [
            'القصور في التسبيب للإعراض عن فحص مستندات السداد الحولي.',
            'الخطأ في تطبيق القانون ومخالفته للنصوص التجارية.'
          ]
        },
        3: {
          'grounds': [
            'الخطأ في تطبيق القانون وتأويله لتطبيق القواعد المدنية بدلاً من التجارية.',
            'الفساد في الاستدلال والقصور في التسبيب لعدم الرد على دفاع جوهري.'
          ]
        },
        4: {
          'requests': [
            'قبول الطعن بالنقض شكلاً لتقديمه في الميعاد المستندي.',
            'وفي الموضوع بنقض الحكم المطعون فيه وإحالة القضية للمحكمة للاستئناف مجدداً.'
          ],
          'proceduralRequests': ['طلب وقف تنفيذ الحكم المطعون فيه بصفة مستعجلة.'],
          'substantiveRequests': ['نقض الحكم وإعادة أوراق النزاع للاستئناف.'],
          'urgentRequests': []
        },
        5: {
          'laws': ['قانون التجارة م ٦٨', 'قانون المرافعات م ٢٥٣ و ٢٤٩'],
          'precedents': ['حكم محكمة النقض في الطعن رقم ٤٣٢ لسنة ٧٥ ق بجلسة ٢٠-١٠-٢٠٠٦.'],
          'legalBasis': ['النص الصريح للمادة ٦٨ تجارة بشأن التقادم القصير.']
        },
        6: {
          'fullAppealText': 'السادة رئيس وأعضاء محكمة النقض الموقرين،\nنودع صحيفة الطعن بالنقض ضد الحكم الصادر في القضية رقم ٧٧٢.\nأولاً: قبول الطعن شكلاً.\nثانياً: أسباب الطعن:\n١. الخطأ في تطبيق القانون لعدم إعمال التقادم التجاري.\nنلتمس نقض الحكم وإحالة النزاع لمستأنف بهيئة أخرى.'
        }
      },
      'admin-complaint': {
        1: {
          'complaintType': 'تظلم من قرار إداري سلبي',
          'targetAuthority': 'الهيئة العامة للاستثمار والتطوير',
          'legalBasis': 'المادة رقم ١٢ من اللائحة التنفيذية لقانون الاستثمار والضمانات الممنوحة للمستثمرين.'
        },
        2: {
          'factsSummary': 'تظلم موكلنا ضد امتناع الهيئة عن إصدار ترخيص التشغيل النهائي للمصنع العقاري رغم استيفاء كامل شروط الأمن والسلامة والموافقات البيئية اللازمة.',
          'keyFacts': [
            'امتناع الهيئة عن إصدار الترخيص دون إبداء أسباب مكتوبة.',
            'استيفاء موكلنا لكافة الشروط الفنية والموافقات البيئية المطلوبة.',
            'تجاوز الهيئة للميعاد القانوني المحدد للبت في طلب الترخيص.'
          ]
        },
        3: {
          'violations': [
            {'description': 'مخالفة قرار رئيس الوزراء رقم ١٢ لتبسيط إجراءات التراخيص الصناعية.', 'legalRef': 'قرار رئيس الوزراء رقم ١٢ لسنة ٢٠٢٣ المادة الرابعة'},
            {'description': 'إساءة استعمال السلطة والتعسف الإداري دون إبداء أسباب مكتوبة.', 'legalRef': 'المادة رقم ٢٠ من قانون الخدمة المدنية ولائحته التنفيذية'}
          ]
        },
        4: {
          'requests': ['قبول التظلم شكلاً واستيفاء الترخيص فوراً.', 'وقف تنفيذ القرار السلبي مؤقتاً لحين الفصل النهائي.']
        },
        5: {
          'documentText': 'إلى السيد رئيس الهيئة العامة للاستثمار،\nتحية طيبة وبعد،\nمقدمه لسيادتكم تظلم شركة النور للتجارة ضد القرار السلبي بالامتناع عن الترخيص.\nحيث أننا استوفينا كافة المتطلبات ولم يتم تسليم التراخيص.\nلذا نرجو التفضل بإصدار التوجيهات للترخيص السريع.'
        }
      },
      'ruling-analysis': {
        1: {
          'verdictPoints': ['إلزام المدعى عليه بدفع مبلغ ١٠٠ ألف ريال سعودي للمدعي.', 'إلزام المدعى عليه بالمصروفات وأتعاب المحاماة الفائتة.'],
          'verdictSummary': 'قضت المحكمة الابتدائية بإلزام موكلنا جزئياً بالمبلغ المالي المدعى به بناءً على تقرير المحاسب الاستشاري دون استجواب موكلنا.',
          'charges': ['المطالبة بقيمة توريدات كهربائية متأخرة']
        },
        2: {
          'reasoningPoints': ['استندت المحكمة كلياً لنتائج تقرير الخبير الحسابي.', 'اعتبرت المحكمة غياب موكلنا عن جلسة وحيدة بمثابة إقرار بالحق المزعوم.'],
          'keyFindings': ['أغفلت المحكمة فحص أوراق السداد الجزئي بقيمة ٤٠ ألف ريال.']
        },
        3: {
          'defects': [
            {'description': 'الإخلال بحق الدفاع لعدم تمكين موكلنا من مناقشة تقرير الخبير.', 'severity': 'جسيم / مؤثر جوهرياً في منطوق الحكم'},
            {'description': 'قصور التسبيب بمصادرة رغبة المتهم في تقديم مستندات تسوية الدفع.', 'severity': 'متوسط / ثغرة قانونية تدعم قبول الاستئناف'}
          ]
        },
        4: {
          'isAppealViable': true,
          'appealStrength': 'قوية جداً (نسبة نجاح تقدر بـ ٨٥٪)',
          'recommendedGrounds': [
            'الخطأ في تطبيق القانون ومخالفة الثابت بالأوراق لإهمال مستندات السداد.',
            'القصور الفادح في التسبيب والإخلال بحق الدفاع لعدم تمكين الدفاع من مناقشة الخبير.'
          ],
          'conclusion': 'نوصي بشدة برفع استئناف ضد هذا الحكم لوجود عيوب إجرائية فادحة وتوفر فرصة كبيرة لنقضه وإحالة الملف لخبير حسابي آخر للتأكد من تسديد الدفعات.'
        }
      },
      'legal-warning': {
        1: {
          'warningType': 'إنذار رسمي بسداد مديونية عقد توريد رقم ٤',
          'legalBasis': {
            'type': 'سند تعاقدي وقانوني',
            'description': 'البند السابع من اتفاقية التوريد والمادة ١٥٧ من القانون المدني المصري.'
          },
          'obligationDetails': 'الالتزام بسداد المبلغ المتبقي وقدره ١٢٠ ألف ريال سعودي في الأجل المحدد قانوناً.',
          'recommendedAction': 'توجيه إنذار رسمي على يد محضر لإعذار المدين وقطع التقادم قبل رفع الدعوى.'
        },
        2: {
          'warningBody': 'بناءً على طلب موكلنا، ننذركم بضرورة سداد المبلغ المتبقي وقدره ١٢٠ ألف ريال خلال مهلة أقصاها ١٥ يوماً من تاريخ التبليغ، وإلا سنضطر لرفع دعوى الفسخ والتعويض.',
          'keyPoints': ['التأخر في السداد تجاوز ٣ أشهر.', 'إثبات انتفاء الظروف الاستثنائية المانعة من السداد.']
        },
        3: {
          'documentText': 'إنذار رسمي على يد محضر:\nبناءً على طلب السيد / أحمد السالم.\nأنا محضر محكمة $court انتقلت وأنذرت:\nالسادة شركة النخبة للتوريدات.\nبأنكم تأخرتم في سداد الدفعة المتبقية بقيمة ١٢٠ ألف ريال.\nننذركم بوجوب السداد خلال ١٥ يوماً وإلا اتخذنا كافة الإجراءات القانونية.'
        }
      },
      'exec-request': {
        1: {
          'requestType': 'طلب تنفيذ حكم تجاري حائز للصيغة التنفيذية',
          'legalBasis': 'المادة رقم ٣٤ من نظام التنفيذ ولائحته التنفيذية.',
          'executionGrounds': 'الحكم النهائي الصادر في الدعوى رقم ١٢٣٤ لسنة ٢٠٢٦.',
          'urgencyLevel': 'عاجل (وجود تخوف حقيقي من تهريب الأموال)'
        },
        2: {
          'requestBody': 'نلتمس من قاضي التنفيذ قيد ملف التنفيذ وإصدار قرار المادة ٣٤ لإخطار المنفذ ضده بالوفاء خلال ٥ أيام، واتخاذ إجراءات الحجز على الأرصدة البنكية في حال امتناعه.',
          'keyArguments': ['الحكم نهائي وحائز على قوة الأمر المقضي به.', 'امتناع المنفذ ضده عن السداد الودي رغم الإعذار.']
        },
        3: {
          'documentText': 'إلى السيد قاضي التنفيذ بمحكمة التنفيذ بـ $court.\nالطالب: أحمد السالم\nالمنفذ ضده: مؤسسة توريد ومقاولات\nنقدم لعدالتكم السند التنفيذي رقم ١٢٣٤ الصادر من المحكمة التجارية.\nونرجو الأمر بالتنفيذ وإلزام المنفذ ضده بسداد المديونية وإجراء الحجز البنكي.'
        }
      }
    };
  }
}
