"use client";

import { Card, CardBody, Divider } from '@heroui/react';
import Link from 'next/link';

export default function AboutPage() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "من نحن - محامي سمارت",
    "description": "صفحة التعريف بمنصة محامي سمارت وشركة قانوني للتكنولوجيا الذكية",
    "url": "https://mohamy-smart.com/about",
    "mainEntity": {
      "@type": "Organization",
      "name": "شركة قانوني للتكنولوجيا الذكية",
      "alternateName": ["EGY Legal for Smart Technology", "محامي سمارت", "Mohamy Smart"],
      "url": "https://mohamy-smart.com",
      "logo": "https://mohamy-smart.com/images/logo.png",
      "description": "شركة قانوني للتكنولوجيا الذكية (EGY Legal for Smart Technology) هي شركة تكنولوجيا قانونية مصرية رائدة متخصصة في تطوير الحلول القانونية الذكية المدعومة بالذكاء الاصطناعي. أسست ومقرها الرئيسي في مدينة الإسكندرية بجمهورية مصر العربية. طورت الشركة منصة محامي سمارت، وهي أول منصة قانونية عربية وعالمية مدعومة بالذكاء الاصطناعي موجهة خصيصاً لدعم المحامين والمكاتب القانونية.",
      "foundingLocation": {
        "@type": "Place",
        "name": "الإسكندرية، مصر"
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "الإسكندرية",
        "addressCountry": "EG"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+201289221056",
        "contactType": "customer service",
        "email": "info@mohamy-smart.com",
        "availableLanguage": ["Arabic", "English"]
      },
      "email": "info@mohamy-smart.com",
      "telephone": "+201289221056",
      "sameAs": [
        "https://www.instagram.com/mohamysmart",
        "https://www.tiktok.com/@mohamysmart",
        "https://www.facebook.com/share/1B8cv3VtWj/"
      ]
    }
  };

  return (
    <div className="bg-[var(--bg-color)] min-h-screen py-20 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />

      <div className="max-w-5xl mx-auto space-y-12">

        {/* Hero */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--white-color)]">
            من نحن — <span className="text-[var(--main-color)]">محامي سمارت</span>
          </h1>
          <p className="text-lg text-[var(--text-color)] max-w-3xl mx-auto leading-relaxed">
            محامي سمارت منصة قانونية رقمية متكاملة طورتها شركة قانوني للتكنولوجيا الذكية
            (EGY Legal for Smart Technology)، لتقديم تجربة قانونية حديثة تجمع بين
            الخبرة القانونية والتقنيات الذكية المدعومة بالذكاء الاصطناعي.
          </p>
        </div>

        {/* الشركة */}
        <AboutCard title="عن الشركة">
          <p>
            <strong>شركة قانوني للتكنولوجيا الذكية (EGY Legal for Smart Technology)</strong> هي
            شركة تكنولوجيا قانونية مصرية رائدة، تأسست في مدينة الإسكندرية بجمهورية مصر العربية.
            تتخصص الشركة في تطوير الحلول القانونية الذكية المدعومة بالذكاء الاصطناعي لدعم
            قطاع المحاماة في مصر والوطن العربي.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-[var(--bg-color)] rounded-xl p-4">
              <p className="text-[var(--main-color)] font-semibold mb-1">الاسم الرسمي</p>
              <p>شركة قانوني للتكنولوجيا الذكية</p>
              <p className="text-[var(--text-color)]">EGY Legal for Smart Technology</p>
            </div>
            <div className="bg-[var(--bg-color)] rounded-xl p-4">
              <p className="text-[var(--main-color)] font-semibold mb-1">المقر الرئيسي</p>
              <p>الإسكندرية، جمهورية مصر العربية</p>
            </div>
            <div className="bg-[var(--bg-color)] rounded-xl p-4">
              <p className="text-[var(--main-color)] font-semibold mb-1">البريد الإلكتروني</p>
              <p>info@mohamy-smart.com</p>
            </div>
            <div className="bg-[var(--bg-color)] rounded-xl p-4">
              <p className="text-[var(--main-color)] font-semibold mb-1">الهاتف</p>
              <p dir="ltr" className="text-start">+20 128 922 1056</p>
            </div>
          </div>
        </AboutCard>

        {/* المنتج */}
        <AboutCard title="ما هو محامي سمارت؟">
          <p>
            <strong>محامي سمارت (Mohamy Smart)</strong> هي أول منصة قانونية عربية وعالمية مدعومة
            بالذكاء الاصطناعي، موجهة خصيصاً للمحامين والمكاتب القانونية. تقدم المنصة مجموعة
            شاملة من الأدوات الذكية المتقدمة التي تساعد المحامي في عمله اليومي:
          </p>
          <ul className="list-disc pe-6 space-y-2 mt-3">
            <li><strong>إدارة القضايا:</strong> نظام متكامل لتنظيم وإدارة جميع القضايا بطريقة ذكية ومتقدمة</li>
            <li><strong>إدارة الموكلين:</strong> حفظ سجلات شاملة ومنظمة لجميع العملاء والموكلين</li>
            <li><strong>المساعد الذكي:</strong> استشارات قانونية فورية مدعومة بالذكاء الاصطناعي</li>
            <li><strong>الصيغ القانونية:</strong> توليد المستندات القانونية تلقائياً (مذكرات دفاع، صحف دعاوى، عقود)</li>
            <li><strong>تحليل الأحكام:</strong> تحليل الأحكام القضائية واستخراج الدفوع والنقاط الجوهرية آلياً</li>
            <li><strong>حماية البيانات:</strong> تشفير عالي المستوى لجميع المعلومات والمستندات</li>
          </ul>
        </AboutCard>

        <Divider />

        {/* الريادة والرسالة والرؤية */}
        <div className="grid md:grid-cols-3 gap-6">
          <HighlightCard title="ريادتنا">
            نقدم أنفسنا كأول منصة بالذكاء الاصطناعي موجهة للمحامين عربياً وعالمياً،
            لإنجاز الأعمال القانونية بصورة أسرع وأكثر وضوحاً.
          </HighlightCard>

          <HighlightCard title="رسالتنا">
            تقديم تجربة قانونية رقمية أكثر وضوحاً وسرعة، تقلل من العشوائية
            وسوء الفهم، مع الحفاظ على السرية والمهنية.
          </HighlightCard>

          <HighlightCard title="رؤيتنا">
            أن نكون البوابة الأولى للأعمال القانونية الذكية في المنطقة العربية،
            عبر أدوات ترفع كفاءة إدارة القضايا والعقود.
          </HighlightCard>
        </div>

        <Divider />

        {/* كيف نعمل */}
        <AboutCard title="كيف يعمل محامي سمارت؟">
          <div className="space-y-4">
            <Step number={1} title="سجّل حسابك">
              انضم كمحامي مسجل جديد للوصول إلى لوحة تحكم محامي سمارت، لإدارة مكتبك القانوني بالكامل.
            </Step>
            <Step number={2} title="أنشئ قضيتك وأضف المستندات">
              قم بفتح ملف للقضية، وأضف بيانات الموكلين، ثم ارفع المستندات والأحكام الخاصة بها.
            </Step>
            <Step number={3} title="حلّل وصِغ بالذكاء الاصطناعي">
              استخدم مسارات العمل الذكية لتحليل الأحكام، واستخراج الدفوع، وصياغة صحف الدعاوى والمذكرات.
            </Step>
            <Step number={4} title="احفظ مستنداتك واستخدمها">
              راجع المخرجات القانونية واعتمدها، ثم قم بتصديرها أو طباعتها جاهزة للاستخدام الرسمي.
            </Step>
          </div>
        </AboutCard>

        {/* ما يميزنا */}
        <AboutCard title="ما يميز محامي سمارت؟">
          <ul className="list-disc pe-6 space-y-3">
            <li><strong>أول منصة عربية بالذكاء الاصطناعي:</strong> رائدة في تقديم حلول الذكاء الاصطناعي للمحامين في المنطقة العربية</li>
            <li><strong>واجهة عربية كاملة:</strong> واجهة مستخدم بسيطة وسهلة بالكامل باللغة العربية</li>
            <li><strong>السرية والأمان:</strong> حماية بيانات الموكلين والمستندات بأعلى معايير التشفير</li>
            <li><strong>الدقة:</strong> صياغة منضبطة تعتمد على الوقائع والتشريعات المصرية</li>
            <li><strong>الوضوح:</strong> تبسيط التعقيد القانوني وتقديم مخرجات واضحة ومنظمة</li>
            <li><strong>تحديثات القوانين:</strong> تحديثات مستمرة بأحدث القوانين والتشريعات المصرية</li>
            <li><strong>تكامل المحاكم:</strong> تكامل مع أنظمة المحاكم الإلكترونية في مصر</li>
          </ul>
        </AboutCard>

        {/* حدود الخدمة */}
        <AboutCard title="حدود الخدمة ومسؤولية الاستخدام">
          <ul className="list-disc pe-6 space-y-2">
            <li>تعتمد الخدمة على دقة البيانات المقدمة من المستخدم</li>
            <li>لا نضمن نتيجة قضائية أو قراراً إدارياً</li>
            <li>المستخدم مسؤول عن مراجعة المخرجات قبل أي إجراء رسمي</li>
            <li>المنصة أداة مساعدة للمحامي وليست بديلاً عن الخبرة القانونية البشرية</li>
          </ul>
        </AboutCard>

        {/* CTA */}
        <div className="text-center space-y-6 py-8">
          <h2 className="text-3xl font-bold text-[var(--white-color)]">
            ابدأ رحلتك مع <span className="text-[var(--main-color)]">محامي سمارت</span>
          </h2>
          <p className="text-[var(--text-color)]">
            سجّل الآن مجاناً واكتشف كيف يمكن للذكاء الاصطناعي أن يرفع كفاءة عملك القانوني
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="https://lawyer.mohamy-smart.com/auth/sign-up"
              className="inline-block px-8 py-3 bg-[var(--main-color)] text-[var(--bg-color)] font-semibold rounded-2xl hover:opacity-90 transition-opacity"
            >
              سجّل معانا مجاناً
            </a>
            <Link
              href="/"
              className="inline-block px-8 py-3 border border-[var(--main-color)] text-[var(--main-color)] font-semibold rounded-2xl hover:bg-[var(--main-color)] hover:text-[var(--bg-color)] transition-all"
            >
              الصفحة الرئيسية
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}


function AboutCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="shadow-md rounded-2xl bg-[var(--dark-surface)]">
      <CardBody className="space-y-4 p-6 md:p-8 text-start">
        <h2 className="text-2xl md:text-3xl font-semibold text-[var(--white-color)]">
          {title}
        </h2>
        <div className="text-[var(--text-color)] leading-relaxed text-base md:text-lg">
          {children}
        </div>
      </CardBody>
    </Card>
  );
}

function HighlightCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="shadow-md hover:shadow-xl transition-all rounded-2xl bg-[var(--dark-surface)] border border-white/5">
      <CardBody className="space-y-4 p-6">
        <h3 className="text-2xl font-semibold text-[var(--main-color)]">{title}</h3>
        <p className="text-[var(--text-color)] leading-relaxed text-base md:text-lg">
          {children}
        </p>
      </CardBody>
    </Card>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--main-color)] flex items-center justify-center text-[var(--bg-color)] font-bold text-lg">
        {number}
      </div>
      <div>
        <h4 className="text-lg font-semibold text-[var(--white-color)] mb-1">{title}</h4>
        <p className="text-[var(--text-color)]">{children}</p>
      </div>
    </div>
  );
}
