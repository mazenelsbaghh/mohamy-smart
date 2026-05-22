import 'dart:math';

class FeeDetail {
  FeeDetail({required this.label, required this.amount, this.tone = 'normal'});

  final String label;
  final double amount;
  final String tone; // 'normal', 'muted'
}

class SummaryDetail {
  SummaryDetail({
    required this.label,
    required this.value,
    this.tone = 'normal',
  });

  final String label;
  final String value;
  final String tone; // 'normal', 'success'
}

class CourtFeesResult {
  CourtFeesResult({
    required this.title,
    required this.fees,
    required this.totalFees,
    required this.totalPaid,
    required this.summaries,
    required this.notes,
    this.jurisdiction,
  });

  final String title;
  final List<FeeDetail> fees;
  final double totalFees;
  final double? totalPaid;
  final List<SummaryDetail> summaries;
  final List<String> notes;
  final String? jurisdiction;
}

class CourtFeesEngine {
  static const double powerOfAttorneyFee = 2.9;
  static const double martyrStampConst = 5.0;

  static double _roundMoney(double value) {
    return (value * 100).round() / 100;
  }

  static double _positive(double value) {
    return max(0.0, value);
  }

  static double _total(List<FeeDetail> fees) {
    return _roundMoney(fees.fold<double>(0, (sum, fee) => sum + fee.amount));
  }

  static CourtFeesResult _createResult(
    String title,
    List<FeeDetail> fees, {
    double? totalPaid,
    List<SummaryDetail>? summaries,
    List<String>? notes,
    String? jurisdiction,
  }) {
    final totalFees = _total(fees);
    return CourtFeesResult(
      title: title,
      fees: fees,
      totalFees: totalFees,
      totalPaid: totalPaid ?? totalFees,
      summaries: summaries ?? [],
      notes: notes ?? [],
      jurisdiction: jurisdiction,
    );
  }

  static String _claimJurisdiction(double amount) {
    return amount > 100000
        ? 'ترفع أمام المحكمة الابتدائية'
        : 'ترفع أمام محكمة المواد الجزئية';
  }

  static List<FeeDetail> _lawsuitTaxes(double professionTax, double vat) {
    return [
      FeeDetail(label: 'ضريبة المهن', amount: professionTax, tone: 'muted'),
      FeeDetail(label: 'ضريبة القيمة المضافة', amount: vat, tone: 'muted'),
    ];
  }

  static CourtFeesResult calculateCivilKnown(double amountInput) {
    final amount = _positive(amountInput);
    final relativeFee = _roundMoney(amount * 0.0275);
    final servicesFee = _roundMoney(relativeFee / 2);
    const courtBuildingFee = 1.5;
    const attorneyFee = 50.0;
    final martyrStamp = amount > 0 ? martyrStampConst : 0.0;

    final baseFees = [
      FeeDetail(label: 'نسبي', amount: relativeFee),
      FeeDetail(label: 'خدمات', amount: servicesFee),
      FeeDetail(label: 'صندوق أبنية المحاكم', amount: courtBuildingFee),
      FeeDetail(label: 'أتعاب المحاماة', amount: attorneyFee),
      FeeDetail(label: 'دمغة الشهيد', amount: martyrStamp),
    ];
    final baseTotal = _total(baseFees);
    final taxes = _lawsuitTaxes(15, 20);
    const taxTotal = 35.0;

    return _createResult(
      'دعوى مدني معلومة القيمة',
      [...baseFees, ...taxes],
      totalPaid: _roundMoney(baseTotal + taxTotal),
      jurisdiction: _claimJurisdiction(amount),
      summaries: [
        SummaryDetail(
          label: 'الإجمالي',
          value: baseTotal.toStringAsFixed(2),
          tone: 'success',
        ),
        SummaryDetail(
          label: 'إجمالي الضريبة',
          value: taxTotal.toStringAsFixed(2),
          tone: 'success',
        ),
        SummaryDetail(
          label: 'قيمة قوائم الرسوم - نسبي',
          value: 'لا توجد رسوم مستحقة',
        ),
        SummaryDetail(
          label: 'قيمة قوائم الرسوم - خدمات',
          value: 'لا توجد رسوم مستحقة',
        ),
      ],
    );
  }

