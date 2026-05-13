import type { EstateInput, HeirInput, HeirShare, HeirType, InheritanceResult } from'./inheritanceTypes';
import { BLOCKING_RULES, RADD_ELIGIBLE, RESIDUARY_PRIORITY } from'./inheritanceData';

function hasHeirType(heirs: HeirInput[], type: HeirType): boolean {
 return heirs.some(h => h.type === type);
}

function getHeirCount(heirs: HeirInput[], type: HeirType): number {
 return heirs.find(h => h.type === type)?.count ?? 0;
}

function hasDescendants(heirs: HeirInput[]): boolean {
 return hasHeirType(heirs,'SON') || hasHeirType(heirs,'DAUGHTER')
 || hasHeirType(heirs,'SON_OF_SON') || hasHeirType(heirs,'DAUGHTER_OF_SON');
}

function hasMaleDescendants(heirs: HeirInput[]): boolean {
 return hasHeirType(heirs,'SON') || hasHeirType(heirs,'SON_OF_SON');
}

function countSiblings(heirs: HeirInput[]): number {
 let count = 0;
 count += getHeirCount(heirs,'FULL_BROTHER');
 count += getHeirCount(heirs,'FULL_SISTER');
 count += getHeirCount(heirs,'PATERNAL_HALF_BROTHER');
 count += getHeirCount(heirs,'PATERNAL_HALF_SISTER');
 count += getHeirCount(heirs,'MATERNAL_HALF_BROTHER');
 count += getHeirCount(heirs,'MATERNAL_HALF_SISTER');
 return count;
}

function applyBlocking(heirs: HeirInput[]): HeirInput[] {
 const presentTypes = new Set(heirs.map(h => h.type));
 const blocked = new Set<HeirType>();

 for (const [blocker, blockedTypes] of Object.entries(BLOCKING_RULES)) {
 if (presentTypes.has(blocker as HeirType)) {
 for (const bt of blockedTypes) {
 blocked.add(bt);
 }
 }
 }

 const hasMaleDesc = hasMaleDescendants(heirs);
 const hasAnyDesc = hasDescendants(heirs);

 if (hasMaleDesc) {
 blocked.add('FULL_BROTHER');
 blocked.add('FULL_SISTER');
 blocked.add('PATERNAL_HALF_BROTHER');
 blocked.add('PATERNAL_HALF_SISTER');
 blocked.add('MATERNAL_HALF_BROTHER');
 blocked.add('MATERNAL_HALF_SISTER');
 blocked.add('UNCLE_PATERNAL');
 blocked.add('NEPHEW_PATERNAL');
 }

 if (hasAnyDesc) {
 blocked.add('MATERNAL_HALF_BROTHER');
 blocked.add('MATERNAL_HALF_SISTER');
 }

 if (hasHeirType(heirs,'FATHER')) {
 blocked.add('GRANDFATHER_PATERNAL');
 blocked.add('FULL_BROTHER');
 blocked.add('FULL_SISTER');
 blocked.add('PATERNAL_HALF_BROTHER');
 blocked.add('PATERNAL_HALF_SISTER');
 blocked.add('MATERNAL_HALF_BROTHER');
 blocked.add('MATERNAL_HALF_SISTER');
 blocked.add('UNCLE_PATERNAL');
 blocked.add('NEPHEW_PATERNAL');
 }

 if (!hasHeirType(heirs,'FATHER') && hasHeirType(heirs,'GRANDFATHER_PATERNAL')) {
 blocked.add('MATERNAL_HALF_BROTHER');
 blocked.add('MATERNAL_HALF_SISTER');
 blocked.add('UNCLE_PATERNAL');
 blocked.add('NEPHEW_PATERNAL');
 if (hasMaleDesc) {
 blocked.add('FULL_BROTHER');
 blocked.add('FULL_SISTER');
 blocked.add('PATERNAL_HALF_BROTHER');
 blocked.add('PATERNAL_HALF_SISTER');
 }
 }

 if (hasAnyDesc && !hasMaleDesc) {
 if (hasHeirType(heirs,'FULL_SISTER')) {
 blocked.add('PATERNAL_HALF_BROTHER');
 blocked.add('PATERNAL_HALF_SISTER');
 blocked.add('UNCLE_PATERNAL');
 blocked.add('NEPHEW_PATERNAL');
 } else if (hasHeirType(heirs,'PATERNAL_HALF_SISTER')) {
 blocked.add('UNCLE_PATERNAL');
 blocked.add('NEPHEW_PATERNAL');
 }
 }

 return heirs.filter(h => !blocked.has(h.type));
}

