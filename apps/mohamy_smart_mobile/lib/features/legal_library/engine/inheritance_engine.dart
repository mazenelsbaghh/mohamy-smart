import 'dart:math';

enum HeirType {
  HUSBAND,
  WIFE,
  SON,
  DAUGHTER,
  SON_OF_SON,
  DAUGHTER_OF_SON,
  FATHER,
  MOTHER,
  GRANDFATHER_PATERNAL,
  GRANDMOTHER_PATERNAL,
  GRANDMOTHER_MATERNAL,
  FULL_BROTHER,
  FULL_SISTER,
  PATERNAL_HALF_BROTHER,
  PATERNAL_HALF_SISTER,
  MATERNAL_HALF_BROTHER,
  MATERNAL_HALF_SISTER,
  UNCLE_PATERNAL,
  NEPHEW_PATERNAL,
}

extension HeirTypeExtension on HeirType {
  String get arabicLabel {
    switch (this) {
      case HeirType.HUSBAND:
        return 'زوج';
      case HeirType.WIFE:
        return 'زوجة';
      case HeirType.SON:
        return 'ابن';
      case HeirType.DAUGHTER:
        return 'بنت';
      case HeirType.SON_OF_SON:
        return 'ابن ابن';
      case HeirType.DAUGHTER_OF_SON:
        return 'بنت ابن';
      case HeirType.FATHER:
        return 'أب';
      case HeirType.MOTHER:
        return 'أم';
      case HeirType.GRANDFATHER_PATERNAL:
        return 'جد لأب';
      case HeirType.GRANDMOTHER_PATERNAL:
        return 'جدة لأب';
      case HeirType.GRANDMOTHER_MATERNAL:
        return 'جدة لأم';
      case HeirType.FULL_BROTHER:
        return 'أخ شقيق';
      case HeirType.FULL_SISTER:
        return 'أخت شقيقة';
      case HeirType.PATERNAL_HALF_BROTHER:
        return 'أخ لأب';
      case HeirType.PATERNAL_HALF_SISTER:
        return 'أخت لأب';
      case HeirType.MATERNAL_HALF_BROTHER:
        return 'أخ لأم';
      case HeirType.MATERNAL_HALF_SISTER:
        return 'أخت لأم';
      case HeirType.UNCLE_PATERNAL:
        return 'عم';
      case HeirType.NEPHEW_PATERNAL:
        return 'ابن أخ';
    }
  }

  bool get isMale {
    switch (this) {
      case HeirType.HUSBAND:
      case HeirType.SON:
      case HeirType.SON_OF_SON:
      case HeirType.FATHER:
      case HeirType.GRANDFATHER_PATERNAL:
      case HeirType.FULL_BROTHER:
      case HeirType.PATERNAL_HALF_BROTHER:
      case HeirType.MATERNAL_HALF_BROTHER:
      case HeirType.UNCLE_PATERNAL:
      case HeirType.NEPHEW_PATERNAL:
        return true;
      default:
        return false;
    }
  }
}

class HeirInput {
  HeirInput({required this.type, required this.count});

  final HeirType type;
  int count;

  HeirInput copy() => HeirInput(type: type, count: count);
}

class HeirShare {
  HeirShare({
    required this.heirType,
    required this.count,
    required this.shareType,
    required this.fraction,
    required this.totalAmount,
    required this.perPersonAmount,
    required this.percentage,
    required this.legalBasis,
  });

  final HeirType heirType;
  final int count;
  String shareType; // 'fard', 'ta'sib', 'fard_radd', 'radd', 'wasiyya_wajiba'
  final String? fraction;
  double totalAmount;
  double perPersonAmount;
  double percentage;
  String legalBasis;
}

class InheritanceResult {
  InheritanceResult({
    required this.shares,
    required this.totalDistributed,
    required this.remainingEstate,
    required this.isOversubscribed,
    required this.awlRate,
    required this.warnings,
  });

  final List<HeirShare> shares;
  final double totalDistributed;
  final double remainingEstate;
  final bool isOversubscribed;
  final double? awlRate;
  final List<String> warnings;
}

class InheritanceEngine {
  static const Map<HeirType, List<HeirType>> blockingRules = {
    HeirType.SON: [HeirType.SON_OF_SON, HeirType.DAUGHTER_OF_SON],
    HeirType.SON_OF_SON: [HeirType.DAUGHTER_OF_SON],
    HeirType.FATHER: [HeirType.GRANDFATHER_PATERNAL],
    HeirType.MOTHER: [HeirType.GRANDMOTHER_PATERNAL, HeirType.GRANDMOTHER_MATERNAL],
    HeirType.FULL_BROTHER: [HeirType.PATERNAL_HALF_BROTHER, HeirType.PATERNAL_HALF_SISTER],
    HeirType.FULL_SISTER: [HeirType.PATERNAL_HALF_SISTER],
    HeirType.PATERNAL_HALF_BROTHER: [HeirType.PATERNAL_HALF_SISTER],
  };

  static const List<HeirType> residuaryPriority = [
    HeirType.SON,
    HeirType.SON_OF_SON,
    HeirType.FATHER,
    HeirType.GRANDFATHER_PATERNAL,
    HeirType.FULL_BROTHER,
    HeirType.FULL_SISTER,
    HeirType.PATERNAL_HALF_BROTHER,
    HeirType.PATERNAL_HALF_SISTER,
    HeirType.UNCLE_PATERNAL,
    HeirType.NEPHEW_PATERNAL,
  ];

