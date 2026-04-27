import { useEffect, useState, useMemo } from"react"
import { Outlet, useLocation } from"react-router-dom"
import Sidebar from"../components/sidebar/Sidebar"
import Header from"../components/header/Header";
import { SidebarContext } from"../components/sidebar/sidebarContext";


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

 // Close mobile sidebar on route change
 useEffect(() => {
 setIsSidebarOpen(false);
 }, [location.pathname]);

 // Lock body scroll when mobile drawer is open
 useEffect(() => {
 const isMobile = typeof window !=='undefined' && window.innerWidth <= 1000;
 if (isSidebarOpen && isMobile) {
 const prev = document.body.style.overflow;
 document.body.style.overflow ='hidden';
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
 // HeroUI reads dark class from <html> — keep it in sync
 if (theme ==='dark') {
 document.documentElement.classList.add('dark');
 } else {
 document.documentElement.classList.remove('dark');
 }
 }, [theme]);

 return (
 <SidebarContext.Provider value={sidebarValue}>
 {/* Outer shell — not a landmark, just layout */}
  <div className={`flex ${theme} transition-colors duration-300 bg-[var(--bg-color)]`}>
 <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--surface-color)] focus:text-[var(--title-color)] dark:focus:bg-[#1a1d24] dark:focus:text-white focus:rounded shadow-lg">
 تخطي إلى المحتوى الرئيسي
 </a>
 <div className="sidebar-box">
 <Sidebar />
 </div>
 {/* Mobile backdrop */}
 {isSidebarOpen && (
 <button
 type="button"
 aria-label="إغلاق القائمة"
 onClick={() => setIsSidebarOpen(false)}
 className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
 style={{ display:'block' }}
 />
 )}
 <div role="main" className="outlet-box min-h-screen flex flex-col relative z-10">
 <Header theme={theme} setTheme={setTheme} />
 <div id="main-content" className="flex-grow pb-10 px-4 sm:px-10 mt-6 relative z-0">
 <Outlet />
 </div>
 <footer className="w-full text-center py-4 mt-auto border-t app-border app-text-muted text-xs sm:text-sm select-none">
 <p>محامي سمارت يقدم تكنولوجيا ذكية لتوفير وقتك، وتظل المراجعة النهائية للمسودات والمسؤولية القانونية كاملة من اختصاصك المهني.</p>
 </footer>
 </div>
 <div aria-live="polite" aria-atomic="true" className="sr-only" />
 </div>
 </SidebarContext.Provider>
 )
}

export default Layout
