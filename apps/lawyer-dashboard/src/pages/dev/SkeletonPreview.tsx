/**
 * Dev-only skeleton preview page for Boneyard CLI capture.
 * This page renders all skeleton-wrapped components with mock data
 * so `npx boneyard-js build` can snapshot them without auth.
 * 
 * ⚠️ Only available in development mode.
 */
import { Skeleton } from 'boneyard-js/react';
import { CustomCard } from '@mohamy/shared-ui';
import StatsCards from '../../components/statsCards/StatsCards';
import StatsCard from '../../components/statsCards/StatsCard';
import CustomList from '../../components/ui/lists/CustomList';
import { CustomButton, tableClassNames } from '@mohamy/shared-ui';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react';
import { GoLaw } from 'react-icons/go';
import { FiCheckCircle } from 'react-icons/fi';
import { FaUsers } from 'react-icons/fa';
import { LuCircleCheck } from 'react-icons/lu';
import { MdOutlineStars } from 'react-icons/md';

const SkeletonPreview = () => {
    if (import.meta.env.PROD) return null;

    return (
        <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh', direction: 'rtl' }}>
            <h1 style={{ marginBottom: 24, fontSize: 20, fontWeight: 700 }}>🦴 Boneyard Skeleton Preview</h1>

            {/* 1. home-stats */}
            <section style={{ marginBottom: 32 }}>
                <h2 style={{ marginBottom: 12 }}>home-stats</h2>
                <Skeleton name="home-stats" loading={false} fixture={<StatsCards card1={{ icon: <GoLaw />, iconColor: 'var(--main-color)', text: 'إجمالي القضايا', number: 42 }} card2={{ icon: <FiCheckCircle />, iconColor: 'var(--success-color)', text: 'القضايا المفتوحة', number: 18 }} card3={{ icon: <FaUsers />, iconColor: '#8B5CF6', text: 'الموكلين', number: 25 }} />}>
                    <StatsCards card1={{ icon: <GoLaw />, iconColor: 'var(--main-color)', text: 'إجمالي القضايا', number: 42 }} card2={{ icon: <FiCheckCircle />, iconColor: 'var(--success-color)', text: 'القضايا المفتوحة', number: 18 }} card3={{ icon: <FaUsers />, iconColor: '#8B5CF6', text: 'الموكلين', number: 25 }} />
                </Skeleton>
            </section>

            {/* 2. cases-stats */}
            <section style={{ marginBottom: 32 }}>
                <h2 style={{ marginBottom: 12 }}>cases-stats</h2>
                <Skeleton name="cases-stats" loading={false} fixture={<StatsCards card1={{ icon: <GoLaw />, iconColor: 'var(--main-color)', text: 'إجمالي القضايا', number: 0 }} card2={{ icon: <FiCheckCircle />, iconColor: 'var(--success-color)', text: 'قضايا متداولة', number: 0 }} card3={{ icon: <FiCheckCircle />, iconColor: '#8B5CF6', text: 'القضايا المنتهية', number: 0 }} />}>
                    <StatsCards card1={{ icon: <GoLaw />, iconColor: 'var(--main-color)', text: 'إجمالي القضايا', number: 0 }} card2={{ icon: <FiCheckCircle />, iconColor: 'var(--success-color)', text: 'قضايا متداولة', number: 0 }} card3={{ icon: <FiCheckCircle />, iconColor: '#8B5CF6', text: 'القضايا المنتهية', number: 0 }} />
                </Skeleton>
            </section>

            {/* 3. cases-table */}
            <section style={{ marginBottom: 32 }}>
                <h2 style={{ marginBottom: 12 }}>cases-table</h2>
                <div className="w-full">
                    <Skeleton name="cases-table" loading={false} fixture={
                        <Table aria-label="جدول القضايا" color="primary" selectionMode="single" classNames={tableClassNames}>
                            <TableHeader>
                                <TableColumn>رقم القضية</TableColumn><TableColumn>عنوان القضية</TableColumn><TableColumn>الحالة</TableColumn><TableColumn>المحكمة</TableColumn><TableColumn>تاريخ الإنشاء</TableColumn><TableColumn>الإجراءات</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <TableRow key={i}>
                                        <TableCell><span className="font-semibold text-transparent">12345</span></TableCell>
                                        <TableCell><div><span className="block font-semibold text-transparent">عنوان قضية تجريبي</span><span className="block text-xs text-transparent">نوع القضية</span></div></TableCell>
                                        <TableCell><span className="case-status-badge text-transparent">متداولة</span></TableCell>
                                        <TableCell><span className="font-medium text-transparent">محكمة الإسكندرية</span></TableCell>
                                        <TableCell><span className="font-medium text-transparent">2026/04/25</span></TableCell>
                                        <TableCell><CustomButton type="button" text="عرض التفاصيل" size="sm" color="primary" radius="md" /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    }>
                        <Table aria-label="جدول القضايا" color="primary" selectionMode="single" classNames={tableClassNames}>
                            <TableHeader>
                                <TableColumn>رقم القضية</TableColumn><TableColumn>عنوان القضية</TableColumn><TableColumn>الحالة</TableColumn><TableColumn>المحكمة</TableColumn><TableColumn>تاريخ الإنشاء</TableColumn><TableColumn>الإجراءات</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <TableRow key={i}>
                                        <TableCell><span className="font-semibold text-transparent">12345</span></TableCell>
                                        <TableCell><div><span className="block font-semibold text-transparent">عنوان قضية تجريبي</span><span className="block text-xs text-transparent">نوع القضية</span></div></TableCell>
                                        <TableCell><span className="case-status-badge text-transparent">متداولة</span></TableCell>
                                        <TableCell><span className="font-medium text-transparent">محكمة الإسكندرية</span></TableCell>
                                        <TableCell><span className="font-medium text-transparent">2026/04/25</span></TableCell>
                                        <TableCell><CustomButton type="button" text="عرض التفاصيل" size="sm" color="primary" radius="md" /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Skeleton>
                </div>
            </section>

            {/* 4. clients-stats */}
            <section style={{ marginBottom: 32 }}>
                <h2 style={{ marginBottom: 12 }}>clients-stats</h2>
                <Skeleton name="clients-stats" loading={false} fixture={
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <StatsCard icon={<FaUsers />} iconColor="var(--main-color)" text="إجمالي الموكلين" number={0} />
                        <StatsCard icon={<MdOutlineStars />} iconColor="var(--success-color)" text="موكلون نشطون" number={0} />
                    </div>
                }>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <StatsCard icon={<FaUsers />} iconColor="var(--main-color)" text="إجمالي الموكلين" number={0} />
                        <StatsCard icon={<MdOutlineStars />} iconColor="var(--success-color)" text="موكلون نشطون" number={0} />
                    </div>
                </Skeleton>
            </section>

            {/* 5. clients-table */}
            <section style={{ marginBottom: 32 }}>
                <h2 style={{ marginBottom: 12 }}>clients-table</h2>
                <div className="w-full">
                    <Skeleton name="clients-table" loading={false} fixture={
                        <Table aria-label="جدول الموكلين" color="primary" selectionMode="single" classNames={tableClassNames}>
                            <TableHeader>
                                <TableColumn>الموكل</TableColumn><TableColumn>الحالة</TableColumn><TableColumn>القضايا</TableColumn><TableColumn>تاريخ الانضمام</TableColumn><TableColumn>الإجراءات</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <TableRow key={i}>
                                        <TableCell><div className="flex items-center gap-3"><div className="client-avatar small" style={{ backgroundColor: '#e5e7eb' }}>م</div><div><span className="block font-semibold text-transparent">اسم موكل تجريبي</span><span className="block text-xs text-transparent">0123456789</span></div></div></TableCell>
                                        <TableCell><span className="client-badge text-transparent">موكل نشط</span></TableCell>
                                        <TableCell><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gray-300"></span><span className="text-sm font-medium text-transparent">مرتبط بقضية</span></div></TableCell>
                                        <TableCell><span className="font-medium text-transparent">2026/04/25</span></TableCell>
                                        <TableCell><CustomButton type="button" text="عرض التفاصيل" size="sm" color="primary" radius="md" /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    }>
                        <Table aria-label="جدول الموكلين" color="primary" selectionMode="single" classNames={tableClassNames}>
                            <TableHeader>
                                <TableColumn>الموكل</TableColumn><TableColumn>الحالة</TableColumn><TableColumn>القضايا</TableColumn><TableColumn>تاريخ الانضمام</TableColumn><TableColumn>الإجراءات</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <TableRow key={i}>
                                        <TableCell><div className="flex items-center gap-3"><div className="client-avatar small" style={{ backgroundColor: '#e5e7eb' }}>م</div><div><span className="block font-semibold text-transparent">اسم موكل تجريبي</span><span className="block text-xs text-transparent">0123456789</span></div></div></TableCell>
                                        <TableCell><span className="client-badge text-transparent">موكل نشط</span></TableCell>
                                        <TableCell><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gray-300"></span><span className="text-sm font-medium text-transparent">مرتبط بقضية</span></div></TableCell>
                                        <TableCell><span className="font-medium text-transparent">2026/04/25</span></TableCell>
                                        <TableCell><CustomButton type="button" text="عرض التفاصيل" size="sm" color="primary" radius="md" /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Skeleton>
                </div>
            </section>

            {/* 6. home-cases-list */}
            <section style={{ marginBottom: 32 }}>
                <h2 style={{ marginBottom: 12 }}>home-cases-list</h2>
                <CustomCard>
                    <div className="head"><h3>إدارة القضايا الجارية</h3></div>
                    <Skeleton name="home-cases-list" loading={false} fixture={
                        <CustomList>
                            <ul>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <li key={i}><div className='text'><h4>قضية رقم {i} — نزاع مدني</h4><h6><strong>النوع : </strong>مدني</h6></div><span className="flex items-center gap-1 text-sm font-bold"><LuCircleCheck size={14} color="var(--success-color)" />متداولة</span></li>
                                ))}
                            </ul>
                        </CustomList>
                    }>
                        <CustomList>
                            <ul>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <li key={i}><div className='text'><h4>قضية رقم {i} — نزاع مدني</h4><h6><strong>النوع : </strong>مدني</h6></div><span className="flex items-center gap-1 text-sm font-bold"><LuCircleCheck size={14} color="var(--success-color)" />متداولة</span></li>
                                ))}
                            </ul>
                        </CustomList>
                    </Skeleton>
                </CustomCard>
            </section>

            {/* 7. home-clients-list */}
            <section style={{ marginBottom: 32 }}>
                <h2 style={{ marginBottom: 12 }}>home-clients-list</h2>
                <CustomCard>
                    <div className="head"><h3>إدارة الموكلين</h3></div>
                    <Skeleton name="home-clients-list" loading={false} fixture={
                        <CustomList>
                            <ul>
                                {['أحمد محمد', 'سارة علي', 'خالد حسن'].map((name, i) => (
                                    <li key={i}><div className="text"><h4>{name}</h4></div><span>موكل حالي</span></li>
                                ))}
                            </ul>
                        </CustomList>
                    }>
                        <CustomList>
                            <ul>
                                {['أحمد محمد', 'سارة علي', 'خالد حسن'].map((name, i) => (
                                    <li key={i}><div className="text"><h4>{name}</h4></div><span>موكل حالي</span></li>
                                ))}
                            </ul>
                        </CustomList>
                    </Skeleton>
                </CustomCard>
            </section>

            {/* 8. home-agenda */}
            <section style={{ marginBottom: 32 }}>
                <h2 style={{ marginBottom: 12 }}>home-agenda</h2>
                <Skeleton name="home-agenda" loading={false} fixture={
                    <div>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="appointment-card flex justify-between items-center mb-5" style={{ padding: 12, border: '1px solid #eee', borderRadius: 8, marginBottom: 8 }}>
                                <div className='flex items-center gap-4'>
                                    <div className="avatar" style={{ width: 40, height: 40, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaUsers /></div>
                                    <div className="text"><h4>0{i}:00 PM</h4><p>جلسة قضية رقم {i}</p></div>
                                </div>
                            </div>
                        ))}
                    </div>
                }>
                    <div>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="appointment-card flex justify-between items-center mb-5" style={{ padding: 12, border: '1px solid #eee', borderRadius: 8, marginBottom: 8 }}>
                                <div className='flex items-center gap-4'>
                                    <div className="avatar" style={{ width: 40, height: 40, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaUsers /></div>
                                    <div className="text"><h4>0{i}:00 PM</h4><p>جلسة قضية رقم {i}</p></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Skeleton>
            </section>
        </div>
    );
};

export default SkeletonPreview;
