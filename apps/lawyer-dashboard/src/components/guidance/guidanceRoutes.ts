import type { GuidanceKey } from'./guidanceContent';

export type GuidanceRoute = {
 pattern: string;
 key: GuidanceKey;
};

export const guidanceRoutes: GuidanceRoute[] = [
 { pattern:'/', key:'home' },
 { pattern:'/cases', key:'cases' },
 { pattern:'/cases/:id/document-selection/defense-memo', key:'defenseMemo' },
 { pattern:'/cases/:id/document-selection/preparing-statement-of-claims', key:'statementOfClaims' },
 { pattern:'/cases/:id/document-selection/appeal-brief', key:'appealBrief' },
 { pattern:'/cases/:id/document-selection/admin-complaint', key:'adminComplaint' },
 { pattern:'/cases/:id/document-selection/ruling-analysis', key:'rulingAnalysis' },
 { pattern:'/cases/:id/document-selection/legal-warning', key:'legalWarning' },
 { pattern:'/cases/:id/document-selection/exec-request', key:'execRequest' },
 { pattern:'/cases/:id/document-selection', key:'documentSelection' },
 { pattern:'/cases/:id', key:'caseDetails' },
 { pattern:'/clients', key:'clients' },
 { pattern:'/clients/:id', key:'clientDetails' },
 { pattern:'/documents', key:'documents' },
 { pattern:'/legal-contracts/new', key:'newLegalContract' },
 { pattern:'/legal-contracts/:id', key:'legalContractDetails' },
 { pattern:'/legal-contracts', key:'legalContracts' },
 { pattern:'/legal-library/inheritance', key:'inheritance' },
 { pattern:'/legal-library/court-fees', key:'courtFees' },
 { pattern:'/legal-library/power-of-attorneys', key:'powerOfAttorneys' },
 { pattern:'/legal-library/internal-regulations', key:'internalRegulations' },
 { pattern:'/legal-library', key:'legalLibrary' },
 { pattern:'/process-server-papers', key:'processServerPapers' },
 { pattern:'/agenda/:id', key:'agendaDetails' },
 { pattern:'/agenda', key:'agenda' },
 { pattern:'/chat', key:'chat' },
 { pattern:'/settings', key:'settings' },
 { pattern:'/subscription', key:'subscription' },
];
