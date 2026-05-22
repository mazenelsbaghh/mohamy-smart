import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../app/app_state.dart';
import '../../core/models/legal_models.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_card.dart';
import '../../core/widgets/legal_cards.dart';
import '../../core/widgets/user_tie_avatar.dart';
import '../subscription/subscription_screen.dart';

class AiWorkflowHubScreen extends StatelessWidget {
  const AiWorkflowHubScreen({
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
    final workflows = appState.workflowsForCase(legalCase.id);
    final points = appState.subscription.aiPoints;

    final contextCardBg = isDark ? const Color(0xFF1E1D13) : const Color(0xFFFBFAE8);
    final contextCardBorder = isDark ? AppColors.darkBorder : AppColors.primary.withValues(alpha: 0.15);
    final textMuted = isDark ? AppColors.darkMuted : AppColors.lightMuted;
    final textColor = isDark ? Colors.white : AppColors.lightTitle;

    return Scaffold(
      backgroundColor: scaffoldBg,
      appBar: AppBar(
        backgroundColor: scaffoldBg,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_forward), // RTL Back button
          color: AppColors.primary,
          onPressed: () => Navigator.of(context).pop(),
        ),
        titleSpacing: 0,
        title: Text(
          'اختر مسار العمل',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 20,
            fontFamily: 'Tajawal',
            color: isDark ? Colors.white : AppColors.lightTitle,
          ),
        ),
        actions: <Widget>[
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Center(
              child: Text(
                'Mohamy Smart',
                style: TextStyle(
                  color: isDark ? AppColors.primary : const Color(0xFF885200),
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        children: <Widget>[
          // Context Card
          Container(
            decoration: BoxDecoration(
              color: contextCardBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: contextCardBorder, width: 1),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: isDark ? 0.01 : 0.02),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: <Widget>[
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        'القضية الحالية',
                        style: TextStyle(
                          color: textMuted,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          fontFamily: 'Tajawal',
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        legalCase.title,
                        style: TextStyle(
                          color: isDark ? Colors.white : const Color(0xFF885200),
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Tajawal',
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                // Facts count badge
                Container(
                  decoration: BoxDecoration(
                    color: isDark ? Colors.green.withValues(alpha: 0.15) : const Color(0xFFE8F5E9),
                    borderRadius: BorderRadius.circular(99),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      Text(
                        '${legalCase.facts.length} وقائع',
                        style: const TextStyle(
                          color: Colors.green,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Tajawal',
                        ),
                      ),
                      const SizedBox(width: 4),
                      const Icon(
                        Icons.check_circle,
                        color: Colors.green,
                        size: 14,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 28),
          // Section Title
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: <Widget>[
              Container(
                width: 6,
                height: 22,
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
              const SizedBox(width: 10),
              Text(
                'المسارات المتاحة',
                style: TextStyle(
                  color: textColor,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Tajawal',
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: Text(
              'اختر المسار الذي ترغب في معالجته بواسطة الذكاء الاصطناعي',
              style: TextStyle(
                color: textMuted,
                fontSize: 13,
                fontFamily: 'Tajawal',
              ),
            ),
          ),
          const SizedBox(height: 20),
          // Workflows list
          ...workflows.map(
            (workflow) => Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: WorkflowCard(
                workflow: workflow,
                canRun: points >= workflow.pointCost,
                showCost: false,
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
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class AiWorkflowRunnerScreen extends StatefulWidget {
  const AiWorkflowRunnerScreen({
    required this.workflow,
    required this.legalCase,
    super.key,
  });

  final AiWorkflow workflow;
  final LegalCase legalCase;

  @override
  State<AiWorkflowRunnerScreen> createState() => _AiWorkflowRunnerScreenState();
}

class _AiWorkflowRunnerScreenState extends State<AiWorkflowRunnerScreen>
    with TickerProviderStateMixin {
  int _step = 0; // 0: البيانات الأساسية, 1: الدفاع الموضوعي, 2: الدفوع الشكلية, 3: الخاتمة والطلبات
  bool _isProcessing = false;
  int _loadingPhase = 0; // 0: documents, 1: precedents, 2: complete
  Timer? _processingTimer;
  Timer? _phaseTimer;

  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;
  late Animation<double> _skeletonOpacityAnimation;
  late AnimationController _rotationController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..repeat(reverse: true);
    
    _pulseAnimation = Tween<double>(begin: 0.95, end: 1.05).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _skeletonOpacityAnimation = Tween<double>(begin: 0.35, end: 0.65).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _rotationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 8),
    )..repeat();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _rotationController.dispose();
    _processingTimer?.cancel();
    _phaseTimer?.cancel();
    super.dispose();
  }

  void _startAiAnalysisSimulation() {
    setState(() {
      _isProcessing = true;
      _loadingPhase = 0;
      _step = 1; // Advance stepper to Step 2 but display loading visual first
    });

    _phaseTimer = Timer(const Duration(milliseconds: 1500), () {
      if (mounted) {
        setState(() {
          _loadingPhase = 1;
        });
      }
    });

    _processingTimer = Timer(const Duration(milliseconds: 3000), () {
      if (mounted) {
        setState(() {
          _isProcessing = false;
          _loadingPhase = 2;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'تم التحليل القانوني الذكي بنجاح! ✓',
              style: TextStyle(fontFamily: 'Tajawal', fontWeight: FontWeight.bold),
            ),
            backgroundColor: Color(0xFF34BF49),
            duration: Duration(seconds: 2),
          ),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final scaffoldBg = isDark ? AppColors.darkBg : const Color(0xFFF0EEE7);

    return Scaffold(
      backgroundColor: scaffoldBg,
      appBar: AppBar(
        backgroundColor: scaffoldBg,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_forward), // RTL Back button
          color: AppColors.primary,
          onPressed: () {
            if (_isProcessing) {
              _processingTimer?.cancel();
              _phaseTimer?.cancel();
              setState(() {
                _isProcessing = false;
                _step = 0;
              });
            } else if (_step > 0) {
              setState(() {
                _step -= 1;
              });
            } else {
              Navigator.of(context).pop();
            }
          },
        ),
        titleSpacing: 0,
        title: Text(
          widget.workflow.title,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: AppColors.primary,
            fontFamily: 'Tajawal',
          ),
        ),
        actions: <Widget>[
          if (!_isProcessing && _step == 3)
            Container(
              margin: const EdgeInsets.only(left: 16.0, right: 16.0),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.green.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(999),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  Icon(Icons.check, color: Colors.green, size: 14),
                  SizedBox(width: 4),
                  Text(
                    'تم الحفظ ✓',
                    style: TextStyle(
                      color: Colors.green,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Tajawal',
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
      body: PopScope(
        canPop: !_isProcessing,
        onPopInvokedWithResult: (didPop, result) {
          if (didPop) return;
          if (_isProcessing) {
            _processingTimer?.cancel();
            _phaseTimer?.cancel();
            setState(() {
              _isProcessing = false;
              _step = 0;
            });
          }
        },
        child: Stack(
          children: <Widget>[
            // Decorative blur background element
            Positioned(
              top: -100,
              left: MediaQuery.of(context).size.width / 2 - 150,
              child: Container(
                width: 300,
                height: 300,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.primary.withValues(alpha: 0.05),
                ),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 80, sigmaY: 80),
                  child: Container(color: Colors.transparent),
                ),
              ),
            ),
            Column(
              children: <Widget>[
                // Stepper Navigation
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
                  child: _buildStepper(context),
                ),
                const Divider(height: 1),
                // Main Scrollable Area
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.only(left: 20, right: 20, top: 20, bottom: 120),
                    child: _isProcessing
                        ? _buildProcessingState(context)
                        : _buildStepContent(context),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
      bottomNavigationBar: _buildBottomActionBar(context),
    );
  }

  // High-Fidelity Custom Stepper Widget
  Widget _buildStepper(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final activeColor = AppColors.primary;
    final completedColor = const Color(0xFF34BF49);
    final pendingBgColor = isDark ? const Color(0xFF242424) : const Color(0xFFE4E2DC);
    final pendingTextColor = isDark ? Colors.white30 : const Color(0xA6141414);
    final lineColor = isDark ? Colors.white24 : const Color(0x1A1B1B1B);

    final steps = <Map<String, String>>[
      {'title': 'البيانات الأساسية'},
      {'title': _isProcessing ? 'التحليل الجاري' : 'الدفاع الموضوعي'},
      {'title': 'الدفوع الشكلية'},
      {'title': 'الخاتمة والطلبات'},
    ];

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: List<Widget>.generate(steps.length * 2 - 1, (index) {
          if (index.isOdd) {
            // Horizontal Step Line
            final stepIndex = index ~/ 2;
            final isCompleted = _step > stepIndex;
            return Expanded(
              child: Container(
                height: 1.5,
                color: isCompleted ? completedColor : lineColor,
                margin: const EdgeInsets.symmetric(horizontal: 6),
              ),
            );
          } else {
            // Step Circle + Text Label
            final stepIndex = index ~/ 2;
            final isActive = _step == stepIndex;
            final isCompleted = _step > stepIndex;

            Color circleBg;
            Widget circleChild;
            TextStyle textStyle;

            if (isCompleted) {
              circleBg = completedColor;
              circleChild = const Icon(Icons.check, color: Colors.white, size: 14);
              textStyle = TextStyle(
                color: isDark ? AppColors.darkMuted : AppColors.lightMuted,
                fontSize: 11,
                fontWeight: FontWeight.w500,
                fontFamily: 'Tajawal',
              );
            } else if (isActive) {
              circleBg = activeColor;
              circleChild = Text(
                '${stepIndex + 1}',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                  fontFamily: 'Tajawal',
                ),
              );
              textStyle = const TextStyle(
                color: AppColors.primary,
                fontSize: 11,
                fontWeight: FontWeight.bold,
                fontFamily: 'Tajawal',
              );
            } else {
              circleBg = pendingBgColor;
              circleChild = Text(
                '${stepIndex + 1}',
                style: TextStyle(
                  color: pendingTextColor,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                  fontFamily: 'Tajawal',
                ),
              );
              textStyle = TextStyle(
                color: pendingTextColor.withValues(alpha: 0.5),
                fontSize: 11,
                fontWeight: FontWeight.w500,
                fontFamily: 'Tajawal',
              );
            }

            return Opacity(
              opacity: (isCompleted || isActive) ? 1.0 : 0.4,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: circleBg,
                      shape: BoxShape.circle,
                      boxShadow: isActive
                          ? [
                              BoxShadow(
                                color: AppColors.primary.withValues(alpha: 0.2),
                                blurRadius: 8,
                                spreadRadius: 2,
                              )
                            ]
                          : null,
                    ),
                    alignment: Alignment.center,
                    child: circleChild,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    steps[stepIndex]['title']!,
                    style: textStyle,
                  ),
                ],
              ),
            );
          }
        }),
      ),
    );
  }

  // Redesigned AI Processing animation screen
  Widget _buildProcessingState(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBgColor = isDark ? AppColors.darkSurface : Colors.white;
    final textMuted = isDark ? AppColors.darkMuted : AppColors.lightMuted;
    final textColor = isDark ? Colors.white : AppColors.lightTitle;

    return AnimatedBuilder(
      animation: _pulseController,
      builder: (context, child) {
        final shimmerColor = isDark
            ? Color.lerp(const Color(0xFF1E1D13), const Color(0xFF26251A), _skeletonOpacityAnimation.value)!
            : Color.lerp(const Color(0xFFFBFBF4), const Color(0xFFF3F1E8), _skeletonOpacityAnimation.value)!;

        return Column(
          children: [
            Container(
              decoration: BoxDecoration(
                color: cardBgColor,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isDark ? AppColors.darkBorder : Colors.white.withValues(alpha: 0.6),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.01 : 0.03),
                    blurRadius: 24,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              padding: const EdgeInsets.all(28),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  // Rotating ring structure + pulsing auto_awesome gradient core
                  Center(
                    child: SizedBox(
                      width: 192,
                      height: 192,
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          // Outer rotating ring
                          RotationTransition(
                            turns: _rotationController,
                            child: Container(
                              width: 192,
                              height: 192,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: AppColors.primary.withValues(alpha: 0.2),
                                  width: 2,
                                ),
                              ),
                            ),
                          ),
                          // Middle static spacing ring
                          Container(
                            width: 160,
                            height: 160,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: AppColors.primary.withValues(alpha: 0.08),
                                width: 1.5,
                              ),
                            ),
                          ),
                          // Pulsing gradient core
                          ScaleTransition(
                            scale: _pulseAnimation,
                            child: Container(
                              width: 96,
                              height: 96,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: AppColors.mainGradient,
                                boxShadow: [
                                  BoxShadow(
                                    color: AppColors.primary.withValues(alpha: 0.25),
                                    blurRadius: 16,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              alignment: Alignment.center,
                              child: const Icon(
                                Icons.auto_awesome,
                                color: Colors.white,
                                size: 40,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 28),
                  Text(
                    'يعمل الذكاء الاصطناعي على التحليل... ⏳',
                    style: TextStyle(
                      color: textColor,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Tajawal',
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'قد يستغرق هذا دقيقة أو اثنتين',
                    style: TextStyle(
                      color: textMuted,
                      fontSize: 13,
                      fontFamily: 'Tajawal',
                    ),
                  ),
                  const SizedBox(height: 28),
                  // Bento loading status cards
                  Column(
                    children: <Widget>[
                      _buildSkeletonStatusCard(
                        context,
                        icon: Icons.description,
                        skeletonWidth: 130,
                        isActive: _loadingPhase == 0,
                        isCompleted: _loadingPhase > 0,
                        shimmerColor: _loadingPhase == 0 ? shimmerColor : (isDark ? const Color(0xFF1E1D13) : const Color(0xFFFBFBF4)),
                      ),
                      const SizedBox(height: 12),
                      Opacity(
                        opacity: _loadingPhase >= 1 ? 1.0 : 0.6,
                        child: _buildSkeletonStatusCard(
                          context,
                          icon: Icons.balance,
                          skeletonWidth: 160,
                          isActive: _loadingPhase == 1,
                          isCompleted: _loadingPhase > 1,
                          shimmerColor: _loadingPhase == 1 ? shimmerColor : (isDark ? const Color(0xFF1E1D13) : const Color(0xFFFBFBF4)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                'نقوم الآن بفحص الأدلة المقدمة ومطابقتها مع السوابق القضائية والمواد القانونية ذات الصلة لصياغة دفوع قانونية متينة.',
                style: TextStyle(
                  color: textMuted,
                  fontSize: 13,
                  height: 1.6,
                  fontFamily: 'Tajawal',
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        );
      },
    );
  }

  // Skeleton shimmer layout generator
  Widget _buildSkeletonStatusCard(
    BuildContext context, {
    required IconData icon,
    required double skeletonWidth,
    required bool isActive,
    required bool isCompleted,
    required Color shimmerColor,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final borderColor = isDark ? Colors.white.withValues(alpha: 0.05) : const Color(0x1F1B1B1B);

    return Container(
      height: 64,
      decoration: BoxDecoration(
        color: shimmerColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor, width: 1),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: <Widget>[
          Row(
            children: <Widget>[
              Icon(
                icon,
                color: isCompleted
                    ? const Color(0xFF34BF49)
                    : (isActive ? AppColors.primary : Colors.grey.withValues(alpha: 0.5)),
                size: 22,
              ),
              const SizedBox(width: 12),
              // Fake skeleton loading lines
              Container(
                width: skeletonWidth,
                height: 10,
                decoration: BoxDecoration(
                  color: isDark ? Colors.white24 : const Color(0x1F1B1B1B),
                  borderRadius: BorderRadius.circular(5),
                ),
              ),
            ],
          ),
          if (isActive)
            RotationTransition(
              turns: _rotationController,
              child: const Icon(
                Icons.sync,
                color: AppColors.primary,
                size: 20,
              ),
            )
          else if (isCompleted)
            const Icon(
              Icons.check_circle,
              color: Color(0xFF34BF49),
              size: 20,
            ),
        ],
      ),
    );
  }

  // Page contents depending on current step
  Widget _buildStepContent(BuildContext context) {
    switch (_step) {
      case 0:
        return _buildStep1BasicDetails(context);
      case 1:
        return _buildStep2ObjectiveDefense(context);
      case 2:
        return _buildStep3FormalDefense(context);
      case 3:
        return _buildStep4Conclusion(context);
      default:
        return const SizedBox.shrink();
    }
  }

  // Step 1 Layout: البيانات الأساسية
  Widget _buildStep1BasicDetails(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? AppColors.darkSurface : Colors.white;
    final textMuted = isDark ? AppColors.darkMuted : AppColors.lightMuted;
    final borderThemeColor = isDark ? AppColors.darkBorder : AppColors.lightBorder;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        // Case Summary Card
        Container(
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: borderThemeColor, width: 1),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.01 : 0.02),
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              const Text(
                'تفاصيل القضية',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                  fontFamily: 'Tajawal',
                ),
              ),
              const SizedBox(height: 16),
              _buildSummaryField('اسم القضية', widget.legalCase.title, context),
              _buildSummaryField('رقم القضية', widget.legalCase.caseNumber, context),
              _buildSummaryField('المحكمة المختصة', widget.legalCase.court, context),
            ],
          ),
        ),
        const SizedBox(height: 24),
        // Selected Facts List
        const Row(
          children: <Widget>[
            Icon(Icons.fact_check_outlined, color: AppColors.primary, size: 20),
            SizedBox(width: 8),
            Text(
              'الوقائع المتاحة للتحليل',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                fontFamily: 'Tajawal',
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Container(
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: borderThemeColor, width: 1),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.01 : 0.02),
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          padding: const EdgeInsets.all(20),
          child: Column(
            children: widget.legalCase.facts.map((fact) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 12.0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    const Icon(Icons.check_circle, color: Color(0xFF34BF49), size: 16),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        fact,
                        style: TextStyle(
                          fontSize: 13,
                          height: 1.5,
                          color: isDark ? Colors.white70 : AppColors.lightText,
                          fontFamily: 'Tajawal',
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 24),
        // Selected Documents List
        const Row(
          children: <Widget>[
            Icon(Icons.attachment, color: AppColors.primary, size: 20),
            SizedBox(width: 8),
            Text(
              'المستندات الملحقة',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                fontFamily: 'Tajawal',
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Container(
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: borderThemeColor, width: 1),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.01 : 0.02),
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          padding: const EdgeInsets.all(20),
          child: Column(
            children: <Widget>[
              Row(
                children: <Widget>[
                  const Icon(Icons.insert_drive_file, color: AppColors.primary, size: 18),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'تقرير الطب الشرعي الفني.pdf',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        fontFamily: 'Tajawal',
                        color: isDark ? Colors.white : AppColors.lightTitle,
                      ),
                    ),
                  ),
                  const Text(
                    'تم التحميل',
                    style: TextStyle(fontSize: 12, color: Colors.green, fontFamily: 'Tajawal'),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: <Widget>[
                  const Icon(Icons.insert_drive_file, color: AppColors.primary, size: 18),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'عقد البيع المسجل المشتبه به.pdf',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        fontFamily: 'Tajawal',
                        color: isDark ? Colors.white : AppColors.lightTitle,
                      ),
                    ),
                  ),
                  const Text(
                    'تم التحميل',
                    style: TextStyle(fontSize: 12, color: Colors.green, fontFamily: 'Tajawal'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryField(String label, String value, BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          SizedBox(
            width: 110,
            child: Text(
              label,
              style: TextStyle(
                color: isDark ? AppColors.darkMuted : AppColors.lightMuted,
                fontSize: 13,
                fontFamily: 'Tajawal',
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 13,
                fontFamily: 'Tajawal',
                color: isDark ? Colors.white : AppColors.lightTitle,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Step 2 Layout: الدفاع الموضوعي
  Widget _buildStep2ObjectiveDefense(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? AppColors.darkSurface : Colors.white;
    final textMuted = isDark ? AppColors.darkMuted : AppColors.lightMuted;
    final borderThemeColor = isDark ? AppColors.darkBorder : AppColors.lightBorder;

    return Container(
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: borderThemeColor, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.01 : 0.02),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          // Header Section
          Padding(
            padding: const EdgeInsets.only(left: 24, right: 24, top: 24, bottom: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'الدفاع الموضوعي',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, fontFamily: 'Tajawal'),
                ),
                const SizedBox(height: 4),
                Text(
                  'راجع الدفوع المستخرجة وقم بتعديلها إذا لزم الأمر',
                  style: TextStyle(fontSize: 12, color: textMuted, fontFamily: 'Tajawal'),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          // Body Content
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                // AI Highlight Card
                Container(
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1E1D13) : const Color(0xFFFBFAE8),
                    borderRadius: BorderRadius.circular(12),
                    border: Border(
                      right: BorderSide(color: AppColors.primary, width: 4),
                    ),
                  ),
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      const Icon(Icons.auto_awesome, color: AppColors.primary, size: 20),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            const Text(
                              'تحليل الذكاء الاصطناعي للموقف القانوني',
                              style: TextStyle(
                                color: AppColors.primary,
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'Tajawal',
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'بناءً على ملف القضية المرفوع، تم استخلاص الدفوع التالية التي تركز على انتفاء الركن المادي والمعنوي في الواقعة المنصوبة لموكلكم.',
                              style: TextStyle(
                                fontSize: 13,
                                height: 1.6,
                                fontFamily: 'Tajawal',
                                color: isDark ? Colors.white70 : AppColors.lightText,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 28),
                // Custom editorial dynamic document contents
                _buildWorkflowMemoContent(),
                const SizedBox(height: 28),
                // Recommendation box
                Container(
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1D1E15) : const Color(0xFFFBFAE8),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.primary.withValues(alpha: 0.15)),
                  ),
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      const Icon(Icons.lightbulb_outline, color: AppColors.primary, size: 22),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            const Text(
                              'توصية قانونية',
                              style: TextStyle(
                                color: AppColors.primary,
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'Tajawal',
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              _getRecommendationText(),
                              style: TextStyle(
                                fontSize: 13,
                                height: 1.6,
                                fontFamily: 'Tajawal',
                                color: isDark ? Colors.white70 : AppColors.lightText,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Step 3 Layout: الدفوع الشكلية
  Widget _buildStep3FormalDefense(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? AppColors.darkSurface : Colors.white;
    final textMuted = isDark ? AppColors.darkMuted : AppColors.lightMuted;
    final borderThemeColor = isDark ? AppColors.darkBorder : AppColors.lightBorder;
    final headingColor = isDark ? AppColors.primary : const Color(0xFF885200);

    return Container(
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: borderThemeColor, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.01 : 0.02),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          // Header Section
          Padding(
            padding: const EdgeInsets.only(left: 24, right: 24, top: 24, bottom: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'الدفوع الشكلية',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, fontFamily: 'Tajawal'),
                ),
                const SizedBox(height: 4),
                Text(
                  'الدفاع الإجرائي الشكلي لثغرات سير الدعوى والمستندات',
                  style: TextStyle(fontSize: 12, color: textMuted, fontFamily: 'Tajawal'),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          // Body Content
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  'أولاً: الدفع بعدم اختصاص المحكمة محلياً بنظر الدعوى',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: headingColor,
                    fontFamily: 'Tajawal',
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'حيث أن الثابت من صحيفة الدعوى أن موطن المدعى عليه يقع خارج نطاق دائرة هذه المحكمة الموقرة، وحيث أن المادة ٢٧ من قانون المرافق ترتب الاختصاص للمحكمة التي يقع في دائرتها موطن المدعى عليه، فبذلك يتعين الدفع بعدم الاختصاص المحلي.',
                  style: TextStyle(
                    fontSize: 13,
                    color: isDark ? Colors.white70 : AppColors.lightText,
                    height: 1.7,
                    fontFamily: 'Tajawal',
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  'ثانياً: الدفع ببطلان صحيفة الدعوى للجهالة',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: headingColor,
                    fontFamily: 'Tajawal',
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'نظراً لعدم بيان الصفة الدقيقة لأطراف الخصومة القانونية وتناقض تفاصيل المطالبة المالية مع أصل العقد الملحق، نتمسك ببطلان الصحيفة طبقاً للمادة ٨٦ من قانون المرافعات.',
                  style: TextStyle(
                    fontSize: 13,
                    color: isDark ? Colors.white70 : AppColors.lightText,
                    height: 1.7,
                    fontFamily: 'Tajawal',
                  ),
                ),
                const SizedBox(height: 28),
                // Recommendation box
                Container(
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1D1E15) : const Color(0xFFFBFAE8),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.primary.withValues(alpha: 0.15)),
                  ),
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      const Icon(Icons.lightbulb_outline, color: AppColors.primary, size: 22),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            const Text(
                              'توصية قانونية',
                              style: TextStyle(
                                color: AppColors.primary,
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'Tajawal',
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'يُنصح بتقديم شهادة من مصلحة الأحوال المدنية تثبت الموطن الحقيقي للمتهم لتأكيد صحة الدفع بعدم الاختصاص المحلي.',
                              style: TextStyle(
                                fontSize: 13,
                                height: 1.6,
                                fontFamily: 'Tajawal',
                                color: isDark ? Colors.white70 : AppColors.lightText,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Step 4 Layout: الخاتمة والطلبات
  Widget _buildStep4Conclusion(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? AppColors.darkSurface : Colors.white;
    final textMuted = isDark ? AppColors.darkMuted : AppColors.lightMuted;
    final borderThemeColor = isDark ? AppColors.darkBorder : AppColors.lightBorder;
    final headingColor = isDark ? AppColors.primary : const Color(0xFF885200);

    return Container(
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: borderThemeColor, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.01 : 0.02),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          // Header Section
          Padding(
            padding: const EdgeInsets.only(left: 24, right: 24, top: 24, bottom: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'الخاتمة والطلبات',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, fontFamily: 'Tajawal'),
                ),
                const SizedBox(height: 4),
                Text(
                  'الصيغة النهائية للطلبات الموجهة لهيئة المحكمة الموقرة',
                  style: TextStyle(fontSize: 12, color: textMuted, fontFamily: 'Tajawal'),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          // Body Content
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  'بناءً على ما تقدم من دفوع قانونية وأسانيد واقعية فنية، يلتمس دفاع المتهم من عدالة المحكمة الموقرة القضاء بـ:',
                  style: TextStyle(
                    fontSize: 14,
                    color: isDark ? Colors.white70 : AppColors.lightText,
                    height: 1.7,
                    fontFamily: 'Tajawal',
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  'أولاً وبصفة أصلية:',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: headingColor,
                    fontFamily: 'Tajawal',
                  ),
                ),
                const SizedBox(height: 8),
                Padding(
                  padding: const EdgeInsets.only(right: 12.0),
                  child: Text(
                    'براءة المتهم من كافة التهم المنسوبة إليه لانتفاء الركن المادي والمعنوي وخلو الأوراق من أي دليل.',
                    style: TextStyle(
                      fontSize: 13,
                      height: 1.6,
                      color: isDark ? Colors.white70 : AppColors.lightText,
                      fontFamily: 'Tajawal',
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  'ثانياً وبصفة احتياطية:',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: headingColor,
                    fontFamily: 'Tajawal',
                  ),
                ),
                const SizedBox(height: 8),
                Padding(
                  padding: const EdgeInsets.only(right: 12.0),
                  child: Text(
                    'refusal/رفض الدعوى المدنية التبعية المقامة من المدعين بالحق المدني وإلزامهم بكافة الرسوم القضائية ومصاريف المحاماة.',
                    style: TextStyle(
                      fontSize: 13,
                      height: 1.6,
                      color: isDark ? Colors.white70 : AppColors.lightText,
                      fontFamily: 'Tajawal',
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                // Document Action Buttons (Inside Card)
                Row(
                  children: <Widget>[
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () {
                          Clipboard.setData(
                            const ClipboardData(
                              text:
                                  'بناءً على ما تقدم من دفوع قانونية، يلتمس دفاع المتهم القضاء ببراءته ورفض الدعوى المدنية.',
                            ),
                          );
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                'تم نسخ النص إلى الحافظة! ✓',
                                style: TextStyle(fontFamily: 'Tajawal', fontWeight: FontWeight.bold),
                              ),
                              backgroundColor: Color(0xFF34BF49),
                              duration: Duration(seconds: 2),
                            ),
                          );
                        },
                        icon: const Icon(Icons.copy_all, size: 18),
                        label: const Text(
                          'نسخ النص',
                          style: TextStyle(fontWeight: FontWeight.bold, fontFamily: 'Tajawal'),
                        ),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.primary,
                          side: const BorderSide(color: AppColors.primary, width: 1.5),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: AppColors.mainGradient,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: ElevatedButton.icon(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text(
                                  'تم تصدير المذكرة كـ PDF بنجاح 📄',
                                  style: TextStyle(fontFamily: 'Tajawal', fontWeight: FontWeight.bold),
                                ),
                                backgroundColor: AppColors.primary,
                                duration: Duration(seconds: 2),
                              ),
                            );
                          },
                          icon: const Icon(Icons.picture_as_pdf, size: 18),
                          label: const Text(
                            'تصدير PDF',
                            style: TextStyle(fontWeight: FontWeight.bold, fontFamily: 'Tajawal'),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.transparent,
                            foregroundColor: Colors.white,
                            shadowColor: Colors.transparent,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                          ),
                        ),
                      ),
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

  // Dynamic content block mapping depending on selected workflow title
  Widget _buildWorkflowMemoContent() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final headingColor = isDark ? AppColors.primary : const Color(0xFF885200);
    final textStyle = TextStyle(
      fontSize: 13,
      height: 1.7,
      fontFamily: 'Tajawal',
      color: isDark ? Colors.white70 : AppColors.lightText,
    );

    if (widget.workflow.title.contains('دفاع')) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            'أولاً: انتفاء الركن المادي للجريمة',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: headingColor, fontFamily: 'Tajawal'),
          ),
          const SizedBox(height: 8),
          Text(
            'حيث أن الثابت من أوراق الدعوى وخلوها من ثمة دليل قاطع يربط المتهم بالواقعة محل التحقيق، فإن الركن المادي للجريمة يظل في حيز العدم القانوني، وذلك للأسباب التالية:',
            style: textStyle,
          ),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.only(right: 12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('• ', style: TextStyle(fontWeight: FontWeight.bold)),
                    Expanded(child: Text('عدم وجود معاينة فعلية لمكان الواقعة تثبت صحة ادعاءات المدعي.', style: textStyle)),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('• ', style: TextStyle(fontWeight: FontWeight.bold)),
                    Expanded(child: Text('تناقض أقوال الشهود فيما بينهم حول توقيت وكيفية حدوث الفعل المزعوم.', style: textStyle)),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('• ', style: TextStyle(fontWeight: FontWeight.bold)),
                    Expanded(child: Text('خلو التقارير الفنية المرفقة من أي أثر مادي مباشر ينسب للمتهم.', style: textStyle)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'ثانياً: انعدام القصد الجنائي (الركن المعنوي)',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: headingColor, fontFamily: 'Tajawal'),
          ),
          const SizedBox(height: 8),
          Text(
            'على فرض جدلي بوقوع الفعل، فإن نية الإضرار أو العلم بكون الفعل مجرماً لم تكن قائمة لدى المتهم، وهو ما يبرهن عليه السلوك اللاحق للمتهم وتعاونة التام مع جهات التحقيق فور علمه بالأمر.',
            style: textStyle,
          ),
        ],
      );
    } else if (widget.workflow.title.contains('دعوى')) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            'أولاً: صفة ومصلحة المدعي في القضية',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: headingColor, fontFamily: 'Tajawal'),
          ),
          const SizedBox(height: 8),
          Text(
            'تأسست مصلحة موكلنا بموجب عقد وكالة ساري ومسجل قانونياً، مما يمنحه الصفة والمصلحة المباشرة في رفع الدعوى للمطالبة بالحقوق المغتصبة والتعويض عن الأضرار المادية اللاحقة.',
            style: textStyle,
          ),
          const SizedBox(height: 24),
          Text(
            'ثانياً: ثبوت إخلال الطرف الآخر بالالتزامات العقدية',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: headingColor, fontFamily: 'Tajawal'),
          ),
          const SizedBox(height: 8),
          Text(
            'تأخر الطرف الثاني في تسليم الشحنات موضوع العقد دون مبرر قانوني أو قوة قاهرة، مما ترتب عليه أضرار جسيمة بالعمليات التشغيلية، ويثبت إخلاله الجسيم بالبند الخامس والسابع من شروط الاتفاق.',
            style: textStyle,
          ),
        ],
      );
    } else if (widget.workflow.title.contains('حكم')) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            'أولاً: القصور في تسبيب الحكم الابتدائي ومخالفة الثابت بالأوراق',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: headingColor, fontFamily: 'Tajawal'),
          ),
          const SizedBox(height: 8),
          Text(
            'أغفل الحكم مناقشة حافظة المستندات رقم ٣ المقدمة بجلسة الاستماع الأخيرة والتي احتوت على إقرار واضح بالاستلام والتسوية المالية، مما يعيب الحكم بالقصور المبطل والفساد في الاستدلال.',
            style: textStyle,
          ),
          const SizedBox(height: 24),
          Text(
            'ثانياً: الخطأ في تطبيق القانون وتأويله',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: headingColor, fontFamily: 'Tajawal'),
          ),
          const SizedBox(height: 8),
          Text(
            'طبق الحكم نص المادة ٢٢٤ من القانون المدني على واقعة نزاع تجاري بحت، مغفلاً الأحكام الخاصة بالقانون التجاري المصري التي تحكم تصفية الحسابات التجارية بين الشركات.',
            style: textStyle,
          ),
        ],
      );
    } else {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            'أولاً: الأسانيد الواقعية الداعمة للطلب',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: headingColor, fontFamily: 'Tajawal'),
          ),
          const SizedBox(height: 8),
          Text(
            'تتلخص الأسانيد في إثبات أحقية موكلنا باتخاذ الإجراء القانوني، استناداً إلى الوثائق والمستندات الكتابية المقدمة والمرفقة بملف هذه الخدمة.',
            style: textStyle,
          ),
          const SizedBox(height: 24),
          Text(
            'ثانياً: القواعد والنصوص القانونية المرتبطة',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: headingColor, fontFamily: 'Tajawal'),
          ),
          const SizedBox(height: 8),
          Text(
            'بموجب المواد القانونية المنظمة، فإن سلوك هذا المسار يضمن حفظ كافة المواعيد الإجرائية لحقوق الطرفين ويمنع سقوطها بالتقادم.',
            style: textStyle,
          ),
        ],
      );
    }
  }

  String _getRecommendationText() {
    if (widget.workflow.title.contains('دفاع')) {
      return 'يُنصح بالتركيز في المرافعة الشفوية على "انقطاع رابطة السببية" بين فعل المتهم والنتيجة الإجرامية استناداً إلى تقرير الخبير الاستشاري.';
    } else if (widget.workflow.title.contains('دعوى')) {
      return 'يُنصح بإرفاق فواتير الاستلام الموقعة لتأكيد صحة المبالغ المطالب بها وتقوية الأساس الواقعي لصحيفة الدعوى.';
    } else if (widget.workflow.title.contains('حكم')) {
      return 'يُنصح بالتركيز على إغفال الحكم الابتدائي للرد على الدفع الجوهري بانتهاء مدة العقد كأساس استئنافي قوي.';
    } else {
      return 'يُنصح بمراجعة جميع المستندات المرفقة وتأكيد التواريخ لتجنب أي دفع شكلي متعلق بالمواعيد.';
    }
  }

  // Transactional footer matching mockup exactly
  Widget _buildBottomActionBar(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final footerBg = isDark ? AppColors.darkSurface.withValues(alpha: 0.9) : Colors.white.withValues(alpha: 0.95);
    final borderThemeColor = isDark ? AppColors.darkBorder : AppColors.lightBorder;

    return Container(
      height: 90,
      decoration: BoxDecoration(
        color: footerBg,
        border: Border(top: BorderSide(color: borderThemeColor, width: 0.5)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.02 : 0.04),
            blurRadius: 16,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: <Widget>[
          // Previous button (enabled if step > 0 or currently running AI simulation to cancel)
          OutlinedButton(
            onPressed: (_step == 0 && !_isProcessing)
                ? null
                : () {
                    if (_isProcessing) {
                      _processingTimer?.cancel();
                      _phaseTimer?.cancel();
                      setState(() {
                        _isProcessing = false;
                        _step = 0;
                      });
                    } else {
                      setState(() {
                        _step -= 1;
                      });
                    }
                  },
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.primary,
              disabledForegroundColor: Colors.grey.withValues(alpha: 0.3),
              side: BorderSide(
                color: (_step == 0 && !_isProcessing)
                    ? Colors.grey.withValues(alpha: 0.15)
                    : AppColors.primary.withValues(alpha: 0.5),
                width: 1.5,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(999),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                Icon(Icons.arrow_forward, size: 16),
                SizedBox(width: 6),
                Text(
                  'السابق',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, fontFamily: 'Tajawal'),
                ),
              ],
            ),
          ),
          // Middle profile segment representing the lawyer
          if (!_isProcessing && _step > 0 && _step < 3)
            Row(
              children: <Widget>[
                const UserTieAvatar(
                  size: 36,
                  backgroundColor: AppColors.primary,
                  iconColor: Colors.white,
                ),
                const SizedBox(width: 10),
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      'الأستاذ أحمد كمال',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'Tajawal',
                        color: isDark ? Colors.white : AppColors.lightTitle,
                      ),
                    ),
                    const Text(
                      'محامٍ بالنقض',
                      style: TextStyle(
                        fontSize: 10,
                        color: Colors.grey,
                        fontFamily: 'Tajawal',
                      ),
                    ),
                  ],
                ),
              ],
            ),
          // Next/Simulate analysis button
          InkWell(
            onTap: _isProcessing
                ? null
                : () {
                    if (_step == 0) {
                      _startAiAnalysisSimulation();
                    } else if (_step < 3) {
                      setState(() {
                        _step += 1;
                      });
                    } else {
                      // Final Step: Export PDF
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text(
                            'تم تصدير المذكرة كـ PDF بنجاح 📄',
                            style: TextStyle(fontFamily: 'Tajawal', fontWeight: FontWeight.bold),
                          ),
                          backgroundColor: AppColors.primary,
                          duration: Duration(seconds: 2),
                        ),
                      );
                    }
                  },
            borderRadius: BorderRadius.circular(999),
            child: Container(
              decoration: BoxDecoration(
                gradient: _isProcessing ? null : AppColors.mainGradient,
                color: _isProcessing ? Colors.grey.shade300 : null,
                borderRadius: BorderRadius.circular(999),
                boxShadow: _isProcessing
                    ? null
                    : [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.25),
                          blurRadius: 16,
                          offset: const Offset(0, 6),
                        ),
                      ],
              ),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  if (_isProcessing) ...[
                    const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'جاري التحليل...',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                        fontFamily: 'Tajawal',
                      ),
                    ),
                  ] else ...[
                    Text(
                      _step == 0
                          ? 'بدء التحليل'
                          : (_step == 3 ? 'تصدير PDF' : 'التالي'),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                        fontFamily: 'Tajawal',
                      ),
                    ),
                    const SizedBox(width: 6),
                    Icon(
                      _step == 3 ? Icons.picture_as_pdf : Icons.arrow_back,
                      color: Colors.white,
                      size: 16,
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
