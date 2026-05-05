type SearchableCase = {
 id?: string | number;
 title?: string | null;
 number?: string | null;
 court?: string | null;
 clientName?: string | null;
 apponentName?: string | null;
 defendingParty?: string | null;
 caseTypeName?: string | null;
 caseTypeNames?: string[] | null;
 description?: string | null;
 creationDate?: string | null;
 status: number | string;
 isActive?: boolean;
};

const arabicDigitMap: Record<string, string> = {
 '٠':'0',
 '١':'1',
 '٢':'2',
 '٣':'3',
 '٤':'4',
 '٥':'5',
 '٦':'6',
 '٧':'7',
 '٨':'8',
 '٩':'9',
 '۰':'0',
 '۱':'1',
 '۲':'2',
 '۳':'3',
 '۴':'4',
 '۵':'5',
 '۶':'6',
 '۷':'7',
 '۸':'8',
 '۹':'9',
};

const normalizeCaseStatus = (status: number | string, isActive?: boolean) => {
 const open = status === 0 || status ==='Open';
 return [
 String(status),
 isActive === false ?'مؤرشفة' :'نشطة',
 open ?'متداولة' :'منتهية',
 ];
};

export const normalizeCaseSearchText = (value: unknown) =>
 String(value ??'')
 .replace(/[٠-٩۰-۹]/g, (digit) => arabicDigitMap[digit] ?? digit)
 .replace(/[\u064B-\u065F\u0670ـ]/g,'')
 .replace(/[أإآٱ]/g,'ا')
 .replace(/ى/g,'ي')
 .replace(/ئ/g,'ي')
 .replace(/ؤ/g,'و')
 .replace(/ة/g,'ه')
 .replace(/\s+/g,' ')
 .trim()
 .toLowerCase();

export const normalizeCaseSearchQueryForApi = (value: string) =>
 value
 .replace(/[٠-٩۰-۹]/g, (digit) => arabicDigitMap[digit] ?? digit)
 .replace(/\s+/g,' ')
 .trim();

export const getCaseSearchText = (caseItem: SearchableCase) => [
 caseItem.id,
 caseItem.number,
 caseItem.title,
 caseItem.court,
 caseItem.clientName,
 caseItem.apponentName,
 caseItem.defendingParty,
 caseItem.caseTypeName,
 ...(caseItem.caseTypeNames ?? []),
 caseItem.description,
 caseItem.creationDate,
 ...normalizeCaseStatus(caseItem.status, caseItem.isActive),
].map(normalizeCaseSearchText).filter(Boolean).join(' ');

export const caseMatchesSearch = (caseItem: SearchableCase, query: string) => {
 const normalizedQuery = normalizeCaseSearchText(query);
 if (!normalizedQuery) return true;

 const searchableText = getCaseSearchText(caseItem);
 return normalizedQuery
 .split(' ')
 .filter(Boolean)
 .every((term) => searchableText.includes(term));
};
