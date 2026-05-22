# Plan - Mobile Clients, OCR & Chat Redesign

This document outlines the detailed plans for redesigning the Mobile app pages to match the design specifications from the mockups.

## 1. Clients List & Detail Screens (`clients_screen.dart`)
* **Scaffold background color**: `#F0EEE7` in light mode, `#0A0A0A` in dark mode.
* **Clients List Header**: Large title text "الموكلين" (Primary color) in the body list.
* **Bento Stats Row**:
  * Row of 2 boxes: "إجمالي الموكلين" and "نشطون".
  * Background of boxes is white (`#FFFFFF`) / dark surface (`#1D1D1D`), with rounded corners (20dp) and subtle shadows.
  * Number colors: Primary (`#885200` / `#EF950A`) for total, Tertiary (`#006493`) for active.
* **Styled Search Bar**: Rounded-t-xl search field with search and tune icon.
* **Client Card Layout**:
  * Letter gradient avatar box (size 56x56, rounded-2xl), with gradient selection based on index/type to match mockup colors.
  * User full initials (e.g. "أس" for "أحمد السالم").
  * Badge indicator for active/regular client: "نشط" (green-100 / green-700) or "عادي" (stone-100 / stone-600).
  * Trailing vertical options button (`more_vert`).
  * FAB: Bottom-left gradient floating action button (`FloatingActionButtonLocation.startFloat`).
* **Client Details Screen**:
  * Profile Card: Asymmetric background glows using radial gradient decoration, initials avatar with green dot bottom-right, quick actions row (Call, Chat, Edit) with circular button backgrounds.
  * Custom TabBar: Styled custom container matching `surface-container-low` with a colored pill indicator.
  * Information List: basic info fields formatted with trailing icons (`person`, `call`, `mail`, `location_on`, `calendar_today`, `description`).
  * Documents Preview Grid: Grid showing document cards with custom borders and preview icons.

## 2. OCR / Documents Screens (`documents_screen.dart` and `OcrReviewScreen`)
* **Upload Zone**: Custom dash border container (`upload-dashed` style) with icon, camera hint 📸, and type chips (PDF, JPG, PNG).
* **Bento Stats Grid**: Row showing "مكتمل" (count, green icon) and "جاري المعالجة" (count, orange icon).
* **Document Card Redesign**: Rounded-3xl, image background thumbnail with description overlay icon, state badge with green/orange/red styling based on processing stage.
* **OCR Review Comparison screen**:
  * Split/Tab view showing "الوثيقة الأصلية" (Original Document image with bounding highlights) and "النص المستخرج" (Extracted fields like DOCUMENT_TITLE, DATE_OF_ISSUE, CASE_REF, EXTRACTED_CONTENT in custom editable blocks).
  * Accuracy indicator (98% radial progress circle).
  * Smart audit details block ("تدقيق ذكي" auto-awesome chip).
  * Action buttons: "إعادة الفحص" and "حفظ الوثيقة".

## 3. Chat Screen (`chat_screen.dart`)
* **Welcome Insight Card**: Auto-awesome prompt chip ("المستشار الذكي جاهز للمساعدة") and elegant guidance message.
* **Chat Bubbles styling**:
  * User bubble: Linear gradient from `#885200` to `#EF950A` with white text.
  * AI assistant bubble: Dark/high surface bubble with a subtle amber edge line/bar, neat text line height and spacing.
  * Structured output support: Bullet items with checkmarks and contextual document links (PDF download preview cards).
* **Bottom Input Bar**: Rounded 24 glassmorphism border-white/10 bar with attach file button, send button with gradient icon, and quick suggestions chips below.

## Verification
* Run `flutter test` to verify mobile widget and navigation tests remain green.
