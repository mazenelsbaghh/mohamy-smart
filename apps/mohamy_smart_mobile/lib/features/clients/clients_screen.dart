import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../core/models/legal_models.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_card.dart';
import '../../core/widgets/legal_cards.dart';
import '../cases/case_details_screen.dart';

class ClientsScreen extends StatefulWidget {
  const ClientsScreen({required this.appState, super.key});

  final AppState appState;

  @override
  State<ClientsScreen> createState() => _ClientsScreenState();
}

class _ClientsScreenState extends State<ClientsScreen> {
  String _searchQuery = '';

  String _getInitials(String name) {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.length >= 2) {
      if (parts[0].isNotEmpty && parts[1].isNotEmpty) {
        return '${parts[0][0]}${parts[1][0]}';
      }
    }
    if (parts.isNotEmpty && parts[0].isNotEmpty) {
      return parts[0][0];
    }
    return '';
  }

  LinearGradient _getGradientForIndex(int index) {
    final gradients = [
      const LinearGradient(
        colors: [Color(0xFF885200), Color(0xFFEF950A)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      const LinearGradient(
        colors: [Color(0xFF006493), Color(0xFF1FB3FF)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      const LinearGradient(
        colors: [Color(0xFF5F5F52), Color(0xFFC8C7B7)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
    ];
    return gradients[index % gradients.length];
  }


  void _showAddClientDialog(BuildContext context) {
    final nameController = TextEditingController();
    final phoneController = TextEditingController();
    final emailController = TextEditingController();
    final formKey = GlobalKey<FormState>();
    bool isLoading = false;

    showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (dialogCtx) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        final cardBg = isDark ? AppColors.darkSurface : Colors.white;
        final titleColor = isDark ? Colors.white : AppColors.primaryBronze;
        final textColor = isDark ? Colors.white : Colors.black87;

        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              backgroundColor: cardBg,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24),
              ),
              title: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'إضافة موكل جديد',
                    style: TextStyle(
                      fontFamily: 'Tajawal',
                      fontWeight: FontWeight.bold,
                      fontSize: 20,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'أدخل بيانات الموكل لإنشاء ملفه وتوصيله بالخلفية',
                    style: TextStyle(
                      fontFamily: 'Tajawal',
                      fontSize: 12,
                      color: isDark ? Colors.white60 : Colors.grey[600],
                    ),
                  ),
                ],
              ),
              content: Form(
                key: formKey,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      TextFormField(
                        controller: nameController,
                        style: TextStyle(fontFamily: 'Tajawal', color: textColor),
                        decoration: InputDecoration(
                          labelText: 'الاسم الكامل *',
                          labelStyle: const TextStyle(fontFamily: 'Tajawal', fontSize: 13),
                          prefixIcon: const Icon(Icons.person_outline, color: AppColors.primary),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
                          ),
                        ),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'يرجى إدخال اسم الموكل';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: phoneController,
                        keyboardType: TextInputType.phone,
                        style: TextStyle(fontFamily: 'Tajawal', color: textColor),
                        decoration: InputDecoration(
                          labelText: 'رقم الهاتف *',
                          labelStyle: const TextStyle(fontFamily: 'Tajawal', fontSize: 13),
                          prefixIcon: const Icon(Icons.phone_outlined, color: AppColors.primary),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
                          ),
                        ),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'يرجى إدخال رقم الهاتف';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: emailController,
                        keyboardType: TextInputType.emailAddress,
                        style: TextStyle(fontFamily: 'Tajawal', color: textColor),
                        decoration: InputDecoration(
                          labelText: 'البريد الإلكتروني (اختياري)',
                          labelStyle: const TextStyle(fontFamily: 'Tajawal', fontSize: 13),
                          prefixIcon: const Icon(Icons.email_outlined, color: AppColors.primary),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              actionsPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              actions: [
                TextButton(
                  onPressed: isLoading ? null : () => Navigator.of(dialogCtx).pop(),
                  child: const Text(
                    'إلغاء',
                    style: TextStyle(fontFamily: 'Tajawal', color: Colors.grey),
                  ),
                ),
                isLoading
                    ? const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 16),
                        child: SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                          ),
                        ),
                      )
                    : ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          padding: EdgeInsets.zero,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onPressed: () async {
                          if (formKey.currentState?.validate() ?? false) {
                            setState(() {
                              isLoading = true;
                            });

                            try {
                              await widget.appState.addClient(
                                nameController.text.trim(),
                                phoneController.text.trim(),
                                emailController.text.trim(),
                              );

                              if (context.mounted) {
                                Navigator.of(dialogCtx).pop();
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text(
                                      'تمت إضافة الموكل بنجاح ومزامنته! ✓',
                                      style: TextStyle(fontFamily: 'Tajawal'),
                                    ),
                                    backgroundColor: Color(0xFF34BF49),
                                  ),
                                );
                              }
                            } catch (e) {
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                      'خطأ أثناء الإضافة: $e',
                                      style: const TextStyle(fontFamily: 'Tajawal'),
                                    ),
                                    backgroundColor: Colors.redAccent,
                                  ),
                                );
                              }
                            } finally {
                              if (dialogCtx.mounted) {
                                setState(() {
                                  isLoading = false;
                                });
                              }
                            }
                          }
                        },
                        child: Ink(
                          decoration: BoxDecoration(
                            gradient: AppColors.goldGradient,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Container(
                            alignment: Alignment.center,
                            height: 40,
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: const Text(
                              'إضافة موكل',
                              style: TextStyle(
                                fontFamily: 'Tajawal',
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final titleColor = isDark ? Colors.white : AppColors.primaryBronze;
    final canvasBg = isDark ? AppColors.darkBg : AppColors.lightBg;
    final cardBg = isDark ? AppColors.darkSurface : Colors.white;
    final mutedText = isDark ? AppColors.darkMuted : AppColors.lightMuted;

    // Filter clients based on query
    final filteredClients = widget.appState.clients.where((client) {
      final query = _searchQuery.trim().toLowerCase();
      if (query.isEmpty) return true;
      return client.name.toLowerCase().contains(query) ||
          client.phone.toLowerCase().contains(query);
    }).toList();

    // Stats calculations
    final totalClients = widget.appState.clients.length;
    final activeClients = widget.appState.clients.where((client) {
      // Client is active if they have any active case in case state
      return widget.appState.cases.any((c) =>
          client.caseIds.contains(c.id) && c.status == CaseStatus.active);
    }).length;

    return Scaffold(
      backgroundColor: canvasBg,
      appBar: AppBar(
        title: const Text('إدارة العملاء'),
        backgroundColor: canvasBg,
        elevation: 0,
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.menu),
          ),
          const SizedBox(width: 8),
        ],
      ),
      floatingActionButtonLocation: const OffsetStartFloatLocation(),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          _showAddClientDialog(context);
        },
        shape: const CircleBorder(),
        elevation: 0,
        backgroundColor: Colors.transparent,
        child: Container(
          width: 56,
          height: 56,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            gradient: AppColors.goldGradient,
            boxShadow: [
              BoxShadow(
                color: Color(0x4D885200),
                blurRadius: 24,
                offset: Offset(0, 12),
              ),
            ],
          ),
          child: const Icon(Icons.add, color: Colors.white, size: 28),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
        children: <Widget>[
          // Large title in body
          Text(
            'الموكلين',
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.w900,
              color: titleColor,
            ),
          ),
          const SizedBox(height: 16),

          // Bento Stats Row
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
                  decoration: BoxDecoration(
                    color: cardBg,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: (isDark ? Colors.white : const Color(0xFFD9C3AE))
                          .withValues(alpha: 0.1),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF885200)
                            .withValues(alpha: isDark ? 0.01 : 0.04),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Text(
                        'إجمالي الموكلين',
                        style: TextStyle(
                          fontSize: 12,
                          color: mutedText,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '$totalClients',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : AppColors.primaryBronze,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
                  decoration: BoxDecoration(
                    color: cardBg,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: (isDark ? Colors.white : const Color(0xFFD9C3AE))
                          .withValues(alpha: 0.1),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF885200)
                            .withValues(alpha: isDark ? 0.01 : 0.04),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Text(
                        'نشطون',
                        style: TextStyle(
                          fontSize: 12,
                          color: mutedText,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '$activeClients',
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF006493),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Styled search bar
          Container(
            decoration: BoxDecoration(
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: isDark ? 0.1 : 0.03),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'البحث عن موكل...',
                fillColor: cardBg,
                filled: true,
                prefixIcon: const Icon(Icons.search, color: Color(0xFF867462)),
                suffixIcon: const Icon(Icons.tune, color: Color(0xFF867462)),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: const BorderSide(color: AppColors.primary, width: 1.2),
                ),
              ),
              onChanged: (value) {
                setState(() {
                  _searchQuery = value;
                });
              },
            ),
          ),
          const SizedBox(height: 20),

          // Clients List
          if (filteredClients.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 40),
                child: Text(
                  'لا يوجد موكلين يطابقون البحث',
                  style: TextStyle(color: mutedText),
                ),
              ),
            )
          else
            ...filteredClients.asMap().entries.map((entry) {
              final index = entry.key;
              final client = entry.value;
              final hasActiveCase = widget.appState.cases.any((c) =>
                  client.caseIds.contains(c.id) && c.status == CaseStatus.active);

              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Container(
                  decoration: BoxDecoration(
                    color: cardBg,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF885200)
                            .withValues(alpha: isDark ? 0.01 : 0.03),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                    border: Border.all(
                      color: (isDark ? Colors.white : const Color(0xFFD9C3AE))
                          .withValues(alpha: 0.1),
                    ),
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute<void>(
                            builder: (_) => ClientDetailsScreen(
                              appState: widget.appState,
                              client: client,
                            ),
                          ),
                        );
                      },
                      borderRadius: BorderRadius.circular(20),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            // Gradient avatar with initials
                            Container(
                              width: 56,
                              height: 56,
                              decoration: BoxDecoration(
                                gradient: _getGradientForIndex(index),
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: const [
                                  BoxShadow(
                                    color: Colors.black12,
                                    blurRadius: 4,
                                    offset: Offset(0, 2),
                                  ),
                                ],
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                _getInitials(client.name),
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                ),
                              ),
                            ),
                            const SizedBox(width: 14),

                            // Name & phone details
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    client.name,
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      Icon(
                                        Icons.phone_outlined,
                                        size: 13,
                                        color: mutedText,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        client.phone,
                                        style: TextStyle(
                                          fontSize: 13,
                                          color: mutedText,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),

                            // Status badge and more menu
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: hasActiveCase
                                        ? const Color(0xFFDCFCE7)
                                        : const Color(0xFFF5F5F4),
                                    borderRadius: BorderRadius.circular(999),
                                  ),
                                  child: Text(
                                    hasActiveCase ? 'نشط' : 'عادي',
                                    style: TextStyle(
                                      color: hasActiveCase
                                          ? const Color(0xFF15803D)
                                          : const Color(0xFF4B5563),
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Icon(
                                  Icons.more_vert,
                                  color: mutedText,
                                  size: 20,
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }),
        ],
      ),
    );
  }
}

