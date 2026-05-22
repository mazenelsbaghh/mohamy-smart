import 'dart:ui';
import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../core/theme/app_theme.dart';
import '../../core/models/legal_models.dart';

class _ChatMessage {
  _ChatMessage({
    required this.text,
    required this.isUser,
    this.attachmentTitle,
    this.bullets,
  });

  final String text;
  final bool isUser;
  final String? attachmentTitle;
  final List<String>? bullets;
}

class ChatScreen extends StatefulWidget {
  const ChatScreen({required this.appState, super.key});

  final AppState appState;

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  LegalCase? _selectedCase;
  bool _isTyping = false;

  late List<_ChatMessage> _messages;

  @override
  void initState() {
    super.initState();
    _messages = [
      _ChatMessage(
        text: 'أهلاً بك سيادة المستشار. أنا مساعدك القانوني الذكي المدعوم بـ Gemini. يمكنني مساعدتك في صياغة العقود، مراجعة المستندات، أو اقتراح دفوع قانونية قوية. كيف يمكنني مساعدتك اليوم؟',
        isUser: false,
      ),
      _ChatMessage(
        text: 'ما أهم الدفوع في قضية مطالبة مالية؟',
        isUser: true,
      ),
      _ChatMessage(
        text: 'أهم الدفوع في قضايا المطالبات المالية والنزاعات التجارية تتلخص في النقاط التالية:',
        isUser: false,
        bullets: [
          'الدفع بانتفاء صفة المدعي أو المدعى عليه في الدعوى.',
          'الدفع بعدم قبول الدعوى لعدم سلوك الطريق القانوني المسبق أو الإعذار.',
          'الدفع بانقضاء الالتزام بالإبراء أو الوفاء أو التقادم الطويل.',
          'الدفع بعدم التنفيذ أو فسخ العقد نتيجة إخلال الطرف الآخر.'
        ],
        attachmentTitle: 'دليل الدفوع التجارية المعتمدة.pdf',
      ),
    ];
  }