interface FractionalShare {
 heirType: HeirType;
 count: number;
 fraction: number;
 fractionLabel: string;
 shareType:'fard';
 legalBasis: string;
}

function assignFixedShares(activeHeirs: HeirInput[]): { shares: FractionalShare[], warnings: string[] } {
 const shares: FractionalShare[] = [];
 const warnings: string[] = [];
 const desc = hasDescendants(activeHeirs);
 const siblingCount = countSiblings(activeHeirs);
 const hasFather = hasHeirType(activeHeirs,'FATHER');
 const hasMother = hasHeirType(activeHeirs,'MOTHER');
 const hasHusband = hasHeirType(activeHeirs,'HUSBAND');
 const hasWife = hasHeirType(activeHeirs,'WIFE');

 if (hasHusband) {
 const fraction = desc ? 1 / 4 : 1 / 2;
 const label = desc ?'1/4' :'1/2';
 const basis = desc ?'الربع لوجود الفرع الوارث — النساء: ١٢' :'النصف لعدم وجود الفرع الوارث — النساء: ١٢';
 shares.push({ heirType:'HUSBAND', count: 1, fraction, fractionLabel: label, shareType:'fard', legalBasis: basis });
 }

 if (hasWife) {
 const wifeCount = getHeirCount(activeHeirs,'WIFE');
 const fraction = desc ? 1 / 8 : 1 / 4;
 const label = desc ?'1/8' :'1/4';
 const basis = desc ?'الثمن لوجود الفرع الوارث — النساء: ١٢' :'الربع لعدم وجود الفرع الوارث — النساء: ١١';
 shares.push({ heirType:'WIFE', count: wifeCount, fraction, fractionLabel: label, shareType:'fard', legalBasis: basis });
 }

 if (hasFather) {
 if (desc) {
 shares.push({ heirType:'FATHER', count: 1, fraction: 1 / 6, fractionLabel:'1/6', shareType:'fard', legalBasis:'السدس مع الفرع الوارث — النساء: ١١' });
 }
 }

 if (!hasFather && hasHeirType(activeHeirs,'GRANDFATHER_PATERNAL')) {
 if (desc) {
 shares.push({ heirType:'GRANDFATHER_PATERNAL', count: 1, fraction: 1 / 6, fractionLabel:'1/6', shareType:'fard', legalBasis:'السدس مع الفرع الوارث (يقوم مقام الأب) — النساء: ١١' });
 }
 }

 if (hasMother) {
 let motherFraction: number;
 let motherLabel: string;
 let motherBasis: string;

 const umariyyatain = (hasHusband || hasWife) && hasFather && activeHeirs.length === 3;

 if (umariyyatain) {
 motherFraction = 1 / 3;
 motherLabel ='1/3';
 motherBasis ='حالة العمريتين — الثلث — النساء: ١١';
 warnings.push('حالة العمريتين: الأم تأخذ الثلث (الأب يأخذ ما بقي)');
 } else if (desc || (siblingCount >= 2)) {
 motherFraction = 1 / 6;
 motherLabel ='1/6';
 motherBasis ='السدس لوجود الفرع أو اثنين من الإخوة — النساء: ١١';
 } else {
 motherFraction = 1 / 3;
 motherLabel ='1/3';
 motherBasis ='الثلث لعدم وجود الفرع أو الإخوة — النساء: ١١';
 }

 shares.push({ heirType:'MOTHER', count: 1, fraction: motherFraction, fractionLabel: motherLabel, shareType:'fard', legalBasis: motherBasis });
 }

 const grandmothers: HeirType[] = [];
 if (hasHeirType(activeHeirs,'GRANDMOTHER_PATERNAL')) grandmothers.push('GRANDMOTHER_PATERNAL');
 if (hasHeirType(activeHeirs,'GRANDMOTHER_MATERNAL')) grandmothers.push('GRANDMOTHER_MATERNAL');

 if (grandmothers.length > 0 && !hasMother) {
 for (const gm of grandmothers) {
 const cnt = getHeirCount(activeHeirs, gm);
 shares.push({
 heirType: gm,
 count: cnt,
 fraction: 1 / 6,
 fractionLabel:'1/6',
 shareType:'fard',
 legalBasis:'السدس للجدة في عدم الأم — النساء: ١١',
 });
 }
 }

 if (hasHeirType(activeHeirs,'DAUGHTER') && !hasHeirType(activeHeirs,'SON')) {
 const daughterCount = getHeirCount(activeHeirs,'DAUGHTER');
 if (daughterCount === 1) {
 shares.push({ heirType:'DAUGHTER', count: 1, fraction: 1 / 2, fractionLabel:'1/2', shareType:'fard', legalBasis:'النصف للبنت الواحدة — النساء: ١١' });
 } else if (daughterCount >= 2) {
 shares.push({ heirType:'DAUGHTER', count: daughterCount, fraction: 2 / 3, fractionLabel:'2/3', shareType:'fard', legalBasis:'الثلثان للبنتين فأكثر — النساء: ١١' });
 }
 }

 if (hasHeirType(activeHeirs,'DAUGHTER_OF_SON') && !hasHeirType(activeHeirs,'SON') && !hasHeirType(activeHeirs,'SON_OF_SON')) {
 const dosCount = getHeirCount(activeHeirs,'DAUGHTER_OF_SON');
 const hasDaughter = hasHeirType(activeHeirs,'DAUGHTER');

 if (!hasDaughter) {
 if (dosCount === 1) {
 shares.push({ heirType:'DAUGHTER_OF_SON', count: 1, fraction: 1 / 2, fractionLabel:'1/2', shareType:'fard', legalBasis:'النصف لبنت الابن مع عدم وجود بنت — النساء: ١١' });
 } else if (dosCount >= 2) {
 shares.push({ heirType:'DAUGHTER_OF_SON', count: dosCount, fraction: 2 / 3, fractionLabel:'2/3', shareType:'fard', legalBasis:'الثلثان لبنتي الابن فأكثر — النساء: ١١' });
 }
 } else {
 const daughterCount = getHeirCount(activeHeirs,'DAUGHTER');
 if (daughterCount === 1) {
 shares.push({ heirType:'DAUGHTER_OF_SON', count: dosCount, fraction: 1 / 6, fractionLabel:'1/6', shareType:'fard', legalBasis:'السدس تكملة الثلثين مع البنت — النساء: ١١' });
 }
 }
 }

 if (!hasDescendants(activeHeirs) && !hasFather && !(hasHeirType(activeHeirs,'GRANDFATHER_PATERNAL') && desc)) {
 if (hasHeirType(activeHeirs,'FULL_SISTER') && !hasHeirType(activeHeirs,'FULL_BROTHER')) {
 const fsCount = getHeirCount(activeHeirs,'FULL_SISTER');
 if (fsCount === 1) {
 shares.push({ heirType:'FULL_SISTER', count: 1, fraction: 1 / 2, fractionLabel:'1/2', shareType:'fard', legalBasis:'النصف للأخت الشقيقة — النساء: ١١' });
 } else if (fsCount >= 2) {
 shares.push({ heirType:'FULL_SISTER', count: fsCount, fraction: 2 / 3, fractionLabel:'2/3', shareType:'fard', legalBasis:'الثلثان للأختين الشقيقتين فأكثر — النساء: ١١' });
 }
 }

 if (hasHeirType(activeHeirs,'PATERNAL_HALF_SISTER') && !hasHeirType(activeHeirs,'PATERNAL_HALF_BROTHER')) {
 const phsCount = getHeirCount(activeHeirs,'PATERNAL_HALF_SISTER');
 const hasFullSister = hasHeirType(activeHeirs,'FULL_SISTER');
 const fullSisterCount = getHeirCount(activeHeirs,'FULL_SISTER');

 if (!hasFullSister) {
 if (phsCount === 1) {
 shares.push({ heirType:'PATERNAL_HALF_SISTER', count: 1, fraction: 1 / 2, fractionLabel:'1/2', shareType:'fard', legalBasis:'النصف للأخت لأب — النساء: ١١' });
 } else if (phsCount >= 2) {
 shares.push({ heirType:'PATERNAL_HALF_SISTER', count: phsCount, fraction: 2 / 3, fractionLabel:'2/3', shareType:'fard', legalBasis:'الثلثان للأختين لأب فأكثر — النساء: ١١' });
 }
 } else if (fullSisterCount === 1) {
 shares.push({ heirType:'PATERNAL_HALF_SISTER', count: phsCount, fraction: 1 / 6, fractionLabel:'1/6', shareType:'fard', legalBasis:'السدس تكملة الثلثين مع الأخت الشقيقة — النساء: ١١' });
 }
 }
 }

 if (hasHeirType(activeHeirs,'MATERNAL_HALF_BROTHER') || hasHeirType(activeHeirs,'MATERNAL_HALF_SISTER')) {
 const mhbCount = getHeirCount(activeHeirs,'MATERNAL_HALF_BROTHER');
 const mhsCount = getHeirCount(activeHeirs,'MATERNAL_HALF_SISTER');
 const totalMaternal = mhbCount + mhsCount;
 if (totalMaternal > 0) {
 const fraction = totalMaternal === 1 ? 1 / 6 : 1 / 3;
 const label = totalMaternal === 1 ?'1/6' :'1/3';
 const basis = totalMaternal === 1 ?'السدس للواحد من الإخوة لأم — النساء: ١٢' :'الثلث للاثنين فأكثر من الإخوة لأم — النساء: ١٢';
 if (mhbCount > 0) {
 shares.push({ heirType:'MATERNAL_HALF_BROTHER', count: mhbCount, fraction, fractionLabel: label, shareType:'fard', legalBasis: basis });
 }
 if (mhsCount > 0) {
 shares.push({ heirType:'MATERNAL_HALF_SISTER', count: mhsCount, fraction, fractionLabel: label, shareType:'fard', legalBasis: basis });
 }
 }
 }

 return { shares, warnings };
}