  static const List<HeirType> raddEligible = [
    HeirType.DAUGHTER,
    HeirType.SON_OF_SON,
    HeirType.DAUGHTER_OF_SON,
    HeirType.FULL_SISTER,
    HeirType.PATERNAL_HALF_SISTER,
    HeirType.MOTHER,
    HeirType.GRANDMOTHER_PATERNAL,
    HeirType.GRANDMOTHER_MATERNAL,
  ];

  static bool _hasHeirType(List<HeirInput> heirs, HeirType type) {
    return heirs.any((h) => h.type == type);
  }

  static int _getHeirCount(List<HeirInput> heirs, HeirType type) {
    final match = heirs.where((h) => h.type == type);
    return match.isEmpty ? 0 : match.first.count;
  }

  static bool _hasDescendants(List<HeirInput> heirs) {
    return _hasHeirType(heirs, HeirType.SON) ||
        _hasHeirType(heirs, HeirType.DAUGHTER) ||
        _hasHeirType(heirs, HeirType.SON_OF_SON) ||
        _hasHeirType(heirs, HeirType.DAUGHTER_OF_SON);
  }

  static bool _hasMaleDescendants(List<HeirInput> heirs) {
    return _hasHeirType(heirs, HeirType.SON) || _hasHeirType(heirs, HeirType.SON_OF_SON);
  }

  static int _countSiblings(List<HeirInput> heirs) {
    int count = 0;
    count += _getHeirCount(heirs, HeirType.FULL_BROTHER);
    count += _getHeirCount(heirs, HeirType.FULL_SISTER);
    count += _getHeirCount(heirs, HeirType.PATERNAL_HALF_BROTHER);
    count += _getHeirCount(heirs, HeirType.PATERNAL_HALF_SISTER);
    count += _getHeirCount(heirs, HeirType.MATERNAL_HALF_BROTHER);
    count += _getHeirCount(heirs, HeirType.MATERNAL_HALF_SISTER);
    return count;
  }

  static List<HeirInput> _applyBlocking(List<HeirInput> heirs) {
    final presentTypes = heirs.map((h) => h.type).toSet();
    final blocked = <HeirType>{};

    blockingRules.forEach((blocker, blockedTypes) {
      if (presentTypes.contains(blocker)) {
        blocked.addAll(blockedTypes);
      }
    });

    final hasMaleDesc = _hasMaleDescendants(heirs);
    final hasAnyDesc = _hasDescendants(heirs);

    if (hasMaleDesc) {
      blocked.addAll([
        HeirType.FULL_BROTHER,
        HeirType.FULL_SISTER,
        HeirType.PATERNAL_HALF_BROTHER,
        HeirType.PATERNAL_HALF_SISTER,
        HeirType.MATERNAL_HALF_BROTHER,
        HeirType.MATERNAL_HALF_SISTER,
        HeirType.UNCLE_PATERNAL,
        HeirType.NEPHEW_PATERNAL,
      ]);
    }

    if (hasAnyDesc) {
      blocked.addAll([
        HeirType.MATERNAL_HALF_BROTHER,
        HeirType.MATERNAL_HALF_SISTER,
      ]);
    }

    if (_hasHeirType(heirs, HeirType.FATHER)) {
      blocked.addAll([
        HeirType.GRANDFATHER_PATERNAL,
        HeirType.FULL_BROTHER,
        HeirType.FULL_SISTER,
        HeirType.PATERNAL_HALF_BROTHER,
        HeirType.PATERNAL_HALF_SISTER,
        HeirType.MATERNAL_HALF_BROTHER,
        HeirType.MATERNAL_HALF_SISTER,
        HeirType.UNCLE_PATERNAL,
        HeirType.NEPHEW_PATERNAL,
      ]);
    }

    if (!_hasHeirType(heirs, HeirType.FATHER) &&
        _hasHeirType(heirs, HeirType.GRANDFATHER_PATERNAL)) {
      blocked.addAll([
        HeirType.MATERNAL_HALF_BROTHER,
        HeirType.MATERNAL_HALF_SISTER,
        HeirType.UNCLE_PATERNAL,
        HeirType.NEPHEW_PATERNAL,
      ]);
      if (hasMaleDesc) {
        blocked.addAll([
          HeirType.FULL_BROTHER,
          HeirType.FULL_SISTER,
          HeirType.PATERNAL_HALF_BROTHER,
          HeirType.PATERNAL_HALF_SISTER,
        ]);
      }
    }

    if (hasAnyDesc && !hasMaleDesc) {
      if (_hasHeirType(heirs, HeirType.FULL_SISTER)) {
        blocked.addAll([
          HeirType.PATERNAL_HALF_BROTHER,
          HeirType.PATERNAL_HALF_SISTER,
          HeirType.UNCLE_PATERNAL,
          HeirType.NEPHEW_PATERNAL,
        ]);
      } else if (_hasHeirType(heirs, HeirType.PATERNAL_HALF_SISTER)) {
        blocked.addAll([
          HeirType.UNCLE_PATERNAL,
          HeirType.NEPHEW_PATERNAL,
        ]);
      }
    }

    return heirs.where((h) => !blocked.contains(h.type)).toList();
  }

