import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import '../features/auth/auth_screens.dart';
import '../features/auth/splash_screen.dart';
import '../features/shell/app_shell.dart';
import '../core/theme/app_theme.dart';
import 'app_state.dart';

class MohamyMobileApp extends StatefulWidget {
  const MohamyMobileApp({super.key, this.appState});

  final AppState? appState;

  @override
  State<MohamyMobileApp> createState() => _MohamyMobileAppState();
}

class _MohamyMobileAppState extends State<MohamyMobileApp> {
  late final AppState _appState = widget.appState ?? AppState();
  bool _showSplash = true;

  @override
  void initState() {
    super.initState();
    Future<void>.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _showSplash = false;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _appState,
      builder: (context, _) {
        return MaterialApp(
          title: 'محامي سمارت',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.light(),
          darkTheme: AppTheme.dark(),
          themeMode: _appState.isDarkMode ? ThemeMode.dark : ThemeMode.light,
          locale: const Locale('ar'),
          supportedLocales: const <Locale>[Locale('ar'), Locale('en')],
          localizationsDelegates: const <LocalizationsDelegate<dynamic>>[
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          builder: (context, child) {
            return Directionality(
              textDirection: TextDirection.rtl,
              child: child ?? const SizedBox.shrink(),
            );
          },
          home: _buildHome(),
        );
      },
    );
  }

  Widget _buildHome() {
    if (_showSplash) {
      return const SplashScreen();
    }
    if (!_appState.hasCompletedOnboarding) {
      return OnboardingScreen(appState: _appState);
    }
    if (!_appState.isAuthenticated) {
      return LoginScreen(appState: _appState);
    }
    return AppShell(appState: _appState);
  }
}

