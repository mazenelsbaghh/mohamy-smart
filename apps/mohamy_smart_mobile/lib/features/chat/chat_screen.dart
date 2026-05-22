import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_card.dart';

class ChatScreen extends StatelessWidget {
  const ChatScreen({required this.appState, super.key});

  final AppState appState;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: <Widget>[
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: <Widget>[
              Expanded(
                child: Text(
                  'المساعد القانوني',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              const StatusChipLite(label: 'بدون قضية محددة'),
            ],
          ),
        ),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            children: <Widget>[
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    const Text('اسأل عن صياغة مذكرة أو تحليل مستند'),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: <Widget>[
                        ActionChip(
                          label: const Text('اقترح دفوعا لهذه القضية'),
                          onPressed: () {},
                        ),
                        ActionChip(
                          label: const Text('لخص هذا الحكم'),
                          onPressed: () {},
                        ),
                        ActionChip(
                          label: const Text('اكتب رسالة للعميل'),
                          onPressed: () {},
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
              const Align(
                alignment: AlignmentDirectional.centerEnd,
                child: _ChatBubble(
                  text: 'ما أهم الدفوع في قضية مطالبة مالية؟',
                  isUser: true,
                ),
              ),
              const Align(
                alignment: AlignmentDirectional.centerStart,
                child: _ChatBubble(
                  text:
                      'ابدأ بمراجعة العقد، الإخلال المثبت، الإشعارات السابقة، وقيمة المطالبة مع المستندات المؤيدة.',
                  isUser: false,
                ),
              ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: <Widget>[
              IconButton.filledTonal(
                onPressed: () {},
                icon: const Icon(Icons.attach_file),
              ),
              const SizedBox(width: 8),
              const Expanded(
                child: TextField(
                  decoration: InputDecoration(hintText: 'اكتب سؤالك'),
                ),
              ),
              const SizedBox(width: 8),
              IconButton.filled(onPressed: () {}, icon: const Icon(Icons.send)),
            ],
          ),
        ),
      ],
    );
  }
}

class StatusChipLite extends StatelessWidget {
  const StatusChipLite({required this.label, super.key});

  final String label;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        child: Text(
          label,
          style: const TextStyle(
            color: AppColors.primary,
            fontWeight: FontWeight.w800,
            fontSize: 12,
          ),
        ),
      ),
    );
  }
}

class _ChatBubble extends StatelessWidget {
  const _ChatBubble({required this.text, required this.isUser});

  final String text;
  final bool isUser;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(maxWidth: 300),
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isUser
            ? AppColors.primary
            : Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Text(text, style: TextStyle(color: isUser ? Colors.white : null)),
    );
  }
}
