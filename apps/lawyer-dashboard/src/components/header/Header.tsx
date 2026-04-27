import './Header.css';


import { HiSun, HiMenu } from "react-icons/hi";


import { Avatar } from '@heroui/react';
import { FaMoon, FaUserTie } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { IconButton } from '@mohamy/shared-ui';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../hooks/reduxHooks';
import { useSidebar } from '../sidebar/sidebarContext';

type THeader = {
    theme: 'dark' | 'light';
    setTheme: React.Dispatch<React.SetStateAction<'dark' | 'light'>>;
}

const Header = ({ theme, setTheme }: THeader) => {
    const user = useAppSelector((state) => state.auth.user);
    const { toggle } = useSidebar();

    return (
        <header className="px-4 py-3 md:px-6 md:py-4 mx-4 sm:mx-8 mt-4 md:mt-6 rounded-2xl bg-[var(--white-color)] dark:app-surface border app-border dark:app-border-strong shadow-sm transition-colors duration-300 z-40 relative flex flex-wrap items-center justify-between gap-y-3 gap-x-4">
            
            {/* Right Side (RTL): Menu + Logo */}
            <div className="flex items-center gap-3 shrink-0 order-1">
                <div className="lg:hidden flex items-center shrink-0">
                    <button
                        onClick={toggle}
                        aria-label="فتح القائمة"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--main-color)]/10 text-[var(--main-color)] hover:bg-[var(--main-color)] hover:text-white transition-colors text-sm font-bold shadow-sm"
                    >
                        <HiMenu size={20} />
                        <span>القائمة</span>
                    </button>
                </div>
                <div className="logo shrink-0">
                    <img src="/images/logo.png" alt="Mohamy Smart Logo" loading="lazy" decoding="async" className="h-9 md:h-10 w-auto object-contain" />
                </div>
            </div>

            {/* Left Side (RTL): Actions */}
            <div className="flex items-center gap-2 md:gap-3 shrink-0 order-2 md:order-3">
                <IconButton
                    icon={theme === 'light' ? <FaMoon size={15} /> : <HiSun size={17} />}
                    radius='full'
                    size='sm'
                    onclick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    variant="flat"
                    ariaLabel="تبديل المظهر"
                    className="bg-gray-100 hover:bg-gray-200 dark:bg-[#2A2A2A] dark:hover:bg-[#333]"
                />
                <Link to="/subscription" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--main-color)]/10 text-[var(--main-color)] hover:bg-[var(--main-color)] hover:text-white transition-colors font-semibold text-sm">
                    <HiSparkles size={16} />
                    <span>الباقات</span>
                </Link>
                <Link to='/settings' className="transition-opacity hover:opacity-90" aria-label="الإعدادات">
                    <Avatar
                        size='sm'
                        className="bg-[var(--main-color)] text-white shadow-sm ring-2 ring-white dark:ring-[#1A1A1A] w-8 h-8 md:w-10 md:h-10"
                        icon={<FaUserTie size={16} className="text-white" />}
                    />
                </Link>
            </div>

            {/* Center/Bottom (RTL): Greeting Text */}
            <div className="flex flex-col w-full md:w-auto md:flex-1 order-3 md:order-2 mt-1 md:mt-0 md:px-4">
                <h3 className="text-base md:text-xl font-bold text-[var(--title-color)] m-0 leading-tight">
                    مرحباً سيادة المستشار:{' '}
                    <span className="text-[var(--main-color)] dark:text-white">{user?.fullName || 'المستخدم'}</span>
                </h3>
                <p className="text-xs md:text-sm text-[var(--text-color)] mt-1 opacity-80 font-medium max-w-xl hidden sm:block m-0">
                    مساعدك الذكي بيرتبلك الشغل.. بس متنساش تراجع وراه، القرار النهائي دايماً لك
                </p>
            </div>
            
        </header>
    );
};

export default Header;