  static _FixedSharesResult _assignFixedShares(List<HeirInput> activeHeirs) {
    final List<_FractionalShare> shares = [];
    final List<String> warnings = [];

    final desc = _hasDescendants(activeHeirs);
    final siblingCount = _countSiblings(activeHeirs);
    final hasFather = _hasHeirType(activeHeirs, HeirType.FATHER);
    final hasMother = _hasHeirType(activeHeirs, HeirType.MOTHER);
    final hasHusband = _hasHeirType(activeHeirs, HeirType.HUSBAND);
    final hasWife = _hasHeirType(activeHeirs, HeirType.WIFE);

    if (hasHusband) {
      final double fraction = desc ? 1 / 4 : 1 / 2;
      final label = desc ? '1/4' : '1/2';
      final basis = desc
          ? 'الربع لوجود الفرع الوارث — النساء: ١٢'
          : 'النصف لعدم وجود الفرع الوارث — النساء: ١٢';
      shares.add(_FractionalShare(
        heirType: HeirType.HUSBAND,
        count: 1,
        fraction: fraction,
        fractionLabel: label,
        shareType: 'fard',
        legalBasis: basis,
      ));
    }

    if (hasWife) {
      final wifeCount = _getHeirCount(activeHeirs, HeirType.WIFE);
      final double fraction = desc ? 1 / 8 : 1 / 4;
      final label = desc ? '1/8' : '1/4';
      final basis = desc
          ? 'الثمن لوجود الفرع الوارث — النساء: ١٢'
          : 'الربع لعدم وجود الفرع الوارث — النساء: ١١';
      shares.add(_FractionalShare(
        heirType: HeirType.WIFE,
        count: wifeCount,
        fraction: fraction,
        fractionLabel: label,
        shareType: 'fard',
        legalBasis: basis,
      ));
    }

    if (hasFather) {
      if (desc) {
        shares.add(_FractionalShare(
          heirType: HeirType.FATHER,
          count: 1,
          fraction: 1 / 6,
          fractionLabel: '1/6',
          shareType: 'fard',
          legalBasis: 'السدس مع الفرع الوارث — النساء: ١١',
        ));
      }
    }

    if (!hasFather && _hasHeirType(activeHeirs, HeirType.GRANDFATHER_PATERNAL)) {
      if (desc) {
        shares.add(_FractionalShare(
          heirType: HeirType.GRANDFATHER_PATERNAL,
          count: 1,
          fraction: 1 / 6,
          fractionLabel: '1/6',
          shareType: 'fard',
          legalBasis: 'السدس مع الفرع الوارث (يقوم مقام الأب) — النساء: ١١',
        ));
      }
    }

    if (hasMother) {
      double motherFraction;
      String motherLabel;
      String motherBasis;

      // Umariyyatain check: (Husband or Wife) + Mother + Father and no other heirs
      // Note: activeHeirs.length == 3 is a simplified check that matches the TS implementation
      final umariyyatain = (hasHusband || hasWife) && hasFather && activeHeirs.length == 3;

      if (umariyyatain) {
        motherFraction = 1 / 3;
        motherLabel = '1/3';
        motherBasis = 'حالة العمريتين — الثلث — النساء: ١١';
        warnings.add('حالة العمريتين: الأم تأخذ الثلث (الأب يأخذ ما بقي)');
      } else if (desc || (siblingCount >= 2)) {
        motherFraction = 1 / 6;
        motherLabel = '1/6';
        motherBasis = 'السدس لوجود الفرع أو اثنين من الإخوة — النساء: ١١';
      } else {
        motherFraction = 1 / 3;
        motherLabel = '1/3';
        motherBasis = 'الثلث لعدم وجود الفرع أو الإخوة — النساء: ١١';
      }

      shares.add(_FractionalShare(
        heirType: HeirType.MOTHER,
        count: 1,
        fraction: motherFraction,
        fractionLabel: motherLabel,
        shareType: 'fard',
        legalBasis: motherBasis,
      ));
    }

    final List<HeirType> grandmothers = [];
    if (_hasHeirType(activeHeirs, HeirType.GRANDMOTHER_PATERNAL)) {
      grandmothers.add(HeirType.GRANDMOTHER_PATERNAL);
    }
    if (_hasHeirType(activeHeirs, HeirType.GRANDMOTHER_MATERNAL)) {
      grandmothers.add(HeirType.GRANDMOTHER_MATERNAL);
    }

    if (grandmothers.isNotEmpty && !hasMother) {
      for (final gm in grandmothers) {
        final cnt = _getHeirCount(activeHeirs, gm);
        shares.add(_FractionalShare(
          heirType: gm,
          count: cnt,
          fraction: 1 / 6,
          fractionLabel: '1/6',
          shareType: 'fard',
          legalBasis: 'السدس للجدة في عدم الأم — النساء: ١١',
        ));
      }
    }

    if (_hasHeirType(activeHeirs, HeirType.DAUGHTER) &&
        !_hasHeirType(activeHeirs, HeirType.SON)) {
      final daughterCount = _getHeirCount(activeHeirs, HeirType.DAUGHTER);
      if (daughterCount == 1) {
        shares.add(_FractionalShare(
          heirType: HeirType.DAUGHTER,
          count: 1,
          fraction: 1 / 2,
          fractionLabel: '1/2',
          shareType: 'fard',
          legalBasis: 'النصف للبنت الواحدة — النساء: ١١',
        ));
      } else if (daughterCount >= 2) {
        shares.add(_FractionalShare(
          heirType: HeirType.DAUGHTER,
          count: daughterCount,
          fraction: 2 / 3,
          fractionLabel: '2/3',
          shareType: 'fard',
          legalBasis: 'الثلثان للبنتين فأكثر — النساء: ١١',
        ));
      }
    }

    if (_hasHeirType(activeHeirs, HeirType.DAUGHTER_OF_SON) &&
        !_hasHeirType(activeHeirs, HeirType.SON) &&
        !_hasHeirType(activeHeirs, HeirType.SON_OF_SON)) {
      final dosCount = _getHeirCount(activeHeirs, HeirType.DAUGHTER_OF_SON);
      final hasDaughter = _hasHeirType(activeHeirs, HeirType.DAUGHTER);

      if (!hasDaughter) {
        if (dosCount == 1) {
          shares.add(_FractionalShare(
            heirType: HeirType.DAUGHTER_OF_SON,
            count: 1,
            fraction: 1 / 2,
            fractionLabel: '1/2',
            shareType: 'fard',
            legalBasis: 'النصف لبنت الابن مع عدم وجود بنت — النساء: ١١',
          ));
        } else if (dosCount >= 2) {
          shares.add(_FractionalShare(
            heirType: HeirType.DAUGHTER_OF_SON,
            count: dosCount,
            fraction: 2 / 3,
            fractionLabel: '2/3',
            shareType: 'fard',
            legalBasis: 'الثلثان لبنتي الابن فأكثر — النساء: ١١',
          ));
        }
      } else {
        final daughterCount = _getHeirCount(activeHeirs, HeirType.DAUGHTER);
        if (daughterCount == 1) {
          shares.add(_FractionalShare(
            heirType: HeirType.DAUGHTER_OF_SON,
            count: dosCount,
            fraction: 1 / 6,
            fractionLabel: '1/6',
            shareType: 'fard',
            legalBasis: 'السدس تكملة الثلثين مع البنت — النساء: ١١',
          ));
        }
      }
    }

    if (!_hasDescendants(activeHeirs) &&
        !hasFather &&
        !(_hasHeirType(activeHeirs, HeirType.GRANDFATHER_PATERNAL) && desc)) {
      if (_hasHeirType(activeHeirs, HeirType.FULL_SISTER) &&
          !_hasHeirType(activeHeirs, HeirType.FULL_BROTHER)) {
        final fsCount = _getHeirCount(activeHeirs, HeirType.FULL_SISTER);
        if (fsCount == 1) {
          shares.add(_FractionalShare(
            heirType: HeirType.FULL_SISTER,
            count: 1,
            fraction: 1 / 2,
            fractionLabel: '1/2',
            shareType: 'fard',
            legalBasis: 'النصف للأخت الشقيقة — النساء: ١١',
          ));
        } else if (fsCount >= 2) {
          shares.add(_FractionalShare(
            heirType: HeirType.FULL_SISTER,
            count: fsCount,
            fraction: 2 / 3,
            fractionLabel: '2/3',
            shareType: 'fard',
            legalBasis: 'الثلثان للأختين الشقيقتين فأكثر — النساء: ١١',
          ));
        }
      }

      if (_hasHeirType(activeHeirs, HeirType.PATERNAL_HALF_SISTER) &&
          !_hasHeirType(activeHeirs, HeirType.PATERNAL_HALF_BROTHER)) {
        final phsCount = _getHeirCount(activeHeirs, HeirType.PATERNAL_HALF_SISTER);
        final hasFullSister = _hasHeirType(activeHeirs, HeirType.FULL_SISTER);
        final fullSisterCount = _getHeirCount(activeHeirs, HeirType.FULL_SISTER);

        if (!hasFullSister) {
          if (phsCount == 1) {
            shares.add(_FractionalShare(
              heirType: HeirType.PATERNAL_HALF_SISTER,
              count: 1,
              fraction: 1 / 2,
              fractionLabel: '1/2',
              shareType: 'fard',
              legalBasis: 'النصف للأخت لأب — النساء: ١١',
            ));
          } else if (phsCount >= 2) {
            shares.add(_FractionalShare(
              heirType: HeirType.PATERNAL_HALF_SISTER,
              count: phsCount,
              fraction: 2 / 3,
              fractionLabel: '2/3',
              shareType: 'fard',
              legalBasis: 'الثلثان للأختين لأب فأكثر — النساء: ١١',
            ));
          }
        } else if (fullSisterCount == 1) {
          shares.add(_FractionalShare(
            heirType: HeirType.PATERNAL_HALF_SISTER,
            count: phsCount,
            fraction: 1 / 6,
            fractionLabel: '1/6',
            shareType: 'fard',
            legalBasis: 'السدس تكملة الثلثين مع الأخت الشقيقة — النساء: ١١',
          ));
        }
      }
    }

    if (_hasHeirType(activeHeirs, HeirType.MATERNAL_HALF_BROTHER) ||
        _hasHeirType(activeHeirs, HeirType.MATERNAL_HALF_SISTER)) {
      final mhbCount = _getHeirCount(activeHeirs, HeirType.MATERNAL_HALF_BROTHER);
      final mhsCount = _getHeirCount(activeHeirs, HeirType.MATERNAL_HALF_SISTER);
      final totalMaternal = mhbCount + mhsCount;
      if (totalMaternal > 0) {
        final double fraction = totalMaternal == 1 ? 1 / 6 : 1 / 3;
        final label = totalMaternal == 1 ? '1/6' : '1/3';
        final basis = totalMaternal == 1
            ? 'السدس للواحد من الإخوة لأم — النساء: ١٢'
            : 'الثلث للاثنين فأكثر من الإخوة لأم — النساء: ١٢';
        if (mhbCount > 0) {
          shares.add(_FractionalShare(
            heirType: HeirType.MATERNAL_HALF_BROTHER,
            count: mhbCount,
            fraction: fraction,
            fractionLabel: label,
            shareType: 'fard',
            legalBasis: basis,
          ));
        }
        if (mhsCount > 0) {
          shares.add(_FractionalShare(
            heirType: HeirType.MATERNAL_HALF_SISTER,
            count: mhsCount,
            fraction: fraction,
            fractionLabel: label,
            shareType: 'fard',
            legalBasis: basis,
          ));
        }
      }
    }

    return _FixedSharesResult(shares: shares, warnings: warnings);
  }

