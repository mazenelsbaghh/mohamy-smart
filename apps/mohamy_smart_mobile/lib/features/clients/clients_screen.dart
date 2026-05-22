import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../core/models/legal_models.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_card.dart';
import '../../core/widgets/legal_cards.dart';
import '../cases/case_details_screen.dart';

class ClientsScreen extends StatelessWidget {
  const ClientsScreen({required this.appState, super.key});

  final AppState appState;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('العملاء')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: <Widget>[
          const TextField(
            decoration: InputDecoration(
              hintText: 'ابحث باسم العميل أو رقم الجوال',
              prefixIcon: Icon(Icons.search),
            ),
          ),
          const SizedBox(height: 14),
          ...appState.clients.map(
            (client) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: ClientCard(
                client: client,
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) =>
                        ClientDetailsScreen(appState: appState, client: client),
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

class ClientDetailsScreen extends StatelessWidget {
  const ClientDetailsScreen({
    required this.appState,
    required this.client,
    super.key,
  });

  final AppState appState;
  final Client client;

  @override
  Widget build(BuildContext context) {
    final linkedCases = appState.cases
        .where((legalCase) => client.caseIds.contains(legalCase.id))
        .toList(growable: false);

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: Text(client.name),
          bottom: const TabBar(
            tabs: <Widget>[
              Tab(text: 'القضايا'),
              Tab(text: 'المستندات'),
              Tab(text: 'الملاحظات'),
            ],
          ),
        ),
        body: TabBarView(
          children: <Widget>[
            ListView(
              padding: const EdgeInsets.all(16),
              children: <Widget>[
                AppCard(
                  child: Row(
                    children: <Widget>[
                      CircleAvatar(
                        backgroundColor: AppColors.primary.withValues(
                          alpha: 0.12,
                        ),
                        child: Text(client.name.substring(0, 1)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Text(
                              client.name,
                              style: Theme.of(context).textTheme.titleMedium
                                  ?.copyWith(fontWeight: FontWeight.w900),
                            ),
                            Text(client.phone),
                            Text(client.email),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: () {},
                        icon: const Icon(Icons.call_outlined),
                      ),
                      IconButton(
                        onPressed: () {},
                        icon: const Icon(Icons.chat_outlined),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                ...linkedCases.map(
                  (legalCase) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: CaseCard(
                      legalCase: legalCase,
                      onTap: () => Navigator.of(context).push(
                        MaterialPageRoute<void>(
                          builder: (_) => CaseDetailsScreen(
                            appState: appState,
                            legalCase: legalCase,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            ListView(
              padding: const EdgeInsets.all(16),
              children: appState.documents
                  .where((document) => document.clientId == client.id)
                  .map(
                    (document) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: DocumentCard(document: document),
                    ),
                  )
                  .toList(),
            ),
            ListView(
              padding: const EdgeInsets.all(16),
              children: const <Widget>[
                AppCard(child: Text('آخر تواصل: تمت مراجعة بيانات العميل.')),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
