export const HeirType = {
 HUSBAND:'HUSBAND',
 WIFE:'WIFE',
 SON:'SON',
 DAUGHTER:'DAUGHTER',
 SON_OF_SON:'SON_OF_SON',
 DAUGHTER_OF_SON:'DAUGHTER_OF_SON',
 FATHER:'FATHER',
 MOTHER:'MOTHER',
 GRANDFATHER_PATERNAL:'GRANDFATHER_PATERNAL',
 GRANDMOTHER_PATERNAL:'GRANDMOTHER_PATERNAL',
 GRANDMOTHER_MATERNAL:'GRANDMOTHER_MATERNAL',
 FULL_BROTHER:'FULL_BROTHER',
 FULL_SISTER:'FULL_SISTER',
 PATERNAL_HALF_BROTHER:'PATERNAL_HALF_BROTHER',
 PATERNAL_HALF_SISTER:'PATERNAL_HALF_SISTER',
 MATERNAL_HALF_BROTHER:'MATERNAL_HALF_BROTHER',
 MATERNAL_HALF_SISTER:'MATERNAL_HALF_SISTER',
 UNCLE_PATERNAL:'UNCLE_PATERNAL',
 NEPHEW_PATERNAL:'NEPHEW_PATERNAL',
} as const;

export type HeirType = (typeof HeirType)[keyof typeof HeirType];

export interface HeirInput {
 type: HeirType;
 count: number;
}

export interface EstateInput {
 totalValue: number;
 debts: number;
 bequests: number;
}

export interface HeirShare {
 heirType: HeirType;
 count: number;
 shareType:'fard' |'fard_radd' |"ta'sib" |'radd' |'wasiyya_wajiba';
 fraction: string | null;
 totalAmount: number;
 perPersonAmount: number;
 percentage: number;
 legalBasis: string;
}

export interface InheritanceResult {
 shares: HeirShare[];
 totalDistributed: number;
 remainingEstate: number;
 isOversubscribed: boolean;
 awlRate: number | null;
 warnings: string[];
}

export interface HeirCategory {
 type: HeirType;
 arabicLabel: string;
 gender:'male' |'female';
 maxCount: number | null;
 defaultFraction: number | null;
 defaultFractionLabel: string | null;
}