  static CourtFeesResult calculateFamilyKnown(double amountInput) {
    final amount = _positive(amountInput);
    final relativeFee = _roundMoney(amount * 0.01);
    final servicesFee = _roundMoney(relativeFee / 2);

    final baseFees = [
      FeeDetail(label: 'نسبي', amount: relativeFee),
      FeeDetail(label: 'خدمات', amount: servicesFee),
      FeeDetail(label: 'صندوق أبنية المحاكم', amount: 1.5),
      FeeDetail(label: 'أتعاب المحاماة', amount: 75.0),
      FeeDetail(
        label: 'دمغة الشهيد',
        amount: amount > 0 ? martyrStampConst : 0.0,
      ),
    ];
    final baseTotal = _total(baseFees);
    final taxes = _lawsuitTaxes(15, 40);
    const taxTotal = 55.0;

    return _createResult(
      'دعوى شرعي معلومة القيمة',
      [...baseFees, ...taxes],
      totalPaid: _roundMoney(baseTotal + taxTotal),
      summaries: [
        SummaryDetail(
          label: 'الإجمالي',
          value: baseTotal.toStringAsFixed(2),
          tone: 'success',
        ),
        SummaryDetail(
          label: 'إجمالي الضريبة',
          value: taxTotal.toStringAsFixed(2),
          tone: 'success',
        ),
        SummaryDetail(
          label: 'قيمة قوائم الرسوم - نسبي',
          value: 'لا توجد رسوم مستحقة',
        ),
        SummaryDetail(
          label: 'قيمة قوائم الرسوم - خدمات',
          value: 'لا توجد رسوم مستحقة',
        ),
        SummaryDetail(
          label: 'قيمة قوائم الرسوم - إجمالي',
          value: 'لا توجد رسوم مستحقة',
        ),
      ],
    );
  }

  static CourtFeesResult calculateCivilUnknown(String civilUnknownKind) {
    // Presets mapping
    final presets = {
      'fixed-partial': _Preset(
        label: 'ثابت جزئي',
        relativeFee: 5,
        servicesFee: 2.5,
        courtBuildingFee: 1.5,
        attorneyFee: 50,
        martyrStamp: 0,
        professionTax: 15,
        vat: 20,
      ),
      'urgent-partial': _Preset(
        label: 'جزئي مستعجل',
        relativeFee: 10,
        servicesFee: 5,
        courtBuildingFee: 1.5,
        attorneyFee: 50,
        martyrStamp: 5,
        professionTax: 15,
        vat: 20,
      ),
      'fixed-total': _Preset(
        label: 'ثابت كلي',
        relativeFee: 15,
        servicesFee: 7.5,
        courtBuildingFee: 1.5,
        attorneyFee: 75,
        martyrStamp: 5,
        professionTax: 15,
        vat: 40,
      ),
      'appeal-urgent-partial': _Preset(
        label: 'استئناف جزئي مستعجل',
        relativeFee: 15,
        servicesFee: 7.5,
        courtBuildingFee: 1.5,
        attorneyFee: 75,
        martyrStamp: 5,
        professionTax: 25,
        vat: 40,
      ),
      'appeal-fixed-partial': _Preset(
        label: 'ثابت مستأنف جزئي',
        relativeFee: 10,
        servicesFee: 5,
        courtBuildingFee: 1.5,
        attorneyFee: 75,
        martyrStamp: 5,
        professionTax: 25,
        vat: 40,
      ),
      'bankruptcy': _Preset(
        label: 'إفلاس',
        relativeFee: 50,
        servicesFee: 25,
        courtBuildingFee: 1.5,
        attorneyFee: 75,
        martyrStamp: 5,
        professionTax: 15,
        vat: 40,
      ),
      'high-appeal': _Preset(
        label: 'استئناف عالي',
        relativeFee: 30,
        servicesFee: 15,
        courtBuildingFee: 3,
        attorneyFee: 100,
        martyrStamp: 5,
        professionTax: 25,
        vat: 60,
      ),
    };

    final preset = presets[civilUnknownKind] ?? presets['fixed-partial']!;

    final baseFees = [
      FeeDetail(label: 'نسبي', amount: preset.relativeFee),
      FeeDetail(label: 'خدمات', amount: preset.servicesFee),
      FeeDetail(label: 'صندوق أبنية المحاكم', amount: preset.courtBuildingFee),
      FeeDetail(label: 'أتعاب المحاماة', amount: preset.attorneyFee),
      FeeDetail(label: 'دمغة الشهيد', amount: preset.martyrStamp),
    ];
    final baseTotal = _total(baseFees);
    final taxes = _lawsuitTaxes(preset.professionTax, preset.vat);
    final taxTotal = preset.professionTax + preset.vat;

    return _createResult(
      preset.label,
      [...baseFees, ...taxes],
      totalPaid: _roundMoney(baseTotal + taxTotal),
      summaries: [
        SummaryDetail(
          label: 'الإجمالي',
          value: baseTotal.toStringAsFixed(2),
          tone: 'success',
        ),
        SummaryDetail(
          label: 'إجمالي الضريبة',
          value: taxTotal.toStringAsFixed(2),
          tone: 'success',
        ),
      ],
    );
  }