class ClientDetailsScreen extends StatelessWidget {
  const ClientDetailsScreen({
    required this.appState,
    required this.client,
    super.key,
  });

  final AppState appState;
  final Client client;

  String _getInitials(String name) {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.length >= 2) {
      if (parts[0].isNotEmpty && parts[1].isNotEmpty) {
        return '${parts[0][0]}${parts[1][0]}';
      }
    }
    if (parts.isNotEmpty && parts[0].isNotEmpty) {
      return parts[0][0];
    }
    return '';
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final canvasBg = isDark ? AppColors.darkBg : AppColors.lightBg;
    final cardBg = isDark ? AppColors.darkSurface : Colors.white;
    final mutedText = isDark ? AppColors.darkMuted : AppColors.lightMuted;
    final accentBg = isDark ? const Color(0xFF2D2D2A) : const Color(0xFFFBFAE8);

    final linkedCases = appState.cases
        .where((legalCase) => client.caseIds.contains(legalCase.id))
        .toList(growable: false);

    final hasActiveCase = appState.cases.any((c) =>
        client.caseIds.contains(c.id) && c.status == CaseStatus.active);

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        backgroundColor: canvasBg,
        appBar: AppBar(
          title: const Text('ملف الموكل'),
          backgroundColor: canvasBg,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => Navigator.of(context).pop(),
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.more_vert),
              onPressed: () {},
            ),
          ],
        ),
        body: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          children: [
            // Profile Card Section with radial glow effects
            Container(
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: (isDark ? Colors.white : const Color(0xFFD9C3AE))
                      .withValues(alpha: 0.1),
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF885200)
                        .withValues(alpha: isDark ? 0.01 : 0.04),
                    blurRadius: 32,
                    offset: const Offset(0, 12),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: Stack(
                  children: [
                    // Glow 1 (Top right)
                    Positioned(
                      top: -40,
                      right: -40,
                      child: Container(
                        width: 140,
                        height: 140,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.primary.withValues(alpha: 0.06),
                        ),
                      ),
                    ),
                    // Glow 2 (Bottom left)
                    Positioned(
                      bottom: -40,
                      left: -40,
                      child: Container(
                        width: 140,
                        height: 140,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.blue.withValues(alpha: 0.04),
                        ),
                      ),
                    ),

                    // Card Content
                    Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        children: [
                          // Initials Avatar with green active status dot
                          Center(
                            child: Stack(
                              children: [
                                Container(
                                  width: 76,
                                  height: 76,
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(
                                      colors: [
                                        Color(0xFF885200),
                                        Color(0xFFEF950A),
                                      ],
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                    ),
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                      color: cardBg,
                                      width: 2,
                                    ),
                                    boxShadow: const [
                                      BoxShadow(
                                        color: Colors.black12,
                                        blurRadius: 8,
                                        offset: Offset(0, 4),
                                      ),
                                    ],
                                  ),
                                  alignment: Alignment.center,
                                  child: Text(
                                    _getInitials(client.name),
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 24,
                                    ),
                                  ),
                                ),
                                if (hasActiveCase)
                                  Positioned(
                                    bottom: 2,
                                    right: 2,
                                    child: Container(
                                      width: 18,
                                      height: 18,
                                      decoration: BoxDecoration(
                                        color: AppColors.success,
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                          color: cardBg,
                                          width: 2.5,
                                        ),
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 12),

                          // Name and Phone
                          Text(
                            client.name,
                            style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w900,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            client.phone,
                            style: TextStyle(
                              fontSize: 14,
                              color: mutedText,
                              fontFamily: 'monospace',
                            ),
                          ),
                          const SizedBox(height: 12),

                          // Status Badge
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 5,
                            ),
                            decoration: BoxDecoration(
                              color: hasActiveCase
                                  ? const Color(0xFFDCFCE7)
                                  : const Color(0xFFF5F5F4),
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Text(
                              hasActiveCase ? 'نشط' : 'عادي',
                              style: TextStyle(
                                color: hasActiveCase
                                    ? const Color(0xFF15803D)
                                    : const Color(0xFF4B5563),
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),

                          // Quick Actions Row
                          const SizedBox(height: 24),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              _buildQuickActionButton(
                                icon: Icons.phone_outlined,
                                bgColor: accentBg,
                              ),
                              const SizedBox(width: 20),
                              _buildQuickActionButton(
                                icon: Icons.chat_bubble_outline_rounded,
                                bgColor: accentBg,
                              ),
                              const SizedBox(width: 20),
                              _buildQuickActionButton(
                                icon: Icons.edit_outlined,
                                bgColor: accentBg,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Tabs Navigation Bar (matching surface-container-low style)
            Container(
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF141414) : const Color(0xFFF6F4EC),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: (isDark ? Colors.white : const Color(0xFFD9C3AE))
                      .withValues(alpha: 0.1),
                ),
              ),
              padding: const EdgeInsets.all(4),
              child: TabBar(
                indicator: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(12),
                ),
                labelColor: Colors.white,
                unselectedLabelColor: mutedText,
                dividerColor: Colors.transparent,
                indicatorSize: TabBarIndicatorSize.tab,
                labelStyle: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Tajawal',
                  fontSize: 14,
                ),
                tabs: const [
                  Tab(text: 'البيانات'),
                  Tab(text: 'القضايا'),
                  Tab(text: 'المستندات'),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Tab Bar View content
            SizedBox(
              height: 480,
              child: TabBarView(
                children: [
                  // Tab 1: Data Info
                  _buildDataTab(context, cardBg, mutedText, isDark),

                  // Tab 2: Linked Cases
                  _buildCasesTab(context, linkedCases),

                  // Tab 3: Documents
                  _buildDocumentsTab(context, cardBg, mutedText, isDark),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActionButton({required IconData icon, required Color bgColor}) {
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        color: bgColor,
        shape: BoxShape.circle,
        boxShadow: const [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: IconButton(
        onPressed: () {},
        icon: Icon(icon, color: AppColors.primaryBronze),
      ),
    );
  }

  Widget _buildDataTab(
    BuildContext context,
    Color cardBg,
    Color mutedText,
    bool isDark,
  ) {
    return ListView(
      physics: const NeverScrollableScrollPhysics(),
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 4, vertical: 4),
          child: Text(
            'المعلومات الأساسية',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        const SizedBox(height: 10),
        Container(
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF885200)
                    .withValues(alpha: isDark ? 0.01 : 0.04),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              _buildDataRow(
                context,
                label: 'الاسم الكامل',
                value: client.name,
                icon: Icons.person_outline,
              ),
              const Divider(height: 24, thickness: 0.6),
              _buildDataRow(
                context,
                label: 'رقم الهاتف',
                value: client.phone,
                icon: Icons.phone_outlined,
              ),
              const Divider(height: 24, thickness: 0.6),
              _buildDataRow(
                context,
                label: 'البريد الإلكتروني',
                value: client.email,
                icon: Icons.mail_outline,
              ),
              const Divider(height: 24, thickness: 0.6),
              _buildDataRow(
                context,
                label: 'تاريخ النشاط الأخير',
                value: client.lastActivity,
                icon: Icons.calendar_today_outlined,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDataRow(
    BuildContext context, {
    required String label,
    required String value,
    required IconData icon,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                color: isDark ? AppColors.darkMuted : AppColors.lightMuted,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        Icon(
          icon,
          color: (isDark ? Colors.white : const Color(0xFFD9C3AE)).withValues(alpha: 0.7),
          size: 20,
        ),
      ],
    );
  }

  Widget _buildCasesTab(BuildContext context, List<LegalCase> linkedCases) {
    if (linkedCases.isEmpty) {
      return const Center(
        child: Text('لا يوجد قضايا مرتبطة بهذا الموكل'),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.only(top: 8),
      itemCount: linkedCases.length,
      itemBuilder: (context, index) {
        final legalCase = linkedCases[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: CaseCard(
            legalCase: legalCase,
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => CaseDetailsScreen(
                    appState: appState,
                    legalCase: legalCase,
                  ),
                ),
              );
            },
          ),
        );
      },
    );
  }

  Widget _buildDocumentsTab(
    BuildContext context,
    Color cardBg,
    Color mutedText,
    bool isDark,
  ) {
    final clientDocs = appState.documents
        .where((document) => document.clientId == client.id)
        .toList();

    if (clientDocs.isEmpty) {
      return const Center(
        child: Text('لا يوجد مستندات مرفوعة لهذا الموكل'),
      );
    }

    return ListView(
      padding: const EdgeInsets.only(top: 8),
      children: [
        // Grid preview header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'المستندات الأخيرة',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            TextButton(
              onPressed: () {},
              child: const Text('عرض الكل'),
            ),
          ],
        ),
        const SizedBox(height: 10),

        // Grid view layout matching preview border styles
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.1,
          ),
          itemCount: clientDocs.length,
          itemBuilder: (context, index) {
            final doc = clientDocs[index];
            final isPdf = doc.title.toLowerCase().contains('.pdf') || doc.type.contains('عقد');
            return Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1D1D1D) : const Color(0xFFF7F3EA),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: AppColors.primary.withValues(alpha: 0.2),
                  width: 1,
                  style: BorderStyle.solid,
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    isPdf ? Icons.picture_as_pdf_outlined : Icons.description_outlined,
                    color: AppColors.primary,
                    size: 36,
                  ),
                  const SizedBox(height: 10),
                  Text(
                    doc.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    doc.type,
                    style: TextStyle(
                      fontSize: 11,
                      color: mutedText,
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }
}
