'use client';

import { useEffect, useState } from 'react';
import './PricingPlans.css';
import Container from '../ui/Container';
import HeadTitle from '../headTitle/HeadTitle';
import { GoCheckCircle } from "react-icons/go";
import { apiClient } from '../../lib/api';

type TPlan = {
    id: number;
    name: string;
    features: string;
    price: number;
    aiRequestsLimit: number;
    durationDays: number;
    isPopular: boolean;
    yearlyPrice?: number | null;
    yearlyDurationDays?: number | null;
    hasYearlyOption?: boolean;
};

const PricingPlans = () => {
  const [plans, setPlans] = useState<TPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await apiClient.get<{ data: TPlan[] }>('/Subscription/landing');
                setPlans(res.data.data);
            } catch {
                // fallback: no plans shown
                setPlans([]);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://localhost:5078';
    const anyPlanHasYearly = plans.some(p => p.hasYearlyOption && p.yearlyPrice != null && p.yearlyPrice > 0);

    if (loading) {
        return (
            <section id='pricing-plans' className='pricing-plans py-40'>
                <Container>
                    <HeadTitle
                        title='خطط الأسعار'
                        desc='اختر الخطة التي تناسب احتياجاتك القانونية'
                        position='center'
                    />
                    <div className="flex flex-wrap mt-32 justify-center">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-full md:w-6/12 lg:w-4/12 plan">
                                <div className="plan-card animate-pulse" style={{ minHeight: 400 }} />
                            </div>
                        ))}
                    </div>
                </Container>
            </section>
        );
    }

    if (plans.length === 0) return null;

    return (
        <section id='pricing-plans' className='pricing-plans py-40'>
            <Container>
                <HeadTitle
                    title='خطط الأسعار'
                    desc='اختر الخطة التي تناسب احتياجاتك القانونية'
                    position='center'
                />
                <div className="flex flex-wrap mt-32 justify-center">
                    {anyPlanHasYearly && (
                        <div className="w-full flex justify-center mb-8">
                            <div className="flex items-center p-1.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 shadow-sm">
                                <button
                                    type="button"
                                    className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-[var(--main-color)] text-white shadow-md' : 'text-[var(--white-color)] hover:text-white'}`}
                                    onClick={() => setBillingCycle('monthly')}
                                >
                                    شهري
                                </button>
                                <button
                                    type="button"
                                    className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${billingCycle === 'yearly' ? 'bg-[var(--main-color)] text-white shadow-md' : 'text-[var(--white-color)] hover:text-white'}`}
                                    onClick={() => setBillingCycle('yearly')}
                                >
                                    سنوي
                                </button>
                            </div>
                        </div>
                    )}
                    {plans.map((plan) => {
                        const featuresList = plan.features
                            ? plan.features.split(',').map(f => f.trim()).filter(Boolean)
                            : [];
                        const isYearly = billingCycle === 'yearly' && plan.hasYearlyOption && plan.yearlyPrice != null && plan.yearlyPrice > 0;
                        const displayPrice = isYearly ? plan.yearlyPrice! : plan.price;
                        const displayLabel = isYearly ? 'ج.م سنويا' : 'ج.م شهريا';
                        const yearlySavingsPercent = plan.yearlyPrice != null && plan.yearlyPrice > 0
                            ? Math.round(((plan.price * 12 - plan.yearlyPrice) / (plan.price * 12)) * 100) : 0;

                        return (
                            <div key={plan.id} className="w-full md:w-6/12 lg:w-4/12 plan">
                                <div className={`plan-card ${plan.isPopular ? 'popular' : ''}`}>
                                    {plan.isPopular && (
                                        <span className="popular-badge" aria-label="الأكثر شعبية">الأكثر شعبية</span>
                                    )}
                                    <div className="head">
                                        <h3>{displayPrice} <sub> {displayLabel}</sub></h3>
                                        {!isYearly && plan.hasYearlyOption && plan.yearlyPrice != null && plan.yearlyPrice > 0 && (
                                            <span className="text-sm block mt-1 opacity-70">أو {plan.yearlyPrice} ج.م / سنة {yearlySavingsPercent > 0 && <span style={{ color: 'var(--success-color)' }}>وفّر {yearlySavingsPercent}%</span>}</span>
                                        )}
                                        <span>{plan.name}</span>
                                    </div>
                                    <a
                                        href={`${dashboardUrl}/auth/sign-up?plan=${plan.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="plan-btn"
                                    >
                                        اختر الخطة
                                    </a>
                                    <ul>
                                        <li>
                                            <GoCheckCircle aria-hidden="true" />
                                            {plan.aiRequestsLimit} طلب ذكاء اصطناعي
                                        </li>
                                        <li>
                                            <GoCheckCircle aria-hidden="true" />
                                            {plan.durationDays} يوم نشاط
                                        </li>
                                        {featuresList.map((feature, idx) => (
                                            <li key={idx}>
                                                <GoCheckCircle aria-hidden="true" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Container>
        </section>
    )
}

export default PricingPlans