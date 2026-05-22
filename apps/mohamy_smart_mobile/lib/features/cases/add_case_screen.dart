import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../core/models/legal_models.dart';

class AddCaseScreen extends StatefulWidget {
  const AddCaseScreen({required this.appState, super.key});

  final AppState appState;

  @override
  State<AddCaseScreen> createState() => _AddCaseScreenState();
}

class _AddCaseScreenState extends State<AddCaseScreen> {
  final _formKey = GlobalKey<FormState>();
  final _caseNumber = TextEditingController();
  final _clientName = TextEditingController();
  final _court = TextEditingController();
  final _caseType = TextEditingController();

  @override
  void dispose() {
    _caseNumber.dispose();
    _clientName.dispose();
    _court.dispose();
    _caseType.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('إضافة قضية')),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: <Widget>[
              SegmentedButton<int>(
                segments: const <ButtonSegment<int>>[
                  ButtonSegment<int>(value: 0, label: Text('يدوي')),
                  ButtonSegment<int>(value: 1, label: Text('من مستند')),
                ],
                selected: const <int>{0},
                onSelectionChanged: (_) {},
              ),
              const SizedBox(height: 16),
              TextFormField(
                key: const Key('case_number_field'),
                controller: _caseNumber,
                decoration: const InputDecoration(labelText: 'رقم القضية'),
                validator: _required,
              ),
              const SizedBox(height: 12),
              TextFormField(
                key: const Key('client_name_field'),
                controller: _clientName,
                decoration: const InputDecoration(labelText: 'اسم العميل'),
                validator: _required,
              ),
              const SizedBox(height: 12),
              TextFormField(
                key: const Key('court_field'),
                controller: _court,
                decoration: const InputDecoration(labelText: 'المحكمة'),
                validator: _required,
              ),
              const SizedBox(height: 12),
              TextFormField(
                key: const Key('case_type_field'),
                controller: _caseType,
                decoration: const InputDecoration(labelText: 'نوع القضية'),
                validator: _required,
              ),
              const SizedBox(height: 24),
              FilledButton(
                key: const Key('save_case_button'),
                onPressed: _save,
                child: const Text('حفظ القضية'),
              ),
              TextButton(onPressed: () {}, child: const Text('حفظ كمسودة')),
            ],
          ),
        ),
      ),
    );
  }

  String? _required(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'هذا الحقل مطلوب';
    }
    return null;
  }

  void _save() {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    widget.appState.addCase(
      AddCaseInput(
        caseNumber: _caseNumber.text,
        clientName: _clientName.text,
        court: _court.text,
        caseType: _caseType.text,
      ),
    );
    Navigator.of(context).pop();
  }
}
