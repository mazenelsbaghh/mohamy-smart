import 'dart:ui';
import 'package:flutter/material.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    // Background and text color variables matching the mockups
    final Color backgroundColor = isDark ? const Color(0xFF0F0D08) : const Color(0xFFF0EEE7);
    final Color onBackground = isDark ? const Color(0xFFF7F2E8) : const Color(0xFF1B1C18);
    
    return Scaffold(
      backgroundColor: backgroundColor,
      body: Stack(
        children: <Widget>[
          // Top-right decorative blurred glow
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFFEF950A).withValues(alpha: isDark ? 0.08 : 0.05),
              ),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 80, sigmaY: 80),
                child: const SizedBox.shrink(),
              ),
            ),
          ),
          // Bottom-left decorative blurred glow
          Positioned(
            bottom: -120,
            left: -120,
            child: Container(
              width: 320,
              height: 320,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFFEF950A).withValues(alpha: isDark ? 0.12 : 0.10),
              ),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 100, sigmaY: 100),
                child: const SizedBox.shrink(),
              ),
            ),
          ),
          // Main Content
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                // Professional Legal Logo Container
                Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(32),
                    boxShadow: <BoxShadow>[
                      BoxShadow(
                        color: const Color(0xFF885200).withValues(alpha: 0.15),
                        blurRadius: 40,
                        offset: const Offset(0, 15),
                      ),
                    ],
                    gradient: const LinearGradient(
                      colors: <Color>[
                        Color(0xFF885200),
                        Color(0xFFEF950A),
                      ],
                      begin: Alignment.topRight,
                      end: Alignment.bottomLeft,
                    ),
                  ),
                  child: Center(
                    child: Container(
                      width: 96,
                      height: 96,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: Colors.white.withValues(alpha: 0.2),
                        ),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: BackdropFilter(
                          filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
                          child: const Center(
                            child: Icon(
                              Icons.gavel_rounded,
                              size: 60,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                // Brand Name
                Text(
                  'محامي سمارت',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontFamily: 'Tajawal',
                    fontWeight: FontWeight.bold,
                    fontSize: 24,
                    color: onBackground,
                  ),
                ),
                const SizedBox(height: 8),
                // Subtitle
                Text(
                  'ذكاء اصطناعي لممارسة قانونية أذكى',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontFamily: 'Tajawal',
                    fontSize: 13,
                    color: onBackground.withValues(alpha: 0.65),
                  ),
                ),
              ],
            ),
          ),
          // Version & Loading Footer
          Positioned(
            bottom: 48,
            left: 0,
            right: 0,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                // Minimalist Loading Indicator
                SizedBox(
                  width: 48,
                  height: 2,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(2),
                    child: LinearProgressIndicator(
                      backgroundColor: isDark 
                          ? const Color(0xFF867462).withValues(alpha: 0.2)
                          : const Color(0xFF867462).withValues(alpha: 0.15),
                      valueColor: const AlwaysStoppedAnimation<Color>(
                        Color(0xFFEF950A),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                // Version Label
                Text(
                  'الإصدار 1.0.0',
                  style: theme.textTheme.labelSmall?.copyWith(
                    fontFamily: 'Tajawal',
                    fontSize: 10,
                    letterSpacing: 1.5,
                    color: onBackground.withValues(alpha: 0.25),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
