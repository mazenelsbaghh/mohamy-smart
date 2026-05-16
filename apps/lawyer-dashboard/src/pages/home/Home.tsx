import usePageTitle from '../../hooks/usePageTitle';
import { CustomCard, Container, CustomButton } from '@mohamy/shared-ui';
import './Home.css';
import HeadTitle from "../../components/headTitle/HeadTitle";

import StatsCards from '../../components/statsCards/StatsCards';

import CustomList from '../../components/ui/lists/CustomList';

import { IoArrowBack } from "react-icons/io5";
import { GoLaw } from 'react-icons/go';
import { FiCheckCircle, FiUpload, FiArrowLeft } from 'react-icons/fi';
import { FaUsers } from 'react-icons/fa';
import { LuCircleCheck, LuCircleX, LuSparkles, LuBriefcase } from 'react-icons/lu';

import { Calendar } from '@heroui/react';
import { today, getLocalTimeZone } from "@internationalized/date";
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { useEffect, useState } from 'react';
import thunkGetAllCases from '../../redux/cases/thunk/thunkGetAllCases';
import thunkGetAllClients from '../../redux/clients/thunk/thunkGetAllClients';
import { Skeleton } from 'boneyard-js/react';
import NotFoundData from '../../components/notFound/NotFoundData';
import thunkGetReports from '../../redux/reports/thunkGetReports';
import thunkGetAgendaByLawyerId from '../../redux/agenda/thunk/thunkGetAgendaByLawyerId';
import { FiRefreshCw } from 'react-icons/fi';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { sileo } from 'sileo';
import thunkGetLawyerPlan from '../../redux/subscription/thunk/thunkGetLawyerPlan';

