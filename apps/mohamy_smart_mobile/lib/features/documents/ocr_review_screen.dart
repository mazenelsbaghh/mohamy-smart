import 'dart:typed_data';
import 'package:flutter/material.dart';
import '../../app/app_state.dart';
import '../../core/models/legal_models.dart';
import '../../core/theme/app_theme.dart';
import '../cases/add_case_screen.dart';

class OcrReviewScreen extends StatefulWidget {
  const OcrReviewScreen({
    required this.document,
    required this.appState,
    this.extractedText,
    this.imageBytes,
    this.fileType,
    super.key,
  });

  final LegalDocument document;
  final AppState appState;
  final String? extractedText;
  final List<int>? imageBytes;
  final String? fileType;

  @override
  State<OcrReviewScreen> createState() => _OcrReviewScreenState();
}

class _OcrReviewScreenState extends State<OcrReviewScreen> {
  late TextEditingController _contentController;
  bool _isImageExpanded = true;

  @override
  void initState() {
    super.initState();
    _contentController = TextEditingController(
      text: widget.extractedText ?? '',
    );
  }

  @override
  void dispose() {
    _contentController.dispose();
    super.dispose();
  }

  bool get _isImageFile {
    final ext = (widget.fileType ?? '').toLowerCase();
    return ext == 'jpg' || ext == 'jpeg' || ext == 'png' || ext == 'webp';
  }

