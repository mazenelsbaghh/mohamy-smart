import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../core/models/legal_models.dart';

class AddCaseScreen extends StatefulWidget {
  const AddCaseScreen({
    required this.appState,
    this.initialCaseNumber,
    this.initialClientName,
    this.initialCourt,
    this.initialCaseType,
    this.initialFacts,
    this.initialAdversary,
    this.initialLegalClaims,
    super.key,
  });

  final AppState appState;
  final String? initialCaseNumber;
  final String? initialClientName;
  final String? initialCourt;
  final String? initialCaseType;
  final String? initialFacts;
  final String? initialAdversary;
  final String? initialLegalClaims;

  @override
  State<AddCaseScreen> createState() => _AddCaseScreenState();
}

class _AddCaseScreenState extends State<AddCaseScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _caseNumber;
  late final TextEditingController _clientName;
  late final TextEditingController _court;
  late final TextEditingController _caseType;
  late final TextEditingController _facts;
  late final TextEditingController _adversary;
  late final TextEditingController _legalClaims;
  bool _isSaving = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _caseNumber = TextEditingController(text: widget.initialCaseNumber);
    _clientName = TextEditingController(text: widget.initialClientName);
    _court = TextEditingController(text: widget.initialCourt);
    _caseType = TextEditingController(text: widget.initialCaseType);
    _facts = TextEditingController(text: widget.initialFacts);
    _adversary = TextEditingController(text: widget.initialAdversary);
    _legalClaims = TextEditingController(text: widget.initialLegalClaims);
  }

  @override
  void dispose() {
    _caseNumber.dispose();
    _clientName.dispose();
    _court.dispose();
    _caseType.dispose();
    _facts.dispose();
    _adversary.dispose();
    _legalClaims.dispose();
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
              const SizedBox(height: 12),
              TextFormField(
                key: const Key('adversary_field'),
                controller: _adversary,
                decoration: const InputDecoration(
                  labelText: 'اسم الخصم',
                  hintText: 'المدعي أو المدعى عليه المقابل',
                ),
              ),
              const SizedBox(height: 12),
              TextFormField(
                key: const Key('facts_field'),
                controller: _facts,
                decoration: const InputDecoration(
                  labelText: 'وقائع القضية',
                  hintText: 'اكتب الوقائع الأساسية أو راجع النص القادم من OCR',
                ),
                minLines: 4,
                maxLines: 7,
              ),
              const SizedBox(height: 12),
              TextFormField(
                key: const Key('legal_claims_field'),
                controller: _legalClaims,
                decoration: const InputDecoration(
                  labelText: 'الطلبات والأساس القانوني',
                  hintText: 'مثال: إلزام الخصم بالسداد، التعويض، المصروفات',
                ),
                minLines: 3,
                maxLines: 6,
              ),
              if (_errorMessage != null) ...<Widget>[
                const SizedBox(height: 12),
                Text(
                  _errorMessage!,
                  style: const TextStyle(
                    color: Colors.redAccent,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
              const SizedBox(height: 24),
              FilledButton(
                key: const Key('save_case_button'),
                onPressed: _isSaving ? null : _save,
                child: _isSaving
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2.4),
                      )
                    : const Text('حفظ القضية'),
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

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isSaving = true;
      _errorMessage = null;
    });

    try {
      await widget.appState.addCase(
        AddCaseInput(
          caseNumber: _caseNumber.text.trim(),
          clientName: _clientName.text.trim(),
          court: _court.text.trim(),
          caseType: _caseType.text.trim(),
          facts: _facts.text.trim(),
          adversary: _adversary.text.trim(),
          legalClaims: _legalClaims.text.trim(),
        ),
      );
      if (mounted) {
        Navigator.of(context).pop();
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _errorMessage =
              'تعذر حفظ القضية. راجع الاتصال أو البيانات ثم حاول مرة أخرى.';
          _isSaving = false;
        });
      }
    }
  }
}
