// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_card.dart';
import 'engine/inheritance_engine.dart';

class InheritanceCalculatorScreen extends StatefulWidget {
  const InheritanceCalculatorScreen({super.key});

  @override
  State<InheritanceCalculatorScreen> createState() =>
      _InheritanceCalculatorScreenState();
}

class _InheritanceCalculatorScreenState
    extends State<InheritanceCalculatorScreen> {
  final _estateController = TextEditingController(text: '1000000');
  final _debtsController = TextEditingController(text: '0');
  final _bequestsController = TextEditingController(text: '0');
  final List<HeirInput> _heirs = [];

  HeirType _selectedHeirType = HeirType.SON;
  final _heirCountController = TextEditingController(text: '1');

  InheritanceResult? _result;

  @override
  void dispose() {
    _estateController.dispose();
    _debtsController.dispose();
    _bequestsController.dispose();
    _heirCountController.dispose();
    super.dispose();
  }

  void _addHeir() {
    final count = int.tryParse(_heirCountController.text) ?? 1;
    if (count <= 0) return;

    setState(() {
      // Check if heir type already exists
      final existingIndex = _heirs.indexWhere(
        (h) => h.type == _selectedHeirType,
      );
      if (existingIndex >= 0) {
        _heirs[existingIndex].count += count;
      } else {
        _heirs.add(HeirInput(type: _selectedHeirType, count: count));
      }
    });
  }

  void _removeHeir(int index) {
    setState(() {
      _heirs.removeAt(index);
    });
  }

  void _calculate() {
    final estate = double.tryParse(_estateController.text) ?? 0.0;
    final debts = double.tryParse(_debtsController.text) ?? 0.0;
    final bequests = double.tryParse(_bequestsController.text) ?? 0.0;

    if (estate <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('الرجاء إدخال قيمة تركة صحيحة')),
      );
      return;
    }

    if (_heirs.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('الرجاء إضافة وريث واحد على الأقل')),
      );
      return;
    }

    setState(() {
      // Re-map inputs to fresh list to avoid mutating during calculation
      final heirsCopy = _heirs.map((h) => h.copy()).toList();
      _result = InheritanceEngine.calculate(estate, debts, bequests, heirsCopy);
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final themeTokens = Theme.of(context).extension<MohamyThemeTokens>()!;

    return Scaffold(
      appBar: AppBar(
        title: const Text('حاسبة المواريث الشرعية'),
        centerTitle: true,
      ),
      body: Directionality(
        textDirection: TextDirection.rtl,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Net Estate Inputs Card
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'بيانات التركة والالتزامات',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w900,
                      color: AppColors.primaryBronze,
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _estateController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'إجمالي التركة (جنيه/ريال)',
                      prefixIcon: Icon(Icons.monetization_on_outlined),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _debtsController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                            labelText: 'الديون والرهون',
                            prefixIcon: Icon(Icons.money_off_outlined),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextField(
                          controller: _bequestsController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                            labelText: 'الوصايا الاختيارية',
                            prefixIcon: Icon(
                              Icons.assignment_turned_in_outlined,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Heirs Selection Card
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'إضافة الورثة المستحقين',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w900,
                      color: AppColors.primaryBronze,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        flex: 3,
                        child: DropdownButtonFormField<HeirType>(
                          value: _selectedHeirType,
                          decoration: const InputDecoration(
                            labelText: 'صلة القرابة',
                          ),
                          dropdownColor: isDark
                              ? AppColors.darkSurface
                              : Colors.white,
                          items: HeirType.values.map((type) {
                            return DropdownMenuItem<HeirType>(
                              value: type,
                              child: Text(type.arabicLabel),
                            );
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) {
                              setState(() {
                                _selectedHeirType = val;
                              });
                            }
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        flex: 2,
                        child: TextField(
                          controller: _heirCountController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(labelText: 'العدد'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton.icon(
                    onPressed: _addHeir,
                    icon: const Icon(Icons.add, color: Colors.white),
                    label: const Text('إضافة إلى قائمة الورثة'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryBronze,
                    ),
                  ),
                  if (_heirs.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    const Divider(),
                    const SizedBox(height: 8),
                    Text(
                      'الورثة المضافون:',
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _heirs.length,
                      itemBuilder: (context, index) {
                        final heir = _heirs[index];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: isDark
                                ? AppColors.darkSurfaceSoft
                                : AppColors.lightSurfaceMuted,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: themeTokens.border),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '${heir.type.arabicLabel} (العدد: ${heir.count})',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              IconButton(
                                icon: const Icon(
                                  Icons.delete_outline,
                                  color: AppColors.danger,
                                ),
                                onPressed: () => _removeHeir(index),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ],
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
                'احسب المواريث والأنصبة',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
              ),
            ),
            const SizedBox(height: 24),

            // Result Card
            if (_result != null) ...[
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          Icons.analytics_outlined,
                          color: AppColors.primary,
                          size: 28,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'نتائج التوزيع الشرعي',
                          style: Theme.of(context).textTheme.titleLarge
                              ?.copyWith(fontWeight: FontWeight.w900),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Net Estate Summary
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        children: [
                          _buildSummaryRow(
                            'إجمالي التركة الموزعة:',
                            '${_result!.totalDistributed.toStringAsFixed(2)} جنيه/ريال',
                          ),
                          if (_result!.remainingEstate > 0)
                            _buildSummaryRow(
                              'المتبقي لبيت المال:',
                              '${_result!.remainingEstate.toStringAsFixed(2)} جنيه/ريال',
                            ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Warnings/Notes if any
                    if (_result!.warnings.isNotEmpty) ...[
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.danger.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: AppColors.danger.withValues(alpha: 0.2),
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: _result!.warnings.map((warn) {
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 6),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Icon(
                                    Icons.warning_amber_rounded,
                                    color: AppColors.danger,
                                    size: 18,
                                  ),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: Text(
                                      warn,
                                      style: const TextStyle(
                                        color: AppColors.danger,
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],

                    Text(
                      'أنصبة الورثة التفصيلية:',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Shares List
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _result!.shares.length,
                      itemBuilder: (context, index) {
                        final share = _result!.shares[index];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: isDark
                                ? AppColors.darkSurfaceSoft
                                : AppColors.lightSurface,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: themeTokens.border),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    '${share.heirType.arabicLabel} (العدد: ${share.count})',
                                    style: const TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w900,
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 8,
                                      vertical: 3,
                                    ),
                                    decoration: BoxDecoration(
                                      color: AppColors.primary.withValues(
                                        alpha: 0.12,
                                      ),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      '${share.percentage.toStringAsFixed(1)}%',
                                      style: const TextStyle(
                                        color: AppColors.primary,
                                        fontWeight: FontWeight.w900,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              _buildShareDetailRow(
                                'نصيب الفرد الواحد:',
                                '${share.perPersonAmount.toStringAsFixed(2)} جنيه/ريال',
                              ),
                              _buildShareDetailRow(
                                'إجمالي نصيب الفئة:',
                                '${share.totalAmount.toStringAsFixed(2)} جنيه/ريال',
                              ),
                              if (share.fraction != null)
                                _buildShareDetailRow(
                                  'الفرض الشرعي المقدر:',
                                  share.fraction!,
                                ),
                              const SizedBox(height: 6),
                              Text(
                                'السند الشرعي: ${share.legalBasis}',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: themeTokens.muted,
                                  height: 1.4,
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
          Text(
            value,
            style: const TextStyle(
              fontWeight: FontWeight.w900,
              color: AppColors.primaryBronze,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildShareDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
          const SizedBox(width: 8),
          Text(
            value,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}