  static double _getExecutionRelativeFee(
    double amount,
    String scope,
    String round,
  ) {
    if (scope == 'sharia') {
      return _roundMoney(
        amount * (round == 'first' ? 0.003333333 : 0.001111111),
      );
    }
    return _roundMoney(amount * (round == 'first' ? 0.009166667 : 0.003055556));
  }

  static double _getExecutionFixedFee(String scope, String round) {
    if (round == 'repeat') return 0.85;
    if (scope == 'partial') return 1.0;
    return 2.5;
  }

  static CourtFeesResult calculateExecution({
    required double executionAmount,
    required String executionScope,
    required String executionRound,
    required bool includeExecutionFixed,
    required bool includeExecutionPowerOfAttorney,
    required bool includeExecutionMartyrStamp,
  }) {
    final amount = _positive(executionAmount);
    final relativeFee = _getExecutionRelativeFee(
      amount,
      executionScope,
      executionRound,
    );
    final servicesFee = _roundMoney(relativeFee / 2);
    final fixedFee = includeExecutionFixed
        ? _getExecutionFixedFee(executionScope, executionRound)
        : 0.0;
    final powerOfAttorney = includeExecutionPowerOfAttorney
        ? powerOfAttorneyFee
        : 0.0;
    final martyrStamp = includeExecutionMartyrStamp ? martyrStampConst : 0.0;

    final fees = [
      FeeDetail(label: 'نسبي', amount: relativeFee),
      FeeDetail(label: 'خدمات', amount: servicesFee),
      FeeDetail(label: 'ثابت', amount: fixedFee),
      FeeDetail(label: 'دمغة توكيل', amount: powerOfAttorney),
      FeeDetail(label: 'دمغة الشهيد', amount: martyrStamp),
    ];
    final totalFees = _total(fees);

    return _createResult(
      'رسم تنفيذ',
      fees,
      totalPaid: _roundMoney(amount + totalFees),
      summaries: [
        SummaryDetail(
          label: 'قيمة التصالح',
          value: _roundMoney(amount * (2 / 3)).toStringAsFixed(2),
        ),
      ],
      notes: ['دمغة التوكيل: 90 قرش اتساع + 2 جنيه تنمية موارد.'],
    );
  }