const Home = () => {
    const dispatch = useAppDispatch();
  usePageTitle('الرئيسية');
    const { user } = useAppSelector((state) => state.auth);
    const { cases, loading: caseLoading } = useAppSelector((state) => state.cases);
    const { clients, loading: clientsLoading } = useAppSelector((state) => state.clients);
    const { reports, loading: reportsLoading } = useAppSelector((state) => state.reports);
    const { items: agendaItems, loading: agendaLoading } = useAppSelector((state) => state.agenda);

    const [selectedDate, setSelectedDate] = useState(today(getLocalTimeZone()));
    
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const paymentStatus = searchParams.get('status');
        const transactionId = searchParams.get('transactionId');
        
        if (paymentStatus) {
            if (paymentStatus === 'success') {
                sileo.success({ title: `تم الدفع وتفعيل الاشتراك بنجاح 🎉 - رقم المعاملة: ${transactionId || ''}` });
                // Force refresh lawyer plan just in case
                if (user?.profileId) {
                    dispatch(thunkGetLawyerPlan({ lawyerId: user.profileId }));
                }
            } else if (paymentStatus === 'failed') {
                sileo.error({ title: 'فشلت عملية الدفع. يرجى التأكد من بيانات البطاقة والمحاولة مرة أخرى.' });
            } else if (paymentStatus === 'error') {
                sileo.error({ title: 'حدث خطأ أثناء معالجة الدفع. يرجى التواصل مع الدعم الفني.' });
            }
            
            // Clean up URL
            navigate(location.pathname, { replace: true });
        }
    }, [searchParams, navigate, location.pathname, dispatch, user?.profileId]);

    useEffect(() => {
        if (!user) return;

        if (cases.length === 0 && caseLoading === 'idle') {
            dispatch(thunkGetAllCases({ lawyerId: user.profileId, pageNumber: 1, pageSize: 10 }));
        }

        if (clients.length === 0 && clientsLoading === 'idle') {
            dispatch(thunkGetAllClients({ lawyerId: user.profileId, pageNumber: 1, pageSize: 10 }));
        }

        if (reportsLoading === 'idle') {
            dispatch(thunkGetReports());
        }

        if (agendaLoading === 'idle') {
            dispatch(thunkGetAgendaByLawyerId({ lawyerId: user.profileId }));
        }
    }, [dispatch, user, cases.length, caseLoading, clients.length, clientsLoading, reportsLoading, agendaLoading]);

    const selectedDateString = selectedDate.toString();
    const dailyAppointments = agendaItems?.filter(item => item.date && item.date.startsWith(selectedDateString)) || [];

    return (
        <section className="home">
            <Container>
                <HeadTitle title="لوحة التحكم" />
                <div>
                    <Skeleton
                        name="home-stats"
                        className="mb-6"
                        loading={reportsLoading === 'pending' || reportsLoading === 'idle'}
                        fixture={
                            <StatsCards
                                card1={{ icon: <GoLaw />, iconColor: 'var(--main-color)', text: 'إجمالي القضايا', number: 0 }}
                                card2={{ icon: <FiCheckCircle />, iconColor: 'var(--success-color)', text: 'القضايا المفتوحة', number: 0 }}
                                card3={{ icon: <FaUsers />, iconColor: 'var(--title-color)', text: 'الموكلين', number: 0 }}
                            />
                        }
                    >
                        {reportsLoading === 'failed' ? (
                            <div className="flex flex-col items-center justify-center py-8 gap-3">
                                <p className="text-sm" style={{ color: 'var(--danger-color)' }}>تعذر تحميل الإحصائيات</p>
                                <CustomButton type="button" text="إعادة المحاولة" size="sm" radius="full" color="primary" startContent={<FiRefreshCw size={14} />} onClick={() => dispatch(thunkGetReports())} />
                            </div>
                        ) : (
                            <StatsCards
                                card1={{
                                    icon: <GoLaw />,
                                    iconColor: 'var(--main-color)',
                                    text: 'إجمالي القضايا',
                                    number: reports?.totalCases || 0,
                                }}
                                card2={{
                                    icon: <FiCheckCircle />,
                                    iconColor: 'var(--success-color)',
                                    text: 'القضايا المفتوحة',
                                    number: reports?.totalActiveCases || 0,
                                }}
                                card3={{
                                    icon: <FaUsers />,
                                    iconColor: 'var(--title-color)',
                                    text: 'الموكلين',
                                    number: reports?.totalClients || 0,
                                }}
                            />
                        )}
                    </Skeleton>

                    {/* ── Quick Start Section ── */}
                    <div className="quick-start-section">
                        <div className="quick-start-header">
                            <div className="quick-start-header-text">
                                <h3>ابدأ قضيتك الآن</h3>
                                <p>ارفع المستندات — وسنجهزها لك تلقائيًا بالذكاء الاصطناعي</p>
                            </div>
                            <CustomButton
                                type="button"
                                text="ارفع مستند وابدأ"
                                color="primary"
                                radius="full"
                                size="lg"
                                startContent={<FiUpload size={18} />}
                                onClick={() => navigate('/documents')}
                            />
                        </div>

                        <div className="quick-start-steps">
                            {/* Connecting line */}
                            <div className="quick-start-connector" />

                            {/* Step 1 */}
                            <div
                                className="quick-start-step"
                                onClick={() => navigate('/documents')}
                            >
                                <div className="step-number">١</div>
                                <div className="step-icon-wrapper step-icon--upload">
                                    <FiUpload size={24} />
                                </div>
                                <div className="step-content">
                                    <h4>ارفع المستندات</h4>
                                    <p>صور أو PDF لأي مستند قانوني</p>
                                </div>
                                <FiArrowLeft className="step-arrow" />
                            </div>

                            {/* Step 2 */}
                            <div
                                className="quick-start-step"
                                onClick={() => navigate('/documents')}
                            >
                                <div className="step-number">٢</div>
                                <div className="step-icon-wrapper step-icon--case">
                                    <LuBriefcase size={24} />
                                </div>
                                <div className="step-content">
                                    <h4>أنشئ القضية</h4>
                                    <p>نستخرج البيانات تلقائيًا من المستند</p>
                                </div>
                                <FiArrowLeft className="step-arrow" />
                            </div>

                            {/* Step 3 */}
                            <div
                                className="quick-start-step"
                                onClick={() => navigate('/cases')}
                            >
                                <div className="step-number">٣</div>
                                <div className="step-icon-wrapper step-icon--ai">
                                    <LuSparkles size={24} />
                                </div>
                                <div className="step-content">
                                    <h4>ابدأ العمل بالذكاء الاصطناعي</h4>
                                    <p>مذكرة دفاع، صحيفة دعوى، طعن بالنقض...</p>
                                </div>
                                <FiArrowLeft className="step-arrow" />
                            </div>
                        </div>
                    </div>

                    <section className="home-training-video" aria-labelledby="home-training-video-title">
                        <div className="home-training-video__content">
                            <span className="home-training-video__eyebrow">شرح المنصة</span>
                            <h3 id="home-training-video-title">شاهد الجولة الكاملة لمحامي سمارت</h3>
                            <p>الفيديو يشرح التسجيل، القوائم، المحادثة الذكية، الأجندة، رفع المستندات، تحليل القضايا، الموكلين، العقود، والمكتبة القانونية.</p>
                        </div>
                        <div className="home-training-video__player">
                            <iframe
                                src="https://www.youtube.com/embed/RLO_qRNAu0s?rel=0&modestbranding=1"
                                title="شرح منصة محامي سمارت"
                                loading="lazy"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            />
                        </div>
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            {/* Cases */}
                            <CustomCard>
                                <div className="head">
                                    <h3>إدارة القضايا الجارية</h3>
                                    <div className="icon">
                                        <IoArrowBack />
                                    </div>
                                </div>

                                <Skeleton
                                    name="home-cases-list"
                                    loading={caseLoading === 'pending' || caseLoading === 'idle'}
                                    fixture={
                                        <CustomList>
                                            <ul>
                                                {[1, 2, 3].map(i => (
                                                    <li key={i}>
                                                        <div className='text'><p className="title">عنوان قضية تجريبي</p><p className="subtitle"><strong>النوع : </strong>مدني</p></div>
                                                        <span className="flex items-center gap-1 text-sm font-bold"><LuCircleCheck size={14} color="var(--success-color)" />متداولة</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CustomList>
                                    }
                                >
                                    {caseLoading === 'failed' && (
                                        <div className="flex flex-col items-center justify-center py-6 gap-3">
                                            <p className="text-sm" style={{ color: 'var(--danger-color)' }}>تعذر تحميل القضايا</p>
                                            <CustomButton type="button" text="إعادة المحاولة" size="sm" radius="full" color="primary" startContent={<FiRefreshCw size={14} />} onClick={() => user && dispatch(thunkGetAllCases({ lawyerId: user.profileId, pageNumber: 1, pageSize: 10 }))} />
                                        </div>
                                    )}

                                    {cases && caseLoading === 'succeeded' && (
                                        <CustomList>
                                            <ul>
                                                {cases.map((item) => (
                                                    <li key={item.id}>
                                                        <div className='text'>
                                                            <p className="title">{item.title}</p>
                                                            <p className="subtitle"><strong>النوع : </strong>{item.caseTypeName}</p>
                                                        </div>
                                                        <span className="flex items-center gap-1 text-sm font-bold">{item.status === 0 || item.status === 'Open' ? <><LuCircleCheck size={14} color="var(--success-color)" />متداولة</> : <><LuCircleX size={14} color="var(--danger-color)" />منتهية</>}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CustomList>
                                    )}
                                    {cases.length < 1 && caseLoading === 'succeeded' && (
                                        <NotFoundData text='قائمة القضايا فارغة' />
                                    )}
                                </Skeleton>

                            </CustomCard>
                            {/* Clients */}
                            <CustomCard>
                                <div className="head">
                                    <h3>إدارة الموكلين</h3>
                                    <div className="icon">
                                        <IoArrowBack />
                                    </div>
                                </div>
                                <Skeleton
                                    name="home-clients-list"
                                    loading={clientsLoading === 'pending' || clientsLoading === 'idle'}
                                    fixture={
                                        <CustomList>
                                            <ul>
                                                {[1, 2, 3].map(i => (
                                                    <li key={i}>
                                                        <div className="text"><p className="title">اسم موكل تجريبي</p></div>
                                                        <span>موكل حالي</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CustomList>
                                    }
                                >
                                    {clientsLoading === 'failed' && (
                                        <div className="flex flex-col items-center justify-center py-6 gap-3">
                                            <p className="text-sm" style={{ color: 'var(--danger-color)' }}>تعذر تحميل الموكلين</p>
                                            <CustomButton type="button" text="إعادة المحاولة" size="sm" radius="full" color="primary" startContent={<FiRefreshCw size={14} />} onClick={() => user && dispatch(thunkGetAllClients({ lawyerId: user.profileId, pageNumber: 1, pageSize: 10 }))} />
                                        </div>
                                    )}
                                    {clients && clientsLoading === 'succeeded' && (
                                        <CustomList>
                                            <ul>
                                                {clients.map((client) => (
                                                    <li key={client.id}>
                                                        <div className="text">
                                                            <p className="title">{client.clientName}</p>
                                                        </div>
                                                        <span>موكل حالي</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CustomList>
                                    )}
                                    {clients.length < 1 && clientsLoading === 'succeeded' && (
                                        <NotFoundData text='قائمة الموكلين فارغة' />
                                    )}
                                </Skeleton>
                            </CustomCard>
                        </div>

                        <div className="lg:col-span-1">

                            <div className="calendar-container">
                                <Calendar
                                    className='calendar-box w-full'
                                    aria-label="Date (Selection)"
                                    value={selectedDate}
                                    onChange={setSelectedDate}
                                />

                                <div className="today-appointments mt-8">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3>مواعيد اليوم</h3>
                                        <Link to='/agenda'>عرض الكل</Link>
                                    </div>

                                    <Skeleton
                                        name="home-agenda"
                                        loading={agendaLoading === 'pending' || agendaLoading === 'idle'}
                                        fixture={
                                            <div className="flex flex-col gap-4">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="appointment-card flex justify-between items-center">
                                                        <div className='flex items-center gap-4'>
                                                            <div className="avatar"><FaUsers /></div>
                                                            <div className="text"><p className="title">12:00 PM</p><p>موعد تجريبي</p></div>
                                                        </div>
                                                        <span></span>
                                                    </div>
                                                ))}
                                            </div>
                                        }
                                    >
                                        {agendaLoading === 'failed' && (
                                            <div className="flex flex-col items-center justify-center py-6 gap-3">
                                                <p className="text-sm" style={{ color: 'var(--danger-color)' }}>تعذر تحميل المواعيد</p>
                                                <CustomButton type="button" text="إعادة المحاولة" size="sm" radius="full" color="primary" startContent={<FiRefreshCw size={14} />} onClick={() => user && dispatch(thunkGetAgendaByLawyerId({ lawyerId: user.profileId }))} />
                                            </div>
                                        )}

                                        {agendaLoading === 'succeeded' && dailyAppointments.length === 0 && (
                                            <NotFoundData text='لا توجد مواعيد في هذا اليوم' />
                                        )}

                                        {agendaLoading === 'succeeded' && dailyAppointments.length > 0 && (
                                            <div className="flex flex-col gap-4">
                                                {dailyAppointments.map((app) => (
                                                    <div key={app.id} className="appointment-card flex justify-between items-center">
                                                        <div className='flex items-center gap-4'>
                                                            <div className="avatar">
                                                                <FaUsers />
                                                            </div>
                                                            <div className="text">
                                                                <p className="title">
                                                                    {new Date(app.date).toLocaleTimeString('en-US', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                        hour12: true
                                                                    })}
                                                                </p>
                                                                <p>{app.title}</p>
                                                            </div>
                                                        </div>
                                                        <span></span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </Skeleton>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default Home;
