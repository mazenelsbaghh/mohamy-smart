import 'package:flutter/material.dart';
import '../../core/models/legal_models.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_card.dart';

class OcrReviewScreen extends StatefulWidget {
  const OcrReviewScreen({required this.document, super.key});

  final LegalDocument document;

  @override
  State<OcrReviewScreen> createState() => _OcrReviewScreenState();
}

class _OcrReviewScreenState extends State<OcrReviewScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  late TextEditingController _titleController;
  late TextEditingController _dateController;
  late TextEditingController _caseController;
  late TextEditingController _contentController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    
    // Initialize editable controllers with doc info
    _titleController = TextEditingController(text: widget.document.title);
    _dateController = TextEditingController(text: widget.document.dateLabel);
    _caseController = TextEditingController(text: 'قضية مطالبة مالية - الرياض');
    _contentController = TextEditingController(
      text: 'المستند المرفق هو عقد توريد وتركيب مواد كهربائية وانشائية مؤرخ في ٢٠ مايو ٢٠٢٦م، محرر بين شركة النور للتجارة والتوريدات (طرف أول) ومؤسسة العمار للمقاولات (طرف ثاني)، بقيمة إجمالية قدرها ١٥٠,٠٠٠ ريال سعودي. المحكمة التجارية بالرياض هي الجهة القضائية المتفق عليها لتسوية النزاعات.',
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    _titleController.dispose();
    _dateController.dispose();
    _caseController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  void _saveDocument() {
    // Show a beautiful premium feedback SnackBar
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
          // 1. Overview Accuracy & Auto-audit Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: cardBg,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: (isDark ? Colors.white : const Color(0xFFD9C3AE)).withValues(alpha: 0.1),
              ),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF885200).withValues(alpha: isDark ? 0.01 : 0.04),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Row(
              children: [
                // Circular Accuracy Radial
                SizedBox(
                  width: 76,
                  height: 76,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      CircularProgressIndicator(
                        value: 0.98,
                        strokeWidth: 7,
                        color: AppColors.success,
                        backgroundColor: isDark ? Colors.white10 : Colors.black.withValues(alpha: 0.05),
                      ),
                      const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            '٩٨٪',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w900,
                              color: AppColors.success,
                              height: 1.1,
                            ),
                          ),
                          Text(
                            'دقة القراءة',
                            style: TextStyle(
                              fontSize: 8,
                              color: AppColors.success,
                              fontWeight: FontWeight.bold,
                              height: 1.1,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                // Text details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFFDCFCE7),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.auto_awesome, color: Color(0xFF15803D), size: 12),
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
                          const SizedBox(width: 8),
                          Text(
                            widget.document.type,
                            style: TextStyle(
                              fontSize: 11,
                              color: mutedText,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _titleController.text,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'تاريخ المسح: ٢١ مايو ٢٠٢٦',
                        style: TextStyle(
                          fontSize: 11,
                          color: mutedText,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // 2. TabBar navigation container
          Container(
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF141414) : const Color(0xFFF6F4EC),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: (isDark ? Colors.white : const Color(0xFFD9C3AE)).withValues(alpha: 0.1),
              ),
            ),
            padding: const EdgeInsets.all(4),
            child: TabBar(
              controller: _tabController,
              indicator: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(12),
              ),
              labelColor: Colors.white,
              unselectedLabelColor: mutedText,
              dividerColor: Colors.transparent,
              indicatorSize: TabBarIndicatorSize.tab,
              labelStyle: const TextStyle(
                fontWeight: FontWeight.bold,
                fontFamily: 'Tajawal',
                fontSize: 14,
              ),
              tabs: const [
                Tab(text: 'الوثيقة الأصلية'),
                Tab(text: 'البيانات المستخرجة'),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 3. TabBarView simulated height area
          SizedBox(
            height: 420,
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildOriginalDocView(isDark, cardBg, mutedText),
                _buildExtractedFieldsForm(isDark, cardBg, mutedText),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // 4. Smart Check Audit Block
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1D1D1D) : const Color(0xFFFBFAE8),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: const Color(0xFFEF950A).withValues(alpha: 0.15),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.security_update_good_outlined, color: AppColors.primary, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      'التدقيق القانوني الذكي للوثيقة',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: titleColor,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  '• تم تحديد أطراف التعاقد: الطرف الأول (شركة النور) والطرف الثاني (مؤسسة العمار).\n• تم رصد قيمة الالتزام المالي بشكل صحيح ومطابقتها بالتفصيل المكتوب.\n• لم يتم رصد أي تضارب في التواريخ أو المواعيد القانونية الواردة بالبند الرابع.',
                  style: TextStyle(
                    fontSize: 12,
                    color: isDark ? Colors.white70 : const Color(0xFF5C5243),
                    height: 1.6,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 28),

          // 5. Actions Row
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    // Simulating rescan
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('جاري إعادة الفحص وقراءة المستند...'),
                      ),
                    );
                  },
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    side: const BorderSide(color: AppColors.primary, width: 1.4),
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
          ),
        ],
      ),
    );
  }

  Widget _buildOriginalDocView(bool isDark, Color cardBg, Color mutedText) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF161616) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: (isDark ? Colors.white : const Color(0xFFD9C3AE)).withValues(alpha: 0.1),
        ),
      ),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header of document
            Center(
              child: Container(
                width: 120,
                height: 8,
                decoration: BoxDecoration(
                  color: (isDark ? Colors.white24 : Colors.black12),
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),
            const SizedBox(height: 20),
            _buildHighlightedLine('المملكة العربية السعودية', isHeader: true),
            const SizedBox(height: 12),
            _buildHighlightedLine('عقد توريد وتركيب مواد كهربائية وانشائية', isHighlighted: true),
            const SizedBox(height: 20),
            _buildHighlightedLine('إنه في يوم: ٢٠ مايو ٢٠٢٦م تم الاتفاق بين كل من:'),
            _buildHighlightedLine('طرف أول: شركة النور للتجارة والتوريدات ويمثلها...', isHighlighted: true),
            _buildHighlightedLine('طرف ثاني: مؤسسة العمار للمقاولات ويمثلها...'),
            _buildHighlightedLine('موضوع العقد: توريد كابلات كهربائية ومحولات ضغط عالي حسب المواصفات الفنية الملحقة...'),
            _buildHighlightedLine('القيمة الإجمالية: ١٥٠,٠٠٠ ريال سعودي تدفع على دفعات...', isHighlighted: true),
            _buildHighlightedLine('المحكمة المختصة: المحكمة التجارية بالرياض في حال نشوب أي نزاع.', isHighlighted: true),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  children: [
                    Container(width: 80, height: 2, color: isDark ? Colors.white30 : Colors.black26),
                    const SizedBox(height: 4),
                    Text('توقيع الطرف الأول', style: TextStyle(fontSize: 10, color: mutedText)),
                  ],
                ),
                Column(
                  children: [
                    Container(width: 80, height: 2, color: isDark ? Colors.white30 : Colors.black26),
                    const SizedBox(height: 4),
                    Text('توقيع الطرف الثاني', style: TextStyle(fontSize: 10, color: mutedText)),
                  ],
                ),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildHighlightedLine(String text, {bool isHeader = false, bool isHighlighted = false}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: isHighlighted
          ? BoxDecoration(
              color: const Color(0xFFEF950A).withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFFEF950A).withValues(alpha: 0.3), width: 1),
            )
          : null,
      child: Text(
        text,
        textAlign: isHeader ? TextAlign.center : TextAlign.start,
        style: TextStyle(
          fontSize: isHeader ? 14 : 12,
          fontWeight: isHeader || isHighlighted ? FontWeight.bold : FontWeight.normal,
          height: 1.6,
        ),
      ),
    );
  }

  Widget _buildExtractedFieldsForm(bool isDark, Color cardBg, Color mutedText) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF161616) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: (isDark ? Colors.white : const Color(0xFFD9C3AE)).withValues(alpha: 0.1),
        ),
      ),
      child: SingleChildScrollView(
        child: Column(
          children: [
            _buildFieldInput(
              label: 'اسم المستند',
              controller: _titleController,
              icon: Icons.title,
            ),
            const SizedBox(height: 14),
            _buildFieldInput(
              label: 'تاريخ الإصدار',
              controller: _dateController,
              icon: Icons.calendar_today,
            ),
            const SizedBox(height: 14),
            _buildFieldInput(
              label: 'القضية المرتبطة',
              controller: _caseController,
              icon: Icons.gavel,
            ),
            const SizedBox(height: 14),
            _buildFieldInput(
              label: 'محتوى النص المستخرج',
              controller: _contentController,
              icon: Icons.description_outlined,
              maxLines: 4,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFieldInput({
    required String label,
    required TextEditingController controller,
    required IconData icon,
    int maxLines = 1,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          maxLines: maxLines,
          decoration: InputDecoration(
            prefixIcon: Icon(icon, size: 18, color: AppColors.primary),
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            filled: true,
            fillColor: isDark ? const Color(0xFF1F1F1F) : const Color(0xFFFBF9F4),
          ),
          style: const TextStyle(fontSize: 13),
        ),
      ],
    );
  }
}