  @override
  void dispose() {
    _inputController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _sendMessage(String text) {
    if (text.trim().isEmpty) return;
    
    setState(() {
      _messages.add(_ChatMessage(text: text, isUser: true));
      _isTyping = true;
    });
    _inputController.clear();
    _scrollToBottom();

    // Simulated AI response delay
    Future.delayed(const Duration(milliseconds: 1200), () {
      if (!mounted) return;
      
      String aiText = 'لقد استلمت استفسارك سيادة المستشار. جاري تحليل مستندات القضية والوقائع المرتبطة لتقديم الرأي القانوني الأمثل مدعوماً بنصوص النظام المعمول بها.';
      List<String>? aiBullets;
      String? aiAttachment;

      final normalizedText = text.trim().toLowerCase();
      if (normalizedText.contains('دفوع') || normalizedText.contains('اقترح')) {
        aiText = 'بناءً على وقائع القضية وتفاصيل النزاع، أقترح الدفوع القانونية التالية:';
        aiBullets = [
          'الدفع ببطلان عقد الإيجار لعدم توثيقه في منصة إيجار الرسمية.',
          'الدفع بعدم الاختصاص المكاني للمحكمة طبقاً للبند العاشر من العقد.',
          'الدفع بانتفاء الضرر الفعلي وثبوت حالة القوة القاهرة.'
        ];
      } else if (normalizedText.contains('لخص') || normalizedText.contains('حكم')) {
        aiText = 'ملخص الحكم القضائي المرفق وتوصياتنا الاستئنافية:';
        aiBullets = [
          'منطوق الحكم: إلزام المدعى عليه بسداد مبلغ ١٠٠ ألف ريال.',
          'الحيثيات: ثبوت العلاقة التعاقدية وشهادة الشهود ونكول المدعى عليه عن اليمين.',
          'توصيات الاستئناف: يجب تقديم الاعتراض قبل انتهاء مدة الـ ٣٠ يوماً القانونية.'
        ];
        aiAttachment = 'ملخص حكم الاستئناف التجاري.pdf';
      } else if (normalizedText.contains('رسالة') || normalizedText.contains('الموكل')) {
        aiText = 'إليك مسودة الرسالة المقترحة لإرسالها للموكل عبر الواتساب:';
        aiBullets = [
          'سيادة الموكل، نحيطكم علماً بأنه تم تقديم مذكرة الدفاع القانونية بنجاح.',
          'وتم تضمين تقرير الخبير الفني الذي يعزز موقفنا في استرداد كامل المستحقات.',
          'سنوافيكم بتطورات الجلسة القادمة المقرر عقدها يوم الخميس المقبل.'
        ];
      }

      setState(() {
        _isTyping = false;
        _messages.add(_ChatMessage(
          text: aiText,
          isUser: false,
          bullets: aiBullets,
          attachmentTitle: aiAttachment,
        ));
      });
      _scrollToBottom();
    });
  }

  void _showCaseSelector(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: isDark ? AppColors.darkSurface : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'اختر القضية المرتبطة بالمحادثة',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Tajawal',
                ),
              ),
              const SizedBox(height: 14),
              ListTile(
                leading: const Icon(Icons.all_inclusive, color: AppColors.primary),
                title: const Text('بدون قضية محددة', style: TextStyle(fontFamily: 'Tajawal')),
                onTap: () {
                  setState(() {
                    _selectedCase = null;
                  });
                  Navigator.pop(context);
                },
              ),
              const Divider(),
              Expanded(
                child: ListView(
                  children: widget.appState.cases.map(
                    (c) => ListTile(
                      leading: const Icon(Icons.gavel, color: AppColors.primary),
                      title: Text(c.title, style: const TextStyle(fontFamily: 'Tajawal', fontWeight: FontWeight.bold)),
                      subtitle: Text('رقم القضية: ${c.caseNumber} • ${c.clientName}', style: const TextStyle(fontFamily: 'Tajawal')),
                      onTap: () {
                        setState(() {
                          _selectedCase = c;
                        });
                        Navigator.pop(context);
                      },
                    ),
                  ).toList(),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildWelcomeBanner(bool isDark, Color cardBg, Color titleColor, Color mutedText) {
    return Container(
      padding: const EdgeInsets.all(20),
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(28),
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.auto_awesome, color: AppColors.primary, size: 14),
                    SizedBox(width: 6),
                    Text(
                      'المستشار الذكي جاهز',
                      style: TextStyle(
                        color: AppColors.primary,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'Tajawal',
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'مرحباً بك في وحدة المساعدة الذكية ⚖️',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w900,
              color: titleColor,
              fontFamily: 'Tajawal',
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'يمكنك صياغة مذكرات الدفاع، مراجعة العقود المرفوعة، أو تدقيق الثغرات القانونية في ثوانٍ معدودة باستخدام الذكاء الاصطناعي.',
            style: TextStyle(
              fontSize: 12,
              color: mutedText,
              height: 1.5,
              fontFamily: 'Tajawal',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAttachmentCard(String filename, bool isDark) {
    return Container(
      margin: const EdgeInsets.only(top: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF242424) : const Color(0xFFFBF9F4),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: (isDark ? Colors.white : const Color(0xFFD9C3AE)).withValues(alpha: 0.15),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.picture_as_pdf, color: AppColors.danger, size: 24),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                filename,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Tajawal',
                ),
              ),
              const Text(
                'PDF • 2.4 MB',
                style: TextStyle(
                  fontSize: 9,
                  color: Colors.grey,
                  fontFamily: 'Tajawal',
                ),
              ),
            ],
          ),
          const SizedBox(width: 16),
          IconButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('جاري تحميل الملحق...')),
              );
            },
            icon: const Icon(Icons.download, color: AppColors.primary, size: 18),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
          ),
        ],
      ),
    );
  }

  Widget _buildBulletItem(String text, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.check_circle_outline, color: AppColors.success, size: 16),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                fontSize: 12.5,
                height: 1.5,
                fontFamily: 'Tajawal',
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChatBubble(_ChatMessage message, bool isDark, Color cardBg) {
    if (message.isUser) {
      return Align(
        alignment: Alignment.centerLeft,
        child: Container(
          constraints: const BoxConstraints(maxWidth: 300),
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: const BoxDecoration(
            gradient: AppColors.goldGradient,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(20),
              topRight: Radius.circular(20),
              bottomLeft: Radius.circular(20),
            ),
            boxShadow: [
              BoxShadow(
                color: Color(0x26885200),
                blurRadius: 10,
                offset: Offset(0, 4),
              ),
            ],
          ),
          child: Text(
            message.text,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13.5,
              height: 1.4,
              fontFamily: 'Tajawal',
            ),
          ),
        ),
      );
    } else {
      return Align(
        alignment: Alignment.centerRight,
        child: Container(
          constraints: const BoxConstraints(maxWidth: 320),
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(20),
              topRight: Radius.circular(20),
              bottomRight: Radius.circular(20),
            ),
            border: Border(
              right: const BorderSide(
                color: AppColors.primary,
                width: 4,
              ),
              left: BorderSide(color: (isDark ? Colors.white : const Color(0xFFD9C3AE)).withValues(alpha: 0.1)),
              top: BorderSide(color: (isDark ? Colors.white : const Color(0xFFD9C3AE)).withValues(alpha: 0.1)),
              bottom: BorderSide(color: (isDark ? Colors.white : const Color(0xFFD9C3AE)).withValues(alpha: 0.1)),
            ),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF885200).withValues(alpha: isDark ? 0.005 : 0.01),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                message.text,
                style: const TextStyle(
                  fontSize: 13.5,
                  height: 1.45,
                  fontFamily: 'Tajawal',
                ),
              ),
              if (message.bullets != null) ...[
                const SizedBox(height: 6),
                ...message.bullets!.map((b) => _buildBulletItem(b, isDark)),
              ],
              if (message.attachmentTitle != null)
                _buildAttachmentCard(message.attachmentTitle!, isDark),
            ],
          ),
        ),
      );
    }
  }

  Widget _buildSuggestionChip(String label) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return ActionChip(
      label: Text(
        label,
        style: TextStyle(
          fontFamily: 'Tajawal',
          fontSize: 11.5,
          fontWeight: FontWeight.bold,
          color: isDark ? Colors.white70 : AppColors.primaryBronze,
        ),
      ),
      backgroundColor: isDark ? const Color(0xFF1D1D1D) : const Color(0xFFFBF9F4),
      side: BorderSide(
        color: (isDark ? Colors.white : const Color(0xFFD9C3AE)).withValues(alpha: 0.15),
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      onPressed: () => _sendMessage(label),
    );
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
      body: Column(
        children: <Widget>[
          // Custom Header
          Padding(
            padding: EdgeInsets.fromLTRB(16, MediaQuery.of(context).padding.top + 16, 16, 8),
            child: Row(
              children: <Widget>[
                Expanded(
                  child: Text(
                    'المساعد القانوني',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: titleColor,
                      fontFamily: 'Tajawal',
                    ),
                  ),
                ),
                InkWell(
                  onTap: () => _showCaseSelector(context),
                  borderRadius: BorderRadius.circular(999),
                  child: StatusChipLite(
                    label: _selectedCase == null
                        ? 'بدون قضية محددة'
                        : 'قضية: ${_selectedCase!.caseNumber}',
                  ),
                ),
              ],
            ),
          ),

          // Chat Messages Scroll Area
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              itemCount: _messages.length + 1 + (_isTyping ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == 0) {
                  return _buildWelcomeBanner(isDark, cardBg, titleColor, mutedText);
                }
                
                final msgIndex = index - 1;
                if (msgIndex < _messages.length) {
                  return _buildChatBubble(_messages[msgIndex], isDark, cardBg);
                }

                // Show typing indicator
                return Align(
                  alignment: Alignment.centerRight,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: cardBg,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: (isDark ? Colors.white : const Color(0xFFD9C3AE)).withValues(alpha: 0.1),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Text(
                          'جاري التفكير والكتابة...',
                          style: TextStyle(
                            fontSize: 12,
                            color: mutedText,
                            fontFamily: 'Tajawal',
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // Quick suggestions chips
          SizedBox(
            height: 48,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: <Widget>[
                _buildSuggestionChip('اقترح دفوعاً لهذه القضية'),
                const SizedBox(width: 8),
                _buildSuggestionChip('لخص هذا الحكم القضائي'),
                const SizedBox(width: 8),
                _buildSuggestionChip('اكتب مسودة رسالة للعميل'),
              ],
            ),
          ),

          // Glassmorphism Bottom Input Bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
                child: Container(
                  decoration: BoxDecoration(
                    color: (isDark ? const Color(0xFF1D1D1D) : Colors.white).withValues(alpha: 0.85),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: (isDark ? Colors.white : const Color(0xFFD9C3AE)).withValues(alpha: 0.15),
                      width: 1.2,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF885200).withValues(alpha: isDark ? 0.01 : 0.03),
                        blurRadius: 16,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  child: Row(
                    children: <Widget>[
                      IconButton(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('إرفاق ملف أو مستند للمحادثة...')),
                          );
                        },
                        icon: const Icon(Icons.attach_file, color: AppColors.primary, size: 22),
                      ),
                      Expanded(
                        child: TextField(
                          controller: _inputController,
                          onSubmitted: _sendMessage,
                          decoration: const InputDecoration(
                            hintText: 'اكتب سؤالك أو طلبك سيادة المستشار...',
                            border: InputBorder.none,
                            enabledBorder: InputBorder.none,
                            focusedBorder: InputBorder.none,
                            contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 10),
                            fillColor: Colors.transparent,
                          ),
                          style: const TextStyle(fontSize: 13, fontFamily: 'Tajawal'),
                        ),
                      ),
                      Container(
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: AppColors.goldGradient,
                        ),
                        child: IconButton(
                          onPressed: () => _sendMessage(_inputController.text),
                          icon: const Icon(Icons.send, color: Colors.white, size: 18),
                        ),
                      ),
                    ],
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
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.gavel, color: AppColors.primary, size: 14),
            const SizedBox(width: 6),
            Text(
              label,
              style: const TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.w800,
                fontSize: 11,
                fontFamily: 'Tajawal',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