  static List<HeirShare> _distributeResiduary(
    List<HeirInput> activeHeirs,
    List<_FractionalShare> fixedShares,
    double remainder,
  ) {
    final List<HeirShare> results = [];
    if (remainder <= 0) return results;

    for (final heirType in residuaryPriority) {
      if (!_hasHeirType(activeHeirs, heirType)) continue;

      final existingFixed = fixedShares.any((s) => s.heirType == heirType);

      if (heirType == HeirType.SON) {
        final sonCount = _getHeirCount(activeHeirs, HeirType.SON);
        final daughterCount = _getHeirCount(activeHeirs, HeirType.DAUGHTER);
        if (sonCount > 0) {
          final totalUnits = sonCount * 2 + daughterCount;
          final perUnit = remainder / totalUnits;

          results.add(HeirShare(
            heirType: HeirType.SON,
            count: sonCount,
            shareType: "ta'sib",
            fraction: null,
            totalAmount: 0,
            perPersonAmount: 0,
            percentage: perUnit * 2 * 100,
            legalBasis: 'التعصيب بالغير للابن — يأخذ ضعف الأنثى',
          ));

          if (daughterCount > 0 && !fixedShares.any((s) => s.heirType == HeirType.DAUGHTER)) {
            results.add(HeirShare(
              heirType: HeirType.DAUGHTER,
              count: daughterCount,
              shareType: "ta'sib",
              fraction: null,
              totalAmount: 0,
              perPersonAmount: 0,
              percentage: perUnit * 100,
              legalBasis: 'التعصيب بالغير للبنت مع الابن — تأخذ نصف نصيب الابن',
            ));
          }
          break;
        }
      }

      if (heirType == HeirType.SON_OF_SON && !_hasHeirType(activeHeirs, HeirType.SON)) {
        final sosCount = _getHeirCount(activeHeirs, HeirType.SON_OF_SON);
        final dosCount = _getHeirCount(activeHeirs, HeirType.DAUGHTER_OF_SON);
        if (sosCount > 0) {
          final totalShares = sosCount + dosCount * 2;
          final sharePerUnit = remainder / totalShares;

          results.add(HeirShare(
            heirType: HeirType.SON_OF_SON,
            count: sosCount,
            shareType: "ta'sib",
            fraction: null,
            totalAmount: 0,
            perPersonAmount: 0,
            percentage: sharePerUnit * 100,
            legalBasis: 'التعصيب بالغير لابن الابن',
          ));

          if (dosCount > 0 && !fixedShares.any((s) => s.heirType == HeirType.DAUGHTER_OF_SON)) {
            results.add(HeirShare(
              heirType: HeirType.DAUGHTER_OF_SON,
              count: dosCount,
              shareType: "ta'sib",
              fraction: null,
              totalAmount: 0,
              perPersonAmount: 0,
              percentage: (sharePerUnit / 2) * 100,
              legalBasis: 'التعصيب بالغير لبنت الابن مع ابن الابن',
            ));
          }
          break;
        }
      }

      if (heirType == HeirType.FATHER && _hasHeirType(activeHeirs, HeirType.FATHER)) {
        results.add(HeirShare(
          heirType: HeirType.FATHER,
          count: 1,
          shareType: "ta'sib",
          fraction: null,
          totalAmount: 0,
          perPersonAmount: 0,
          percentage: remainder * 100,
          legalBasis: existingFixed
              ? 'السدس + التعصيب للأب مع الفرع الوارث — النساء: ١١'
              : 'التعصيب للأب عند عدم الفرع الوارث',
        ));
        break;
      }

      if (heirType == HeirType.GRANDFATHER_PATERNAL &&
          _hasHeirType(activeHeirs, HeirType.GRANDFATHER_PATERNAL) &&
          !_hasHeirType(activeHeirs, HeirType.FATHER)) {
        results.add(HeirShare(
          heirType: HeirType.GRANDFATHER_PATERNAL,
          count: 1,
          shareType: "ta'sib",
          fraction: null,
          totalAmount: 0,
          perPersonAmount: 0,
          percentage: remainder * 100,
          legalBasis: existingFixed
              ? 'السدس + التعصيب للجد (يقوم مقام الأب)'
              : 'التعصيب للجد عند عدم الأب والفرع',
        ));
        break;
      }

      if (heirType == HeirType.FULL_BROTHER && _hasHeirType(activeHeirs, HeirType.FULL_BROTHER)) {
        final count = _getHeirCount(activeHeirs, HeirType.FULL_BROTHER);
        final fullSisterCount = _getHeirCount(activeHeirs, HeirType.FULL_SISTER);
        final totalShares = count + fullSisterCount * 2;
        final sharePerUnit = remainder / totalShares;

        results.add(HeirShare(
          heirType: HeirType.FULL_BROTHER,
          count: count,
          shareType: "ta'sib",
          fraction: null,
          totalAmount: 0,
          perPersonAmount: 0,
          percentage: sharePerUnit * 100,
          legalBasis: 'التعصيب بالغير للأخ الشقيق',
        ));

        if (fullSisterCount > 0 && !fixedShares.any((s) => s.heirType == HeirType.FULL_SISTER)) {
          results.add(HeirShare(
            heirType: HeirType.FULL_SISTER,
            count: fullSisterCount,
            shareType: "ta'sib",
            fraction: null,
            totalAmount: 0,
            perPersonAmount: 0,
            percentage: (sharePerUnit / 2) * 100,
            legalBasis: 'التعصيب مع الغير للأخت الشقيقة مع الأخ',
          ));
        }
        break;
      }

      if (heirType == HeirType.FULL_SISTER &&
          _hasHeirType(activeHeirs, HeirType.FULL_SISTER) &&
          !_hasHeirType(activeHeirs, HeirType.FULL_BROTHER)) {
        if (_hasDescendants(activeHeirs) && !_hasMaleDescendants(activeHeirs)) {
          final count = _getHeirCount(activeHeirs, HeirType.FULL_SISTER);
          results.add(HeirShare(
            heirType: HeirType.FULL_SISTER,
            count: count,
            shareType: "ta'sib",
            fraction: null,
            totalAmount: 0,
            perPersonAmount: 0,
            percentage: (remainder / count) * 100,
            legalBasis: 'التعصيب مع الغير للأخت الشقيقة (مع الفرع المؤنث)',
          ));
          break;
        }
      }

      if (heirType == HeirType.PATERNAL_HALF_BROTHER &&
          _hasHeirType(activeHeirs, HeirType.PATERNAL_HALF_BROTHER) &&
          !_hasHeirType(activeHeirs, HeirType.FULL_BROTHER)) {
        final count = _getHeirCount(activeHeirs, HeirType.PATERNAL_HALF_BROTHER);
        final phsCount = _getHeirCount(activeHeirs, HeirType.PATERNAL_HALF_SISTER);
        final totalShares = count + phsCount * 2;
        final sharePerUnit = remainder / totalShares;

        results.add(HeirShare(
          heirType: HeirType.PATERNAL_HALF_BROTHER,
          count: count,
          shareType: "ta'sib",
          fraction: null,
          totalAmount: 0,
          perPersonAmount: 0,
          percentage: sharePerUnit * 100,
          legalBasis: 'التعصيب بالغير للأخ لأب',
        ));

        if (phsCount > 0 && !fixedShares.any((s) => s.heirType == HeirType.PATERNAL_HALF_SISTER)) {
          results.add(HeirShare(
            heirType: HeirType.PATERNAL_HALF_SISTER,
            count: phsCount,
            shareType: "ta'sib",
            fraction: null,
            totalAmount: 0,
            perPersonAmount: 0,
            percentage: (sharePerUnit / 2) * 100,
            legalBasis: 'التعصيب مع الغير للأخت لأب مع الأخ لأب',
          ));
        }
        break;
      }

      if (heirType == HeirType.PATERNAL_HALF_SISTER &&
          _hasHeirType(activeHeirs, HeirType.PATERNAL_HALF_SISTER) &&
          !_hasHeirType(activeHeirs, HeirType.PATERNAL_HALF_BROTHER)) {
        if (_hasDescendants(activeHeirs) &&
            !_hasMaleDescendants(activeHeirs) &&
            !_hasHeirType(activeHeirs, HeirType.FULL_SISTER)) {
          final count = _getHeirCount(activeHeirs, HeirType.PATERNAL_HALF_SISTER);
          results.add(HeirShare(
            heirType: HeirType.PATERNAL_HALF_SISTER,
            count: count,
            shareType: "ta'sib",
            fraction: null,
            totalAmount: 0,
            perPersonAmount: 0,
            percentage: (remainder / count) * 100,
            legalBasis: 'التعصيب مع الغير للأخت لأب (مع الفرع المؤنث)',
          ));
          break;
        }
      }

      if (heirType == HeirType.UNCLE_PATERNAL && _hasHeirType(activeHeirs, HeirType.UNCLE_PATERNAL)) {
        final count = _getHeirCount(activeHeirs, HeirType.UNCLE_PATERNAL);
        results.add(HeirShare(
          heirType: HeirType.UNCLE_PATERNAL,
          count: count,
          shareType: "ta'sib",
          fraction: null,
          totalAmount: 0,
          perPersonAmount: 0,
          percentage: (remainder / count) * 100,
          legalBasis: 'التعصيب للعم',
        ));
        break;
      }

      if (heirType == HeirType.NEPHEW_PATERNAL && _hasHeirType(activeHeirs, HeirType.NEPHEW_PATERNAL)) {
        final count = _getHeirCount(activeHeirs, HeirType.NEPHEW_PATERNAL);
        results.add(HeirShare(
          heirType: HeirType.NEPHEW_PATERNAL,
          count: count,
          shareType: "ta'sib",
          fraction: null,
          totalAmount: 0,
          perPersonAmount: 0,
          percentage: (remainder / count) * 100,
          legalBasis: 'التعصيب لابن الأخ',
        ));
        break;
      }
    }

    return results;
  }

