import { useEffect, useState, useMemo } from'react'
import { Outlet, useLocation } from'react-router-dom'
import Sidebar from'../components/public/sidebar/Sidebar';
import Header from'../components/public/header/Header';
import { SidebarContext } from'../components/public/sidebar/sidebarContext';


const Layout = () => {
	const [theme, setTheme] = useState<'dark' |'light'>(() => {
		const saved = localStorage.getItem('theme');
		const theme = saved === 'dark' || saved === 'light' ? saved : 'light';
		if (theme ==='dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
		return theme;
	});

	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const location = useLocation();

	useEffect(() => {
		setIsSidebarOpen(false);
	}, [location.pathname]);

	useEffect(() => {
		if (isSidebarOpen) {
			const prev = document.body.style.overflow;
			document.body.style.overflow = 'hidden';
			return () => { document.body.style.overflow = prev; };
		}
	}, [isSidebarOpen]);

	const sidebarValue = useMemo(() => ({
		isOpen: isSidebarOpen,
		setIsOpen: setIsSidebarOpen,
		toggle: () => setIsSidebarOpen((v) => !v),
	}), [isSidebarOpen]);

	useEffect(() => {
		localStorage.setItem('theme', theme);
		if (theme ==='dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}, [theme]);

	return (
		<SidebarContext.Provider value={sidebarValue}>
			<main className={`flex ${theme}`} >
				<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded">
					تخطي إلى المحتوى الرئيسي
				</a>
				<div className={`sidebar-box ${isSidebarOpen ? 'open' : ''}`}>
					<Sidebar />
				</div>
				{isSidebarOpen && (
					<button
						type="button"
						aria-label="إغلاق القائمة"
						onClick={() => setIsSidebarOpen(false)}
						className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
					/>
				)}
				<div className="outlet-box">
					<Header theme={theme} setTheme={setTheme} />
					<div id="main-content">
						<Outlet />
					</div>
				</div>
				<div aria-live="polite" aria-atomic="true" className="sr-only" />
			</main>
		</SidebarContext.Provider>
	)
}

export default Layout
