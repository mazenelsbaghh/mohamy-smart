import'./Sidebar.css';
import { memo, useEffect, useState } from'react';

import { IoGrid } from"react-icons/io5";
import { GoLaw } from"react-icons/go";
import { FaBookOpen, FaUsers } from"react-icons/fa";
import { IoDocumentText } from"react-icons/io5";
import { FaCalendarDays, FaScaleBalanced } from"react-icons/fa6";
import { BsChatTextFill } from"react-icons/bs";
import { NavLink } from'react-router-dom';
import { IoSettings } from"react-icons/io5";
import { LuLogOut } from"react-icons/lu";

import { motion } from"framer-motion";
import { useAppDispatch } from'../../hooks/reduxHooks';
import thunkLogout from'../../redux/auth/thunk/thunkLogout';
import ConfirmDialog from'../common/ConfirmDialog';
import { useSidebar } from'./sidebarContext';


const Sidebar = () => {
 const [isMobile, setIsMobile] = useState<boolean>(false);
 const [isLogoutOpen, setIsLogoutOpen] = useState<boolean>(false);

 const { isOpen: ctxOpen } = useSidebar();
 // Drawer is "open" if either the context (hamburger) or the legacy drag handle says so
 const isDrawerOpen = isMobile ? ctxOpen : true;

 const dispatch = useAppDispatch();

 useEffect(() => {
 const handleResize = () => {
 setIsMobile(window.innerWidth <= 1000);
 };
 handleResize();
 let timeout: ReturnType<typeof setTimeout>;
 const debouncedResize = () => {
 clearTimeout(timeout);
 timeout = setTimeout(handleResize, 150);
 };
 window.addEventListener("resize", debouncedResize);
 return () => {
 clearTimeout(timeout);
 window.removeEventListener("resize", debouncedResize);
 };
 }, []);

 // T038: dispatch thunkLogout instead of the synchronous logOut().
 // thunkLogout calls POST /api/auth/logout to revoke the refresh token server-side
 // and expire all three cookies before redirecting to /auth/login.
 const logOutUser = () => {
 setIsLogoutOpen(true);
 };

 const confirmLogout = () => {
 setIsLogoutOpen(false);
 dispatch(thunkLogout());
 };


 return (
 <motion.aside
 initial={false}
 animate={isMobile ? { y: isDrawerOpen ? 0 :"-100%" } : { y: 0 }}
 transition={{ type:"tween", duration: 0.25, ease:"easeOut" }}
 style={isMobile ? { zIndex: 40 } : undefined}
 >
 <div className="logo">
 <img src="/images/logo.png" alt="Mohamy Smart Logo" loading="lazy" decoding="async" />
 </div>
 <nav>
 <ul>
 <li>
 <NavLink to='/'>
 <span>
 <IoGrid />
 </span>
 الصفحة الرئيسية
 </NavLink>
 </li>
 <li>
 <NavLink to='/cases'>
 <span>
 <GoLaw />
 </span>
 القضايا
 </NavLink>
 </li>
 <li>
 <NavLink to='/clients'>
 <span>
 <FaUsers />
 </span>
 الموكلين
 </NavLink>
 </li>
 <li>
 <NavLink to='/documents'>
 <span>
 <IoDocumentText />
 </span>
 المستندات
 </NavLink>
 </li>
 <li>
 <NavLink to='/legal-contracts'>
 <span>
 <FaBookOpen />
 </span>
 العقود القانونية
 </NavLink>
 </li>
 <li>
 <NavLink to='/legal-library'>
 <span>
 <FaScaleBalanced />
 </span>
 المكتبة القانونية
 </NavLink>
 </li>
 <li>
 <NavLink to='/agenda'>
 <span>
 <FaCalendarDays />
 </span>
 الأجندة
 </NavLink>
 </li>
 <li>
 <NavLink to='/chat'>
 <span>
 <BsChatTextFill />
 </span>
 المحادثة الذكية
 </NavLink>
 </li>
 {/* <li>
 <NavLink to='/aaaaaaaa'>
 <span>
 <IoNotifications />
 </span>
 الاشعارات
 </NavLink>
 </li> */}
 </ul>
 <ul className='settings'>
 <li>
 <NavLink to='/settings'>
 <span>
 <IoSettings />
 </span>
 الإعدادات
 </NavLink>
 </li>
 </ul>
 </nav>


 <div className="actions">
 {/* T038: button instead of NavLink — thunkLogout handles the redirect */}
 <button type="button" onClick={logOutUser} aria-label="تسجيل الخروج">
 <span>
 <LuLogOut />
 </span>
 تسجيل الخروج
 </button>
 </div>


 <ConfirmDialog
 isOpen={isLogoutOpen}
 onClose={() => setIsLogoutOpen(false)}
 onConfirm={confirmLogout}
 title="تسجيل الخروج"
 description="هل أنت متأكد من تسجيل الخروج؟"
 confirmText="تسجيل الخروج"
 cancelText="إلغاء"
 danger
 />
 </motion.aside>
 );
};

// Sidebar is independent of Layout's `theme` state — memoize to skip re-renders on theme toggle
export default memo(Sidebar);