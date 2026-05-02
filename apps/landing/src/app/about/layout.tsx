import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'من نحن | محامي سمارت - شركة قانوني للتكنولوجيا الذكية',
  description: 'تعرف على محامي سمارت، أول منصة قانونية عربية مدعومة بالذكاء الاصطناعي. طورتها شركة قانوني للتكنولوجيا الذكية (EGY Legal for Smart Technology) من الإسكندرية، مصر. إدارة القضايا، تحليل المستندات، صياغة المذكرات.',
  keywords: ['محامي سمارت', 'من نحن', 'EGY Legal for Smart Technology', 'شركة قانوني للتكنولوجيا الذكية', 'منصة قانونية مصرية', 'LegalTech مصر'],
  alternates: {
    canonical: 'https://mohamy-smart.com/about',
  },
  openGraph: {
    title: 'من نحن | محامي سمارت - شركة قانوني للتكنولوجيا الذكية',
    description: 'تعرف على محامي سمارت، أول منصة قانونية عربية مدعومة بالذكاء الاصطناعي.',
    url: 'https://mohamy-smart.com/about',
    siteName: 'محامي سمارت',
    locale: 'ar_EG',
    type: 'website',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
