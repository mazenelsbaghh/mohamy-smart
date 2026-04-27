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
        <header className="flex justify-between items-center px-6 py-4 mx-4 sm:mx-8 mt-6 rounded-2xl bg-[var(--white-color)] dark:app-surface border app-border dark:app-border-strong shadow-sm transition-colors duration-300 z-40 relative flex-wrap gap-4">
            <div className='flex items-center gap-4'>
                <div className="md:hidden flex items-center gap-3 flex-shrink-0">
                    <IconButton
                        icon={<HiMenu size={22} />}
                        radius="full"
                        size="md"
                        onclick={toggle}
                        ariaLabel="فتح القائمة"
                        variant="flat"
                        className="bg-[var(--main-color)]/10 text-[var(--main-color)] hover:bg-[var(--main-color)] hover:text-white transition-colors"
                    />
                    <img src="/images/logo.png" alt="Mohamy Smart Logo" loading="lazy" decoding="async" className="h-10 w-auto" />
                </div>
                <div className="logo hidden md:block flex-shrink-0">
                    <img src="/images/logo.png" alt="Mohamy Smart Logo" loading="lazy" decoding="async" className="h-10 w-auto" />
                </div>
                <div className="flex flex-col">
                    <h3 className="text-lg md:text-xl font-bold text-[var(--title-color)] m-0 leading-tight">
                        مرحباً سيادة المستشار:{' '}
                        <span className="text-[var(--main-color)] dark:text-white">{user?.fullName || 'المستخدم'}</span>
                    </h3>
                    <p className="text-xs md:text-sm text-[var(--text-color)] mt-1 opacity-80 font-medium max-w-xl hidden sm:block m-0">
                        مساعدك الذكي بيرتبلك الشغل.. بس متنساش تراجع وراه، القرار النهائي دايماً لك
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4 shrink-0">
                <IconButton
                    icon={theme === 'light' ? <FaMoon size={16} /> : <HiSun size={18} />}
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
                        size='md'
                        className="bg-[var(--main-color)] text-white shadow-sm ring-2 ring-white dark:ring-[#1A1A1A]"
                        icon={<FaUserTie size={16} className="text-white" />}
                    />
                </Link>
            </div>
        </header>
    );
};

export default Header;