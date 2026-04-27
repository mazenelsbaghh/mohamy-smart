// ── Agenda Types ─────────────────────────────────────────────────

export type AgendaStatus ='Scheduled' |'Completed' |'Postponed' |'Cancelled';

export interface BaseAgendaItem {
 id: string;
 caseId: string;
 title: string;
 date: string;
 endDate?: string | null;
 status: AgendaStatus;
 createdAt: string;
}

export interface SessionAgendaItem extends BaseAgendaItem {
 type:'Session';
 sessionType: string;
 courtName: string;
 previousSessionId?: string | null;
 postponementReason?: string | null;
}

export interface ActionAgendaItem extends BaseAgendaItem {
 type:'Action';
 actionType:'Inspection' |'Execution';
 executionDetails: string;
 location?: string | null;
}

export type AgendaItem = SessionAgendaItem | ActionAgendaItem;

export interface SessionRollDto {
 id: string;
 sessionDate: string;
 caseNumber: string;
 courtName: string;
 plaintiffName: string;
 defendantName: string;
 previousDecision: string;
 assignedLawyerName: string;
}

// ── Form DTOs ────────────────────────────────────────────────────

export interface CreateSessionDto {
 caseId: string;
 title: string;
 date: string;
 endDate?: string | null;
 type:'Session';
 status: AgendaStatus;
 sessionType: string;
 courtName: string;
 previousSessionId?: string | null;
 postponementReason?: string | null;
}

export interface CreateActionDto {
 caseId: string;
 title: string;
 date: string;
 endDate?: string | null;
 type:'Action';
 status: AgendaStatus;
 actionType:'Inspection' |'Execution';
 executionDetails: string;
 location?: string | null;
}

export type CreateAgendaItemDto = CreateSessionDto | CreateActionDto;

// ── Dropdown Options ─────────────────────────────────────────────

export const SESSION_TYPES = ['جلسة أولى','مرافعة','نطق بالحكم','تأجيل','تحقيق','سماع شهود','حكم','أخرى',
] as const;

export const COURT_NAMES = ['محكمة جنح','محكمة جنايات','محكمة أسرة','محكمة مدني كلي','محكمة مدني جزئي','محكمة اقتصادية','محكمة إدارية','محكمة استئناف','محكمة نقض','محكمة دستورية','أخرى',
] as const;

export const POSTPONEMENT_REASONS = ['لتقديم مستندات','لتبادل المذكرات','لسماع الشهود','لإعادة الإعلان','للاطلاع','للتقرير عن الرأي','لتنفيذ حكم تمهيدي','بناء على طلب الخصم','لعدم اكتمال الدائرة','أخرى',
] as const;

export const ACTION_TYPES = [
 { key:'Inspection', label:'معاينة' },
 { key:'Execution', label:'تنفيذ' },
] as const;

export const EXECUTION_DETAILS = ['تنفيذ حكم','إشكال في التنفيذ','حجز تنفيذي','حجز تحفظي','إنذار رسمي','إخلاء عقار','أخرى',
] as const;

export const INSPECTION_DETAILS = ['معاينة عقار','معاينة أرض','معاينة محل تجاري','معاينة مصنع','معاينة سيارة','أخرى',
] as const;

export const AGENDA_STATUS_OPTIONS = [
 { key:'Scheduled', label:'متداولة' },
 { key:'Completed', label:'منتهية' },
 { key:'Postponed', label:'مؤجلة' },
 { key:'Cancelled', label:'ملغاة' },
] as const;
