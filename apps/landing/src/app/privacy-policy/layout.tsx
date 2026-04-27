import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'سياسة الخصوصية | محامي سمارت',
    description: 'سياسة الخصوصية الخاصة بمنصة محامي سمارت',
};

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
    return children;
}
