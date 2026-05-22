import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_card.dart';
import '../../core/widgets/legal_cards.dart';

class DocumentsScreen extends StatelessWidget {
  const DocumentsScreen({required this.appState, super.key});

  final AppState appState;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('المستندات')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: <Widget>[
          AppCard(
            child: Row(
              children: <Widget>[
                const Icon(
                  Icons.upload_file_outlined,
                  color: AppColors.primary,
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        'ارفع مستندا جديدا',
                        style: TextStyle(fontWeight: FontWeight.w900),
                      ),
                      Text('تصوير مستند أو اختيار ملف من الجهاز'),
                    ],
                  ),
                ),
                FilledButton(onPressed: () {}, child: const Text('رفع')),
              ],
            ),
          ),
          const SizedBox(height: 14),
          const TextField(
            decoration: InputDecoration(
              hintText: 'ابحث باسم المستند أو القضية',
              prefixIcon: Icon(Icons.search),
            ),
          ),
          const SizedBox(height: 14),
          ...appState.documents.map(
            (document) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: DocumentCard(document: document),
            ),
          ),
        ],
      ),
    );
  }
}
