import 'dart:ui';
import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../core/theme/app_theme.dart';

// Premium Linear Gradients matching the design system
const LinearGradient goldGradient = LinearGradient(
  colors: <Color>[
    Color(0xFFFFAD26),
    Color(0xFFEF950A),
    Color(0xFFC35900),
  ],
  begin: Alignment.topLeft,
  end: Alignment.bottomRight,
);

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({required this.appState, super.key});

  final AppState appState;

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    // Background and text color variables matching the mockups
    final Color backgroundColor = isDark ? const Color(0xFF0F0D08) : const Color(0xFFF0EEE7);
    final Color onBackground = isDark ? const Color(0xFFF7F2E8) : const Color(0xFF1B1C18);
    final Color onSurfaceVariant = isDark ? const Color(0xFFA6A6A6) : const Color(0xFF534434);
    final Color dossierColor = isDark ? const Color(0xFF1D1D1D) : const Color(0xFFFFFFFF);

    return Scaffold(
      backgroundColor: backgroundColor,
      body: SafeArea(
        child: Stack(
          children: <Widget>[
            // Top-right decorative blurred glow
            Positioned(
              top: -80,
              right: -80,
              child: Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFFEF950A).withValues(alpha: isDark ? 0.05 : 0.03),
                ),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 80, sigmaY: 80),
                  child: const SizedBox.shrink(),
                ),
              ),
            ),
            // Bottom-left decorative blurred glow
            Positioned(
              bottom: 100,
              left: -100,
              child: Container(
                width: 280,
                height: 280,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFFEF950A).withValues(alpha: isDark ? 0.08 : 0.05),
                ),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 100, sigmaY: 100),
                  child: const SizedBox.shrink(),
                ),
              ),
            ),
            // Main layout column
            Column(
              children: <Widget>[
                // Header navigation bar
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: <Widget>[
                      // Back/Previous slide button (visible on slide 2 & 3)
                      _currentPage > 0
                          ? IconButton(
                              onPressed: () {
                                _pageController.previousPage(
                                  duration: const Duration(milliseconds: 300),
                                  curve: Curves.easeInOut,
                                );
                              },
                              icon: const Icon(
                                Icons.arrow_forward, // RTL Back is arrow pointing right
                                color: Color(0xFFEF950A),
                              ),
                            )
                          : const SizedBox(width: 48, height: 48),
                      // Skip button (always complete onboarding)
                      TextButton(
                        key: const Key('skip_onboarding'),
                        onPressed: widget.appState.completeOnboarding,
                        child: Text(
                          'تخطي',
                          style: TextStyle(
                            fontFamily: 'Tajawal',
                            color: onBackground.withValues(alpha: 0.5),
                            fontWeight: FontWeight.w500,
                            fontSize: 16,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                
                // PageView section for illustrations
                Expanded(
                  child: PageView(
                    controller: _pageController,
                    onPageChanged: (int index) {
                      setState(() {
                        _currentPage = index;
                      });
                    },
                    children: <Widget>[
                      _buildSlide1Illustration(isDark),
                      _buildSlide2Illustration(isDark),
                      _buildSlide3Illustration(isDark),
                    ],
                  ),
                ),
                
                // Bottom Content Card (The "Dossier")
                Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: dossierColor,
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(40),
                      topRight: Radius.circular(40),
                    ),
                    boxShadow: <BoxShadow>[
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.03),
                        blurRadius: 24,
                        offset: const Offset(0, -8),
                      ),
                    ],
                    border: Border(
                      top: BorderSide(
                        color: const Color(0xFFD9C3AE).withValues(alpha: 0.1),
                      ),
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(28, 40, 28, 36),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: <Widget>[
                        // Page Titles & Descriptions
                        AnimatedSwitcher(
                          duration: const Duration(milliseconds: 200),
                          child: _buildTextContent(
                            _currentPage,
                            onBackground,
                            onSurfaceVariant,
                          ),
                        ),
                        const SizedBox(height: 28),
                        
                        // Indicators & Buttons
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: <Widget>[
                            // 3 Dots Indicator
                            Row(
                              children: List<Widget>.generate(3, (int index) {
                                final isActive = index == _currentPage;
                                return AnimatedContainer(
                                  duration: const Duration(milliseconds: 300),
                                  margin: const EdgeInsets.symmetric(horizontal: 3),
                                  height: 6,
                                  width: isActive ? 32 : 6,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(3),
                                    color: isActive
                                        ? const Color(0xFFEF950A)
                                        : (isDark ? const Color(0xFF333333) : const Color(0xFFD9D9D9)),
                                  ),
                                );
                              }),
                            ),
                            
                            // Action Button
                            SizedBox(
                              width: 130,
                              height: 56,
                              child: Container(
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(28),
                                  gradient: goldGradient,
                                  boxShadow: <BoxShadow>[
                                    BoxShadow(
                                      color: const Color(0xFF885200).withValues(alpha: 0.2),
                                      blurRadius: 16,
                                      offset: const Offset(0, 8),
                                    ),
                                  ],
                                ),
                                child: ElevatedButton(
                                  key: _currentPage == 2
                                      ? const Key('start_onboarding')
                                      : null,
                                  onPressed: () {
                                    if (_currentPage < 2) {
                                      _pageController.nextPage(
                                        duration: const Duration(milliseconds: 300),
                                        curve: Curves.easeInOut,
                                      );
                                    } else {
                                      widget.appState.completeOnboarding();
                                    }
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.transparent,
                                    shadowColor: Colors.transparent,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(28),
                                    ),
                                    padding: EdgeInsets.zero,
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: <Widget>[
                                      Text(
                                        _currentPage == 2 ? 'ابدأ الآن' : 'التالي',
                                        style: const TextStyle(
                                          fontFamily: 'Tajawal',
                                          fontWeight: FontWeight.bold,
                                          fontSize: 16,
                                          color: Colors.white,
                                        ),
                                      ),
                                      const SizedBox(width: 6),
                                      Icon(
                                        _currentPage == 2 ? Icons.arrow_back : Icons.chevron_left, // Left chevron/arrow is forward in RTL
                                        color: Colors.white,
                                        size: 18,
                                      ),
                                    ],
                                  ),
                                ),
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
          ],
        ),
      ),
    );
  }

  // Text contents mapped by page index
  Widget _buildTextContent(int index, Color titleColor, Color bodyColor) {
    String title = '';
    String description = '';

    if (index == 0) {
      title = 'أدر قضاياك بذكاء';
      description = 'تابع جميع قضاياك وجلساتك ومستنداتك من مكان واحد بكل سهولة واحترافية.';
    } else if (index == 1) {
      title = 'ذكاء اصطناعي قانوني';
      description = 'مذكرات دفاع وصحف دعوى وتحليل أحكام — في دقائق معدودة.';
    } else {
      title = 'جاهز لممارسة أذكى؟';
      description = 'سجّل الآن واستكشف أدوات تسرّع عملك القانوني وتوفر وقتك.';
    }

    return Column(
      key: ValueKey<int>(index),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(
          title,
          style: TextStyle(
            fontFamily: 'Tajawal',
            fontWeight: FontWeight.bold,
            fontSize: 28,
            color: titleColor,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          description,
          style: TextStyle(
            fontFamily: 'Tajawal',
            fontSize: 16,
            height: 1.6,
            color: bodyColor,
          ),
        ),
      ],
    );
  }

  // Slide 1 Visual Illustration
  Widget _buildSlide1Illustration(bool isDark) {
    final Color cardBackground = isDark ? const Color(0xFF2C2C26) : Colors.white;
    return Center(
      child: Container(
        width: 280,
        height: 280,
        margin: const EdgeInsets.only(bottom: 24),
        child: Stack(
          alignment: Alignment.center,
          children: <Widget>[
            // Background Layer (Glassmorphism shadow layout)
            Transform.rotate(
              angle: 0.05,
              child: Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF33332A) : const Color(0xFFE1E1CF).withValues(alpha: 0.4),
                  borderRadius: BorderRadius.circular(40),
                ),
              ),
            ),
            // Main card
            Container(
              width: 240,
              height: 240,
              decoration: BoxDecoration(
                color: cardBackground,
                borderRadius: BorderRadius.circular(40),
                border: Border.all(
                  color: const Color(0xFFD9C3AE).withValues(alpha: isDark ? 0.15 : 0.2),
                ),
                boxShadow: <BoxShadow>[
                  BoxShadow(
                    color: const Color(0xFF885200).withValues(alpha: 0.06),
                    blurRadius: 32,
                    offset: const Offset(0, 12),
                  ),
                ],
              ),
              child: const Center(
                child: Icon(
                  Icons.balance_rounded,
                  size: 110,
                  color: Color(0xFF885200),
                ),
              ),
            ),
            // Floating AI Sparkle Badge top-right
            Positioned(
              top: 10,
              right: 10,
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Color(0xFFEF950A),
                  boxShadow: <BoxShadow>[
                    BoxShadow(
                      color: Colors.black12,
                      blurRadius: 8,
                      offset: Offset(0, 4),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.auto_awesome,
                  color: Colors.white,
                  size: 20,
                ),
              ),
            ),
            // Floating Blue Badge bottom-left
            Positioned(
              bottom: 20,
              left: 10,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFF1FB3FF).withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: const Color(0xFF1FB3FF).withValues(alpha: 0.3),
                  ),
                ),
                child: const Icon(
                  Icons.data_object,
                  color: Color(0xFF006493),
                  size: 20,
                ),
              ),
            ),
            // Floating Terminal Badge middle-left
            Positioned(
              top: 110,
              left: -5,
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1D1D1D) : const Color(0xFFF0EEE7),
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: const Color(0xFFD9C3AE),
                  ),
                ),
                child: const Icon(
                  Icons.terminal,
                  color: Color(0xFF5F5F52),
                  size: 14,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Slide 2 Visual Illustration
  Widget _buildSlide2Illustration(bool isDark) {
    final Color cardBackground = isDark ? const Color(0xFF2C2C26) : Colors.white;
    return Center(
      child: Container(
        width: 280,
        height: 280,
        margin: const EdgeInsets.only(bottom: 24),
        child: Stack(
          alignment: Alignment.center,
          children: <Widget>[
            // Blurred shadow layer
            Container(
              width: 220,
              height: 250,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFFE1E1CF).withValues(alpha: isDark ? 0.05 : 0.2),
              ),
            ),
            // Primary legal document card (rotated)
            Transform.rotate(
              angle: 0.05,
              child: Container(
                width: 190,
                height: 240,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: cardBackground,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: const Color(0xFFD9C3AE).withValues(alpha: 0.2),
                  ),
                  boxShadow: <BoxShadow>[
                    BoxShadow(
                      color: const Color(0xFF885200).withValues(alpha: 0.06),
                      blurRadius: 24,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    // Document headers
                    Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF3E3E3E) : const Color(0xFFE4E2DC),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Line list representation
                    ...List<Widget>.generate(4, (index) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: Container(
                          width: (index == 1) ? 120 : (index == 3 ? 100 : 140),
                          height: 6,
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF333333) : const Color(0xFFF0EEE7),
                            borderRadius: BorderRadius.circular(3),
                          ),
                        ),
                      );
                    }),
                    const Spacer(),
                    // Central Lightning Core icon
                    Center(
                      child: Container(
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: const Color(0xFFEF950A).withValues(alpha: 0.1),
                        ),
                        child: const Icon(
                          Icons.auto_awesome,
                          color: Color(0xFFEF950A),
                          size: 32,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],
                ),
              ),
            ),
            // Floating Sparkle/Bolt chip top-right
            Positioned(
              top: 40,
              right: 15,
              child: Transform.rotate(
                angle: -0.1,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    color: cardBackground,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: const Color(0xFFEF950A).withValues(alpha: 0.15),
                    ),
                    boxShadow: <BoxShadow>[
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 10,
                      ),
                    ],
                  ),
                  child: Row(
                    children: <Widget>[
                      const Icon(Icons.flash_on, color: Color(0xFFEF950A), size: 16),
                      const SizedBox(width: 6),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Container(width: 40, height: 4, color: const Color(0xFFEF950A).withValues(alpha: 0.2)),
                          const SizedBox(height: 4),
                          Container(width: 25, height: 4, color: const Color(0xFFEF950A).withValues(alpha: 0.1)),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
            // Floating Analytics chip bottom-left
            Positioned(
              bottom: 40,
              left: 15,
              child: Transform.rotate(
                angle: 0.2,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    color: cardBackground,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: const Color(0xFF006493).withValues(alpha: 0.15),
                    ),
                    boxShadow: <BoxShadow>[
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 10,
                      ),
                    ],
                  ),
                  child: Row(
                    children: <Widget>[
                      const Icon(Icons.analytics, color: Color(0xFF006493), size: 16),
                      const SizedBox(width: 6),
                      Container(
                        width: 32,
                        height: 4,
                        color: const Color(0xFF006493).withValues(alpha: 0.2),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Slide 3 Visual Illustration (with Google CDN network image)
  Widget _buildSlide3Illustration(bool isDark) {
    final Color cardBackground = isDark ? const Color(0xFF2C2C26) : Colors.white;
    return Center(
      child: Container(
        width: 280,
        height: 280,
        margin: const EdgeInsets.only(bottom: 24),
        child: Stack(
          alignment: Alignment.center,
          children: <Widget>[
            // Base Card Container
            Container(
              width: 240,
              height: 240,
              decoration: BoxDecoration(
                color: cardBackground,
                borderRadius: BorderRadius.circular(40),
                boxShadow: <BoxShadow>[
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 32,
                    offset: const Offset(0, 12),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(40),
                child: Image.network(
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuBklkrV23TKzU-_sFl56dbRKSOaVkPoLiM26CRzL49zKNXHDU3q-5yjJKLuJdzL-VUB0-9La1iXg7bH5rb8GxPJLFrRsKBtPlzANhy8zHDBkARh5kKnMUinLI6lCcwduLs83zaI-e_858gu4c9gFJ6H0MSrvGwKWTGm3oEtgqKDcPad7AyUB8izFapI-B22TkZkzZgX8PZPttRIoqlJtlOVL7g4v9WfwO2nsPWNzsd19Y049cOTxa83KoyECn5wOvQvChuNMFoRvS0',
                  fit: BoxFit.contain,
                  loadingBuilder: (context, child, progress) {
                    if (progress == null) return child;
                    return const Center(
                      child: CircularProgressIndicator(
                        color: Color(0xFFEF950A),
                      ),
                    );
                  },
                  errorBuilder: (context, error, stackTrace) {
                    // Fallback to custom widget illustration if offline
                    return const Center(
                      child: Icon(
                        Icons.workspace_premium_rounded,
                        size: 96,
                        color: Color(0xFFEF950A),
                      ),
                    );
                  },
                ),
              ),
            ),
            // Floating Glassmorphism Element top-left
            Positioned(
              top: 15,
              right: 15,
              child: Transform.rotate(
                angle: -0.1,
                child: Container(
                  width: 70,
                  height: 70,
                  decoration: BoxDecoration(
                    color: const Color(0xFFEF950A).withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.2),
                    ),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: BackdropFilter(
                      filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
                      child: const SizedBox.shrink(),
                    ),
                  ),
                ),
              ),
            ),
            // Floating Glassmorphism Element bottom-right
            Positioned(
              bottom: 30,
              left: 10,
              child: Transform.rotate(
                angle: 0.2,
                child: Container(
                  width: 96,
                  height: 48,
                  decoration: BoxDecoration(
                    color: const Color(0xFF006493).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.1),
                    ),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(24),
                    child: BackdropFilter(
                      filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
                      child: const SizedBox.shrink(),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class LoginScreen extends StatefulWidget {
  const LoginScreen({required this.appState, super.key});

  final AppState appState;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  
  // Accept standard demo logins out-of-the-box (prepopulated values)
  final _phoneController = TextEditingController(text: '0501234567');
  final _passwordController = TextEditingController(text: 'demo1234');
  bool _obscurePassword = true;
  bool _showError = false;
  bool _isLoading = false;

  @override
  void dispose() {
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    final Color topBackground = isDark ? const Color(0xFF1D1D1D) : const Color(0xFFF0EEE7);
    final Color bottomCardBackground = isDark ? const Color(0xFF0A0A0A) : const Color(0xFFFFFFFF);
    final Color textColor = isDark ? const Color(0xFFF7F2E8) : const Color(0xFF1B1B1B);
    final Color textMutedColor = isDark ? const Color(0xFFA6A6A6) : const Color(0xFF534434);
    
    final Color inputFillColor = isDark ? const Color(0xFF1D1D1D) : const Color(0xFFF6F4EC);
    
    return Scaffold(
      backgroundColor: bottomCardBackground,
      body: SafeArea(
        top: false, // Allows full header flow
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              // Top 30% Area Header
              Container(
                height: 265,
                color: topBackground,
                child: Stack(
                  alignment: Alignment.center,
                  children: <Widget>[
                    // Glow effect top-right
                    Positioned(
                      top: -50,
                      right: -50,
                      child: Container(
                        width: 200,
                        height: 200,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: const Color(0xFFEF950A).withValues(alpha: isDark ? 0.08 : 0.05),
                        ),
                      ),
                    ),
                    // Glow effect bottom-left
                    Positioned(
                      bottom: -30,
                      left: -30,
                      child: Container(
                        width: 150,
                        height: 150,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: const Color(0xFFEF950A).withValues(alpha: isDark ? 0.12 : 0.10),
                        ),
                      ),
                    ),
                    // Header Content
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: <Widget>[
                          const SizedBox(height: 24),
                          // Brand Gavel Logo
                          Container(
                            width: 80,
                            height: 80,
                            decoration: BoxDecoration(
                              color: isDark ? const Color(0xFF2C2C26) : Colors.white,
                              borderRadius: BorderRadius.circular(24),
                              boxShadow: <BoxShadow>[
                                BoxShadow(
                                  color: const Color(0xFF885200).withValues(alpha: 0.06),
                                  blurRadius: 32,
                                  offset: const Offset(0, 12),
                                ),
                              ],
                            ),
                            child: const Center(
                              child: Icon(
                                Icons.gavel_rounded,
                                color: Color(0xFFEF950A),
                                size: 48,
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          // Welcome texts
                          Text(
                            'مرحبًا بعودتك',
                            style: TextStyle(
                              fontFamily: 'Tajawal',
                              fontWeight: FontWeight.bold,
                              fontSize: 24,
                              color: textColor,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'سجّل دخولك لمتابعة قضاياك',
                            style: TextStyle(
                              fontFamily: 'Tajawal',
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                              color: textMutedColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              
              // Bottom 70% Card
              Transform.translate(
                offset: const Offset(0, -28),
                child: Container(
                  decoration: BoxDecoration(
                    color: bottomCardBackground,
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(32),
                      topRight: Radius.circular(32),
                    ),
                    boxShadow: <BoxShadow>[
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.03),
                        blurRadius: 32,
                        offset: const Offset(0, -12),
                      ),
                    ],
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 32),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: <Widget>[
                        // Phone number field
                        Text(
                          'رقم التلفون',
                          style: TextStyle(
                            fontFamily: 'Tajawal',
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: textMutedColor,
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextFormField(
                          key: const Key('login_identifier'),
                          controller: _phoneController,
                          keyboardType: TextInputType.phone,
                          style: TextStyle(fontFamily: 'Tajawal', color: textColor),
                          decoration: InputDecoration(
                            hintText: 'تلفون',
                            hintStyle: TextStyle(
                              color: textMutedColor.withValues(alpha: 0.6),
                            ),
                            filled: true,
                            fillColor: inputFillColor,
                            prefixIcon: const Icon(
                              Icons.smartphone_rounded,
                              color: Color(0xFF867462),
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 18,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide.none,
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide.none,
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: const BorderSide(
                                color: Color(0xFFEF950A),
                                width: 1.4,
                              ),
                            ),
                          ),
                          validator: _required,
                        ),
                        const SizedBox(height: 20),
                        
                        // Password field
                        Text(
                          'كلمة المرور',
                          style: TextStyle(
                            fontFamily: 'Tajawal',
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: textMutedColor,
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextFormField(
                          key: const Key('login_password'),
                          controller: _passwordController,
                          obscureText: _obscurePassword,
                          style: TextStyle(fontFamily: 'Tajawal', color: textColor),
                          decoration: InputDecoration(
                            hintText: '••••••••',
                            hintStyle: TextStyle(
                              color: textMutedColor.withValues(alpha: 0.6),
                            ),
                            filled: true,
                            fillColor: inputFillColor,
                            prefixIcon: const Icon(
                              Icons.lock_outline_rounded,
                              color: Color(0xFF867462),
                            ),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscurePassword
                                    ? Icons.visibility_rounded
                                    : Icons.visibility_off_rounded,
                                color: const Color(0xFF867462),
                              ),
                              onPressed: () {
                                setState(() {
                                  _obscurePassword = !_obscurePassword;
                                });
                              },
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 18,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide.none,
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide.none,
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: const BorderSide(
                                color: Color(0xFFEF950A),
                                width: 1.4,
                              ),
                            ),
                          ),
                          validator: _required,
                        ),
                        
                        // Forgot Password Link
                        Align(
                          alignment: AlignmentDirectional.centerStart,
                          child: TextButton(
                            onPressed: () => Navigator.of(context).push(
                              MaterialPageRoute<void>(
                                builder: (_) => const ForgotPasswordScreen(),
                              ),
                            ),
                            style: TextButton.styleFrom(
                              padding: EdgeInsets.zero,
                              minimumSize: Size.zero,
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            ),
                            child: const Text(
                              'نسيت كلمة المرور؟',
                              style: TextStyle(
                                fontFamily: 'Tajawal',
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFFEF950A),
                              ),
                            ),
                          ),
                        ),
                        
                        // Error message
                        if (_showError) ...<Widget>[
                          const SizedBox(height: 8),
                          const Text(
                            'بيانات الدخول غير صحيحة',
                            style: TextStyle(
                              fontFamily: 'Tajawal',
                              color: AppColors.danger,
                              fontSize: 14,
                            ),
                          ),
                        ],
                        const SizedBox(height: 24),
                        
                        // Submit Button
                        Container(
                          height: 56,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(28),
                            gradient: goldGradient,
                            boxShadow: <BoxShadow>[
                              BoxShadow(
                                color: const Color(0xFF885200).withValues(alpha: 0.15),
                                blurRadius: 16,
                                offset: const Offset(0, 8),
                              ),
                            ],
                          ),
                          child: ElevatedButton(
                            key: const Key('login_button'),
                            onPressed: _isLoading ? null : _submit,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              shadowColor: Colors.transparent,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(28),
                              ),
                            ),
                            child: _isLoading
                                ? const SizedBox(
                                    width: 24,
                                    height: 24,
                                    child: CircularProgressIndicator(
                                      color: Colors.white,
                                      strokeWidth: 2.5,
                                    ),
                                  )
                                : const Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: <Widget>[
                                      Text(
                                        'تسجيل الدخول',
                                        style: TextStyle(
                                          fontFamily: 'Tajawal',
                                          fontWeight: FontWeight.bold,
                                          fontSize: 18,
                                          color: Colors.white,
                                        ),
                                      ),
                                      SizedBox(width: 8),
                                      Icon(
                                        Icons.arrow_back_rounded, // Left arrow pointing left for successful forward flow
                                        color: Colors.white,
                                        size: 20,
                                      ),
                                    ],
                                  ),
                          ),
                        ),
                        const SizedBox(height: 20),
                        
                        // Divider
                        Row(
                          children: <Widget>[
                            Expanded(
                              child: Divider(
                                color: const Color(0xFFD9C3AE).withValues(alpha: 0.3),
                                thickness: 1,
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: Text(
                                'أو',
                                style: TextStyle(
                                  fontFamily: 'Tajawal',
                                  color: const Color(0xFF867462),
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                            Expanded(
                              child: Divider(
                                color: const Color(0xFFD9C3AE).withValues(alpha: 0.3),
                                thickness: 1,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),
                        
                        // Social logins
                        Row(
                          children: <Widget>[
                            // Google Login
                            Expanded(
                              child: OutlinedButton(
                                onPressed: () {
                                  // Simulated Social login
                                  widget.appState.login('google', 'social');
                                },
                                style: OutlinedButton.styleFrom(
                                  minimumSize: const Size.fromHeight(56),
                                  side: BorderSide(
                                    color: const Color(0xFFD9C3AE).withValues(alpha: 0.3),
                                    width: 1.5,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: <Widget>[
                                    Image.network(
                                      'https://lh3.googleusercontent.com/aida-public/AB6AXuBlfMqcr_y1Wssdw8SrSNWa_NFywjYh4OprsUsUxUNqltnq8hxFhIQXjEfQG3YMR4JdC_ACIayS7JOf5S6ysPFxb_h_JesATxW4p8mk-m2zHyogkQmtStFxiAXOF5mw6JZd50O8i-kQ7jjnlUbDkbH56lREKEYNuX3nd-IKbYQsG-iNAr8VgdKszBeL3TlrsArFJp3-LYCpu9ayh9b5twzLXu2MNwTwqAb8J4EIvIN12RBO7nMzQsdpaD22qMFad2h7lHRA5sN9kM0',
                                      width: 22,
                                      height: 22,
                                      errorBuilder: (context, error, stackTrace) => const Icon(
                                        Icons.g_mobiledata_rounded,
                                        size: 26,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      'Google',
                                      style: TextStyle(
                                        fontFamily: 'Tajawal',
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14,
                                        color: textColor,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            // Apple Login
                            Expanded(
                              child: OutlinedButton(
                                onPressed: () {
                                  // Simulated Social login
                                  widget.appState.login('apple', 'social');
                                },
                                style: OutlinedButton.styleFrom(
                                  minimumSize: const Size.fromHeight(56),
                                  side: BorderSide(
                                    color: const Color(0xFFD9C3AE).withValues(alpha: 0.3),
                                    width: 1.5,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: <Widget>[
                                    Icon(
                                      Icons.apple,
                                      size: 24,
                                      color: textColor,
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      'Apple',
                                      style: TextStyle(
                                        fontFamily: 'Tajawal',
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14,
                                        color: textColor,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 32),
                        
                        // Register Link
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: <Widget>[
                            Text(
                              'ليس لديك حساب؟',
                              style: TextStyle(
                                fontFamily: 'Tajawal',
                                color: textMutedColor,
                                fontSize: 14,
                              ),
                            ),
                            TextButton(
                              onPressed: () => Navigator.of(context).push(
                                MaterialPageRoute<void>(
                                  builder: (_) => const SignUpScreen(),
                                ),
                              ),
                              style: TextButton.styleFrom(
                                padding: const EdgeInsets.symmetric(horizontal: 4),
                                minimumSize: Size.zero,
                                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                              ),
                              child: const Text(
                                'إنشاء حساب',
                                style: TextStyle(
                                  fontFamily: 'Tajawal',
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFFEF950A),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
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

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    setState(() {
      _showError = false;
      _isLoading = true;
    });

    try {
      final accepted = await widget.appState.login(_phoneController.text, _passwordController.text);
      if (mounted) {
        setState(() {
          _showError = !accepted;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _showError = true;
          _isLoading = false;
        });
      }
    }
  }
}

class SignUpScreen extends StatelessWidget {
  const SignUpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return _AuthInfoScreen(
      title: 'إنشاء حساب محام',
      message: 'أدخل بيانات الحساب الأساسية ورقم الترخيص لإعداد ملفك.',
      primaryLabel: 'إنشاء الحساب',
      onPrimary: () => Navigator.of(
        context,
      ).push(MaterialPageRoute<void>(builder: (_) => const OtpScreen())),
    );
  }
}

class ForgotPasswordScreen extends StatelessWidget {
  const ForgotPasswordScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return _AuthInfoScreen(
      title: 'استعادة كلمة المرور',
      message: 'أدخل رقم الجوال أو البريد الإلكتروني لإرسال رمز التحقق.',
      primaryLabel: 'إرسال رمز التحقق',
      onPrimary: () => Navigator.of(
        context,
      ).push(MaterialPageRoute<void>(builder: (_) => const OtpScreen())),
    );
  }
}

class OtpScreen extends StatelessWidget {
  const OtpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return _AuthInfoScreen(
      title: 'تأكيد رقم الجوال',
      message: 'أدخل رمز التحقق المرسل إلى جوالك لإكمال الإجراء.',
      primaryLabel: 'تأكيد',
      onPrimary: () => Navigator.of(context).popUntil((route) => route.isFirst),
    );
  }
}

class _AuthInfoScreen extends StatelessWidget {
  const _AuthInfoScreen({
    required this.title,
    required this.message,
    required this.primaryLabel,
    required this.onPrimary,
  });

  final String title;
  final String message;
  final String primaryLabel;
  final VoidCallback onPrimary;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    final Color backgroundColor = isDark ? const Color(0xFF0F0D08) : const Color(0xFFF0EEE7);
    final Color onBackground = isDark ? const Color(0xFFF7F2E8) : const Color(0xFF1B1C18);
    final Color cardBackground = isDark ? const Color(0xFF1D1D1D) : const Color(0xFFFFFFFF);
    final Color textMutedColor = isDark ? const Color(0xFFA6A6A6) : const Color(0xFF534434);
    final Color inputFillColor = isDark ? const Color(0xFF1D1D1D) : const Color(0xFFF6F4EC);

    return Scaffold(
      backgroundColor: cardBackground,
      appBar: AppBar(
        backgroundColor: backgroundColor,
        iconTheme: IconThemeData(color: onBackground),
        elevation: 0,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              Text(
                title,
                style: TextStyle(
                  fontFamily: 'Tajawal',
                  fontWeight: FontWeight.bold,
                  fontSize: 24,
                  color: onBackground,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                message,
                style: TextStyle(
                  fontFamily: 'Tajawal',
                  fontSize: 16,
                  color: textMutedColor,
                ),
              ),
              const SizedBox(height: 28),
              TextFormField(
                style: TextStyle(fontFamily: 'Tajawal', color: onBackground),
                decoration: InputDecoration(
                  labelText: 'رقم الجوال أو البريد الإلكتروني',
                  labelStyle: TextStyle(fontFamily: 'Tajawal', color: textMutedColor),
                  filled: true,
                  fillColor: inputFillColor,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide.none,
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide.none,
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(
                      color: Color(0xFFEF950A),
                      width: 1.4,
                    ),
                  ),
                ),
              ),
              const Spacer(),
              Container(
                height: 56,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(28),
                  gradient: goldGradient,
                  boxShadow: <BoxShadow>[
                    BoxShadow(
                      color: const Color(0xFF885200).withValues(alpha: 0.15),
                      blurRadius: 16,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: ElevatedButton(
                  onPressed: onPrimary,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(28),
                    ),
                  ),
                  child: Text(
                    primaryLabel,
                    style: const TextStyle(
                      fontFamily: 'Tajawal',
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