function distributeResiduary(
 activeHeirs: HeirInput[],
 fixedShares: FractionalShare[],
): HeirShare[] {
 const totalFixed = fixedShares.reduce((sum, s) => sum + s.fraction, 0);
 const remainder = 1 - totalFixed;
 const results: HeirShare[] = [];

 if (remainder <= 0) return results;

 for (const heirType of RESIDUARY_PRIORITY) {
 if (!hasHeirType(activeHeirs, heirType)) continue;

 const existingFixed = fixedShares.find(s => s.heirType === heirType);

 if (heirType ==='SON') {
 const sonCount = getHeirCount(activeHeirs,'SON');
 const daughterCount = getHeirCount(activeHeirs,'DAUGHTER');
 if (sonCount > 0) {
 const totalUnits = sonCount * 2 + daughterCount;
 const perUnit = remainder / totalUnits;

 results.push({
 heirType:'SON',
 count: sonCount,
 shareType:"ta'sib",
 fraction: null,
 totalAmount: 0,
 perPersonAmount: 0,
 percentage: perUnit * 2 * 100,
 legalBasis:'التعصيب بالغير للابن — يأخذ ضعف الأنثى',
 });

 if (daughterCount > 0 && !fixedShares.find(s => s.heirType ==='DAUGHTER')) {
 results.push({
 heirType:'DAUGHTER',
 count: daughterCount,
 shareType:"ta'sib",
 fraction: null,
 totalAmount: 0,
 perPersonAmount: 0,
 percentage: perUnit * 100,
 legalBasis:'التعصيب بالغير للبنت مع الابن — تأخذ نصف نصيب الابن',
 });
 }
 break;
 }
 }

 if (heirType ==='SON_OF_SON' && !hasHeirType(activeHeirs,'SON')) {
 const sosCount = getHeirCount(activeHeirs,'SON_OF_SON');
 const dosCount = getHeirCount(activeHeirs,'DAUGHTER_OF_SON');
 if (sosCount > 0) {
 const totalShares = sosCount + dosCount * 2;
 const sharePerUnit = remainder / totalShares;

 results.push({
 heirType:'SON_OF_SON',
 count: sosCount,
 shareType:"ta'sib",
 fraction: null,
 totalAmount: 0,
 perPersonAmount: 0,
 percentage: sharePerUnit * 100,
 legalBasis:'التعصيب بالغير لابن الابن',
 });

 if (dosCount > 0 && !fixedShares.find(s => s.heirType ==='DAUGHTER_OF_SON')) {
 results.push({
 heirType:'DAUGHTER_OF_SON',
 count: dosCount,
 shareType:"ta'sib",
 fraction: null,
 totalAmount: 0,
 perPersonAmount: 0,
 percentage: (sharePerUnit / 2) * 100,
 legalBasis:'التعصيب بالغير لبنت الابن مع ابن الابن',
 });
 }
 break;
 }
 }

 if (heirType ==='FATHER' && hasHeirType(activeHeirs,'FATHER')) {
 results.push({
 heirType:'FATHER',
 count: 1,
 shareType:"ta'sib",
 fraction: null,
 totalAmount: 0,
 perPersonAmount: 0,
 percentage: remainder * 100,
 legalBasis: existingFixed
 ?'السدس + التعصيب للأب مع الفرع الوارث — النساء: ١١'
 :'التعصيب للأب عند عدم الفرع الوارث',
 });
 break;
 }

 if (heirType ==='GRANDFATHER_PATERNAL' && hasHeirType(activeHeirs,'GRANDFATHER_PATERNAL') && !hasHeirType(activeHeirs,'FATHER')) {
 results.push({
 heirType:'GRANDFATHER_PATERNAL',
 count: 1,
 shareType:"ta'sib",
 fraction: null,
 totalAmount: 0,
 perPersonAmount: 0,
 percentage: remainder * 100,
 legalBasis: existingFixed
 ?'السدس + التعصيب للجد (يقوم مقام الأب)'
 :'التعصيب للجد عند عدم الأب والفرع',
 });
 break;
 }

 if (heirType ==='FULL_BROTHER' && hasHeirType(activeHeirs,'FULL_BROTHER')) {
 const count = getHeirCount(activeHeirs,'FULL_BROTHER');
 const fullSisterCount = getHeirCount(activeHeirs,'FULL_SISTER');
 const totalShares = count + fullSisterCount * 2;
 const sharePerUnit = remainder / totalShares;

 results.push({
 heirType:'FULL_BROTHER',
 count,
 shareType:"ta'sib",
 fraction: null,
 totalAmount: 0,
 perPersonAmount: 0,
 percentage: sharePerUnit * 100,
 legalBasis:'التعصيب بالغير للأخ الشقيق',
 });

 if (fullSisterCount > 0 && !fixedShares.find(s => s.heirType ==='FULL_SISTER')) {
 results.push({
 heirType:'FULL_SISTER',
 count: fullSisterCount,
 shareType:"ta'sib",
 fraction: null,
 totalAmount: 0,
 perPersonAmount: 0,
 percentage: (sharePerUnit / 2) * 100,
 legalBasis:'التعصيب مع الغير للأخت الشقيقة مع الأخ',
 });
 }
 break;
 }

 if (heirType ==='FULL_SISTER' && hasHeirType(activeHeirs,'FULL_SISTER') && !hasHeirType(activeHeirs,'FULL_BROTHER')) {
 if (hasDescendants(activeHeirs) && !hasMaleDescendants(activeHeirs)) {
 const count = getHeirCount(activeHeirs,'FULL_SISTER');
 results.push({
 heirType:'FULL_SISTER',
 count,
 shareType:"ta'sib",
 fraction: null,
 totalAmount: 0,
 perPersonAmount: 0,
 percentage: (remainder / count) * 100,
 legalBasis:'التعصيب مع الغير للأخت الشقيقة (مع الفرع المؤنث)',
 });
 break;
 }
 }

 if (heirType ==='PATERNAL_HALF_BROTHER' && hasHeirType(activeHeirs,'PATERNAL_HALF_BROTHER') && !hasHeirType(activeHeirs,'FULL_BROTHER')) {
 const count = getHeirCount(activeHeirs,'PATERNAL_HALF_BROTHER');
 const phsCount = getHeirCount(activeHeirs,'PATERNAL_HALF_SISTER');
 const totalShares = count + phsCount * 2;
 const sharePerUnit = remainder / totalShares;

 results.push({
 heirType:'PATERNAL_HALF_BROTHER',
 count,
 shareType:"ta'sib",
 fraction: null,
 totalAmount: 0,
 perPersonAmount: 0,
 percentage: sharePerUnit * 100,
 legalBasis:'التعصيب بالغير للأخ لأب',
 });

 if (phsCount > 0 && !fixedShares.find(s => s.heirType ==='PATERNAL_HALF_SISTER')) {
 results.push({
 heirType:'PATERNAL_HALF_SISTER',
 count: phsCount,
 shareType:"ta'sib",
 fraction: null,
 totalAmount: 0,
 perPersonAmount: 0,
 percentage: (sharePerUnit / 2) * 100,
 legalBasis:'التعصيب مع الغير للأخت لأب مع الأخ لأب',
 });
 }
 break;
 }

 if (heirType ==='PATERNAL_HALF_SISTER' && hasHeirType(activeHeirs,'PATERNAL_HALF_SISTER') && !hasHeirType(activeHeirs,'PATERNAL_HALF_BROTHER')) {
 if (hasDescendants(activeHeirs) && !hasMaleDescendants(activeHeirs) && !hasHeirType(activeHeirs,'FULL_SISTER')) {
 const count = getHeirCount(activeHeirs,'PATERNAL_HALF_SISTER');
 results.push({
 heirType:'PATERNAL_HALF_SISTER',
 count,
 shareType:"ta'sib",
 fraction: null,
 totalAmount: 0,
 perPersonAmount: 0,
 percentage: (remainder / count) * 100,
 legalBasis:'التعصيب مع الغير للأخت لأب (مع الفرع المؤنث)',
 });
 break;
 }
 }

 if (heirType ==='UNCLE_PATERNAL' && hasHeirType(activeHeirs,'UNCLE_PATERNAL')) {
 const count = getHeirCount(activeHeirs,'UNCLE_PATERNAL');
 results.push({
 heirType:'UNCLE_PATERNAL',
 count,
 shareType:"ta'sib",
 fraction: null,
 totalAmount: 0,
 perPersonAmount: 0,
 percentage: (remainder / count) * 100,
 legalBasis:'التعصيب للعم',
 });
 break;
 }

 if (heirType ==='NEPHEW_PATERNAL' && hasHeirType(activeHeirs,'NEPHEW_PATERNAL')) {
 const count = getHeirCount(activeHeirs,'NEPHEW_PATERNAL');
 results.push({
 heirType:'NEPHEW_PATERNAL',
 count,
 shareType:"ta'sib",
 fraction: null,
 totalAmount: 0,
 perPersonAmount: 0,
 percentage: (remainder / count) * 100,
 legalBasis:'التعصيب لابن الأخ',
 });
 break;
 }
 }

 return results;
}