  static InheritanceResult _calculateFaraidBase(
    double totalValue,
    double debts,
    double bequests,
    List<HeirInput> heirs,
  ) {
    final List<String> warnings = [];

    if (totalValue <= 0) {
      return InheritanceResult(
        shares: [],
        totalDistributed: 0,
        remainingEstate: 0,
        isOversubscribed: false,
        awlRate: null,
        warnings: ['قيمة التركة يجب أن تكون أكبر من صفر'],
      );
    }

    if (heirs.isEmpty) {
      return InheritanceResult(
        shares: [],
        totalDistributed: 0,
        remainingEstate: totalValue,
        isOversubscribed: false,
        awlRate: null,
        warnings: ['لم يتم إضافة أي ورثة'],
      );
    }

    final netEstate = max(0.0, totalValue - debts);
    final maxBequest = netEstate / 3;
    final actualBequests = min(bequests, maxBequest);
    final distributable = max(0.0, netEstate - actualBequests);

    if (bequests > maxBequest && bequests > 0) {
      warnings.add(
          'الوصية لا تتجاوز ثلث التركة. تم تقليصها من ${bequests.round()} إلى ${maxBequest.round()}');
    }

    final activeHeirs = _applyBlocking(heirs);

    if (activeHeirs.isEmpty) {
      return InheritanceResult(
        shares: [],
        totalDistributed: 0,
        remainingEstate: distributable,
        isOversubscribed: false,
        awlRate: null,
        warnings: ['جميع الورثة تم حجبهم — التركة لبيت المال'],
      );
    }

    final fixedResult = _assignFixedShares(activeHeirs);
    warnings.addAll(fixedResult.warnings);
    final fixedShares = fixedResult.shares;

    final totalFixedFraction = fixedShares.fold<double>(0, (sum, s) => sum + s.fraction);

    final residuaryShares = totalFixedFraction < 1
        ? _distributeResiduary(activeHeirs, fixedShares, 1 - totalFixedFraction)
        : <HeirShare>[];

    final List<HeirShare> allShares = [];
    bool isOversubscribed = false;
    double? awlRate;

    if (totalFixedFraction > 1) {
      isOversubscribed = true;
      awlRate = 1 / totalFixedFraction;
      warnings.add('حالة العول: إجمالي الفروض يتجاوز 1 — يتم تقليص جميع الأنصبة بنسبة متساوية');

      for (final fs in fixedShares) {
        final adjustedFraction = fs.fraction * awlRate;
        final totalAmount = adjustedFraction * distributable;
        allShares.add(HeirShare(
          heirType: fs.heirType,
          count: fs.count,
          shareType: fs.shareType,
          fraction: fs.fractionLabel,
          totalAmount: (totalAmount * 100).round() / 100,
          perPersonAmount: ((totalAmount / fs.count) * 100).round() / 100,
          percentage: (adjustedFraction * 10000).round() / 100,
          legalBasis: fs.legalBasis,
        ));
      }
    } else {
      for (final fs in fixedShares) {
        final totalAmount = fs.fraction * distributable;
        allShares.add(HeirShare(
          heirType: fs.heirType,
          count: fs.count,
          shareType: fs.shareType,
          fraction: fs.fractionLabel,
          totalAmount: (totalAmount * 100).round() / 100,
          perPersonAmount: ((totalAmount / fs.count) * 100).round() / 100,
          percentage: (fs.fraction * 10000).round() / 100,
          legalBasis: fs.legalBasis,
        ));
      }

      for (final rs in residuaryShares) {
        final totalAmount = (rs.percentage / 100) * distributable;
        allShares.add(HeirShare(
          heirType: rs.heirType,
          count: rs.count,
          shareType: rs.shareType,
          fraction: null,
          totalAmount: (totalAmount * 100).round() / 100,
          perPersonAmount: ((totalAmount / rs.count) * 100).round() / 100,
          percentage: rs.percentage,
          legalBasis: rs.legalBasis,
        ));
      }
    }

    // Apply Ar-Radd (if totalFixedFraction < 1 and no residuaries)
    if (totalFixedFraction < 1 && residuaryShares.isEmpty) {
      final remainingFraction = 1 - totalFixedFraction;
      final raddEligibleShares =
          allShares.where((s) => raddEligible.contains(s.heirType)).toList();

      final effectiveRaddEligible = raddEligibleShares.isNotEmpty
          ? raddEligibleShares
          : allShares.where((s) => s.heirType == HeirType.HUSBAND || s.heirType == HeirType.WIFE).toList();

      if (effectiveRaddEligible.isNotEmpty && remainingFraction > 0) {
        final totalRaddSharesPercentage =
            effectiveRaddEligible.fold<double>(0, (sum, s) => sum + s.percentage);

        if (totalRaddSharesPercentage > 0) {
          final remainingAmount = remainingFraction * distributable;
          for (final share in allShares) {
            if (effectiveRaddEligible.contains(share)) {
              final proportion = share.percentage / totalRaddSharesPercentage;
              final raddAmount = remainingAmount * proportion;
              share.totalAmount = ((share.totalAmount + raddAmount) * 100).round() / 100;
              share.perPersonAmount = ((share.totalAmount / share.count) * 100).round() / 100;
              share.percentage =
                  ((share.percentage + (remainingFraction * proportion * 100)) * 100).round() / 100;
              share.shareType = share.shareType == 'fard' ? 'fard_radd' : 'radd';
              share.legalBasis += ' + رد';
            }
          }
          warnings.add('تم توزيع الباقي (الرد) على المستحقين');
        }
      }
    }

    final totalDistributed = allShares.fold<double>(0, (sum, s) => sum + s.totalAmount);
    final remainingEstate = max(0.0, ((distributable - totalDistributed) * 100).round() / 100);

    return InheritanceResult(
      shares: allShares,
      totalDistributed: (totalDistributed * 100).round() / 100,
      remainingEstate: remainingEstate,
      isOversubscribed: isOversubscribed,
      awlRate: awlRate,
      warnings: warnings,
    );
  }

