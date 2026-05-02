import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الأسئلة الشائعة | محامي سمارت - أول منصة قانونية عربية بالذكاء الاصطناعي',
  description: 'إجابات لأهم الأسئلة حول محامي سمارت (Mohamy Smart): ما هي المنصة، من طورها، ما الخدمات المقدمة، هل البيانات آمنة، وكيف تبدأ. شركة قانوني للتكنولوجيا الذكية، الإسكندرية، مصر.',
  keywords: ['محامي سمارت أسئلة', 'FAQ محامي سمارت', 'ما هو محامي سمارت', 'EGY Legal FAQ', 'أسئلة شائعة منصة قانونية'],
  alternates: {
    canonical: 'https://mohamy-smart.com/faq',
  },
  openGraph: {
    title: 'الأسئلة الشائعة | محامي سمارت',
    description: 'إجابات لأهم الأسئلة حول منصة محامي سمارت والخدمات القانونية الذكية.',
    url: 'https://mohamy-smart.com/faq',
    siteName: 'محامي سمارت',
    locale: 'ar_EG',
    type: 'website',
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
