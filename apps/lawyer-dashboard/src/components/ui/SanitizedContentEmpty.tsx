import React from'react';
import { AlertTriangle } from'lucide-react';

export const SanitizedContentEmpty: React.FC = () => {
 return (
 <div className="bg-[var(--accent-soft)] border border-yellow-200 rounded p-4 text-yellow-800 flex items-start gap-3">
 <AlertTriangle size={16} className="shrink-0 mt-0.5" />
 <div>
 <p className="font-bold text-sm mb-1">المحتوى غير متاح</p>
 <p className="text-sm">يُرجى مراجعة البيانات الأصلية</p>
 </div>
 </div>
 );
};
