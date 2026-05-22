import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:ui';
import 'package:flutter/foundation.dart' show kIsWeb, kDebugMode;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../app/app_state.dart';
import '../../core/models/legal_models.dart';
import '../../core/models/workflow_snapshot_model.dart';
import '../../core/data/demo_legal_repository.dart';
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
    return ListenableBuilder(
      listenable: appState,
      builder: (context, _) {
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
              icon: const Icon(Icons.arrow_back),
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
                  child: WorkflowItemCard(
                    appState: appState,
                    workflow: workflow,
                    legalCase: legalCase,
                    canRun: points >= workflow.pointCost,
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class WorkflowItemCard extends StatelessWidget {
  const WorkflowItemCard({
    required this.appState,
    required this.workflow,
    required this.legalCase,
    required this.canRun,
    super.key,
  });

  final AppState appState;
  final AiWorkflow workflow;
  final LegalCase legalCase;
  final bool canRun;

  String _getWorkflowType(String workflowId) {
    if (workflowId.startsWith('workflow-defense-')) return 'defense-memo';
    if (workflowId.startsWith('workflow-claim-')) return 'preparing-statement-of-claims';
    if (workflowId.startsWith('workflow-appeal-')) return 'appeal-brief';
    if (workflowId.startsWith('workflow-complaint-')) return 'admin-complaint';
    if (workflowId.startsWith('workflow-ruling-')) return 'ruling-analysis';
    if (workflowId.startsWith('workflow-warning-')) return 'legal-warning';
    if (workflowId.startsWith('workflow-execution-')) return 'exec-request';
    return 'defense-memo';
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? AppColors.darkSurface : Colors.white;
    final textColor = isDark ? Colors.white : AppColors.lightTitle;
    final mutedTextColor = isDark ? AppColors.darkMuted : AppColors.lightMuted;
    final borderColor = isDark ? AppColors.darkBorder : AppColors.lightBorder;

    final type = _getWorkflowType(workflow.id);
    final draft = appState.getOrCreateDraft(legalCase.id, type);
    final snapshots = appState.snapshotsForCaseAndWorkflow(legalCase.id, type);

    IconData icon;
    switch (workflow.iconName) {
      case 'bolt': icon = Icons.bolt; break;
      case 'description': icon = Icons.description; break;
      case 'gavel': icon = Icons.gavel; break;
      case 'warning': icon = Icons.warning_amber_rounded; break;
      case 'analytics': icon = Icons.analytics_outlined; break;
      case 'fact_check': icon = Icons.fact_check_outlined; break;
      case 'task': icon = Icons.task_outlined; break;
      default: icon = Icons.bolt;
    }

    // Determine status badge
    String statusText = 'لم تبدأ';
    Color statusColor = Colors.grey;
    Color statusBg = isDark ? Colors.white10 : Colors.grey.shade200;

    if (draft.currentStep > 0) {
      if (draft.status == 'Completed') {
        statusText = 'منجزة';
        statusColor = const Color(0xFF34BF49);
        statusBg = const Color(0xFF34BF49).withValues(alpha: 0.15);
      } else {
        statusText = 'مسودة (خطوة ${draft.currentStep})';
        statusColor = AppColors.primary;
        statusBg = AppColors.primary.withValues(alpha: 0.15);
      }
    }

    return Container(
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: borderColor, width: 1),
        boxShadow: [
          BoxShadow(
            color: isDark ? const Color(0x02000000) : const Color(0x08885200),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Row: Icon and Title
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(icon, color: AppColors.primary, size: 26),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            workflow.title,
                            style: TextStyle(
                              color: textColor,
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'Tajawal',
                            ),
                          ),
                        ),
                        Container(
                          decoration: BoxDecoration(
                            color: statusBg,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          child: Text(
                            statusText,
                            style: TextStyle(
                              color: statusColor,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'Tajawal',
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    // Version history count badge if existing snapshots
                    if (snapshots.isNotEmpty) ...[
                      Row(
                        children: [
                          const Icon(Icons.history, size: 12, color: AppColors.primary),
                          const SizedBox(width: 4),
                          Text(
                            '${snapshots.length} نسخ سابقة',
                            style: const TextStyle(
                              color: AppColors.primary,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'Tajawal',
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                    ],
                    Text(
                      workflow.description,
                      style: TextStyle(
                        color: mutedTextColor,
                        fontSize: 11,
                        height: 1.3,
                        fontFamily: 'Tajawal',
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Divider(height: 1),
          const SizedBox(height: 12),
          // Action Buttons Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Version history quick link if existing snapshots
              if (snapshots.isNotEmpty)
                TextButton.icon(
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute<void>(
                        builder: (_) => WorkflowHistoryScreen(
                          appState: appState,
                          caseId: legalCase.id,
                          workflowType: type,
                          workflowTitle: workflow.title,
                        ),
                      ),
                    );
                  },
                  icon: const Icon(Icons.history, size: 14),
                  label: const Text(
                    'النسخ السابقة',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, fontFamily: 'Tajawal'),
                  ),
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  ),
                )
              else
                const SizedBox.shrink(),
              // Runner action buttons
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Draft exists with progress -> option to start new or resume
                  if (draft.currentStep > 0) ...[
                    OutlinedButton(
                      onPressed: () {
                        // Confirm starting new run
                        showDialog<void>(
                          context: context,
                          builder: (dialogCtx) => AlertDialog(
                            title: const Text('بدء مسار جديد', style: TextStyle(fontFamily: 'Tajawal', fontWeight: FontWeight.bold)),
                            content: const Text(
                              'هل تريد بدء مسار جديد؟ سيتم حفظ مسودتك الحالية تلقائياً في سجل النسخ السابقة.',
                              style: TextStyle(fontFamily: 'Tajawal'),
                            ),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.of(dialogCtx).pop(),
                                child: const Text('إلغاء', style: TextStyle(fontFamily: 'Tajawal')),
                              ),
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
                                onPressed: () {
                                  Navigator.of(dialogCtx).pop();
                                  appState.startNewWorkflowRun(legalCase.id, type);
                                  Navigator.of(context).push(
                                    MaterialPageRoute<void>(
                                      builder: (_) => AiWorkflowRunnerScreen(
                                        appState: appState,
                                        workflow: workflow,
                                        legalCase: legalCase,
                                        workflowType: type,
                                      ),
                                    ),
                                  );
                                },
                                child: const Text('بدء جديد', style: TextStyle(fontFamily: 'Tajawal', color: Colors.white)),
                              ),
                            ],
                          ),
                        );
                      },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.primary,
                        side: const BorderSide(color: AppColors.primary),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                      child: const Text('بدء جديد', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, fontFamily: 'Tajawal')),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute<void>(
                            builder: (_) => AiWorkflowRunnerScreen(
                              appState: appState,
                              workflow: workflow,
                              legalCase: legalCase,
                              workflowType: type,
                            ),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                      child: Text(
                        draft.status == 'Completed' ? 'مراجعة النتائج' : 'استكمال المسار',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, fontFamily: 'Tajawal'),
                      ),
                    ),
                  ] else ...[
                    // Not started yet
                    ElevatedButton(
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute<void>(
                            builder: (_) => AiWorkflowRunnerScreen(
                              appState: appState,
                              workflow: workflow,
                              legalCase: legalCase,
                              workflowType: type,
                            ),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      ),
                      child: const Text('بدء', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, fontFamily: 'Tajawal')),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
                      class AiWorkflowRunnerScreen extends StatefulWidget {
  const AiWorkflowRunnerScreen({
    required this.appState,
    required this.workflow,
    required this.legalCase,
    required this.workflowType,
    super.key,
  });

  final AppState appState;
  final AiWorkflow workflow;
  final LegalCase legalCase;
  final String workflowType;

  @override
  State<AiWorkflowRunnerScreen> createState() => _AiWorkflowRunnerScreenState();
}

class _AiWorkflowRunnerScreenState extends State<AiWorkflowRunnerScreen>
    with TickerProviderStateMixin {
  int _step = 0;
  bool _isProcessing = false;
  int _processingPhase = 0; // 0: scanning, 1: generating
  Timer? _processingTimer;
  Timer? _phaseTimer;
  DateTime? _lastSavedAt;
  bool _ignoreNextListener = false;

  // Animation controllers for pulsing & rotation
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;
  late Animation<double> _skeletonOpacityAnimation;
  late AnimationController _rotationController;

  // Local map to store all dynamic text editing controllers
  final Map<String, dynamic> _textControllers = {};

  @override
  void initState() {
    super.initState();
    final draft = widget.appState.getOrCreateDraft(widget.legalCase.id, widget.workflowType);
    _step = draft.currentStep;
    _lastSavedAt = draft.lastSavedAt;
    widget.appState.addListener(_onAppStateChanged);

    // Join case-specific SignalR group
    widget.appState.signalR.joinCase(widget.legalCase.id);

    // Fetch snapshots for history
    widget.appState.fetchSnapshotsForCase(widget.legalCase.id);

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

    _initializeControllers();
  }

  @override
  void dispose() {
    widget.appState.removeListener(_onAppStateChanged);

    // Leave case-specific SignalR group
    widget.appState.signalR.leaveCase(widget.legalCase.id);

    _disposeControllers();
    _pulseController.dispose();
    _rotationController.dispose();
    _processingTimer?.cancel();
    _phaseTimer?.cancel();
    super.dispose();
  }

  void _onAppStateChanged() {
    if (mounted) {
      if (_ignoreNextListener) {
        _ignoreNextListener = false;
        final draft = widget.appState.getOrCreateDraft(widget.legalCase.id, widget.workflowType);
        _lastSavedAt = draft.lastSavedAt;
        return;
      }
      final draft = widget.appState.getOrCreateDraft(widget.legalCase.id, widget.workflowType);

      // If we are currently processing a backend/SignalR job, and the output is updated:
      if (_isProcessing) {
        final stepOutput = draft.outputs[_step];
        if (stepOutput != null && stepOutput.isNotEmpty) {
          _processingTimer?.cancel();
          _phaseTimer?.cancel();
          setState(() {
            _isProcessing = false;
            _lastSavedAt = draft.lastSavedAt;
          });
          _initializeControllers();

          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text(
                'تم التحليل الذكي للخطوة بنجاح! ✓ (تحديث فوري)',
                style: TextStyle(fontFamily: 'Tajawal', fontWeight: FontWeight.bold),
              ),
              backgroundColor: Color(0xFF007AFF),
              duration: Duration(seconds: 1),
            ),
          );
          return;
        }
      }

      if (_step != draft.currentStep || _lastSavedAt != draft.lastSavedAt) {
        setState(() {
          _step = draft.currentStep;
          _lastSavedAt = draft.lastSavedAt;
        });
        _initializeControllers();
      }
    }
  }

  void _initializeControllers() {
    _disposeControllers();
    final draft = widget.appState.getOrCreateDraft(widget.legalCase.id, widget.workflowType);
    final stepOutput = draft.outputs[_step];
    if (stepOutput == null) return;

    stepOutput.forEach((key, value) {
      if (value is String) {
        final c = TextEditingController(text: value);
        _textControllers[key] = c;
        c.addListener(() {
          _saveCurrentFieldState(key, c.text);
        });
      } else if (value is List && value.every((e) => e is String)) {
        final controllers = value.map((item) => TextEditingController(text: item.toString())).toList();
        _textControllers[key] = controllers;
        for (int i = 0; i < controllers.length; i++) {
          controllers[i].addListener(() {
            _saveListFieldState(key);
          });
        }
      } else if (value is List) {
        final List<Map<String, TextEditingController>> listMapControllers = [];
        for (final mapItem in value) {
          final Map<String, TextEditingController> mapControllers = {};
          if (mapItem is Map) {
            mapItem.forEach((k, v) {
              final c = TextEditingController(text: v?.toString() ?? '');
              mapControllers[k.toString()] = c;
              c.addListener(() {
                _saveMapListFieldState(key);
              });
            });
          }
          listMapControllers.add(mapControllers);
        }
        _textControllers[key] = listMapControllers;
      } else if (value is Map) {
        final Map<String, TextEditingController> mapControllers = {};
        value.forEach((k, v) {
          final c = TextEditingController(text: v?.toString() ?? '');
          mapControllers[k.toString()] = c;
          c.addListener(() {
            _saveMapFieldState(key);
          });
        });
        _textControllers[key] = mapControllers;
      }
    });
  }

  void _disposeControllers() {
    _textControllers.forEach((key, value) {
      if (value is TextEditingController) {
        value.dispose();
      } else if (value is List<TextEditingController>) {
        for (final c in value) {
          c.dispose();
        }
      } else if (value is List<Map<String, TextEditingController>>) {
        for (final map in value) {
          for (final c in map.values) {
            c.dispose();
          }
        }
      } else if (value is Map<String, TextEditingController>) {
        for (final c in value.values) {
          c.dispose();
        }
      }
    });
    _textControllers.clear();
  }

  void _saveCurrentFieldState(String key, String text) {
    final draft = widget.appState.getOrCreateDraft(widget.legalCase.id, widget.workflowType);
    final stepOutput = Map<String, dynamic>.from(draft.outputs[_step] ?? {});
    stepOutput[key] = text;
    _ignoreNextListener = true;
    widget.appState.saveDraftStep(widget.legalCase.id, widget.workflowType, _step, stepOutput);
  }

  void _saveListFieldState(String key) {
    final controllers = _textControllers[key] as List<TextEditingController>;
    final newList = controllers.map((c) => c.text).toList();
    final draft = widget.appState.getOrCreateDraft(widget.legalCase.id, widget.workflowType);
    final stepOutput = Map<String, dynamic>.from(draft.outputs[_step] ?? {});
    stepOutput[key] = newList;
    _ignoreNextListener = true;
    widget.appState.saveDraftStep(widget.legalCase.id, widget.workflowType, _step, stepOutput);
  }

  void _saveMapListFieldState(String key) {
    final listMapControllers = _textControllers[key] as List<Map<String, TextEditingController>>;
    final newList = listMapControllers.map((mapControllers) {
      return mapControllers.map((k, c) => MapEntry(k, c.text));
    }).toList();
    final draft = widget.appState.getOrCreateDraft(widget.legalCase.id, widget.workflowType);
    final stepOutput = Map<String, dynamic>.from(draft.outputs[_step] ?? {});
    stepOutput[key] = newList;
    _ignoreNextListener = true;
    widget.appState.saveDraftStep(widget.legalCase.id, widget.workflowType, _step, stepOutput);
  }

  void _saveMapFieldState(String key) {
    final mapControllers = _textControllers[key] as Map<String, TextEditingController>;
    final newMap = mapControllers.map((k, c) => MapEntry(k, c.text));
    final draft = widget.appState.getOrCreateDraft(widget.legalCase.id, widget.workflowType);
    final stepOutput = Map<String, dynamic>.from(draft.outputs[_step] ?? {});
    stepOutput[key] = newMap;
    _ignoreNextListener = true;
    widget.appState.saveDraftStep(widget.legalCase.id, widget.workflowType, _step, stepOutput);
  }

  void _saveBoolFieldState(String key, bool value) {
    final draft = widget.appState.getOrCreateDraft(widget.legalCase.id, widget.workflowType);
    final stepOutput = Map<String, dynamic>.from(draft.outputs[_step] ?? {});
    stepOutput[key] = value;
    _ignoreNextListener = true;
    widget.appState.saveDraftStep(widget.legalCase.id, widget.workflowType, _step, stepOutput);
    setState(() {});
  }

  void _addListItem(String key) {
    final draft = widget.appState.getOrCreateDraft(widget.legalCase.id, widget.workflowType);
    final stepOutput = Map<String, dynamic>.from(draft.outputs[_step] ?? {});
    final list = List<dynamic>.from(stepOutput[key] ?? []);
    list.add('');
    stepOutput[key] = list;
    widget.appState.saveDraftStep(widget.legalCase.id, widget.workflowType, _step, stepOutput);
    _initializeControllers();
    setState(() {});
  }

  void _deleteListItem(String key, int index) {
    final draft = widget.appState.getOrCreateDraft(widget.legalCase.id, widget.workflowType);
    final stepOutput = Map<String, dynamic>.from(draft.outputs[_step] ?? {});
    final list = List<dynamic>.from(stepOutput[key] ?? []);
    if (index >= 0 && index < list.length) {
      list.removeAt(index);
    }
    stepOutput[key] = list;
    widget.appState.saveDraftStep(widget.legalCase.id, widget.workflowType, _step, stepOutput);
    _initializeControllers();
    setState(() {});
  }

  void _addMapListItem(String key, Map<String, String> template) {
    final draft = widget.appState.getOrCreateDraft(widget.legalCase.id, widget.workflowType);
    final stepOutput = Map<String, dynamic>.from(draft.outputs[_step] ?? {});
    final list = List<dynamic>.from(stepOutput[key] ?? []);
    list.add(Map<String, String>.from(template));
    stepOutput[key] = list;
    widget.appState.saveDraftStep(widget.legalCase.id, widget.workflowType, _step, stepOutput);
    _initializeControllers();
    setState(() {});
  }

  void _deleteMapListItem(String key, int index) {
    final draft = widget.appState.getOrCreateDraft(widget.legalCase.id, widget.workflowType);
    final stepOutput = Map<String, dynamic>.from(draft.outputs[_step] ?? {});
    final list = List<dynamic>.from(stepOutput[key] ?? []);
    if (index >= 0 && index < list.length) {
      list.removeAt(index);
    }
    stepOutput[key] = list;
    widget.appState.saveDraftStep(widget.legalCase.id, widget.workflowType, _step, stepOutput);
    _initializeControllers();
    setState(() {});
  }

  void _runStepAiAnalysis(int targetStep) {
    setState(() {
      _isProcessing = true;
      _processingPhase = 0;
      _step = targetStep;
    });

    _phaseTimer?.cancel();
    _phaseTimer = Timer(const Duration(milliseconds: 1500), () {
      if (mounted) {
        setState(() {
          _processingPhase = 1;
        });
      }
    });

    // Fire off backend trigger in the background if SignalR is active
    if (widget.appState.isSignalRConnected) {
      _triggerBackendJob(targetStep);
    }

    // Processing timer acts as a safety timeout. If connected to SignalR, we wait longer
    // for a backend response before falling back to local mock data.
    final duration = widget.appState.isSignalRConnected
        ? const Duration(seconds: 8)
        : const Duration(milliseconds: 2500);

    _processingTimer?.cancel();
    _processingTimer = Timer(duration, () {
      if (mounted) {
        final allMockOutputs = DemoLegalRepository.getMockOutputs(
          widget.legalCase.title,
          widget.legalCase.caseNumber,
          widget.legalCase.court,
        );
        final workflowMock = allMockOutputs[widget.workflowType] ?? {};
        final stepMock = workflowMock[targetStep] ?? {};

        widget.appState.saveDraftStep(
          widget.legalCase.id,
          widget.workflowType,
          targetStep,
          stepMock,
        );

        setState(() {
          _isProcessing = false;
        });

        _initializeControllers();

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              widget.appState.isSignalRConnected
                  ? 'تم التحليل الذكي للخطوة بنجاح! ✓ (محاكاة احتياطية)'
                  : 'تم التحليل الذكي للخطوة بنجاح! ✓',
              style: const TextStyle(fontFamily: 'Tajawal', fontWeight: FontWeight.bold),
            ),
            backgroundColor: const Color(0xFF34BF49),
            duration: const Duration(seconds: 1),
          ),
        );
      }
    });
  }

  String? _getStepTypeForWorkflowStep(String workflowType, int stepIndex) {
    switch (workflowType) {
      case 'defense-memo':
        switch (stepIndex) {
          case 1: return 'FactAnalysis';
          case 2: return 'GenerateDefenses';
          case 3: return 'FinalRequirements';
          case 4: return 'DefenseMemoDraft';
        }
        break;
      case 'preparing-statement-of-claims':
        switch (stepIndex) {
          case 1: return 'LawsuitCaseType';
          case 2: return 'LawsuitParties';
          case 3: return 'LawsuitSubjects';
          case 4: return 'LawsuitFacts';
          case 5: return 'LawsuitLegalBasis';
          case 6: return 'LawsuitRequests';
          case 7: return 'StatementOfClaimsDraft';
        }
        break;
      case 'appeal-brief':
        switch (stepIndex) {
          case 1: return 'AppealBriefJudgmentData';
          case 2: return 'AppealBriefReasoningAnalysis';
          case 3: return 'AppealBriefGrounds';
          case 4: return 'AppealBriefRequests';
          case 5: return 'AppealBriefLegalBasis';
          case 6: return 'AppealBriefAssembly';
        }
        break;
      case 'admin-complaint':
        switch (stepIndex) {
          case 1: return 'AdminComplaintClassification';
          case 2: return 'AdminComplaintFacts';
          case 3: return 'AdminComplaintViolation';
          case 4: return 'AdminComplaintRequests';
          case 5: return 'AdminComplaintAssembly';
        }
        break;
      case 'ruling-analysis':
        switch (stepIndex) {
          case 1: return 'RulingAnalysisOperative';
          case 2: return 'RulingAnalysisReasoning';
          case 3: return 'RulingAnalysisDefectEvaluation';
          case 4: return 'RulingAnalysisFeasibilityReport';
        }
        break;
      case 'legal-warning':
        switch (stepIndex) {
          case 1: return 'LegalWarningClassification';
          case 2: return 'LegalWarningBodyDraft';
          case 3: return 'LegalWarningAssembly';
        }
        break;
      case 'exec-request':
        switch (stepIndex) {
          case 1: return 'ExecRequestClassification';
          case 2: return 'ExecRequestDrafting';
          case 3: return 'ExecRequestAssembly';
        }
        break;
    }
    return null;
  }

  Future<void> _triggerBackendJob(int targetStep) async {
    final stepType = _getStepTypeForWorkflowStep(widget.workflowType, targetStep);
    if (stepType == null) return;

    try {
      final inputJson = jsonEncode({
        'caseId': widget.legalCase.id,
        'caseFacts': widget.legalCase.facts.join('\n'),
      });

      final response = await widget.appState.apiService.triggerAiJob(
        caseId: widget.legalCase.id,
        stepType: stepType,
        workflowType: widget.workflowType,
        stepNumber: targetStep,
        inputJson: inputJson,
      );

      if (kDebugMode) {
        print('Backend AI job trigger response: $response');
      }
    } catch (e) {
      if (kDebugMode) {
        print('Failed to trigger backend job: $e');
      }
    }
  }

  String _getFieldLabel(String key) {
    switch (key) {
      case 'legalFactsSummary': return 'خلاصة الوقائع القانونية المستخلصة';
      case 'caseType': return 'تصنيف الدعوى';
      case 'defensesFormal': return 'الدفوع الشكلية والإجرائية';
      case 'defensesSubstantive': return 'الدفوع الموضوعية';
      case 'defensesEvidentiary': return 'الدفوع المستندية والأدلة';
      case 'finalPrayers': return 'الطلب الختامي الموجه للمحكمة';
      case 'introduction': return 'ديباجة ومقدمة المذكرة';
      case 'documentText': return 'النص النهائي المنسق بالكامل';
      case 'caseMainType': return 'نوع الدعوى الرئيسي';
      case 'caseSubType': return 'تصنيف الدعوى الفرعي';
      case 'parties': return 'أطراف الخصومة والصفات';
      case 'subjectTitle': return 'موضوع النزاع الرئيسي';
      case 'factsNarrative': return 'سرد وقائع النزاع التفصيلية';
      case 'legalTexts': return 'الأسانيد والمواد القانونية المؤيدة';
      case 'principalRequests': return 'الطلبات الرئيسية والفرعية المدعى بها';
      case 'judgmentData': return 'بيانات الحكم الابتدائي المعترض عليه';
      case 'courtInformation': return 'معلومات محكمة الإصدار وتاريخه';
      case 'analysis': return 'تحليل تسبيب الحكم وأوجه العوار';
      case 'grounds': return 'أسباب الطعن القانونية بالنقض/الاستئناف';
      case 'requests': return 'طلبات الطعن الختامية المرجوة';
      case 'laws': return 'المواد القانونية المستند إليها في الطعن';
      case 'fullAppealText': return 'النص الكامل لصحيفة الطعن بالنقض';
      case 'complaintType': return 'تصنيف الشكوى الإدارية';
      case 'targetAuthority': return 'الجهة الإدارية المشكو في حقها';
      case 'factsSummary': return 'سرد الوقائع والأضرار المادية';
      case 'violations': return 'أوجه القصور والمخالفات الإدارية المنسوبة للقرار';
      case 'verdictPoints': return 'منطوق الحكم الصادر';
      case 'verdictSummary': return 'خلاصة منطوق الحكم وعقوبته';
      case 'reasoningPoints': return 'أسباب الحكم وأسانيده';
      case 'defects': return 'عيوب التسبيب والثغرات المرصودة بالحكم';
      case 'isAppealViable': return 'هل تقديم الطعن ذو جدوى وقبول قانوني؟';
      case 'conclusion': return 'التوصية القانونية النهائية وخلاصة الجدوى';
      case 'warningType': return 'تصنيف الإنذار الرسمي';
      case 'legalBasis': return 'الأساس القانوني والتعاقدي للإنذار';
      case 'warningBody': return 'موضوع الإنذار والمهلة الممنوحة للرد';
      case 'requestType': return 'تصنيف الطلب التنفيذي';
      case 'executionGrounds': return 'السند التنفيذي المستند إليه';
      case 'requestBody': return 'مضمون الطلب التنفيذي والإجراءات المطلوبة';
      case 'keyArguments': return 'الأسانيد والدفوع المؤيدة للتنفيذ';
      case 'keyPoints': return 'النقاط الجوهرية والمدد الزمنية للإنذار';
      case 'name': return 'الاسم';
      case 'role': return 'الصفة/الدور';
      case 'lawName': return 'اسم القانون';
      case 'articleNumber': return 'رقم المادة';
      case 'requestText': return 'نص الطلب';
      case 'description': return 'البيان/الوصف';
      case 'courtName': return 'اسم المحكمة';
      case 'caseNumber': return 'رقم القضية';
      case 'subjectFullText': return 'تفاصيل موضوع النزاع';
      case 'severity': return 'مدى جسامة العيب/الثغرة';
      case 'appealStrength': return 'قوة فرصة قبول الطعن';
      case 'recommendedGrounds': return 'أوجه الطعن الموصى بها';
      case 'urgencyLevel': return 'درجة استعجال الطلب';
      case 'type': return 'نوع السند/الأساس';
      case 'obligationDetails': return 'تفاصيل الالتزام المطلوبة';
      case 'recommendedAction': return 'الإجراء القانوني الموصى به';
      case 'legalRef': return 'السند القانوني للمخالفة';
      case 'keyFacts': return 'الوقائع المحورية';
      default:
        return key.replaceAllMapped(RegExp(r'([A-Z])'), (m) => ' ${m[1]}').trim();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final scaffoldBg = isDark ? AppColors.darkBg : const Color(0xFFF0EEE7);

    final stepDefs = DemoLegalRepository.workflowSteps[widget.workflowType] ?? [];
    final totalSteps = 1 + stepDefs.length;

    return Scaffold(
      backgroundColor: scaffoldBg,
      appBar: AppBar(
        backgroundColor: scaffoldBg,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          color: AppColors.primary,
          onPressed: () {
            if (_isProcessing) {
              _processingTimer?.cancel();
              _phaseTimer?.cancel();
              setState(() {
                _isProcessing = false;
                _step -= 1;
              });
            } else if (_step > 0) {
              setState(() {
                _step -= 1;
              });
              _initializeControllers();
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
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12.0),
            child: Center(
              child: Tooltip(
                message: widget.appState.isSignalRConnected
                    ? 'متصل بالخلفية (تحديث فوري)'
                    : 'وضع محاكاة محلي (أوفلاين)',
                child: Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(
                    color: widget.appState.isSignalRConnected
                        ? const Color(0xFF34BF49) // vibrant green
                        : Colors.orange,          // amber/orange for simulated
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: (widget.appState.isSignalRConnected
                                ? const Color(0xFF34BF49)
                                : Colors.orange)
                            .withOpacity(0.4),
                        blurRadius: 6,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          if (!_isProcessing && _step > 0) ...[
            IconButton(
              icon: const Icon(Icons.history, color: AppColors.primary),
              tooltip: 'النسخ السابقة',
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => WorkflowHistoryScreen(
                      appState: widget.appState,
                      caseId: widget.legalCase.id,
                      workflowType: widget.workflowType,
                      workflowTitle: widget.workflow.title,
                    ),
                  ),
                );
              },
            ),
            IconButton(
              icon: const Icon(Icons.save_outlined, color: AppColors.primary),
              tooltip: 'حفظ كنسخة',
              onPressed: _showSaveSnapshotDialog,
            ),
          ],
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
              _step -= 1;
            });
          }
        },
        child: Stack(
          children: <Widget>[
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
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
                  child: _buildStepper(context, totalSteps, stepDefs),
                ),
                const Divider(height: 1),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.only(left: 20, right: 20, top: 20, bottom: 120),
                    child: _isProcessing
                        ? _buildProcessingState(context)
                        : _buildStepContent(context, stepDefs),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
      bottomNavigationBar: _buildBottomActionBar(context, totalSteps),
    );
  }

  Widget _buildStepper(BuildContext context, int totalSteps, List<WorkflowStepDef> stepDefs) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final activeColor = AppColors.primary;
    final completedColor = const Color(0xFF34BF49);
    final pendingBgColor = isDark ? const Color(0xFF242424) : const Color(0xFFE4E2DC);
    final pendingTextColor = isDark ? Colors.white30 : const Color(0xA6141414);
    final lineColor = isDark ? Colors.white24 : const Color(0x1A1B1B1B);

    return Row(
      mainAxisAlignment: MainAxisAlignment.start,
      children: List<Widget>.generate(totalSteps * 2 - 1, (index) {
        if (index.isOdd) {
          final stepIndex = index ~/ 2;
          final isCompleted = _step > stepIndex;
          return Container(
            width: 32,
            height: 1.5,
            color: isCompleted ? completedColor : lineColor,
            margin: const EdgeInsets.symmetric(horizontal: 4),
          );
        } else {
          final stepIndex = index ~/ 2;
          final isActive = _step == stepIndex;
          final isCompleted = _step > stepIndex;

          String title = stepIndex == 0 ? 'البيانات' : (stepDefs.length >= stepIndex ? stepDefs[stepIndex - 1].title : 'خطوة $stepIndex');

          Color circleBg;
          Widget circleChild;
          TextStyle textStyle;

          if (isCompleted) {
            circleBg = completedColor;
            circleChild = const Icon(Icons.check, color: Colors.white, size: 12);
            textStyle = TextStyle(
              color: isDark ? AppColors.darkMuted : AppColors.lightMuted,
              fontSize: 10,
              fontWeight: FontWeight.w500,
              fontFamily: 'Tajawal',
            );
          } else if (isActive) {
            circleBg = activeColor;
            circleChild = Text(
              '$stepIndex',
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 11,
                fontFamily: 'Tajawal',
              ),
            );
            textStyle = const TextStyle(
              color: AppColors.primary,
              fontSize: 10,
              fontWeight: FontWeight.bold,
              fontFamily: 'Tajawal',
            );
          } else {
            circleBg = pendingBgColor;
            circleChild = Text(
              '$stepIndex',
              style: TextStyle(
                color: pendingTextColor,
                fontWeight: FontWeight.bold,
                fontSize: 11,
                fontFamily: 'Tajawal',
              ),
            );
            textStyle = TextStyle(
              color: pendingTextColor.withValues(alpha: 0.5),
              fontSize: 10,
              fontWeight: FontWeight.w500,
              fontFamily: 'Tajawal',
            );
          }

          return Opacity(
            opacity: (isCompleted || isActive) ? 1.0 : 0.5,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                Container(
                  width: 26,
                  height: 26,
                  decoration: BoxDecoration(
                    color: circleBg,
                    shape: BoxShape.circle,
                    boxShadow: isActive
                        ? [
                            BoxShadow(
                              color: AppColors.primary.withValues(alpha: 0.2),
                              blurRadius: 6,
                              spreadRadius: 1,
                            )
                          ]
                        : null,
                  ),
                  alignment: Alignment.center,
                  child: circleChild,
                ),
                const SizedBox(height: 4),
                Text(
                  title,
                  style: textStyle,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          );
        }
      }),
    );
  }

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
                  Center(
                    child: SizedBox(
                      width: 160,
                      height: 160,
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          RotationTransition(
                            turns: _rotationController,
                            child: Container(
                              width: 160,
                              height: 160,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: AppColors.primary.withValues(alpha: 0.2),
                                  width: 2,
                                ),
                              ),
                            ),
                          ),
                          Container(
                            width: 130,
                            height: 130,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: AppColors.primary.withValues(alpha: 0.08),
                                width: 1.5,
                              ),
                            ),
                          ),
                          ScaleTransition(
                            scale: _pulseAnimation,
                            child: Container(
                              width: 80,
                              height: 80,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: AppColors.mainGradient,
                                boxShadow: [
                                  BoxShadow(
                                    color: AppColors.primary.withValues(alpha: 0.25),
                                    blurRadius: 12,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              alignment: Alignment.center,
                              child: const Icon(
                                Icons.auto_awesome,
                                color: Colors.white,
                                size: 32,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    _processingPhase == 0 ? 'جاري فحص المستندات والبيانات... 🔍' : 'جاري صياغة الاستنتاجات القانونية... ✍️',
                    style: TextStyle(
                      color: textColor,
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Tajawal',
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'يتولى الذكاء الاصطناعي معالجة القضية الآن',
                    style: TextStyle(
                      color: textMuted,
                      fontSize: 12,
                      fontFamily: 'Tajawal',
                    ),
                  ),
                  const SizedBox(height: 24),
                  Column(
                    children: <Widget>[
                      _buildSkeletonStatusCard(
                        context,
                        icon: Icons.description,
                        skeletonWidth: 120,
                        isActive: _processingPhase == 0,
                        isCompleted: _processingPhase > 0,
                        shimmerColor: _processingPhase == 0 ? shimmerColor : (isDark ? const Color(0xFF1E1D13) : const Color(0xFFFBFBF4)),
                      ),
                      const SizedBox(height: 12),
                      Opacity(
                        opacity: _processingPhase >= 1 ? 1.0 : 0.5,
                        child: _buildSkeletonStatusCard(
                          context,
                          icon: Icons.balance,
                          skeletonWidth: 150,
                          isActive: _processingPhase == 1,
                          isCompleted: false,
                          shimmerColor: _processingPhase == 1 ? shimmerColor : (isDark ? const Color(0xFF1E1D13) : const Color(0xFFFBFBF4)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }

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
      height: 56,
      decoration: BoxDecoration(
        color: shimmerColor,
        borderRadius: BorderRadius.circular(12),
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
                size: 20,
              ),
              const SizedBox(width: 12),
              Container(
                width: skeletonWidth,
                height: 8,
                decoration: BoxDecoration(
                  color: isDark ? Colors.white24 : const Color(0x1F1B1B1B),
                  borderRadius: BorderRadius.circular(4),
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
                size: 18,
              ),
            )
          else if (isCompleted)
            const Icon(
              Icons.check_circle,
              color: Color(0xFF34BF49),
              size: 18,
            ),
        ],
      ),
    );
  }

  Widget _buildStepContent(BuildContext context, List<WorkflowStepDef> stepDefs) {
    if (_step == 0) {
      return _buildStep1BasicDetails(context);
    }

    final draft = widget.appState.getOrCreateDraft(widget.legalCase.id, widget.workflowType);
    final stepOutput = draft.outputs[_step];
    if (stepOutput == null || stepOutput.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(32.0),
          child: CircularProgressIndicator(),
        ),
      );
    }

    final stepDef = stepDefs.firstWhere(
      (s) => s.index == _step,
      orElse: () => WorkflowStepDef(index: _step, title: 'الخطوة $_step', description: ''),
    );

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
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        stepDef.title,
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, fontFamily: 'Tajawal'),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        'خطوة $_step من ${stepDefs.length}',
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primary, fontFamily: 'Tajawal'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  stepDef.description,
                  style: TextStyle(fontSize: 11, color: textMuted, fontFamily: 'Tajawal'),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Container(
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1E1D13) : const Color(0xFFFBFAE8),
                    borderRadius: BorderRadius.circular(12),
                    border: Border(
                      right: BorderSide(color: AppColors.primary, width: 4),
                    ),
                  ),
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      const Icon(Icons.auto_awesome, color: AppColors.primary, size: 18),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'توليد ذكي: يمكنك مراجعة وتعديل النتائج أدناه، ويتم حفظ التعديلات تلقائياً في المسودة.',
                          style: TextStyle(
                            fontSize: 12,
                            height: 1.5,
                            fontFamily: 'Tajawal',
                            color: isDark ? Colors.white70 : AppColors.lightText,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                ...stepOutput.entries.map((entry) {
                  return _buildFieldEditor(entry.key, entry.value);
                }),
                if (_step == stepDefs.length) ...[
                  const SizedBox(height: 24),
                  const Divider(),
                  const SizedBox(height: 16),
                  const Text(
                    'الإجراءات النهائية للمسودة المنجزة',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, fontFamily: 'Tajawal'),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: <Widget>[
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            String copyText = '';
                            stepOutput.forEach((key, val) {
                              if (key.toLowerCase().contains('text') && val is String) {
                                copyText = val;
                              }
                            });
                            if (copyText.isEmpty && stepOutput.values.first is String) {
                              copyText = stepOutput.values.first as String;
                            }
                            Clipboard.setData(ClipboardData(text: copyText));
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('تم نسخ النص النهائي بنجاح! ✓', style: TextStyle(fontFamily: 'Tajawal')),
                                backgroundColor: Color(0xFF34BF49),
                              ),
                            );
                          },
                          icon: const Icon(Icons.copy, size: 16),
                          label: const Text('نسخ المسودة', style: TextStyle(fontFamily: 'Tajawal', fontSize: 12)),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.primary,
                            side: const BorderSide(color: AppColors.primary),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Container(
                          decoration: BoxDecoration(
                            gradient: AppColors.mainGradient,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: ElevatedButton.icon(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('تم محاكاة تصدير الملف بصيغة PDF وجاري تنزيله... 📄', style: TextStyle(fontFamily: 'Tajawal')),
                                  backgroundColor: AppColors.primary,
                                ),
                              );
                            },
                            icon: const Icon(Icons.picture_as_pdf, size: 16),
                            label: const Text('تصدير PDF', style: TextStyle(fontFamily: 'Tajawal', fontSize: 12, color: Colors.white)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              shadowColor: Colors.transparent,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFieldEditor(String key, dynamic value) {
    final label = _getFieldLabel(key);
    
    if (value is bool) {
      return Padding(
        padding: const EdgeInsets.only(bottom: 16.0),
        child: SwitchListTile(
          title: Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, fontFamily: 'Tajawal')),
          value: value,
          activeColor: AppColors.primary,
          onChanged: (val) => _saveBoolFieldState(key, val),
          contentPadding: EdgeInsets.zero,
        ),
      );
    }

    final controllerVal = _textControllers[key];
    if (controllerVal == null) return const SizedBox.shrink();

    if (value is String) {
      final isLongText = key.toLowerCase().contains('text') || key.toLowerCase().contains('narrative') || key.toLowerCase().contains('analysis') || key.toLowerCase().contains('body');
      return Padding(
        padding: const EdgeInsets.only(bottom: 16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'Tajawal')),
            const SizedBox(height: 6),
            TextFormField(
              controller: controllerVal as TextEditingController,
              maxLines: isLongText ? 12 : 4,
              minLines: isLongText ? 6 : 1,
              style: const TextStyle(fontSize: 13, fontFamily: 'Tajawal', height: 1.4),
              decoration: InputDecoration(
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                contentPadding: const EdgeInsets.all(12),
              ),
            ),
          ],
        ),
      );
    }

    if (value is List && controllerVal is List<TextEditingController>) {
      return Padding(
        padding: const EdgeInsets.only(bottom: 20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'Tajawal')),
                IconButton(
                  icon: const Icon(Icons.add_circle_outline, color: AppColors.primary, size: 18),
                  onPressed: () => _addListItem(key),
                  tooltip: 'إضافة عنصر جديد',
                ),
              ],
            ),
            const SizedBox(height: 6),
            ...List.generate(controllerVal.length, (idx) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 8.0),
                child: Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: controllerVal[idx],
                        maxLines: 2,
                        minLines: 1,
                        style: const TextStyle(fontSize: 12, fontFamily: 'Tajawal'),
                        decoration: InputDecoration(
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                          contentPadding: const EdgeInsets.all(10),
                        ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.remove_circle_outline, color: Colors.red, size: 18),
                      onPressed: () => _deleteListItem(key, idx),
                    ),
                  ],
                ),
              );
            }),
          ],
        ),
      );
    }

    if (value is List && controllerVal is List<Map<String, TextEditingController>>) {
      Map<String, String> defaultMapTemplate = {};
      if (value.isNotEmpty && value.first is Map) {
        (value.first as Map).forEach((k, v) {
          defaultMapTemplate[k.toString()] = '';
        });
      } else {
        defaultMapTemplate = {'name': '', 'role': ''};
      }

      return Padding(
        padding: const EdgeInsets.only(bottom: 20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'Tajawal')),
                IconButton(
                  icon: const Icon(Icons.add_circle_outline, color: AppColors.primary, size: 18),
                  onPressed: () => _addMapListItem(key, defaultMapTemplate),
                  tooltip: 'إضافة جديد',
                ),
              ],
            ),
            const SizedBox(height: 6),
            ...List.generate(controllerVal.length, (idx) {
              final mapController = controllerVal[idx];
              return Card(
                elevation: 0,
                margin: const EdgeInsets.only(bottom: 10),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                  side: BorderSide(color: Colors.grey.withValues(alpha: 0.2)),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(10.0),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.delete_outline, color: Colors.red, size: 16),
                            onPressed: () => _deleteMapListItem(key, idx),
                          ),
                        ],
                      ),
                      ...mapController.entries.map((e) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 8.0),
                          child: Row(
                            children: [
                              SizedBox(
                                width: 80,
                                child: Text(
                                  _getFieldLabel(e.key),
                                  style: const TextStyle(fontSize: 11, fontFamily: 'Tajawal'),
                                ),
                              ),
                              Expanded(
                                child: TextFormField(
                                  controller: e.value,
                                  style: const TextStyle(fontSize: 12, fontFamily: 'Tajawal'),
                                  decoration: InputDecoration(
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(6)),
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                                  ),
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
            }),
          ],
        ),
      );
    }

    if (value is Map && controllerVal is Map<String, TextEditingController>) {
      return Padding(
        padding: const EdgeInsets.only(bottom: 16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'Tajawal')),
            const SizedBox(height: 6),
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: BorderSide(color: Colors.grey.withValues(alpha: 0.2)),
              ),
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Column(
                  children: controllerVal.entries.map((e) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 8.0),
                      child: Row(
                        children: [
                          SizedBox(
                            width: 90,
                            child: Text(
                              _getFieldLabel(e.key),
                              style: const TextStyle(fontSize: 11, fontFamily: 'Tajawal'),
                            ),
                          ),
                          Expanded(
                            child: TextFormField(
                              controller: e.value,
                              style: const TextStyle(fontSize: 12, fontFamily: 'Tajawal'),
                              decoration: InputDecoration(
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(6)),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),
          ],
        ),
      );
    }

    return const SizedBox.shrink();
  }

  Widget _buildStep1BasicDetails(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? AppColors.darkSurface : Colors.white;
    final borderThemeColor = isDark ? AppColors.darkBorder : AppColors.lightBorder;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
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
                'تفاصيل القضية المدخلة للتحليل',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                  fontFamily: 'Tajawal',
                ),
              ),
              const SizedBox(height: 16),
              _buildSummaryField('اسم القضية', widget.legalCase.title, context),
              _buildSummaryField('رقم القضية', widget.legalCase.caseNumber, context),
              _buildSummaryField('المحكمة المختصة', widget.legalCase.court, context),
              if (widget.legalCase.adversary != null)
                _buildSummaryField('الخصم/المدعى عليه', widget.legalCase.adversary!, context),
            ],
          ),
        ),
        const SizedBox(height: 20),
        const Row(
          children: <Widget>[
            Icon(Icons.fact_check_outlined, color: AppColors.primary, size: 18),
            SizedBox(width: 8),
            Text(
              'الوقائع المتاحة للتحليل',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                fontFamily: 'Tajawal',
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Container(
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: borderThemeColor, width: 1),
          ),
          padding: const EdgeInsets.all(16),
          child: Column(
            children: widget.legalCase.facts.isEmpty
                ? [
                    const Center(
                      child: Text(
                        'لا توجد وقائع مسجلة لهذه القضية حالياً.',
                        style: TextStyle(fontSize: 12, fontFamily: 'Tajawal', color: Colors.grey),
                      ),
                    )
                  ]
                : widget.legalCase.facts.map((fact) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10.0),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          const Icon(Icons.check_circle, color: Color(0xFF34BF49), size: 14),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              fact,
                              style: TextStyle(
                                fontSize: 12.5,
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
        const SizedBox(height: 20),
        const Row(
          children: <Widget>[
            Icon(Icons.attachment, color: AppColors.primary, size: 18),
            SizedBox(width: 8),
            Text(
              'المستندات والتقارير الملحقة',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                fontFamily: 'Tajawal',
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Container(
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: borderThemeColor, width: 1),
          ),
          padding: const EdgeInsets.all(16),
          child: Column(
            children: <Widget>[
              Row(
                children: <Widget>[
                  const Icon(Icons.insert_drive_file, color: AppColors.primary, size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'تقرير الطب الشرعي الفني المعتمد.pdf',
                      style: TextStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w500,
                        fontFamily: 'Tajawal',
                        color: isDark ? Colors.white : AppColors.lightTitle,
                      ),
                    ),
                  ),
                  const Text(
                    'جاهز للقراءة',
                    style: TextStyle(fontSize: 11, color: Colors.green, fontFamily: 'Tajawal', fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: <Widget>[
                  const Icon(Icons.insert_drive_file, color: AppColors.primary, size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'عقد التوريد الموقع وملاحق الأسعار.pdf',
                      style: TextStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w500,
                        fontFamily: 'Tajawal',
                        color: isDark ? Colors.white : AppColors.lightTitle,
                      ),
                    ),
                  ),
                  const Text(
                    'جاهز للقراءة',
                    style: TextStyle(fontSize: 11, color: Colors.green, fontFamily: 'Tajawal', fontWeight: FontWeight.bold),
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
      padding: const EdgeInsets.only(bottom: 10.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          SizedBox(
            width: 110,
            child: Text(
              label,
              style: TextStyle(
                color: isDark ? AppColors.darkMuted : AppColors.lightMuted,
                fontSize: 12.5,
                fontFamily: 'Tajawal',
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 12.5,
                fontFamily: 'Tajawal',
                color: isDark ? Colors.white : AppColors.lightTitle,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomActionBar(BuildContext context, int totalSteps) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final footerBg = isDark ? AppColors.darkSurface.withValues(alpha: 0.9) : Colors.white.withValues(alpha: 0.95);
    final borderThemeColor = isDark ? AppColors.darkBorder : AppColors.lightBorder;

    return Container(
      height: 80,
      decoration: BoxDecoration(
        color: footerBg,
        border: Border(top: BorderSide(color: borderThemeColor, width: 0.5)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: <Widget>[
          OutlinedButton(
            onPressed: (_step == 0 && !_isProcessing)
                ? null
                : () {
                    if (_isProcessing) {
                      _processingTimer?.cancel();
                      _phaseTimer?.cancel();
                      setState(() {
                        _isProcessing = false;
                        _step -= 1;
                      });
                    } else {
                      setState(() {
                        _step -= 1;
                      });
                      _initializeControllers();
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
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                Icon(Icons.arrow_back, size: 14),
                SizedBox(width: 6),
                Text(
                  'السابق',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'Tajawal'),
                ),
              ],
            ),
          ),
          InkWell(
            onTap: _isProcessing
                ? null
                : () {
                    if (_step == 0) {
                      _runStepAiAnalysis(1);
                    } else if (_step < totalSteps - 1) {
                      final next = _step + 1;
                      final draft = widget.appState.getOrCreateDraft(widget.legalCase.id, widget.workflowType);
                      if (draft.outputs[next] == null || draft.outputs[next]!.isEmpty) {
                        _runStepAiAnalysis(next);
                      } else {
                        setState(() {
                          _step = next;
                        });
                        _initializeControllers();
                      }
                    } else {
                      widget.appState.saveDraftStep(widget.legalCase.id, widget.workflowType, _step, 
                        widget.appState.getOrCreateDraft(widget.legalCase.id, widget.workflowType).outputs[_step] ?? {});
                      
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('تم الانتهاء وحفظ مسودة العمل بنجاح! ✓', style: TextStyle(fontFamily: 'Tajawal', fontWeight: FontWeight.bold)),
                          backgroundColor: Color(0xFF34BF49),
                        ),
                      );
                    }
                  },
            borderRadius: BorderRadius.circular(12),
            child: Container(
              decoration: BoxDecoration(
                gradient: _isProcessing ? null : AppColors.mainGradient,
                color: _isProcessing ? Colors.grey.shade300 : null,
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  if (_isProcessing) ...[
                    const SizedBox(
                      width: 14,
                      height: 14,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'جاري التحليل...',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12, fontFamily: 'Tajawal'),
                    ),
                  ] else ...[
                    Text(
                      _step == 0
                          ? 'بدء التحليل'
                          : (_step == totalSteps - 1 ? 'إنهاء وحفظ' : 'التالي'),
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12, fontFamily: 'Tajawal'),
                    ),
                    const SizedBox(width: 6),
                    Icon(
                      _step == totalSteps - 1 ? Icons.check_circle_outline : Icons.arrow_forward,
                      color: Colors.white,
                      size: 14,
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

  void _showSaveSnapshotDialog() {
    final txtController = TextEditingController();
    showDialog<void>(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        title: const Text('حفظ نسخة كإصدار سابق', style: TextStyle(fontFamily: 'Tajawal', fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'أدخل عنواناً مميزاً لحفظ النسخة الحالية من العمل في السجل، لكي تتمكن من الرجوع إليها لاحقاً.',
              style: TextStyle(fontFamily: 'Tajawal', fontSize: 13),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: txtController,
              decoration: const InputDecoration(
                labelText: 'عنوان النسخة (مثال: المسودة بعد مراجعة المستندات)',
                labelStyle: TextStyle(fontFamily: 'Tajawal', fontSize: 12),
                border: OutlineInputBorder(),
              ),
              style: const TextStyle(fontFamily: 'Tajawal', fontSize: 13),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogCtx).pop(),
            child: const Text('إلغاء', style: TextStyle(fontFamily: 'Tajawal')),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () {
              final label = txtController.text.trim();
              widget.appState.saveDraftAsSnapshot(widget.legalCase.id, widget.workflowType, label);
              Navigator.of(dialogCtx).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('تم حفظ النسخة بنجاح في سجل المحفوظات! ✓', style: TextStyle(fontFamily: 'Tajawal')),
                  backgroundColor: Color(0xFF34BF49),
                ),
              );
            },
            child: const Text('حفظ النسخة', style: TextStyle(fontFamily: 'Tajawal', color: Colors.white)),
          ),
        ],
      ),
    );
  }
}

class WorkflowHistoryScreen extends StatelessWidget {
  const WorkflowHistoryScreen({
    required this.appState,
    required this.caseId,
    required this.workflowType,
    required this.workflowTitle,
    super.key,
  });

  final AppState appState;
  final String caseId;
  final String workflowType;
  final String workflowTitle;

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: appState,
      builder: (context, _) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        final scaffoldBg = isDark ? AppColors.darkBg : const Color(0xFFF0EEE7);
        final listBg = isDark ? AppColors.darkSurface : Colors.white;
        final borderThemeColor = isDark ? AppColors.darkBorder : AppColors.lightBorder;
        final textColor = isDark ? Colors.white : AppColors.lightTitle;

        final snapshots = appState.snapshotsForCaseAndWorkflow(caseId, workflowType);

        return Scaffold(
          backgroundColor: scaffoldBg,
          appBar: AppBar(
            backgroundColor: scaffoldBg,
            elevation: 0,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back),
              color: AppColors.primary,
              onPressed: () => Navigator.of(context).pop(),
            ),
            titleSpacing: 0,
            title: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'سجل النسخ السابقة (المحفوظات)',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, fontFamily: 'Tajawal', color: AppColors.primary),
                ),
                Text(
                  workflowTitle,
                  style: TextStyle(fontSize: 10, fontFamily: 'Tajawal', color: isDark ? Colors.white60 : Colors.grey),
                ),
              ],
            ),
          ),
          body: snapshots.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: <Widget>[
                      const Icon(Icons.history_toggle_off, size: 64, color: Colors.grey),
                      const SizedBox(height: 16),
                      Text(
                        'لا توجد نسخ سابقة محفوظة حالياً.',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, fontFamily: 'Tajawal', color: textColor),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'اضغط على زر الحفظ أثناء تعديل المسودة لأخذ نسخة احتياطية.',
                        style: TextStyle(fontSize: 12, fontFamily: 'Tajawal', color: Colors.grey),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                  itemCount: snapshots.length,
                  itemBuilder: (context, index) {
                    final s = snapshots[index];
                    final dateStr = '${s.createdAt.year}/${s.createdAt.month.toString().padLeft(2, '0')}/${s.createdAt.day.toString().padLeft(2, '0')} - ${s.createdAt.hour.toString().padLeft(2, '0')}:${s.createdAt.minute.toString().padLeft(2, '0')}';
                    final stepDefs = DemoLegalRepository.workflowSteps[workflowType] ?? [];
                    final stepTitle = s.currentStep == 0
                        ? 'البيانات الأساسية'
                        : (stepDefs.length >= s.currentStep ? stepDefs[s.currentStep - 1].title : 'الخطوة ${s.currentStep}');

                    return Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Column(
                          children: [
                            Container(
                              width: 12,
                              height: 12,
                              decoration: BoxDecoration(
                                color: AppColors.primary,
                                shape: BoxShape.circle,
                                border: Border.all(color: isDark ? Colors.black : Colors.white, width: 2),
                                boxShadow: [
                                  BoxShadow(
                                    color: AppColors.primary.withValues(alpha: 0.3),
                                    blurRadius: 4,
                                    spreadRadius: 1,
                                  ),
                                ],
                              ),
                            ),
                            if (index != snapshots.length - 1)
                              Container(
                                width: 2,
                                height: 160,
                                color: AppColors.primary.withValues(alpha: 0.3),
                              ),
                          ],
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 24),
                            decoration: BoxDecoration(
                              color: listBg,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: borderThemeColor),
                            ),
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        s.label ?? 'نسخة حفظ غير معنونة',
                                        style: TextStyle(
                                          fontSize: 13.5,
                                          fontWeight: FontWeight.bold,
                                          fontFamily: 'Tajawal',
                                          color: textColor,
                                        ),
                                      ),
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.edit_outlined, size: 16, color: AppColors.primary),
                                      onPressed: () => _showRenameDialog(context, s.id, s.label ?? ''),
                                      tooltip: 'تعديل التسمية',
                                      constraints: const BoxConstraints(),
                                      padding: EdgeInsets.zero,
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Row(
                                  children: [
                                    const Icon(Icons.calendar_today_outlined, size: 11, color: Colors.grey),
                                    const SizedBox(width: 6),
                                    Text(
                                      dateStr,
                                      style: const TextStyle(fontSize: 11, color: Colors.grey, fontFamily: 'Tajawal'),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppColors.primary.withValues(alpha: 0.08),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    'محفوظ عند: $stepTitle',
                                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primary, fontFamily: 'Tajawal'),
                                  ),
                                ),
                                const SizedBox(height: 14),
                                const Divider(height: 1),
                                const SizedBox(height: 12),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        TextButton.icon(
                                          onPressed: () => _previewSnapshotDocument(context, s, stepTitle),
                                          icon: const Icon(Icons.remove_red_eye_outlined, size: 14),
                                          label: const Text('معاينة المستند', style: TextStyle(fontSize: 11, fontFamily: 'Tajawal', fontWeight: FontWeight.bold)),
                                          style: TextButton.styleFrom(
                                            foregroundColor: AppColors.primary,
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                            minimumSize: Size.zero,
                                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        TextButton.icon(
                                          onPressed: () => _showDeleteConfirmation(context, s.id),
                                          icon: const Icon(Icons.delete_outline, size: 14, color: Colors.red),
                                          label: const Text('حذف', style: TextStyle(fontSize: 11, fontFamily: 'Tajawal', color: Colors.red, fontWeight: FontWeight.bold)),
                                          style: TextButton.styleFrom(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                            minimumSize: Size.zero,
                                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                          ),
                                        ),
                                      ],
                                    ),
                                    ElevatedButton(
                                      onPressed: () => _showRestoreConfirmation(context, s.id),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppColors.primary,
                                        foregroundColor: Colors.white,
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                        minimumSize: Size.zero,
                                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                      ),
                                      child: const Text('استعادة النسخة', style: TextStyle(fontSize: 11, fontFamily: 'Tajawal', fontWeight: FontWeight.bold)),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    );
                  },
                ),
        );
      },
    );
  }

  void _showRenameDialog(BuildContext context, String snapshotId, String currentLabel) {
    final txtController = TextEditingController(text: currentLabel);
    showDialog<void>(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        title: const Text('تعديل تسمية النسخة', style: TextStyle(fontFamily: 'Tajawal', fontWeight: FontWeight.bold)),
        content: TextField(
          controller: txtController,
          decoration: const InputDecoration(
            labelText: 'تسمية النسخة الجديدة',
            labelStyle: TextStyle(fontFamily: 'Tajawal', fontSize: 12),
          ),
          style: const TextStyle(fontFamily: 'Tajawal', fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogCtx).pop(),
            child: const Text('إلغاء', style: TextStyle(fontFamily: 'Tajawal')),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () {
              final newLabel = txtController.text.trim();
              appState.renameSnapshot(snapshotId, newLabel);
              Navigator.of(dialogCtx).pop();
            },
            child: const Text('حفظ', style: TextStyle(fontFamily: 'Tajawal', color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showDeleteConfirmation(BuildContext context, String snapshotId) {
    showDialog<void>(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        title: const Text('حذف النسخة المحفوظة', style: TextStyle(fontFamily: 'Tajawal', fontWeight: FontWeight.bold, color: Colors.red)),
        content: const Text(
          'هل أنت متأكد من رغبتك في حذف هذه النسخة نهائياً من المحفوظات؟ لا يمكن التراجع عن هذا الإجراء.',
          style: TextStyle(fontFamily: 'Tajawal', fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogCtx).pop(),
            child: const Text('إلغاء', style: TextStyle(fontFamily: 'Tajawal')),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () {
              appState.deleteSnapshot(snapshotId);
              Navigator.of(dialogCtx).pop();
            },
            child: const Text('حذف نهائي', style: TextStyle(fontFamily: 'Tajawal', color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showRestoreConfirmation(BuildContext context, String snapshotId) {
    showDialog<void>(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        title: const Text('استعادة هذه النسخة', style: TextStyle(fontFamily: 'Tajawal', fontWeight: FontWeight.bold)),
        content: const Text(
          'هل تريد استعادة هذه النسخة؟ سيؤدي ذلك إلى استبدال مسودتك النشطة الحالية بمحتويات هذه النسخة للبدء منها.',
          style: TextStyle(fontFamily: 'Tajawal', fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogCtx).pop(),
            child: const Text('إلغاء', style: TextStyle(fontFamily: 'Tajawal')),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () {
              appState.restoreSnapshot(snapshotId);
              Navigator.of(dialogCtx).pop(); // close dialog
              Navigator.of(context).pop(); // return to runner screen (which automatically hydrates)
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('تم استعادة النسخة المحددة بنجاح ومتابعة العمل! ✓', style: TextStyle(fontFamily: 'Tajawal')),
                  backgroundColor: Color(0xFF34BF49),
                ),
              );
            },
            child: const Text('تأكيد الاستعادة', style: TextStyle(fontFamily: 'Tajawal', color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _previewSnapshotDocument(BuildContext context, WorkflowSnapshot s, String stepTitle) {
    String previewContent = '';
    for (int step = s.currentStep; step >= 0; step--) {
      final out = s.outputs[step];
      if (out != null) {
        out.forEach((key, val) {
          if (key.toLowerCase().contains('text') && val is String && previewContent.isEmpty) {
            previewContent = val;
          }
        });
      }
    }

    if (previewContent.isEmpty) {
      final List<String> lines = [];
      s.outputs.forEach((stepNum, valMap) {
        lines.add('--- الخطوة $stepNum ---');
        valMap.forEach((k, v) {
          lines.add('$k: $v');
        });
      });
      previewContent = lines.join('\n');
    }

    showDialog<void>(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                s.label ?? 'معاينة النسخة',
                style: const TextStyle(fontFamily: 'Tajawal', fontWeight: FontWeight.bold, fontSize: 14),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.copy, size: 16),
              onPressed: () {
                Clipboard.setData(ClipboardData(text: previewContent));
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('تم نسخ النص إلى الحافظة!')),
                );
              },
            ),
          ],
        ),
        content: SizedBox(
          width: double.maxFinite,
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'المستوى المحفوظ عنده: $stepTitle',
                  style: const TextStyle(fontFamily: 'Tajawal', fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.grey.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    previewContent,
                    style: const TextStyle(fontFamily: 'Tajawal', fontSize: 12, height: 1.5),
                  ),
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogCtx).pop(),
            child: const Text('إغلاق', style: TextStyle(fontFamily: 'Tajawal')),
          ),
        ],
      ),
    );
  }
}
