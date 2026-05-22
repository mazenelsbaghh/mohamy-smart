import 'package:flutter/material.dart';

class AppColors {
  // Brand colors & gradients (shared across light and dark)
  static const Color primary = Color(0xFFEF950A); // --main-color
  static const Color primaryBronze = Color(
    0xFF885200,
  ); // bronze highlight color for light mode

  static const LinearGradient goldGradient = LinearGradient(
    colors: [Color(0xFF885200), Color(0xFFEF950A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const List<Color> mainGradientColors = [
    Color(0xFFFFAD26), // 0%
    Color(0xFFEF950A), // 50%
    Color(0xFFC35900), // 100%
  ];

  static const List<Color> mainGradientHoverColors = [
    Color(0xFFFFBD59), // 0%
    Color(0xFFF3A325), // 50%
    Color(0xFFD96300), // 100%
  ];

  static const LinearGradient mainGradient = LinearGradient(
    colors: mainGradientColors,
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient mainGradientHover = LinearGradient(
    colors: mainGradientHoverColors,
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Common colors
  static const Color success = Color(0xFF34BF49); // --success-color
  static const Color danger = Color(0xFFCA0000); // --danger-color
  static const Color blue = Color(0xFF1D47FF); // --blue-color

  // Light Mode Colors (defined in :root)
  static const Color lightSecond = Color(0xFFFBFAE8); // --second-color
  static const Color lightBg = Color(0xFFF0EEE7); // --bg-color
  static const Color lightTitle = Color(0xFF1B1B1B); // --title-color
  static const Color lightText = Color(0xA6141414); // --text-color (#141414a6)
  static const Color lightMuted = Color(0xFF6F6553); // --muted-color
  static const Color lightOpacity = Color(0x3FA7A7A7); // --opacity-color
  static const Color lightWhite = Color(0xFFFFFFFF); // --white-color
  static const Color lightSurface = Color(0xFFFFFDF8); // --surface-color
  static const Color lightSurfaceMuted = Color(0xFFF7F3EA); // --surface-muted
  static const Color lightSurfaceSoft = Color(0xFFF4EFE4); // --surface-soft
  static const Color lightBorder = Color(
    0x1A1B1B1B,
  ); // --border-color (rgba(27, 27, 27, 0.1))
  static const Color lightBorderStrong = Color(
    0x291B1B1B,
  ); // --border-strong (rgba(27, 27, 27, 0.16))
  static const Color lightAccentSoft = Color(
    0x1FEF950A,
  ); // --accent-soft (rgba(239, 149, 10, 0.12))
  static const Color lightAccentSoftStrong = Color(
    0x2EEF950A,
  ); // --accent-soft-strong (rgba(239, 149, 10, 0.18))
  static const Color lightSuccessSoft = Color(0x1F34BF49); // --success-soft
  static const Color lightDangerSoft = Color(0x1ACA0000); // --danger-soft
  static const Color lightInfoSoft = Color(0x1F3B82F6); // --info-soft
  static const Color lightOverlay = Color(
    0x6B5C533F,
  ); // --overlay-color (rgba(92, 83, 63, 0.42))
  static const LinearGradient lightLinear = LinearGradient(
    colors: [Color(0xFFFFFFFF), Color(0xFFFBFAE8)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Dark Mode Colors (defined in .dark)
  static const Color darkSecond = Color(0xFF161616); // --second-color
  static const Color darkBg = Color(0xFF0A0A0A); // --bg-color
  static const Color darkTitle = Color(0xFFFFFFFF); // --title-color
  static const Color darkTextHex = Color(
    0xA6FFFFFF,
  ); // --text-color (#FFFFFFA6)
  static const Color darkMuted = Color(0xFFC7BAA1); // --muted-color
  static const Color darkWhite = Color(0xFF1D1D1D); // --white-color
  static const Color darkSurface = Color(0xFF161616); // --surface-color
  static const Color darkSurfaceMuted = Color(0xFF1D1D1D); // --surface-muted
  static const Color darkSurfaceSoft = Color(0xFF242424); // --surface-soft
  static const Color darkBorder = Color(
    0x17FFFFFF,
  ); // --border-color (rgba(255, 255, 255, 0.09))
  static const Color darkBorderStrong = Color(
    0x29FFFFFF,
  ); // --border-strong (rgba(255, 255, 255, 0.16))
  static const Color darkAccentSoft = Color(
    0x29EF950A,
  ); // --accent-soft (rgba(239, 149, 10, 0.16))
  static const Color darkAccentSoftStrong = Color(
    0x3DEF950A,
  ); // --accent-soft-strong (rgba(239, 149, 10, 0.24))
  static const Color darkSuccessSoft = Color(0x2934BF49); // --success-soft
  static const Color darkDangerSoft = Color(0x2ECA0000); // --danger-soft
  static const Color darkInfoSoft = Color(0x2E3B82F6); // --info-soft
  static const Color darkOverlay = Color(
    0x8C000000,
  ); // --overlay-color (rgba(0, 0, 0, 0.55))
  static const LinearGradient darkLinear = LinearGradient(
    colors: [Color(0xFF0A0A0A), Color(0xFF1D1D1D)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Legacy mappings to avoid breaking existing usages in other files
  static const Color primaryPressed = Color(0xFFD18105);
  static const Color warmCream = Color(0xFFFBFAE8);
  static const Color lightCanvas = Color(0xFFF0EEE7);
  static const Color lightCard = Color(0xFFFFFEFA);
  static const Color textPrimary = Color(0xFF1B1B1B);
  static const Color textSecondary = Color(0xA61B1B1B);
  static const Color darkCanvas = Color(0xFF0A0A0A);
  static const Color darkText = Color(0xFFF7F2E8);
}
