import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_card.dart';
import 'engine/court_fees_engine.dart';

class CourtFeesCalculatorScreen extends StatefulWidget {
  const CourtFeesCalculatorScreen({super.key});

  @override
  State<CourtFeesCalculatorScreen> createState() => _CourtFeesCalculatorScreenState();
}

class _CourtFeesCalculatorScreenState extends State<CourtFeesCalculatorScreen> {
  String _selectedToolId = 'civil-known';

  // Common inputs
  final _amountController = TextEditingController(text: '100000');
  final _yearsController = TextEditingController(text: '1');
  final _countController = TextEditingController(text: '1');

  // Execution-specific inputs
  String _executionScope = 'partial'; // 'partial', 'total', 'sharia'
  String _executionRound = 'first'; // 'first', 'repeat'
  bool _includeExecutionFixed = true;
  bool _includeExecutionPowerOfAttorney = true;
  bool _includeExecutionMartyrStamp = true;

  // Interest-specific inputs
  String _interestNature = 'civil'; // 'civil', 'sharia'

  // Treasury-specific inputs
  final _collectedAmountController = TextEditingController(text: '1200');
  final _principalAmountController = TextEditingController(text: '1000');
  String _treasuryKind = 'family-same'; // 'family-same', 'partial', 'relative-services', 'accounting-money'
  final _treasuryExecutionCountController = TextEditingController(text: '1');

  // Maintenance-specific inputs
  final _maintenanceFromController = TextEditingController(text: '2025-01-01');
  final _maintenanceToController = TextEditingController(text: '2025-05-22');
  final _monthlyAmountController = TextEditingController(text: '3000');
  String _maintenanceMode = 'first'; // 'first', 'repeat'

  // Deposit-specific inputs
  String _depositMode = 'total'; // 'total', 'deducted'

  // Process server warning inputs
  final _warningDefendantsController = TextEditingController(text: '2');
  final _warningRollsController = TextEditingController(text: '1');
  bool _warningLinkedDefendants = true;

  // Judgment announcement inputs
  final _judgmentRollsController = TextEditingController(text: '2');
  final _judgmentRecipientsController = TextEditingController(text: '2');
  String _judgmentKind = 'partial'; // 'partial', 'civil-appeal', 'cassation-state'

  // Certificate inputs
  final _certificateCountController = TextEditingController(text: '1');
  final _certificateYearsController = TextEditingController(text: '1');
  final _certificatePersonsController = TextEditingController(text: '1');
  bool _includeCertifiedPaper = true;
  bool _certificateStakeholder = true;

  // Official Copy inputs
  final _officialCopyPapersController = TextEditingController(text: '5');
  final _officialCopyCountController = TextEditingController(text: '1');
  bool _includeOfficialCertifiedPaper = true;
  bool _officialCopyStakeholder = true;

  // Civil Unknown inputs
  String _civilUnknownKind = 'fixed-partial'; // 'fixed-partial', 'urgent-partial', 'fixed-total', 'appeal-urgent-partial', etc.

  CourtFeesResult? _result;

  @override
  void dispose() {
    _amountController.dispose();
    _yearsController.dispose();
    _countController.dispose();
    _collectedAmountController.dispose();
    _principalAmountController.dispose();
    _treasuryExecutionCountController.dispose();
    _maintenanceFromController.dispose();
    _maintenanceToController.dispose();
    _monthlyAmountController.dispose();
    _warningDefendantsController.dispose();
    _warningRollsController.dispose();
    _judgmentRollsController.dispose();
    _judgmentRecipientsController.dispose();
    _certificateCountController.dispose();
    _certificateYearsController.dispose();
    _certificatePersonsController.dispose();
    _officialCopyPapersController.dispose();
    _officialCopyCountController.dispose();
    super.dispose();
  }

