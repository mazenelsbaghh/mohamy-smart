import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'سياسة الاسترداد | محامي سمارت',
    description: 'سياسة الاسترداد والاسترجاع الخاصة بمنصة محامي سمارت',
};

export default function RefundPolicyLayout({ children }: { children: React.ReactNode }) {
    return children;
}
