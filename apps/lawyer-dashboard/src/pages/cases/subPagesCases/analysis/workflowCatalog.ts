import React from'react';
import { IoFlash, IoDocumentTextOutline } from'react-icons/io5';
import { FaGavel, FaExclamationTriangle, FaBalanceScale, FaFileAlt } from'react-icons/fa';

export interface WorkflowCatalogItem {
 id: string;
 route: string;
 label: string;
 description: string;
 totalSteps: number;
 icon: React.ComponentType<{ className?: string }>;
}

export const WORKFLOW_CATALOG: WorkflowCatalogItem[] = [
 {
 id:"defense-memo",
 route:"defense-memo",
 label:"إعداد مذكرة دفاع",
 description:"إنشاء مذكرة دفاع شاملة مع الدفوع الشكلية والموضوعية.",
 totalSteps: 5,
 icon: IoFlash as React.ComponentType<{ className?: string }>
 },
 {
  id:"preparing-statement-of-claims",
  route:"preparing-statement-of-claims",
  label:"إعداد صحيفة دعوى",
  description:"إنشاء صحيفة دعوى كاملة مع جميع البيانات المطلوبة.",
  totalSteps: 7,
 icon: IoDocumentTextOutline as React.ComponentType<{ className?: string }>
 },
 {
 id:"appeal-brief",
 route:"appeal-brief",
 label:"صحيفة طعن بالنقض",
 description:"إعداد صحيفة طعن بالنقض من استخراج بيانات الحكم وحتى التجميع النهائي.",
 totalSteps: 6,
 icon: FaGavel as React.ComponentType<{ className?: string }>
 },
 {
 id:"admin-complaint",
 route:"admin-complaint",
 label:"شكوى",
 description:"إعداد شكوى رسمية من التصنيف وحتى التجميع النهائي.",
 totalSteps: 5,
 icon: FaExclamationTriangle as React.ComponentType<{ className?: string }>
 },
 {
 id:"ruling-analysis",
 route:"ruling-analysis",
 label:"تحليل حكم",
 description:"تحليل الحكم وتقييم العيوب وتقرير جدوى الطعن.",
 totalSteps: 4,
 icon: FaBalanceScale as React.ComponentType<{ className?: string }>
 },
 {
 id:"legal-warning",
 route:"legal-warning",
 label:"إنذار رسمي",
 description:"إعداد إنذار رسمي بالصيغة القانونية المصرية.",
 totalSteps: 3,
 icon: FaFileAlt as React.ComponentType<{ className?: string }>
 },
 {
 id:"exec-request",
 route:"exec-request",
 label:"طلب تنفيذي",
 description:"إعداد عريضة طلب تنفيذي مع تحديد نوع السند.",
 totalSteps: 3,
 icon: FaFileAlt as React.ComponentType<{ className?: string }>
 }
];

export function getWorkflowCatalogItem(route: string): WorkflowCatalogItem | undefined {
 return WORKFLOW_CATALOG.find((w) => w.route === route);
}
