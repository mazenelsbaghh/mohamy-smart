import { useState, useMemo, useCallback, useEffect } from 'react';
import { IoAlertCircleOutline, IoSparklesOutline, IoClose, IoShieldCheckmarkOutline } from 'react-icons/io5';
import { LuCheck, LuChevronDown, LuChevronUp } from 'react-icons/lu';

type TDefense = {
 id: string;
 defenseTitle: string;
 basisFromCase: string;
 scope: string;
 strength: 'Strong' | 'Medium' | 'Weak';
};

type TFinalPrayer = {
 id: string;
 requestLevel: string;
 requestText: string;
};

type MemoConfirmModalProps = {
 isOpen: boolean;
 onClose: () => void;
 onConfirm: (selectedDefenseIds: string[], selectedRequestIds: string[]) => void;
 defensesFormal: TDefense[];
 defensesSubstantive: TDefense[];
 defensesEvidentiary: TDefense[];
 explanationsCache: Record<string, unknown>;
 finalRequests: TFinalPrayer[];
 isLoading?: boolean;
};

const MemoConfirmModal = ({
 isOpen,
 onClose,
 onConfirm,
 defensesFormal,
 defensesSubstantive,
 defensesEvidentiary,
 explanationsCache,
 finalRequests,
 isLoading = false,
}: MemoConfirmModalProps) => {
 const [defensesExpanded, setDefensesExpanded] = useState(true);
 const [requestsExpanded, setRequestsExpanded] = useState(true);

 const allDefenses = useMemo(() => {
  const enrich = (items: TDefense[], category: string, tone: 'formal' | 'substantive' | 'evidentiary') =>
   items.map(d => ({ ...d, category, tone }));
  return [
   ...enrich(defensesFormal || [], 'دفع شكلي', 'formal'),
   ...enrich(defensesSubstantive || [], 'دفع موضوعي', 'substantive'),
   ...enrich(defensesEvidentiary || [], 'دفع متعلق بالأدلة', 'evidentiary'),
  ];
 }, [defensesFormal, defensesSubstantive, defensesEvidentiary]);

 const approvedIds = useMemo(
  () => allDefenses.filter(d => explanationsCache[d.id]).map(d => d.id),
  [allDefenses, explanationsCache]
 );

 const unapprovedIds = useMemo(
  () => allDefenses.filter(d => !explanationsCache[d.id]).map(d => d.id),
  [allDefenses, explanationsCache]
 );

 const [selectedDefenseIds, setSelectedDefenseIds] = useState<Set<string>>(new Set(approvedIds));
 const [selectedRequestIds, setSelectedRequestIds] = useState<Set<string>>(
  new Set(finalRequests.map(r => r.id))
 );

 // Re-sync when modal opens
 useEffect(() => {
  if (isOpen) {
   setSelectedDefenseIds(new Set(approvedIds));
   setSelectedRequestIds(new Set(finalRequests.map(r => r.id)));
  }
 }, [isOpen, approvedIds, finalRequests]);

 const toggleDefense = useCallback((id: string) => {
  setSelectedDefenseIds(prev => {
   const next = new Set(prev);
   if (next.has(id)) next.delete(id);
   else next.add(id);
   return next;
  });
 }, []);

 const toggleRequest = useCallback((id: string) => {
  setSelectedRequestIds(prev => {
   const next = new Set(prev);
   if (next.has(id)) next.delete(id);
   else next.add(id);
   return next;
  });
 }, []);

 const toggleAllDefenses = useCallback(() => {
  setSelectedDefenseIds(prev => {
   const allSelected = allDefenses.every(d => prev.has(d.id));
   return allSelected ? new Set<string>() : new Set(allDefenses.map(d => d.id));
  });
 }, [allDefenses]);

 const toggleAllRequests = useCallback(() => {
  setSelectedRequestIds(prev => {
   const allSelected = finalRequests.every(r => prev.has(r.id));
   return allSelected ? new Set<string>() : new Set(finalRequests.map(r => r.id));
  });
 }, [finalRequests]);

 const selectedApprovedCount = approvedIds.filter(id => selectedDefenseIds.has(id)).length;
 const selectedUnapprovedCount = unapprovedIds.filter(id => selectedDefenseIds.has(id)).length;
 const hasUnapprovedSelected = selectedUnapprovedCount > 0;
 const canConfirm = selectedDefenseIds.size > 0 && selectedRequestIds.size > 0 && !hasUnapprovedSelected;

 const handleConfirm = useCallback(() => {
  onConfirm(
   Array.from(selectedDefenseIds),
   Array.from(selectedRequestIds)
  );
 }, [onConfirm, selectedDefenseIds, selectedRequestIds]);

 if (!isOpen) return null;

 const categoryBadge = (tone: string) => {
  switch (tone) {
   case 'formal': return 'bg-[var(--info-soft)] dark:bg-blue-950/40 text-[var(--blue-color)] dark:text-blue-300 border-blue-100 dark:border-blue-800/50';
   case 'substantive': return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800/50';
   case 'evidentiary': return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800/50';
   default: return '';
  }
 };

 return (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" dir="rtl">
   {/* Backdrop */}
   <div className="absolute inset-0 bg-[#1b1b1b]/50 dark:bg-[#0a0a0a]/70 backdrop-blur-sm" onClick={onClose} />

   {/* Modal */}
   <div className="relative w-full max-w-2xl max-h-[90vh] bg-[var(--white-color)] dark:bg-[var(--surface-color)] border app-border dark:app-border-strong rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-[modalSlideUp_0.3s_ease-out]">
    {/* Header */}
    <div className="flex items-center justify-between p-6 pb-4 border-b app-border dark:app-border-strong">
     <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-2xl bg-[var(--main-color)]/10 flex items-center justify-center">
       <IoShieldCheckmarkOutline className="text-xl text-[var(--main-color)]" />
      </div>
      <div>
       <h2 className="text-lg font-black text-[var(--title-color)]">تأكيد محتوى المذكرة</h2>
       <p className="text-xs text-[var(--text-color)] mt-0.5">راجع واختر الدفوع والطلبات التي ستدخل في المذكرة النهائية</p>
      </div>
     </div>
     <button
      onClick={onClose}
      className="p-2 rounded-xl hover:bg-[#1b1b1b]/5 dark:hover:bg-white/10 transition-colors"
     >
      <IoClose className="text-xl text-[var(--text-color)]" />
     </button>
    </div>

    {/* Body - Scrollable */}
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

     {/* ═══ Defenses Section ═══ */}
     <div>
      <button
       onClick={() => setDefensesExpanded(!defensesExpanded)}
       className="flex items-center justify-between w-full mb-3"
      >
       <div className="flex items-center gap-2">
        <div className="w-1 h-5 rounded-full bg-[var(--main-color)]" />
        <h3 className="text-sm font-black text-[var(--title-color)]">
         الدفوع ({selectedDefenseIds.size}/{allDefenses.length})
        </h3>
        {unapprovedIds.length > 0 && (
         <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
          {unapprovedIds.length} غير محلل
         </span>
        )}
       </div>
       <div className="flex items-center gap-2">
        <button
         type="button"
         onClick={(e) => { e.stopPropagation(); toggleAllDefenses(); }}
         className="text-[11px] font-bold text-[var(--main-color)] hover:underline"
        >
         {allDefenses.every(d => selectedDefenseIds.has(d.id)) ? 'إلغاء الكل' : 'تحديد الكل'}
        </button>
        {defensesExpanded ? <LuChevronUp className="text-[var(--text-color)]" /> : <LuChevronDown className="text-[var(--text-color)]" />}
       </div>
      </button>

      {defensesExpanded && (
       <div className="flex flex-col gap-2">
        {/* Approved defenses */}
        {allDefenses.filter(d => explanationsCache[d.id]).map(d => {
         const isSelected = selectedDefenseIds.has(d.id);
         return (
          <div
           key={d.id}
           onClick={() => toggleDefense(d.id)}
           className={`flex items-start gap-3 p-3.5 rounded-xl cursor-pointer transition-all border ${
            isSelected
             ? 'border-[var(--main-color)] bg-orange-50/40 dark:bg-orange-950/20 shadow-sm'
             : 'app-border dark:app-border-strong bg-[var(--surface-muted)] dark:bg-[var(--surface-muted)] hover:border-[var(--main-color)]/50'
           }`}
          >
           <div className={`w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
            isSelected
             ? 'bg-[var(--main-color)] border-[var(--main-color)] text-white'
             : 'border-[var(--border-strong)]'
           }`}>
            {isSelected && (
             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
             </svg>
            )}
           </div>
           <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
             <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${categoryBadge((d as { tone: string }).tone)}`}>
              {(d as { category: string }).category}
             </span>
             <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--success-soft)] dark:bg-green-950/40 text-[var(--success-color)] dark:text-green-300 border border-green-200/50 dark:border-green-800/50 flex items-center gap-1">
              <LuCheck size={9} /> محلل
             </span>
            </div>
            <h4 className="text-sm font-bold text-[var(--title-color)] leading-snug">{d.defenseTitle}</h4>
            <p className="text-xs text-[var(--text-color)] mt-1 leading-relaxed line-clamp-2">{d.basisFromCase}</p>
           </div>
          </div>
         );
        })}

        {/* Separator if there are unapproved */}
        {unapprovedIds.length > 0 && approvedIds.length > 0 && (
         <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-amber-200 dark:bg-amber-800/50" />
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 whitespace-nowrap">
           <IoAlertCircleOutline size={14} />
           دفوع لم يتم تحليلها بعد
          </span>
          <div className="flex-1 h-px bg-amber-200 dark:bg-amber-800/50" />
         </div>
        )}

        {/* Unapproved defenses */}
        {allDefenses.filter(d => !explanationsCache[d.id]).map(d => {
         const isSelected = selectedDefenseIds.has(d.id);
         return (
          <div
           key={d.id}
           onClick={() => toggleDefense(d.id)}
           className={`flex items-start gap-3 p-3.5 rounded-xl cursor-pointer transition-all border border-dashed ${
            isSelected
             ? 'border-amber-400 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-950/20'
             : 'border-[var(--border-color)] dark:border-[var(--border-color)] bg-[var(--surface-muted)] dark:bg-[var(--surface-muted)] opacity-70 hover:opacity-100'
           }`}
          >
           <div className={`w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
            isSelected
             ? 'bg-amber-500 border-amber-500 text-white'
             : 'border-[var(--border-strong)]'
           }`}>
            {isSelected && (
             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
             </svg>
            )}
           </div>
           <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
             <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${categoryBadge((d as { tone: string }).tone)}`}>
              {(d as { category: string }).category}
             </span>
             <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 flex items-center gap-1">
              <IoAlertCircleOutline size={9} /> غير محلل
             </span>
            </div>
            <h4 className="text-sm font-bold text-[var(--title-color)] leading-snug">{d.defenseTitle}</h4>
            <p className="text-xs text-[var(--text-color)] mt-1 leading-relaxed line-clamp-2">{d.basisFromCase}</p>
           </div>
          </div>
         );
        })}
       </div>
      )}
     </div>

     {/* ═══ Final Requests Section ═══ */}
     {finalRequests.length > 0 && (
      <div>
       <button
        onClick={() => setRequestsExpanded(!requestsExpanded)}
        className="flex items-center justify-between w-full mb-3"
       >
        <div className="flex items-center gap-2">
         <div className="w-1 h-5 rounded-full bg-[var(--main-color)]" />
         <h3 className="text-sm font-black text-[var(--title-color)]">
          الطلبات الختامية ({selectedRequestIds.size}/{finalRequests.length})
         </h3>
        </div>
        <div className="flex items-center gap-2">
         <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toggleAllRequests(); }}
          className="text-[11px] font-bold text-[var(--main-color)] hover:underline"
         >
          {finalRequests.every(r => selectedRequestIds.has(r.id)) ? 'إلغاء الكل' : 'تحديد الكل'}
         </button>
         {requestsExpanded ? <LuChevronUp className="text-[var(--text-color)]" /> : <LuChevronDown className="text-[var(--text-color)]" />}
        </div>
       </button>

       {requestsExpanded && (
        <div className="flex flex-col gap-2">
         {finalRequests.map(req => {
          const isSelected = selectedRequestIds.has(req.id);
          return (
           <div
            key={req.id}
            onClick={() => toggleRequest(req.id)}
            className={`flex items-start gap-3 p-3.5 rounded-xl cursor-pointer transition-all border ${
             isSelected
              ? 'border-[var(--main-color)] bg-orange-50/40 dark:bg-orange-950/20 shadow-sm'
              : 'app-border dark:app-border-strong bg-[var(--surface-muted)] dark:bg-[var(--surface-muted)] hover:border-[var(--main-color)]/50'
            }`}
           >
            <div className={`w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
             isSelected
              ? 'bg-[var(--main-color)] border-[var(--main-color)] text-white'
              : 'border-[var(--border-strong)]'
            }`}>
             {isSelected && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
               <polyline points="20 6 9 17 4 12" />
              </svg>
             )}
            </div>
            <div className="flex-1 min-w-0">
             <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border border-orange-100 dark:border-orange-800/50">
              {req.requestLevel}
             </span>
             <p className={`text-sm leading-relaxed mt-1.5 ${isSelected ? 'text-[var(--title-color)]' : 'text-[var(--text-color)]'}`}>
              {req.requestText}
             </p>
            </div>
           </div>
          );
         })}
        </div>
       )}
      </div>
     )}
    </div>

    {/* Footer */}
    <div className="p-6 pt-4 border-t app-border dark:app-border-strong flex flex-col gap-3">
     {/* Warning for unapproved selected */}
     {hasUnapprovedSelected && (
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
       <IoAlertCircleOutline className="text-lg text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
       <p className="text-xs font-bold text-amber-700 dark:text-amber-300 leading-relaxed">
        اخترت {selectedUnapprovedCount} دفع لم يتم تحليله بعد. ارجع لخطوة الدفوع وحلل الدفوع المطلوبة أولاً، أو أزل التحديد عنها للمتابعة.
       </p>
      </div>
     )}

     {/* Summary line */}
     <div className="flex items-center justify-between text-xs text-[var(--text-color)]">
      <span>
       <strong className="text-[var(--title-color)]">{selectedApprovedCount}</strong> دفع محلل
       {selectedRequestIds.size > 0 && <> · <strong className="text-[var(--title-color)]">{selectedRequestIds.size}</strong> طلب</>}
      </span>
     </div>

     {/* Action buttons */}
     <div className="flex items-center gap-3">
      <button
       onClick={onClose}
       className="flex-1 px-5 py-3 rounded-xl text-sm font-bold text-[var(--title-color)] border app-border dark:app-border-strong hover:bg-[#1b1b1b]/5 dark:hover:bg-white/5 transition-colors"
      >
       رجوع
      </button>
      <button
       onClick={handleConfirm}
       disabled={!canConfirm || isLoading}
       className="flex-[2] flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-[var(--main-color)] text-white transition-all hover:shadow-[0_8px_20px_rgba(239,149,10,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
      >
       {isLoading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
       ) : (
        <>
         <IoSparklesOutline className="text-lg" />
         إنشاء المذكرة ({selectedDefenseIds.size} دفع · {selectedRequestIds.size} طلب)
        </>
       )}
      </button>
     </div>
    </div>
   </div>

   <style>{`
    @keyframes modalSlideUp {
     from { opacity: 0; transform: translateY(20px) scale(0.97); }
     to { opacity: 1; transform: translateY(0) scale(1); }
    }
   `}</style>
  </div>
 );
};

export default MemoConfirmModal;