function calculateFaraidBase(estate: EstateInput, heirs: HeirInput[]): InheritanceResult {
 const warnings: string[] = [];

 if (estate.totalValue <= 0) {
 return { shares: [], totalDistributed: 0, remainingEstate: 0, isOversubscribed: false, awlRate: null, warnings: ['قيمة التركة يجب أن تكون أكبر من صفر'] };
 }

 if (heirs.length === 0) {
 return { shares: [], totalDistributed: 0, remainingEstate: estate.totalValue, isOversubscribed: false, awlRate: null, warnings: ['لم يتم إضافة أي ورثة'] };
 }

 const netEstate = Math.max(0, estate.totalValue - estate.debts);
 const maxBequest = netEstate / 3;
 const actualBequests = Math.min(estate.bequests, maxBequest);
 const distributable = Math.max(0, netEstate - actualBequests);

 if (estate.bequests > maxBequest && estate.bequests > 0) {
 warnings.push(`الوصية لا تتجاوز ثلث التركة. تم تقييصها من ${estate.bequests} إلى ${Math.round(maxBequest)} جنيه`);
 }

 const activeHeirs = applyBlocking(heirs);

 if (activeHeirs.length === 0) {
 return { shares: [], totalDistributed: 0, remainingEstate: distributable, isOversubscribed: false, awlRate: null, warnings: ['جميع الورثة تم حجبهم — التركة للبيت المال'] };
 }

 const { shares: fixedShares, warnings: fixedWarnings } = assignFixedShares(activeHeirs);
 warnings.push(...fixedWarnings);

 const totalFixedFraction = fixedShares.reduce((sum, s) => sum + s.fraction, 0);

 const residuaryShares = totalFixedFraction < 1
 ? distributeResiduary(activeHeirs, fixedShares)
 : [];

 const allShares: HeirShare[] = [];
 let isOversubscribed = false;
 let awlRate: number | null = null;

 if (totalFixedFraction > 1) {
 isOversubscribed = true;
 awlRate = 1 / totalFixedFraction;
 warnings.push('حالة العول: إجمالي الفروض يتجاوز 1 — يتم تقليص جميع الأنصبة بنسبة متساوية');

 for (const fs of fixedShares) {
 const adjustedFraction = fs.fraction * awlRate;
 const totalAmount = adjustedFraction * distributable;
 allShares.push({
 heirType: fs.heirType,
 count: fs.count,
 shareType: fs.shareType,
 fraction: fs.fractionLabel,
 totalAmount: Math.round(totalAmount * 100) / 100,
 perPersonAmount: Math.round((totalAmount / fs.count) * 100) / 100,
 percentage: Math.round(adjustedFraction * 10000) / 100,
 legalBasis: fs.legalBasis,
 });
 }
 } else {
 for (const fs of fixedShares) {
 const totalAmount = fs.fraction * distributable;
 allShares.push({
 heirType: fs.heirType,
 count: fs.count,
 shareType: fs.shareType,
 fraction: fs.fractionLabel,
 totalAmount: Math.round(totalAmount * 100) / 100,
 perPersonAmount: Math.round((totalAmount / fs.count) * 100) / 100,
 percentage: Math.round(fs.fraction * 10000) / 100,
 legalBasis: fs.legalBasis,
 });
 }

 for (const rs of residuaryShares) {
 const totalAmount = (rs.percentage / 100) * distributable * rs.count;
 allShares.push({
 ...rs,
 totalAmount: Math.round(totalAmount * 100) / 100,
 perPersonAmount: Math.round((totalAmount / rs.count) * 100) / 100,
 });
 }
 }

 if (totalFixedFraction < 1 && residuaryShares.length === 0) {
 const remainingFraction = 1 - totalFixedFraction;

 const raddEligible = allShares.filter(s => RADD_ELIGIBLE.includes(s.heirType));
 const effectiveRaddEligible = raddEligible.length > 0
 ? raddEligible
 : allShares.filter(s => s.heirType ==='HUSBAND' || s.heirType ==='WIFE');
 if (effectiveRaddEligible.length > 0 && remainingFraction > 0) {
 const totalRaddShares = effectiveRaddEligible.reduce((sum, s) => sum + s.percentage, 0);
 if (totalRaddShares > 0) {
 const remainingAmount = remainingFraction * distributable;
 for (const share of allShares) {
 if (effectiveRaddEligible.includes(share)) {
 const proportion = share.percentage / totalRaddShares;
 const raddAmount = remainingAmount * proportion;
 share.totalAmount = Math.round((share.totalAmount + raddAmount) * 100) / 100;
 share.perPersonAmount = Math.round((share.totalAmount / share.count) * 100) / 100;
 share.percentage = Math.round((share.percentage + (remainingFraction * proportion * 100)) * 100) / 100;
 share.shareType ='radd';
 share.legalBasis +=' + رد';
 }
 }
 warnings.push('تم توزيع الباقي (الرد) على المستحقين');
 }
 }
 }

 const totalDistributed = allShares.reduce((sum, s) => sum + s.totalAmount, 0);
 const remainingEstate = Math.max(0, Math.round((distributable - totalDistributed) * 100) / 100);

 return {
 shares: allShares,
 totalDistributed: Math.round(totalDistributed * 100) / 100,
 remainingEstate,
 isOversubscribed,
 awlRate,
 warnings,
 };
}

