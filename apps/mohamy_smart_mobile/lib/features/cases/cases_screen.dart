import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../core/models/legal_models.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/empty_state.dart';
import '../../core/widgets/legal_cards.dart';
import 'add_case_screen.dart';
import 'case_details_screen.dart';

class CasesScreen extends StatefulWidget {
  const CasesScreen({required this.appState, super.key});

  final AppState appState;

  @override
  State<CasesScreen> createState() => _CasesScreenState();
}

class _CasesScreenState extends State<CasesScreen> {
  int _selectedFilterIndex = 0;
  bool _isSearching = false;
  final TextEditingController _searchController = TextEditingController();

  final List<String> _filters = const <String>[
    'الكل',
    'قضايا جنائية',
    'قضايا مدنية',
    'أحوال شخصية',
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<LegalCase> _getFilteredCases(List<LegalCase> cases) {
    // 1. First apply search query if searching
    List<LegalCase> searchResult = cases;
    final query = widget.appState.caseSearchQuery.trim().toLowerCase();
    if (query.isNotEmpty) {
      searchResult = cases.where((legalCase) {
        final haystack = <String>[
          legalCase.caseNumber,
          legalCase.title,
          legalCase.clientName,
          legalCase.court,
          legalCase.caseType,
        ].join(' ').toLowerCase();
        return haystack.contains(query);
      }).toList();
    }

    // 2. Apply category filters
    if (_selectedFilterIndex == 0) {
      return searchResult;
    } else if (_selectedFilterIndex == 1) {
      // Criminal
      return searchResult.where((c) {
        final type = c.caseType.toLowerCase();
        return type.contains('جنايات') ||
            type.contains('تزوير') ||
            type.contains('جنائي');
      }).toList();
    } else if (_selectedFilterIndex == 2) {
      // Civil / Commercial
      return searchResult.where((c) {
        final type = c.caseType.toLowerCase();
        return type.contains('تجاري') ||
            type.contains('استئناف') ||
            type.contains('تنفيذ') ||
            type.contains('مدني');
      }).toList();
    } else if (_selectedFilterIndex == 3) {
      // Personal Status
      return searchResult.where((c) {
        final type = c.caseType.toLowerCase();
        return type.contains('أحوال') || type.contains('شخصية');
      }).toList();
    }

    return searchResult;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final allCases = widget.appState.cases;
    final filteredCases = _getFilteredCases(allCases);

    final scaffoldBg = isDark ? AppColors.darkBg : const Color(0xFFFBF9F2);
    final textColor = isDark ? Colors.white : AppColors.lightTitle;
    final mutedTextColor = isDark ? AppColors.darkMuted : AppColors.lightMuted;
    final borderColor = isDark ? AppColors.darkBorder : AppColors.lightBorder;

    // Statistics calculation
    final totalCount = allCases.length;
    final activeCount = allCases
        .where(
          (c) =>
              c.status == CaseStatus.active || c.status == CaseStatus.pending,
        )
        .length;
    final completedCount = allCases
        .where((c) => c.status == CaseStatus.completed)
        .length;

    return Scaffold(
      backgroundColor: scaffoldBg,
      appBar: AppBar(
        backgroundColor: isDark
            ? AppColors.darkSurface.withValues(alpha: 0.8)
            : AppColors.lightSurfaceMuted.withValues(alpha: 0.8),
        elevation: 0,
        leading: _isSearching
            ? null
            : IconButton(
                icon: const Icon(Icons.menu),
                color: isDark ? Colors.white70 : Colors.black87,
                onPressed: () {},
              ),
        title: _isSearching
            ? TextField(
                controller: _searchController,
                autofocus: true,
                key: const Key('case_search_field'),
                onChanged: widget.appState.setCaseSearchQuery,
                style: TextStyle(color: textColor, fontSize: 16),
                decoration: const InputDecoration(
                  hintText: 'ابحث برقم القضية أو اسم العميل...',
                  border: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  hintStyle: TextStyle(color: Colors.grey),
                ),
              )
            : const Text(
                'القضايا',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
        actions: <Widget>[
          IconButton(
            icon: Icon(_isSearching ? Icons.close : Icons.search),
            color: AppColors.primary,
            onPressed: () {
              setState(() {
                if (_isSearching) {
                  _isSearching = false;
                  _searchController.clear();
                  widget.appState.setCaseSearchQuery('');
                } else {
                  _isSearching = true;
                }
              });
            },
          ),
          IconButton(
            icon: const Icon(Icons.filter_list),
            color: mutedTextColor,
            onPressed: () {},
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        key: const Key('add_case_button'),
        onPressed: () => Navigator.of(context).push(
          MaterialPageRoute<void>(
            builder: (_) => AddCaseScreen(appState: widget.appState),
          ),
        ),
        shape: const CircleBorder(),
        elevation: 4,
        backgroundColor: AppColors.primary,
        child: Container(
          width: 56,
          height: 56,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            gradient: AppColors.mainGradient,
            boxShadow: <BoxShadow>[
              BoxShadow(
                color: Color(0x4DEF950A),
                blurRadius: 24,
                offset: Offset(0, 12),
              ),
            ],
          ),
          child: const Icon(Icons.add, color: Colors.white, size: 28),
        ),
      ),
      floatingActionButtonLocation: const OffsetStartFloatLocation(),
      body: ListView(
        padding: const EdgeInsets.only(
          left: 16,
          right: 16,
          top: 16,
          bottom: 100,
        ),
        children: <Widget>[
          // Statistics Summary Bar
          Container(
            decoration: BoxDecoration(
              color: isDark
                  ? AppColors.darkSurfaceSoft
                  : const Color(0xFFF6F4EC),
              borderRadius: BorderRadius.circular(24),
              border: isDark ? Border.all(color: borderColor, width: 1) : null,
              boxShadow: isDark
                  ? null
                  : const [
                      BoxShadow(
                        color: Color(0x0F885200),
                        blurRadius: 32,
                        offset: Offset(0, 12),
                      ),
                    ],
            ),
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: <Widget>[
                Column(
                  children: <Widget>[
                    Text(
                      'إجمالي',
                      style: TextStyle(color: mutedTextColor, fontSize: 11),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '$totalCount',
                      style: TextStyle(
                        color: textColor,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Container(width: 1, height: 32, color: borderColor),
                Column(
                  children: <Widget>[
                    Text(
                      'نشطة',
                      style: TextStyle(color: mutedTextColor, fontSize: 11),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '$activeCount',
                      style: TextStyle(
                        color: AppColors.primary,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Container(width: 1, height: 32, color: borderColor),
                Column(
                  children: <Widget>[
                    Text(
                      'منتهية',
                      style: TextStyle(color: mutedTextColor, fontSize: 11),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '$completedCount',
                      style: TextStyle(
                        color: mutedTextColor,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // Horizontal Category Filter Chips
          SizedBox(
            height: 40,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _filters.length,
              separatorBuilder: (context, index) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final isSelected = _selectedFilterIndex == index;
                return InkWell(
                  onTap: () {
                    setState(() {
                      _selectedFilterIndex = index;
                    });
                  },
                  borderRadius: BorderRadius.circular(999),
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: isSelected ? AppColors.mainGradient : null,
                      color: isSelected
                          ? null
                          : (isDark
                                ? AppColors.darkSurfaceSoft
                                : const Color(0xFFF0EEE7)),
                      borderRadius: BorderRadius.circular(999),
                      border: isDark
                          ? Border.all(
                              color: isSelected
                                  ? Colors.transparent
                                  : borderColor,
                              width: 1,
                            )
                          : null,
                      boxShadow: (isSelected && !isDark)
                          ? const [
                              BoxShadow(
                                color: Color(0x0F885200),
                                blurRadius: 32,
                                offset: Offset(0, 12),
                              ),
                            ]
                          : null,
                    ),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 8,
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      _filters[index],
                      style: TextStyle(
                        color: isSelected ? Colors.white : textColor,
                        fontSize: 13,
                        fontWeight: isSelected
                            ? FontWeight.bold
                            : FontWeight.w500,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 20),
          // Case List
          if (filteredCases.isEmpty)
            EmptyState(
              icon: Icons.search_off,
              title: 'لا توجد نتائج مطابقة',
              message: 'جرب البحث برقم القضية أو اسم العميل بطريقة مختلفة.',
              actionLabel: 'مسح البحث والفلترة',
              onAction: () {
                setState(() {
                  _selectedFilterIndex = 0;
                  _isSearching = false;
                  _searchController.clear();
                  widget.appState.setCaseSearchQuery('');
                });
              },
            )
          else
            ...filteredCases.map(
              (legalCase) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: CaseCard(
                  legalCase: legalCase,
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute<void>(
                      builder: (_) => CaseDetailsScreen(
                        appState: widget.appState,
                        legalCase: legalCase,
                      ),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
