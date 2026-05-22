# Settings and Profile — UI Design Prompt

## Page Metadata
- **Platform**: Mobile
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390x844

## Design Context
Account profile, firm information, security, notifications, display preferences, and logout.

## Visual Prompt
Create an RTL settings screen with profile card at top showing avatar initials, lawyer name, license number, and edit action. Below, use grouped list sections with icons: "الحساب"، "الأمان"، "الإشعارات"، "المظهر"، "الدعم". Toggles use amber when active. Destructive logout appears at bottom in red text inside a quiet row. Avoid dense settings; each row has title, optional subtitle, and chevron.

## Content Blocks (Arabic copy)
- الإعدادات
- تعديل الملف الشخصي
- رقم الترخيص
- الحساب
- بيانات المكتب
- الأمان
- تغيير كلمة المرور
- الإشعارات
- المظهر
- الوضع الداكن
- الدعم والمساعدة
- تسجيل الخروج
- حفظ التغييرات

## Components Used
- Profile summary card
- Settings grouped list
- Toggle
- Chevron row
- Confirm dialog

## Interaction Notes
Edit opens profile form. Logout asks confirmation. Theme toggle applies immediately.

## States to Design
| State | Description |
|-------|-------------|
| normal | Settings list |
| saving | Save spinner in edit form |
| success | Confirmation toast |
| confirm-logout | Dialog/sheet |

## Linked Screens
- **Navigates from**: More, Home
- **Navigates to**: Login, Subscription and AI Points, Profile edit

## Design Tokens Reference
Toggle active `#EF950A`, destructive `#CA0000`, section card `#FFFEFA`.

