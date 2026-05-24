import './Header.css';


import { useCallback, useEffect } from 'react';
import { HiSun, HiMenu } from "react-icons/hi";


import { Avatar } from '@heroui/react';
import { FaMoon, FaUserTie } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { IconButton } from '@mohamy/shared-ui';
import { Link } from 'react-router-dom';
import { AiPointBalancePill } from '../aiPoints';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import thunkGetAiPointBalance from '../../redux/subscription/thunk/thunkGetAiPointBalance';
import { useSidebar } from '../sidebar/sidebarContext';

type THeader = {
    theme: 'dark' | 'light';
    setTheme: React.Dispatch<React.SetStateAction<'dark' | 'light'>>;
}

const Header = ({ theme, setTheme }: THeader) => {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const { aiPointBalance, loading: subscriptionLoading } = useAppSelector((state) => state.subscription);
    const { toggle } = useSidebar();

    const refreshAiPointBalance = useCallback(() => {
        if (!user || document.visibilityState === 'hidden') return;
        dispatch(thunkGetAiPointBalance({ silent: true }));
    }, [dispatch, user]);

    useEffect(() => {
        if (!user || aiPointBalance || subscriptionLoading === 'pending') return;
        dispatch(thunkGetAiPointBalance());
    }, [dispatch, user, aiPointBalance, subscriptionLoading]);

    useEffect(() => {
        if (!user) return;

        refreshAiPointBalance();
        const intervalId = window.setInterval(refreshAiPointBalance, 15000);
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') refreshAiPointBalance();
        };

        window.addEventListener('focus', refreshAiPointBalance);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener('focus', refreshAiPointBalance);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [refreshAiPointBalance, user]);

    return (
        <header className="px-4 py-3.5 md:px-6 md:py-4 mx-4 sm:mx-8 mt-4 md:mt-6 rounded-2xl bg-[var(--white-color)] dark:app-surface border app-border dark:app-border-strong shadow-sm transition-colors duration-300 z-40 relative flex flex-col lg:flex-row lg:items-center justify-between gap-y-3.5 gap-x-4">
            
            {/* Mobile Top Bar (Only visible on mobile/tablet < 1024px, hidden on desktop) */}
            <div className="flex lg:hidden justify-between items-center w-full">
                {/* Right (RTL): Menu toggle + Logo */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggle}
                        aria-label="فتح القائمة"
                        className="flex items-center justify-center p-2 rounded-xl bg-[var(--main-color)]/10 text-[var(--main-color)] hover:bg-[var(--main-color)] hover:text-white transition-colors shadow-sm"
                    >
                        <HiMenu size={22} />
                    </button>
                    <div className="flex items-center">
                        <img src="/images/logo.png" alt="Mohamy Smart Logo" loading="lazy" decoding="async" className="h-8 w-auto object-contain" />
                    </div>
                </div>

                {/* Left (RTL): Theme toggle + Avatar */}
                <div className="flex items-center gap-2">
                    <IconButton
                        icon={theme === 'light' ? <FaMoon size={14} /> : <HiSun size={16} />}
                        radius='full'
                        size='sm'
                        onclick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                        variant="flat"
                        ariaLabel="تبديل المظهر"
                        className="bg-gray-100 hover:bg-gray-200 dark:bg-[#2A2A2A] dark:hover:bg-[#333] w-9 h-9 min-w-9"
                    />
                    <Link to='/settings' className="transition-opacity hover:opacity-90" aria-label="الإعدادات">
                        <Avatar
                            size='sm'
                            className="bg-[var(--main-color)] text-white shadow-sm ring-2 ring-white dark:ring-[#1A1A1A] w-9 h-9"
                            icon={<FaUserTie size={15} className="text-white" />}
                        />
                    </Link>
                </div>
            </div>

            {/* Desktop Left Side (RTL): Actions (Only visible on lg:flex, hidden on mobile) */}
            <div className="hidden lg:flex items-center gap-3 order-3 shrink-0">
                <Link to="/subscription" className="header-ai-points-link" aria-label="عرض رصيد نقاط الذكاء الاصطناعي">
                    <AiPointBalancePill balance={aiPointBalance} />
                </Link>
                <IconButton
                    icon={theme === 'light' ? <FaMoon size={15} /> : <HiSun size={17} />}
                    radius='full'
                    size='sm'
                    onclick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    variant="flat"
                    ariaLabel="تبديل المظهر"
                    className="bg-gray-100 hover:bg-gray-200 dark:bg-[#2A2A2A] dark:hover:bg-[#333]"
                />
                <Link to="/subscription" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--main-color)]/10 text-[var(--main-color)] hover:bg-[var(--main-color)] hover:text-white transition-colors font-semibold text-sm">
                    <HiSparkles size={14} />
                    <span>الباقات</span>
                </Link>
                <Link to='/settings' className="transition-opacity hover:opacity-90" aria-label="الإعدادات">
                    <Avatar
                        size='sm'
                        className="bg-[var(--main-color)] text-white shadow-sm ring-2 ring-white dark:ring-[#1A1A1A] w-10 h-10"
                        icon={<FaUserTie size={16} className="text-white" />}
                    />
                </Link>
            </div>

            {/* Greeting Text & Mobile Actions (RTL) */}
            <div className="flex flex-col w-full lg:flex-1 order-2 mt-1 lg:mt-0 lg:px-4">
                <h3 className="text-base md:text-xl font-bold text-[var(--title-color)] m-0 leading-tight">
                    مرحباً سيادة المستشار:{' '}
                    <span className="text-[var(--main-color)] dark:text-white">{user?.fullName || 'المستخدم'}</span>
                </h3>
                <p className="text-xs md:text-sm text-[var(--text-color)] mt-1 opacity-80 font-medium max-w-xl hidden sm:block m-0">
                    مساعدك الذكي بيرتبلك الشغل.. بس متنساش تراجع وراه، القرار النهائي دايماً لك
                </p>

                {/* Mobile Actions (Pill + Packages) - Only visible on mobile/tablet < 1024px (lg breakpoint) */}
                <div className="flex lg:hidden items-center justify-between gap-3 mt-3 w-full border-t border-[var(--title-color)]/10 dark:border-white/10 pt-3">
                    <Link to="/subscription" className="header-ai-points-link flex-1" aria-label="عرض رصيد نقاط الذكاء الاصطناعي">
                        <AiPointBalancePill balance={aiPointBalance} />
                    </Link>
                    <Link to="/subscription" className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--main-color)]/10 text-[var(--main-color)] hover:bg-[var(--main-color)] hover:text-white transition-colors font-semibold text-xs min-h-[36px]">
                        <HiSparkles size={14} />
                        <span>الباقات</span>
                    </Link>
                </div>
            </div>
            
        </header>
    );
};

export default Header;
