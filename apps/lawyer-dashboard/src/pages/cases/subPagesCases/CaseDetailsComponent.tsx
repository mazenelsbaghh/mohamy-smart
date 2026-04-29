import { CustomCard } from'@mohamy/shared-ui';


type TCaseDetailsComponent = {
 singleCase: {
 id: number;
 title: string;
 number: string;
 caseTypeId: number,
 caseTypeName: string;
 court: string;
 clientName: string;
 apponentName: string;
 description: string;
 facts: string;
 legalClaims: string;
 status: number | string;
 clientId: string,
 creationDate: string;
 }
}

const creationDateFormatter = new Intl.DateTimeFormat('en-CA', {
 year:'numeric',
 month:'2-digit',
 day:'2-digit',
});

const CaseDetailsComponent = ({ singleCase }: TCaseDetailsComponent) => {
 return (
 <div className='flex flex-col gap-6'>
 {/* Main Info Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 <CustomCard className="border app-border shadow-sm transition-shadow">
 <h5 className="text-sm app-text-subtle mb-2">رقم القضية</h5>
 <p className="text-lg font-bold text-[var(--title-color)]">{singleCase.number}</p>
 </CustomCard>
 
 <CustomCard className="border app-border shadow-sm transition-shadow">
 <h5 className="text-sm app-text-subtle mb-2">المحكمة</h5>
 <p className="text-lg font-bold text-[var(--title-color)]">{singleCase.court}</p>
 </CustomCard>

 <CustomCard className="border app-border shadow-sm transition-shadow">
 <h5 className="text-sm app-text-subtle mb-2">نوع القضية</h5>
 <p className="text-lg font-bold text-[var(--title-color)]">{singleCase.caseTypeName}</p>
 </CustomCard>

 <CustomCard className="border app-border shadow-sm transition-shadow">
 <h5 className="text-sm app-text-subtle mb-2">اسم الموكل</h5>
 <p className="text-lg font-bold text-[var(--title-color)]">{singleCase.clientName}</p>
 </CustomCard>

 <CustomCard className="border app-border shadow-sm transition-shadow">
 <h5 className="text-sm app-text-subtle mb-2">الخصم</h5>
 <p className="text-lg font-bold text-[var(--title-color)]">{singleCase.apponentName}</p>
 </CustomCard>

 <CustomCard className="border app-border shadow-sm transition-shadow">
 <h5 className="text-sm app-text-subtle mb-2">تاريخ الإنشاء</h5>
 <p className="text-lg text-[var(--text-color)] font-medium" dir="ltr" style={{ textAlign:'right' }}>
 {creationDateFormatter.format(new Date(singleCase.creationDate)).replace(/-/g,'/')}
 </p>
 </CustomCard>
 </div>

 {/* Narratives Section */}
 <div className="grid grid-cols-1 gap-6 mt-2">
 <CustomCard className="border app-border shadow-sm">
 <div className="mb-4">
 <span className="text-xs font-semibold text-[var(--main-color)] bg-[var(--accent-soft)] px-2 py-1 rounded-md mb-2 inline-block border border-[var(--accent-soft-strong)]">ملخص</span>
 <h4 className="text-lg font-bold text-[var(--title-color)]">وصف القضية</h4>
 <p className="text-xs app-text-subtle mt-1">ملخص سريع لموضوع النزاع</p>
 </div>
 <div className="app-surface-soft p-4 rounded-lg leading-relaxed text-sm text-[var(--text-color)]">
 {singleCase.description ||'لا يوجد وصف متاح حتى الآن.'}
 </div>
 </CustomCard>

 <CustomCard className="border app-border shadow-sm">
 <div className="mb-4">
 <span className="text-xs font-semibold text-[var(--main-color)] bg-[var(--accent-soft)] px-2 py-1 rounded-md mb-2 inline-block border border-[var(--accent-soft-strong)]">الأساس</span>
 <h4 className="text-lg font-bold text-[var(--title-color)]">وقائع القضية</h4>
 <p className="text-xs app-text-subtle mt-1">سيتم الاعتماد عليها في التحليل القانوني</p>
 </div>
 <div className="app-surface-soft p-4 rounded-lg leading-loose text-sm text-[var(--text-color)] whitespace-pre-wrap">
 {singleCase.facts ||'لا توجد وقائع مسجلة حتى الآن.'}
 </div>
 </CustomCard>

 <CustomCard className="border app-border shadow-sm">
 <div className="mb-4">
 <span className="text-xs font-semibold text-[var(--main-color)] bg-[var(--accent-soft)] px-2 py-1 rounded-md mb-2 inline-block border border-[var(--accent-soft-strong)]">الطلبات</span>
 <h4 className="text-lg font-bold text-[var(--title-color)]">الطلبات القانونية</h4>
 <p className="text-xs app-text-subtle mt-1">الطلبات المطلوب تضمينها في المستند</p>
 </div>
 <div className="app-surface-soft p-4 rounded-lg leading-relaxed text-sm text-[var(--text-color)] whitespace-pre-wrap">
 {singleCase.legalClaims ||'لا توجد طلبات قانونية مسجلة حتى الآن.'}
 </div>
 </CustomCard>
 </div>
 </div>
 )
}

export default CaseDetailsComponent