  static CourtFeesResult calculateExecutionInterest({
    required double interestAmount,
    required double interestYears,
    required String interestNature,
  }) {
    final amount = _positive(interestAmount);
    final years = _positive(interestYears);
    final interest = interestNature == 'civil'
        ? _roundMoney(amount * 0.04 * years)
        : 0.0;
    final subjectTotal = _roundMoney(interest);
    final amountTotal = _roundMoney(amount + interest);
    final scope = interestNature == 'civil' ? 'total' : 'sharia';

    final relativeFee = _getExecutionRelativeFee(amountTotal, scope, 'first');
    final servicesFee = _roundMoney(relativeFee / 2);
    final fixedFee = _getExecutionFixedFee(scope, 'first');
    final martyrStamp = interestNature == 'civil' ? martyrStampConst : 0.0;

    final fees = [
      FeeDetail(label: 'نسبي', amount: relativeFee),
      FeeDetail(label: 'خدمات', amount: servicesFee),
      FeeDetail(label: 'ثابت', amount: fixedFee),
      FeeDetail(label: 'دمغة توكيل', amount: powerOfAttorneyFee),
      FeeDetail(label: 'دمغة الشهيد', amount: martyrStamp),
    ];

    return _createResult(
      'رسم تنفيذ بالفائدة القانونية',
      fees,
      summaries: [
        SummaryDetail(
          label: 'قيمة الفوائد',
          value: subjectTotal.toStringAsFixed(2),
        ),
        SummaryDetail(label: 'نسبي ع / خدمات ع', value: '0 / 0'),
        SummaryDetail(
          label: 'إجمالي الموضوع',
          value: subjectTotal.toStringAsFixed(2),
        ),
        SummaryDetail(
          label: 'إجمالي المبلغ',
          value: amountTotal.toStringAsFixed(2),
          tone: 'success',
        ),
      ],
      notes: interestNature == 'civil'
          ? ['يتم احتساب الفائدة بواقع 4% سنويا في المسائل المدنية.']
          : [],
    );
  }

  static CourtFeesResult calculateTreasurySupply({
    required double treasuryCollectedAmount,
    required double treasuryPrincipalAmount,
    required String treasuryKind,
    required double treasuryExecutionCount,
  }) {
    final collected = _positive(treasuryCollectedAmount);
    final principal = _positive(treasuryPrincipalAmount);
    final amountToSupply = _positive(collected - principal);

    final presets = {
      'family-same': _TreasuryPreset(fixedFee: 2.5, powerOfAttorneyFee: 2.9),
      'partial': _TreasuryPreset(fixedFee: 1.0, powerOfAttorneyFee: 2.9),
      'relative-services': _TreasuryPreset(
        fixedFee: 0.0,
        powerOfAttorneyFee: 2.9,
      ),
      'accounting-money': _TreasuryPreset(
        fixedFee: 2.5,
        powerOfAttorneyFee: 0.0,
      ),
    };

    final preset = presets[treasuryKind] ?? presets['family-same']!;
    final fixedAndPower = preset.fixedFee + preset.powerOfAttorneyFee;
    final relativeFee = _roundMoney(
      _positive(amountToSupply - fixedAndPower) / 1.5,
    );
    final servicesFee = _roundMoney(relativeFee / 2);

    final fees = [
      FeeDetail(label: 'نسبي', amount: relativeFee),
      FeeDetail(label: 'خدمات', amount: servicesFee),
      FeeDetail(label: 'ثابت', amount: preset.fixedFee),
      FeeDetail(label: 'دمغة توكيل', amount: preset.powerOfAttorneyFee),
    ];

    return _createResult(
      'توريد المبالغ المحصلة للخزينة',
      fees,
      totalPaid: null,
      summaries: [
        SummaryDetail(
          label: 'فرق التوريد',
          value: amountToSupply.toStringAsFixed(2),
          tone: 'success',
        ),
        SummaryDetail(
          label: 'عدد مرات التنفيذ',
          value: treasuryExecutionCount.truncate().toString(),
        ),
      ],
    );
  }

  static Map<String, int> _dateDiffParts(String fromValue, String toValue) {
    try {
      final from = DateTime.parse(fromValue);
      final to = DateTime.parse(toValue);
      if (to.isBefore(from)) {
        return {'months': 0, 'days': 0};
      }

      int months = (to.year - from.year) * 12 + (to.month - from.month);
      int days = to.day - from.day;

      if (days < 0) {
        months -= 1;
        // get days of previous month
        final prevMonthDate = DateTime(to.year, to.month, 0);
        days += prevMonthDate.day;
      }

      return {'months': max(0, months), 'days': max(0, days)};
    } catch (_) {
      return {'months': 0, 'days': 0};
    }
  }

