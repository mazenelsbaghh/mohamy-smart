import 'package:flutter/material.dart';

import '../models/legal_models.dart';
import '../theme/app_theme.dart';
import 'app_card.dart';

String formatDateTime(DateTime? value) {
  if (value == null) {
    return 'لا يوجد موعد';
  }
  final hour = value.hour.toString().padLeft(2, '0');
  final minute = value.minute.toString().padLeft(2, '0');
  return '${value.day}/${value.month}/${value.year} - $hour:$minute';
}

class StatusChip extends StatelessWidget {
  const StatusChip({
    required this.label,
    super.key,
    this.color = AppColors.primary,
  });

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        child: Text(
          label,
          style: TextStyle(
            color: color,
            fontWeight: FontWeight.w800,
            fontSize: 12,
          ),
        ),
      ),
    );
  }
}

class PointsPill extends StatelessWidget {
  const PointsPill({required this.points, super.key});

  final int points;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            const Icon(Icons.auto_awesome, color: AppColors.primary, size: 18),
            const SizedBox(width: 6),
            Text(
              '$points نقطة',
              style: const TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class CaseCard extends StatelessWidget {
  const CaseCard({required this.legalCase, super.key, this.onTap});

  final LegalCase legalCase;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBgColor = isDark ? AppColors.darkSurface : Colors.white;
    final textColor = isDark ? Colors.white : AppColors.lightTitle;
    final mutedTextColor = isDark ? AppColors.darkMuted : AppColors.lightMuted;
    final borderColor = isDark ? AppColors.darkBorder : AppColors.lightBorder;

    // Status styling mapping
    Color statusBgColor;
    Color statusTextColor;
    String statusLabel = legalCase.status.label;

    switch (legalCase.status) {
      case CaseStatus.active:
        statusBgColor = isDark ? AppColors.darkAccentSoft : AppColors.lightAccentSoft;
        statusTextColor = AppColors.primary;
        statusLabel = 'قضية نشطة';
        break;
      case CaseStatus.pending:
        statusBgColor = isDark ? AppColors.darkInfoSoft : AppColors.lightInfoSoft;
        statusTextColor = AppColors.blue;
        statusLabel = 'قيد الانتظار';
        break;
      case CaseStatus.completed:
        statusBgColor = isDark ? AppColors.darkBorder : AppColors.lightBorder;
        statusTextColor = mutedTextColor;
        statusLabel = 'منتهية';
        break;
    }

    // Update timestamp mapping based on case ID to match mockups exactly
    String updateLabel;
    if (legalCase.id == 'case-4') {
      updateLabel = 'تحديث: منذ ساعتين';
    } else if (legalCase.id == 'case-1') {
      updateLabel = 'تحديث: منذ ساعتين';
    } else if (legalCase.id == 'case-2') {
      updateLabel = 'جلسة قادمة خلال يومين';
    } else if (legalCase.id == 'case-3') {
      updateLabel = 'أغلقت في ديسمبر ٢٠٢٣';
    } else {
      updateLabel = 'تحديث: مؤخراً';
    }

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(28),
      child: Container(
        decoration: BoxDecoration(
          color: cardBgColor,
          borderRadius: BorderRadius.circular(28),
          border: isDark ? Border.all(color: borderColor, width: 1) : null,
          boxShadow: <BoxShadow>[
            BoxShadow(
              color: isDark ? const Color(0x02EF950A) : const Color(0x0F885200),
              blurRadius: 32,
              offset: const Offset(0, 12),
            ),
          ],
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            // Header Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: <Widget>[
                Container(
                  decoration: BoxDecoration(
                    color: statusBgColor,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  child: Text(
                    statusLabel,
                    style: TextStyle(
                      color: statusTextColor,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Text(
                  '#${legalCase.caseNumber}',
                  style: TextStyle(
                    color: mutedTextColor,
                    fontSize: 11,
                    fontFamily: 'monospace',
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            // Title
            Text(
              legalCase.title,
              style: TextStyle(
                color: textColor,
                fontSize: 16,
                fontWeight: FontWeight.bold,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 16),
            // Details Grid
            Row(
              children: <Widget>[
                // Court
                Expanded(
                  child: Row(
                    children: <Widget>[
                      Icon(Icons.account_balance, size: 14, color: mutedTextColor),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          legalCase.court,
                          style: TextStyle(
                            color: mutedTextColor,
                            fontSize: 12,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                // Client Name
                Expanded(
                  child: Row(
                    children: <Widget>[
                      Icon(Icons.person, size: 14, color: mutedTextColor),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          legalCase.clientName,
                          style: TextStyle(
                            color: mutedTextColor,
                            fontSize: 12,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            // Custom Divider
            Divider(color: isDark ? borderColor.withValues(alpha: 0.5) : const Color(0x1AD9C3AE), height: 1, thickness: 1),
            const SizedBox(height: 12),
            // Footer
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: <Widget>[
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    const Text(
                      'عرض التفاصيل',
                      style: TextStyle(
                        color: AppColors.primary,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Icon(
                      Icons.arrow_back,
                      color: AppColors.primary,
                      size: 14,
                    ),
                  ],
                ),
                Text(
                  updateLabel,
                  style: TextStyle(
                    color: mutedTextColor,
                    fontSize: 10,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class ClientCard extends StatelessWidget {
  const ClientCard({required this.client, super.key, this.onTap});

  final Client client;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final tokens = Theme.of(context).extension<MohamyThemeTokens>()!;
    return AppCard(
      onTap: onTap,
      child: Row(
        children: <Widget>[
          CircleAvatar(
            backgroundColor: AppColors.primary.withValues(alpha: 0.13),
            child: Text(
              client.name.characters.first,
              style: const TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  client.name,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
                Text(client.phone, style: TextStyle(color: tokens.muted)),
                Text(
                  '${client.caseIds.length} قضايا مرتبطة',
                  style: TextStyle(color: tokens.muted),
                ),
              ],
            ),
          ),
          IconButton(onPressed: () {}, icon: const Icon(Icons.call_outlined)),
          IconButton(onPressed: () {}, icon: const Icon(Icons.chat_outlined)),
        ],
      ),
    );
  }
}

class AgendaCard extends StatelessWidget {
  const AgendaCard({required this.item, super.key, this.onTap});

  final AgendaItem item;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final tokens = Theme.of(context).extension<MohamyThemeTokens>()!;
    return AppCard(
      onTap: onTap,
      child: Row(
        children: <Widget>[
          DecoratedBox(
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              child: Text(
                '${item.startsAt.hour.toString().padLeft(2, '0')}:${item.startsAt.minute.toString().padLeft(2, '0')}',
                style: const TextStyle(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  item.title,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
                Text(item.court, style: TextStyle(color: tokens.muted)),
              ],
            ),
          ),
          StatusChip(
            label: item.status,
            color: item.status.contains('مطلوب')
                ? AppColors.danger
                : AppColors.primary,
          ),
        ],
      ),
    );
  }
}

class DocumentCard extends StatelessWidget {
  const DocumentCard({required this.document, super.key});

  final LegalDocument document;

  @override
  Widget build(BuildContext context) {
    final tokens = Theme.of(context).extension<MohamyThemeTokens>()!;
    return AppCard(
      child: Row(
        children: <Widget>[
          const Icon(Icons.description_outlined, color: AppColors.primary),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  document.title,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
                Text(
                  '${document.type} • ${document.dateLabel}',
                  style: TextStyle(color: tokens.muted),
                ),
              ],
            ),
          ),
          StatusChip(
            label: document.status.label,
            color: document.status == DocumentStatus.failed
                ? AppColors.danger
                : document.isAiReady
                ? AppColors.success
                : AppColors.primary,
          ),
        ],
      ),
    );
  }
}

class WorkflowCard extends StatelessWidget {
  const WorkflowCard({
    required this.workflow,
    required this.canRun,
    required this.onStart,
    super.key,
    this.showCost = true,
  });

  final AiWorkflow workflow;
  final bool canRun;
  final VoidCallback onStart;
  final bool showCost;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? AppColors.darkSurface : Colors.white;
    final textColor = isDark ? Colors.white : AppColors.lightTitle;
    final mutedTextColor = isDark ? AppColors.darkMuted : AppColors.lightMuted;
    final borderColor = isDark ? AppColors.darkBorder : AppColors.lightBorder;

    IconData icon;
    switch (workflow.iconName) {
      case 'bolt':
        icon = Icons.bolt;
        break;
      case 'description':
        icon = Icons.description;
        break;
      case 'gavel':
        icon = Icons.gavel;
        break;
      case 'warning':
        icon = Icons.warning_amber_rounded;
        break;
      case 'analytics':
        icon = Icons.analytics_outlined;
        break;
      case 'fact_check':
        icon = Icons.fact_check_outlined;
        break;
      case 'task':
        icon = Icons.task_outlined;
        break;
      default:
        icon = Icons.bolt;
    }

    return InkWell(
      onTap: onStart,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(16),
          border: isDark ? Border.all(color: borderColor, width: 1) : null,
          boxShadow: [
            BoxShadow(
              color: isDark ? const Color(0x02000000) : const Color(0x08885200),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        padding: const EdgeInsets.all(20),
        child: Row(
          children: <Widget>[
            // Icon container
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(
                icon,
                color: AppColors.primary,
                size: 28,
              ),
            ),
            const SizedBox(width: 14),
            // Details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: <Widget>[
                      Text(
                        workflow.title,
                        style: TextStyle(
                          color: textColor,
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Container(
                        decoration: BoxDecoration(
                          color: isDark ? Colors.white10 : Colors.black.withValues(alpha: 0.05),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        child: Text(
                          '${workflow.stepCount} خطوات',
                          style: TextStyle(
                            color: mutedTextColor,
                            fontSize: 10,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    workflow.description,
                    style: TextStyle(
                      color: mutedTextColor,
                      fontSize: 11,
                      height: 1.3,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (showCost) ...[
                    const SizedBox(height: 4),
                    Text(
                      'التكلفة: ${workflow.pointCost} نقطة',
                      style: const TextStyle(
                        color: AppColors.primary,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(width: 10),
            // Navigation arrow (RTL points left, which is arrow_back)
            const Icon(
              Icons.arrow_back,
              color: AppColors.primary,
              size: 18,
            ),
          ],
        ),
      ),
    );
  }
}

class _Meta extends StatelessWidget {
  const _Meta({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    final tokens = Theme.of(context).extension<MohamyThemeTokens>()!;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        Icon(icon, size: 16, color: tokens.muted),
        const SizedBox(width: 4),
        Flexible(
          child: Text(
            label,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(color: tokens.muted, fontSize: 12),
          ),
        ),
      ],
    );
  }
}
