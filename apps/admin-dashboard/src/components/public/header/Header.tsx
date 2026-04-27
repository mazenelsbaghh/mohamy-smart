import'./Header.css';
import { Avatar } from'@heroui/react';
import { IconButton } from'@mohamy/shared-ui';

import { FaMoon } from'react-icons/fa';
import { IoNotifications, IoMenu } from"react-icons/io5";
import { HiSun } from"react-icons/hi";
import { useNavigate } from'react-router-dom';
import { useAppSelector } from'../../../hooks/reduxHooks';
import { useSidebar } from'../sidebar/sidebarContext';



type THeader = {
	theme:'dark' |'light';
	setTheme: React.Dispatch<React.SetStateAction<'dark' |'light'>>;
}

const Header = ({ theme, setTheme }: THeader) => {
	const navigate = useNavigate()
	const user = useAppSelector((state) => state.auth.user);
	const { toggle } = useSidebar();

	return (
		<header className="flex justify-between items-center px-6 py-4 mx-4 sm:mx-8 mt-6 rounded-2xl bg-white/60 dark:bg-[#121212]/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-300 z-40 relative flex-wrap gap-4">
		<div className='flex items-center gap-4'>
		<IconButton
			icon={<IoMenu size={20} />}
			radius='full'
			size='sm'
			onclick={toggle}
			variant="flat"
			ariaLabel="القائمة"
			className="hamburger-btn hidden bg-white/50 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10"
		/>
		<div className="logo md:hidden flex-shrink-0">
		<img src="/images/logo.png" alt="logo" loading="lazy" decoding="async" className="h-10 w-auto" />
		</div>
		<div className="flex flex-col">
		<h3 className="text-lg md:text-xl font-bold text-[var(--title-color)] m-0 leading-tight">
		مرحبًا{' '}
		<span className="text-[var(--main-color)]">{user?.fullName || 'المدير'}</span> !
		</h3>
		<p className="text-xs md:text-sm text-[var(--text-color)] mt-1 opacity-80 font-medium max-w-xl hidden sm:block m-0">
		كل قضاياك، موكليك، ومستنداتك في مكان واحد
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
			className="bg-white/50 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10"
		/>
		<IconButton
			icon={<IoNotifications size={18} />}
			radius='full'
			size='sm'
			onclick={() => navigate('/notifications')}
			variant="flat"
			ariaLabel="الإشعارات"
			className="bg-white/50 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10"
		/>
		<Avatar 
			size='md' 
			name={user?.fullName || ''} 
			className="bg-gradient-to-br from-[var(--main-color)] to-amber-600 text-white shadow-sm ring-2 ring-white dark:ring-[#161616]"
		/>
		</div>
		</header>
	);
};

export default Header;