  static CourtFeesResult calculateMaintenanceArrears({
    required String maintenanceFrom,
    required String maintenanceTo,
    required double maintenanceMonthlyAmount,
    required String maintenanceMode,
  }) {
    final diff = _dateDiffParts(maintenanceFrom, maintenanceTo);
    final months = diff['months']!;
    final days = diff['days']!;
    final monthlyAmount = _positive(maintenanceMonthlyAmount);
    final arrearsAmount = _roundMoney(
      monthlyAmount * months + (monthlyAmount / 30.0) * days,
    );
    final isRepeat = maintenanceMode == 'repeat';

    final relativeFee = isRepeat
        ? max(_roundMoney(arrearsAmount * 0.001111111), 0.01)
        : _roundMoney(arrearsAmount * 0.003333333);
    final servicesFee = isRepeat ? 0.0 : _roundMoney(relativeFee / 2);
    final fixedFee = isRepeat ? 0.85 : 2.5;

    final fees = [
      FeeDetail(label: 'نسبي', amount: relativeFee),
      FeeDetail(label: 'خدمات', amount: servicesFee),
      FeeDetail(label: 'ثابت', amount: fixedFee),
      FeeDetail(label: 'دمغة توكيل', amount: powerOfAttorneyFee),
      FeeDetail(label: 'دمغة الشهيد', amount: 0.0),
    ];

    return _createResult(
      'حساب رسم متجمد نفقة',
      fees,
      summaries: [
        SummaryDetail(label: 'عدد الشهور', value: months.toString()),
        SummaryDetail(label: 'عدد الأيام', value: days.toString()),
        SummaryDetail(
          label: 'إجمالي المبلغ',
          value: arrearsAmount.toStringAsFixed(2),
          tone: 'success',
        ),
      ],
    );
  }

  static CourtFeesResult calculateDeposit({
    required double depositAmount,
    required String depositMode,
  }) {
    final amount = _positive(depositAmount);
    final relativeFee = _roundMoney(amount * 0.01);
    final servicesFee = _roundMoney(relativeFee / 2);
    final additionalFee = _roundMoney(amount * 0.0005);
    final martyrStamp = amount > 0 ? martyrStampConst : 0.0;

    final fees = [
      FeeDetail(label: 'نسبي', amount: relativeFee),
      FeeDetail(label: 'خدمات', amount: servicesFee),
      FeeDetail(label: 'إضافي', amount: additionalFee),
      FeeDetail(label: 'دمغة الشهيد', amount: martyrStamp),
    ];
    final revenueTotal = _total(fees);
    final depositValue = depositMode == 'deducted'
        ? _roundMoney(
            _positive(amount - relativeFee - servicesFee - additionalFee),
          )
        : amount;

    return _createResult(
      'رسم الإيداع',
      fees,
      totalPaid: _roundMoney(depositValue + revenueTotal),
      summaries: [
        SummaryDetail(
          label: 'الوديعة',
          value: depositValue.toStringAsFixed(2),
          tone: 'success',
        ),
        SummaryDetail(
          label: 'إجمالي الإيراد',
          value: revenueTotal.toStringAsFixed(2),
          tone: 'success',
        ),
      ],
    );
  }

  static CourtFeesResult calculateSimpleWarning({
    required double warningDefendants,
    required double warningRolls,
    required bool warningLinkedDefendants,
  }) {
    final defendants = warningDefendants.truncate();
    final rolls = warningRolls.truncate();
    final prescribedFee = _roundMoney(defendants * rolls * 0.3);
    final servicesFee = _roundMoney(prescribedFee / 2);
    final additionalFee = warningLinkedDefendants ? 0.0 : defendants.toDouble();

    final fees = [
      FeeDetail(label: 'مقرر', amount: prescribedFee),
      FeeDetail(label: 'خدمات', amount: servicesFee),
      FeeDetail(label: 'إضافي', amount: additionalFee),
    ];

    return _createResult(
      'إنذار بسيط',
      fees,
      notes: ['يمكنك الاختيار بين ارتباط أو عدم ارتباط المنذر إليهم.'],
    );
  }

