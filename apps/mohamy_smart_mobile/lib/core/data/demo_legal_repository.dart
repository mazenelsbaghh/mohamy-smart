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
      stepCount: 7,
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
      stepCount: 6,
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
      stepCount: 5,
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
      stepCount: 4,
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
      stepCount: 3,
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
      stepCount: 3,
      iconName: 'task',
    ),
  ];

  // Steps definition dictionary
  static final Map<String, List<WorkflowStepDef>> workflowSteps = {
    'defense-memo': const [
      WorkflowStepDef(index: 1, title: 'التحليل القانوني للوقائع', description: 'استخلاص الوقائع ومطابقتها قانونياً'),
      WorkflowStepDef(index: 2, title: 'الدفوع القانونية', description: 'استخراج الدفوع الإجرائية والموضوعية والمستندية'),
      WorkflowStepDef(index: 3, title: 'الطلبات الختامية', description: 'صياغة الطلبات النهائية الموجهة للمحكمة'),
      WorkflowStepDef(index: 4, title: 'المسودة النهائية لمذكرة الدفاع', description: 'تجميع المذكرة وصياغتها بالكامل'),
    ],
    'preparing-statement-of-claims': const [
      WorkflowStepDef(index: 1, title: 'نوع الدعوى', description: 'تحديد التصنيف الدقيق للدعوى القضائية'),
      WorkflowStepDef(index: 2, title: 'الأطراف والخصوم', description: 'بيانات المدعي والمدعى عليه في الخصومة'),
      WorkflowStepDef(index: 3, title: 'موضوع الدعوى', description: 'تحديد عنوان ومحور النزاع الرئيسي'),
      WorkflowStepDef(index: 4, title: 'سرد الوقائع', description: 'الصياغة الواقعية المنظمة للأحداث'),
      WorkflowStepDef(index: 5, title: 'التأسيس القانوني', description: 'الأسانيد والمواد القانونية المنظمة للنزاع'),
      WorkflowStepDef(index: 6, title: 'الطلبات', description: 'تحديد الطلبات الرئيسية والفرعية المدعى بها'),
      WorkflowStepDef(index: 7, title: 'المسودة النهائية لصحيفة الدعوى', description: 'تجميع صحيفة الدعوى متكاملة ومعدّة للطباعة'),
    ],
    'appeal-brief': const [
      WorkflowStepDef(index: 1, title: 'بيانات الحكم الابتدائي', description: 'إدخال معلومات المحكمة ومنطوق الحكم الصادر'),
      WorkflowStepDef(index: 2, title: 'تحليل تسبيب الحكم', description: 'استخراج عيوب التدليل والقصور في الحكم'),
      WorkflowStepDef(index: 3, title: 'أسباب الطعن بالنقض', description: 'صياغة أسباب البطلان ومخالفة القانون'),
      WorkflowStepDef(index: 4, title: 'الطلبات الختامية للطعن', description: 'المطالبة بقبول الطعن شكلاً وفي الموضوع نقضه'),
      WorkflowStepDef(index: 5, title: 'الأسس القانونية للطعن', description: 'الأحكام والنصوص القانونية المؤيدة لمطالب النقض'),
      WorkflowStepDef(index: 6, title: 'التجميع النهائي لصحيفة الطعن', description: 'الصياغة النهائية لصحيفة الطعن بالنقض'),
    ],
    'admin-complaint': const [
      WorkflowStepDef(index: 1, title: 'تصنيف الشكوى', description: 'تحديد نوع المخالفة الإدارية وتصنيف الشكوى'),
      WorkflowStepDef(index: 2, title: 'مسودة الوقائع للشكوى', description: 'سرد التفاصيل والأضرار الناجمة عن القرار'),
      WorkflowStepDef(index: 3, title: 'تقييم المخالفات الإدارية', description: 'تحديد أوجه القصور والتعسف في استعمال السلطة'),
      WorkflowStepDef(index: 4, title: 'الطلبات والالتماسات', description: 'تحديد الطلبات المرجوة من الشكوى الإدارية'),
      WorkflowStepDef(index: 5, title: 'الشكوى النهائية', description: 'المسودة الكاملة للشكوى الإدارية الرسمية'),
    ],
    'ruling-analysis': const [
      WorkflowStepDef(index: 1, title: 'منطوق الحكم وأسبابه', description: 'استخلاص خلاصة منطوق الحكم'),
      WorkflowStepDef(index: 2, title: 'أسباب الحكم التفصيلية', description: 'تحليل الأسانيد المكتوبة للحكم'),
      WorkflowStepDef(index: 3, title: 'تقييم العيوب والثغرات', description: 'رصد ثغرات التسبيب والخطأ في تطبيق القانون'),
      WorkflowStepDef(index: 4, title: 'خلاصة الطعن وجدواه', description: 'توصية قانونية بجدوى تقديم استئناف أو طعن'),
    ],
    'legal-warning': const [
      WorkflowStepDef(index: 1, title: 'تصنيف الإنذار ومسودته', description: 'نوع الإنذار والبيانات التمهيدية'),
      WorkflowStepDef(index: 2, title: 'تفاصيل الإنذار والمهلة', description: 'سرد موضوع الإنذار والمهلة الممنوحة قانوناً للرد'),
      WorkflowStepDef(index: 3, title: 'الإنذار النهائي', description: 'مسودة الإنذار الرسمي على يد محضر جاهزة للإرسال'),
    ],
    'exec-request': const [
      WorkflowStepDef(index: 1, title: 'تصنيف الطلب ومسودته', description: 'تحديد السند التنفيذي ونوع المطالبة'),
      WorkflowStepDef(index: 2, title: 'تفاصيل التنفيذ والملف المستهدف', description: 'بيانات المحكوم له والمحكوم عليه ومبلغ التنفيذ'),
      WorkflowStepDef(index: 3, title: 'الطلب التنفيذي النهائي', description: 'مسودة عريضة طلب التنفيذ الموجه لقاضي التنفيذ'),
    ],
  };

  // Mock initial snapshots history
  late final List<WorkflowSnapshot> mockSnapshots = [];

  void _initMockSnapshots() {
    mockSnapshots.addAll([
      WorkflowSnapshot(
        id: 'snap-1',
        caseId: 'case-1',
        workflowType: 'defense-memo',
        currentStep: 2,
        label: 'مسودة الدفوع المبدئية',
        createdAt: DateTime.now().subtract(const Duration(days: 2)),
        outputs: {
          1: {
            'legalFactsSummary': [
              'انتفاء الركن المادي للجريمة لعدم مطابقة التوقيع.',
              'تأخر المدعى عليه في سداد مستحقات العقد التوريدي.',
            ],
            'caseType': 'تجاري - مطالبة مالية',
          },
          2: {
            'defensesFormal': ['الدفع بعدم الاختصاص المحلي طبقاً للمادة ٢٧ مرافعات.'],
            'defensesSubstantive': ['الدفع بانتفاء القصد الجنائي لدى موكلنا.'],
          }
        },
      ),
      WorkflowSnapshot(
        id: 'snap-2',
        caseId: 'case-1',
        workflowType: 'defense-memo',
        currentStep: 4,
        label: 'مذكرة نهائية قبل جلسة المرافعة الأخيرة',
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
        outputs: {
          1: {
            'legalFactsSummary': [
              'تأخر المدعى عليه في سداد الدفعة الأخيرة بمبلغ ١٥٠ ألف ريال.',
              'وجود عقد توريد معتمد ومكتمل الشروط.',
            ],
            'caseType': 'تجاري',
          },
          2: {
            'defensesFormal': ['الدفع بعدم الاختصاص المحلي.'],
            'defensesSubstantive': ['الدفع بانتفاء المسؤولية العقدية للقوة القاهرة.'],
          },
          3: {
            'finalPrayers': ['الحكم برفض الدعوى وإلزام المدعي بالمصاريف.'],
          },
          4: {
            'introduction': 'بناءً على ما قدم، يلتمس دفاع موكلنا القضاء برفض الدعوى الماثلة.',
            'documentText': 'مذكرة بدفاع السيد / أحمد السالم ...\nنلتمس رفض الدعوى وإلزام المدعي بالمصروفات القضائية ومقابل أتعاب المحاماة.',
          }
        },
      ),
      WorkflowSnapshot(
        id: 'snap-3',
        caseId: 'case-4',
        workflowType: 'defense-memo',
        currentStep: 4,
        label: 'مذكرة الدفوع الجنائية - تقرير التزوير المبدئي',
        createdAt: DateTime.now().subtract(const Duration(days: 3)),
        outputs: {
          1: {
            'legalFactsSummary': [
              'ثبوت تزوير عقد الملكية المشتبه به بموجب تقرير أبحاث التزييف والتزوير.',
              'محاولة الاستيلاء على العقار دون أساس تعاقدي صحيح.',
            ],
            'caseType': 'جنايات - تزوير محررات رسمية',
          },
          2: {
            'defensesFormal': ['الدفع ببطلان شهادة الشهود الواردة بالتحقيقات.'],
            'defensesSubstantive': ['الدفع بانتفاء علم المتهم بالتزوير وانعدام قصده.'],
          },
          3: {
            'finalPrayers': ['القضاء ببراءة المتهم من جريمة التزوير وندب خبير مضاهاة.'],
          },
          4: {
            'introduction': 'يلتمس الدفاع القضاء ببراءة المتهم وندب خبير لمضاهاة التوقيعات.',
            'documentText': 'بموجب وكالتنا عن شركة النور، نتشرف بتقديم هذه المذكرة ملتمسين البراءة لانتفاء الركنين المادي والمعنوي لجريمة التزوير.',
          }
        },
      ),
    ]);
  }

  // Get mock step data templates for simulate run
  static Map<String, Map<int, Map<String, dynamic>>> getMockOutputs(String caseTitle, String caseNumber, String court) {
    return {
      'defense-memo': {
        1: {
          'legalFactsSummary': [
            'انتفاء الركن المادي للجريمة المنسوبة في الأوراق.',
            'تناقض أقوال شهود الإثبات وتضارب رواياتهم حول الواقعة.',
            'خلو تقرير الخبير الفني المرفق من ثمة دليل ينسب للمتهم.'
          ],
          'caseType': 'مذكرة دفاع جنائي'
        },
        2: {
          'defensesFormal': ['الدفع بعدم اختصاص المحكمة محلياً بنظر الدعوى طبقاً للمادة ٢٧ مرافعات.', 'الدفع ببطلان صحيفة الدعوى للجهالة طبقاً للمادة ٨٦ مرافعات.'],
          'defensesSubstantive': ['الدفع بانتفاء القصد الجنائي لدى المتهم.', 'الدفع بانقطاع رابطة السببية بين الفعل والنتيجة.'],
          'defensesEvidentiary': ['الدفع ببطلان تقرير الفحص الفني المبدئي لعدم أهلية القائم عليه.']
        },
        3: {
          'finalPrayers': ['أولاً وقبل كل شيء: القضاء ببراءة المتهم من كافة الاتهامات المنسوبة إليه.', 'ثانياً وبصفة احتياطية: رفض الدعوى المدنية وإلزام رافعيها بالمصروفات.']
        },
        4: {
          'introduction': 'السيد رئيس المحكمة الموقرة والسادة الأعضاء الاجلاء، نقدم لعدالتكم مذكرة بدفاع المتهم في القضية رقم $caseNumber المقيدة أمام محكمتكم الموقرة $court.',
          'documentText': 'بموجب وكالتنا عن المتهم، نتشرف بتقديم مذكرة دفاعنا هذه:\nأولاً: الدفوع الشكلية:\n١. نتمسك بالدفع بعدم الاختصاص المحلي للمحكمة طبقاً لنص المادة ٢٧ مرافعات.\nثانياً: الدفوع الموضوعية:\n١. انتفاء الركن المادي والمعنوي لجريمة التزوير وخلو الأوراق من دليل قاطع.\nلذا نلتمس الحكم ببراءة المتهم ورفض الدعوى المدنية.'
        }
      },
      'preparing-statement-of-claims': {
        1: {
          'caseMainType': 'دعوى مدنية / تجارية عقارية',
          'caseSubType': 'فسخ عقد وطلب تعويض عن الأضرار'
        },
        2: {
          'parties': [
            {'name': 'شركة النور للتجارة والتوريدات', 'role': 'المدعي'},
            {'name': 'شركة النخبة للإنشاءات والمقاولات', 'role': 'المدعى عليه'}
          ]
        },
        3: {
          'subjectTitle': 'المطالبة بفسخ عقد المقاولة المؤرخ في ٢٠٢٤ والتعويض عن التأخير'
        },
        4: {
          'factsNarrative': 'تتلخص الوقائع في قيام موكلنا بإبرام عقد مقاولة مع الشركة المدعى عليها لتشييد مجمع سكني، إلا أن الأخيرة تأخرت في تسليم مراحل البناء لأكثر من عام دون مبرر قانوني، مما كبد موكلنا خسائر فادحة.'
        },
        5: {
          'legalTexts': [
            {'lawName': 'القانون المدني المصري', 'articleNumber': '١٥٧'},
            {'lawName': 'القانون المدني المصري', 'articleNumber': '٢٢٣'}
          ]
        },
        6: {
          'principalRequests': [
            {'requestText': 'القضاء بفسخ عقد المقاولة المؤرخ في ٢٠٢٤ وإخلاء موقع العمل.'},
            {'requestText': 'إلزام المدعى عليها بدفع تعويض قدره نصف مليون جنيه عن الأضرار اللاحقة.'}
          ]
        },
        7: {
          'documentText': 'صحيفة افتتاح دعوى:\nأودعت هذه الصحيفة قلم كتاب محكمة $court\nمن الطالب: شركة النور للتجارة\nضد: شركة النخبة للإنشاءات\nالموضوع: فسخ عقد وتعويض.\nالوقائع:\n١. تعاقد الطالب مع المعلن إليه بموجب عقد المقاولة لتنفيذ أعمال البناء.\n٢. تقاعس المعلن إليه عن التنفيذ وامتنع عن إكمال البناء.\nلذلك نلتمس الحكم بفسخ العقد وإلزام المعلن إليه بالتعويض والمصاريف.'
        }
      },
      'appeal-brief': {
        1: {
          'judgmentData': {
            'courtName': 'محكمة استئناف القاهرة التجارية',
            'caseNumber': '٧٧٢ / قضائية ٩٩'
          },
          'courtInformation': 'حكم صادر بجلسة الاستماع المنعقدة بتاريخ ١٥ يناير ٢٠٢٥ في الاستئناف رقم ٧٧٢.'
        },
        2: {
          'analysis': 'شاب الحكم المستأنف القصور البالغ في التسبيب، حيث أغفل الرد على الدفع الجوهري المبدى بسقوط الحق بالتقادم الحولي التجاري، ومخالفته الثابت بالمستندات رقم ٣.'
        },
        3: {
          'grounds': [
            'الخطأ في تطبيق القانون وتأويله لتطبيق القواعد المدنية بدلاً من التجارية.',
            'الفساد في الاستدلال والقصور في التسبيب لعدم الرد على دفاع جوهري.'
          ]
        },
        4: {
          'requests': ['قبول الطعن بالنقض شكلاً لتقديمه في الميعاد المستندي.', 'وفي الموضوع بنقض الحكم المطعون فيه وإحالة القضية للمحكمة للاستئناف مجدداً.']
        },
        5: {
          'laws': ['قانون التجارة م ٦٨', 'قانون المرافعات م ٢٥٣ و ٢٤٩']
        },
        6: {
          'fullAppealText': 'السادة رئيس وأعضاء محكمة النقض الموقرين،\nنودع صحيفة الطعن بالنقض ضد الحكم الصادر في القضية رقم ٧٧٢.\nأولاً: قبول الطعن شكلاً.\nثانياً: أسباب الطعن:\n١. الخطأ في تطبيق القانون لعدم إعمال التقادم التجاري.\nنلتمس نقض الحكم وإحالة النزاع لمستأنف بهيئة أخرى.'
        }
      },
      'admin-complaint': {
        1: {
          'complaintType': 'تظلم من قرار إداري سلبي',
          'targetAuthority': 'الهيئة العامة للاستثمار والتطوير'
        },
        2: {
          'factsSummary': 'تظلم موكلنا ضد امتناع الهيئة عن إصدار ترخيص التشغيل النهائي للمصنع العقاري رغم استيفاء كامل شروط الأمن والسلامة والموافقات البيئية اللازمة.'
        },
        3: {
          'violations': [
            {'description': 'مخالفة قرار رئيس الوزراء رقم ١٢ لتبسيط إجراءات التراخيص الصناعية.'},
            {'description': 'إساءة استعمال السلطة والتعسف الإداري دون إبداء أسباب مكتوبة.'}
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
          'verdictSummary': 'قضت المحكمة الابتدائية بإلزام موكلنا جزئياً بالمبلغ المالي المدعى به بناءً على تقرير المحاسب الاستشاري دون استجواب موكلنا.'
        },
        2: {
          'reasoningPoints': ['استندت المحكمة كلياً لنتائج تقرير الخبير الحسابي.', 'اعتبرت المحكمة غياب موكلنا عن جلسة وحيدة بمثابة إقرار بالحق المزعوم.']
        },
        3: {
          'defects': [
            {'description': 'الإخلال بحق الدفاع لعدم تمكين موكلنا من مناقشة تقرير الخبير.'},
            {'description': 'قصور التسبيب بمصادرة رغبة المتهم في تقديم مستندات تسوية الدفع.'}
          ]
        },
        4: {
          'isAppealViable': true,
          'conclusion': 'نوصي بشدة برفع استئناف ضد هذا الحكم لوجود عيوب إجرائية فادحة وتوفر فرصة كبيرة لنقضه وإحالة الملف لخبير حسابي آخر للتأكد من تسديد الدفعات.'
        }
      },
      'legal-warning': {
        1: {
          'warningType': 'إنذار رسمي بسداد مديونية عقد توريد رقم ٤',
          'legalBasis': {'description': 'البند السابع من اتفاقية التوريد والمادة ١٥٧ من القانون المدني.'}
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
          'executionGrounds': 'الحكم النهائي الصادر في الدعوى رقم ١٢٣٤ لسنة ٢٠٢٦.'
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

