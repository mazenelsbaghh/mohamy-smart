import './Sidebar.css';
import { useState } from 'react';
import { IoGrid, IoBarChart } from "react-icons/io5";
import { FaUsers, FaEnvelope } from "react-icons/fa";
import { FaSackDollar } from "react-icons/fa6";
import { NavLink } from 'react-router-dom';
import { IoSettings } from "react-icons/io5";
import { LuLogOut } from "react-icons/lu";
import { ImStatsDots } from 'react-icons/im';
import { VscSettings } from 'react-icons/vsc';
import { useAppDispatch } from '../../../hooks/reduxHooks';
import { thunkLogOut } from '../../../redux/auth/authSlice';
import ConfirmDialog from '../../ui/modal/ConfirmDialog';

const Sidebar = () => {
	const dispatch = useAppDispatch();
	const [isLogoutOpen, setIsLogoutOpen] = useState<boolean>(false);

	return (
		<aside>
			<div className="logo">
				<img src="/images/logo.png" alt="logo" loading="lazy" decoding="async" />
			</div>
			<nav>
				<ul>
					<li>
						<NavLink to='/'>
							<span>
								<IoGrid />
							</span>
							الصفحة الرئيسة
						</NavLink>
					</li>
					<li>
						<NavLink to='/lawyers'>
							<span>
								<FaUsers />
							</span>
							المحامين
						</NavLink>
					</li>
					<li>
						<NavLink to='/subscriptions'>
							<span>
								<FaSackDollar />
							</span>
							ادارة الاشتراكات
						</NavLink>
					</li>
					<li>
						<NavLink to='/ai-usage'>
							<span>
								<ImStatsDots />
							</span>
							تكاليف الذكاء الاصطناعي
						</NavLink>
					</li>
					<li>
						<NavLink to='/subscriptions/account-messaging'>
							<span>
								<FaEnvelope />
							</span>
							تقرير المراسلات والأمان
						</NavLink>
					</li>
					<li>
						<NavLink to='/plans-and-review'>
							<span>
								<VscSettings />
							</span>
							لوحة التحكم
						</NavLink>
					</li>
					<li>
						<NavLink to='/contact-requests'>
							<span>
								<FaUsers />
							</span>
							طلبات التواصل
						</NavLink>
					</li>
					<li>
						<NavLink to='/analytics'>
							<span>
								<IoBarChart />
							</span>
							تحليل الأداء
						</NavLink>
					</li>
				</ul>
				<ul className='settings'>
					<li>
						<NavLink to='/settings'>
							<span>
								<IoSettings />
							</span>
							الاعدادات
						</NavLink>
					</li>
				</ul>
			</nav>

			<div className="actions">
				<button onClick={() => setIsLogoutOpen(true)} aria-label="تسجيل الخروج">
					<span>
						<LuLogOut />
					</span>
					تسجيل الخروج
				</button>
			</div>

			<ConfirmDialog
				isOpen={isLogoutOpen}
				onClose={() => setIsLogoutOpen(false)}
				onConfirm={() => { setIsLogoutOpen(false); dispatch(thunkLogOut()); }}
				title="تسجيل الخروج"
				description="هل أنت متأكد من تسجيل الخروج؟"
				confirmText="تسجيل الخروج"
				cancelText="إلغاء"
				danger
			/>
		</aside>
	);
};

export default Sidebar;
