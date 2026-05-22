import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../core/theme/app_theme.dart';
import '../../core/models/legal_models.dart';
import 'ocr_review_screen.dart';

class DocumentsScreen extends StatefulWidget {
  const DocumentsScreen({required this.appState, super.key});

  final AppState appState;

  @override
  State<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends State<DocumentsScreen> {
  String _searchQuery = '';

  Future<void> _handleUpload(BuildContext context) async {
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
                color: (Theme.of(context).brightness == Brightness.dark
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
                  'جاري رفع المستند واستخراج النصوص بالذكاء الاصطناعي...',
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

    // Dummy 1x1 transparent PNG bytes
    final List<int> dummyPngBytes = [
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1,
      0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 13, 73, 68, 65, 84,
      120, 94, 99, 96, 0, 0, 0, 2, 0, 1, 73, 175, 168, 142, 0, 0, 0, 0, 73, 69,
      78, 68, 174, 66, 96, 130
    ];
    final String filename = 'document_scan.png';

    String extractedText =
        'المستند المرفق هو عقد توريد وتركيب مواد كهربائية وانشائية مؤرخ في ٢٠ مايو ٢٠٢٦م، محرر بين شركة النور للتجارة والتوريدات (طرف أول) ومؤسسة العمار للمقاولات (طرف ثاني)، بقيمة إجمالية قدرها ١٥٠,٠٠٠ ريال سعودي. المحكمة التجارية بالرياض هي الجهة القضائية المتفق عليها لتسوية النزاعات.';

    try {
      final response = await widget.appState.apiService.uploadOcrImage(
        dummyPngBytes,
        filename,
      );
      final List<dynamic>? dataList = response['data'] as List<dynamic>?;
      if (dataList != null && dataList.isNotEmpty) {
        extractedText = dataList[0].toString();
      }
    } catch (e) {
      debugPrint('Error uploading OCR image: $e');
      // Fallback is already initialized to the defaults
    } finally {
      if (mounted) {
        Navigator.of(context).pop(); // dismiss loading dialog
      }
    }

    if (mounted) {
      // Create a temporary LegalDocument
      final newDoc = LegalDocument(
        id: 'doc_${DateTime.now().millisecondsSinceEpoch}',
        title: 'مستند ممسوح ضوئياً ${DateTime.now().hour}:${DateTime.now().minute}',
        type: 'عقد توريد',
        dateLabel: '٢١ مايو ٢٠٢٦',
        status: DocumentStatus.ready,
        isAiReady: true,
      );

      // Navigate to OcrReviewScreen
      Navigator.of(context).push(
        MaterialPageRoute<void>(
          builder: (_) => OcrReviewScreen(
            document: newDoc,
            appState: widget.appState,
            extractedText: extractedText,
          ),
        ),
      );
    }
  }

  Widget _buildDocThumbnail(String type, bool isDark) {
    final Color primaryColor = AppColors.primary;
    return Container(
      width: 60,
      height: 72,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF242424) : const Color(0xFFF5F3EB),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: (isDark ? Colors.white : const Color(0xFFD9C3AE)).withValues(alpha: 0.15),
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            top: 10,
            left: 8,
            right: 8,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(width: 32, height: 3, color: isDark ? Colors.white30 : Colors.black26),
                const SizedBox(height: 5),
                Container(width: 44, height: 3, color: isDark ? Colors.white12 : Colors.black12),
                const SizedBox(height: 5),
                Container(width: 40, height: 3, color: isDark ? Colors.white12 : Colors.black12),
                const SizedBox(height: 5),
                Container(width: 24, height: 3, color: isDark ? Colors.white12 : Colors.black12),
              ],
            ),
          ),
          Positioned(
            bottom: 6,
            right: 6,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
              decoration: BoxDecoration(
                color: primaryColor.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                type,
                style: TextStyle(
                  fontSize: 8,
                  fontWeight: FontWeight.w900,
                  color: primaryColor,
                ),
              ),
            ),
          ),
          Positioned(
            top: 0,
            left: 0,
            child: Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF161616) : Colors.white,
                borderRadius: const BorderRadius.only(
                  bottomRight: Radius.circular(4),
                ),
                border: Border(
                  bottom: BorderSide(color: (isDark ? Colors.white : const Color(0xFFD9C3AE)).withValues(alpha: 0.15)),
                  right: BorderSide(color: (isDark ? Colors.white : const Color(0xFFD9C3AE)).withValues(alpha: 0.15)),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUploadActionChip({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF242424) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: (isDark ? Colors.white24 : const Color(0xFFD9C3AE)).withValues(alpha: 0.3),
          ),
          boxShadow: const [
            BoxShadow(
              color: Color(0x05885200),
              blurRadius: 8,
              offset: Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: AppColors.primary, size: 16),
            const SizedBox(width: 6),
            Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFormatChip(String label) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withValues(alpha: 0.05) : const Color(0xFFF0EEE7),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 9,
          fontWeight: FontWeight.bold,
          color: isDark ? Colors.white38 : Colors.black38,
        ),
      ),
    );
  }

  Widget _buildDocumentCard(
    BuildContext context,
    LegalDocument document,
    bool isDark,
    Color cardBg,
    Color mutedText,
  ) {
    Color statusBgColor;
    Color statusTextColor;
    String statusLabel = document.status.label;

    switch (document.status) {
      case DocumentStatus.ready:
        statusBgColor = isDark ? const Color(0x2934BF49) : const Color(0x1F34BF49);
        statusTextColor = AppColors.success;
        break;
      case DocumentStatus.processing:
      case DocumentStatus.uploading:
        statusBgColor = isDark ? const Color(0x29EF950A) : const Color(0x1FEF950A);
        statusTextColor = AppColors.primary;
        break;
      case DocumentStatus.failed:
        statusBgColor = isDark ? const Color(0x29CA0000) : const Color(0x1ACA0000);
        statusTextColor = AppColors.danger;
        break;
    }

    return InkWell(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute<void>(
            builder: (_) => OcrReviewScreen(
              document: document,
              appState: widget.appState,
            ),
          ),
        );
      },
      borderRadius: BorderRadius.circular(24),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: (isDark ? Colors.white : const Color(0xFFD9C3AE)).withValues(alpha: 0.1),
          ),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF885200).withValues(alpha: isDark ? 0.01 : 0.03),
              blurRadius: 16,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Row(
          children: [
            _buildDocThumbnail(document.type, isDark),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    document.title,
                    style: const TextStyle(
                      fontWeight: FontWeight.w900,
                      fontSize: 14,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'تاريخ الإضافة: ${document.dateLabel}',
                    style: TextStyle(
                      fontSize: 11,
                      color: mutedText,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusBgColor,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      statusLabel,
                      style: TextStyle(
                        color: statusTextColor,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF242424) : const Color(0xFFF0EEE7),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.arrow_back,
                color: AppColors.primary,
                size: 16,
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final canvasBg = isDark ? AppColors.darkBg : AppColors.lightBg;
    final cardBg = isDark ? AppColors.darkSurface : Colors.white;
    final mutedText = isDark ? AppColors.darkMuted : AppColors.lightMuted;
    final titleColor = isDark ? Colors.white : AppColors.primaryBronze;

    // Filter documents based on query
    final filteredDocuments = widget.appState.documents.where((doc) {
      final query = _searchQuery.trim().toLowerCase();
      if (query.isEmpty) return true;
      return doc.title.toLowerCase().contains(query) ||
          doc.type.toLowerCase().contains(query);
    }).toList();

    // Stats calculations
    final completedCount = widget.appState.documents
        .where((d) => d.status == DocumentStatus.ready)
        .length;
    final processingCount = widget.appState.documents
        .where((d) =>
            d.status == DocumentStatus.processing ||
            d.status == DocumentStatus.uploading)
        .length;

    return Scaffold(
      backgroundColor: canvasBg,
      appBar: AppBar(
        title: const Text('إدارة المستندات'),
        backgroundColor: canvasBg,
        elevation: 0,
      ),
      floatingActionButtonLocation: const OffsetStartFloatLocation(),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _handleUpload(context),
        shape: const CircleBorder(),
        elevation: 0,
        backgroundColor: Colors.transparent,
        child: Container(
          width: 56,
          height: 56,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            gradient: AppColors.goldGradient,
            boxShadow: [
              BoxShadow(
                color: Color(0x4D885200),
                blurRadius: 24,
                offset: Offset(0, 12),
              ),
            ],
          ),
          child: const Icon(Icons.qr_code_scanner, color: Colors.white, size: 28),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
        children: <Widget>[
          Text(
            'المستندات و OCR',
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.w900,
              color: titleColor,
            ),
          ),
          const SizedBox(height: 16),

          // Bento Stats Row
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
                  decoration: BoxDecoration(
                    color: cardBg,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: (isDark ? Colors.white : const Color(0xFFD9C3AE)).withValues(alpha: 0.1),
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.success.withValues(alpha: 0.12),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.check_circle_outline, color: AppColors.success, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '$completedCount',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          Text(
                            'مستندات مكتملة',
                            style: TextStyle(
                              fontSize: 10,
                              color: mutedText,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
                  decoration: BoxDecoration(
                    color: cardBg,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: (isDark ? Colors.white : const Color(0xFFD9C3AE)).withValues(alpha: 0.1),
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.12),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.settings_backup_restore, color: AppColors.primary, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '$processingCount',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          Text(
                            'جاري معالجتها',
                            style: TextStyle(
                              fontSize: 10,
                              color: mutedText,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Upload Zone Container with Dashed Border Painter
          CustomPaint(
            painter: _DashedRectPainter(
              color: isDark ? Colors.white30 : const Color(0xFFD9C3AE),
              borderRadius: 24,
            ),
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
              decoration: BoxDecoration(
                color: isDark ? Colors.white.withValues(alpha: 0.02) : Colors.white.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                children: [
                  ShaderMask(
                    shaderCallback: (bounds) => AppColors.goldGradient.createShader(
                      Rect.fromLTWH(0, 0, bounds.width, bounds.height),
                    ),
                    child: const Icon(
                      Icons.cloud_upload_outlined,
                      size: 40,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'ارفع مستنداً جديداً للتحليل الفوري',
                    style: TextStyle(
                      fontWeight: FontWeight.w900,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'تصوير المستندات بكاميرا الهاتف أو اختيار ملف من جهازك',
                    style: TextStyle(
                      fontSize: 11,
                      color: mutedText,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildUploadActionChip(
                        icon: Icons.camera_alt_outlined,
                        label: 'تصوير مستند 📸',
                        onTap: () => _handleUpload(context),
                      ),
                      const SizedBox(width: 12),
                      _buildUploadActionChip(
                        icon: Icons.upload_file_outlined,
                        label: 'رفع ملف',
                        onTap: () => _handleUpload(context),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildFormatChip('PDF'),
                      const SizedBox(width: 8),
                      _buildFormatChip('PNG'),
                      const SizedBox(width: 8),
                      _buildFormatChip('JPG'),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Search Field
          TextField(
            onChanged: (val) {
              setState(() {
                _searchQuery = val;
              });
            },
            decoration: InputDecoration(
              hintText: 'ابحث باسم المستند أو نوعه...',
              prefixIcon: const Icon(Icons.search, color: AppColors.primary),
              suffixIcon: Container(
                margin: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF242424) : Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: (isDark ? Colors.white : const Color(0xFFD9C3AE)).withValues(alpha: 0.2),
                  ),
                ),
                child: const Icon(Icons.tune, color: AppColors.primary, size: 18),
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Documents List Section Title
          Text(
            'قائمة المستندات المرفوعة',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: titleColor,
            ),
          ),
          const SizedBox(height: 12),

          if (filteredDocuments.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 40),
              child: Center(
                child: Text(
                  'لا توجد مستندات تطابق بحثك',
                  style: TextStyle(color: mutedText),
                ),
              ),
            )
          else
            ...filteredDocuments.map(
              (document) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _buildDocumentCard(context, document, isDark, cardBg, mutedText),
              ),
            ),
        ],
      ),
    );
  }
}

class _DashedRectPainter extends CustomPainter {
  _DashedRectPainter({
    required this.color,
    this.strokeWidth = 1.4,
    this.gap = 6.0,
    this.dashLength = 6.0,
    this.borderRadius = 20.0,
  });

  final Color color;
  final double strokeWidth;
  final double gap;
  final double dashLength;
  final double borderRadius;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke;

    final path = Path()
      ..addRRect(RRect.fromRectAndRadius(
        Rect.fromLTWH(0, 0, size.width, size.height),
        Radius.circular(borderRadius),
      ));

    final pathMetrics = path.computeMetrics();
    for (final metric in pathMetrics) {
      double distance = 0.0;
      while (distance < metric.length) {
        final length = dashLength;
        final start = distance;
        final end = (distance + length < metric.length)
            ? distance + length
            : metric.length;

        canvas.drawPath(
          metric.extractPath(start, end),
          paint,
        );
        distance += length + gap;
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
