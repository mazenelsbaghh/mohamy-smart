# Subscription Plans — UI Design Prompt

## Page Metadata
- **Platform**: Mobile (iOS + Android)
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390×844

## Design Context
شاشة الباقات — الشاشة الأهم للـ monetization. يجب أن تعرض الباقات بشكل جذاب يحفز الترقية. على الموبايل: عرض أفقي scrollable (carousel) أكثر تأثيراً من grid.

## Visual Prompt
خلفية `#F0EEE7` / `#0A0A0A`. Header بزر رجوع + "الباقات والاشتراكات".

**Current Plan Banner** (إذا مشترك): بطاقة بخلفية gradient خفيف `#EF950A10` → `#FFFFFF`, radius `16px`, padding `16px`:
- Badge "اشتراكك الحالي" — pill بخلفية `#EF950A20` + نص `#EF950A` Bold 10px
- اسم الباقة Bold 18px
- صف: ⏰ "ينتهي خلال 15 يوم" + ⚡ "12 / 50 طلب ذكاء"
- **Usage Bar**: شريط بعرض كامل ارتفاع 6px radius `full`:
  - خلفية `#1B1B1B10`
  - Fill: gradient `#EF950A` → `#F59E0B` بنسبة الاستخدام
  - نسبة مئوية على اليسار Bold 12px

**Payment Toggle**: Segment control:
- "💳 بطاقة" / "📱 محفظة"
- ارتفاع 40px, radius `full`, خلفية `#1B1B1B08`
- Active segment: خلفية `#FFFFFF` + ظل + Bold

**Plans Carousel**: سكرول أفقي (snap scroll). كل بطاقة عرض ~300px (يظهر جزء من الباقة التالية كـ peek):

كل بطاقة باقة:
- ارتفاع ~380px, radius `20px`, padding `24px`
- Gradients مختلفة:
  - Silver: `#F8F8F8` → `#E8E8E8`
  - Gold: `#FFF8E7` → `#FFE4A0`  
  - Premium: `#FFF0E0` → `#FFD4A0`
  - Elite: `#1B1B1B` → `#2A2A2A` (dark card)
- أيقونة كبيرة 48px centered (⭐/📈/✨/🚀)
- اسم الباقة Bold 22px centered
- السعر: رقم كبير جداً Bold 36px + "ج.م" Regular 14px + "/ شهر" Regular 12px
- فاصل خفيف
- Features list (checkmarks ✓ خضراء):
  - "X طلب ذكاء اصطناعي"
  - "X يوم نشاط"
  - Features إضافية
- **CTA أسفل الـ Card**: عرض كامل radius `12px` ارتفاع 48px
  - عادي: خلفية `#EF950A` + "اشترك الآن" أبيض Bold
  - الحالي: خلفية `#34BF4920` + "باقتك الحالية ✓" أخضر Bold (disabled)
- **"الأكثر طلبًا" Ribbon**: على الباقة الموصى بها — pill absolute أعلى يمين الـ Card بخلفية `#EF950A` + "✨ الأكثر طلبًا" أبيض Bold 10px

**Footer Note**: "جميع الباقات تشمل وصولاً كاملاً لأدوات الذكاء الاصطناعي. يمكنك ترقية باقتك في أي وقت." Regular 12px `#1B1B1BA6` centered padding 20px.

## Content Blocks (Arabic copy)
- Nav: "الباقات والاشتراكات"
- Current badge: "اشتراكك الحالي"
- Expiry: "ينتهي خلال X يوم"
- Usage: "X / Y طلب ذكاء"
- Payment: "💳 بطاقة" / "📱 محفظة"
- Ribbon: "✨ الأكثر طلبًا"
- Price suffix: "ج.م" / "/ شهر"
- Features: "X طلب ذكاء اصطناعي" / "X يوم نشاط"
- CTA: "اشترك الآن" / "باقتك الحالية ✓"
- Footer: "جميع الباقات تشمل وصولاً كاملاً لأدوات الذكاء الاصطناعي. يمكنك ترقية باقتك في أي وقت."
- Loading CTA: spinner

## Components Used
- Navigation Header
- Current Plan Banner with usage bar
- Segment Control (payment method)
- Horizontal Snap Carousel
- Plan Cards (styled per tier)
- Feature list with checkmarks
- Ribbon badge
- CTA buttons per card
- Footer text

## Interaction Notes
- Carousel snap-scrolls to center each card
- "اشترك الآن" → loading spinner → opens Paymob in external browser
- Current plan card CTA is disabled
- Payment toggle affects which payment method is used  
- Page indicator dots below carousel
- Pull-to-refresh re-fetches plans and current status

## States to Design
| State | Description |
|-------|-------------|
| loading | Skeleton banner + 2 skeleton cards |
| no-plan | No banner, plans carousel only |
| active-plan | Banner visible + current plan marked |
| subscribing | Spinner on selected plan's CTA |
| near-expiry | Usage bar >80% with warning color |

## Linked Screens
- **Navigates from**: Settings / Home (upgrade prompt)
- **Navigates to**: Paymob (external) / Settings (back)

## Design Tokens Reference
```
Banner gradient: #EF950A10 → transparent
Usage bar bg: #1B1B1B10
Usage bar fill: #EF950A → #F59E0B gradient
Segment active: #FFFFFF + shadow
Segment bg: #1B1B1B08
Silver gradient: #F8F8F8 → #E8E8E8
Gold gradient: #FFF8E7 → #FFE4A0
Premium gradient: #FFF0E0 → #FFD4A0
Elite gradient: #1B1B1B → #2A2A2A
Ribbon: #EF950A
Feature check: #34BF49
Current CTA: #34BF4920 bg + #34BF49 text
Price: #1B1B1B Bold
```
