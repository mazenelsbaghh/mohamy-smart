# Client Details — UI Design Prompt

## Page Metadata
- **Platform**: Mobile (iOS + Android)  
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390×844

## Design Context
ملف الموكل التفصيلي — يعرض كل المعلومات المرتبطة بالموكل: بياناته الشخصية، القضايا المرتبطة، المعاملات المالية. Screen يستخدم Tabs لتنظيم المعلومات.

## Visual Prompt
خلفية `#F0EEE7` / `#0A0A0A`. Header بزر رجوع + عنوان "ملف الموكل" + menu (⋮).

**Profile Card**: بطاقة centered بـ radius `20px` padding `24px`:
- Avatar كبير 72px centered بأحرف الاسم
- اسم الموكل Bold 22px تحت الـ Avatar
- الهاتف Regular 14px `#1B1B1BA6` (LTR)
- Badge الحالة تحت الهاتف
- صف أزرار سريعة: 📞 اتصال | ✉️ رسالة | ✏️ تعديل — 3 أيقونات في دوائر 40px بخلفية `#FBFAE8`

**Tabs**: "البيانات" / "القضايا" / "المعاملات"

**تبويب البيانات**: قائمة key-value:
- الاسم الكامل / الهاتف / البريد / العنوان / تاريخ الإضافة / ملاحظات

**تبويب القضايا**: قائمة القضايا المرتبطة (نفس card style من Cases List). أو empty state "لا توجد قضايا مرتبطة".

**تبويب المعاملات**: قائمة زمنية (timeline) بالمعاملات المالية. كل عنصر: تاريخ + مبلغ + وصف + badge (مدفوع/معلق).

## Content Blocks (Arabic copy)
- Nav: "ملف الموكل"
- Quick actions: "اتصال" / "رسالة" / "تعديل"
- Tabs: "البيانات" / "القضايا" / "المعاملات"
- Labels: "الاسم الكامل" / "الهاتف" / "البريد" / "العنوان" / "تاريخ الإضافة" / "ملاحظات"
- Empty cases: "لا توجد قضايا مرتبطة"
- Empty transactions: "لا توجد معاملات مسجلة"

## Components Used
- Navigation Header
- Profile Card with large avatar
- Quick Action circles
- Tabs (3)
- Key-Value list
- Case cards (from Cases List)
- Transaction timeline
- Bottom Navigation

## Interaction Notes
- Phone icon → opens dialer
- Message icon → opens SMS/WhatsApp
- Edit icon → bottom sheet with edit form
- Case card tap → Case Details
- Menu → "حذف الموكل" (with confirmation)

## States to Design
| State | Description |
|-------|-------------|
| normal | Full client profile |
| loading | Skeleton |
| empty-cases | No linked cases message |
| empty-transactions | No transactions message |

## Linked Screens
- **Navigates from**: Clients List
- **Navigates to**: Case Details / Edit Sheet / Clients List (back)

## Design Tokens Reference
```
Avatar size: 72px
Action circles: #FBFAE8 / #2A2A2A
Transaction paid: #34BF49
Transaction pending: #F59E0B
```