  void _saveDocument() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        content: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF885200), Color(0xFFEF950A)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(16),
            boxShadow: const [
              BoxShadow(
                color: Color(0x33885200),
                blurRadius: 16,
                offset: Offset(0, 8),
              ),
            ],
          ),
          child: const Row(
            children: [
              Icon(Icons.check_circle_outline, color: Colors.white, size: 24),
              SizedBox(width: 12),
              Text(
                'تم حفظ وتدقيق المستند بنجاح',
                style: TextStyle(
                  color: Colors.white,
                  fontFamily: 'Tajawal',
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
      ),
    );
    Navigator.of(context).pop();
  }

  Future<void> _generateCaseWithAi() async {
    showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return Center(
          child: Container(
            padding: const EdgeInsets.all(24),
            margin: const EdgeInsets.symmetric(horizontal: 40),
            decoration: BoxDecoration(
              color: Theme.of(context).brightness == Brightness.dark
                  ? const Color(0xFF242424)
                  : Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color:
                    (Theme.of(context).brightness == Brightness.dark
                            ? Colors.white
                            : const Color(0xFFD9C3AE))
                        .withValues(alpha: 0.15),
              ),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x1A000000),
                  blurRadius: 24,
                  offset: Offset(0, 12),
                ),
              ],
            ),
            child: const Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                CircularProgressIndicator(color: AppColors.primary),
                SizedBox(height: 20),
                Text(
                  'جاري استخراج بيانات القضية بالذكاء الاصطناعي...',
                  style: TextStyle(
                    color: AppColors.primary,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Tajawal',
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        );
      },
    );

    String caseNumber = '';
    String clientName = '';
    String court = '';
    String caseType = '';
    String adversary = '';
    String legalClaims = '';
    bool success = false;

    try {
      final response = await widget.appState.apiService.generateCaseFile(
        revisedText: _contentController.text,
      );

      if (response['succeeded'] == true) {
        final data = response['data'] as Map<String, dynamic>?;
        if (data != null) {
          caseNumber = (data['number'] ?? data['caseNumber'] ?? '').toString();
          clientName = (data['clientName'] ?? data['client'] ?? '').toString();
          court = (data['court'] ?? data['courtName'] ?? '').toString();
          caseType =
              data['type']?.toString() ??
              (data['types'] != null && (data['types'] as List).isNotEmpty
                  ? data['types'][0].toString()
                  : '');
          adversary =
              (data['adversary'] ??
                      data['opponentName'] ??
                      data['apponentName'] ??
                      '')
                  .toString();
          legalClaims =
              (data['legalClaims'] ?? data['claims'] ?? data['requests'] ?? '')
                  .toString();
          success = true;
        }
      }
    } catch (e) {
      debugPrint('Error generating case via AI: $e');
    } finally {
      if (mounted) {
        Navigator.of(context).pop(); // dismiss loading dialog
      }
    }

    if (!success) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'فشل إنشاء القضية بالذكاء الاصطناعي. الرجاء التحقق من الاتصال بالخادم والمحاولة مرة أخرى.',
              style: TextStyle(fontFamily: 'Tajawal'),
            ),
            backgroundColor: AppColors.danger,
          ),
        );
      }
      return;
    }

    if (mounted) {
      Navigator.of(context).push(
        MaterialPageRoute<void>(
          builder: (_) => AddCaseScreen(
            appState: widget.appState,
            initialCaseNumber: caseNumber,
            initialClientName: clientName,
            initialCourt: court,
            initialCaseType: caseType,
            initialFacts: _contentController.text.trim(),
            initialAdversary: adversary,
            initialLegalClaims: legalClaims,
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final canvasBg = isDark ? AppColors.darkBg : AppColors.lightBg;
    final cardBg = isDark ? AppColors.darkSurface : Colors.white;
    final mutedText = isDark ? AppColors.darkMuted : AppColors.lightMuted;
    final titleColor = isDark ? Colors.white : AppColors.primaryBronze;

    return Scaffold(
      backgroundColor: canvasBg,
      appBar: AppBar(
        title: const Text('تدقيق ومراجعة المستند'),
        backgroundColor: canvasBg,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
        children: [
          // 1. Document image preview
          _buildImageSection(isDark, cardBg, mutedText, titleColor),
          const SizedBox(height: 20),

          // 2. Extracted text section
          _buildExtractedTextSection(isDark, cardBg, mutedText, titleColor),
          const SizedBox(height: 20),

          // 3. AI Case Generation Button
          _buildAiGenerateButton(),
          const SizedBox(height: 20),

          // 4. Action buttons
          _buildActionButtons(),
        ],
      ),
    );
  }

  Widget _buildImageSection(
    bool isDark,
    Color cardBg,
    Color mutedText,
    Color titleColor,
  ) {
    return Container(
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: (isDark ? Colors.white : const Color(0xFFD9C3AE)).withValues(
            alpha: 0.1,
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(
              0xFF885200,
            ).withValues(alpha: isDark ? 0.01 : 0.04),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with toggle
          InkWell(
            onTap: () => setState(() => _isImageExpanded = !_isImageExpanded),
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(24),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Icons.image_outlined,
                      color: AppColors.primary,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'الوثيقة الأصلية',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w900,
                            color: titleColor,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          widget.document.title,
                          style: TextStyle(fontSize: 11, color: mutedText),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  // File type badge
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      widget.document.type,
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  AnimatedRotation(
                    turns: _isImageExpanded ? 0.0 : -0.25,
                    duration: const Duration(milliseconds: 200),
                    child: Icon(
                      Icons.keyboard_arrow_down,
                      color: mutedText,
                      size: 24,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Image content (collapsible)
          AnimatedCrossFade(
            firstChild: _buildImageContent(isDark, mutedText),
            secondChild: const SizedBox.shrink(),
            crossFadeState: _isImageExpanded
                ? CrossFadeState.showFirst
                : CrossFadeState.showSecond,
            duration: const Duration(milliseconds: 250),
          ),
        ],
      ),
    );
  }

  Widget _buildImageContent(bool isDark, Color mutedText) {
    final hasImage = widget.imageBytes != null && widget.imageBytes!.isNotEmpty;

    return Column(
      children: [
        Divider(
          height: 1,
          color: (isDark ? Colors.white : const Color(0xFFD9C3AE)).withValues(
            alpha: 0.1,
          ),
        ),
        Container(
          constraints: const BoxConstraints(maxHeight: 400),
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          child: hasImage && _isImageFile
              ? ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: Image.memory(
                    Uint8List.fromList(widget.imageBytes!),
                    fit: BoxFit.contain,
                    errorBuilder: (_, e, st) => _buildPlaceholder(
                        isDark,
                        mutedText,
                        'تعذر عرض الصورة',
                      ),
                  ),
                )
              : hasImage && !_isImageFile
                  ? _buildPlaceholder(
                      isDark,
                      mutedText,
                      'ملف PDF — لا يمكن عرضه كصورة',
                      icon: Icons.picture_as_pdf,
                    )
                  : _buildPlaceholder(isDark, mutedText, 'لا تتوفر صورة للمعاينة'),
        ),
        // Pinch to zoom hint for images
        if (hasImage && _isImageFile)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.pinch_outlined, size: 14, color: mutedText),
                const SizedBox(width: 4),
                Text(
                  'اضغط مطولاً وكبّر للتفاصيل',
                  style: TextStyle(fontSize: 10, color: mutedText),
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildPlaceholder(bool isDark, Color mutedText, String text,
      {IconData icon = Icons.image_not_supported_outlined}) {
    return Container(
      height: 160,
      decoration: BoxDecoration(
        color: isDark
            ? Colors.white.withValues(alpha: 0.03)
            : const Color(0xFFF6F4EC),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: (isDark ? Colors.white : const Color(0xFFD9C3AE)).withValues(
            alpha: 0.1,
          ),
        ),
      ),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 40, color: mutedText),
            const SizedBox(height: 8),
            Text(text, style: TextStyle(fontSize: 12, color: mutedText)),
          ],
        ),
      ),
    );
  }

  Widget _buildExtractedTextSection(
    bool isDark,
    Color cardBg,
    Color mutedText,
    Color titleColor,
  ) {
    final text = _contentController.text;
    final wordCount = text.trim().isEmpty
        ? 0
        : text.trim().split(RegExp(r'\s+')).length;

    return Container(
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: (isDark ? Colors.white : const Color(0xFFD9C3AE)).withValues(
            alpha: 0.1,
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(
              0xFF885200,
            ).withValues(alpha: isDark ? 0.01 : 0.04),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section header
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.success.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.text_snippet_outlined,
                    color: AppColors.success,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'النص المستخرج',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w900,
                          color: titleColor,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '$wordCount كلمة',
                        style: TextStyle(fontSize: 11, color: mutedText),
                      ),
                    ],
                  ),
                ),
                // Accuracy badge
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFDCFCE7),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.auto_awesome,
                        color: Color(0xFF15803D),
                        size: 12,
                      ),
                      SizedBox(width: 4),
                      Text(
                        'تدقيق ذكي',
                        style: TextStyle(
                          color: Color(0xFF15803D),
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          Divider(
            height: 1,
            color: (isDark ? Colors.white : const Color(0xFFD9C3AE)).withValues(
              alpha: 0.1,
            ),
          ),

          // Editable text content
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _contentController,
              maxLines: null,
              minLines: 8,
              style: TextStyle(
                fontSize: 14,
                height: 1.8,
                color: isDark ? Colors.white : const Color(0xFF2C2418),
              ),
              decoration: InputDecoration(
                border: InputBorder.none,
                filled: true,
                fillColor: isDark
                    ? Colors.white.withValues(alpha: 0.03)
                    : const Color(0xFFFBF9F4),
                contentPadding: const EdgeInsets.all(16),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide(
                    color: (isDark ? Colors.white : const Color(0xFFD9C3AE))
                        .withValues(alpha: 0.1),
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: const BorderSide(
                    color: AppColors.primary,
                    width: 1.5,
                  ),
                ),
                hintText: 'لا يوجد نص مستخرج...',
                hintStyle: TextStyle(color: mutedText, fontSize: 13),
              ),
              onChanged: (_) => setState(() {}),
            ),
          ),

          // Edit hint
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Row(
              children: [
                Icon(Icons.edit_note, size: 14, color: mutedText),
                const SizedBox(width: 4),
                Text(
                  'يمكنك تعديل النص المستخرج قبل إنشاء القضية',
                  style: TextStyle(fontSize: 10, color: mutedText),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAiGenerateButton() {
    return InkWell(
      key: const Key('ai_generate_case_button'),
      onTap: _generateCaseWithAi,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF885200), Color(0xFFEF950A)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: const [
            BoxShadow(
              color: Color(0x33885200),
              blurRadius: 16,
              offset: Offset(0, 8),
            ),
          ],
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.auto_awesome, color: Colors.white, size: 20),
            SizedBox(width: 10),
            Flexible(
              child: Text(
                'إنشاء قضية بالذكاء الاصطناعي',
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: Colors.white,
                  fontFamily: 'Tajawal',
                  fontWeight: FontWeight.bold,
                  fontSize: 15,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButtons() {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('جاري إعادة الفحص وقراءة المستند...'),
                ),
              );
            },
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              side: const BorderSide(
                color: AppColors.primary,
                width: 1.4,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ),
            child: const Text(
              'إعادة الفحص',
              style: TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
          ),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: InkWell(
            onTap: _saveDocument,
            borderRadius: BorderRadius.circular(16),
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                gradient: AppColors.goldGradient,
                borderRadius: BorderRadius.circular(16),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x33885200),
                    blurRadius: 16,
                    offset: Offset(0, 8),
                  ),
                ],
              ),
              alignment: Alignment.center,
              child: const Text(
                'حفظ المستند',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
