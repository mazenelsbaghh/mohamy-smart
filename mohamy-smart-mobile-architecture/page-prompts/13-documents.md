# Documents / OCR — UI Design Prompt

## Page Metadata
- **Platform**: Mobile (iOS + Android)
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390×844

## Design Context
شاشة رفع وإدارة المستندات القانونية مع استخراج النصوص بالذكاء الاصطناعي (OCR). على الموبايل: يمكن للمحامي تصوير المستند مباشرة بالكاميرا أو اختياره من الملفات.

## Visual Prompt
خلفية `#F0EEE7` / `#0A0A0A`. Header "المستندات" + أيقونة بحث.

**Upload Zone** (أعلى): بطاقة بحدود متقطعة `#EF950A40` dashed 2px, radius `16px`, ارتفاع 120px, centered:
- أيقونة سحابة ↑ بحجم 36px بلون `#EF950A`
- "اسحب أو اضغط لرفع مستند" Bold 14px
- "أو التقط صورة بالكاميرا 📸" Regular 12px `#EF950A`
- Tap → Bottom sheet: "اختيار من الملفات" / "التقاط صورة" / "إلغاء"

**Documents List**: كل مستند:
- بطاقة radius `12px`, padding `14px`
- على اليمين: thumbnail مصغشر 48x48 للمستند (أو أيقونة PDF/Image)
- وسط: اسم الملف Bold 14px + حجم Regular 11px + تاريخ الرفع
- على اليسار: badge حالة OCR
  - "جاري المعالجة" ⏳ برتقالي مع spinner
  - "مكتمل" ✓ أخضر
  - "فشل" ✗ أحمر
- Tap → معاينة المستند + النص المستخرج (full screen)

**FAB**: كاميرا 📷 بدلاً من + — للوصول السريع لالتقاط صورة.

## Content Blocks (Arabic copy)
- Title: "المستندات"
- Upload: "اسحب أو اضغط لرفع مستند"
- Camera: "أو التقط صورة بالكاميرا 📸"
- Sheet options: "اختيار من الملفات" / "التقاط صورة" / "إلغاء"
- OCR statuses: "جاري المعالجة" / "مكتمل" / "فشل"
- Empty: "لا توجد مستندات — ابدأ برفع أول مستند"

## Components Used
- Header
- Upload Zone with dashed border
- Action Sheet (bottom)
- Document list cards
- OCR status badges
- Document preview modal
- Camera FAB
- Bottom Navigation

## Interaction Notes
- Upload starts OCR automatically
- Progress bar during upload
- Camera → native camera → auto-upload captured image
- Card tap → full screen preview with OCR text side-by-side (swipe between image/text)
- Long press → share / delete / link to case

## States to Design
| State | Description |
|-------|-------------|
| normal | List of documents |
| empty | Upload zone prominent + illustration |
| uploading | Progress bar on new document |
| ocr-processing | Spinner badge next to document |
| ocr-complete | Green checkmark badge |
| ocr-failed | Red X badge + retry option |

## Linked Screens
- **Navigates from**: Home (quick action) / Bottom Nav "المزيد" section
- **Navigates to**: Document Preview / Camera / Case Details (link document)

## Design Tokens Reference
```
Upload border: #EF950A40 dashed
Upload icon: #EF950A
OCR Processing: #F59E0B
OCR Complete: #34BF49
OCR Failed: #CA0000
Thumbnail bg: #F0EEE7 / #2A2A2A
```