  // Main calculate method that handles Wasiyya Wajiba (Mandatory Bequest)
  static InheritanceResult calculate(
    double totalValue,
    double debts,
    double bequests,
    List<HeirInput> heirs,
  ) {
    final activeHeirs = _applyBlocking(heirs);
    final hasBlockedGrandchildren =
        (_hasHeirType(heirs, HeirType.SON_OF_SON) && !_hasHeirType(activeHeirs, HeirType.SON_OF_SON)) ||
            (_hasHeirType(heirs, HeirType.DAUGHTER_OF_SON) &&
                !_hasHeirType(activeHeirs, HeirType.DAUGHTER_OF_SON));

    double wwAmount = 0;
    final List<HeirShare> wwShares = [];

    if (hasBlockedGrandchildren) {
      // Calculate hypothetical shares by adding a virtual son representing the deceased parent
      final List<HeirInput> hypoHeirs = heirs.map((h) => h.copy()).toList();
      final hasSon = hypoHeirs.any((h) => h.type == HeirType.SON);
      if (hasSon) {
        hypoHeirs.firstWhere((h) => h.type == HeirType.SON).count += 1;
      } else {
        hypoHeirs.add(HeirInput(type: HeirType.SON, count: 1));
      }
      hypoHeirs.removeWhere((h) => h.type == HeirType.SON_OF_SON || h.type == HeirType.DAUGHTER_OF_SON);

      final hypoResult = _calculateFaraidBase(totalValue, debts, 0, hypoHeirs);

      final sonShareMatch = hypoResult.shares.where((s) => s.heirType == HeirType.SON);
      if (sonShareMatch.isNotEmpty) {
        final sonShare = sonShareMatch.first;
        final oneSonAmount = sonShare.totalAmount / sonShare.count;
        final netEstate = max(0.0, totalValue - debts);
        final maxWw = netEstate / 3;
        final actualWw = min(oneSonAmount, maxWw);

        final sosCount = _getHeirCount(heirs, HeirType.SON_OF_SON);
        final dosCount = _getHeirCount(heirs, HeirType.DAUGHTER_OF_SON);
        final totalUnits = sosCount * 2 + dosCount;

        if (totalUnits > 0) {
          final perUnit = actualWw / totalUnits;
          if (sosCount > 0) {
            wwShares.add(HeirShare(
              heirType: HeirType.SON_OF_SON,
              count: sosCount,
              shareType: 'wasiyya_wajiba',
              fraction: null,
              totalAmount: (perUnit * 2 * sosCount * 100).round() / 100,
              perPersonAmount: (perUnit * 2 * 100).round() / 100,
              percentage: ((perUnit * 2 * sosCount / netEstate) * 10000).round() / 100,
              legalBasis: 'الوصية الواجبة لابن الابن (بمقدار حصة والده أو الثلث أيهما أقل)',
            ));
          }
          if (dosCount > 0) {
            wwShares.add(HeirShare(
              heirType: HeirType.DAUGHTER_OF_SON,
              count: dosCount,
              shareType: 'wasiyya_wajiba',
              fraction: null,
              totalAmount: (perUnit * dosCount * 100).round() / 100,
              perPersonAmount: (perUnit * 100).round() / 100,
              percentage: ((perUnit * dosCount / netEstate) * 10000).round() / 100,
              legalBasis: 'الوصية الواجبة لبنت الابن (بمقدار حصة والدها أو الثلث أيهما أقل)',
            ));
          }
          wwAmount = wwShares.fold<double>(0, (sum, s) => sum + s.totalAmount);
        }
      }
    }

    final netEstateBeforeWw = max(0.0, totalValue - debts);
    final maxOptionalBequest = netEstateBeforeWw / 3;
    final allowedOptionalBequest = maxOptionalBequest - wwAmount;
    final actualOptionalBequest = min(bequests, max(0.0, allowedOptionalBequest));

    final realResult = _calculateFaraidBase(
      totalValue,
      debts + wwAmount, // Treat wwAmount as debt to be deducted first
      actualOptionalBequest,
      heirs,
    );

    if (wwShares.isNotEmpty) {
      realResult.shares
          .removeWhere((s) => s.heirType == HeirType.SON_OF_SON || s.heirType == HeirType.DAUGHTER_OF_SON);
      realResult.shares.insertAll(0, wwShares);
      final double newTotalDist = realResult.totalDistributed + wwAmount;
      // Constructing updated fields
      final updatedResult = InheritanceResult(
        shares: realResult.shares,
        totalDistributed: (newTotalDist * 100).round() / 100,
        remainingEstate: realResult.remainingEstate,
        isOversubscribed: realResult.isOversubscribed,
        awlRate: realResult.awlRate,
        warnings: [
          if (wwAmount > 0) 'تم اقتطاع الوصية الواجبة للأحفاد بقيمة ${wwAmount.round()} جنيه قبل التقسيم الشرعي.',
          ...realResult.warnings,
        ],
      );

      final originalNetEstate = max(0.0, totalValue - debts);
      for (final share in updatedResult.shares) {
        if (share.shareType != 'wasiyya_wajiba' && originalNetEstate > 0) {
          share.percentage = (share.totalAmount / originalNetEstate * 10000).round() / 100;
        }
      }
      return updatedResult;
    }

    return realResult;
  }
}

class _FractionalShare {
  _FractionalShare({
    required this.heirType,
    required this.count,
    required this.fraction,
    required this.fractionLabel,
    required this.shareType,
    required this.legalBasis,
  });

  final HeirType heirType;
  final int count;
  final double fraction;
  final String fractionLabel;
  final String shareType;
  final String legalBasis;
}

class _FixedSharesResult {
  _FixedSharesResult({required this.shares, required this.warnings});

  final List<_FractionalShare> shares;
  final List<String> warnings;
}
