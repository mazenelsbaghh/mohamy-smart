import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://mohamy-smart.com'),
  title: "محامي سمارت | المنصة القانونية الأذكى لإدارة القضايا",
  description: "اكتشف محامي سمارت، المنصة القانونية الأولى عربياً. أدر قضاياك وموكليك، وحلل المستندات المعقدة في ثوانٍ بالذكاء الاصطناعي ✓ جرب المنصة الآن مجاناً!",
  keywords: ["محامي سمارت", "المنصة القانونية", "الذكاء الاصطناعي للمحامين", "إدارة القضايا", "تحليل المستندات القانونية", "برنامج إدارة مكاتب المحاماة", "EGY Legal"],
  icons: {
    icon: "/images/1-eb26d7be.ico",
  },
  openGraph: {
    title: "محامي سمارت | المنصة القانونية الأذكى لإدارة القضايا",
    description: "اكتشف محامي سمارت، المنصة القانونية الأولى عربياً. أدر قضاياك وموكليك، وحلل المستندات المعقدة في ثوانٍ بالذكاء الاصطناعي ✓ جرب المنصة الآن مجاناً!",
    locale: "ar_EG",
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://mohamy-smart.com',
    siteName: "محامي سمارت",
    images: [
      {
        url: "/images/og-image.svg",
        width: 1200,
        height: 630,
        alt: "محامي سمارت - المنصة القانونية الذكية",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "محامي سمارت | المنصة القانونية الأذكى لإدارة القضايا",
    description: "اكتشف محامي سمارت، المنصة القانونية الأولى عربياً. أدر قضاياك وموكليك، وحلل المستندات المعقدة في ثوانٍ بالذكاء الاصطناعي ✓ جرب المنصة الآن مجاناً!",
    images: ["/images/og-image.svg"],
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
                "@type": "SoftwareApplication",
                "name": "محامي سمارت",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Web",
                "description": "منصة قانونية متكاملة مدعومة بالذكاء الاصطناعي لمساعدة المحامين في تحليل المستندات واستخلاص النقاط الجوهرية وإدارة القضايا بكفاءة.",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "EGP"
                },
                "provider": {
                  "@type": "Organization",
                  "name": "EGY Legal for Smart Technology",
                  "url": "https://mohamy-smart.com"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "EGY Legal for Smart Technology",
                "url": "https://mohamy-smart.com",
                "logo": "https://mohamy-smart.com/images/logo.png",
                "description": "شركة تقنية رائدة في تطوير الحلول القانونية الذكية لدعم قطاع المحاماة في مصر والوطن العربي.",
                "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "customer service",
                  "availableLanguage": ["Arabic", "English"]
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
