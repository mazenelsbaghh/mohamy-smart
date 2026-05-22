import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../core/widgets/empty_state.dart';
import '../../core/widgets/legal_cards.dart';
import '../cases/case_details_screen.dart';

class AgendaScreen extends StatelessWidget {
  const AgendaScreen({required this.appState, super.key});

  final AppState appState;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: <Widget>[
        Row(
          children: <Widget>[
            Expanded(
              child: Text(
                'الأجندة',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
            IconButton.filled(onPressed: () {}, icon: const Icon(Icons.add)),
          ],
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 46,
          child: ListView(
            scrollDirection: Axis.horizontal,
            children: const <Widget>[
              Padding(
                padding: EdgeInsetsDirectional.only(end: 8),
                child: ChoiceChip(label: Text('اليوم'), selected: true),
              ),
              Padding(
                padding: EdgeInsetsDirectional.only(end: 8),
                child: ChoiceChip(label: Text('غدا'), selected: false),
              ),
              Padding(
                padding: EdgeInsetsDirectional.only(end: 8),
                child: ChoiceChip(label: Text('هذا الأسبوع'), selected: false),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        if (appState.agenda.isEmpty)
          const EmptyState(
            icon: Icons.event_available,
            title: 'لا توجد جلسات اليوم',
            message: 'عند إضافة جلسات أو مواعيد ستظهر هنا.',
          )
        else
          ...appState.agenda.map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: AgendaCard(
                item: item,
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => CaseDetailsScreen(
                      appState: appState,
                      legalCase: appState.caseById(item.caseId),
                    ),
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}
