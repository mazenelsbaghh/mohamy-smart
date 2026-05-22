import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../core/models/legal_models.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/legal_cards.dart';
import '../ai_workflows/ai_workflow_screens.dart';
import '../subscription/subscription_screen.dart';

class CaseDetailsScreen extends StatelessWidget {
  const CaseDetailsScreen({
    required this.appState,
    required this.legalCase,
    super.key,
  });

  final AppState appState;
  final LegalCase legalCase;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final scaffoldBg = isDark ? AppColors.darkBg : const Color(0xFFF0EEE7);

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        backgroundColor: scaffoldBg,
        appBar: AppBar(
          backgroundColor: isDark ? AppColors.darkSurface.withValues(alpha: 0.8) : AppColors.lightSurfaceMuted.withValues(alpha: 0.8),
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_forward), // RTL Back button
            color: AppColors.primary,
            onPressed: () => Navigator.of(context).pop(),
          ),
          title: const Text(
            'ملف القضية',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
          ),
          actions: <Widget>[
            IconButton(
              icon: const Icon(Icons.more_vert),
              color: isDark ? AppColors.darkMuted : AppColors.lightMuted,
              onPressed: () {},
            ),
          ],
        ),
        body: Column(
          children: <Widget>[
            // Bento Hero Card
            Padding(
              padding: const EdgeInsets.all(16),
              child: _buildBentoHero(context),
            ),
            // Sticky Custom Tabs Navigation
            Container(
              color: isDark ? AppColors.darkBg : const Color(0xFFF0EEE7),
              child: TabBar(
                indicator: const UnderlineTabIndicator(
                  borderSide: BorderSide(color: AppColors.primary, width: 3),
                  insets: EdgeInsets.symmetric(horizontal: 48),
                ),
                labelColor: AppColors.primary,
                unselectedLabelColor: isDark ? AppColors.darkMuted : AppColors.lightMuted,
                labelStyle: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  fontFamily: 'Tajawal',
                ),
                unselectedLabelStyle: const TextStyle(
                  fontWeight: FontWeight.w500,
                  fontSize: 14,
                  fontFamily: 'Tajawal',
                ),
                tabs: const <Widget>[
                  Tab(text: 'التفاصيل'),
                  Tab(text: 'التحليل الذكي'),
                  Tab(text: 'الملخص'),
                ],
              ),
            ),
            // Tab View Body
            Expanded(
              child: TabBarView(
                children: <Widget>[
                  _buildDetailsTab(context),
                  _buildAiAnalysisTab(context),
                  _buildSummaryTab(context),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // 1. Bento Hero Card Widget
  Widget _buildBentoHero(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final gradientStart = AppColors.primary.withValues(alpha: 0.10);
    final gradientEnd = isDark ? AppColors.darkSurface : Colors.white;
    final textColor = isDark ? Colors.white : AppColors.lightTitle;

    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: LinearGradient(
          colors: [gradientStart, gradientEnd],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(
          color: isDark ? AppColors.darkBorder : Colors.white.withValues(alpha: 0.6),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: isDark ? const Color(0x02EF950A) : const Color(0x0A885200),
            blurRadius: 32,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Stack(
        children: <Widget>[
          // Gavel decoration watermark
          Positioned(
            left: -20,
            bottom: -20,
            child: Icon(
              Icons.gavel,
              size: 130,
              color: AppColors.primary.withValues(alpha: isDark ? 0.04 : 0.05),
            ),
          ),
          // Content
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                // Status Badge
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.10),
                    borderRadius: BorderRadius.circular(99),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        legalCase.status.label,
                        style: const TextStyle(
                          color: AppColors.primary,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                // Case Title
                Text(
                  legalCase.title,
                  style: TextStyle(
                    color: textColor,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 20),
                // Action Buttons Row
                Row(
                  children: <Widget>[
                    InkWell(
                      onTap: () {
                        // Navigate to Workflow Selection
                        Navigator.of(context).push(
                          MaterialPageRoute<void>(
                            builder: (_) => AiWorkflowHubScreen(
                              appState: appState,
                              legalCase: legalCase,
                            ),
                          ),
                        );
                      },
                      borderRadius: BorderRadius.circular(999),
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF885200), Color(0xFFEF950A)],
                            begin: Alignment.topRight,
                            end: Alignment.bottomLeft,
                          ),
                          borderRadius: BorderRadius.circular(999),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withValues(alpha: 0.25),
                              blurRadius: 16,
                              offset: const Offset(0, 6),
                            ),
                          ],
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: <Widget>[
                            Text(
                              'ابدأ التحليل الذكي',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                            SizedBox(width: 6),
                            Icon(
                              Icons.bolt,
                              color: Colors.white,
                              size: 16,
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Row(
                      children: <Widget>[
                        Icon(
                          Icons.schedule,
                          size: 13,
                          color: isDark ? AppColors.darkMuted : AppColors.lightMuted,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          legalCase.id == 'case-4' || legalCase.id == 'case-1'
                              ? 'آخر تحديث: منذ ساعتين'
                              : 'آخر تحديث: مؤخراً',
                          style: TextStyle(
                            fontSize: 10,
                            color: isDark ? AppColors.darkMuted : AppColors.lightMuted,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // 2. Details Tab
  Widget _buildDetailsTab(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: <Widget>[
        // Grid Info Cards
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          childAspectRatio: 2.2,
          children: <Widget>[
            _buildInfoGridItem(context, 'رقم القضية', legalCase.caseNumber),
            _buildInfoGridItem(context, 'نوع القضية', legalCase.caseType),
            _buildInfoGridItem(context, 'المحكمة', legalCase.court),
            _buildInfoGridItem(
              context,
              'الخصم',
              legalCase.adversary.isNotEmpty ? legalCase.adversary : 'غير محدد',
            ),
          ],
        ),
        const SizedBox(height: 20),
        // Facts Section
        _buildFactsSection(context),
        const SizedBox(height: 20),
        // Recommendation Card
        _buildRecommendationCard(context),
      ],
    );
  }

  Widget _buildInfoGridItem(BuildContext context, String label, String value) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final containerBg = isDark ? AppColors.darkSurfaceSoft : const Color(0xFFF6F4EC);
    final textColor = isDark ? Colors.white : AppColors.lightTitle;
    final mutedColor = isDark ? AppColors.darkMuted : AppColors.lightMuted;
    final borderColor = isDark ? AppColors.darkBorder : AppColors.lightBorder;

    return Container(
      decoration: BoxDecoration(
        color: containerBg,
        borderRadius: BorderRadius.circular(16),
        border: isDark ? Border.all(color: borderColor, width: 1) : null,
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          Text(
            label,
            style: TextStyle(
              color: mutedColor,
              fontSize: 11,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              color: textColor,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildFactsSection(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final containerBg = isDark
        ? const Color(0xFF1E1D13) // Warm dark tone
        : const Color(0xFFFBFAE8); // Warm yellow/cream tone
    final borderColor = isDark ? AppColors.darkBorder : const Color(0x0DEF950A);
    final textColor = isDark ? Colors.white : AppColors.lightTitle;

    return Container(
      decoration: BoxDecoration(
        color: containerBg,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: borderColor, width: 1),
        boxShadow: isDark
            ? null
            : [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.02),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: <Widget>[
              const Row(
                children: <Widget>[
                  Icon(
                    Icons.menu_book,
                    color: AppColors.primary,
                    size: 20,
                  ),
                  SizedBox(width: 8),
                  Text(
                    'وقائع القضية',
                    style: TextStyle(
                      color: AppColors.primary,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.edit, color: AppColors.primary, size: 18),
                onPressed: () {},
                style: IconButton.styleFrom(
                  backgroundColor: AppColors.primary.withValues(alpha: 0.08),
                  padding: const EdgeInsets.all(8),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Scrollable Facts Text
          Container(
            constraints: const BoxConstraints(maxHeight: 200),
            child: SingleChildScrollView(
              child: Text(
                legalCase.facts.join('\n\n'),
                style: TextStyle(
                  color: textColor,
                  fontSize: 15,
                  height: 1.8,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecommendationCard(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final containerBg = AppColors.primary.withValues(alpha: 0.05);
    final borderColor = AppColors.primary.withValues(alpha: 0.2);
    final textColor = isDark ? Colors.white : AppColors.lightTitle;

    // Custom recommendations based on case
    String recommendation;
    if (legalCase.id == 'case-4') {
      recommendation = 'يُفضل إرفاق شهادة من مصلحة الضرائب العقارية لتعزيز دفع انتفاء الحيازة الهادئة.';
    } else if (legalCase.id == 'case-1') {
      recommendation = 'يُنصح بتقديم إثبات الدفع للدفعة المقدمة لتقوية موقفك ضد المورد.';
    } else if (legalCase.id == 'case-2') {
      recommendation = 'يُنصح بطلب ندب خبير فني لمراجعة شروط عقد الوكالة الحصري.';
    } else if (legalCase.id == 'case-3') {
      recommendation = 'يُفضل التحقق من صحة الرقم الموحد للسند قبل التقديم لمحكمة التنفيذ.';
    } else {
      recommendation = 'يُنصح بمراجعة المستندات المرفقة وتحديث وقائع القضية لتقديم تحليل أدق.';
    }

    return Container(
      decoration: BoxDecoration(
        color: containerBg,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: borderColor, width: 1),
      ),
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          const Icon(
            Icons.auto_awesome,
            color: AppColors.primary,
            size: 20,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                const Text(
                  'توصية الذكاء الاصطناعي',
                  style: TextStyle(
                    color: AppColors.primary,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  recommendation,
                  style: TextStyle(
                    color: textColor.withValues(alpha: 0.8),
                    fontSize: 13,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAiAnalysisTab(BuildContext context) {
    final workflows = appState.workflowsForCase(legalCase.id);
    final points = appState.subscription.aiPoints;
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: workflows.length,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final workflow = workflows[index];
        return WorkflowCard(
          workflow: workflow,
          canRun: points >= workflow.pointCost,
          onStart: () {
            if (points < workflow.pointCost) {
              Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => SubscriptionScreen(appState: appState),
                ),
              );
              return;
            }
            Navigator.of(context).push(
              MaterialPageRoute<void>(
                builder: (_) => AiWorkflowRunnerScreen(
                  workflow: workflow,
                  legalCase: legalCase,
                ),
              ),
            );
          },
        );
      },
    );
  }


  // 4. Summary Tab (Packaging Sessions, Documents, and Readiness)
  Widget _buildSummaryTab(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? Colors.white : AppColors.lightTitle;
    final mutedTextColor = isDark ? AppColors.darkMuted : AppColors.lightMuted;
    final borderColor = isDark ? AppColors.darkBorder : AppColors.lightBorder;
    final points = appState.subscription.aiPoints;

    final documents = appState.documentsForCase(legalCase.id);
    final agenda = appState.agendaForCase(legalCase.id);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: <Widget>[
        // Context / Readiness Card
        Container(
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkSurface : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: borderColor, width: 1),
          ),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(
                'جاهزية القضية للتحليل',
                style: TextStyle(
                  color: textColor,
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              _buildReadinessRow(
                context,
                label: 'المستندات متوفرة',
                ready: legalCase.readiness.hasDocuments,
              ),
              _buildReadinessRow(
                context,
                label: 'الوقائع مكتملة',
                ready: legalCase.readiness.hasFacts,
              ),
              _buildReadinessRow(
                context,
                label: 'النقاط متوفرة ($points نقطة)',
                ready: points >= 50,
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        // Documents Section
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: <Widget>[
            Text(
              'المستندات المرفقة (${documents.length})',
              style: TextStyle(
                color: textColor,
                fontSize: 15,
                fontWeight: FontWeight.bold,
              ),
            ),
            TextButton(
              onPressed: () {},
              child: const Text('إضافة مستند'),
            ),
          ],
        ),
        const SizedBox(height: 8),
        if (documents.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Text(
              'لا توجد مستندات مرفقة حالياً.',
              style: TextStyle(color: mutedTextColor, fontSize: 13),
              textAlign: CenterPlayable.center,
            ),
          )
        else
          ...documents.map(
            (doc) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: DocumentCard(document: doc),
            ),
          ),
        const SizedBox(height: 24),
        // Sessions Section
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: <Widget>[
            Text(
              'الجلسات والمواعيد (${agenda.length})',
              style: TextStyle(
                color: textColor,
                fontSize: 15,
                fontWeight: FontWeight.bold,
              ),
            ),
            TextButton(
              onPressed: () {},
              child: const Text('إضافة موعد'),
            ),
          ],
        ),
        const SizedBox(height: 8),
        if (agenda.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Text(
              'لا توجد جلسات مجدولة.',
              style: TextStyle(color: mutedTextColor, fontSize: 13),
            ),
          )
        else
          ...agenda.map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: AgendaCard(item: item),
            ),
          ),
      ],
    );
  }

  Widget _buildReadinessRow(BuildContext context, {required String label, required bool ready}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: <Widget>[
          Icon(
            ready ? Icons.check_circle : Icons.info_outline,
            color: ready ? AppColors.success : AppColors.primary,
            size: 20,
          ),
          const SizedBox(width: 10),
          Text(
            label,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

// Helper alignment wrapper to avoid external dependencies
class CenterPlayable {
  static const TextAlign center = TextAlign.center;
}
