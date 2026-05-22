import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../core/models/legal_models.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_card.dart';
import '../../core/widgets/empty_state.dart';
import '../clients/clients_screen.dart';
import '../documents/documents_screen.dart';
import '../settings/settings_screen.dart';
import '../subscription/subscription_screen.dart';
import '../legal_library/inheritance_calculator_screen.dart';
import '../legal_library/court_fees_calculator_screen.dart';

class MoreScreen extends StatelessWidget {
  const MoreScreen({required this.appState, super.key});

  final AppState appState;

  @override
  Widget build(BuildContext context) {
    final items = <_MoreItem>[
      _MoreItem(
        icon: Icons.people_outline,
        title: 'العملاء',
        builder: (_) => ClientsScreen(appState: appState),
      ),
      _MoreItem(
        icon: Icons.description_outlined,
        title: 'المستندات',
        builder: (_) => DocumentsScreen(appState: appState),
      ),
      _MoreItem(
        icon: Icons.menu_book_outlined,
        title: 'المكتبة القانونية',
        builder: (_) => LegalLibraryScreen(appState: appState),
      ),
      _MoreItem(
        icon: Icons.edit_document,
        title: 'العقود القانونية',
        builder: (_) => const LegalContractsScreen(),
      ),
      _MoreItem(
        icon: Icons.local_shipping_outlined,
        title: 'أوراق المحضرين',
        builder: (_) => const ProcessServerScreen(),
      ),
      _MoreItem(
        icon: Icons.auto_awesome,
        title: 'الاشتراك والنقاط',
        builder: (_) => SubscriptionScreen(appState: appState),
      ),
      _MoreItem(
        icon: Icons.settings_outlined,
        title: 'الإعدادات',
        builder: (_) => SettingsScreen(appState: appState),
      ),
      _MoreItem(
        icon: Icons.info_outline,
        title: 'حالات النظام',
        builder: (_) => const SystemStatesScreen(),
      ),
    ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: <Widget>[
        Text(
          'المزيد',
          style: Theme.of(
            context,
          ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 14),
        ...items.map(
          (item) => Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: AppCard(
              onTap: () => Navigator.of(
                context,
              ).push(MaterialPageRoute<void>(builder: item.builder)),
              child: Row(
                children: <Widget>[
                  Icon(item.icon, color: AppColors.primary),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      item.title,
                      style: const TextStyle(fontWeight: FontWeight.w800),
                    ),
                  ),
                  const Icon(Icons.chevron_left),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

// ---------------------------------------------
// Interactive Legal Library Screen
// ---------------------------------------------
class LegalLibraryScreen extends StatelessWidget {
  const LegalLibraryScreen({required this.appState, super.key});

  final AppState appState;

  @override
  Widget build(BuildContext context) {
    final themeTokens = Theme.of(context).extension<MohamyThemeTokens>()!;

    final libraryItems = [
      {
        'title': 'حاسبة المواريث الشرعية',
        'desc': 'توزيع الأنصبة والتركات وفق الشريعة الإسلامية مع الوصية الواجبة والعول والرد.',
        'icon': Icons.calculate_outlined,
        'page': const InheritanceCalculatorScreen(),
      },
      {
        'title': 'حاسبة الرسوم القضائية',
        'desc': 'حساب رسوم الدعاوى المدنية، الشرعية، التنفيذ، النفقة، رسوم الإيداع والمحضرين.',
        'icon': Icons.receipt_long_outlined,
        'page': const CourtFeesCalculatorScreen(),
      },
      {
        'title': 'الوكالات الرسمية (POA)',
        'desc': 'إدارة وتتبع أرقام الوكالات وتواريخ إصدارها وربطها بالموكلين والقضايا.',
        'icon': Icons.assignment_ind_outlined,
        'page': PowerOfAttorneysListScreen(appState: appState),
      },
      {
        'title': 'اللوائح والأنظمة الداخلية',
        'desc': 'استعراض اللوائح المنظمة وقواعد صياغة المذكرات وتحديثاتها الإدارية.',
        'icon': Icons.gavel_outlined,
        'page': InternalRegulationsListScreen(appState: appState),
      },
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('المكتبة القانونية'), centerTitle: true),
      body: Directionality(
        textDirection: TextDirection.rtl,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: libraryItems.map((item) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: AppCard(
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute<void>(builder: (_) => item['page'] as Widget),
                  );
                },
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Icon(item['icon'] as IconData, color: AppColors.primary, size: 28),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item['title'] as String,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            item['desc'] as String,
                            style: TextStyle(
                              fontSize: 12,
                              color: themeTokens.muted,
                              height: 1.4,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Align(
                      alignment: Alignment.center,
                      child: Icon(Icons.chevron_left, color: AppColors.primary),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}

// ---------------------------------------------
// Interactive Power of Attorneys List Screen
// ---------------------------------------------
class PowerOfAttorneysListScreen extends StatefulWidget {
  const PowerOfAttorneysListScreen({required this.appState, super.key});

  final AppState appState;

  @override
  State<PowerOfAttorneysListScreen> createState() => _PowerOfAttorneysListScreenState();
}

class _PowerOfAttorneysListScreenState extends State<PowerOfAttorneysListScreen> {
  void _addNewPoa() {
    final numController = TextEditingController();
    final typeController = TextEditingController(text: 'توكيل رسمي عام قضايا');
    final dateController = TextEditingController(text: '2026-05-22');
    Client? selectedClient;

    if (widget.appState.clients.isNotEmpty) {
      selectedClient = widget.appState.clients.first;
    }

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).cardColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return Directionality(
          textDirection: TextDirection.rtl,
          child: Padding(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom + 20,
              left: 20,
              right: 20,
              top: 20,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'إضافة توكيل رسمي جديد',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        fontFamily: 'Tajawal',
                      ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: numController,
                  decoration: const InputDecoration(labelText: 'رقم التوكيل الرسمي'),
                  keyboardType: TextInputType.number,
                  style: const TextStyle(fontFamily: 'Tajawal'),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<Client>(
                  decoration: const InputDecoration(labelText: 'اسم الموكل'),
                  value: selectedClient,
                  items: widget.appState.clients.map((Client client) {
                    return DropdownMenuItem<Client>(
                      value: client,
                      child: Text(client.name, style: const TextStyle(fontFamily: 'Tajawal')),
                    );
                  }).toList(),
                  onChanged: (Client? value) {
                    selectedClient = value;
                  },
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: typeController,
                  decoration: const InputDecoration(labelText: 'نوع التوكيل'),
                  style: const TextStyle(fontFamily: 'Tajawal'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: dateController,
                  decoration: const InputDecoration(labelText: 'تاريخ الإصدار (YYYY-MM-DD)'),
                  style: const TextStyle(fontFamily: 'Tajawal'),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      if (numController.text.isEmpty || selectedClient == null) return;
                      widget.appState.addPowerOfAttorney(
                        PowerOfAttorney(
                          id: 'poa-${DateTime.now().millisecondsSinceEpoch}',
                          number: numController.text,
                          clientId: selectedClient!.id,
                          clientName: selectedClient!.name,
                          dateLabel: dateController.text,
                          type: typeController.text,
                          status: 'نشط',
                        ),
                      );
                      Navigator.pop(context);
                    },
                    child: const Text('حفظ التوكيل', style: TextStyle(fontFamily: 'Tajawal', fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _cancelPoaDialog(PowerOfAttorney poa) {
    String selectedReason = 'إلغاء من الموكل';
    final otherReasonController = TextEditingController();

    showDialog<void>(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return Directionality(
              textDirection: TextDirection.rtl,
              child: AlertDialog(
                title: const Text('إلغاء الوكالة الرسمية', style: TextStyle(fontFamily: 'Tajawal', fontWeight: FontWeight.w900)),
                content: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text('يرجى تحديد المسوغ الشرعي والقانوني لإلغاء التوكيل:', style: TextStyle(fontFamily: 'Tajawal', fontSize: 13)),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      value: selectedReason,
                      decoration: const InputDecoration(labelText: 'سبب الإلغاء'),
                      items: const [
                        DropdownMenuItem(value: 'وفاة الموكل', child: Text('وفاة الموكل', style: TextStyle(fontFamily: 'Tajawal'))),
                        DropdownMenuItem(value: 'إلغاء من الموكل', child: Text('إلغاء من الموكل (عزل)', style: TextStyle(fontFamily: 'Tajawal'))),
                        DropdownMenuItem(value: 'انتهاء المدة', child: Text('انتهاء المدة والهدف', style: TextStyle(fontFamily: 'Tajawal'))),
                        DropdownMenuItem(value: 'سبب آخر', child: Text('سبب آخر', style: TextStyle(fontFamily: 'Tajawal'))),
                      ],
                      onChanged: (val) {
                        if (val != null) {
                          setDialogState(() {
                            selectedReason = val;
                          });
                        }
                      },
                    ),
                    if (selectedReason == 'سبب آخر') ...[
                      const SizedBox(height: 10),
                      TextField(
                        controller: otherReasonController,
                        decoration: const InputDecoration(labelText: 'اكتب السبب بالتفصيل'),
                        style: const TextStyle(fontFamily: 'Tajawal'),
                      ),
                    ],
                  ],
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('تراجع', style: TextStyle(fontFamily: 'Tajawal')),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      final reason = selectedReason == 'سبب آخر' ? otherReasonController.text : selectedReason;
                      widget.appState.cancelPowerOfAttorney(poa.id, reason);
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('تم إلغاء الوكالة رقم ${poa.number} بنجاح', style: const TextStyle(fontFamily: 'Tajawal'))),
                      );
                    },
                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
                    child: const Text('تأكيد الإلغاء', style: TextStyle(color: Colors.white, fontFamily: 'Tajawal', fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final themeTokens = Theme.of(context).extension<MohamyThemeTokens>()!;

    return ListenableBuilder(
      listenable: widget.appState,
      builder: (context, _) {
        final poas = widget.appState.powerOfAttorneys;
        return Scaffold(
          appBar: AppBar(title: const Text('الوكالات الرسمية (POA)')),
          floatingActionButton: FloatingActionButton(
            onPressed: _addNewPoa,
            backgroundColor: AppColors.primaryBronze,
            child: const Icon(Icons.add, color: Colors.white),
          ),
          body: Directionality(
            textDirection: TextDirection.rtl,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: poas.length,
              itemBuilder: (context, index) {
                final poa = poas[index];
                final isActive = poa.status == 'نشط';

                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: AppCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'رقم الوكالة: ${poa.number}',
                              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: isActive
                                    ? AppColors.success.withValues(alpha: 0.12)
                                    : (poa.status == 'ملغي'
                                        ? AppColors.danger.withValues(alpha: 0.12)
                                        : Colors.grey.withValues(alpha: 0.12)),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                poa.status,
                                style: TextStyle(
                                  color: isActive
                                      ? AppColors.success
                                      : (poa.status == 'ملغي' ? AppColors.danger : Colors.grey),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 11,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text('الموكل: ${poa.clientName}', style: const TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text('النوع: ${poa.type}', style: TextStyle(color: themeTokens.muted, fontSize: 13)),
                        const SizedBox(height: 4),
                        Text('تاريخ الإصدار: ${poa.dateLabel}', style: TextStyle(color: themeTokens.muted, fontSize: 12)),
                        if (poa.cancellationReason != null) ...[
                          const SizedBox(height: 8),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(Icons.warning_amber_rounded, color: AppColors.danger, size: 16),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  'مسوغ الإلغاء: ${poa.cancellationReason}',
                                  style: const TextStyle(
                                    color: AppColors.danger,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                        if (isActive) ...[
                          const Divider(height: 24),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              TextButton.icon(
                                onPressed: () => _cancelPoaDialog(poa),
                                icon: const Icon(Icons.cancel_outlined, color: AppColors.danger, size: 16),
                                label: const Text(
                                  'إلغاء الوكالة',
                                  style: TextStyle(
                                    color: AppColors.danger,
                                    fontFamily: 'Tajawal',
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        );
      },
    );
  }
}

// ---------------------------------------------
// Interactive Internal Regulations List Screen
// ---------------------------------------------
class InternalRegulationsListScreen extends StatefulWidget {
  const InternalRegulationsListScreen({required this.appState, super.key});

  final AppState appState;

  @override
  State<InternalRegulationsListScreen> createState() => _InternalRegulationsListScreenState();
}

class _InternalRegulationsListScreenState extends State<InternalRegulationsListScreen> {
  String _filter = 'active'; // 'all', 'active', 'archived'

  void _showRegulationForm({InternalRegulation? regulation}) {
    final titleController = TextEditingController(text: regulation?.title ?? '');
    final numberController = TextEditingController(text: regulation?.regulationNumber ?? '');
    final authorityController = TextEditingController(text: regulation?.issuingAuthority ?? '');
    final summaryController = TextEditingController(text: regulation?.summary ?? '');
    
    List<String> tempSections = List<String>.from(regulation?.sections ?? []);
    final sectionInputController = TextEditingController();

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).cardColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (sheetCtx, setSheetState) {
            void runOcrSimulation() {
              showDialog<void>(
                context: ctx,
                barrierDismissible: false,
                builder: (dialogCtx) {
                  Future.delayed(const Duration(milliseconds: 1500), () {
                    Navigator.pop(dialogCtx);
                    setSheetState(() {
                      titleController.text = 'لائحة ضوابط المراجعة القضائية للعام 2026';
                      numberController.text = '109/2026';
                      authorityController.text = 'المجلس الأعلى للقضاء';
                      summaryController.text = 'تنظيم ضوابط تقديم لوائح الدفاع والمراجعات الإدارية والمدد القانونية المحددة للطلبات.';
                      tempSections = [
                        'يجب إخضاع كافة لوائح الدفاع للتدقيق الذاتي المسبق ومطابقتها مع المبادئ القضائية.',
                        'يكون رئيس قسم التقاضي هو المسؤول الأول عن سلامة الإجراءات وصحة إرفاق المستندات.',
                        'تحفظ النسخ الرقمية من المستندات الرسمية فوراً في الأرشيف المشترك للمكتب لتفادي الفقد.'
                      ];
                    });
                  });
                  return Directionality(
                    textDirection: TextDirection.rtl,
                    child: AlertDialog(
                      content: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const SizedBox(height: 10),
                          const CircularProgressIndicator(color: AppColors.primary),
                          const SizedBox(height: 20),
                          const Text(
                            'جاري فحص المستند واستخراج البنود بالذكاء الاصطناعي...',
                            style: TextStyle(fontFamily: 'Tajawal', fontSize: 13, fontWeight: FontWeight.bold),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 10),
                        ],
                      ),
                    ),
                  );
                },
              );
            }

            return Directionality(
              textDirection: TextDirection.rtl,
              child: Padding(
                padding: EdgeInsets.only(
                  bottom: MediaQuery.of(sheetCtx).viewInsets.bottom + 20,
                  left: 20,
                  right: 20,
                  top: 20,
                ),
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            regulation == null ? 'إضافة لائحة داخلية جديدة' : 'تعديل لائحة داخلية',
                            style: Theme.of(sheetCtx).textTheme.titleLarge?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  fontFamily: 'Tajawal',
                                ),
                          ),
                          TextButton.icon(
                            onPressed: runOcrSimulation,
                            icon: const Icon(Icons.document_scanner, size: 18),
                            label: const Text('مسح OCR', style: TextStyle(fontFamily: 'Tajawal', fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        controller: titleController,
                        decoration: const InputDecoration(labelText: 'عنوان اللائحة'),
                        style: const TextStyle(fontFamily: 'Tajawal'),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: numberController,
                              decoration: const InputDecoration(labelText: 'رقم اللائحة'),
                              style: const TextStyle(fontFamily: 'Tajawal'),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: TextField(
                              controller: authorityController,
                              decoration: const InputDecoration(labelText: 'الجهة المصدرة'),
                              style: const TextStyle(fontFamily: 'Tajawal'),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: summaryController,
                        decoration: const InputDecoration(labelText: 'الخلاصة أو الوصف'),
                        style: const TextStyle(fontFamily: 'Tajawal'),
                        maxLines: 2,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'بنود اللائحة:',
                        style: TextStyle(
                          fontFamily: 'Tajawal',
                          fontWeight: FontWeight.bold,
                          color: Theme.of(sheetCtx).brightness == Brightness.dark
                              ? Colors.white70
                              : AppColors.primaryBronze,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: sectionInputController,
                              decoration: const InputDecoration(
                                hintText: 'اكتب البند الجديد هنا...',
                                hintStyle: TextStyle(fontSize: 12),
                              ),
                              style: const TextStyle(fontFamily: 'Tajawal', fontSize: 13),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.add_circle, color: AppColors.primary),
                            onPressed: () {
                              if (sectionInputController.text.trim().isEmpty) return;
                              setSheetState(() {
                                tempSections.add(sectionInputController.text.trim());
                                sectionInputController.clear();
                              });
                            },
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      if (tempSections.isEmpty)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 12),
                          child: Text(
                            'لم يتم إضافة أي بنود بعد.',
                            style: TextStyle(fontFamily: 'Tajawal', fontSize: 12, color: Colors.grey),
                          ),
                        )
                      else
                        Container(
                          constraints: const BoxConstraints(maxHeight: 180),
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.grey.withValues(alpha: 0.2)),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: ListView.builder(
                            shrinkWrap: true,
                            itemCount: tempSections.length,
                            itemBuilder: (listCtx, idx) {
                              return ListTile(
                                dense: true,
                                title: Text(
                                  tempSections[idx],
                                  style: const TextStyle(fontFamily: 'Tajawal', fontSize: 12),
                                ),
                                trailing: IconButton(
                                  icon: const Icon(Icons.remove_circle_outline, color: Colors.redAccent, size: 18),
                                  onPressed: () {
                                    setSheetState(() {
                                      tempSections.removeAt(idx);
                                    });
                                  },
                                ),
                              );
                            },
                          ),
                        ),
                      const SizedBox(height: 24),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () {
                            if (titleController.text.trim().isEmpty) return;
                            final newReg = InternalRegulation(
                              id: regulation?.id ?? 'reg-${DateTime.now().millisecondsSinceEpoch}',
                              title: titleController.text.trim(),
                              regulationNumber: numberController.text.trim().isEmpty ? null : numberController.text.trim(),
                              issuingAuthority: authorityController.text.trim().isEmpty ? null : authorityController.text.trim(),
                              summary: summaryController.text.trim().isEmpty ? null : summaryController.text.trim(),
                              sections: tempSections,
                              isActive: regulation?.isActive ?? true,
                            );

                            if (regulation == null) {
                              widget.appState.addInternalRegulation(newReg);
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('تم إضافة اللائحة بنجاح', style: TextStyle(fontFamily: 'Tajawal'))),
                              );
                            } else {
                              widget.appState.updateInternalRegulation(newReg);
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('تم تعديل اللائحة بنجاح', style: TextStyle(fontFamily: 'Tajawal'))),
                              );
                            }
                            Navigator.pop(ctx);
                          },
                          child: Text(
                            regulation == null ? 'حفظ اللائحة' : 'تحديث اللائحة',
                            style: const TextStyle(fontFamily: 'Tajawal', fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  void _deleteRegulation(String id, String title) {
    showDialog<void>(
      context: context,
      builder: (dialogCtx) {
        return Directionality(
          textDirection: TextDirection.rtl,
          child: AlertDialog(
            title: const Text('حذف اللائحة', style: TextStyle(fontFamily: 'Tajawal', fontWeight: FontWeight.w900)),
            content: Text('هل أنت متأكد من رغبتك في حذف لائحة "$title"؟ لا يمكن التراجع عن هذا الإجراء.', style: const TextStyle(fontFamily: 'Tajawal', fontSize: 13)),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(dialogCtx),
                child: const Text('إلغاء', style: TextStyle(fontFamily: 'Tajawal')),
              ),
              ElevatedButton(
                onPressed: () {
                  widget.appState.deleteInternalRegulation(id);
                  Navigator.pop(dialogCtx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('تم حذف اللائحة بنجاح', style: TextStyle(fontFamily: 'Tajawal'))),
                  );
                },
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
                child: const Text('تأكيد الحذف', style: TextStyle(color: Colors.white, fontFamily: 'Tajawal', fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final themeTokens = Theme.of(context).extension<MohamyThemeTokens>()!;

    return ListenableBuilder(
      listenable: widget.appState,
      builder: (context, _) {
        final allRegs = widget.appState.internalRegulations;
        final filteredRegs = allRegs.where((reg) {
          if (_filter == 'active') return reg.isActive;
          if (_filter == 'archived') return !reg.isActive;
          return true;
        }).toList();

        return Scaffold(
          appBar: AppBar(title: const Text('اللوائح والأنظمة الداخلية')),
          floatingActionButton: FloatingActionButton(
            onPressed: () => _showRegulationForm(),
            backgroundColor: AppColors.primaryBronze,
            child: const Icon(Icons.add, color: Colors.white),
          ),
          body: Directionality(
            textDirection: TextDirection.rtl,
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildFilterChip('نشطة', 'active'),
                      const SizedBox(width: 8),
                      _buildFilterChip('مؤرشفة', 'archived'),
                      const SizedBox(width: 8),
                      _buildFilterChip('الكل', 'all'),
                    ],
                  ),
                ),
                Expanded(
                  child: filteredRegs.isEmpty
                      ? const Center(
                          child: EmptyState(
                            icon: Icons.gavel_outlined,
                            title: 'لا توجد لوائح حالية',
                            message: 'اضغط على زر الإضافة لإدراج لائحة جديدة أو استخدام فحص OCR للوثائق.',
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: filteredRegs.length,
                          itemBuilder: (context, index) {
                            final reg = filteredRegs[index];

                            return Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child: AppCard(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                reg.title,
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.w900,
                                                  fontSize: 16,
                                                  color: AppColors.primaryBronze,
                                                ),
                                              ),
                                              if (reg.regulationNumber != null || reg.issuingAuthority != null) ...[
                                                const SizedBox(height: 4),
                                                Text(
                                                  '${reg.regulationNumber ?? ""} • ${reg.issuingAuthority ?? ""}',
                                                  style: TextStyle(
                                                    fontSize: 11,
                                                    color: themeTokens.muted,
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                ),
                                              ],
                                            ],
                                          ),
                                        ),
                                        PopupMenuButton<String>(
                                          onSelected: (val) {
                                            if (val == 'edit') {
                                              _showRegulationForm(regulation: reg);
                                            } else if (val == 'archive') {
                                              widget.appState.archiveInternalRegulation(reg.id);
                                              ScaffoldMessenger.of(context).showSnackBar(
                                                SnackBar(
                                                  content: Text(
                                                    reg.isActive ? 'تم أرشفة اللائحة بنجاح' : 'تم تفعيل اللائحة بنجاح',
                                                    style: const TextStyle(fontFamily: 'Tajawal'),
                                                  ),
                                                ),
                                              );
                                            } else if (val == 'delete') {
                                              _deleteRegulation(reg.id, reg.title);
                                            }
                                          },
                                          itemBuilder: (ctx) => [
                                            const PopupMenuItem(
                                              value: 'edit',
                                              child: Row(
                                                children: [
                                                  Icon(Icons.edit_outlined, size: 18),
                                                  SizedBox(width: 8),
                                                  Text('تعديل', style: TextStyle(fontFamily: 'Tajawal')),
                                                ],
                                              ),
                                            ),
                                            PopupMenuItem(
                                              value: 'archive',
                                              child: Row(
                                                children: [
                                                  Icon(reg.isActive ? Icons.archive_outlined : Icons.unarchive_outlined, size: 18),
                                                  SizedBox(width: 8),
                                                  Text(reg.isActive ? 'أرشفة' : 'تنشيط', style: const TextStyle(fontFamily: 'Tajawal')),
                                                ],
                                              ),
                                            ),
                                            const PopupMenuItem(
                                              value: 'delete',
                                              child: Row(
                                                children: [
                                                  Icon(Icons.delete_outline, color: AppColors.danger, size: 18),
                                                  SizedBox(width: 8),
                                                  Text('حذف', style: TextStyle(fontFamily: 'Tajawal', color: AppColors.danger)),
                                                ],
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                    if (reg.summary != null) ...[
                                      const SizedBox(height: 8),
                                      Text(
                                        reg.summary!,
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: themeTokens.muted,
                                          height: 1.4,
                                        ),
                                      ),
                                    ],
                                    const SizedBox(height: 10),
                                    ...reg.sections.map((sec) {
                                      return Padding(
                                        padding: const EdgeInsets.symmetric(vertical: 4),
                                        child: Row(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            const Icon(Icons.fiber_manual_record, size: 10, color: AppColors.primary),
                                            const SizedBox(width: 8),
                                            Expanded(
                                              child: Text(
                                                sec,
                                                style: const TextStyle(fontSize: 13, height: 1.4),
                                              ),
                                            ),
                                          ],
                                        ),
                                      );
                                    }),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final isSelected = _filter == value;
    return ChoiceChip(
      label: Text(
        label,
        style: TextStyle(
          fontFamily: 'Tajawal',
          fontWeight: FontWeight.bold,
          color: isSelected ? Colors.white : AppColors.primaryBronze,
          fontSize: 12,
        ),
      ),
      selected: isSelected,
      selectedColor: AppColors.primaryBronze,
      backgroundColor: Colors.transparent,
      side: BorderSide(
        color: isSelected ? Colors.transparent : AppColors.primaryBronze.withValues(alpha: 0.3),
      ),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      onSelected: (selected) {
        if (selected) {
          setState(() {
            _filter = value;
          });
        }
      },
    );
  }
}

// ---------------------------------------------
// Interactive Legal Contracts Screen (Full Details & AI Summary Popup)
// ---------------------------------------------
class LegalContractsScreen extends StatefulWidget {
  const LegalContractsScreen({super.key});

  @override
  State<LegalContractsScreen> createState() => _LegalContractsScreenState();
}

class _LegalContractsScreenState extends State<LegalContractsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final List<Map<String, dynamic>> _contracts = [
    {
      'title': 'عقد تقديم خدمات قانونية واستشارية',
      'partyA': 'مكتب حامد الرويلي للمحاماة',
      'partyB': 'شركة الإنماء المتطورة',
      'date': '2025-01-10',
      'status': 'نشط',
      'type': 'استشاري',
      'aiAnalysis': 'العقد مستوفٍ لجميع الشروط الأساسية. توجد ملاحظة على بند تسوية المنازعات: يُفضل تحديد مركز التحكيم السعودي صراحة لتجنب الجهالة عند وقوع أي خلاف.'
    },
    {
      'title': 'عقد وكالة تجارية حصرية',
      'partyA': 'شركة التوريد الخليجية',
      'partyB': 'مؤسسة الرياض اللوجستية',
      'date': '2025-03-01',
      'status': 'مسودة',
      'type': 'وكالة تجارية',
      'aiAnalysis': 'بند عدم المنافسة واسع النطاق جغرافياً وزمنياً (5 سنوات). يُوصى بتقليصه إلى سنتين فقط ليتوافق مع الأنظمة السعودية لعدم الاحتكار.'
    },
    {
      'title': 'اتفاقية تسوية ودية وتنازل',
      'partyA': 'سلمان فهد الحربي',
      'partyB': 'البنك التجاري الموحد',
      'date': '2024-09-18',
      'status': 'مكتمل',
      'type': 'تسوية',
      'aiAnalysis': 'التسوية نهائية وتتضمن تنازلاً كاملاً عن كافة الدعاوى القضائية المقامة والمستقبلية المتعلقة بموضوع النزاع المذكور. لا توجد ثغرات مكشوفة.'
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _showAiAnalysis(Map<String, dynamic> contract) {
    showDialog<void>(
      context: context,
      builder: (context) {
        return Directionality(
          textDirection: TextDirection.rtl,
          child: AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
            title: Row(
              children: [
                const Icon(Icons.auto_awesome, color: AppColors.primary),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'تدقيق ذكي: ${contract['title']}',
                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
                  ),
                ),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'التحليل والمخاطر المكتشفة:',
                  style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryBronze),
                ),
                const SizedBox(height: 8),
                Text(
                  contract['aiAnalysis'] as String,
                  style: const TextStyle(height: 1.4, fontSize: 13),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('إغلاق', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        );
      },
    );
  }

  void _addNewContract() {
    final titleController = TextEditingController();
    final partyAController = TextEditingController();
    final partyBController = TextEditingController();
    final typeController = TextEditingController();

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).cardColor,
      builder: (context) {
        return Directionality(
          textDirection: TextDirection.rtl,
          child: Padding(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom + 20,
              left: 20,
              right: 20,
              top: 20,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'إنشاء مسودة عقد جديد',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: titleController,
                  decoration: const InputDecoration(labelText: 'عنوان العقد'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: partyAController,
                  decoration: const InputDecoration(labelText: 'الطرف الأول'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: partyBController,
                  decoration: const InputDecoration(labelText: 'الطرف الثاني'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: typeController,
                  decoration: const InputDecoration(labelText: 'نوع العقد (مثال: تقديم خدمات، عمل، وكالة)'),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () {
                    if (titleController.text.isEmpty || partyAController.text.isEmpty) return;
                    setState(() {
                      _contracts.insert(0, {
                        'title': titleController.text,
                        'partyA': partyAController.text,
                        'partyB': partyBController.text,
                        'date': '2026-05-22',
                        'status': 'مسودة',
                        'type': typeController.text,
                        'aiAnalysis': 'هذا العقد مضاف حديثاً كمسودة. يرجى تشغيل مدقق الذكاء الاصطناعي لاستخراج البنود والتحقق من سلامتها.'
                      });
                    });
                    Navigator.pop(context);
                  },
                  child: const Text('حفظ المسودة'),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final themeTokens = Theme.of(context).extension<MohamyThemeTokens>()!;

    return Scaffold(
      appBar: AppBar(
        title: const Text('العقود والاتفاقيات القانونية'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary,
          labelColor: AppColors.primary,
          unselectedLabelColor: Colors.grey,
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontFamily: 'Tajawal'),
          tabs: const [
            Tab(text: 'الكل'),
            Tab(text: 'نشط'),
            Tab(text: 'مسودة'),
            Tab(text: 'مكتمل'),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _addNewContract,
        backgroundColor: AppColors.primaryBronze,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: Directionality(
        textDirection: TextDirection.rtl,
        child: TabBarView(
          controller: _tabController,
          children: [
            _buildContractsList('الكل', themeTokens),
            _buildContractsList('نشط', themeTokens),
            _buildContractsList('مسودة', themeTokens),
            _buildContractsList('مكتمل', themeTokens),
          ],
        ),
      ),
    );
  }

  Widget _buildContractsList(String filter, MohamyThemeTokens tokens) {
    final filtered = _contracts.where((c) {
      if (filter == 'الكل') return true;
      return c['status'] == filter;
    }).toList();

    if (filtered.isEmpty) {
      return const EmptyState(
        icon: Icons.edit_document,
        title: 'لا توجد عقود',
        message: 'لا توجد عقود تندرج تحت هذا التصنيف حالياً.',
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: filtered.length,
      itemBuilder: (context, index) {
        final contract = filtered[index];
        Color statusColor;
        switch (contract['status']) {
          case 'نشط':
            statusColor = AppColors.success;
            break;
          case 'مسودة':
            statusColor = AppColors.primary;
            break;
          default:
            statusColor = Colors.grey;
        }

        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: statusColor.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        contract['status'] as String,
                        style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 11),
                      ),
                    ),
                    Text(
                      contract['date'] as String,
                      style: TextStyle(color: tokens.muted, fontSize: 12),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  contract['title'] as String,
                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
                ),
                const SizedBox(height: 10),
                Text('الطرف الأول: ${contract['partyA']}', style: const TextStyle(fontSize: 13)),
                Text('الطرف الثاني: ${contract['partyB']}', style: const TextStyle(fontSize: 13)),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'نوع العقد: ${contract['type']}',
                      style: TextStyle(color: tokens.muted, fontSize: 12),
                    ),
                    ElevatedButton.icon(
                      onPressed: () => _showAiAnalysis(contract),
                      icon: const Icon(Icons.auto_awesome, size: 14, color: Colors.white),
                      label: const Text('تدقيق ذكي', style: TextStyle(fontSize: 11)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryBronze,
                        minimumSize: const Size(100, 32),
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

// ---------------------------------------------
// Interactive Process Server Screen (Due dates & Status toggling)
// ---------------------------------------------
class ProcessServerScreen extends StatefulWidget {
  const ProcessServerScreen({super.key});

  @override
  State<ProcessServerScreen> createState() => _ProcessServerScreenState();
}

class _ProcessServerScreenState extends State<ProcessServerScreen> {
  final List<Map<String, dynamic>> _papers = [
    {
      'title': 'إعلان لائحة دعوى شركة النخبة',
      'recipient': 'شركة النخبة للاستيراد والتصدير',
      'caseRef': '2025/1154/ق',
      'dueDate': '2025-06-15',
      'status': 'قيد التسليم',
    },
    {
      'title': 'إنذار رسمي بسداد الأجرة المتاخرة',
      'recipient': 'أحمد السالم الدوسري',
      'caseRef': '2024/984/ق',
      'dueDate': '2025-05-18',
      'status': 'تم التسليم',
    },
    {
      'title': 'إعلان بصورة حكم قضائي نهائي',
      'recipient': 'مؤسسة التشييد والبناء العمراني',
      'caseRef': '2024/3421/ق',
      'dueDate': '2025-04-10',
      'status': 'متأخر',
    },
  ];

  void _addNewPaper() {
    final titleController = TextEditingController();
    final recController = TextEditingController();
    final caseController = TextEditingController();
    final dateController = TextEditingController(text: '2026-06-01');

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).cardColor,
      builder: (context) {
        return Directionality(
          textDirection: TextDirection.rtl,
          child: Padding(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom + 20,
              left: 20,
              right: 20,
              top: 20,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'إضافة ورقة محضرين جديدة',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: titleController,
                  decoration: const InputDecoration(labelText: 'عنوان الإعلان / الورقة'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: recController,
                  decoration: const InputDecoration(labelText: 'المنذر إليه / المستلم'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: caseController,
                  decoration: const InputDecoration(labelText: 'رقم القضية المرتبطة'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: dateController,
                  decoration: const InputDecoration(labelText: 'تاريخ الاستحقاق (YYYY-MM-DD)'),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () {
                    if (titleController.text.isEmpty || recController.text.isEmpty) return;
                    setState(() {
                      _papers.insert(0, {
                        'title': titleController.text,
                        'recipient': recController.text,
                        'caseRef': caseController.text,
                        'dueDate': dateController.text,
                        'status': 'قيد التسليم',
                      });
                    });
                    Navigator.pop(context);
                  },
                  child: const Text('حفظ الورقة'),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _togglePaperStatus(int index) {
    setState(() {
      final currentStatus = _papers[index]['status'] as String;
      if (currentStatus == 'قيد التسليم') {
        _papers[index]['status'] = 'تم التسليم';
      } else if (currentStatus == 'تم التسليم') {
        _papers[index]['status'] = 'متأخر';
      } else {
        _papers[index]['status'] = 'قيد التسليم';
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final themeTokens = Theme.of(context).extension<MohamyThemeTokens>()!;

    return Scaffold(
      appBar: AppBar(title: const Text('أوراق المحضرين والتسليمات')),
      floatingActionButton: FloatingActionButton(
        onPressed: _addNewPaper,
        backgroundColor: AppColors.primaryBronze,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: Directionality(
        textDirection: TextDirection.rtl,
        child: ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: _papers.length,
          itemBuilder: (context, index) {
            final paper = _papers[index];
            final status = paper['status'] as String;

            Color statusColor;
            IconData statusIcon;
            if (status == 'تم التسليم') {
              statusColor = AppColors.success;
              statusIcon = Icons.check_circle_outline;
            } else if (status == 'قيد التسليم') {
              statusColor = AppColors.primary;
              statusIcon = Icons.pending_actions_outlined;
            } else {
              statusColor = AppColors.danger;
              statusIcon = Icons.warning_amber_rounded;
            }

            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            paper['title'] as String,
                            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
                          ),
                        ),
                        GestureDetector(
                          onTap: () => _togglePaperStatus(index),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: statusColor.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: statusColor.withValues(alpha: 0.3)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(statusIcon, color: statusColor, size: 14),
                                const SizedBox(width: 4),
                                Text(
                                  status,
                                  style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 11),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text('المنذر إليه: ${paper['recipient']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Text('رقم القضية: ${paper['caseRef']}', style: TextStyle(color: themeTokens.muted, fontSize: 13)),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'تاريخ الاستحقاق: ${paper['dueDate']}',
                          style: TextStyle(
                            color: status == 'متأخر' ? AppColors.danger : themeTokens.muted,
                            fontWeight: status == 'متأخر' ? FontWeight.bold : null,
                            fontSize: 12,
                          ),
                        ),
                        TextButton.icon(
                          onPressed: () => _togglePaperStatus(index),
                          icon: const Icon(Icons.swap_horiz, size: 14),
                          label: const Text('تغيير الحالة', style: TextStyle(fontSize: 11)),
                          style: TextButton.styleFrom(
                            padding: EdgeInsets.zero,
                            minimumSize: Size.zero,
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

// ---------------------------------------------
// Legacy System States View
// ---------------------------------------------
class SystemStatesScreen extends StatelessWidget {
  const SystemStatesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('حالات النظام')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const <Widget>[
          EmptyState(
            icon: Icons.inbox_outlined,
            title: 'لا توجد بيانات بعد',
            message: 'أضف أول عنصر للبدء.',
            actionLabel: 'إضافة',
          ),
          SizedBox(height: 12),
          EmptyState(
            icon: Icons.wifi_off_outlined,
            title: 'لا يوجد اتصال بالإنترنت',
            message: 'تحقق من الشبكة ثم حاول مرة أخرى.',
            actionLabel: 'إعادة المحاولة',
          ),
          SizedBox(height: 12),
          EmptyState(
            icon: Icons.auto_awesome,
            title: 'الرصيد غير كاف',
            message: 'اشتر نقاطا إضافية لتشغيل هذا الإجراء.',
            actionLabel: 'شراء نقاط',
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------
// _MoreItem structure
// ---------------------------------------------
class _MoreItem {
  const _MoreItem({
    required this.icon,
    required this.title,
    required this.builder,
  });

  final IconData icon;
  final String title;
  final WidgetBuilder builder;
}
