import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://mohamy-smart.com'),
  title: "محامي سمارت | المنصة القانونية الأذكى لإدارة القضايا",
  description: "اكتشف محامي سمارت، المنصة القانونية الأولى عربياً المدعومة بالذكاء الاصطناعي. أدر قضاياك وموكليك، وحلل المستندات المعقدة في ثوانٍ. طورتها شركة قانوني للتكنولوجيا الذكية (EGY Legal for Smart Technology) من الإسكندرية، مصر ✓ جرب المنصة الآن مجاناً!",
  keywords: [
    "محامي سمارت", "Mohamy Smart", "المنصة القانونية", "الذكاء الاصطناعي للمحامين",
    "إدارة القضايا", "تحليل المستندات القانونية", "برنامج إدارة مكاتب المحاماة",
    "EGY Legal", "EGY Legal for Smart Technology", "قانوني للتكنولوجيا الذكية",
    "منصة قانونية مصرية", "LegalTech", "محامي ذكاء اصطناعي", "صياغة مذكرات دفاع",
    "تحليل أحكام", "استخراج دفوع", "إدارة موكلين", "AI legal platform",
    "legal case management", "Arabic legal AI", "Egypt legal technology"
  ],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png" }
    ],
    apple: "/favicon.png",
  },
  category: "Legal Technology",
  creator: "EGY Legal for Smart Technology",
  publisher: "شركة قانوني للتكنولوجيا الذكية",
  openGraph: {
    title: "محامي سمارت | المنصة القانونية الأذكى لإدارة القضايا",
    description: "اكتشف محامي سمارت، المنصة القانونية الأولى عربياً. أدر قضاياك وموكليك، وحلل المستندات المعقدة في ثوانٍ بالذكاء الاصطناعي ✓ جرب المنصة الآن مجاناً!",
    locale: "ar_EG",
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://mohamy-smart.com',
    siteName: "محامي سمارت",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "محامي سمارت - المنصة القانونية الذكية",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "محامي سمارت | المنصة القانونية الأذكى لإدارة القضايا",
    description: "اكتشف محامي سمارت، المنصة القانونية الأولى عربياً. أدر قضاياك وموكليك، وحلل المستندات المعقدة في ثوانٍ بالذكاء الاصطناعي ✓ جرب المنصة الآن مجاناً!",
    images: ["/images/og-image.png"],
  },
  alternates: {
    canonical: 'https://mohamy-smart.com',
  },
  other: {
    'llms.txt': 'https://mohamy-smart.com/llms.txt',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "@id": "https://mohamy-smart.com/#organization",
                "name": "شركة قانوني للتكنولوجيا الذكية",
                "alternateName": ["EGY Legal for Smart Technology", "محامي سمارت", "Mohamy Smart"],
                "url": "https://mohamy-smart.com",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://mohamy-smart.com/images/logo.png",
                  "width": 512,
                  "height": 512
                },
                "description": "شركة قانوني للتكنولوجيا الذكية (EGY Legal for Smart Technology) هي شركة تكنولوجيا قانونية مصرية متخصصة في تطوير الحلول القانونية الذكية المدعومة بالذكاء الاصطناعي. طورت منصة محامي سمارت، أول منصة قانونية عربية بالذكاء الاصطناعي لدعم المحامين والمكاتب القانونية في مصر والوطن العربي.",
                "foundingLocation": {
                  "@type": "Place",
                  "name": "الإسكندرية، مصر"
                },
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "الإسكندرية",
                  "addressCountry": "EG",
                  "addressRegion": "الإسكندرية"
                },
                "contactPoint": [
                  {
                    "@type": "ContactPoint",
                    "telephone": "+201289221056",
                    "contactType": "customer service",
                    "email": "info@mohamy-smart.com",
                    "availableLanguage": ["Arabic", "English"],
                    "areaServed": ["EG", "SA", "AE", "KW", "QA", "BH", "OM", "JO", "LB", "IQ"]
                  }
                ],
                "email": "info@mohamy-smart.com",
                "telephone": "+201289221056",
                "areaServed": {
                  "@type": "GeoShape",
                  "name": "مصر والوطن العربي"
                },
                "knowsAbout": ["القانون المصري", "الذكاء الاصطناعي القانوني", "إدارة القضايا", "تحليل المستندات القانونية", "LegalTech"],
                "slogan": "المنصة القانونية الأذكى لإدارة القضايا",
                "sameAs": [
                  "https://www.instagram.com/mohamysmart",
                  "https://www.tiktok.com/@mohamysmart",
                  "https://www.facebook.com/share/1B8cv3VtWj/"
                ]
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "@id": "https://mohamy-smart.com/#website",
                "name": "محامي سمارت",
                "alternateName": "Mohamy Smart",
                "url": "https://mohamy-smart.com",
                "description": "أول منصة قانونية عربية مدعومة بالذكاء الاصطناعي لمساعدة المحامين في إدارة القضايا وتحليل المستندات القانونية وصياغة المذكرات.",
                "publisher": { "@id": "https://mohamy-smart.com/#organization" },
                "inLanguage": ["ar", "en"]
              },
              {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "@id": "https://mohamy-smart.com/#application",
                "name": "محامي سمارت",
                "alternateName": "Mohamy Smart",
                "applicationCategory": "BusinessApplication",
                "applicationSubCategory": "Legal Technology",
                "operatingSystem": "Web",
                "description": "منصة قانونية متكاملة مدعومة بالذكاء الاصطناعي لمساعدة المحامين في تحليل المستندات واستخلاص النقاط الجوهرية وإدارة القضايا بكفاءة. تشمل: إدارة القضايا، إدارة الموكلين، مساعد ذكي بالذكاء الاصطناعي، صياغة المستندات القانونية تلقائياً، تحليل الأحكام واستخراج الدفوع.",
                "url": "https://lawyer.mohamy-smart.com",
                "featureList": [
                  "إدارة القضايا بطريقة ذكية ومتقدمة",
                  "إدارة بيانات الموكلين",
                  "مساعد ذكي بالذكاء الاصطناعي للاستشارات القانونية",
                  "صياغة المستندات القانونية تلقائياً",
                  "تحليل الأحكام واستخراج الدفوع",
                  "تشفير عالي المستوى لحماية البيانات",
                  "واجهة عربية سهلة الاستخدام",
                  "تحديثات مستمرة بأحدث القوانين المصرية"
                ],
                "offers": {
                  "@type": "AggregateOffer",
                  "lowPrice": "0",
                  "priceCurrency": "EGP",
                  "offerCount": "3",
                  "availability": "https://schema.org/InStock"
                },
                "provider": { "@id": "https://mohamy-smart.com/#organization" },
                "screenshot": "https://mohamy-smart.com/images/og-image.png",
                "inLanguage": "ar"
              },
              {
                "@context": "https://schema.org",
                "@type": "LegalService",
                "@id": "https://mohamy-smart.com/#legalservice",
                "name": "محامي سمارت - خدمات قانونية ذكية",
                "alternateName": "Mohamy Smart Legal Services",
                "description": "خدمات قانونية رقمية مدعومة بالذكاء الاصطناعي تشمل: تحليل المستندات القانونية، صياغة المذكرات وصحف الدعاوى، إدارة القضايا والموكلين، واستخراج الدفوع القانونية آلياً وفقاً للتشريعات المصرية.",
                "url": "https://mohamy-smart.com",
                "provider": { "@id": "https://mohamy-smart.com/#organization" },
                "serviceType": ["تحليل مستندات قانونية", "صياغة مذكرات دفاع", "إدارة قضايا", "استشارات قانونية بالذكاء الاصطناعي"],
                "areaServed": {
                  "@type": "Country",
                  "name": "مصر"
                },
                "availableChannel": {
                  "@type": "ServiceChannel",
                  "serviceUrl": "https://lawyer.mohamy-smart.com",
                  "servicePhone": {
                    "@type": "ContactPoint",
                    "telephone": "+201289221056"
                  }
                }
              }
            ])
          }}
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-WBNZD2VV"
            height="0" 
            width="0" 
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-WBNZD2VV');
          `}
        </Script>

        {/* Google Analytics GA4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-9VPDK0NFCP"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-9VPDK0NFCP');
          `}
        </Script>

        {/* Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "wh5i9rud1u");
          `}
        </Script>

        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
