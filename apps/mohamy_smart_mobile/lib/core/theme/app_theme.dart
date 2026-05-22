import 'package:flutter/material.dart';
import 'app_colors.dart';

export 'app_colors.dart';

class AppTheme {
  static ThemeData light() => _theme(
    brightness: Brightness.light,
    canvas: AppColors.lightBg,
    surface: AppColors.lightSurface,
    text: AppColors.lightTitle,
    muted: AppColors.lightText,
    border: AppColors.lightBorder,
  );

  static ThemeData dark() => _theme(
    brightness: Brightness.dark,
    canvas: AppColors.darkBg,
    surface: AppColors.darkSurface,
    text: AppColors.darkTitle,
    muted: AppColors.darkTextHex,
    border: AppColors.darkBorder,
  );

  static ThemeData _theme({
    required Brightness brightness,
    required Color canvas,
    required Color surface,
    required Color text,
    required Color muted,
    required Color border,
  }) {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      brightness: brightness,
      primary: AppColors.primary,
      surface: surface,
      error: AppColors.danger,
    );

    final base = ThemeData(
      useMaterial3: true,
      brightness: brightness,
      fontFamily: 'Tajawal',
      colorScheme: colorScheme,
      scaffoldBackgroundColor: canvas,
      canvasColor: canvas,
    );

    return base.copyWith(
      textTheme: base.textTheme.apply(
        fontFamily: 'Tajawal',
        bodyColor: text,
        displayColor: text,
      ),
      appBarTheme: AppBarTheme(
        centerTitle: false,
        elevation: 0,
        backgroundColor: canvas,
        foregroundColor: text,
        titleTextStyle: TextStyle(
          color: text,
          fontSize: 20,
          fontWeight: FontWeight.w700,
          fontFamily: 'Tajawal',
        ),
      ),
      cardTheme: CardThemeData(
        color: surface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: BorderSide(color: border),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: brightness == Brightness.light
            ? AppColors.warmCream
            : AppColors.darkSurface,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 14,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.4),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 0,
          minimumSize: const Size.fromHeight(48),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            fontFamily: 'Tajawal',
          ),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          minimumSize: const Size.fromHeight(48),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            fontFamily: 'Tajawal',
          ),
        ),
      ),
      chipTheme: base.chipTheme.copyWith(
        backgroundColor: brightness == Brightness.light
            ? AppColors.warmCream
            : AppColors.darkSurface,
        selectedColor: AppColors.primary.withValues(alpha: 0.16),
        side: BorderSide(color: border),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: surface,
        indicatorColor: AppColors.primary.withValues(alpha: 0.16),
        labelTextStyle: WidgetStateProperty.all(
          const TextStyle(
            fontFamily: 'Tajawal',
            fontSize: 12,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      dividerColor: border,
      extensions: <ThemeExtension<dynamic>>[
        MohamyThemeTokens(surface: surface, muted: muted, border: border),
      ],
    );
  }
}

class MohamyThemeTokens extends ThemeExtension<MohamyThemeTokens> {
  const MohamyThemeTokens({
    required this.surface,
    required this.muted,
    required this.border,
  });

  final Color surface;
  final Color muted;
  final Color border;

  @override
  MohamyThemeTokens copyWith({Color? surface, Color? muted, Color? border}) =>
      MohamyThemeTokens(
        surface: surface ?? this.surface,
        muted: muted ?? this.muted,
        border: border ?? this.border,
      );

  @override
  MohamyThemeTokens lerp(ThemeExtension<MohamyThemeTokens>? other, double t) {
    if (other is! MohamyThemeTokens) {
      return this;
    }
    return MohamyThemeTokens(
      surface: Color.lerp(surface, other.surface, t)!,
      muted: Color.lerp(muted, other.muted, t)!,
      border: Color.lerp(border, other.border, t)!,
    );
  }
}

class OffsetStartFloatLocation extends FloatingActionButtonLocation {
  const OffsetStartFloatLocation();

  @override
  Offset getOffset(ScaffoldPrelayoutGeometry scaffoldGeometry) {
    final double fabX = FloatingActionButtonLocation.startFloat.getOffset(scaffoldGeometry).dx;
    final double fabY = FloatingActionButtonLocation.startFloat.getOffset(scaffoldGeometry).dy - 90.0;
    return Offset(fabX, fabY);
  }
}

