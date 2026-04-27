import type { HeirCategory, HeirType } from'./inheritanceTypes';

export const HEIR_CATEGORIES: HeirCategory[] = [
 { type:'HUSBAND', arabicLabel:'زوج', gender:'male', maxCount: 1, defaultFraction: null, defaultFractionLabel: null },
 { type:'WIFE', arabicLabel:'زوجة', gender:'female', maxCount: 4, defaultFraction: null, defaultFractionLabel: null },
 { type:'SON', arabicLabel:'ابن', gender:'male', maxCount: null, defaultFraction: null, defaultFractionLabel: null },
 { type:'DAUGHTER', arabicLabel:'بنت', gender:'female', maxCount: null, defaultFraction: null, defaultFractionLabel: null },
 { type:'SON_OF_SON', arabicLabel:'ابن ابن', gender:'male', maxCount: null, defaultFraction: null, defaultFractionLabel: null },
 { type:'DAUGHTER_OF_SON', arabicLabel:'بنت ابن', gender:'female', maxCount: null, defaultFraction: null, defaultFractionLabel: null },
 { type:'FATHER', arabicLabel:'أب', gender:'male', maxCount: 1, defaultFraction: null, defaultFractionLabel: null },
 { type:'MOTHER', arabicLabel:'أم', gender:'female', maxCount: 1, defaultFraction: null, defaultFractionLabel: null },
 { type:'GRANDFATHER_PATERNAL', arabicLabel:'جد لأب', gender:'male', maxCount: 1, defaultFraction: null, defaultFractionLabel: null },
 { type:'GRANDMOTHER_PATERNAL', arabicLabel:'جدة لأب', gender:'female', maxCount: 1, defaultFraction: null, defaultFractionLabel: null },
 { type:'GRANDMOTHER_MATERNAL', arabicLabel:'جدة لأم', gender:'female', maxCount: 1, defaultFraction: null, defaultFractionLabel: null },
 { type:'FULL_BROTHER', arabicLabel:'أخ شقيق', gender:'male', maxCount: null, defaultFraction: null, defaultFractionLabel: null },
 { type:'FULL_SISTER', arabicLabel:'أخت شقيقة', gender:'female', maxCount: null, defaultFraction: null, defaultFractionLabel: null },
 { type:'PATERNAL_HALF_BROTHER', arabicLabel:'أخ لأب', gender:'male', maxCount: null, defaultFraction: null, defaultFractionLabel: null },
 { type:'PATERNAL_HALF_SISTER', arabicLabel:'أخت لأب', gender:'female', maxCount: null, defaultFraction: null, defaultFractionLabel: null },
 { type:'MATERNAL_HALF_BROTHER', arabicLabel:'أخ لأم', gender:'male', maxCount: null, defaultFraction: null, defaultFractionLabel: null },
 { type:'MATERNAL_HALF_SISTER', arabicLabel:'أخت لأم', gender:'female', maxCount: null, defaultFraction: null, defaultFractionLabel: null },
 { type:'UNCLE_PATERNAL', arabicLabel:'عم', gender:'male', maxCount: null, defaultFraction: null, defaultFractionLabel: null },
 { type:'NEPHEW_PATERNAL', arabicLabel:'ابن أخ', gender:'male', maxCount: null, defaultFraction: null, defaultFractionLabel: null },
];

export function getHeirLabel(type: HeirType): string {
 return HEIR_CATEGORIES.find(c => c.type === type)?.arabicLabel ?? type;
}

export const BLOCKING_RULES: Partial<Record<HeirType, HeirType[]>> = {
 SON: ['SON_OF_SON','DAUGHTER_OF_SON'],
 SON_OF_SON: ['DAUGHTER_OF_SON'],
 FATHER: ['GRANDFATHER_PATERNAL'],
 MOTHER: ['GRANDMOTHER_PATERNAL','GRANDMOTHER_MATERNAL'],
 FULL_BROTHER: ['PATERNAL_HALF_BROTHER','PATERNAL_HALF_SISTER'],
 FULL_SISTER: ['PATERNAL_HALF_SISTER'],
 PATERNAL_HALF_BROTHER: ['PATERNAL_HALF_SISTER'],
};

export const RESIDUARY_PRIORITY: HeirType[] = ['SON','SON_OF_SON','FATHER','GRANDFATHER_PATERNAL','FULL_BROTHER','FULL_SISTER','PATERNAL_HALF_BROTHER','PATERNAL_HALF_SISTER','UNCLE_PATERNAL','NEPHEW_PATERNAL',
];

export const RADD_ELIGIBLE: HeirType[] = ['HUSBAND','WIFE','DAUGHTER','SON_OF_SON','DAUGHTER_OF_SON','FULL_SISTER','PATERNAL_HALF_SISTER','MOTHER','GRANDMOTHER_PATERNAL','GRANDMOTHER_MATERNAL',
];