  void _calculate() {
    setState(() {
      final amount = double.tryParse(_amountController.text) ?? 0.0;
      final years = double.tryParse(_yearsController.text) ?? 0.0;
      final count = double.tryParse(_countController.text) ?? 0.0;

      switch (_selectedToolId) {
        case 'civil-known':
          _result = CourtFeesEngine.calculateCivilKnown(amount);
          break;
        case 'family-known':
          _result = CourtFeesEngine.calculateFamilyKnown(amount);
          break;
        case 'civil-unknown':
          _result = CourtFeesEngine.calculateCivilUnknown(_civilUnknownKind);
          break;
        case 'execution-basic':
          _result = CourtFeesEngine.calculateExecution(
            executionAmount: amount,
            executionScope: _executionScope,
            executionRound: _executionRound,
            includeExecutionFixed: _includeExecutionFixed,
            includeExecutionPowerOfAttorney: _includeExecutionPowerOfAttorney,
            includeExecutionMartyrStamp: _includeExecutionMartyrStamp,
          );
          break;
        case 'execution-interest':
          _result = CourtFeesEngine.calculateExecutionInterest(
            interestAmount: amount,
            interestYears: years,
            interestNature: _interestNature,
          );
          break;
        case 'treasury-supply':
          _result = CourtFeesEngine.calculateTreasurySupply(
            treasuryCollectedAmount: double.tryParse(_collectedAmountController.text) ?? 0.0,
            treasuryPrincipalAmount: double.tryParse(_principalAmountController.text) ?? 0.0,
            treasuryKind: _treasuryKind,
            treasuryExecutionCount: double.tryParse(_treasuryExecutionCountController.text) ?? 0.0,
          );
          break;
        case 'maintenance-arrears':
          _result = CourtFeesEngine.calculateMaintenanceArrears(
            maintenanceFrom: _maintenanceFromController.text,
            maintenanceTo: _maintenanceToController.text,
            maintenanceMonthlyAmount: double.tryParse(_monthlyAmountController.text) ?? 0.0,
            maintenanceMode: _maintenanceMode,
          );
          break;
        case 'deposit':
          _result = CourtFeesEngine.calculateDeposit(
            depositAmount: amount,
            depositMode: _depositMode,
          );
          break;
        case 'simple-warning':
          _result = CourtFeesEngine.calculateSimpleWarning(
            warningDefendants: double.tryParse(_warningDefendantsController.text) ?? 0.0,
            warningRolls: double.tryParse(_warningRollsController.text) ?? 0.0,
            warningLinkedDefendants: _warningLinkedDefendants,
          );
          break;
        case 'judgment-announcement':
          _result = CourtFeesEngine.calculateJudgmentAnnouncement(
            judgmentRolls: double.tryParse(_judgmentRollsController.text) ?? 0.0,
            judgmentRecipients: double.tryParse(_judgmentRecipientsController.text) ?? 0.0,
            judgmentKind: _judgmentKind,
          );
          break;
        case 'certificate':
          _result = CourtFeesEngine.calculateCertificate(
            certificateCount: double.tryParse(_certificateCountController.text) ?? 0.0,
            certificateYears: double.tryParse(_certificateYearsController.text) ?? 0.0,
            certificatePersons: double.tryParse(_certificatePersonsController.text) ?? 0.0,
            includeCertifiedPaper: _includeCertifiedPaper,
            certificateStakeholder: _certificateStakeholder,
          );
          break;
        case 'official-copy':
          _result = CourtFeesEngine.calculateOfficialCopy(
            officialCopyPapers: double.tryParse(_officialCopyPapersController.text) ?? 0.0,
            officialCopyCount: double.tryParse(_officialCopyCountController.text) ?? 0.0,
            includeOfficialCertifiedPaper: _includeOfficialCertifiedPaper,
            officialCopyStakeholder: _officialCopyStakeholder,
          );
          break;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final themeTokens = Theme.of(context).extension<MohamyThemeTokens>()!;

    final toolsList = [
      {'id': 'civil-known', 'title': 'دعوى مدني معلومة القيمة'},
      {'id': 'civil-unknown', 'title': 'دعوى مدني مجهولة / معلومة القيمة'},
      {'id': 'family-known', 'title': 'دعوى شرعي معلومة القيمة'},
      {'id': 'execution-basic', 'title': 'رسم تنفيذ'},
      {'id': 'execution-interest', 'title': 'رسم تنفيذ بالفائدة القانونية'},
      {'id': 'treasury-supply', 'title': 'توريد المبالغ للخزينة'},
      {'id': 'maintenance-arrears', 'title': 'حساب رسم متجمد نفقة'},
      {'id': 'deposit', 'title': 'رسم الإيداع'},
      {'id': 'simple-warning', 'title': 'إنذار بسيط'},
      {'id': 'judgment-announcement', 'title': 'رسم إعلان صورة حكم'},
      {'id': 'certificate', 'title': 'رسم شهادة'},
      {'id': 'official-copy', 'title': 'رسم صورة رسمية'},
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('حاسبة الرسوم القضائية'),
        centerTitle: true,
      ),
      body: Directionality(
        textDirection: TextDirection.rtl,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Tool Selector
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'نوع الرسم القضائي',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w900,
                          color: AppColors.primaryBronze,
                        ),
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    value: _selectedToolId,
                    dropdownColor: isDark ? AppColors.darkSurface : Colors.white,
                    decoration: const InputDecoration(
                      labelText: 'اختر نوع الرسم لإجراء الحساب',
                    ),
                    items: toolsList.map((tool) {
                      return DropdownMenuItem<String>(
                        value: tool['id'],
                        child: Text(tool['title']!),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setState(() {
                          _selectedToolId = val;
                          _result = null; // Clear result on tool change
                        });
                      }
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Dynamic Inputs Form Card
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'معطيات الحساب',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w900,
                          color: AppColors.primaryBronze,
                        ),
                  ),
                  const SizedBox(height: 16),
                  ..._buildDynamicFormFields(isDark),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Calculate Button
            ElevatedButton(
              onPressed: _calculate,
              style: ElevatedButton.styleFrom(
                minimumSize: const Size.fromHeight(56),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
              child: const Text(
                'احسب الرسوم القضائية',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
              ),
            ),
            const SizedBox(height: 24),

            // Results presentation
            if (_result != null) ...[
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.receipt_long_outlined, color: AppColors.primary, size: 28),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _result!.title,
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                  fontWeight: FontWeight.w900,
                                ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Jurisdiction info
                    if (_result!.jurisdiction != null) ...[
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.gavel_outlined, color: AppColors.primary),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'الاختصاص القضائي: ${_result!.jurisdiction}',
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

                    // Total Paid highlight
                    if (_result!.totalPaid != null) ...[
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
                        decoration: BoxDecoration(
                          color: AppColors.primaryBronze.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'إجمالي المبلغ المطلوب دفعه:',
                              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900),
                            ),
                            Text(
                              '${_result!.totalPaid!.toStringAsFixed(2)} ج.م',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w900,
                                color: AppColors.primary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],

                    Text(
                      'تفاصيل الرسوم والضرائب:',
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 8),

                    // Table/List of individual fees
                    ..._result!.fees.map((fee) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 6),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              fee.label,
                              style: TextStyle(
                                color: fee.tone == 'muted' ? Colors.grey : null,
                                fontWeight: fee.tone == 'muted' ? null : FontWeight.bold,
                              ),
                            ),
                            Text(
                              '${fee.amount.toStringAsFixed(2)} ج.م',
                              style: TextStyle(
                                color: fee.tone == 'muted' ? Colors.grey : null,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      );
                    }),

                    if (_result!.summaries.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      const Divider(),
                      const SizedBox(height: 8),
                      Text(
                        'ملخصات الحساب:',
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 8),
                      ..._result!.summaries.map((sum) {
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(sum.label, style: const TextStyle(color: Colors.grey)),
                              Text(
                                sum.value,
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: sum.tone == 'success' ? AppColors.success : null,
                                ),
                              ),
                            ],
                          ),
                        );
                      }),
                    ],

                    if (_result!.notes.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      const Divider(),
                      const SizedBox(height: 8),
                      ..._result!.notes.map((note) {
                        return Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(Icons.info_outline, size: 16, color: Colors.grey),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                note,
                                style: const TextStyle(fontSize: 11, color: Colors.grey),
                              ),
                            ),
                          ],
                        );
                      }),
                    ],
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  List<Widget> _buildDynamicFormFields(bool isDark) {
    switch (_selectedToolId) {
      case 'civil-known':
      case 'family-known':
        return [
          TextField(
            controller: _amountController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'قيمة الدعوى / المطالبة (جنيه مصري)',
              prefixIcon: Icon(Icons.monetization_on_outlined),
            ),
          ),
        ];

      case 'civil-unknown':
        final unknownOptions = [
          {'id': 'fixed-partial', 'label': 'ثابت جزئي'},
          {'id': 'urgent-partial', 'label': 'جزئي مستعجل'},
          {'id': 'fixed-total', 'label': 'ثابت كلي'},
          {'id': 'appeal-urgent-partial', 'label': 'استئناف جزئي مستعجل'},
          {'id': 'appeal-fixed-partial', 'label': 'ثابت مستأنف جزئي'},
          {'id': 'bankruptcy', 'label': 'إفلاس'},
          {'id': 'high-appeal', 'label': 'استئناف عالي'},
        ];
        return [
          DropdownButtonFormField<String>(
            value: _civilUnknownKind,
            dropdownColor: isDark ? AppColors.darkSurface : Colors.white,
            decoration: const InputDecoration(labelText: 'نوع الدعوى مجهولة القيمة'),
            items: unknownOptions.map((opt) {
              return DropdownMenuItem<String>(
                value: opt['id'],
                child: Text(opt['label']!),
              );
            }).toList(),
            onChanged: (val) {
              if (val != null) {
                setState(() => _civilUnknownKind = val);
              }
            },
          ),
        ];

      case 'execution-basic':
        return [
          TextField(
            controller: _amountController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'مبلغ السند التنفيذي',
              prefixIcon: Icon(Icons.monetization_on_outlined),
            ),
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            value: _executionScope,
            dropdownColor: isDark ? AppColors.darkSurface : Colors.white,
            decoration: const InputDecoration(labelText: 'جهة التنفيذ / الاختصاص'),
            items: const [
              DropdownMenuItem(value: 'partial', child: Text('تنفيذ جزئي')),
              DropdownMenuItem(value: 'total', child: Text('تنفيذ كلي')),
              DropdownMenuItem(value: 'sharia', child: Text('تنفيذ شرعي / أسرة')),
            ],
            onChanged: (val) {
              if (val != null) setState(() => _executionScope = val);
            },
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            value: _executionRound,
            dropdownColor: isDark ? AppColors.darkSurface : Colors.white,
            decoration: const InputDecoration(labelText: 'درجة التنفيذ'),
            items: const [
              DropdownMenuItem(value: 'first', child: Text('لأول مرة')),
              DropdownMenuItem(value: 'repeat', child: Text('إعادة تنفيذ')),
            ],
            onChanged: (val) {
              if (val != null) setState(() => _executionRound = val);
            },
          ),
          const SizedBox(height: 12),
          SwitchListTile(
            title: const Text('تشمل الرسم الثابت المقرّر'),
            value: _includeExecutionFixed,
            activeColor: AppColors.primary,
            contentPadding: EdgeInsets.zero,
            onChanged: (val) => setState(() => _includeExecutionFixed = val),
          ),
          SwitchListTile(
            title: const Text('تشمل دمغة التوكيل'),
            value: _includeExecutionPowerOfAttorney,
            activeColor: AppColors.primary,
            contentPadding: EdgeInsets.zero,
            onChanged: (val) => setState(() => _includeExecutionPowerOfAttorney = val),
          ),
          SwitchListTile(
            title: const Text('تشمل دمغة الشهيد'),
            value: _includeExecutionMartyrStamp,
            activeColor: AppColors.primary,
            contentPadding: EdgeInsets.zero,
            onChanged: (val) => setState(() => _includeExecutionMartyrStamp = val),
          ),
        ];

      case 'execution-interest':
        return [
          TextField(
            controller: _amountController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'مبلغ أصل الدين',
              prefixIcon: Icon(Icons.monetization_on_outlined),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _yearsController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'عدد سنوات احتساب الفائدة',
              prefixIcon: Icon(Icons.calendar_month_outlined),
            ),
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            value: _interestNature,
            dropdownColor: isDark ? AppColors.darkSurface : Colors.white,
            decoration: const InputDecoration(labelText: 'طبيعة الفائدة القانونية'),
            items: const [
              DropdownMenuItem(value: 'civil', child: Text('مدنية (بواقع 4% سنوياً)')),
              DropdownMenuItem(value: 'sharia', child: Text('شرعية / أسرة (بدون فوائد)')),
            ],
            onChanged: (val) {
              if (val != null) setState(() => _interestNature = val);
            },
          ),
        ];

      case 'treasury-supply':
        final treasuryOptions = [
          {'id': 'family-same', 'label': 'كلي وأسرة نفس'},
          {'id': 'partial', 'label': 'جزئي'},
          {'id': 'relative-services', 'label': 'نسبي وخدمات'},
          {'id': 'accounting-money', 'label': 'حسابي مال'},
        ];
        return [
          TextField(
            controller: _collectedAmountController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'المبلغ المحصل الفعلي',
              prefixIcon: Icon(Icons.money),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _principalAmountController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'المبلغ الأصلي المطلوب توريده',
              prefixIcon: Icon(Icons.monetization_on_outlined),
            ),
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            value: _treasuryKind,
            dropdownColor: isDark ? AppColors.darkSurface : Colors.white,
            decoration: const InputDecoration(labelText: 'جهة التوريد'),
            items: treasuryOptions.map((opt) {
              return DropdownMenuItem<String>(
                value: opt['id'],
                child: Text(opt['label']!),
              );
            }).toList(),
            onChanged: (val) {
              if (val != null) setState(() => _treasuryKind = val);
            },
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _treasuryExecutionCountController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'عدد مرات التنفيذ',
              prefixIcon: Icon(Icons.repeat),
            ),
          ),
        ];

      case 'maintenance-arrears':
        return [
          TextField(
            controller: _maintenanceFromController,
            decoration: const InputDecoration(
              labelText: 'تاريخ بداية المتجمد (YYYY-MM-DD)',
              prefixIcon: Icon(Icons.date_range_outlined),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _maintenanceToController,
            decoration: const InputDecoration(
              labelText: 'تاريخ نهاية المتجمد (YYYY-MM-DD)',
              prefixIcon: Icon(Icons.date_range),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _monthlyAmountController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'مبلغ المفروض الشهري',
              prefixIcon: Icon(Icons.monetization_on_outlined),
            ),
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            value: _maintenanceMode,
            dropdownColor: isDark ? AppColors.darkSurface : Colors.white,
            decoration: const InputDecoration(labelText: 'نوع التنفيذ'),
            items: const [
              DropdownMenuItem(value: 'first', child: Text('تنفيذ لأول مرة')),
              DropdownMenuItem(value: 'repeat', child: Text('إعادة تنفيذ')),
            ],
            onChanged: (val) {
              if (val != null) setState(() => _maintenanceMode = val);
            },
          ),
        ];

      case 'deposit':
        return [
          TextField(
            controller: _amountController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'مبلغ الوديعة المراد إيداعها',
              prefixIcon: Icon(Icons.savings_outlined),
            ),
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            value: _depositMode,
            dropdownColor: isDark ? AppColors.darkSurface : Colors.white,
            decoration: const InputDecoration(labelText: 'طريقة اقتطاع الرسوم'),
            items: const [
              DropdownMenuItem(value: 'total', child: Text('مضافة على قيمة الوديعة')),
              DropdownMenuItem(value: 'deducted', child: Text('مقتطعة من أصل الوديعة')),
            ],
            onChanged: (val) {
              if (val != null) setState(() => _depositMode = val);
            },
          ),
        ];

      case 'simple-warning':
        return [
          TextField(
            controller: _warningDefendantsController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'عدد المنذر إليهم',
              prefixIcon: Icon(Icons.people_outline),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _warningRollsController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'عدد الأوراق / الصور المطلوبة',
              prefixIcon: Icon(Icons.pages_outlined),
            ),
          ),
          const SizedBox(height: 12),
          SwitchListTile(
            title: const Text('المنذر إليهم مرتبطون (مصلحة واحدة)'),
            value: _warningLinkedDefendants,
            activeColor: AppColors.primary,
            contentPadding: EdgeInsets.zero,
            onChanged: (val) => setState(() => _warningLinkedDefendants = val),
          ),
        ];

      case 'judgment-announcement':
        final judgmentOptions = [
          {'id': 'partial', 'label': 'حكم جزئي'},
          {'id': 'civil-appeal', 'label': 'حكم كلي أو مدني مستأنف'},
          {'id': 'cassation-state', 'label': 'حكم استئناف أو نقض أو مجلس الدولة'},
        ];
        return [
          TextField(
            controller: _judgmentRollsController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'عدد الصور والأوراق',
              prefixIcon: Icon(Icons.pages_outlined),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _judgmentRecipientsController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'عدد المراد إعلانهم بالحكم',
              prefixIcon: Icon(Icons.people_outline),
            ),
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            value: _judgmentKind,
            dropdownColor: isDark ? AppColors.darkSurface : Colors.white,
            decoration: const InputDecoration(labelText: 'درجة الحكم الصادر'),
            items: judgmentOptions.map((opt) {
              return DropdownMenuItem<String>(
                value: opt['id'],
                child: Text(opt['label']!),
              );
            }).toList(),
            onChanged: (val) {
              if (val != null) setState(() => _judgmentKind = val);
            },
          ),
        ];

      case 'certificate':
        return [
          TextField(
            controller: _certificateCountController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'عدد الشهادات المطلوبة',
              prefixIcon: Icon(Icons.receipt_outlined),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _certificateYearsController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'عدد سنوات البحث / الكشف المالي',
              prefixIcon: Icon(Icons.search_outlined),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _certificatePersonsController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'عدد الأشخاص المطلوب كشفهم بالشهادة',
              prefixIcon: Icon(Icons.person_search_outlined),
            ),
          ),
          const SizedBox(height: 12),
          SwitchListTile(
            title: const Text('تشمل ورق مؤمن'),
            value: _includeCertifiedPaper,
            activeColor: AppColors.primary,
            contentPadding: EdgeInsets.zero,
            onChanged: (val) => setState(() => _includeCertifiedPaper = val),
          ),
          SwitchListTile(
            title: const Text('الشهادة لصاحب شأن مباشر'),
            value: _certificateStakeholder,
            activeColor: AppColors.primary,
            contentPadding: EdgeInsets.zero,
            onChanged: (val) => setState(() => _certificateStakeholder = val),
          ),
        ];

      case 'official-copy':
        return [
          TextField(
            controller: _officialCopyPapersController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'عدد الأوراق الإجمالي',
              prefixIcon: Icon(Icons.pages_outlined),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _officialCopyCountController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'عدد النسخ الرسمية المطلوبة',
              prefixIcon: Icon(Icons.copy_outlined),
            ),
          ),
          const SizedBox(height: 12),
          SwitchListTile(
            title: const Text('تشمل ورق مؤمن رسمي'),
            value: _includeOfficialCertifiedPaper,
            activeColor: AppColors.primary,
            contentPadding: EdgeInsets.zero,
            onChanged: (val) => setState(() => _includeOfficialCertifiedPaper = val),
          ),
          SwitchListTile(
            title: const Text('النسخة لصاحب شأن مباشر'),
            value: _officialCopyStakeholder,
            activeColor: AppColors.primary,
            contentPadding: EdgeInsets.zero,
            onChanged: (val) => setState(() => _officialCopyStakeholder = val),
          ),
        ];

      default:
        return [];
    }
  }
}