  static CourtFeesResult calculateJudgmentAnnouncement({
    required double judgmentRolls,
    required double judgmentRecipients,
    required String judgmentKind,
  }) {
    final rolls = judgmentRolls.truncate();
    final recipients = judgmentRecipients.truncate();

    final rates = {
      'partial': 0.375,
      'civil-appeal': 1.125,
      'cassation-state': 2.25,
    };
    final rate = rates[judgmentKind] ?? 0.375;
    final prescribedFee = _roundMoney(rolls * recipients * rate);
    final servicesFee = _roundMoney(prescribedFee / 2);

    final fees = [
      FeeDetail(label: 'مقرر', amount: prescribedFee),
      FeeDetail(label: 'خدمات', amount: servicesFee),
      FeeDetail(label: 'دمغة الشهيد', amount: martyrStampConst),
    ];

    return _createResult('رسم إعلان صورة حكم', fees);
  }

  static CourtFeesResult calculateCertificate({
    required double certificateCount,
    required double certificateYears,
    required double certificatePersons,
    required bool includeCertifiedPaper,
    required bool certificateStakeholder,
  }) {
    final count = certificateCount.truncate();
    final years = certificateYears.truncate();
    final persons = certificatePersons.truncate();

    final prescribedFee = _roundMoney(count * 0.5);
    final servicesFee = _roundMoney(prescribedFee / 2);
    final additionalFee = _roundMoney(persons * 1.5);
    final discoveryFee = _roundMoney(years * 0.18);
    final certifiedPaperFee = includeCertifiedPaper ? count.toDouble() : 0.0;
    final stampFee = count * (certificateStakeholder ? 5.0 : 10.0);

    final fees = [
      FeeDetail(label: 'مقرر', amount: prescribedFee),
      FeeDetail(label: 'خدمات', amount: servicesFee),
      FeeDetail(label: 'إضافي', amount: additionalFee),
      FeeDetail(label: 'رسم كشف', amount: discoveryFee),
      FeeDetail(label: 'ورق مؤمن', amount: certifiedPaperFee),
      FeeDetail(label: 'ميكنة', amount: stampFee),
      FeeDetail(label: 'دمغة الشهيد', amount: martyrStampConst),
    ];

    return _createResult(
      'رسم شهادة',
      fees,
      notes: ['يمكنك اختيار نوع الورق مؤمن أو غير مؤمن.'],
    );
  }

  static CourtFeesResult calculateOfficialCopy({
    required double officialCopyPapers,
    required double officialCopyCount,
    required bool includeOfficialCertifiedPaper,
    required bool officialCopyStakeholder,
  }) {
    final papers = officialCopyPapers.truncate();
    final copies = officialCopyCount.truncate();

    final prescribedFee = _roundMoney(papers * 0.5);
    final servicesFee = _roundMoney(prescribedFee / 2);
    final additionalFee = _roundMoney(copies * 4);
    final certifiedPaperFee = includeOfficialCertifiedPaper
        ? papers.toDouble()
        : 0.0;
    final stampFee = papers * (officialCopyStakeholder ? 2.0 : 4.0);

    final fees = [
      FeeDetail(label: 'مقرر', amount: prescribedFee),
      FeeDetail(label: 'خدمات', amount: servicesFee),
      FeeDetail(label: 'إضافي', amount: additionalFee),
      FeeDetail(label: 'ورق مؤمن', amount: certifiedPaperFee),
      FeeDetail(label: 'ميكنة', amount: stampFee),
      FeeDetail(label: 'دمغة الشهيد', amount: martyrStampConst),
    ];

    return _createResult(
      'رسم صورة رسمية',
      fees,
      notes: ['يمكنك اختيار نوع الورق مؤمن أو غير مؤمن.'],
    );
  }
}

class _Preset {
  _Preset({
    required this.label,
    required this.relativeFee,
    required this.servicesFee,
    required this.courtBuildingFee,
    required this.attorneyFee,
    required this.martyrStamp,
    required this.professionTax,
    required this.vat,
  });

  final String label;
  final double relativeFee;
  final double servicesFee;
  final double courtBuildingFee;
  final double attorneyFee;
  final double martyrStamp;
  final double professionTax;
  final double vat;
}

class _TreasuryPreset {
  _TreasuryPreset({required this.fixedFee, required this.powerOfAttorneyFee});

  final double fixedFee;
  final double powerOfAttorneyFee;
}
