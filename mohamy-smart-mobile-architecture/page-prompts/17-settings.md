# Settings — UI Design Prompt

## Page Metadata
- **Platform**: Mobile (iOS + Android)
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390×844

## Design Context
شاشة الإعدادات — تُفتح من "المزيد" في Bottom Nav. تحتوي على الملف الشخصي، الأمان، الاشتراك، المظهر، والخروج. تصميم iOS/Android settings style مع grouped sections.

## Visual Prompt
خلفية `#F0EEE7` / `#0A0A0A`. Header "الإعدادات" Bold 22px.

**Profile Card** (أعلى): بطاقة بعرض كامل radius `16px` padding `16px`:
- Avatar 56px على اليمين + الاسم Bold 17px + البريد Regular 13px `#1B1B1BA6`
- سهم → على اليسار
- Tap → Profile Edit screen (or bottom sheet)

**Settings Groups**: كل مجموعة بعنوان Overline `#1B1B1BA6` Bold 10px uppercase tracking. العناصر داخل بطاقة `#FFFFFF` / `#1D1D1D` radius `16px`:

**مجموعة "الحساب":**
- 👤 الملف الشخصي → Profile Sheet
- 🔒 تغيير كلمة المرور → Password Sheet
- 💳 الاشتراك → Subscription screen

**مجموعة "المظهر":**
- 🌙 الوضع المعتم — Toggle switch (on/off)

**مجموعة "الدعم":**
- ❓ المساعدة والدعم
- 📜 الشروط والأحكام
- 🔐 سياسة الخصوصية
- ℹ️ عن التطبيق → الإصدار 1.0.0

**زر تسجيل الخروج**: أسفل كل المجموعات. بطاقة منفصلة:
- أيقونة خروج + "تسجيل الخروج" بلون `#CA0000` Bold 15px — centered
- Tap → confirmation alert

كل عنصر في المجموعة:
- ارتفاع 52px + padding أفقي 16px
- أيقونة 20px بلون `#EF950A` على اليمين
- نص Regular 15px `#1B1B1B` بعد الأيقونة
- سهم chevron ‹ على اليسار (أو Toggle)
- فاصل خط رفيع بين العناصر (indent من بعد الأيقونة)

## Content Blocks (Arabic copy)
- Title: "الإعدادات"
- Group 1: "الحساب" — "الملف الشخصي" / "تغيير كلمة المرور" / "الاشتراك"
- Group 2: "المظهر" — "الوضع المعتم"
- Group 3: "الدعم" — "المساعدة والدعم" / "الشروط والأحكام" / "سياسة الخصوصية" / "عن التطبيق"
- Logout: "تسجيل الخروج"
- Confirmation: "هل أنت متأكد من تسجيل الخروج؟"
- Confirm: "نعم، تسجيل الخروج" / "إلغاء"

## Components Used
- Header
- Profile summary card
- Grouped settings list
- Toggle switch (dark mode)
- Navigation items with chevron
- Danger button (logout)
- Confirmation alert dialog

## Interaction Notes
- Profile card tap → edit profile bottom sheet
- Dark mode toggle → instant theme change
- Logout → confirmation → redirect to Login
- "عن التطبيق" → shows version number
- Items with chevron → navigate to respective screen/sheet

## States to Design
| State | Description |
|-------|-------------|
| normal (light) | All settings groups visible |
| normal (dark) | Dark variant with toggle ON |
| logout-confirm | Alert dialog visible |

## Linked Screens
- **Navigates from**: Bottom Nav "المزيد"
- **Navigates to**: Profile Edit / Password Change / Subscription / Login (logout)

## Design Tokens Reference
```
Group label: #1B1B1BA6 uppercase
Item icon: #EF950A
Chevron: #1B1B1B30
Divider: #1B1B1B08
Logout text: #CA0000
Toggle active: #EF950A
Toggle track: #1B1B1B20
Profile card: #FFFFFF / #1D1D1D
```