export function calculateInheritance(estate: EstateInput, heirs: HeirInput[]): InheritanceResult {
 const activeHeirs = applyBlocking(heirs);
 const hasBlockedGrandchildren = 
 (hasHeirType(heirs,'SON_OF_SON') && !hasHeirType(activeHeirs,'SON_OF_SON')) ||
 (hasHeirType(heirs,'DAUGHTER_OF_SON') && !hasHeirType(activeHeirs,'DAUGHTER_OF_SON'));

 let wwAmount = 0;
 const wwShares: HeirShare[] = [];

 if (hasBlockedGrandchildren) {
 let hypoHeirs = heirs.map(h => ({ ...h }));
 const existingSon = hypoHeirs.find(h => h.type ==='SON');
 if (existingSon) {
 existingSon.count += 1;
 } else {
 hypoHeirs.push({ type:'SON', count: 1 });
 }
 hypoHeirs = hypoHeirs.filter(h => h.type !=='SON_OF_SON' && h.type !=='DAUGHTER_OF_SON');

 const hypoResult = calculateFaraidBase({ ...estate, bequests: 0 }, hypoHeirs);

 const sonShare = hypoResult.shares.find(s => s.heirType ==='SON');
 if (sonShare) {
 const oneSonAmount = sonShare.totalAmount / sonShare.count;
 const netEstate = Math.max(0, estate.totalValue - estate.debts);
 const maxWw = netEstate / 3;
 const actualWw = Math.min(oneSonAmount, maxWw);

 const sosCount = getHeirCount(heirs,'SON_OF_SON');
 const dosCount = getHeirCount(heirs,'DAUGHTER_OF_SON');
 const totalUnits = sosCount * 2 + dosCount;

 if (totalUnits > 0) {
 const perUnit = actualWw / totalUnits;
 if (sosCount > 0) {
 wwShares.push({
 heirType:'SON_OF_SON',
 count: sosCount,
 shareType:'wasiyya_wajiba',
 fraction: null,
 totalAmount: Math.round(perUnit * 2 * sosCount * 100) / 100,
 perPersonAmount: Math.round(perUnit * 2 * 100) / 100,
 percentage: Math.round(((perUnit * 2 * sosCount) / netEstate) * 10000) / 100,
 legalBasis:'الوصية الواجبة لابن الابن (بمقدار حصة والده أو الثلث أيهما أقل)',
 });
 }
 if (dosCount > 0) {
 wwShares.push({
 heirType:'DAUGHTER_OF_SON',
 count: dosCount,
 shareType:'wasiyya_wajiba',
 fraction: null,
 totalAmount: Math.round(perUnit * dosCount * 100) / 100,
 perPersonAmount: Math.round(perUnit * 100) / 100,
 percentage: Math.round(((perUnit * dosCount) / netEstate) * 10000) / 100,
 legalBasis:'الوصية الواجبة لبنت الابن (بمقدار حصة والدها أو الثلث أيهما أقل)',
 });
 }
 wwAmount = wwShares.reduce((sum, s) => sum + s.totalAmount, 0);
 }
 }
 }

 const netEstateBeforeWw = Math.max(0, estate.totalValue - estate.debts);
 const maxOptionalBequest = netEstateBeforeWw / 3;
 const allowedOptionalBequest = maxOptionalBequest - wwAmount;
 const actualOptionalBequest = Math.min(estate.bequests, Math.max(0, allowedOptionalBequest));

 const realEstate = {
 ...estate,
 debts: estate.debts + wwAmount,
 bequests: actualOptionalBequest
 };

 const realResult = calculateFaraidBase(realEstate, heirs);

 if (wwShares.length > 0) {
 realResult.shares = realResult.shares.filter(s => s.heirType !=='SON_OF_SON' && s.heirType !=='DAUGHTER_OF_SON');
 realResult.shares.unshift(...wwShares);
 realResult.totalDistributed = Math.round((realResult.totalDistributed + wwAmount) * 100) / 100;
 
 if (wwAmount > 0) {
 realResult.warnings.unshift(`تم اقتطاع الوصية الواجبة للأحفاد بقيمة ${Math.round(wwAmount)} جنيه قبل التقسيم الشرعي.`);
 }
 }

 const originalNetEstate = Math.max(0, estate.totalValue - estate.debts);
 for (const share of realResult.shares) {
 if (share.shareType !=='wasiyya_wajiba' && originalNetEstate > 0) {
 share.percentage = Math.round((share.totalAmount / originalNetEstate) * 10000) / 100;
 }
 }

 return realResult;
}
