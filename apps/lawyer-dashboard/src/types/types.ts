export * from'@mohamy/shared-types';

export type TInternalRegulation = {
 id: string;
 title: string;
 regulationNumber?: string | null;
 issuingAuthority?: string | null;
 summary?: string | null;
 content: string;
 isActive: boolean;
 createdAtUtc: string;
 updatedAtUtc?: string | null;
};

export type TInternalRegulationSummary = {
 id: string;
 title: string;
 regulationNumber?: string | null;
 issuingAuthority?: string | null;
 isActive: boolean;
};

export type TCreateInternalRegulationRequest = {
 title: string;
 regulationNumber?: string | null;
 issuingAuthority?: string | null;
 summary?: string | null;
 content: string;
};

export type TUpdateInternalRegulationRequest = TCreateInternalRegulationRequest & {
 isActive: boolean;
};
